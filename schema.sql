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
