# My Model Shop — Final Login Fix
admin.html รุ่นนี้ฝัง config และ app.js ไว้ในหน้า Admin โดยตรง จึงไม่พึ่งการโหลด app.js แยกสำหรับหน้า Login
Admin: mymodelshop@gmail.com
รัน schema.sql ใน Supabase SQL Editor ก่อนใช้งาน
ห้ามใส่รหัสผ่านในไฟล์

## Visitor counter
รัน schema.sql ใหม่อีกครั้งเพื่อสร้าง `site_visitors` และฟังก์ชันนับผู้เข้าชมโดยประมาณ ระบบนับ 1 ครั้งต่อเบราว์เซอร์/อุปกรณ์ ไม่ใช่การระบุตัวบุคคลจริง
