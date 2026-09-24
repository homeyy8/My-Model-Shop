# My Model Shop — Online Free Setup

ชุดนี้เปลี่ยนจาก localStorage เป็น Supabase เพื่อให้สินค้าถูกเก็บออนไลน์และทุกอุปกรณ์เห็นข้อมูลชุดเดียวกัน

## 1) สร้าง Supabase
1. เข้า https://supabase.com/ แล้วสร้าง Project แบบ Free
2. เปิด SQL Editor
3. เปิดไฟล์ `schema.sql` แล้วรันทั้งหมด
4. ไปที่ Authentication > Users แล้วสร้างบัญชีผู้ดูแล 1 บัญชี หรือใช้ปุ่มสมัครบัญชีในหน้า admin
5. ไปที่ Project Settings > API แล้วคัดลอก Project URL และ Publishable/Anon key
6. เปิด `config.js` แล้วแทนที่ `YOUR_SUPABASE_URL` และ `YOUR_SUPABASE_ANON_KEY`

> ห้ามนำ `service_role` key มาใส่ในเว็บเด็ดขาด

## 2) ทดสอบบนเครื่อง
เปิดเว็บด้วย local server เช่น VS Code Live Server หรือ Python HTTP server

## 3) เอาขึ้น Cloudflare Pages
- สร้าง GitHub repository ใหม่
- อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้
- เชื่อม repository กับ Cloudflare Pages
- ตั้ง Build command เป็น `exit 0`
- Build output directory เป็น `/` หรือโฟลเดอร์ root ที่มี `index.html`
- หลัง deploy จะได้โดเมน `*.pages.dev`

## 4) ย้ายข้อมูลเดิม
ถ้าข้อมูลสินค้าเดิมยังอยู่ใน browser เดิม ให้เปิด `admin.html` หลังตั้งค่า Supabase แล้วกด `นำเข้าข้อมูลเดิม` ระบบจะอ่าน `my_model_shop_products_v1` จากเครื่องนั้นและอัปโหลดสินค้า/รูปขึ้นฐานข้อมูลออนไลน์

## หมายเหตุ
- Free Supabase มีฐานข้อมูล 500 MB และ Storage 1 GB ต่อโปรเจกต์ตามโควต้าปัจจุบัน
- รูปสินค้าควรใช้ JPG/WebP ขนาดไม่ใหญ่เกินจำเป็น
- Cloudflare Pages ใช้ static HTML ได้ และมีโดเมน `*.pages.dev` ให้หลัง deploy
