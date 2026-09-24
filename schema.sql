-- My Model Shop - Supabase setup
-- รันทั้งหมดนี้ใน Supabase Dashboard > SQL Editor

create table if not exists public.products (
  id text primary key,
  name text not null,
  cat text not null check (cat in ('toy-gun','animal')),
  price numeric(12,2) not null default 0,
  oldprice numeric(12,2) not null default 0,
  stock integer not null default 0,
  description text not null default '',
  images text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products for select
using (active = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Authenticated users can insert products"
on public.products for insert to authenticated
with check (true);

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
on public.products for update to authenticated
using (true) with check (true);

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products"
on public.products for delete to authenticated
using (true);

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Authenticated can upload product images" on storage.objects;
create policy "Authenticated can upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "Authenticated can update product images" on storage.objects;
create policy "Authenticated can update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

drop policy if exists "Authenticated can delete product images" on storage.objects;
create policy "Authenticated can delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images');

-- ตัวอย่างสินค้าเริ่มต้น (ใส่เฉพาะถ้ายังไม่มีสินค้า)
insert into public.products (id,name,cat,price,oldprice,stock,description,images,active)
values
('1','โมเดลช้างเอเชีย Collector','animal',890,990,5,'โมเดลช้างเอเชียสำหรับสะสม งานรายละเอียดสูง','{}',true),
('2','โมเดลจระเข้สมจริง 1/24','animal',590,0,8,'เหมาะสำหรับจัดฉากไดโอรามาและสะสม','{}',true),
('3','ปืนของเล่น Tactical Style','toy-gun',790,890,10,'ของเล่นสำหรับสะสมและเล่นตามอายุที่เหมาะสม','{}',true),
('4','ปืนของเล่น Mini Blaster','toy-gun',390,450,12,'ขนาดกะทัดรัด สีสันสวย เหมาะสำหรับของเล่น','{}',true)
on conflict (id) do nothing;
