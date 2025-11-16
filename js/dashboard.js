// Login form handler - ทำงานเฉพาะในหน้า login.html
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    // ป้องกันการ Submit ฟอร์มแบบปกติ (ไม่ให้หน้า Reload)
    event.preventDefault();

    // *** ที่นี่จะเป็นจุดที่คุณเขียนโค้ดตรวจสอบ Username/Password ***
    // สมมติว่าตรวจสอบผ่านแล้ว

    // สั่งให้เปลี่ยนหน้าไปที่ Dashboard.html
    window.location.href = "pages/dashboard.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard script loaded");
  
  // API Configuration (รองรับทั้ง local และ production)
  const API_BASE_URL = window.location.origin + '/api';
  
  // Helper function for API calls
  async function apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Call Error:', error);
      throw error;
    }
  }

  // Database Connection Check
  let isDatabaseConnected = false;
  
  async function checkDatabaseConnection() {
    try {
      await apiCall('/activities');
      isDatabaseConnected = true;
      hideDatabaseError();
      return true;
    } catch (error) {
      isDatabaseConnected = false;
      showDatabaseError();
      return false;
    }
  }

  function showDatabaseError() {
    const existingError = document.getElementById('database-error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.id = 'database-error-message';
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #dc3545;
      color: white;
      padding: 15px 20px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-weight: 600;
    `;
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i> 
      ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์และ MongoDB ทำงานอยู่
      <button onclick="location.reload()" style="margin-left: 15px; padding: 5px 15px; background: white; color: #dc3545; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
        <i class="fas fa-sync-alt"></i> ลองใหม่
      </button>
    `;
    document.body.insertBefore(errorDiv, document.body.firstChild);

    const activityGrid = document.getElementById('activity-grid');
    if (activityGrid) {
      activityGrid.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; color: #666;">
          <i class="fas fa-database" style="font-size: 64px; color: #dc3545; margin-bottom: 20px;"></i>
          <h2 style="color: #333; margin-bottom: 10px;">ไม่สามารถเชื่อมต่อฐานข้อมูล</h2>
          <p style="margin-bottom: 20px;">กรุณาตรวจสอบว่า:</p>
          <ul style="text-align: left; display: inline-block; margin: 0;">
            <li>เซิร์ฟเวอร์ Node.js ทำงานอยู่ (http://localhost:3000)</li>
            <li>MongoDB ทำงานอยู่และเชื่อมต่อได้</li>
            <li>การตั้งค่า MONGODB_URI ถูกต้อง</li>
          </ul>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            <i class="fas fa-sync-alt"></i> ลองใหม่
          </button>
        </div>
      `;
    }
  }

  function hideDatabaseError() {
    const errorDiv = document.getElementById('database-error-message');
    if (errorDiv) {
      errorDiv.remove();
    }
  }

  // ตรวจสอบการเชื่อมต่อฐานข้อมูลเมื่อโหลดหน้า
  checkDatabaseConnection();
  setInterval(checkDatabaseConnection, 10000);
  
  // โหลดและแสดงข้อมูลผู้ใช้
  async function loadStudentInfo() {
    try {
      // ดึงข้อมูลจาก localStorage ที่เก็บไว้ตอน login
      const studentInfoStr = localStorage.getItem('spu-student-info');
      let studentInfo = null;
      
      if (studentInfoStr) {
        try {
          studentInfo = JSON.parse(studentInfoStr);
        } catch (e) {
          console.error('Error parsing student info:', e);
        }
      }

      // ถ้ามีข้อมูลจาก login ให้ใช้ข้อมูลนั้น
      if (studentInfo && studentInfo.studentId) {
        const studentNameValue = document.getElementById('student-name-value');
        const studentIdValue = document.getElementById('student-id-value');
        const facultyElement = document.querySelector('.profile-details p:nth-of-type(3)');
        const majorElement = document.querySelector('.profile-details p:nth-of-type(4)');
        
        if (studentNameValue && studentInfo.name) {
          studentNameValue.textContent = studentInfo.name;
        }
        
        if (studentIdValue && studentInfo.studentId) {
          studentIdValue.textContent = studentInfo.studentId;
        }

        // อัปเดตคณะและสาขา
        if (facultyElement && studentInfo.faculty) {
          facultyElement.textContent = `คณะ : ${studentInfo.faculty}`;
        }
        
        if (majorElement && studentInfo.major) {
          majorElement.textContent = `สาขา : ${studentInfo.major}`;
        }

        // เก็บ studentId ใน localStorage สำหรับใช้ในส่วนอื่น
        localStorage.setItem('studentId', studentInfo.studentId);
        
        return; // ออกจากฟังก์ชันถ้าโหลดข้อมูลสำเร็จ
      }

      // ถ้าไม่มีข้อมูลจาก login ให้ลองโหลดจาก API
      const studentId = localStorage.getItem('studentId') || '68000000';
      
      try {
        const student = await apiCall(`/students/${encodeURIComponent(studentId)}`);
        
        const studentNameValue = document.getElementById('student-name-value');
        const studentIdValue = document.getElementById('student-id-value');
        const facultyElement = document.querySelector('.profile-details p:nth-of-type(3)');
        const majorElement = document.querySelector('.profile-details p:nth-of-type(4)');
        
        if (studentNameValue && student.name) {
          studentNameValue.textContent = student.name;
        }
        
        if (studentIdValue && student.studentId) {
          studentIdValue.textContent = student.studentId;
        }

        if (facultyElement && student.faculty) {
          facultyElement.textContent = `คณะ : ${student.faculty}`;
        }
        
        if (majorElement && student.major) {
          majorElement.textContent = `สาขา : ${student.major}`;
        }
      } catch (error) {
        // ถ้าไม่พบข้อมูลนักศึกษา (404) แสดงข้อความแจ้งเตือน
        if (error.message.includes('404')) {
          console.log('Student not found. Please login first.');
          // แสดงข้อความแจ้งเตือน
          const studentNameValue = document.getElementById('student-name-value');
          if (studentNameValue) {
            studentNameValue.textContent = 'กรุณาเข้าสู่ระบบ';
          }
        } else {
          throw error; // Re-throw ถ้าไม่ใช่ 404
        }
      }
    } catch (error) {
      console.error('Error loading student info:', error);
      // ใช้ค่า default ถ้าไม่สามารถโหลดได้
      const studentId = localStorage.getItem('studentId') || '68000000';
      const studentIdValue = document.getElementById('student-id-value');
      if (studentIdValue) {
        studentIdValue.textContent = studentId;
      }
    }
  }
  
  // โหลดข้อมูลผู้ใช้เมื่อหน้าโหลด
  loadStudentInfo();
  
  // ฟังก์ชันคำนวณชั่วโมงทั้งหมดจากกิจกรรมที่ admin อนุมัติแล้วเท่านั้น
  async function calculateTotalHours() {
    try {
      const studentId = localStorage.getItem('studentId') || '68000000';
      
      try {
        const requests = await apiCall(`/hour-requests/student/${encodeURIComponent(studentId)}`);
        
        let totalHours = 0;
        
        // คำนวณชั่วโมงจากกิจกรรมที่ admin อนุมัติแล้วเท่านั้น (status = 'approved')
        if (Array.isArray(requests)) {
          requests.forEach(request => {
            if (request.status === 'approved' && request.hours) {
              totalHours += parseInt(request.hours, 10);
            }
          });
        }
        
        return totalHours;
      } catch (error) {
        // ถ้าไม่พบข้อมูล (404) หรือไม่มีข้อมูล ให้ return 0
        if (error.message.includes('404')) {
          return 0;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error calculating total hours:', error);
      return 0;
    }
  }
  
  // 1. กำหนดค่า
  const maxHours = 72; // ชั่วโมงสูงสุด
  let currentHours = 0;
  let percentage = 0;
  
  // คำนวณชั่วโมงจากกิจกรรมที่ join แล้ว (async)
  calculateTotalHours().then(hours => {
    currentHours = hours;
    percentage = Math.min((currentHours / maxHours) * 100, 100);
    updateProgressCircle();
  });

  // 2. อ้างอิง Element
  const progressCircle = document.querySelector(".circular-progress .fg");
  const percentageText = document.querySelector(".percentage");
  const hoursText = document.querySelector(".hours-text");

  // 3. ฟังก์ชันอัปเดต Progress Circle
  function updateProgressCircle() {
    if (progressCircle && percentageText && hoursText) {
      // คำนวณค่าทางคณิตศาสตร์ (สำหรับ Progress Bar)
      const radius = 60; // รัศมี r="60" จาก HTML
      const circumference = 2 * Math.PI * radius; // สูตร 2 * pi * r

      // คำนวณค่า Offset
      const offset = circumference - (percentage / 100) * circumference;

      // อัปเดต SVG
      progressCircle.style.strokeDasharray = circumference;
      progressCircle.style.strokeDashoffset = offset;

      // อัปเดตข้อความ
      percentageText.textContent = `${Math.round(percentage)}%`;
      hoursText.textContent = `${currentHours} / ${maxHours} Hours`;
    }
  }
  
  // อัปเดต Progress Circle ครั้งแรก
  updateProgressCircle();
  
  // Export function สำหรับอัปเดตจากภายนอก
  window.updateDashboardProgress = async function() {
    currentHours = await calculateTotalHours();
    const newPercentage = Math.min((currentHours / maxHours) * 100, 100);
    if (progressCircle && percentageText && hoursText) {
      const radius = 60;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (newPercentage / 100) * circumference;
      progressCircle.style.strokeDasharray = circumference;
      progressCircle.style.strokeDashoffset = offset;
      percentageText.textContent = `${Math.round(newPercentage)}%`;
      hoursText.textContent = `${currentHours} / ${maxHours} Hours`;
    }
  };

  // ----------------------------------------------------
  // 2. Load and Render Activities from Admin
  // ----------------------------------------------------
  
  async function getActivitiesFromAPI() {
    try {
      return await apiCall('/activities');
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }
  
  async function getActivityParticipants(activityTitle) {
    try {
      return await apiCall(`/participants/${encodeURIComponent(activityTitle)}`);
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }
  
  function getJoinedActivities() {
    // ยังใช้ localStorage สำหรับเก็บรายการที่ join แล้ว (เฉพาะในฝั่ง client)
    const joinedJSON = localStorage.getItem('spu-joined-activities');
    return joinedJSON ? JSON.parse(joinedJSON) : [];
  }
  
  async function renderActivities() {
    const activityGrid = document.getElementById('activity-grid');
    if (!activityGrid) return;
    
    // ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อน
    if (!isDatabaseConnected) {
      await checkDatabaseConnection();
      if (!isDatabaseConnected) {
        return; // showDatabaseError() จะแสดงข้อความแล้ว
      }
    }
    
    activityGrid.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div>';
    
    try {
      const activities = await getActivitiesFromAPI();
      const joinedActivities = getJoinedActivities();
      
      activityGrid.innerHTML = '';
      
      if (activities.length === 0) {
        activityGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ยังไม่มีกิจกรรม</p>';
        return;
      }
      
      // รอข้อมูล participants สำหรับทุกกิจกรรม
      for (const activity of activities) {
        const participants = await getActivityParticipants(activity.title);
        const participantsCount = participants.length;
        const maxSlots = parseInt(activity.slots, 10) || 10;
        const progressPercent = maxSlots > 0 ? (participantsCount / maxSlots) * 100 : 0;
        const isJoined = joinedActivities.includes(activity.title);
        const isFull = participantsCount >= maxSlots;
      
      // Format date
      let dateDisplay = '';
      if (activity.date) {
        const dateObj = new Date(activity.date + 'T00:00:00');
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        dateDisplay = `${dateObj.getDate()} ${thaiMonths[dateObj.getMonth()]} ${dateObj.getFullYear() + 543}`;
        if (activity.time) {
          const [hours, minutes] = activity.time.split(':');
          dateDisplay += ` เวลา ${hours}:${minutes} น.`;
        }
      }
      
      const cardHTML = `
        <div class="activity-card ${isFull ? 'full-card' : ''}" data-title="${activity.title}">
          <a href="activity.html?title=${encodeURIComponent(activity.title)}" class="card-image-link" style="display: block; cursor: pointer;">
            <img src="${activity.imgUrl || ''}" alt="${activity.title}" class="card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E';" />
          </a>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <div class="card-info">
            <p class="progress-text">${participantsCount}/${maxSlots}</p>
            <p class="card-title">${activity.title}</p>
            <p class="card-subtitle">${activity.desc || 'กิจกรรมพัฒนาผู้เรียน'}</p>
            <p class="card-time">${activity.hours || 4} hours</p>
            ${dateDisplay ? `<p class="card-date" style="color: #666; font-size: 0.85rem; margin-top: 0.25rem;"><i class="fas fa-calendar-alt"></i> ${dateDisplay}</p>` : ''}
            <p class="card-desc">${activity.desc || 'เป็นกิจกรรมสะสมชั่วโมงเพื่อให้อาจารย์และเพื่อนนักศึกษารับรู้ในทุกด้าน'}</p>
            ${activity.location ? `<p class="card-location" style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${activity.location}</p>` : ''}
            ${activity.lat && activity.lng ? 
              `<a href="https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lng}" target="_blank" class="navigate-btn" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 0.85rem;">
                <i class="fas fa-directions"></i> นำทาง
              </a>` : ''
            }
            ${isJoined ? 
              '<button class="join-button" disabled style="background-color: #6c757d; cursor: not-allowed;">เข้าร่วมแล้ว</button>' :
              isFull ?
              '<button class="join-button full-button" disabled>Full</button>' :
              `<a href="activity.html?title=${encodeURIComponent(activity.title)}" class="join-link">
                <button class="join-button">Join Activity</button>
              </a>`
            }
          </div>
        </div>
      `;
      
        activityGrid.insertAdjacentHTML('beforeend', cardHTML);
      }
    } catch (error) {
      console.error('Error rendering activities:', error);
      activityGrid.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; color: #dc3545;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
          <h3>เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
          <p>${error.message}</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-sync-alt"></i> ลองใหม่
          </button>
        </div>
      `;
    }
  }
  
  // Render activities when page loads
  renderActivities();
  
  // Export renderActivities function for external use
  window.renderActivities = renderActivities;
  
  // Auto-refresh activities every 30 seconds
  setInterval(() => {
    renderActivities();
    if (window.updateDashboardProgress) {
      window.updateDashboardProgress();
    }
  }, 30000);
  
  // Listen for custom activity joined event
  window.addEventListener('activityJoined', (e) => {
    renderActivities();
    if (window.updateDashboardProgress) {
      window.updateDashboardProgress();
    }
  });

  // ----------------------------------------------------
  // 3. Search Functionality - ค้นหาตามตัวอักษร
  // ----------------------------------------------------
  
  // Function to calculate distance between two coordinates (Haversine formula)
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }
  
  // Function to find nearest activities
  async function findNearestActivities() {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง');
      return;
    }
    
    const findNearestBtn = document.getElementById('find-nearest-btn');
    if (findNearestBtn) {
      findNearestBtn.disabled = true;
      findNearestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังค้นหา...';
    }
    
    navigator.geolocation.getCurrentPosition(
      async function(position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        try {
          const activities = await getActivitiesFromAPI();
          const activitiesWithDistance = activities
            .filter(activity => activity.lat && activity.lng)
            .map(activity => {
              const distance = calculateDistance(
                userLat,
                userLng,
                parseFloat(activity.lat),
                parseFloat(activity.lng)
              );
              return { ...activity, distance };
            })
            .sort((a, b) => a.distance - b.distance);
          
          // Store sorted activities temporarily
          const sortedActivities = [
            ...activitiesWithDistance,
            ...activities.filter(activity => !activity.lat || !activity.lng)
          ];
          
          // Re-render activities in distance order
          await renderActivitiesWithOrder(sortedActivities);
          
          if (findNearestBtn) {
            findNearestBtn.disabled = false;
            findNearestBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> ค้นหากิจกรรมที่ใกล้ที่สุด';
          }
          
          if (activitiesWithDistance.length > 0) {
            const nearest = activitiesWithDistance[0];
            alert(`พบกิจกรรมที่ใกล้ที่สุด: ${nearest.title}\nระยะทาง: ${nearest.distance.toFixed(2)} กม.`);
          } else {
            alert('ไม่พบกิจกรรมที่มีตำแหน่งระบุ');
          }
        } catch (error) {
          console.error('Error finding nearest activities:', error);
          alert('เกิดข้อผิดพลาดในการค้นหากิจกรรม: ' + error.message);
          if (findNearestBtn) {
            findNearestBtn.disabled = false;
            findNearestBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> ค้นหากิจกรรมที่ใกล้ที่สุด';
          }
        }
      },
      function(error) {
        alert('ไม่สามารถระบุตำแหน่งได้: ' + error.message);
        if (findNearestBtn) {
          findNearestBtn.disabled = false;
          findNearestBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> ค้นหากิจกรรมที่ใกล้ที่สุด';
        }
      }
    );
  }
  
  // Function to render activities with custom order
  async function renderActivitiesWithOrder(activities) {
    const activityGrid = document.getElementById('activity-grid');
    if (!activityGrid) return;
    
    const joinedActivities = getJoinedActivities();
    
    activityGrid.innerHTML = '';
    
    if (activities.length === 0) {
      activityGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ยังไม่มีกิจกรรม</p>';
      return;
    }
    
    // รอข้อมูล participants สำหรับทุกกิจกรรม
    for (const activity of activities) {
      const participants = await getActivityParticipants(activity.title);
      const participantsCount = participants.length;
      const maxSlots = parseInt(activity.slots, 10) || 10;
      const progressPercent = maxSlots > 0 ? (participantsCount / maxSlots) * 100 : 0;
      const isJoined = joinedActivities.includes(activity.title);
      const isFull = participantsCount >= maxSlots;
      
      // Format date
      let dateDisplay = '';
      if (activity.date) {
        const dateObj = new Date(activity.date + 'T00:00:00');
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        dateDisplay = `${dateObj.getDate()} ${thaiMonths[dateObj.getMonth()]} ${dateObj.getFullYear() + 543}`;
        if (activity.time) {
          dateDisplay += ` เวลา ${activity.time}`;
        }
      }
      
      const cardHTML = `
        <div class="activity-card ${isFull ? 'full-card' : ''}" data-title="${activity.title}">
          <a href="activity.html?title=${encodeURIComponent(activity.title)}" class="card-image-link" style="display: block; cursor: pointer;">
            <img src="${activity.imgUrl || ''}" alt="${activity.title}" class="card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E';" />
          </a>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <div class="card-info">
            <p class="progress-text">${participantsCount}/${maxSlots}</p>
            <p class="card-title">${activity.title}</p>
            <p class="card-subtitle">${activity.desc || 'กิจกรรมพัฒนาผู้เรียน'}</p>
            <p class="card-time">${activity.hours || 4} hours</p>
            ${dateDisplay ? `<p class="card-date" style="color: #666; font-size: 0.85rem; margin-top: 0.25rem;"><i class="fas fa-calendar-alt"></i> ${dateDisplay}</p>` : ''}
            <p class="card-desc">${activity.desc || 'เป็นกิจกรรมสะสมชั่วโมงเพื่อให้อาจารย์และเพื่อนนักศึกษารับรู้ในทุกด้าน'}</p>
            ${activity.location ? `<p class="card-location" style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;"><i class="fas fa-map-marker-alt"></i> ${activity.location}</p>` : ''}
            ${activity.distance !== undefined ? `<p class="card-distance" style="color: #28a745; font-size: 0.85rem; margin-top: 0.25rem; font-weight: 600;"><i class="fas fa-route"></i> ระยะทาง: ${activity.distance.toFixed(2)} กม.</p>` : ''}
            ${activity.lat && activity.lng ? 
              `<a href="https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lng}" target="_blank" class="navigate-btn" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 0.85rem;">
                <i class="fas fa-directions"></i> นำทาง
              </a>` : ''
            }
            ${isJoined ? 
              '<button class="join-button" disabled style="background-color: #6c757d; cursor: not-allowed;">เข้าร่วมแล้ว</button>' :
              isFull ?
              '<button class="join-button full-button" disabled>Full</button>' :
              `<a href="activity.html?title=${encodeURIComponent(activity.title)}" class="join-link">
                <button class="join-button">Join Activity</button>
              </a>`
            }
          </div>
        </div>
      `;
      
      activityGrid.insertAdjacentHTML('beforeend', cardHTML);
    }
  }
  
  // Event listener for find nearest button
  const findNearestBtn = document.getElementById('find-nearest-btn');
  if (findNearestBtn) {
    findNearestBtn.addEventListener('click', findNearestActivities);
  }
  
  const searchInput = document.getElementById("searchInput");
  
  if (searchInput) {
    // ฟังก์ชันค้นหา
    function performSearch() {
      const searchTerm = searchInput.value.toLowerCase().trim();
      const activityGrid = document.getElementById('activity-grid');
      if (!activityGrid) return;
      
      const activityCards = activityGrid.querySelectorAll(".activity-card");
      
      activityCards.forEach((card) => {
        // ดึงข้อมูลจาก card ที่ต้องการค้นหา
        const cardTitle = card.querySelector(".card-title")?.textContent.toLowerCase() || "";
        const cardSubtitle = card.querySelector(".card-subtitle")?.textContent.toLowerCase() || "";
        const cardDesc = card.querySelector(".card-desc")?.textContent.toLowerCase() || "";
        
        // ตรวจสอบว่ามีคำที่ค้นหาในข้อมูลหรือไม่
        const matches = 
          cardTitle.includes(searchTerm) ||
          cardSubtitle.includes(searchTerm) ||
          cardDesc.includes(searchTerm);
        
        // แสดงหรือซ่อน card ตามผลการค้นหา
        if (matches || searchTerm === "") {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    }
    
    // ฟังเหตุการณ์เมื่อผู้ใช้พิมพ์ (real-time search)
    searchInput.addEventListener("input", performSearch);
    
    // ฟังเหตุการณ์เมื่อกด Enter
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
    
    // ฟังเหตุการณ์เมื่อคลิกที่ไอคอนค้นหา
    const searchIcon = document.querySelector(".search-input-group i");
    if (searchIcon) {
      searchIcon.addEventListener("click", performSearch);
    }
  }

  // ----------------------------------------------------
  // 4. Settings Toggle - เปิด/ปิดเมนูด้านข้าง
  // ----------------------------------------------------
  // รอให้ DOM พร้อมก่อน
  setTimeout(() => {
    const settingsToggle = document.getElementById("settingsToggle");
    const sideDashboard = document.getElementById("sideDashboard");
    
    console.log("Looking for elements:", {
      settingsToggle: !!settingsToggle,
      sideDashboard: !!sideDashboard
    });
    
    // สร้าง overlay element
    let overlay = document.querySelector(".dashboard-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "dashboard-overlay";
      document.body.appendChild(overlay);
      console.log("Overlay created");
    }
    
    if (!settingsToggle) {
      console.error("Settings toggle button not found!");
      return;
    }
    
    if (!sideDashboard) {
      console.error("Side dashboard not found!");
      return;
    }
    
    console.log("Settings toggle initialized successfully");
    
    // ฟังก์ชันเปิดเมนู
    function openSidebar() {
      console.log("Opening sidebar - adding show class");
      sideDashboard.classList.add("show");
      overlay.classList.add("show");
      settingsToggle.classList.add("active");
      document.body.style.overflow = "hidden";
      
      // Force reflow to ensure transition works
      sideDashboard.offsetHeight;
      
      // Double check if class was added
      console.log("Sidebar classes:", sideDashboard.className);
      console.log("Sidebar computed style:", window.getComputedStyle(sideDashboard).transform);
    }
    
    // ฟังก์ชันปิดเมนู
    function closeSidebar() {
      console.log("Closing sidebar - removing show class");
      sideDashboard.classList.remove("show");
      overlay.classList.remove("show");
      settingsToggle.classList.remove("active");
      document.body.style.overflow = "";
    }
    
    // คลิกที่ปุ่มฟันเฟือง
    settingsToggle.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Settings button clicked!");
      console.log("Current sidebar state:", sideDashboard.classList.contains("show"));
      
      if (sideDashboard.classList.contains("show")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
    
    // คลิกที่ overlay เพื่อปิดเมนู
    overlay.addEventListener("click", function(e) {
      e.stopPropagation();
      closeSidebar();
    });
    
    // ป้องกันการปิดเมนูเมื่อคลิกภายในเมนู
    sideDashboard.addEventListener("click", function(e) {
      e.stopPropagation();
    });
    
    // ปิดเมนูเมื่อกด ESC
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && sideDashboard.classList.contains("show")) {
        closeSidebar();
      }
    });
    
    // Test: เปิดเมนูอัตโนมัติเพื่อทดสอบ (ลบออกได้ถ้าต้องการ)
    // setTimeout(() => {
    //   console.log("Auto-opening sidebar for test");
    //   openSidebar();
    // }, 1000);
  }, 100);

  // ----------------------------------------------------
  // 5. Logout Functionality
  // ----------------------------------------------------
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // ยืนยันการออกจากระบบ
      if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
        // ลบข้อมูลจาก localStorage
        localStorage.removeItem('studentId');
        localStorage.removeItem('spu-joined-activities');
        localStorage.removeItem('profileImage');
        localStorage.removeItem('spu-student-info');
        localStorage.removeItem('spu-user-info');
        
        // Redirect ไปหน้า login
        window.location.href = '../login.html';
      }
    });
  }

  // ----------------------------------------------------
  // 6. Profile Image Upload Functionality
  // ----------------------------------------------------
  const profileImageContainer = document.getElementById('profileImageContainer');
  const profileImageInput = document.getElementById('profileImageInput');
  const profileImage = document.getElementById('profileImage');

  // โหลดภาพโปรไฟล์จาก localStorage เมื่อเปิดหน้า
  function loadProfileImage() {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage && profileImage) {
      profileImage.src = savedImage;
    }
  }

  // โหลดภาพเมื่อหน้าโหลด
  loadProfileImage();

  // เมื่อคลิกที่ container ให้เปิด file input
  if (profileImageContainer && profileImageInput) {
    profileImageContainer.addEventListener('click', function() {
      profileImageInput.click();
    });
  }

  // จัดการเมื่อเลือกไฟล์
  if (profileImageInput && profileImage) {
    profileImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // ตรวจสอบว่าเป็นไฟล์ภาพหรือไม่
        if (!file.type.startsWith('image/')) {
          alert('กรุณาเลือกไฟล์ภาพเท่านั้น');
          return;
        }

        // ตรวจสอบขนาดไฟล์ (จำกัดที่ 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่เล็กกว่า 5MB');
          return;
        }

        // อ่านไฟล์และแปลงเป็น base64
        const reader = new FileReader();
        reader.onload = function(event) {
          const imageDataUrl = event.target.result;
          
          // เก็บใน localStorage
          localStorage.setItem('profileImage', imageDataUrl);
          
          // แสดงภาพใหม่
          profileImage.src = imageDataUrl;
          
          // แสดงข้อความสำเร็จ
          const successMsg = document.createElement('div');
          successMsg.textContent = '✓ อัพโหลดรูปภาพสำเร็จ';
          successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 500;
            animation: slideIn 0.3s ease;
          `;
          document.body.appendChild(successMsg);
          
          // ลบข้อความหลังจาก 3 วินาที
          setTimeout(() => {
            successMsg.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
              successMsg.remove();
            }, 300);
          }, 3000);
        };

        reader.onerror = function() {
          alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
        };

        reader.readAsDataURL(file);
      }
    });
  }

  // เพิ่ม CSS animation สำหรับข้อความแจ้งเตือน
  if (!document.getElementById('profile-upload-styles')) {
    const style = document.createElement('style');
    style.id = 'profile-upload-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
});
