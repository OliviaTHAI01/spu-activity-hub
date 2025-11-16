const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spu-activity-hub';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
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
  createdAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);
const Participant = mongoose.model('Participant', participantSchema);
const HourRequest = mongoose.model('HourRequest', hourRequestSchema);
const Student = mongoose.model('Student', studentSchema);

// ==================== ACTIVITIES API ====================

// Get all activities (not archived)
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get archived activities
app.get('/api/activities/archived', async (req, res) => {
  try {
    const activities = await Activity.find({ isArchived: true }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const activity = await Activity.findOneAndUpdate(
      { title: req.params.title },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
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
    const activity = await Activity.findOneAndUpdate(
      { title: req.params.title },
      { isArchived: true, updatedAt: Date.now() },
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
      { isArchived: false, updatedAt: Date.now() },
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
        role: 'student'
      }
    });
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
      major: student.major
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
      major: student.major
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
      major: student.major
    };
    res.json(studentData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

