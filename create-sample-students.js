// Script สำหรับสร้างข้อมูลผู้ใช้ตัวอย่าง
// รันด้วย: node create-sample-students.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spu-activity-hub';

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  faculty: { type: String, default: 'Information Technology' },
  major: { type: String, default: 'Computer Science' },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// ข้อมูลผู้ใช้ตัวอย่าง
const sampleStudents = [
  {
    username: 'student1',
    studentId: '68000001',
    name: 'สมชาย ใจดี',
    password: '123456',
    faculty: 'Information Technology',
    major: 'Computer Science'
  },
  {
    username: 'student2',
    studentId: '68000002',
    name: 'สมหญิง รักเรียน',
    password: '123456',
    faculty: 'Business Administration',
    major: 'Marketing'
  },
  {
    username: 'student3',
    studentId: '68000003',
    name: 'วิชัย เก่งมาก',
    password: '123456',
    faculty: 'Engineering',
    major: 'Electrical Engineering'
  },
  {
    username: 'student4',
    studentId: '68000004',
    name: 'มานี มีสุข',
    password: '123456',
    faculty: 'Arts',
    major: 'Graphic Design'
  },
  {
    username: 'student5',
    studentId: '68000005',
    name: 'ประเสริฐ ดีงาม',
    password: '123456',
    faculty: 'Information Technology',
    major: 'Software Engineering'
  }
];

async function createSampleStudents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ลบข้อมูลเก่า (ถ้ามี)
    await Student.deleteMany({});
    console.log('🗑️  Cleared existing students');

    // สร้างข้อมูลผู้ใช้ใหม่
    for (const studentData of sampleStudents) {
      const student = new Student(studentData);
      await student.save();
      console.log(`✅ Created student: ${studentData.username} (${studentData.name})`);
    }

    console.log('\n📋 Sample students created successfully!');
    console.log('\nคุณสามารถ login ด้วยข้อมูลต่อไปนี้:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sampleStudents.forEach(student => {
      console.log(`Username: ${student.username} | Password: ${student.password}`);
      console.log(`  → ${student.name} (${student.studentId})`);
      console.log(`  → ${student.faculty} - ${student.major}`);
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleStudents();

