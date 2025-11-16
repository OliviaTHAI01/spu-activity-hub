# คู่มือ Deploy บน Render (Step-by-Step)

## ขั้นตอนที่ 1: เตรียม MongoDB Atlas

### 1.1 สร้าง MongoDB Atlas Account
1. ไปที่ [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. คลิก "Try Free" หรือ "Sign Up"
3. สร้าง Account (ใช้ Google/GitHub login ได้)

### 1.2 สร้าง Cluster
1. หลัง login → คลิก "Build a Database"
2. เลือก **FREE (M0)** → "Create"
3. เลือก **Cloud Provider & Region:**
   - เลือก AWS หรือ Google Cloud
   - เลือก Region ที่ใกล้ไทย (เช่น Singapore - ap-southeast-1)
4. คลิก "Create Cluster" (รอ 1-3 นาที)

### 1.3 ตั้งค่า Database Access
1. ไปที่ "Database Access" (เมนูซ้าย)
2. คลิก "Add New Database User"
3. เลือก "Password" authentication
4. ตั้งค่า:
   - **Username:** `spu-admin` (หรือชื่ออื่น)
   - **Password:** สร้าง password ที่แข็งแรง (บันทึกไว้!)
5. Database User Privileges: เลือก "Atlas admin" หรือ "Read and write to any database"
6. คลิก "Add User"

### 1.4 ตั้งค่า Network Access
1. ไปที่ "Network Access" (เมนูซ้าย)
2. คลิก "Add IP Address"
3. เลือก "Allow Access from Anywhere" (0.0.0.0/0)
   - หรือเพิ่ม IP ของ Render (แต่ 0.0.0.0/0 ง่ายกว่า)
4. คลิก "Confirm"

### 1.5 Copy Connection String
1. ไปที่ "Database" → "Connect"
2. เลือก "Connect your application"
3. เลือก Driver: **Node.js** และ Version: **5.5 or later**
4. Copy Connection String (จะได้ประมาณ):
   ```
   mongodb+srv://spu-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **แก้ไข Connection String:**
   - แทนที่ `<password>` ด้วย password ที่สร้างไว้
   - แทนที่ `?retryWrites=true&w=majority` ด้วย `/spu-activity-hub?retryWrites=true&w=majority`
   - ตัวอย่างผลลัพธ์:
   ```
   mongodb+srv://spu-admin:yourpassword123@cluster0.xxxxx.mongodb.net/spu-activity-hub?retryWrites=true&w=majority
   ```
6. **บันทึก Connection String นี้ไว้!** (จะใช้ใน Render)

---

## ขั้นตอนที่ 2: Deploy บน Render

### 2.1 สร้าง Account Render
1. ไปที่ [render.com](https://render.com)
2. คลิก "Get Started for Free"
3. เลือก "Sign up with GitHub" (แนะนำ)
4. Authorize Render ให้เข้าถึง GitHub

### 2.2 สร้าง Web Service
1. หลัง login → คลิก "New +" (มุมบนขวา)
2. เลือก **"Web Service"**

### 2.3 เชื่อมต่อ GitHub Repository
1. ในหน้า "Create a new Web Service"
2. **Connect GitHub account** (ถ้ายังไม่ได้เชื่อม)
3. **Search หรือเลือก repository** ของคุณ (เช่น "OliviaTHAI01/Finalproject")
4. คลิก repository ที่ต้องการ

### 2.4 ตั้งค่า Web Service

**Basic Settings:**
- **Name:** `spu-activity-hub` (หรือชื่ออื่น)
- **Region:** เลือก **Singapore** (ใกล้ไทย)
- **Branch:** `main` หรือ `master` (ตาม repo ของคุณ)
- **Root Directory:** `.` (เว้นว่างไว้ หรือใส่ `.`)

**Build & Deploy:**
- **Environment:** เลือก **Node**
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

**Advanced Settings:**
1. คลิก "Advanced"
2. คลิก "Add Environment Variable"
3. เพิ่ม Environment Variables:

   **Variable 1:**
   - **Key:** `MONGODB_URI`
   - **Value:** (paste connection string จาก MongoDB Atlas ที่แก้ไขแล้ว)
   - คลิก "Save"

   **Variable 2:**
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - คลิก "Save"

   **Variable 3 (Optional):**
   - **Key:** `PORT`
   - **Value:** `10000` (Render ใช้ port นี้)
   - คลิก "Save"

### 2.5 Deploy
1. ตรวจสอบการตั้งค่าทั้งหมด
2. คลิก **"Create Web Service"**
3. Render จะเริ่ม build และ deploy (ใช้เวลาประมาณ 2-5 นาที)
4. รอให้ build เสร็จ (ดู progress ในหน้า dashboard)

---

## ขั้นตอนที่ 3: ตรวจสอบและทดสอบ

### 3.1 ตรวจสอบ Deploy Status
1. ในหน้า Render Dashboard → ดู Web Service ที่สร้าง
2. ตรวจสอบว่า Status เป็น **"Live"** (สีเขียว)
3. คลิกที่ Web Service → ดู "Logs" tab
4. ตรวจสอบว่าไม่มี error (ควรเห็น "✅ Connected to MongoDB")

### 3.2 ทดสอบเว็บ
1. คลิกที่ URL ที่ Render ให้ (เช่น: `https://spu-activity-hub.onrender.com`)
2. เปิดเว็บในเบราว์เซอร์
3. ทดสอบ:
   - หน้า Login เปิดได้หรือไม่
   - Login ด้วย username/password
   - Dashboard แสดงข้อมูลได้หรือไม่
   - Join Activity ทำงานหรือไม่

### 3.3 สร้างข้อมูลผู้ใช้ตัวอย่าง
1. เปิด Terminal/Command Prompt
2. รันคำสั่ง (แก้ไข MONGODB_URI ให้ตรงกับของคุณ):
```bash
MONGODB_URI="your_mongodb_connection_string" node create-sample-students.js
```

หรือใช้ MongoDB Compass หรือ MongoDB Atlas Web Interface เพื่อเพิ่มข้อมูลผู้ใช้

---

## ขั้นตอนที่ 4: ตั้งค่า Custom Domain (Optional)

### 4.1 เพิ่ม Custom Domain
1. ในหน้า Web Service → ไปที่ "Settings" tab
2. Scroll ลงไปที่ "Custom Domains"
3. คลิก "Add Custom Domain"
4. ใส่ domain name (เช่น: `activity.yourdomain.com`)
5. ตั้งค่า DNS records ตามที่ Render บอก

---

## Troubleshooting

### ❌ Build Failed
- ตรวจสอบว่า `package.json` มีอยู่
- ตรวจสอบว่า dependencies ถูกต้อง
- ดู Logs ใน Render dashboard

### ❌ MongoDB Connection Error
- ตรวจสอบว่า MongoDB Atlas Network Access ตั้งค่า `0.0.0.0/0`
- ตรวจสอบว่า Connection String ถูกต้อง
- ตรวจสอบว่า password ไม่มี special characters ที่ต้อง encode

### ❌ 404 Not Found
- ตรวจสอบว่า `server.js` มีอยู่
- ตรวจสอบว่า Start Command ถูกต้อง (`node server.js`)

### ❌ API ไม่ทำงาน
- ตรวจสอบว่า API URLs ใช้ `window.location.origin` (ไม่ใช่ localhost)
- ตรวจสอบ CORS settings ใน `server.js`

---

## ข้อมูลสำคัญ

**Render Free Tier:**
- ✅ ฟรี
- ⚠️ จำกัด bandwidth
- ⚠️ Service จะ sleep ถ้าไม่มีการใช้งาน (wake up ช้า ~30 วินาที)
- ⚠️ จำกัด build time

**MongoDB Atlas Free Tier:**
- ✅ ฟรี 512MB storage
- ✅ 512MB RAM
- ✅ Shared cluster

---

## คำแนะนำเพิ่มเติม

1. **Auto-Deploy:**
   - Render จะ auto-deploy เมื่อคุณ push code ไป GitHub
   - ไปที่ Settings → Auto-Deploy → เปิดใช้งาน

2. **Environment Variables:**
   - อย่า commit `.env` ไป GitHub
   - ตั้งค่า Environment Variables ใน Render แทน

3. **Monitoring:**
   - ใช้ Render Dashboard ดู logs
   - ตั้งค่า alerts (ถ้าต้องการ)

4. **Backup:**
   - MongoDB Atlas มี auto-backup (ใน paid tier)
   - หรือ export data เองเป็นประจำ

---

## สรุป Checklist

- [ ] สร้าง MongoDB Atlas account
- [ ] สร้าง Cluster (M0 Free)
- [ ] ตั้งค่า Database User
- [ ] ตั้งค่า Network Access (0.0.0.0/0)
- [ ] Copy และแก้ไข Connection String
- [ ] สร้าง Render account
- [ ] เชื่อมต่อ GitHub repository
- [ ] ตั้งค่า Web Service
- [ ] เพิ่ม Environment Variables (MONGODB_URI, NODE_ENV)
- [ ] Deploy
- [ ] ทดสอบเว็บ
- [ ] สร้างข้อมูลผู้ใช้ตัวอย่าง

---

**พร้อมแล้ว! เริ่ม deploy ได้เลย** 🚀

