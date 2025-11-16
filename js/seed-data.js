// Seed Data Script - สร้างตัวอย่างข้อมูลกิจกรรม
// รันสคริปต์นี้ใน browser console หรือเพิ่มในหน้า admin

(function() {
  const ACTIVITIES_STORAGE_KEY = 'spu-activities';
  
  // ตัวอย่างกิจกรรม 1: SPU SIT Tech Talk
  const sampleActivity = {
    title: "SPU SIT Tech Talk: The Rise of AI-Powered Freelancer",
    desc: "เมื่อ AI คือแรงขับเคลื่อนใหม่ของอาชีพไอที - กิจกรรมบรรยายการพูดคุยเกี่ยวกับการพัฒนาของเทคโนโลยีในปัจจุบัน โดย CK Cheong CEO ของ Fastwork",
    imgUrl: "../images/posters/ps0.jpg",
    formLink: "https://forms.gle/example",
    hours: "2",
    slots: "50",
    date: "2025-11-20", // 20 พฤศจิกายน 2568
    time: "13:00"
  };
  
  // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
  const existingActivities = JSON.parse(localStorage.getItem(ACTIVITIES_STORAGE_KEY) || '[]');
  
  // ตรวจสอบว่ามีกิจกรรมนี้อยู่แล้วหรือไม่
  const activityExists = existingActivities.some(act => act.title === sampleActivity.title);
  
  if (!activityExists) {
    // เพิ่มตัวอย่างกิจกรรม
    existingActivities.unshift(sampleActivity);
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(existingActivities));
    console.log('✅ เพิ่มตัวอย่างกิจกรรมสำเร็จ:', sampleActivity.title);
    console.log('📋 ข้อมูลกิจกรรม:', sampleActivity);
    
    // แสดงข้อมูล
    alert(`เพิ่มตัวอย่างกิจกรรมสำเร็จ!\n\nชื่อ: ${sampleActivity.title}\nชั่วโมง: ${sampleActivity.hours} ชั่วโมง\nจำนวนที่รับ: ${sampleActivity.slots} คน\nวันที่: 20 พฤศจิกายน 2568 เวลา 13:00 น.`);
  } else {
    console.log('ℹ️ กิจกรรมนี้มีอยู่แล้ว:', sampleActivity.title);
    alert('กิจกรรมนี้มีอยู่แล้วในระบบ');
  }
  
  return sampleActivity;
})();

