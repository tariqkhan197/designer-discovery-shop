ALTER TABLE public.vendors ADD COLUMN commission_rate numeric NOT NULL DEFAULT 0.15;

CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  requested_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
GRANT SELECT ON public.payouts TO authenticated;
GRANT ALL ON public.payouts TO service_role;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller reads own payouts" ON public.payouts FOR SELECT TO authenticated USING (public.owns_vendor(vendor_id));
CREATE POLICY "admin reads payouts" ON public.payouts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.vendor_available_balance(_vendor_id uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select coalesce((select sum(oi.unit_price * oi.quantity * (1 - v.commission_rate))
    from order_items oi join vendors v on v.id = oi.vendor_id
    where oi.vendor_id = _vendor_id and oi.fulfillment_status = 'delivered'), 0)
  - coalesce((select sum(amount) from payouts where vendor_id = _vendor_id and status <> 'rejected'), 0)
$$;

CREATE OR REPLACE FUNCTION public.request_payout()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare _vid uuid; _bal numeric; _id uuid;
begin
  select id into _vid from vendors where owner_id = auth.uid();
  if _vid is null then raise exception 'No shop found'; end if;
  if exists (select 1 from payouts where vendor_id = _vid and status = 'requested') then
    raise exception 'You already have a payout being processed'; end if;
  _bal := round(vendor_available_balance(_vid), 2);
  if _bal < 50 then raise exception 'Minimum payout is $50'; end if;
  insert into payouts (vendor_id, amount) values (_vid, _bal) returning id into _id;
  return _id;
end; $$;
REVOKE EXECUTE ON FUNCTION public.vendor_available_balance(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.request_payout() TO authenticated;