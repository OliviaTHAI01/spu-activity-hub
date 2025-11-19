const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
const MAX_BODY_SIZE = process.env.MAX_BODY_SIZE || '20mb';

// CORS Configuration - รองรับทั้ง development และ production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5500'
    ];

// เพิ่ม production domains อัตโนมัติ (Railway, Render, Vercel)
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}
if (process.env.RENDER_EXTERNAL_URL) {
  allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);
}
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(cors({
  origin: function (origin, callback) {
    // อนุญาต requests ที่ไม่มี origin (เช่น mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // ใน development อนุญาตทุก origin
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(express.json({ limit: MAX_BODY_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_BODY_SIZE }));

// Middleware to remove restrictive CSP headers for development
// This intercepts responses and removes the CSP header set by express.static
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  res.setHeader = function(name, value) {
    // Remove the restrictive CSP header that blocks DevTools
    if (name && name.toLowerCase() === 'content-security-policy') {
      return; // Don't set the CSP header
    }
    return originalSetHeader.call(this, name, value);
  };
  next();
});

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    // Remove CSP header for all static files to allow DevTools
    res.removeHeader('Content-Security-Policy');
  }
}));

// Handle Chrome DevTools well-known endpoint (optional, suppresses CSP warning)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).send();
});

// Handle favicon requests (prevents 404 errors)
app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/pages/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'dashboard.html'));
});

app.get('/pages/activity', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'activity.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'main', 'index.html'));
});

// MongoDB Connection
// รองรับทั้ง localhost, Render Internal Database, และ MongoDB Atlas
let MONGODB_URI = process.env.MONGODB_URI;

// ถ้าไม่มี MONGODB_URI ให้ใช้ default (สำหรับ local development)
if (!MONGODB_URI) {
  MONGODB_URI = 'mongodb://localhost:27017/spu-activity-hub';
  console.log('⚠️  MONGODB_URI not set, using default localhost (for development only)');
}

// ตรวจสอบว่า MONGODB_URI ถูกตั้งค่าหรือไม่ (สำหรับ production)
if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
  console.error('❌ Please set MONGODB_URI in your hosting service environment variables.');
  console.error('❌ For Render: Use Internal Database URL from MongoDB service');
  console.error('❌ For MongoDB Atlas: Use connection string from Atlas dashboard');
}

// ตรวจสอบว่าใช้ localhost หรือไม่ (สำหรับ production)
if (process.env.NODE_ENV === 'production' && MONGODB_URI.includes('localhost') && !MONGODB_URI.includes('mongo')) {
  console.error('❌ WARNING: Using localhost MongoDB URI in production!');
  console.error('❌ This will not work. Please set MONGODB_URI correctly:');
  console.error('❌   - Render: Use Internal Database URL (mongodb://mongo:27017/...)');
  console.error('❌   - MongoDB Atlas: Use connection string (mongodb+srv://...)');
}

// MongoDB Connection Options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

mongoose.connect(MONGODB_URI, mongooseOptions)
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Mask sensitive information in URI
  const maskedURI = MONGODB_URI
    .replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    .replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://***:***@');
  console.log('📊 MongoDB URI:', maskedURI);
  console.log('📊 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
  console.log('📊 Database:', mongoose.connection.db?.databaseName || 'Unknown');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('❌ MongoDB URI:', MONGODB_URI ? 'Set (but connection failed)' : 'NOT SET');
  
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Please check:');
    console.error('   1. MONGODB_URI environment variable is set correctly');
    
    // ให้คำแนะนำตาม connection string
    if (MONGODB_URI.includes('localhost') && !MONGODB_URI.includes('mongo')) {
      console.error('   2. For Render: Use Internal Database URL from MongoDB service');
      console.error('      Example: mongodb://mongo:27017/spu-activity-hub');
    } else if (MONGODB_URI.includes('mongodb+srv://')) {
      console.error('   2. MongoDB Atlas Network Access allows 0.0.0.0/0');
      console.error('   3. Database user credentials are correct');
    } else {
      console.error('   2. MongoDB service is running and accessible');
      console.error('   3. Database user credentials are correct');
    }
  } else {
    console.error('💡 For local development: Make sure MongoDB is running');
    console.error('   Run: mongod (or start MongoDB service)');
  }
});

// MongoDB Schemas
const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  imgUrl: { type: String, default: '' },
  formLink: { type: String, default: '' },
  hours: { type: Number, default: 0 },
  slots: { type: Number, default: 10 },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  location: { type: String, default: '' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  isArchived: { type: Boolean, default: false },
  archivedDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const participantSchema = new mongoose.Schema({
  activityTitle: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  registrationDate: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now }
});

const hourRequestSchema = new mongoose.Schema({
  activityTitle: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  hours: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: String, default: '' },
  approvedDate: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  faculty: { type: String, default: 'Information Technology' },
  major: { type: String, default: 'Computer Science' },
  scholarshipType: { type: String, default: 'ทั่วไป' },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);
const Participant = mongoose.model('Participant', participantSchema);
const HourRequest = mongoose.model('HourRequest', hourRequestSchema);
const Student = mongoose.model('Student', studentSchema);

// ==================== ACTIVITIES API ====================

// Get all activities (with optional filters)
app.get('/api/activities', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database not connected',
        details: 'MongoDB connection is not established. Please check your MONGODB_URI environment variable.'
      });
    }

    const { includeArchived, title, showAll } = req.query;
    const filter = {};

    if (!showAll) {
      filter.isArchived = includeArchived === 'true' ? { $in: [true, false] } : false;
    }

    if (title) {
      filter.title = title;
    }

    const activities = await Activity.find(filter).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      error: error.message,
      details: 'Failed to fetch activities from database'
    });
  }
});

// Get archived activities only
app.get('/api/activities/archived', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database not connected',
        details: 'MongoDB connection is not established. Please check your MONGODB_URI environment variable.'
      });
    }

    const activities = await Activity.find({ isArchived: true }).sort({ archivedDate: -1, createdAt: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Error fetching archived activities:', error);
    res.status(500).json({
      error: error.message,
      details: 'Failed to fetch archived activities from database'
    });
  }
});

// Get single activity
app.get('/api/activities/:title', async (req, res) => {
  try {
    const activity = await Activity.findOne({ title: req.params.title });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create activity
// Note: MongoDB collections (Participant, HourRequest) are created automatically
// when the first document is inserted. No explicit table initialization needed.
app.post('/api/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    // ตารางข้อมูลสำหรับ participants และ hour requests จะถูกสร้างอัตโนมัติ
    // เมื่อมีการเพิ่มข้อมูลครั้งแรก (MongoDB collections are created on first insert)
    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update activity
app.put('/api/activities/:title', async (req, res) => {
  try {
    const originalTitle = req.params.title;
    const requestedTitle = typeof req.body.title === 'string' ? req.body.title.trim() : originalTitle;

    if (!requestedTitle) {
      return res.status(400).json({ error: 'Activity title is required' });
    }

    if (requestedTitle && requestedTitle !== originalTitle) {
      const existing = await Activity.findOne({ title: requestedTitle });
      if (existing) {
        return res.status(400).json({ error: 'Activity title already exists' });
      }
    }

    const updateData = {
      ...req.body,
      title: requestedTitle,
      updatedAt: Date.now()
    };

    const activity = await Activity.findOneAndUpdate(
      { title: originalTitle },
      updateData,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (requestedTitle && requestedTitle !== originalTitle) {
      await Participant.updateMany(
        { activityTitle: originalTitle },
        { activityTitle: requestedTitle }
      );
      await HourRequest.updateMany(
        { activityTitle: originalTitle },
        { activityTitle: requestedTitle }
      );
    }

    res.json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete activity
app.delete('/api/activities/:title', async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({ title: req.params.title });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    // Also delete related participants and hour requests
    await Participant.deleteMany({ activityTitle: req.params.title });
    await HourRequest.deleteMany({ activityTitle: req.params.title });
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Archive activity
app.post('/api/activities/:title/archive', async (req, res) => {
  try {
    // Format date as Thai date string
    const now = new Date();
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                       'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const archivedDateStr = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543} เวลา ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    
    const activity = await Activity.findOneAndUpdate(
      { title: req.params.title },
      { 
        isArchived: true, 
        archivedDate: archivedDateStr,
        updatedAt: Date.now() 
      },
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore activity
app.post('/api/activities/:title/restore', async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { title: req.params.title },
      { 
        isArchived: false, 
        archivedDate: '',
        updatedAt: Date.now() 
      },
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PARTICIPANTS API ====================

// Get participants for an activity
app.get('/api/participants/:activityTitle', async (req, res) => {
  try {
    const participants = await Participant.find({ activityTitle: req.params.activityTitle });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get participants for a student
app.get('/api/participants/student/:studentId', async (req, res) => {
  try {
    const participants = await Participant.find({ studentId: req.params.studentId });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add participant
app.post('/api/participants', async (req, res) => {
  try {
    const { activityTitle, studentId } = req.body;
    
    // ตรวจสอบว่ามีกิจกรรมนี้หรือไม่
    const activity = await Activity.findOne({ title: activityTitle });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // ตรวจสอบว่าผู้ใช้เข้าร่วมแล้วหรือยัง
    const existingParticipant = await Participant.findOne({
      activityTitle: activityTitle,
      studentId: studentId
    });
    
    if (existingParticipant) {
      return res.status(400).json({ error: 'คุณได้เข้าร่วมกิจกรรมนี้แล้ว' });
    }
    
    // ตรวจสอบจำนวนผู้เข้าร่วมว่าครบหรือยัง
    const participantsCount = await Participant.countDocuments({ activityTitle: activityTitle });
    const maxSlots = parseInt(activity.slots, 10) || 10;
    
    if (participantsCount >= maxSlots) {
      return res.status(400).json({ 
        error: `กิจกรรมนี้เต็มแล้ว (${participantsCount}/${maxSlots})` 
      });
    }
    
    // เพิ่มผู้เข้าร่วม
    const participant = new Participant(req.body);
    await participant.save();
    res.status(201).json(participant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove participant
app.delete('/api/participants/:activityTitle/:studentId', async (req, res) => {
  try {
    const participant = await Participant.findOneAndDelete({
      activityTitle: req.params.activityTitle,
      studentId: req.params.studentId
    });
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HOUR REQUESTS API ====================

// Get hour requests for an activity
app.get('/api/hour-requests/:activityTitle', async (req, res) => {
  try {
    const requests = await HourRequest.find({ activityTitle: req.params.activityTitle });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hour requests for a student
app.get('/api/hour-requests/student/:studentId', async (req, res) => {
  try {
    const requests = await HourRequest.find({ studentId: req.params.studentId });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hour request
app.post('/api/hour-requests', async (req, res) => {
  try {
    const hourRequest = new HourRequest(req.body);
    await hourRequest.save();
    res.status(201).json(hourRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Approve hour request
app.post('/api/hour-requests/:id/approve', async (req, res) => {
  try {
    const request = await HourRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedDate: new Date().toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject hour request
app.post('/api/hour-requests/:id/reject', async (req, res) => {
  try {
    const request = await HourRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hour-requests/:id/reset', async (req, res) => {
  try {
    const request = await HourRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'pending', approvedDate: '' },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hour request
app.delete('/api/hour-requests/:id', async (req, res) => {
  try {
    const request = await HourRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Hour request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENTS API ====================

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // ตรวจสอบว่าเป็น admin หรือไม่
    if (username === 'admin' && password === 'admin') {
      return res.json({
        success: true,
        user: {
          username: 'admin',
          role: 'admin'
        }
      });
    }

    // ค้นหานักศึกษาจาก username
    const student = await Student.findOne({ username: username });
    
    if (!student) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ตรวจสอบรหัสผ่าน (ในกรณีนี้เป็น plain text แต่ควรใช้ bcrypt ใน production)
    if (student.password !== password) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // ส่งข้อมูลผู้ใช้กลับไป (ไม่ส่ง password)
    res.json({
      success: true,
      user: {
        username: student.username,
        studentId: student.studentId,
        name: student.name,
        faculty: student.faculty,
        major: student.major,
        scholarshipType: student.scholarshipType || 'ทั่วไป',
        profileImage: student.profileImage || '',
        role: 'student'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students (without passwords)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({}, '-password').sort({ name: 1 });
    res.json(students.map(student => ({
      username: student.username,
      studentId: student.studentId,
      name: student.name,
      faculty: student.faculty,
      major: student.major,
      scholarshipType: student.scholarshipType || 'ทั่วไป',
      profileImage: student.profileImage || '',
      createdAt: student.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get aggregated student summary (participation + hours)
app.get('/api/students/summary', async (req, res) => {
  try {
    const [students, participants, activities] = await Promise.all([
      Student.find({}, '-password'),
      Participant.find({}),
      Activity.find({})
    ]);

    const activityMap = activities.reduce((map, activity) => {
      map[activity.title] = activity;
      return map;
    }, {});

    const participantsMap = participants.reduce((map, participant) => {
      if (!map[participant.studentId]) {
        map[participant.studentId] = [];
      }
      map[participant.studentId].push(participant);
      return map;
    }, {});

    const summary = students.map(student => {
      const studentParticipants = participantsMap[student.studentId] || [];
      const detailedActivities = studentParticipants.map(participant => {
        const activity = activityMap[participant.activityTitle] || {};
        return {
          title: participant.activityTitle,
          hours: activity.hours || 0,
          date: activity.date || '',
          time: activity.time || '',
          location: activity.location || '',
          registrationDate: participant.registrationDate || ''
        };
      });

      const totalHours = detailedActivities.reduce((sum, activity) => sum + (activity.hours || 0), 0);

      return {
        username: student.username,
        studentId: student.studentId,
        name: student.name,
        faculty: student.faculty,
        major: student.major,
        scholarshipType: student.scholarshipType || 'ทั่วไป',
        profileImage: student.profileImage || '',
        activityCount: detailedActivities.length,
        totalHours,
        activities: detailedActivities
      };
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student info
app.get('/api/students/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // ไม่ส่ง password กลับไป
    const studentData = {
      username: student.username,
      studentId: student.studentId,
      name: student.name,
      faculty: student.faculty,
      major: student.major,
      scholarshipType: student.scholarshipType || 'ทั่วไป',
      profileImage: student.profileImage || ''
    };
    res.json(studentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by username
app.get('/api/students/username/:username', async (req, res) => {
  try {
    const student = await Student.findOne({ username: req.params.username });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // ไม่ส่ง password กลับไป
    const studentData = {
      username: student.username,
      studentId: student.studentId,
      name: student.name,
      faculty: student.faculty,
      major: student.major,
      scholarshipType: student.scholarshipType || 'ทั่วไป',
      profileImage: student.profileImage || ''
    };
    res.json(studentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update student
app.post('/api/students', async (req, res) => {
  try {
    let student = await Student.findOne({ studentId: req.body.studentId });
    if (student) {
      student = await Student.findOneAndUpdate(
        { studentId: req.body.studentId },
        req.body,
        { new: true }
      );
    } else {
      student = new Student(req.body);
      await student.save();
    }
    // ไม่ส่ง password กลับไป
    const studentData = {
      username: student.username,
      studentId: student.studentId,
      name: student.name,
      faculty: student.faculty,
      major: student.major,
      scholarshipType: student.scholarshipType || 'ทั่วไป',
      profileImage: student.profileImage || ''
    };
    res.json(studentData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update student profile image
app.post('/api/students/:studentId/profile-image', async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const student = await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
      { profileImage: imageData },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      profileImage: student.profileImage || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

