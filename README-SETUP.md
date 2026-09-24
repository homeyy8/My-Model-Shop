# My Model Shop — Final Login Fix
admin.html รุ่นนี้ฝัง config และ app.js ไว้ในหน้า Admin โดยตรง จึงไม่พึ่งการโหลด app.js แยกสำหรับหน้า Login
Admin: mymodelshop@gmail.com
รัน schema.sql ใน Supabase SQL Editor ก่อนใช้งาน
ห้ามใส่รหัสผ่านในไฟล์

## Visitor counter
รัน schema.sql ใหม่อีกครั้งเพื่อสร้าง `site_visitors` และฟังก์ชันนับผู้เข้าชมโดยประมาณ ระบบนับ 1 ครั้งต่อเบราว์เซอร์/อุปกรณ์ ไม่ใช่การระบุตัวบุคคลจริง


## ช่องทางติดต่อและตัวนับผู้เข้าชม
- ช่องทางติดต่ออยู่ด้านบนของหน้าเว็บในส่วน Hero
- Facebook: https://www.facebook.com/buffalo.man.3
- LINE ID: 51171754
- ตัวนับเป็นจำนวน visitor_id ที่ไม่ซ้ำกันจาก browser/device ที่เคยเข้าชมหลังติดตั้งระบบ จึงเป็นจำนวนโดยประมาณของผู้เข้าชม ไม่ใช่การระบุตัวตนบุคคลจริง
- ต้องรัน `schema.sql` ใน Supabase SQL Editor ก่อน จึงจะเริ่มนับและเก็บยอดรวมได้
