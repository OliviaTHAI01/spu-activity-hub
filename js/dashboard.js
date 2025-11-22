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
  
  // Toggle สำหรับปิดการเชื่อมต่อฐานข้อมูลชั่วคราว
  const ENABLE_DATABASE = true;
  
  // API Configuration (รองรับทั้ง local และ production)
  const API_BASE_URL = window.location.origin + '/api';
  
  // Cache for student info
  let cachedStudentInfo = null;
  
  // Helper functions for student info
  function cacheStudentInfo(info = {}) {
    const merged = { ...(cachedStudentInfo || {}), ...info };
    cachedStudentInfo = merged;
    try {
      localStorage.setItem('spu-student-info', JSON.stringify(merged));
    } catch (error) {
      console.warn('Unable to cache student info:', error);
    }
    if (merged.studentId) {
      localStorage.setItem('studentId', merged.studentId);
    }
  }

  function applyStudentDetailsToUI(studentData = {}) {
    const studentNameValue = document.getElementById('student-name-value');
    const studentIdValue = document.getElementById('student-id-value');
    const facultyElement = document.querySelector('.profile-details p:nth-of-type(3)');
    const majorElement = document.querySelector('.profile-details p:nth-of-type(4)');

    if (studentNameValue && studentData.name) {
      studentNameValue.textContent = studentData.name;
    }
    if (studentIdValue && studentData.studentId) {
      studentIdValue.textContent = studentData.studentId;
    }
    if (facultyElement && studentData.faculty) {
      facultyElement.textContent = `คณะ : ${studentData.faculty}`;
    }
    if (majorElement && studentData.major) {
      majorElement.textContent = `สาขา : ${studentData.major}`;
    }
    if (studentData.profileImage) {
      localStorage.setItem('profileImage', studentData.profileImage);
      // Update image UI directly if element exists
      const profileImage = document.getElementById('profileImage');
      if (profileImage) {
        profileImage.src = studentData.profileImage;
      }
    }
  }
  
  // Helper function for API calls
  async function apiCall(endpoint, options = {}) {
    if (!ENABLE_DATABASE) {
      throw new Error('DATABASE_DISABLED');
    }
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
    if (!ENABLE_DATABASE) {
      isDatabaseConnected = false;
      showDatabaseDisabledMessage();
      return false;
    }
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
    if (!ENABLE_DATABASE) {
      showDatabaseDisabledMessage();
      return;
    }
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
    const disabledDiv = document.getElementById('database-disabled-message');
    if (disabledDiv) {
      disabledDiv.remove();
    }
  }
  
  function showDatabaseDisabledMessage() {
    let disabledDiv = document.getElementById('database-disabled-message');
    if (!disabledDiv) {
      disabledDiv = document.createElement('div');
      disabledDiv.id = 'database-disabled-message';
      disabledDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #9c27b0;
        color: white;
        padding: 15px 20px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-weight: 600;
      `;
      disabledDiv.innerHTML = `
        <i class="fas fa-database-slash"></i>
        โหมดสาธิต: ปิดการเชื่อมต่อฐานข้อมูลชั่วคราว
      `;
      document.body.insertBefore(disabledDiv, document.body.firstChild);
    }
    
    const activityGrid = document.getElementById('activity-grid');
    if (activityGrid) {
      activityGrid.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; color: #666;">
          <i class="fas fa-plug" style="font-size: 64px; color: #9c27b0; margin-bottom: 20px;"></i>
          <h2 style="color: #333; margin-bottom: 10px;">โหมดออฟไลน์</h2>
          <p>ฟีเจอร์นี้ต้องเชื่อมต่อฐานข้อมูล กรุณาเปิดการเชื่อมต่ออีกครั้ง</p>
        </div>
      `;
    }
  }

  // ตรวจสอบการเชื่อมต่อฐานข้อมูลเมื่อโหลดหน้า
  if (ENABLE_DATABASE) {
    checkDatabaseConnection();
    setInterval(checkDatabaseConnection, 10000);
  } else {
    showDatabaseDisabledMessage();
  }
  
  // โหลดและแสดงข้อมูลผู้ใช้
  async function loadStudentInfo() {
    try {
      const studentInfoStr = localStorage.getItem('spu-student-info');
      let studentInfo = null;
      let shouldFetchFromServer = true;

      if (studentInfoStr) {
        try {
          studentInfo = JSON.parse(studentInfoStr);
        } catch (e) {
          console.error('Error parsing student info:', e);
        }
      }

      if (studentInfo && studentInfo.studentId) {
        cacheStudentInfo(studentInfo);
        applyStudentDetailsToUI(studentInfo);

        const savedImage = studentInfo.profileImage || localStorage.getItem('profileImage');
        const profileImage = document.getElementById('profileImage');
        if (profileImage) {
          if (savedImage) {
            profileImage.src = savedImage;
          } else {
            // Reset to default if no image
            const defaultSrc = profileImage.getAttribute('data-default-src') || profileImage.src;
            profileImage.src = defaultSrc;
          }
        }

        shouldFetchFromServer = ENABLE_DATABASE && !studentInfo.profileImage;
        if (!shouldFetchFromServer) {
          return;
        }
      } else if (!ENABLE_DATABASE) {
        const studentIdValue = document.getElementById('student-id-value');
        const fallbackId = localStorage.getItem('studentId') || '68000000';
        if (studentIdValue) {
          studentIdValue.textContent = fallbackId;
        }
        return;
      }

      if (!ENABLE_DATABASE) {
        return;
      }

      const studentId = (studentInfo && studentInfo.studentId) || localStorage.getItem('studentId') || '68000000';
      try {
        const student = await apiCall(`/students/${encodeURIComponent(studentId)}`);
        cacheStudentInfo(student);
        applyStudentDetailsToUI(student);
      } catch (error) {
        if (error.message.includes('404')) {
          console.log('Student not found. Please login first.');
          const studentNameValue = document.getElementById('student-name-value');
          if (studentNameValue) {
            studentNameValue.textContent = 'กรุณาเข้าสู่ระบบ';
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error loading student info:', error);
      const studentId = localStorage.getItem('studentId') || '68000000';
      const studentIdValue = document.getElementById('student-id-value');
      if (studentIdValue) {
        studentIdValue.textContent = studentId;
      }
    }
  }
  
  // โหลดข้อมูลผู้ใช้เมื่อหน้าโหลด
  loadStudentInfo();
  
  // ฟังก์ชันคำนวณชั่วโมงแยกตาม tags (แสดงเฉพาะที่ approved แล้ว)
  async function calculateHoursByTags() {
    try {
      const studentId = localStorage.getItem('studentId') || '68000000';
      
      if (!ENABLE_DATABASE) {
        return { onlineHours: 0, volunteerHours: 0 };
      }
      
      try {
        const [requests, activities] = await Promise.all([
          apiCall(`/hour-requests/student/${encodeURIComponent(studentId)}`).catch(() => []),
          apiCall('/activities?includeArchived=true').catch(() => [])
        ]);
        
        let onlineHours = 0;
        let volunteerHours = 0;
        
        // สร้าง map ของ activities โดยใช้ title เป็น key
        const activityMap = new Map();
        if (Array.isArray(activities)) {
          activities.forEach(activity => {
            activityMap.set(activity.title, activity);
          });
        }
        
        // คำนวณชั่วโมงจากกิจกรรมที่ admin อนุมัติแล้วเท่านั้น (status = 'approved')
        if (Array.isArray(requests)) {
          requests.forEach(request => {
            if (request.status === 'approved' && request.hours) {
              const hours = parseInt(request.hours, 10) || 0;
              const activity = activityMap.get(request.activityTitle);
              
              if (activity) {
                const tags = activity.tags || [];
                // ตรวจสอบว่ามี tag Online หรือไม่
                const hasOnline = tags.includes('Online');
                // ตรวจสอบว่ามี tag จิตอาสาและอื่นๆ หรือไม่
                const hasVolunteer = tags.includes('จิตอาสาและอื่นๆ') || 
                                    tags.includes('จิตอาสา') || 
                                    tags.includes('และอื่นๆ');
                
                // แยกชั่วโมงตาม tags (ถ้ามีทั้ง 2 tags ให้นับทั้ง 2 หลอด)
                if (hasOnline) {
                  onlineHours += hours;
                }
                if (hasVolunteer) {
                  volunteerHours += hours;
                }
              }
            }
          });
        }
        
        return { onlineHours, volunteerHours };
      } catch (error) {
        // ถ้าไม่พบข้อมูล (404) หรือไม่มีข้อมูล ให้ return 0
        if (error.message.includes('404')) {
          return { onlineHours: 0, volunteerHours: 0 };
        }
        throw error;
      }
    } catch (error) {
      console.error('Error calculating hours by tags:', error);
      return { onlineHours: 0, volunteerHours: 0 };
    }
  }
  
  // 1. กำหนดค่า
  const maxHours = 72; // ชั่วโมงสูงสุด
  let onlineHours = 0;
  let volunteerHours = 0;
  
  // คำนวณชั่วโมงแยกตาม tags (async)
  calculateHoursByTags().then(({ onlineHours: online, volunteerHours: volunteer }) => {
    onlineHours = online;
    volunteerHours = volunteer;
    updateProgressBars();
  });

  // 2. อ้างอิง Element (Progress Bars แนวนอน)
  const onlineProgressFill = document.getElementById('dashboard-online-progress-fill');
  const onlinePercentageText = document.getElementById('dashboard-online-percentage');
  const volunteerProgressFill = document.getElementById('dashboard-volunteer-progress-fill');
  const volunteerPercentageText = document.getElementById('dashboard-volunteer-percentage');

  // 3. ฟังก์ชันอัปเดต Progress Bars
  function updateProgressBars() {
    const onlinePercentage = Math.min((onlineHours / maxHours) * 100, 100);
    const volunteerPercentage = Math.min((volunteerHours / maxHours) * 100, 100);
    
    if (onlineProgressFill && onlinePercentageText) {
      onlineProgressFill.style.width = `${onlinePercentage}%`;
      onlinePercentageText.textContent = `${Math.round(onlinePercentage)}%`;
    }
    
    if (volunteerProgressFill && volunteerPercentageText) {
      volunteerProgressFill.style.width = `${volunteerPercentage}%`;
      volunteerPercentageText.textContent = `${Math.round(volunteerPercentage)}%`;
    }
  }
  
  // อัปเดต Progress Bars ครั้งแรก
  updateProgressBars();
  
  // Export function สำหรับอัปเดตจากภายนอก
  window.updateDashboardProgress = async function() {
    const { onlineHours: online, volunteerHours: volunteer } = await calculateHoursByTags();
    onlineHours = online;
    volunteerHours = volunteer;
    updateProgressBars();
  };

  // ----------------------------------------------------
  // 2. Load and Render Activities from Admin
  // ----------------------------------------------------
  
  let activitiesRenderToken = 0;
  
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

  // Batch fetch participants for multiple activities (much faster)
  async function getParticipantsBatch(activityTitles) {
    try {
      if (!activityTitles || activityTitles.length === 0) return {};
      const response = await apiCall('/participants/batch', {
        method: 'POST',
        body: JSON.stringify({ activityTitles })
      });
      return response || {};
    } catch (error) {
      console.error('Error fetching participants batch:', error);
      return {};
    }
  }
  
  function getJoinedActivities() {
    // ยังใช้ localStorage สำหรับเก็บรายการที่ join แล้ว (เฉพาะในฝั่ง client)
    const joinedJSON = localStorage.getItem('spu-joined-activities');
    return joinedJSON ? JSON.parse(joinedJSON) : [];
  }
  
  async function renderActivities() {
    const renderToken = ++activitiesRenderToken;
    const activityGrid = document.getElementById('activity-grid');
    if (!activityGrid) return;
    
    if (!ENABLE_DATABASE) {
      showDatabaseDisabledMessage();
      return;
    }
    
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
      if (renderToken !== activitiesRenderToken) {
        return;
      }
      const joinedActivities = getJoinedActivities();
      
      activityGrid.innerHTML = '';
      
      if (activities.length === 0) {
        activityGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ยังไม่มีกิจกรรม</p>';
        return;
      }
      
      // ดึงข้อมูล studentId เพื่อตรวจสอบการเข้าร่วม
      const studentInfo = JSON.parse(localStorage.getItem('spu-student-info') || '{}');
      const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
      
      // ดึงข้อมูล participants แบบ batch (เร็วกว่ามาก!)
      const activityTitles = activities.map(a => a.title);
      const participantsBatch = await getParticipantsBatch(activityTitles);
      if (renderToken !== activitiesRenderToken) {
        return;
      }
      
      // Render activities
      for (const activity of activities) {
        const participants = participantsBatch[activity.title] || [];
        if (renderToken !== activitiesRenderToken) {
          return;
        }
        const participantsCount = participants.length;
        const maxSlots = parseInt(activity.slots, 10) || 10;
        const progressPercent = maxSlots > 0 ? (participantsCount / maxSlots) * 100 : 0;
        
        // ตรวจสอบว่าผู้ใช้เข้าร่วมแล้วหรือไม่จาก participants API
        const isJoined = participants.some(p => p.studentId === studentId) || joinedActivities.includes(activity.title);
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
          <a href="activity.html?title=${encodeURIComponent(activity.title)}" class="card-image-link">
            <img src="${activity.imgUrl || ''}" alt="${activity.title}" class="card-image" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E';" />
          </a>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <div class="card-info">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <p class="progress-text">${participantsCount}/${maxSlots}</p>
            </div>
            <p class="card-title">${activity.title}</p>
            ${activity.desc ? `<p class="card-subtitle">${activity.desc}</p>` : ''}
            ${activity.tags && activity.tags.length > 0 ? `
            <div class="card-tags">
              ${activity.tags.map(tag => {
                let tagClass = 'tag-custom';
                if (tag === 'Online') tagClass = 'tag-online';
                else if (tag === 'จิตอาสาและอื่นๆ' || tag === 'จิตอาสา' || tag === 'และอื่นๆ') tagClass = 'tag-volunteer';
                return `<span class="card-tag ${tagClass}">${tag === 'จิตอาสา' || tag === 'และอื่นๆ' ? 'จิตอาสาและอื่นๆ' : tag}</span>`;
              }).join('')}
            </div>
            ` : ''}
            <p class="card-time">${activity.hours || 4} hours</p>
            ${dateDisplay ? `<p class="card-date"><i class="fas fa-calendar-alt"></i> ${dateDisplay}</p>` : ''}
            ${activity.location ? `<p class="card-location"><i class="fas fa-map-marker-alt"></i> ${activity.location}</p>` : ''}
            ${activity.lat && activity.lng ? 
              `<a href="https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lng}" target="_blank" class="navigate-btn">
                <i class="fas fa-directions"></i> นำทาง
              </a>` : ''
            }
            <p class="card-desc">${activity.desc || 'เป็นกิจกรรมสะสมชั่วโมงเพื่อให้อาจารย์และเพื่อนนักศึกษารับรู้ในทุกด้าน'}</p>
            ${isJoined ? 
              '<button class="join-button joined-button" disabled><i class="fas fa-check-circle"></i> เข้าร่วมแล้ว</button>' :
              isFull ?
              '<button class="join-button full-button" disabled><i class="fas fa-times-circle"></i> Full</button>' :
              `<a href="activity.html?title=${encodeURIComponent(activity.title)}" class="join-link">
                <button class="join-button">Join Activity</button>
              </a>`
            }
          </div>
        </div>
      `;
      
        if (renderToken !== activitiesRenderToken) {
          return;
        }
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
  
  // Auto-refresh activities every 60 seconds (reduced frequency for better performance)
  // Only refresh if page is visible
  let refreshInterval = null;
  function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
      // Only refresh if page is visible
      if (!document.hidden) {
        renderActivities();
        if (window.updateDashboardProgress) {
          window.updateDashboardProgress();
        }
      }
    }, 60000); // 60 seconds instead of 30
  }
  
  // Pause refresh when page is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    } else {
      startAutoRefresh();
    }
  });
  
  startAutoRefresh();
  
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
    
    if (!ENABLE_DATABASE) {
      alert('โหมดสาธิต: ฟีเจอร์นี้ต้องเชื่อมต่อฐานข้อมูล');
      return;
    }
    
    const findNearestBtn = document.getElementById('find-nearest-btn');
    if (findNearestBtn) {
      findNearestBtn.disabled = true;
      findNearestBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>กำลังค้นหา...</span>';
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
            findNearestBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i><span>ค้นหากิจกรรมที่ใกล้ที่สุด</span>';
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
          findNearestBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i><span>ค้นหากิจกรรมที่ใกล้ที่สุด</span>';
        }
      }
    );
  }
  
  // Function to render activities with custom order
  async function renderActivitiesWithOrder(activities) {
    const renderToken = ++activitiesRenderToken;
    const activityGrid = document.getElementById('activity-grid');
    if (!activityGrid) return;
    
    if (!ENABLE_DATABASE) {
      showDatabaseDisabledMessage();
      return;
    }
    
    const joinedActivities = getJoinedActivities();
    
    activityGrid.innerHTML = '';
    
    if (activities.length === 0) {
      activityGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ยังไม่มีกิจกรรม</p>';
      return;
    }
    
    // ดึงข้อมูล studentId เพื่อตรวจสอบการเข้าร่วม
    const studentInfo = JSON.parse(localStorage.getItem('spu-student-info') || '{}');
    const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
    
    // ดึงข้อมูล participants แบบ batch (เร็วกว่ามาก!)
    const activityTitles = activities.map(a => a.title);
    const participantsBatch = await getParticipantsBatch(activityTitles);
    if (renderToken !== activitiesRenderToken) {
      return;
    }
    
    // Render activities
    for (const activity of activities) {
      const participants = participantsBatch[activity.title] || [];
      if (renderToken !== activitiesRenderToken) {
        return;
      }
      const participantsCount = participants.length;
      const maxSlots = parseInt(activity.slots, 10) || 10;
      const progressPercent = maxSlots > 0 ? (participantsCount / maxSlots) * 100 : 0;
      
      // ตรวจสอบว่าผู้ใช้เข้าร่วมแล้วหรือไม่จาก participants API
      const isJoined = participants.some(p => p.studentId === studentId) || joinedActivities.includes(activity.title);
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
            <img src="${activity.imgUrl || ''}" alt="${activity.title}" class="card-image" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E';" />
          </a>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progressPercent}%"></div>
          </div>
          <div class="card-info">
            <p class="progress-text">${participantsCount}/${maxSlots}</p>
            <p class="card-title">${activity.title}</p>
            <p class="card-subtitle">${activity.desc || 'กิจกรรมพัฒนาผู้เรียน'}</p>
            ${activity.tags && activity.tags.length > 0 ? `
            <div class="card-tags" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">
              ${activity.tags.map(tag => {
                let tagClass = 'tag-custom';
                if (tag === 'Online') tagClass = 'tag-online';
                else if (tag === 'จิตอาสาและอื่นๆ' || tag === 'จิตอาสา' || tag === 'และอื่นๆ') tagClass = 'tag-volunteer';
                return `<span class="card-tag ${tagClass}" style="display: inline-flex; align-items: center; padding: 0.3rem 0.7rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; color: white;">${tag === 'จิตอาสา' || tag === 'และอื่นๆ' ? 'จิตอาสาและอื่นๆ' : tag}</span>`;
              }).join('')}
            </div>
            ` : ''}
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
              '<button class="join-button joined-button" disabled><i class="fas fa-check-circle"></i> เข้าร่วมแล้ว</button>' :
              isFull ?
              '<button class="join-button full-button" disabled>Full</button>' :
              `<a href="activity.html?title=${encodeURIComponent(activity.title)}" class="join-link">
                <button class="join-button">Join Activity</button>
              </a>`
            }
          </div>
        </div>
      `;
      
      if (renderToken !== activitiesRenderToken) {
        return;
      }
      activityGrid.insertAdjacentHTML('beforeend', cardHTML);
    }
  }
  
  // Event listener for find nearest button
  const findNearestBtn = document.getElementById('find-nearest-btn');
  if (findNearestBtn) {
    findNearestBtn.addEventListener('click', findNearestActivities);
  }

  // Event listener for ongoing activities button
  const ongoingBtn = document.getElementById('ongoing-activities-btn');
  if (ongoingBtn) {
    ongoingBtn.addEventListener('click', () => {
      window.location.href = 'history.html#ongoing-panel';
    });
  }

  // Event listener for activity history button
  const historyBtn = document.getElementById('activity-history-btn');
  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      window.location.href = 'history.html';
    });
  }

  // Hours Info Modal
  const hoursInfoModal = document.getElementById('hours-info-modal');
  const hoursInfoBtn = document.getElementById('hours-info-btn');

  // Open hours info modal
  if (hoursInfoBtn && hoursInfoModal) {
    hoursInfoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hoursInfoModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  }

  // Close modal function
  function closeHoursInfoModal() {
    if (hoursInfoModal) {
      hoursInfoModal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }

  // Close modal buttons
  const modalCloseBtns = document.querySelectorAll('.info-modal-close, .info-modal-close-btn');
  if (modalCloseBtns.length > 0) {
    modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeHoursInfoModal();
      });
    });
  }

  // Close modal when clicking outside
  if (hoursInfoModal) {
    hoursInfoModal.addEventListener('click', (e) => {
      if (e.target === hoursInfoModal) {
        closeHoursInfoModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (hoursInfoModal && hoursInfoModal.classList.contains('active')) {
        closeHoursInfoModal();
      }
      if (formDownloadModal && formDownloadModal.classList.contains('active')) {
        closeFormDownloadModal();
      }
    }
  });

  // Form Download Modal
  const formDownloadModal = document.getElementById('form-download-modal');
  const loadFormBtn = document.getElementById('load-form-btn');

  // Open form download modal
  if (loadFormBtn && formDownloadModal) {
    loadFormBtn.addEventListener('click', (e) => {
      e.preventDefault();
      formDownloadModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  // Close form download modal function
  function closeFormDownloadModal() {
    if (formDownloadModal) {
      formDownloadModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Close form download modal buttons
  const formModalCloseBtns = formDownloadModal ? formDownloadModal.querySelectorAll('.info-modal-close, .info-modal-close-btn') : [];
  if (formModalCloseBtns.length > 0) {
    formModalCloseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeFormDownloadModal();
      });
    });
  }

  // Close form download modal when clicking outside
  if (formDownloadModal) {
    formDownloadModal.addEventListener('click', (e) => {
      if (e.target === formDownloadModal) {
        closeFormDownloadModal();
      }
    });
  }

  // Handle form download buttons
  const downloadFormBtns = document.querySelectorAll('.download-form-btn');
  downloadFormBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const formType = btn.getAttribute('data-form');
      downloadForm(formType);
    });
  });

  // Function to download form
  function downloadForm(formType) {
    // กำหนด URL ของแบบฟอร์มแต่ละประเภท
    const formUrls = {
      'activity-hours-form': '/forms/activity-hours-form.pdf',
      'activity-report-form': '/forms/activity-report-form.docx',
      'activity-summary-form': '/forms/activity-summary-form.xlsx'
    };

    const formUrl = formUrls[formType];
    
    if (formUrl) {
      // สร้าง link element เพื่อดาวน์โหลด
      const link = document.createElement('a');
      link.href = formUrl;
      link.download = formType + (formUrl.includes('.pdf') ? '.pdf' : formUrl.includes('.docx') ? '.docx' : '.xlsx');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // แสดงข้อความแจ้งเตือน
      alert('กำลังดาวน์โหลดแบบฟอร์ม...\n\nหากไม่มีการดาวน์โหลดอัตโนมัติ กรุณาตรวจสอบการตั้งค่าเบราว์เซอร์ของคุณ');
    } else {
      alert('ไม่พบแบบฟอร์มที่ต้องการ กรุณาติดต่อผู้ดูแลระบบ');
    }
  }
  
  const searchInput = document.getElementById("searchInput");
  
  if (searchInput) {
    // Debounce function for search
    let searchTimeout = null;
    function debounceSearch(func, delay) {
      return function(...args) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => func.apply(this, args), delay);
      };
    }
    
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
    
    // ฟังเหตุการณ์เมื่อผู้ใช้พิมพ์ (real-time search with debounce)
    searchInput.addEventListener("input", debounceSearch(performSearch, 300));
    
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
  const defaultProfileImageSrc = profileImage ? (profileImage.getAttribute('data-default-src') || profileImage.src) : '';

  function updateProfileImageUI(imageSrc) {
    if (!profileImage) return;
    profileImage.src = imageSrc || defaultProfileImageSrc || profileImage.src;
  }

  function showFloatingMessage(text, type = 'success') {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#0d6efd'
    };
    const toast = document.createElement('div');
    toast.textContent = text;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${colors[type] || colors.success};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // โหลดภาพโปรไฟล์จาก localStorage เมื่อเปิดหน้า
  function loadProfileImage() {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      updateProfileImageUI(savedImage);
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
      if (!file) {
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์ภาพเท่านั้น');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่เล็กกว่า 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = async function(event) {
        const imageDataUrl = event.target.result;
        if (!imageDataUrl) {
          alert('ไม่สามารถอ่านไฟล์ภาพได้');
          return;
        }

        const studentId = (cachedStudentInfo && cachedStudentInfo.studentId) || localStorage.getItem('studentId');

        if (ENABLE_DATABASE && studentId) {
          try {
            await apiCall(`/students/${encodeURIComponent(studentId)}/profile-image`, {
              method: 'POST',
              body: JSON.stringify({ imageData: imageDataUrl })
            });
            cacheStudentInfo({ profileImage: imageDataUrl, studentId });
            updateProfileImageUI(imageDataUrl);
            localStorage.setItem('profileImage', imageDataUrl);
            showFloatingMessage('✓ อัปโหลดรูปภาพสำเร็จ');
          } catch (error) {
            console.error('Error uploading profile image:', error);
            showFloatingMessage('อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองอีกครั้ง', 'error');
          }
        } else {
          updateProfileImageUI(imageDataUrl);
          localStorage.setItem('profileImage', imageDataUrl);
          cacheStudentInfo({ profileImage: imageDataUrl, studentId });
          showFloatingMessage('บันทึกรูปภาพไว้ในเครื่อง (โหมดออฟไลน์)', 'info');
        }
      };

      reader.onerror = function() {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
      };

      reader.readAsDataURL(file);
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
