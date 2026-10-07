alter table public.order_items add column fulfillment_status text not null default 'pending'
  check (fulfillment_status in ('pending','shipped','delivered','cancelled'));
create unique index vendors_owner_unique on public.vendors(owner_id) where owner_id is not null;

create or replace function public.owns_vendor(_vendor_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from vendors where id = _vendor_id and owner_id = auth.uid()) $$;

create or replace function public.vendor_in_order(_order_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from order_items oi join vendors v on v.id = oi.vendor_id where oi.order_id = _order_id and v.owner_id = auth.uid()) $$;

revoke execute on function public.owns_vendor(uuid) from public, anon;
revoke execute on function public.vendor_in_order(uuid) from public, anon;
grant execute on function public.owns_vendor(uuid) to authenticated;
grant execute on function public.vendor_in_order(uuid) to authenticated;

create or replace function public.become_vendor(_name text, _country text, _story text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare _uid uuid := auth.uid(); _id uuid; _slug text;
begin
  if _uid is null then raise exception 'Not signed in'; end if;
  if coalesce(trim(_name),'') = '' or length(_name) > 80 then raise exception 'Please enter a shop name'; end if;
  select id into _id from vendors where owner_id = _uid;
  if _id is not null then return _id; end if;
  _slug := trim(both '-' from regexp_replace(lower(_name), '[^a-z0-9]+', '-', 'g'));
  if exists (select 1 from vendors where slug = _slug) then _slug := _slug || '-' || substr(md5(random()::text),1,4); end if;
  insert into vendors (owner_id, name, slug, country, story) values (_uid, trim(_name), _slug, left(_country,80), left(_story,1000)) returning id into _id;
  insert into user_roles (user_id, role) values (_uid, 'vendor') on conflict do nothing;
  return _id;
end; $$;
revoke execute on function public.become_vendor(text,text,text) from public, anon;
grant execute on function public.become_vendor(text,text,text) to authenticated;

grant update on public.vendors to authenticated;
create policy "owner updates vendor" on public.vendors for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

grant insert, update, delete on public.products to authenticated;
create policy "seller reads own products" on public.products for select to authenticated using (public.owns_vendor(vendor_id));
create policy "seller inserts products" on public.products for insert to authenticated with check (public.owns_vendor(vendor_id));
create policy "seller updates products" on public.products for update to authenticated using (public.owns_vendor(vendor_id)) with check (public.owns_vendor(vendor_id));
create policy "seller deletes products" on public.products for delete to authenticated using (public.owns_vendor(vendor_id));

grant update (fulfillment_status) on public.order_items to authenticated;
create policy "seller reads own order items" on public.order_items for select to authenticated using (public.owns_vendor(vendor_id));
create policy "seller updates own order items" on public.order_items for update to authenticated using (public.owns_vendor(vendor_id)) with check (public.owns_vendor(vendor_id));
create policy "seller reads orders with their items" on public.orders for select to authenticated using (public.vendor_in_order(id));

create policy "product images public read" on storage.objects for select using (bucket_id = 'product-images');
create policy "sellers upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "sellers delete own product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);