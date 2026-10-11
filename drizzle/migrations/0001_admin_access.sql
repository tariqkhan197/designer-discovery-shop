-- Admin oversight policies for the marketplace command center.

create policy "admin reads all orders"
on public.orders for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "admin reads all order items"
on public.order_items for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "admin reads all products"
on public.products for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "admin updates products"
on public.products for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "admin updates vendors"
on public.vendors for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "admin updates payouts"
on public.payouts for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "admin manages categories"
on public.categories for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "admin reads profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));