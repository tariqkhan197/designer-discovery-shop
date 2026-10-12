CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT 'Verified buyer',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
CREATE INDEX reviews_product_idx ON public.reviews(product_id);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "own review delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_purchased(_product_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from order_items oi join orders o on o.id = oi.order_id
    where oi.product_id = _product_id and o.user_id = auth.uid() and oi.fulfillment_status <> 'cancelled')
$$;

CREATE OR REPLACE FUNCTION public.submit_review(_product_id uuid, _rating int, _title text, _body text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare _uid uuid := auth.uid(); _id uuid; _name text;
begin
  if _uid is null then raise exception 'Not signed in'; end if;
  if _rating is null or _rating < 1 or _rating > 5 then raise exception 'Please choose a rating from 1 to 5'; end if;
  if not has_purchased(_product_id) then raise exception 'Only shoppers who bought this piece can review it'; end if;
  select coalesce(nullif(trim(display_name),''), 'Verified buyer') into _name from profiles where id = _uid;
  insert into reviews (product_id, user_id, author_name, rating, title, body)
  values (_product_id, _uid, left(coalesce(_name,'Verified buyer'),60), _rating, left(trim(coalesce(_title,'')),120), left(trim(coalesce(_body,'')),2000))
  on conflict (product_id, user_id) do update set rating = excluded.rating, title = excluded.title, body = excluded.body, updated_at = now()
  returning id into _id;
  return _id;
end; $$;

REVOKE EXECUTE ON FUNCTION public.has_purchased(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.submit_review(uuid,int,text,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_purchased(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_review(uuid,int,text,text) TO authenticated;