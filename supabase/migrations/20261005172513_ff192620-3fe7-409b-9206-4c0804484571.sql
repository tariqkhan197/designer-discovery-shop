create type public.app_role as enum ('admin','vendor','customer');

create table public.profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  name text not null,
  slug text not null unique,
  story text,
  country text,
  created_at timestamptz not null default now()
);
grant select on public.vendors to anon, authenticated;
grant all on public.vendors to service_role;
alter table public.vendors enable row level security;
create policy "vendors public" on public.vendors for select to anon, authenticated using (true);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public" on public.categories for select to anon, authenticated using (true);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null,
  compare_at_price numeric(10,2),
  sizes text[] not null default '{}',
  stock int not null default 0,
  image_key text not null,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "active products public" on public.products for select to anon, authenticated using (is_active);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, delete on public.wishlist_items to authenticated;
grant all on public.wishlist_items to service_role;
alter table public.wishlist_items enable row level security;
create policy "own wishlist" on public.wishlist_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null default '',
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);
grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;
create policy "own cart" on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'placed',
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  ship_name text not null,
  ship_address text not null,
  ship_city text not null,
  ship_country text not null,
  ship_postal text not null,
  created_at timestamptz not null default now()
);
grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select to authenticated using (auth.uid() = user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  product_name text not null,
  image_key text not null,
  size text not null default '',
  quantity int not null,
  unit_price numeric(10,2) not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "own order items read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Checkout: server-side pricing from cart, atomic stock decrement
create or replace function public.place_order(_name text, _address text, _city text, _country text, _postal text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare _uid uuid := auth.uid(); _sub numeric := 0; _ship numeric; _oid uuid; r record;
begin
  if _uid is null then raise exception 'Not signed in'; end if;
  if coalesce(trim(_name),'')='' or coalesce(trim(_address),'')='' or coalesce(trim(_city),'')='' or coalesce(trim(_country),'')='' or coalesce(trim(_postal),'')='' then
    raise exception 'Shipping details incomplete'; end if;
  for r in select c.quantity, p.price, p.stock, p.name from cart_items c join products p on p.id=c.product_id where c.user_id=_uid and p.is_active loop
    if r.stock < r.quantity then raise exception 'Not enough stock for %', r.name; end if;
    _sub := _sub + r.price * r.quantity;
  end loop;
  if _sub = 0 then raise exception 'Your bag is empty'; end if;
  _ship := case when _sub >= 500 then 0 else 25 end;
  insert into orders (user_id, subtotal, shipping, total, ship_name, ship_address, ship_city, ship_country, ship_postal)
  values (_uid, _sub, _ship, _sub + _ship, _name, _address, _city, _country, _postal) returning id into _oid;
  insert into order_items (order_id, product_id, vendor_id, product_name, image_key, size, quantity, unit_price)
  select _oid, p.id, p.vendor_id, p.name, p.image_key, c.size, c.quantity, p.price
  from cart_items c join products p on p.id=c.product_id where c.user_id=_uid and p.is_active;
  update products p set stock = p.stock - c.quantity from cart_items c where c.product_id=p.id and c.user_id=_uid;
  delete from cart_items where user_id=_uid;
  return _oid;
end; $$;
revoke execute on function public.place_order(text,text,text,text,text) from public, anon;
grant execute on function public.place_order(text,text,text,text,text) to authenticated;

-- Seed
insert into public.categories (name, slug, sort_order) values
('Ready-to-Wear','ready-to-wear',1),('Bags','bags',2),('Shoes','shoes',3),('Accessories','accessories',4);

insert into public.vendors (name, slug, story, country) values
('Maison Verlaine','maison-verlaine','Parisian tailoring house cutting softly structured silhouettes since 1987.','France'),
('Atelier Oro','atelier-oro','Florentine leather workshop, hand-stitched and vegetable-tanned.','Italy'),
('Nord Studio','nord-studio','Copenhagen label crafting quiet essentials in natural fibres.','Denmark'),
('Kaien','kaien','Kyoto jewellery studio working in recycled gold and silver.','Japan');

insert into public.products (vendor_id, category_id, name, slug, description, price, compare_at_price, sizes, stock, image_key, is_featured)
select v.id, c.id, x.name, x.slug, x.descr, x.price, x.cap, x.sizes, x.stock, x.img, x.feat
from (values
 ('maison-verlaine','ready-to-wear','Camel Wool Overcoat','camel-wool-overcoat','Double-faced virgin wool, dropped shoulder, hand-finished lapels.',1450.00,null::numeric,array['XS','S','M','L','XL'],12,'coat',true),
 ('maison-verlaine','ready-to-wear','Ivory Silk Blouse','ivory-silk-blouse','Fluid sandwashed silk with a softly gathered collar.',590.00,690.00,array['XS','S','M','L'],20,'blouse',true),
 ('atelier-oro','bags','Cognac Leather Tote','cognac-leather-tote','Vegetable-tanned calfskin, unlined, ages to a rich patina.',980.00,null,array[]::text[],8,'tote',true),
 ('atelier-oro','shoes','Black Leather Loafer','black-leather-loafer','Blake-stitched penny loafer on a leather sole.',640.00,null,array['38','39','40','41','42','43','44'],15,'loafer',true),
 ('nord-studio','ready-to-wear','Oat Cashmere Knit','oat-cashmere-knit','Mongolian cashmere, relaxed crewneck, ribbed edges.',420.00,null,array['XS','S','M','L','XL'],25,'knit',false),
 ('nord-studio','ready-to-wear','Charcoal Wide Trouser','charcoal-wide-trouser','High-waisted wool flannel trouser with pressed pleats.',380.00,450.00,array['34','36','38','40','42'],18,'trouser',false),
 ('kaien','accessories','Gold Sculpted Hoops','gold-sculpted-hoops','Recycled 18k gold vermeil, hand-sculpted organic form.',310.00,null,array[]::text[],30,'hoops',true),
 ('atelier-oro','accessories','Tortoise Acetate Sunglasses','tortoise-sunglasses','Italian acetate frame, polarised mineral lenses.',290.00,null,array[]::text[],22,'sunglasses',false)
) as x(vendor, cat, name, slug, descr, price, cap, sizes, stock, img, feat)
join public.vendors v on v.slug = x.vendor
join public.categories c on c.slug = x.cat;