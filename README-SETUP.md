# My Model Shop — Login Fixed

ชุดนี้แก้ปัญหาหน้า Admin กดเข้าสู่ระบบแล้วไม่มีอะไรเกิดขึ้น โดยเพิ่มการตรวจสอบ Supabase และแสดงข้อผิดพลาดให้เห็นชัดเจน พร้อม fallback CDN และตัดการสมัคร Admin จากหน้าเว็บ

## ไฟล์
- `index.html` หน้าร้าน
- `admin.html` หน้า Admin
- `app.js` ระบบสินค้า + Login + อัปโหลดหลายรูป
- `style.css` รูปแบบเว็บ
- `config.js` URL และ Publishable key ของ Supabase
- `schema.sql` RLS สำหรับ Admin `mymodelshop@gmail.com`

## สำคัญ
1. ใน Supabase > Authentication > Users ต้องมีผู้ใช้ `mymodelshop@gmail.com` อยู่แล้ว
2. ใช้รหัสผ่านที่ตั้งไว้กับบัญชีนี้เท่านั้น
3. รัน `schema.sql` ใน Supabase SQL Editor เพื่อใช้ RLS ชุดนี้
4. ห้ามใส่รหัสผ่านลงในไฟล์หรือ GitHub
5. `config.js` ใช้ Publishable key เท่านั้น ห้ามใช้ `service_role` หรือ `sb_secret_...`

## ทดสอบ
วางไฟล์ทั้งหมดไว้ในโฟลเดอร์เดียวกัน แล้วเปิดผ่าน local server หรือ deploy ไป Cloudflare Pages
