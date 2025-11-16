# SPU Activity Hub - Backend Setup

## 📋 สิ่งที่ต้องติดตั้ง

### 1. ติดตั้ง Node.js
- ดาวน์โหลดจาก: https://nodejs.org/
- ติดตั้ง Node.js (แนะนำ version 18 ขึ้นไป)

### 2. ติดตั้ง MongoDB

#### ตัวเลือกที่ 1: MongoDB Atlas (Cloud - ฟรี)
1. ไปที่ https://www.mongodb.com/cloud/atlas
2. สร้างบัญชี (ฟรี)
3. สร้าง Cluster (เลือก Free tier)
4. สร้าง Database User
5. ตั้งค่า Network Access (เพิ่ม IP 0.0.0.0/0 สำหรับทดสอบ)
6. Copy Connection String

#### ตัวเลือกที่ 2: MongoDB Local
1. ดาวน์โหลดจาก: https://www.mongodb.com/try/download/community
2. ติดตั้ง MongoDB
3. เริ่มต้น MongoDB service

## 🚀 วิธีติดตั้งและรัน

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` จาก `.env.example`:
```bash
copy .env.example .env
```

แก้ไข `.env`:
```
MONGODB_URI=mongodb://localhost:27017/spu-activity-hub
# หรือใช้ MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
PORT=3000
```

### 3. รัน Server
```bash
# รันแบบปกติ
npm start

# รันแบบ development (auto-reload)
npm run dev
```

Server จะรันที่: http://localhost:3000

## 📡 API Endpoints

### Activities
- `GET /api/activities` - ดึงกิจกรรมทั้งหมด
- `GET /api/activities/archived` - ดึงกิจกรรมที่เก็บไว้
- `GET /api/activities/:title` - ดึงกิจกรรมเดียว
- `POST /api/activities` - สร้างกิจกรรมใหม่
- `PUT /api/activities/:title` - แก้ไขกิจกรรม
- `DELETE /api/activities/:title` - ลบกิจกรรม
- `POST /api/activities/:title/archive` - เก็บกิจกรรม
- `POST /api/activities/:title/restore` - คืนกิจกรรม

### Participants
- `GET /api/participants/:activityTitle` - ดึงผู้เข้าร่วม
- `POST /api/participants` - เพิ่มผู้เข้าร่วม
- `DELETE /api/participants/:activityTitle/:studentId` - ลบผู้เข้าร่วม

### Hour Requests
- `GET /api/hour-requests/:activityTitle` - ดึงคำขอชั่วโมง
- `GET /api/hour-requests/student/:studentId` - ดึงคำขอของนักศึกษา
- `POST /api/hour-requests` - สร้างคำขอชั่วโมง
- `POST /api/hour-requests/:id/approve` - อนุมัติคำขอ
- `POST /api/hour-requests/:id/reject` - ไม่อนุมัติคำขอ

### Students
- `GET /api/students/:studentId` - ดึงข้อมูลนักศึกษา
- `POST /api/students` - สร้าง/อัปเดตข้อมูลนักศึกษา

## 🔧 การแก้ไข Frontend

ต้องแก้ไขไฟล์ JavaScript ให้เรียก API แทน localStorage:

1. **admin/main/script.js** - เปลี่ยนจาก localStorage เป็น fetch API
2. **js/dashboard.js** - เปลี่ยนจาก localStorage เป็น fetch API
3. **js/activity.js** - เปลี่ยนจาก localStorage เป็น fetch API

## 📝 ตัวอย่างการใช้งาน API

```javascript
// ดึงกิจกรรมทั้งหมด
fetch('http://localhost:3000/api/activities')
  .then(res => res.json())
  .then(data => console.log(data));

// สร้างกิจกรรมใหม่
fetch('http://localhost:3000/api/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'กิจกรรมตัวอย่าง',
    desc: 'คำอธิบาย',
    hours: 4,
    slots: 10
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

