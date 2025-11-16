# วิธีรันเว็บ SPU Activity Hub

## ขั้นตอนการติดตั้งและรัน

### 1. ติดตั้ง Dependencies

เปิด Terminal/Command Prompt ในโฟลเดอร์โปรเจค แล้วรัน:

```bash
npm install
```

### 2. ตั้งค่า MongoDB Connection

สร้างไฟล์ `.env` ในโฟลเดอร์โปรเจค (คัดลอกจาก `.env.example`):

**สำหรับ MongoDB Local:**
```env
MONGODB_URI=mongodb://localhost:27017/spu-activity-hub
PORT=3000
```

**สำหรับ MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spu-activity-hub?retryWrites=true&w=majority
PORT=3000
```

### 3. ตรวจสอบว่า MongoDB ทำงานอยู่

**สำหรับ MongoDB Local:**
- ตรวจสอบว่า MongoDB service ทำงานอยู่
- Windows: เปิด Services และตรวจสอบว่า MongoDB service ทำงาน
- หรือรัน `mongod` ใน terminal

**สำหรับ MongoDB Atlas:**
- ตรวจสอบว่า connection string ถูกต้อง
- ตรวจสอบว่า IP address ของคุณถูก whitelist ใน Atlas

### 4. สร้างข้อมูลผู้ใช้ตัวอย่าง (Optional)

รันสคริปต์เพื่อสร้างข้อมูลผู้ใช้ตัวอย่าง:

```bash
node create-sample-students.js
```

ข้อมูลผู้ใช้ตัวอย่าง:
- `student1` / `123456`
- `student2` / `123456`
- `student3` / `123456`
- `student4` / `123456`
- `student5` / `123456`
- `admin` / `admin`

### 5. รัน Server

**แบบปกติ:**
```bash
npm start
```

**แบบ Development (Auto-reload):**
```bash
npm run dev
```

### 6. เปิดเว็บเบราว์เซอร์

เปิดเบราว์เซอร์และไปที่:
```
http://localhost:3000
```

## การใช้งาน

1. **Login:**
   - ใช้ username และ password ที่สร้างไว้
   - หรือใช้ข้อมูลจาก `create-sample-students.js`

2. **Student Dashboard:**
   - ดูกิจกรรมทั้งหมด
   - Join กิจกรรม
   - ดู progress ของชั่วโมงกิจกรรม

3. **Admin Panel:**
   - Login ด้วย `admin` / `admin`
   - จัดการกิจกรรม
   - อนุมัติชั่วโมงกิจกรรม

## Troubleshooting

### MongoDB Connection Error
- ตรวจสอบว่า MongoDB ทำงานอยู่
- ตรวจสอบ connection string ใน `.env`
- ตรวจสอบ network/firewall settings

### Port Already in Use
- เปลี่ยน PORT ใน `.env` เป็นค่าอื่น (เช่น 3001)
- หรือปิดโปรแกรมที่ใช้ port 3000 อยู่

### Module Not Found
- รัน `npm install` อีกครั้ง
- ลบ `node_modules` และ `package-lock.json` แล้วรัน `npm install` ใหม่

## ไฟล์สำคัญ

- `server.js` - Express server และ API endpoints
- `package.json` - Dependencies และ scripts
- `.env` - Environment variables (MongoDB URI, PORT)
- `create-sample-students.js` - Script สำหรับสร้างข้อมูลผู้ใช้ตัวอย่าง

