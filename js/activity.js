document.addEventListener("DOMContentLoaded", () => {
  // Keys for localStorage
  const JOINED_ACTIVITIES_KEY = 'spu-joined-activities';
  const STUDENT_INFO_KEY = 'spu-student-info';
  
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
  
  // Page elements
  const joinButton = document.getElementById("join-button");
  const cancelButton = document.getElementById("cancel-button");
  const requestHoursButton = document.getElementById("request-hours-button");
  const showFormButton = document.getElementById("show-form-button");
  const requestStatus = document.getElementById("request-status");
  const statusText = document.getElementById("status-text");
  const approvedStatus = document.getElementById("approved-status");
  const approvedText = document.getElementById("approved-text");
  const viewApprovedDetailsBtn = document.getElementById("view-approved-details-btn");
  const hoursElement = document.getElementById("activity-hours");
  const registrationLinkElement = document.querySelector(".register-link");

  // Modal elements
  const modal = document.getElementById("custom-modal");
  const modalMessageContainer = document.getElementById(
    "modal-message-container"
  );
  const closeButton = document.querySelector(".close-button");

  // Function to show the modal
  const showModal = (messageHtml) => {
    modalMessageContainer.innerHTML = messageHtml;
    modal.style.display = "block";
  };

  // Function to hide the modal
  const hideModal = () => {
    modal.style.display = "none";
  };

  // ฟังก์ชันดึงข้อมูลกิจกรรมจาก API
  async function getCurrentActivity() {
    // ลองดึงจาก URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const activityTitle = urlParams.get('title');
    
    if (activityTitle) {
      try {
        // โหลดจาก API
        const activity = await apiCall(`/activities/${encodeURIComponent(activityTitle)}`);
        // บันทึก activity ไว้ใน localStorage สำหรับ backward compatibility
        localStorage.setItem('spu-current-activity', JSON.stringify(activity));
        return activity;
      } catch (error) {
        console.error('Error loading activity from API:', error);
        // ถ้าโหลดจาก API ไม่ได้ ลองดึงจาก localStorage (backward compatibility)
        const currentActivity = JSON.parse(localStorage.getItem('spu-current-activity') || 'null');
        return currentActivity;
      }
    }
    
    // ถ้าไม่มีใน URL ลองดึงจาก localStorage (สำหรับ backward compatibility)
    const currentActivity = JSON.parse(localStorage.getItem('spu-current-activity') || 'null');
    return currentActivity;
  }
  
  // อัปเดตข้อมูลกิจกรรมในหน้า
  function updateActivityPage(activity) {
    if (!activity) return;
    
    // Debug: ตรวจสอบ formLink
    console.log('Activity data:', {
      title: activity.title,
      formLink: activity.formLink,
      hasFormLink: !!(activity.formLink && activity.formLink.trim() !== '')
    });
    
    // อัปเดตรูปภาพ
    const posterImage = document.getElementById('activity-poster-image');
    if (posterImage && activity.imgUrl) {
      posterImage.src = activity.imgUrl;
      posterImage.alt = activity.title || 'Activity Poster';
      // เพิ่ม error handler สำหรับกรณีที่รูปภาพโหลดไม่ได้
      posterImage.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E';
      };
    } else if (posterImage && !activity.imgUrl) {
      // ถ้าไม่มี imgUrl ให้แสดง placeholder
      posterImage.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E';
      posterImage.alt = activity.title || 'Activity Poster';
    }
    
    // อัปเดตชื่อกิจกรรม
    const posterTitle = document.getElementById('activity-poster-title');
    if (posterTitle) {
      posterTitle.textContent = activity.title || 'กิจกรรม';
    }
    
    // อัปเดตชื่อผู้บรรยาย (ถ้ามี)
    const speakerName = document.getElementById('activity-speaker-name');
    if (speakerName && activity.speaker) {
      speakerName.textContent = activity.speaker;
    }
    
    // อัปเดตประเภทกิจกรรม
    const activityType = document.getElementById('activity-type');
    if (activityType) {
      // ใช้ desc หรือ subtitle หรือ type ถ้ามี
      activityType.textContent = activity.type || activity.subtitle || '';
    }
    
    // อัปเดตคำอธิบาย
    const activityDesc = document.getElementById('activity-description');
    if (activityDesc) {
      const desc = activity.desc || activity.description || '';
      activityDesc.innerHTML = desc.replace(/\n/g, '<br />');
    }
    
    // อัปเดตชั่วโมง
    if (hoursElement) {
      hoursElement.textContent = `${activity.hours || 2} ชั่วโมง`;
    }
    
    // อัปเดตสถานที่
    const locationElement = document.getElementById('activity-location');
    if (locationElement) {
      locationElement.textContent = activity.location || 'มหาวิทยาลัยศรีปทุม';
    }
    
    // อัปเดตลิงค์ฟอร์ม
    const formSection = document.getElementById('registration-form');
    const showFormButton = document.getElementById('show-form-button');
    
    if (activity.formLink && activity.formLink.trim() !== '') {
      // มีลิงก์ฟอร์ม - แสดงปุ่มและฟอร์ม
      if (registrationLinkElement) {
        registrationLinkElement.href = activity.formLink;
        registrationLinkElement.textContent = activity.formLink;
      }
      
      // แสดงปุ่มรายละเอียดเพิ่มเติม
      if (showFormButton) {
        showFormButton.style.display = 'block';
      }
      
      // แสดงฟอร์มโดยอัตโนมัติเมื่อมีลิงก์
      if (formSection) {
        formSection.style.display = 'block';
        if (showFormButton) {
          showFormButton.textContent = 'ซ่อนฟอร์ม';
        }
        console.log('Form section displayed with link:', activity.formLink);
      } else {
        console.error('Form section element not found!');
      }
    } else {
      // ไม่มีลิงก์ฟอร์ม - ซ่อนปุ่มและฟอร์ม
      if (showFormButton) {
        showFormButton.style.display = 'none';
      }
      if (formSection) {
        formSection.style.display = 'none';
      }
      if (registrationLinkElement) {
        registrationLinkElement.href = '#';
        registrationLinkElement.textContent = 'ยังไม่มีลิงก์ฟอร์ม';
      }
    }
    
    // อัปเดตวันที่และเวลา
    if (activity.date) {
      const dateObj = new Date(activity.date + 'T00:00:00');
      const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
                        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
      const dateDisplay = `${dateObj.getDate()} ${thaiMonths[dateObj.getMonth()]} ${dateObj.getFullYear() + 543}`;
      
      // อัปเดตวันที่ใน poster
      const posterDate = document.getElementById('activity-poster-date');
      if (posterDate) {
        let dateTimeText = dateDisplay;
        if (activity.time) {
          const [hours, minutes] = activity.time.split(':');
          dateTimeText += ` | เวลา ${hours}:${minutes} น.`;
        }
        posterDate.textContent = dateTimeText;
      }
      
      // อัปเดตวันที่ใน detail section
      const dateDisplayElement = document.getElementById('activity-date-display');
      if (dateDisplayElement) {
        dateDisplayElement.textContent = dateDisplay;
      }
      
      const timeDisplayElement = document.getElementById('activity-time-display');
      if (timeDisplayElement && activity.time) {
        const [hours, minutes] = activity.time.split(':');
        timeDisplayElement.textContent = `เวลา ${hours}:${minutes} น.`;
      }
    }
  }
  
  // โหลดข้อมูลกิจกรรมเมื่อหน้าโหลด
  (async () => {
    const activity = await getCurrentActivity();
    if (activity) {
      updateActivityPage(activity);
      
      // ตรวจสอบสถานะการเข้าร่วมจาก API
      const studentInfo = JSON.parse(localStorage.getItem(STUDENT_INFO_KEY) || '{}');
      const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
      
      try {
        const participants = await apiCall(`/participants/${encodeURIComponent(activity.title)}`);
        const participantsCount = participants.length;
        const maxSlots = parseInt(activity.slots, 10) || 10;
        const isFull = participantsCount >= maxSlots;
        const isJoined = participants.some(p => p.studentId === studentId);
        
        if (isJoined) {
          // แสดงปุ่มยกเลิกและซ่อนปุ่มเข้าร่วม
          if (joinButton) {
            joinButton.style.display = "none";
          }
          if (cancelButton) {
            cancelButton.style.display = "block";
          }
        } else {
          // ตรวจสอบว่ากิจกรรมเต็มหรือยัง
          if (isFull) {
            // ถ้ากิจกรรมเต็ม ให้ disable ปุ่ม join
            if (joinButton) {
              joinButton.style.display = "block";
              joinButton.disabled = true;
              joinButton.style.backgroundColor = '#6c757d';
              joinButton.style.cursor = 'not-allowed';
              joinButton.textContent = 'กิจกรรมเต็ม';
            }
            if (cancelButton) {
              cancelButton.style.display = "none";
            }
          } else {
            // แสดงปุ่มเข้าร่วมและซ่อนปุ่มยกเลิก
            if (joinButton) {
              joinButton.style.display = "block";
              joinButton.disabled = false;
              joinButton.style.backgroundColor = '';
              joinButton.style.cursor = '';
              joinButton.textContent = 'เข้าร่วมกิจกรรม';
            }
            if (cancelButton) {
              cancelButton.style.display = "none";
            }
          }
        }
        
        // อัปเดตสถานะการยื่นรับเวลา
        updateRequestStatusUI(activity.title);
      } catch (error) {
        console.error('Error checking join status:', error);
        // Fallback to localStorage
        const joinedActivities = JSON.parse(localStorage.getItem(JOINED_ACTIVITIES_KEY) || '[]');
        if (joinedActivities.includes(activity.title)) {
          if (joinButton) {
            joinButton.style.display = "none";
          }
          if (cancelButton) {
            cancelButton.style.display = "block";
          }
        } else {
          if (joinButton) {
            joinButton.style.display = "block";
          }
          if (cancelButton) {
            cancelButton.style.display = "none";
          }
        }
        updateRequestStatusUI(activity.title);
      }
    }
  })();

  // ฟังก์ชันยกเลิกการเข้าร่วม
  async function cancelJoinActivity(activity) {
    const activityTitle = activity.title;
    const hours = parseInt(activity.hours, 10) || 0;
    
    // ดึงข้อมูลนักศึกษา
    const studentInfo = JSON.parse(localStorage.getItem(STUDENT_INFO_KEY) || '{}');
    const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
    
    try {
      // ลบข้อมูลผู้เข้าร่วมออกจาก API
      await apiCall(`/participants/${encodeURIComponent(activityTitle)}/${encodeURIComponent(studentId)}`, {
        method: 'DELETE'
      });
      
      // ลบออกจาก joined activities
      const joinedActivities = JSON.parse(localStorage.getItem(JOINED_ACTIVITIES_KEY) || '[]');
      const updatedJoinedActivities = joinedActivities.filter(title => title !== activityTitle);
      localStorage.setItem(JOINED_ACTIVITIES_KEY, JSON.stringify(updatedJoinedActivities));
      
      // แสดงปุ่มเข้าร่วมและซ่อนปุ่มยกเลิก
      if (joinButton) {
        joinButton.style.display = "block";
      }
      if (cancelButton) {
        cancelButton.style.display = "none";
      }
      
      // อัปเดตสถานะการยื่นรับเวลา
      updateRequestStatusUI(activityTitle);
      
      // แสดง modal แจ้งผลลัพธ์
      let message = "";
      if (hours > 0) {
        message = `<p>คุณได้ยกเลิกการเข้าร่วมกิจกรรมแล้ว</p><p>หากคุณได้ยื่นรับเวลากิจกรรมไปแล้ว การยื่นรับเวลาจะถูกยกเลิกด้วย</p>`;
      } else {
        message = `<p>คุณได้ยกเลิกการเข้าร่วมกิจกรรมเรียบร้อยแล้ว</p>`;
      }
      showModal(message);
      
      // Trigger custom event เพื่อให้หน้า dashboard อัปเดต
      const event = new CustomEvent('activityJoined', {
        detail: { activityTitle, hours: -hours }
      });
      window.dispatchEvent(event);
      
      // อัปเดต progress bar ในหน้า dashboard (ถ้ามี)
      if (window.updateDashboardProgress) {
        window.updateDashboardProgress();
      }
    } catch (error) {
      console.error('Error canceling join:', error);
      showModal('<p>เกิดข้อผิดพลาดในการยกเลิกการเข้าร่วม กรุณาลองใหม่อีกครั้ง</p>');
    }
  }

  // Event listener for the cancel button
  if (cancelButton) {
    cancelButton.addEventListener("click", async () => {
      const activity = await getCurrentActivity();
      
      if (!activity) {
        showModal('<p>ไม่พบข้อมูลกิจกรรม กรุณาลองใหม่อีกครั้ง</p>');
        return;
      }
      
      const hours = parseInt(activity.hours, 10) || 0;
      const confirmMessage = `
        <p>คุณต้องการยกเลิกการเข้าร่วมกิจกรรมนี้หรือไม่?</p>
        <p style="color: #ff6b6b; font-weight: bold;">คุณจะยกเลิกการเข้าร่วมกิจกรรมนี้</p>
        <p style="color: #666; font-size: 0.9em; margin-top: 5px;">หากคุณได้ยื่นรับเวลากิจกรรมไปแล้ว การยื่นรับเวลาจะถูกยกเลิกด้วย</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
          <button id="confirm-cancel-btn" style="
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          ">ยืนยันยกเลิก</button>
          <button id="cancel-cancel-btn" style="
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          ">ยกเลิก</button>
        </div>
      `;
      
      showModal(confirmMessage);
      
      // รอให้ DOM อัปเดตก่อน
      setTimeout(() => {
        const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
        const cancelCancelBtn = document.getElementById('cancel-cancel-btn');
        
        if (confirmCancelBtn) {
          confirmCancelBtn.addEventListener('click', () => {
            hideModal();
            cancelJoinActivity(activity);
          });
        }
        
        if (cancelCancelBtn) {
          cancelCancelBtn.addEventListener('click', () => {
            hideModal();
          });
        }
      }, 100);
    });
  }

  // Event listener for the join button
  if (joinButton) {
    joinButton.addEventListener("click", async () => {
      // ดึงข้อมูลกิจกรรม
      const activity = await getCurrentActivity();
      
      if (!activity) {
        showModal('<p>ไม่พบข้อมูลกิจกรรม กรุณาลองใหม่อีกครั้ง</p>');
        return;
      }
      
      // Get activity data
      const hours = parseInt(activity.hours, 10) || 0;
      const linkUrl = activity.formLink || (registrationLinkElement ? registrationLinkElement.textContent.trim() : "");
      const activityTitle = activity.title;

      // ดึงข้อมูลนักศึกษา
      const studentInfo = JSON.parse(localStorage.getItem(STUDENT_INFO_KEY) || '{}');
      const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
      const studentName = studentInfo.name || 'ไม่ระบุชื่อ';

      // ตรวจสอบว่าการเข้าร่วมแล้วหรือยัง และตรวจสอบว่ากิจกรรมเต็มหรือยัง (ตรวจสอบจาก API)
      try {
        const participants = await apiCall(`/participants/${encodeURIComponent(activityTitle)}`);
        const participantsCount = participants.length;
        const maxSlots = parseInt(activity.slots, 10) || 10;
        const isFull = participantsCount >= maxSlots;
        const isAlreadyJoined = participants.some(p => p.studentId === studentId);
        
        if (isAlreadyJoined) {
          showModal('<p>คุณได้เข้าร่วมกิจกรรมนี้แล้ว!</p>');
          // อัปเดต UI
          if (joinButton) {
            joinButton.style.display = "none";
          }
          if (cancelButton) {
            cancelButton.style.display = "block";
          }
          return;
        }
        
        // ตรวจสอบว่ากิจกรรมเต็มหรือยัง
        if (isFull) {
          showModal(`<p>กิจกรรมนี้เต็มแล้ว!</p><p>จำนวนผู้เข้าร่วม: ${participantsCount}/${maxSlots}</p><p>ไม่สามารถเข้าร่วมได้อีก</p>`);
          // Disable ปุ่ม join
          if (joinButton) {
            joinButton.disabled = true;
            joinButton.style.backgroundColor = '#6c757d';
            joinButton.style.cursor = 'not-allowed';
            joinButton.textContent = 'กิจกรรมเต็ม';
          }
          return;
        }
      } catch (error) {
        console.error('Error checking participants:', error);
      }

      // บันทึกข้อมูลผู้เข้าร่วมผ่าน API
      try {
        const participantData = {
          activityTitle: activityTitle,
          studentId: studentId,
          studentName: studentName,
          registrationDate: new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };
        
        await apiCall('/participants', {
          method: 'POST',
          body: JSON.stringify(participantData)
        });

        // อัปเดต localStorage เพื่อให้ dashboard.js อ่านได้
        const joinedActivities = JSON.parse(localStorage.getItem(JOINED_ACTIVITIES_KEY) || '[]');
        if (!joinedActivities.includes(activityTitle)) {
          joinedActivities.push(activityTitle);
          localStorage.setItem(JOINED_ACTIVITIES_KEY, JSON.stringify(joinedActivities));
        }

        // Build the message for the modal
        let message = "";
        if (hours > 0) {
          message = `<p>คุณได้เข้าร่วมกิจกรรมแล้ว!</p><p>หลังจากเข้าร่วมกิจกรรมจริงแล้ว กรุณากดปุ่ม "ยื่นรับเวลากิจกรรม" เพื่อขอรับชั่วโมง ${hours} ชั่วโมง</p><p>ชั่วโมงจะถูกเพิ่มเมื่อ admin อนุมัติการยื่นรับเวลา</p>`;
        } else {
          message = `<p>คุณได้เข้าร่วมกิจกรรมเรียบร้อยแล้ว!</p>`;
        }

        if (linkUrl) {
          message += `<p>ลิงก์สำหรับลงทะเบียน:</p><p><a href="${linkUrl}" target="_blank">${linkUrl}</a></p>`;
        }

        // Show the modal with the message
        showModal(message);

        // ซ่อนปุ่มเข้าร่วมและแสดงปุ่มยกเลิก
        if (joinButton) {
          joinButton.style.display = "none";
        }
        if (cancelButton) {
          cancelButton.style.display = "block";
        }
        
        // อัปเดตสถานะการยื่นรับเวลา
        updateRequestStatusUI(activityTitle);
        
        // Trigger custom event เพื่อให้หน้า dashboard อัปเดต
        const event = new CustomEvent('activityJoined', {
          detail: { activityTitle, hours }
        });
        window.dispatchEvent(event);
        
        // อัปเดต progress bar ในหน้า dashboard (ถ้ามี)
        if (window.updateDashboardProgress) {
          window.updateDashboardProgress();
        }
      } catch (error) {
        console.error('Error joining activity:', error);
        showModal('<p>เกิดข้อผิดพลาดในการเข้าร่วมกิจกรรม กรุณาลองใหม่อีกครั้ง</p>');
      }
    });
  }

  // Event listeners to close the modal
  closeButton.addEventListener("click", hideModal);
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });
  
  // ฟังก์ชันตรวจสอบสถานะการยื่นรับเวลา
  async function checkHourRequestStatus(activityTitle) {
    const studentInfo = JSON.parse(localStorage.getItem(STUDENT_INFO_KEY) || '{}');
    const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
    
    try {
      const requests = await apiCall(`/hour-requests/student/${encodeURIComponent(studentId)}`);
      const request = requests.find(r => r.activityTitle === activityTitle);
      if (request) {
        return request.status; // 'pending', 'approved', 'rejected'
      }
    } catch (error) {
      console.error('Error checking hour request status:', error);
      // Fallback to localStorage
      const allRequests = JSON.parse(localStorage.getItem('spu-hour-requests') || '{}');
      if (allRequests[activityTitle]) {
        const request = allRequests[activityTitle].find(r => r.studentId === studentId);
        if (request) {
          return request.status;
        }
      }
    }
    return null; // ยังไม่ยื่น
  }

  // ฟังก์ชันอัปเดต UI ตามสถานะการยื่นรับเวลา
  async function updateRequestStatusUI(activityTitle) {
    const status = await checkHourRequestStatus(activityTitle);
    const studentInfo = JSON.parse(localStorage.getItem(STUDENT_INFO_KEY) || '{}');
    const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
    
    // ตรวจสอบว่าการเข้าร่วมแล้วหรือยังจาก API
    let isJoined = false;
    try {
      const participants = await apiCall(`/participants/${encodeURIComponent(activityTitle)}`);
      isJoined = participants.some(p => p.studentId === studentId);
    } catch (error) {
      console.error('Error checking participants:', error);
      // Fallback to localStorage
      const joinedActivities = JSON.parse(localStorage.getItem(JOINED_ACTIVITIES_KEY) || '[]');
      isJoined = joinedActivities.includes(activityTitle);
    }
    
    if (isJoined) {
      if (status === null) {
        // ยังไม่ยื่นรับเวลา - แสดงปุ่มยื่น
        if (requestHoursButton) {
          requestHoursButton.style.display = "block";
        }
        if (requestStatus) {
          requestStatus.style.display = "none";
        }
      } else {
        // ยื่นแล้ว - แสดงสถานะ
        if (requestHoursButton) {
          requestHoursButton.style.display = "none";
        }
        
        if (status === 'pending') {
          // แสดงสถานะรอรับเรื่อง
          if (requestStatus && statusText) {
            requestStatus.style.display = "block";
            statusText.textContent = "รอรับเรื่อง";
            requestStatus.style.backgroundColor = "#fff3cd";
            requestStatus.style.borderColor = "#ffc107";
            requestStatus.style.color = "#856404";
          }
          if (approvedStatus) {
            approvedStatus.style.display = "none";
          }
        } else if (status === 'approved') {
          // แสดงสถานะอนุมัติแล้ว
          if (requestStatus) {
            requestStatus.style.display = "none";
          }
          if (approvedStatus && approvedText) {
            approvedStatus.style.display = "block";
            getCurrentActivity().then(activity => {
              const hours = activity ? (parseInt(activity.hours, 10) || 0) : 0;
              approvedText.textContent = `คุณได้รับการยืนยันแล้ว (${hours} ชั่วโมง)`;
            });
          }
        } else if (status === 'rejected') {
          // แสดงสถานะไม่อนุมัติ
          if (requestStatus && statusText) {
            requestStatus.style.display = "block";
            statusText.textContent = "ไม่อนุมัติ";
            requestStatus.style.backgroundColor = "#f8d7da";
            requestStatus.style.borderColor = "#dc3545";
            requestStatus.style.color = "#721c24";
          }
          if (approvedStatus) {
            approvedStatus.style.display = "none";
          }
        }
      }
    } else {
      // ยังไม่เข้าร่วม - ซ่อนปุ่มและสถานะ
      if (requestHoursButton) {
        requestHoursButton.style.display = "none";
      }
      if (requestStatus) {
        requestStatus.style.display = "none";
      }
    }
  }

  // Event listener for show form button
  if (showFormButton) {
    showFormButton.addEventListener("click", () => {
      const formSection = document.getElementById('registration-form');
      if (formSection) {
        // Toggle form display
        if (formSection.style.display === 'none' || formSection.style.display === '') {
          formSection.style.display = 'block';
          showFormButton.textContent = 'ซ่อนฟอร์ม';
        } else {
          formSection.style.display = 'none';
          showFormButton.textContent = 'รายละเอียดเพิ่มเติม';
        }
      }
    });
  }

  // Event listener for request hours button
  if (requestHoursButton) {
    requestHoursButton.addEventListener("click", async () => {
      const activity = await getCurrentActivity();
      
      if (!activity) {
        showModal('<p>ไม่พบข้อมูลกิจกรรม กรุณาลองใหม่อีกครั้ง</p>');
        return;
      }
      
      const activityTitle = activity.title;
      const hours = parseInt(activity.hours, 10) || 0;
      const studentInfo = JSON.parse(localStorage.getItem(STUDENT_INFO_KEY) || '{}');
      const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
      const studentName = studentInfo.name || 'ไม่ระบุชื่อ';
      
      // ตรวจสอบว่ายื่นแล้วหรือยังจาก API
      try {
        const requests = await apiCall(`/hour-requests/student/${encodeURIComponent(studentId)}`);
        const existingRequest = requests.find(r => r.activityTitle === activityTitle);
        if (existingRequest) {
          showModal('<p>คุณได้ยื่นรับเวลากิจกรรมนี้แล้ว!</p>');
          updateRequestStatusUI(activityTitle);
          return;
        }
      } catch (error) {
        console.error('Error checking existing requests:', error);
      }
      
      // สร้างข้อมูลการยื่นรับเวลา
      try {
        const requestData = {
          activityTitle: activityTitle,
          studentId: studentId,
          studentName: studentName,
          hours: hours,
          status: 'pending',
          requestDate: new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };
        
        // บันทึกผ่าน API
        await apiCall('/hour-requests', {
          method: 'POST',
          body: JSON.stringify(requestData)
        });
        
        // อัปเดต UI
        await updateRequestStatusUI(activityTitle);
        
        // แสดง modal แจ้งผลลัพธ์
        showModal(`<p>คุณได้ยื่นรับเวลากิจกรรมเรียบร้อยแล้ว!</p><p>จำนวนชั่วโมง: ${hours} ชั่วโมง</p><p>สถานะ: รอรับเรื่อง</p>`);
      } catch (error) {
        console.error('Error requesting hours:', error);
        showModal('<p>เกิดข้อผิดพลาดในการยื่นรับเวลา กรุณาลองใหม่อีกครั้ง</p>');
      }
    });
  }

  
  // Polling เพื่ออัปเดตสถานะ (สำหรับ same-window)
  setInterval(async () => {
    const activity = await getCurrentActivity();
    if (activity) {
      updateRequestStatusUI(activity.title);
    }
  }, 5000); // อัปเดตทุก 5 วินาที
  
  // Event listener for view approved details button
  if (viewApprovedDetailsBtn) {
    viewApprovedDetailsBtn.addEventListener('click', async () => {
      const activity = await getCurrentActivity();
      if (!activity) {
        showModal('<p>ไม่พบข้อมูลกิจกรรม</p>');
        return;
      }
      
      const status = await checkHourRequestStatus(activity.title);
      if (status === 'approved') {
        const studentInfo = JSON.parse(localStorage.getItem(STUDENT_INFO_KEY) || '{}');
        const studentId = studentInfo.studentId || localStorage.getItem('studentId') || '68000000';
        
        try {
          const requests = await apiCall(`/hour-requests/student/${encodeURIComponent(studentId)}`);
          const request = requests.find(r => r.activityTitle === activity.title);
          
          if (request) {
            // บันทึกข้อมูลใบรับรองลง localStorage
            const certificateData = {
              studentName: studentInfo.name || 'ไม่ระบุชื่อ',
              activityTitle: activity.title,
              hours: request.hours || 0,
              requestDate: request.requestDate || '',
              approvedDate: request.approvedDate || '',
              description: activity.desc || 'This is a student development activity organized by the Faculty of Information Technology, Sripatum University. It is issued as an official certificate to confirm the student\'s eligibility for activity hour accumulation.'
            };
            
            localStorage.setItem('spu-certificate-data', JSON.stringify(certificateData));
            
            // Redirect ไปหน้า certificate
            window.location.href = '../admin/main/certificate.html';
          }
        } catch (error) {
          console.error('Error loading request details:', error);
          showModal('<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>');
        }
      }
    });
  }
});
