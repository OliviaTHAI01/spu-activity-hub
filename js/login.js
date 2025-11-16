// Login Handler
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  
  if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      
      // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
      if (!username || !password) {
        alert("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
        return;
      }

      // ปิดปุ่ม login เพื่อป้องกันการกดซ้ำ
      const loginButton = loginForm.querySelector('button[type="submit"]');
      const originalButtonText = loginButton.textContent;
      loginButton.disabled = true;
      loginButton.textContent = 'กำลังเข้าสู่ระบบ...';

      try {
        // เรียก API login (ใช้ relative path เพื่อรองรับทั้ง local และ production)
        const apiUrl = window.location.origin + '/api/login';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
          // แสดงข้อความ error จาก API
          alert(data.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
          loginButton.disabled = false;
          loginButton.textContent = originalButtonText;
          return;
        }

        if (data.success) {
          // เก็บข้อมูลผู้ใช้ใน localStorage
          if (data.user.role === 'admin') {
            localStorage.setItem('spu-user-info', JSON.stringify(data.user));
            // Redirect ไปหน้า admin
            window.location.href = "admin/main/index.html";
          } else {
            // เก็บข้อมูล student
            localStorage.setItem('spu-student-info', JSON.stringify(data.user));
            localStorage.setItem('studentId', data.user.studentId);
            // Redirect ไปหน้า student dashboard
            window.location.href = "pages/dashboard.html";
          }
        } else {
          alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
          loginButton.disabled = false;
          loginButton.textContent = originalButtonText;
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่');
        loginButton.disabled = false;
        loginButton.textContent = originalButtonText;
      }
    });
  }
});

