-- My Model Shop: RLS
grant select on table public.products to anon;
grant select, insert, update, delete on table public.products to authenticated;
alter table public.products enable row level security;

drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Admin can view all products" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Admin can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Admin can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;
drop policy if exists "Admin can delete products" on public.products;

create policy "Public can view active products" on public.products for select to anon using (active = true);
create policy "Admin can view all products" on public.products for select to authenticated using ((select auth.jwt()->>'email') = 'mymodelshop@gmail.com');
create policy "Admin can insert products" on public.products for insert to authenticated with check ((select auth.jwt()->>'email') = 'mymodelshop@gmail.com');
create policy "Admin can update products" on public.products for update to authenticated using ((select auth.jwt()->>'email') = 'mymodelshop@gmail.com') with check ((select auth.jwt()->>'email') = 'mymodelshop@gmail.com');
create policy "Admin can delete products" on public.products for delete to authenticated using ((select auth.jwt()->>'email') = 'mymodelshop@gmail.com');

insert into storage.buckets (id,name,public) values ('product-images','product-images',true) on conflict (id) do update set public=true;

drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Admin can upload product images" on storage.objects;
drop policy if exists "Admin can update product images" on storage.objects;
drop policy if exists "Admin can delete product images" on storage.objects;

create policy "Public can view product images" on storage.objects for select using (bucket_id='product-images');
create policy "Admin can upload product images" on storage.objects for insert to authenticated with check (bucket_id='product-images' and (select auth.jwt()->>'email')='mymodelshop@gmail.com');
create policy "Admin can update product images" on storage.objects for update to authenticated using (bucket_id='product-images' and (select auth.jwt()->>'email')='mymodelshop@gmail.com') with check (bucket_id='product-images' and (select auth.jwt()->>'email')='mymodelshop@gmail.com');
create policy "Admin can delete product images" on storage.objects for delete to authenticated using (bucket_id='product-images' and (select auth.jwt()->>'email')='mymodelshop@gmail.com');


-- Visitor counter: counts unique anonymous browsers/devices (not real-world identities).
create table if not exists public.site_visitors (
  visitor_id text primary key,
  first_seen timestamptz not null default now()
);
alter table public.site_visitors enable row level security;

revoke all on table public.site_visitors from anon, authenticated;
grant select, insert on table public.site_visitors to anon;

create or replace function public.register_site_visitor(p_visitor_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare total bigint;
begin
  if p_visitor_id is null or length(p_visitor_id) < 10 or length(p_visitor_id) > 100 then
    raise exception 'invalid visitor id';
  end if;
  insert into public.site_visitors(visitor_id)
  values (p_visitor_id)
  on conflict (visitor_id) do nothing;
  select count(*) into total from public.site_visitors;
  return total;
end;
$$;

revoke all on function public.register_site_visitor(text) from public;
grant execute on function public.register_site_visitor(text) to anon, authenticated;
