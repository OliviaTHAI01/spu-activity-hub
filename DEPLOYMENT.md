# วิธี Deploy/Host เว็บ SPU Activity Hub

## ตัวเลือก Hosting Services

### 1. **Render** (แนะนำ - ฟรีสำหรับเริ่มต้น)

#### Deploy Backend (Node.js/Express)

1. **สร้าง Account ที่ [render.com](https://render.com)**

2. **สร้าง Web Service:**
   - คลิก "New +" → "Web Service"
   - เชื่อมต่อ GitHub repository ของคุณ
   - ตั้งค่า:
     - **Name:** spu-activity-hub
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Environment Variables:**
       ```
       MONGODB_URI=your_mongodb_connection_string
       PORT=10000
       NODE_ENV=production
       ```

3. **Deploy:**
   - Render จะ deploy อัตโนมัติเมื่อ push code ไป GitHub

#### Deploy MongoDB

**Option A: MongoDB Atlas (แนะนำ)**
1. ไปที่ [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. สร้าง Free Cluster
3. ตั้งค่า Network Access (Allow access from anywhere: 0.0.0.0/0)
4. สร้าง Database User
5. Copy Connection String
6. ใช้ Connection String ใน Environment Variables ของ Render

**Option B: MongoDB on Render**
- Render มี MongoDB service แต่ต้องเสียเงิน

### 2. **Vercel** (สำหรับ Frontend + Serverless Functions)

**ข้อจำกัด:** Vercel เป็น serverless อาจต้องปรับโค้ด

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **ตั้งค่า Environment Variables:**
```bash
vercel env add MONGODB_URI
vercel env add PORT
```

### 3. **Railway** (แนะนำ - ง่ายและฟรี)

1. **ไปที่ [railway.app](https://railway.app)**
2. **Login with GitHub**
3. **New Project → Deploy from GitHub repo**
4. **Add MongoDB:**
   - คลิก "New" → "Database" → "Add MongoDB"
   - Railway จะสร้าง MongoDB ให้อัตโนมัติ
5. **ตั้งค่า Environment Variables:**
   - Railway จะ auto-detect MongoDB connection
   - หรือตั้งค่า `MONGODB_URI` เอง

### 4. **Heroku** (ต้องใช้ Credit Card แต่มี Free Tier)

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login:**
```bash
heroku login
```

3. **Create App:**
```bash
heroku create spu-activity-hub
```

4. **Add MongoDB:**
```bash
heroku addons:create mongolab:sandbox
```

5. **Deploy:**
```bash
git push heroku main
```

6. **ตั้งค่า Environment Variables:**
```bash
heroku config:set MONGODB_URI=your_connection_string
```

### 5. **DigitalOcean App Platform**

1. **ไปที่ [digitalocean.com](https://www.digitalocean.com)**
2. **Create App → Connect GitHub**
3. **ตั้งค่า:**
   - Build Command: `npm install`
   - Run Command: `node server.js`
   - Environment Variables: ตั้งค่า MONGODB_URI

## ขั้นตอนการเตรียม Deploy

### 1. สร้างไฟล์ `.gitignore` (ถ้ายังไม่มี)

```gitignore
node_modules/
.env
.DS_Store
*.log
```

### 2. สร้างไฟล์ `Procfile` (สำหรับ Heroku)

```
web: node server.js
```

### 3. ปรับ `server.js` ให้รองรับ Dynamic Port

```javascript
const PORT = process.env.PORT || 3000;
```

(โค้ดนี้มีอยู่แล้วใน server.js)

### 4. ปรับ API URL ใน Frontend

แก้ไขไฟล์ JavaScript ที่เรียก API:

**js/login.js, js/dashboard.js, js/activity.js:**

```javascript
// แทนที่
const API_BASE_URL = 'http://localhost:3000/api';

// ด้วย
const API_BASE_URL = window.location.origin + '/api';
// หรือ
const API_BASE_URL = process.env.API_URL || window.location.origin + '/api';
```

### 5. Commit และ Push ไป GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## ตัวอย่างการ Deploy บน Render (Step-by-Step)

### Step 1: เตรียม MongoDB Atlas

1. ไปที่ [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. สร้าง Free Cluster (M0)
3. ตั้งค่า:
   - **Database Access:** สร้าง user และ password
   - **Network Access:** เพิ่ม IP `0.0.0.0/0` (allow all)
4. คลิก "Connect" → "Connect your application"
5. Copy Connection String (เช่น: `mongodb+srv://user:pass@cluster.mongodb.net/spu-activity-hub`)

### Step 2: Deploy บน Render

1. ไปที่ [render.com](https://render.com)
2. Sign up/Login with GitHub
3. คลิก "New +" → "Web Service"
4. เชื่อมต่อ GitHub repository
5. ตั้งค่า:
   - **Name:** spu-activity-hub
   - **Region:** Singapore (ใกล้ไทย)
   - **Branch:** main
   - **Root Directory:** ./
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
6. คลิก "Advanced" → "Add Environment Variable":
   - **Key:** `MONGODB_URI`
   - **Value:** (paste connection string จาก MongoDB Atlas)
   - **Key:** `NODE_ENV`
   - **Value:** `production`
7. คลิก "Create Web Service"
8. รอให้ deploy เสร็จ (ประมาณ 2-3 นาที)

### Step 3: ตั้งค่า CORS (ถ้าจำเป็น)

ใน `server.js` มี CORS อยู่แล้ว แต่ถ้าต้องการจำกัด:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### Step 4: ตรวจสอบ

1. ไปที่ URL ที่ Render ให้ (เช่น: `https://spu-activity-hub.onrender.com`)
2. ตรวจสอบว่าเว็บทำงาน
3. ทดสอบ login และใช้งาน

## ข้อควรระวัง

1. **Environment Variables:**
   - อย่า commit `.env` ไป GitHub
   - ตั้งค่าใน hosting service แทน

2. **MongoDB Connection:**
   - ใช้ MongoDB Atlas (ฟรี) สำหรับ production
   - ตั้งค่า Network Access ให้ถูกต้อง

3. **Static Files:**
   - ตรวจสอบว่า path ของ static files ถูกต้อง
   - ใช้ relative paths ใน HTML

4. **API URLs:**
   - ปรับ API URLs ให้ใช้ relative paths หรือ environment variables

## ตัวอย่างไฟล์สำหรับ Deploy

### `vercel.json` (สำหรับ Vercel)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### `railway.json` (สำหรับ Railway)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## ราคา (ประมาณ)

- **Render:** ฟรี (Free Tier) - จำกัด bandwidth
- **Railway:** ฟรี $5 credit/เดือน
- **Vercel:** ฟรีสำหรับ personal projects
- **Heroku:** ฟรี (จำกัด) หรือ $7/เดือน
- **MongoDB Atlas:** ฟรี (M0 Cluster) - 512MB storage

## Support

ถ้ามีปัญหาตอน deploy:
1. ตรวจสอบ logs ใน hosting dashboard
2. ตรวจสอบ environment variables
3. ตรวจสอบ MongoDB connection
4. ตรวจสอบ port configuration

