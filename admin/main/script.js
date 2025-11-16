// Leaflet Maps variables
let map, editMap;
let marker, editMarker;

// Initialize Leaflet Maps (OpenStreetMap - ฟรี, สามารถคลิกเลือกตำแหน่งได้)
function initMap() {
    // Default location (Sripatum University)
    const defaultLocation = [13.7563, 100.5018];
    
    // Initialize map for add activity modal
    const mapPicker = document.getElementById('map-picker');
    if (mapPicker && typeof L !== 'undefined') {
        map = L.map(mapPicker).setView(defaultLocation, 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add marker (draggable)
        marker = L.marker(defaultLocation, { draggable: true }).addTo(map);
        
        // Update lat/lng when marker is moved
        marker.on('dragend', function() {
            const position = marker.getLatLng();
            updateCoordinates(position.lat, position.lng, 'add');
        });
        
        // Update lat/lng when map is clicked
        map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            marker.setLatLng([lat, lng]);
            updateCoordinates(lat, lng, 'add');
        });
        
        // Search location button
        const pickLocationBtn = document.getElementById('pick-location-btn');
        if (pickLocationBtn) {
            pickLocationBtn.addEventListener('click', function() {
                const locationInput = document.getElementById('activity-location').value;
                if (locationInput) {
                    searchLocation(locationInput, function(lat, lng) {
                        if (lat && lng) {
                            map.setView([lat, lng], 15);
                            marker.setLatLng([lat, lng]);
                            updateCoordinates(lat, lng, 'add');
                        } else {
                            alert('ไม่พบสถานที่ที่ค้นหา');
                        }
                    });
                }
            });
        }
        
        // Update coordinates manually
        const updateCoordsBtn = document.getElementById('update-coords-btn');
        if (updateCoordsBtn) {
            updateCoordsBtn.addEventListener('click', function() {
                const lat = parseFloat(document.getElementById('activity-lat-input').value);
                const lng = parseFloat(document.getElementById('activity-lng-input').value);
                if (!isNaN(lat) && !isNaN(lng)) {
                    map.setView([lat, lng], 15);
                    marker.setLatLng([lat, lng]);
                    updateCoordinates(lat, lng, 'add');
                } else {
                    alert('กรุณากรอกพิกัดให้ถูกต้อง');
                }
            });
        }
        
        // Load existing coordinates to input fields
        const latInput = document.getElementById('activity-lat-input');
        const lngInput = document.getElementById('activity-lng-input');
        if (latInput && lngInput) {
            latInput.value = defaultLocation[0];
            lngInput.value = defaultLocation[1];
        }
    }
    
    // Initialize map for edit activity modal
    const editMapPicker = document.getElementById('edit-map-picker');
    if (editMapPicker && typeof L !== 'undefined') {
        editMap = L.map(editMapPicker).setView(defaultLocation, 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(editMap);
        
        // Add marker (draggable)
        editMarker = L.marker(defaultLocation, { draggable: true }).addTo(editMap);
        
        // Update lat/lng when marker is moved
        editMarker.on('dragend', function() {
            const position = editMarker.getLatLng();
            updateCoordinates(position.lat, position.lng, 'edit');
        });
        
        // Update lat/lng when map is clicked
        editMap.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            editMarker.setLatLng([lat, lng]);
            updateCoordinates(lat, lng, 'edit');
        });
        
        // Search location button
        const editPickLocationBtn = document.getElementById('edit-pick-location-btn');
        if (editPickLocationBtn) {
            editPickLocationBtn.addEventListener('click', function() {
                const locationInput = document.getElementById('edit-activity-location').value;
                if (locationInput) {
                    searchLocation(locationInput, function(lat, lng) {
                        if (lat && lng) {
                            editMap.setView([lat, lng], 15);
                            editMarker.setLatLng([lat, lng]);
                            updateCoordinates(lat, lng, 'edit');
                        } else {
                            alert('ไม่พบสถานที่ที่ค้นหา');
                        }
                    });
                }
            });
        }
        
        // Update coordinates manually
        const editUpdateCoordsBtn = document.getElementById('edit-update-coords-btn');
        if (editUpdateCoordsBtn) {
            editUpdateCoordsBtn.addEventListener('click', function() {
                const lat = parseFloat(document.getElementById('edit-activity-lat-input').value);
                const lng = parseFloat(document.getElementById('edit-activity-lng-input').value);
                if (!isNaN(lat) && !isNaN(lng)) {
                    editMap.setView([lat, lng], 15);
                    editMarker.setLatLng([lat, lng]);
                    updateCoordinates(lat, lng, 'edit');
                } else {
                    alert('กรุณากรอกพิกัดให้ถูกต้อง');
                }
            });
        }
    }
}

// Update coordinates in form fields
function updateCoordinates(lat, lng, mode) {
    if (mode === 'add') {
        document.getElementById('activity-lat').value = lat;
        document.getElementById('activity-lng').value = lng;
        const latInput = document.getElementById('activity-lat-input');
        const lngInput = document.getElementById('activity-lng-input');
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
    } else if (mode === 'edit') {
        document.getElementById('edit-activity-lat').value = lat;
        document.getElementById('edit-activity-lng').value = lng;
        const latInput = document.getElementById('edit-activity-lat-input');
        const lngInput = document.getElementById('edit-activity-lng-input');
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
    }
}

// Search location using Nominatim (OpenStreetMap geocoding - ฟรี)
function searchLocation(query, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                callback(lat, lng);
            } else {
                callback(null, null);
            }
        })
        .catch(error => {
            console.error('Error searching location:', error);
            callback(null, null);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize map when Leaflet is loaded
    function tryInitMap() {
        if (typeof L !== 'undefined') {
            initMap();
        } else {
            setTimeout(tryInitMap, 100);
        }
    }
    
    // Try to initialize map after a short delay
    setTimeout(tryInitMap, 500);

    // --- API Configuration ---
    const API_BASE_URL = 'http://localhost:3000/api';

    // --- Helper Functions for API Calls ---
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

    // --- Database Connection Check ---
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
        // ลบ error message เก่าถ้ามี
        const existingError = document.getElementById('database-error-message');
        if (existingError) {
            existingError.remove();
        }

        // สร้าง error message
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

        // ซ่อนเนื้อหาหลัก
        const mainContent = document.querySelector('.main-content');
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
    // ตรวจสอบทุก 10 วินาที
    setInterval(checkDatabaseConnection, 10000);

    // --- API Functions (แทนที่ localStorage) ---
    async function getActivitiesFromAPI() {
        try {
            return await apiCall('/activities');
        } catch (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
    }

    async function getArchivedActivitiesFromAPI() {
        try {
            return await apiCall('/activities/archived');
        } catch (error) {
            console.error('Error fetching archived activities:', error);
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

    async function getHourRequests(activityTitle) {
        try {
            return await apiCall(`/hour-requests/${encodeURIComponent(activityTitle)}`);
        } catch (error) {
            console.error('Error fetching hour requests:', error);
            return [];
        }
    }

    // --- Page Navigation and Global Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // เมื่อ login สำเร็จ ให้ไปที่หน้า index.html
            window.location.href = 'index.html';
        });
    }

    // --- Certificate Page Logic (certificate.html) ---
    const certStudentName = document.getElementById('cert-student-name');
    const certActivityTitle = document.getElementById('cert-activity-title');
    const certHours = document.getElementById('cert-hours');
    const certDescription = document.getElementById('cert-description');
    const certStudentSignature = document.getElementById('cert-student-signature');
    const certStudentNameThai = document.getElementById('cert-student-name-thai');
    
    if (certStudentName || certActivityTitle || certHours || certDescription) {
        // โหลดข้อมูลใบรับรองจาก localStorage
        const certificateData = JSON.parse(localStorage.getItem('spu-certificate-data') || 'null');
        
        if (certificateData) {
            // อัปเดตชื่อนักศึกษา
            if (certStudentName) {
                certStudentName.textContent = certificateData.studentName || 'ไม่ระบุชื่อ';
            }
            
            // อัปเดตชื่อในส่วนลายเซ็น
            if (certStudentSignature) {
                // แปลงชื่อเป็นตัวย่อ (เช่น John Doe -> J. Doe)
                const nameParts = (certificateData.studentName || '').split(' ');
                if (nameParts.length > 1) {
                    certStudentSignature.textContent = `${nameParts[0][0]}. ${nameParts.slice(1).join(' ')}`;
                } else {
                    certStudentSignature.textContent = certificateData.studentName || 'J. Jiewjairung';
                }
            }
            
            if (certStudentNameThai) {
                certStudentNameThai.textContent = certificateData.studentName || 'นาง จีจี้ เยี่ยวสิรุ้ง';
            }
            
            // อัปเดตชื่อกิจกรรม
            if (certActivityTitle) {
                certActivityTitle.textContent = `กิจกรรม: ${certificateData.activityTitle || 'ไม่ระบุ'}`;
            }
            
            // อัปเดตจำนวนชั่วโมง
            if (certHours) {
                const hours = certificateData.hours || 0;
                certHours.textContent = `จำนวนชั่วโมง: ${hours} ชั่วโมง`;
            }
            
            // อัปเดตคำอธิบาย
            if (certDescription) {
                certDescription.innerHTML = certificateData.description || 'This is a student development activity organized by the Faculty of Information Technology, Sripatum University. It is issued as an official certificate to confirm the student\'s eligibility for activity hour accumulation.';
            }
            
            // สร้าง PDF อัตโนมัติเมื่อโหลดหน้าเสร็จ
            setTimeout(() => {
                generatePDF();
            }, 1000); // รอ 1 วินาทีเพื่อให้ข้อมูลแสดงผลเสร็จก่อน
        } else {
            // ถ้าไม่มีข้อมูล ให้ใช้ข้อมูล default
            console.warn('No certificate data found in localStorage');
        }
    }
    
    // ฟังก์ชันสร้าง PDF
    function generatePDF() {
        const certificateContainer = document.querySelector('.certificate-container');
        if (!certificateContainer) {
            console.error('Certificate container not found');
            return;
        }
        
        // ตรวจสอบว่ามี html2pdf library หรือไม่
        if (typeof html2pdf !== 'undefined') {
            const opt = {
                margin: [0, 0, 0, 0],
                filename: `certificate_${Date.now()}.pdf`,
                image: { 
                    type: 'jpeg', 
                    quality: 0.98 
                },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: certificateContainer.offsetWidth,
                    height: certificateContainer.offsetHeight
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: [297, 210], // A4 landscape
                    orientation: 'landscape',
                    compress: true
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            
            // สร้าง PDF และดาวน์โหลดอัตโนมัติ
            html2pdf().set(opt).from(certificateContainer).save().then(() => {
                console.log('PDF generated and downloaded successfully');
                // หลังจากดาวน์โหลด PDF แล้ว ให้กลับไปหน้า dashboard (ถ้ามาจาก activity)
                const certificateData = JSON.parse(localStorage.getItem('spu-certificate-data') || 'null');
                if (certificateData) {
                    setTimeout(() => {
                        window.location.href = '../../pages/dashboard.html';
                    }, 1500); // รอ 1.5 วินาทีเพื่อให้ดาวน์โหลดเสร็จก่อน
                }
            }).catch((error) => {
                console.error('Error generating PDF:', error);
                // ถ้าเกิด error ให้ใช้ window.print() แทน
                alert('กำลังเปิดหน้าต่างพิมพ์...');
                setTimeout(() => {
                    window.print();
                }, 500);
            });
        } else {
            // ถ้าไม่มี html2pdf library ให้ใช้ window.print() แทน
            console.log('html2pdf library not loaded, using window.print()');
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // ล้างข้อมูลชั่วโมงที่เก็บไว้
            localStorage.removeItem('currentTotalHours');
            localStorage.removeItem('activityHoursToAdd');
            // กลับไปหน้า login หลัก
            window.location.href = '../../login.html';
        });
    }

    // --- Dashboard Page Logic (index.html) ---
    const activityGrid = document.querySelector('.activity-grid');
    if (activityGrid) {
        
        // --- Function to render all activities to the grid ---
        async function renderActivities() {
            activityGrid.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div>';
            
            // ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อน
            if (!isDatabaseConnected) {
                await checkDatabaseConnection();
                if (!isDatabaseConnected) {
                    return; // showDatabaseError() จะแสดงข้อความแล้ว
                }
            }
            
            try {
                const activities = await getActivitiesFromAPI();
                activityGrid.innerHTML = ''; // Clear the grid first

                // รอข้อมูล participants และ hour requests สำหรับทุกกิจกรรม
                for (const activity of activities) {
                    // Get participants count for this activity
                    const participants = await getActivityParticipants(activity.title);
                    const participantsCount = participants.length;
                    const maxSlots = parseInt(activity.slots, 10);
                    const progressPercent = maxSlots > 0 ? (participantsCount / maxSlots) * 100 : 0;

                    // Get hour requests
                    const requests = await getHourRequests(activity.title);
                    const pendingRequests = requests.filter(r => r.status === 'pending').length;

                    let buttonHTML;
                    // ไม่มี pending activity ในฐานข้อมูลแล้ว ใช้เฉพาะปุ่มปกติ
                    buttonHTML = `
                        <div class="card-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                            <button class="view-participants-btn" data-title="${activity.title}" title="ดูรายชื่อผู้เข้าร่วม">
                                <i class="fas fa-users"></i> <span class="btn-text">ดูรายชื่อ</span> <span class="btn-badge">${participantsCount}/${maxSlots}</span>
                            </button>
                            <button class="view-hour-requests-btn" data-title="${activity.title}" title="ดูการยื่นรับเวลา">
                                <i class="fas fa-clock"></i> <span class="btn-text">การยื่นรับเวลา</span>${pendingRequests > 0 ? `<span class="btn-badge">${pendingRequests}</span>` : ''}
                            </button>
                            <button class="edit-activity-btn" data-title="${activity.title}" title="แก้ไขกิจกรรม">
                                <i class="fas fa-edit"></i> <span class="btn-text">แก้ไข</span>
                            </button>
                            <button class="archive-activity-btn" data-title="${activity.title}" title="เก็บลงคลัง">
                                <i class="fas fa-archive"></i> <span class="btn-text">เก็บลงคลัง</span>
                            </button>
                        </div>
                    `;

                    // Format date for display
                    let dateDisplay = 'ยังไม่กำหนด';
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
                    <div class="activity-card">
                        <div class="card-image-container"><img src="${activity.imgUrl || ''}" alt="${activity.title}" class="card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3Eไม่มีรูปภาพ%3C/text%3E%3C/svg%3E';"></div>
                        <div class="progress-container">
                            <div class="progress-text">${participantsCount}/${activity.slots}</div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                            </div>
                        </div>
                        <div class="card-content">
                            <h3>${activity.title}</h3>
                            <p>${activity.desc || 'เป็นกิจกรรมสะสมชั่วโมงเพื่อให้อาจารย์และเพื่อนนักศึกษารับรู้ในทุกด้าน'}</p>
                            <p class="activity-date-display" style="color: #666; font-size: 0.9rem; margin-top: 0.5rem;">
                                <i class="fas fa-calendar-alt"></i> ${dateDisplay}
                            </p>
                            <p class="activity-hours-display" style="color: #666; font-size: 0.9rem; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-clock"></i> <span class="hours" data-hours="${activity.hours}">${activity.hours || 4} hours</span>
                            </p>
                        </div>
                        <div class="card-footer">
                            ${buttonHTML}
                        </div>
                    </div>`;
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
        
        // Initial render when the page loads
        renderActivities();
        
        // --- Archive Activity Function ---
        async function archiveActivity(activityTitle) {
            if (!confirm(`คุณต้องการเก็บกิจกรรม "${activityTitle}" ลงคลังหรือไม่?`)) {
                return;
            }
            
            try {
                await apiCall(`/activities/${encodeURIComponent(activityTitle)}/archive`, {
                    method: 'POST'
                });
                
                // Refresh activities list
                await renderActivities();
                
                alert('เก็บกิจกรรมลงคลังเรียบร้อยแล้ว');
            } catch (error) {
                console.error('Error archiving activity:', error);
                alert('เกิดข้อผิดพลาดในการเก็บกิจกรรมลงคลัง: ' + error.message);
            }
        }

        // --- New Activity Modal Logic ---
        const modal = document.getElementById('add-activity-modal');
        const addActivityBtn = document.getElementById('add-activity-btn');
        const closeBtn = modal.querySelector('.close-btn');
        const addActivityForm = document.getElementById('add-activity-form');

        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => modal.style.display = 'flex');
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
        }
        if (modal) {
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // --- View Archived Activities ---
        const viewArchivedBtn = document.getElementById('view-archived-btn');
        const archivedModal = document.getElementById('archived-modal');
        const closeArchivedModal = document.getElementById('close-archived-modal');
        const closeArchivedBtn = document.getElementById('close-archived-btn');
        const archivedList = document.getElementById('archived-list');
        const archivedCount = document.getElementById('archived-count');
        
        async function showArchivedModal() {
            try {
                const archived = await getArchivedActivitiesFromAPI();
                archivedCount.textContent = archived.length;
            
                archivedList.innerHTML = '';
            
                if (archived.length === 0) {
                    archivedList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ยังไม่มีกิจกรรมที่เก็บไว้</p>';
                } else {
                    archived.forEach((activity, index) => {
                    const archivedItem = document.createElement('div');
                    archivedItem.className = 'archived-item';
                    archivedItem.style.cssText = `
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    `;
                    
                    let dateDisplay = 'ยังไม่กำหนด';
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
                    
                    archivedItem.innerHTML = `
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 0.5rem 0; color: #333;">${activity.title}</h3>
                            <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">${activity.desc || ''}</p>
                            <p style="margin: 0.25rem 0; color: #999; font-size: 0.85rem;">
                                <i class="fas fa-calendar-alt"></i> ${dateDisplay}
                            </p>
                            <p style="margin: 0.25rem 0; color: #999; font-size: 0.85rem;">
                                <i class="fas fa-archive"></i> เก็บเมื่อ: ${activity.archivedDate || 'ไม่ระบุ'}
                            </p>
                            <p style="margin: 0.25rem 0; color: #666; font-size: 0.9rem;">
                                <i class="fas fa-clock"></i> ${activity.hours || 0} ชั่วโมง
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; margin-left: 1rem;">
                            <button class="restore-activity-btn" data-title="${activity.title}">
                                <i class="fas fa-undo"></i> คืนค่า
                            </button>
                        </div>
                    `;
                    archivedList.appendChild(archivedItem);
                });
                }
                
                archivedModal.style.display = 'flex';
            } catch (error) {
                console.error('Error loading archived activities:', error);
                archivedList.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #dc3545;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}</p>
                    </div>
                `;
            }
        }
        
        function hideArchivedModal() {
            archivedModal.style.display = 'none';
        }
        
        if (viewArchivedBtn) {
            viewArchivedBtn.addEventListener('click', showArchivedModal);
        }
        if (closeArchivedModal) {
            closeArchivedModal.addEventListener('click', hideArchivedModal);
        }
        if (closeArchivedBtn) {
            closeArchivedBtn.addEventListener('click', hideArchivedModal);
        }
        if (archivedModal) {
            window.addEventListener('click', (event) => {
                if (event.target == archivedModal) {
                    hideArchivedModal();
                }
            });
        }
        
        // Event delegation for restore button
        if (archivedList) {
            archivedList.addEventListener('click', (e) => {
                if (e.target.matches('.restore-activity-btn') || e.target.closest('.restore-activity-btn')) {
                    const btn = e.target.matches('.restore-activity-btn') ? e.target : e.target.closest('.restore-activity-btn');
                    const activityTitle = btn.dataset.title;
                    restoreActivity(activityTitle);
                }
            });
        }
        
        async function restoreActivity(activityTitle) {
            if (!confirm(`คุณต้องการคืนค่ากิจกรรม "${activityTitle}" กลับมาหรือไม่?`)) {
                return;
            }
            
            try {
                await apiCall(`/activities/${encodeURIComponent(activityTitle)}/restore`, {
                    method: 'POST'
                });
                
                // Refresh
                await renderActivities();
                await showArchivedModal();
                
                alert('คืนค่ากิจกรรมเรียบร้อยแล้ว');
            } catch (error) {
                console.error('Error restoring activity:', error);
                alert('เกิดข้อผิดพลาดในการคืนค่ากิจกรรม: ' + error.message);
            }
        }

        addActivityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Create a new activity object
            const newActivity = {
                title: document.getElementById('activity-title').value,
                desc: document.getElementById('activity-desc').value,
                imgUrl: document.getElementById('activity-img').value,
                formLink: document.getElementById('activity-form-link').value,
                hours: parseInt(document.getElementById('activity-hours').value) || 0,
                slots: parseInt(document.getElementById('activity-slots').value) || 10,
                date: document.getElementById('activity-date').value,
                time: document.getElementById('activity-time').value,
                location: document.getElementById('activity-location').value,
                lat: parseFloat(document.getElementById('activity-lat').value) || null,
                lng: parseFloat(document.getElementById('activity-lng').value) || null
            };

            try {
                // ส่งข้อมูลไปยัง API - ตารางข้อมูลจะถูกสร้างอัตโนมัติในฐานข้อมูล
                await apiCall('/activities', {
                    method: 'POST',
                    body: JSON.stringify(newActivity)
                });

                // Re-render all activities to display the new one
                await renderActivities();
                
                modal.style.display = 'none';
                addActivityForm.reset();
                
                alert('เพิ่มกิจกรรมสำเร็จ');
            } catch (error) {
                console.error('Error creating activity:', error);
                alert('เกิดข้อผิดพลาดในการเพิ่มกิจกรรม: ' + error.message);
            }
        });

        // --- Participants Modal Logic ---
        const participantsModal = document.getElementById('participants-modal');
        const closeParticipantsModal = document.getElementById('close-participants-modal');
        const closeParticipantsBtn = document.getElementById('close-participants-btn');
        const participantsList = document.getElementById('participants-list');
        const participantsModalTitle = document.getElementById('participants-modal-title');
        const participantsCount = document.getElementById('participants-count');
        const maxSlots = document.getElementById('max-slots');

        async function showParticipantsModal(activityTitle) {
            try {
                // Get activity info
                const activity = await apiCall(`/activities/${encodeURIComponent(activityTitle)}`);
                if (!activity) {
                    alert('ไม่พบกิจกรรม');
                    return;
                }

                const participants = await getActivityParticipants(activityTitle);
                
                // Update modal title and counts
                participantsModalTitle.textContent = `รายชื่อผู้เข้าร่วม: ${activityTitle}`;
                participantsCount.textContent = participants.length;
                maxSlots.textContent = activity.slots;

            // Clear and populate participants list
            participantsList.innerHTML = '';
            
            if (participants.length === 0) {
                participantsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ยังไม่มีผู้เข้าร่วมกิจกรรม</p>';
            } else {
                participants.forEach((participant, index) => {
                    const participantItem = document.createElement('div');
                    participantItem.className = 'participant-item';
                    participantItem.innerHTML = `
                        <div class="participant-number">${index + 1}</div>
                        <div class="participant-info">
                            <div class="participant-name">${participant.name || 'ไม่ระบุชื่อ'}</div>
                            <div class="participant-details">
                                <span class="participant-id">รหัสนักศึกษา: ${participant.studentId || 'ไม่ระบุ'}</span>
                                <span class="participant-date">วันที่ลงทะเบียน: ${participant.registrationDate || 'ไม่ระบุ'}</span>
                            </div>
                        </div>
                    `;
                    participantsList.appendChild(participantItem);
                });
            }

                participantsModal.style.display = 'flex';
            } catch (error) {
                console.error('Error loading participants:', error);
                alert('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้เข้าร่วม: ' + error.message);
            }
        }

        function hideParticipantsModal() {
            participantsModal.style.display = 'none';
        }

        if (closeParticipantsModal) {
            closeParticipantsModal.addEventListener('click', hideParticipantsModal);
        }
        if (closeParticipantsBtn) {
            closeParticipantsBtn.addEventListener('click', hideParticipantsModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target == participantsModal) {
                hideParticipantsModal();
            }
        });

        // --- Hour Requests Modal Logic ---
        const hourRequestsModal = document.getElementById('hour-requests-modal');
        const closeHourRequestsModal = document.getElementById('close-hour-requests-modal');
        const closeHourRequestsBtn = document.getElementById('close-hour-requests-btn');
        const hourRequestsList = document.getElementById('hour-requests-list');
        const hourRequestsModalTitle = document.getElementById('hour-requests-modal-title');
        const hourRequestsCount = document.getElementById('hour-requests-count');

        async function showHourRequestsModal(activityTitle) {
            try {
                // Get activity info
                const activity = await apiCall(`/activities/${encodeURIComponent(activityTitle)}`);
                if (!activity) {
                    alert('ไม่พบกิจกรรม');
                    return;
                }

                const requests = await getHourRequests(activityTitle);
            
                // Update modal title and count
                hourRequestsModalTitle.textContent = `การยื่นรับเวลากิจกรรม: ${activityTitle}`;
                hourRequestsCount.textContent = requests.length;

                // Clear and populate requests list
                hourRequestsList.innerHTML = '';
                
                if (requests.length === 0) {
                    hourRequestsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">ยังไม่มีการยื่นรับเวลา</p>';
            } else {
                requests.forEach((request, index) => {
                    const requestItem = document.createElement('div');
                    requestItem.className = 'participant-item';
                    
                    let statusBadge = '';
                    let actionButtons = '';
                    
                    if (request.status === 'pending') {
                        statusBadge = '<span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">รอรับเรื่อง</span>';
                        actionButtons = `
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                <button class="approve-request-btn" data-activity-title="${activityTitle}" data-student-id="${request.studentId}">
                                    <i class="fas fa-check"></i> อนุมัติ
                                </button>
                                <button class="reject-request-btn" data-activity-title="${activityTitle}" data-student-id="${request.studentId}">
                                    <i class="fas fa-times"></i> ไม่อนุมัติ
                                </button>
                            </div>
                        `;
                    } else if (request.status === 'approved') {
                        statusBadge = '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">อนุมัติแล้ว</span>';
                    } else if (request.status === 'rejected') {
                        statusBadge = '<span style="background: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">ไม่อนุมัติ</span>';
                    }
                    
                    requestItem.innerHTML = `
                        <div class="participant-number">${index + 1}</div>
                        <div class="participant-info" style="flex: 1;">
                            <div class="participant-name">${request.studentName || 'ไม่ระบุชื่อ'}</div>
                            <div class="participant-details">
                                <span class="participant-id">รหัสนักศึกษา: ${request.studentId || 'ไม่ระบุ'}</span>
                                <span class="participant-date">วันที่ยื่น: ${request.requestDate || 'ไม่ระบุ'}</span>
                                <span style="margin-left: 10px;">จำนวนชั่วโมง: <strong>${request.hours || 0} ชั่วโมง</strong></span>
                            </div>
                            <div style="margin-top: 0.5rem;">
                                ${statusBadge}
                                ${actionButtons}
                            </div>
                        </div>
                    `;
                    hourRequestsList.appendChild(requestItem);
                });
            }

                hourRequestsModal.style.display = 'flex';
            } catch (error) {
                console.error('Error loading hour requests:', error);
                alert('เกิดข้อผิดพลาดในการโหลดข้อมูลการยื่นรับเวลา: ' + error.message);
            }
        }

        function hideHourRequestsModal() {
            hourRequestsModal.style.display = 'none';
        }

        async function approveHourRequest(activityTitle, studentId) {
            try {
                // Get the request ID from the database
                const requests = await getHourRequests(activityTitle);
                const request = requests.find(r => r.studentId === studentId && r.status === 'pending');
                
                if (!request || !request._id) {
                    alert('ไม่พบข้อมูลการยื่นรับเวลา');
                    return;
                }
                
                await apiCall(`/hour-requests/${request._id}/approve`, {
                    method: 'POST'
                });
                
                // Refresh modal
                await showHourRequestsModal(activityTitle);
                
                // Refresh activities list to update badge
                await renderActivities();
                
                alert('อนุมัติการยื่นรับเวลาเรียบร้อยแล้ว');
            } catch (error) {
                console.error('Error approving hour request:', error);
                alert('เกิดข้อผิดพลาดในการอนุมัติ: ' + error.message);
            }
        }

        async function rejectHourRequest(activityTitle, studentId) {
            if (!confirm('คุณต้องการไม่อนุมัติการยื่นรับเวลานี้หรือไม่?')) {
                return;
            }
            
            try {
                // Get the request ID from the database
                const requests = await getHourRequests(activityTitle);
                const request = requests.find(r => r.studentId === studentId && r.status === 'pending');
                
                if (!request || !request._id) {
                    alert('ไม่พบข้อมูลการยื่นรับเวลา');
                    return;
                }
                
                await apiCall(`/hour-requests/${request._id}/reject`, {
                    method: 'POST'
                });
                
                // Refresh modal
                await showHourRequestsModal(activityTitle);
                
                // Refresh activities list to update badge
                await renderActivities();
                
                alert('ไม่อนุมัติการยื่นรับเวลาเรียบร้อยแล้ว');
            } catch (error) {
                console.error('Error rejecting hour request:', error);
                alert('เกิดข้อผิดพลาดในการไม่อนุมัติ: ' + error.message);
            }
        }

        if (closeHourRequestsModal) {
            closeHourRequestsModal.addEventListener('click', hideHourRequestsModal);
        }
        if (closeHourRequestsBtn) {
            closeHourRequestsBtn.addEventListener('click', hideHourRequestsModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target == hourRequestsModal) {
                hideHourRequestsModal();
            }
        });
        
        // Event delegation for approve/reject buttons inside the modal
        if (hourRequestsModal) {
            hourRequestsModal.addEventListener('click', (e) => {
                console.log('Modal click event:', e.target, e.target.className);
                
                // Handle approve button click
                if (e.target.matches('.approve-request-btn') || e.target.closest('.approve-request-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const btn = e.target.matches('.approve-request-btn') ? e.target : e.target.closest('.approve-request-btn');
                    const activityTitle = btn.getAttribute('data-activity-title');
                    const studentId = btn.getAttribute('data-student-id');
                    console.log('Approve button clicked:', activityTitle, studentId);
                    if (activityTitle && studentId) {
                        approveHourRequest(activityTitle, studentId);
                    } else {
                        console.error('Missing data attributes:', { activityTitle, studentId });
                    }
                    return false;
                }
                
                // Handle reject button click
                if (e.target.matches('.reject-request-btn') || e.target.closest('.reject-request-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const btn = e.target.matches('.reject-request-btn') ? e.target : e.target.closest('.reject-request-btn');
                    const activityTitle = btn.getAttribute('data-activity-title');
                    const studentId = btn.getAttribute('data-student-id');
                    console.log('Reject button clicked:', activityTitle, studentId);
                    if (activityTitle && studentId) {
                        rejectHourRequest(activityTitle, studentId);
                    } else {
                        console.error('Missing data attributes:', { activityTitle, studentId });
                    }
                    return false;
                }
            });
        }

        // --- Edit Activity Modal Logic ---
        const editActivityModal = document.getElementById('edit-activity-modal');
        const closeEditModal = document.getElementById('close-edit-modal');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const editActivityForm = document.getElementById('edit-activity-form');

        async function showEditActivityModal(activityTitle) {
            try {
                const activity = await apiCall(`/activities/${encodeURIComponent(activityTitle)}`);
                
                if (!activity) {
                    alert('ไม่พบกิจกรรม');
                    return;
                }

            // Fill form with current activity data
            document.getElementById('edit-activity-title').value = activity.title;
            document.getElementById('edit-activity-desc').value = activity.desc;
            document.getElementById('edit-activity-img').value = activity.imgUrl;
            document.getElementById('edit-activity-form-link').value = activity.formLink || '';
            document.getElementById('edit-activity-hours').value = activity.hours;
            document.getElementById('edit-activity-slots').value = activity.slots;
            document.getElementById('edit-activity-date').value = activity.date || '';
            document.getElementById('edit-activity-time').value = activity.time || '';
            document.getElementById('edit-activity-location').value = activity.location || '';
            document.getElementById('edit-activity-lat').value = activity.lat || '';
            document.getElementById('edit-activity-lng').value = activity.lng || '';
            document.getElementById('edit-activity-original-title').value = activity.title;

            // Update map if lat/lng exists
            if (activity.lat && activity.lng && editMap) {
                const lat = parseFloat(activity.lat);
                const lng = parseFloat(activity.lng);
                editMap.setView([lat, lng], 15);
                if (editMarker) {
                    editMarker.setLatLng([lat, lng]);
                }
                document.getElementById('edit-activity-lat-input').value = lat;
                document.getElementById('edit-activity-lng-input').value = lng;
            }

                editActivityModal.style.display = 'flex';
            } catch (error) {
                console.error('Error loading activity for edit:', error);
                alert('เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม: ' + error.message);
            }
        }

        function hideEditActivityModal() {
            editActivityModal.style.display = 'none';
            editActivityForm.reset();
        }

        if (closeEditModal) {
            closeEditModal.addEventListener('click', hideEditActivityModal);
        }
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', hideEditActivityModal);
        }
        window.addEventListener('click', (event) => {
            if (event.target == editActivityModal) {
                hideEditActivityModal();
            }
        });

        // Handle delete activity
        const deleteActivityBtn = document.getElementById('delete-activity-btn');
        if (deleteActivityBtn) {
            deleteActivityBtn.addEventListener('click', async () => {
                const originalTitle = document.getElementById('edit-activity-original-title').value;
                
                if (!originalTitle) {
                    alert('ไม่พบกิจกรรมที่ต้องการลบ');
                    return;
                }

                // Confirmation dialog
                const confirmMessage = `คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${originalTitle}"?\n\nการลบนี้จะลบข้อมูลทั้งหมดรวมถึงรายชื่อผู้เข้าร่วมด้วย\n\nกด "ตกลง" เพื่อยืนยันการลบ หรือ "ยกเลิก" เพื่อยกเลิก`;
                
                if (!confirm(confirmMessage)) {
                    return; // User cancelled
                }

                try {
                    // Delete activity via API (this will also delete related participants and hour requests on the server)
                    await apiCall(`/activities/${encodeURIComponent(originalTitle)}`, {
                        method: 'DELETE'
                    });

                    // Re-render activities
                    await renderActivities();
                    
                    // Close modal
                    hideEditActivityModal();
                    
                    alert('ลบกิจกรรมสำเร็จ');
                } catch (error) {
                    console.error('Error deleting activity:', error);
                    alert('เกิดข้อผิดพลาดในการลบกิจกรรม: ' + error.message);
                }
            });
        }

        // Handle edit form submission
        if (editActivityForm) {
            editActivityForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const originalTitle = document.getElementById('edit-activity-original-title').value;
                const newTitle = document.getElementById('edit-activity-title').value;

                // Update activity data
                const updatedActivity = {
                    title: newTitle,
                    desc: document.getElementById('edit-activity-desc').value,
                    imgUrl: document.getElementById('edit-activity-img').value,
                    formLink: document.getElementById('edit-activity-form-link').value,
                    hours: parseInt(document.getElementById('edit-activity-hours').value) || 0,
                    slots: parseInt(document.getElementById('edit-activity-slots').value) || 10,
                    date: document.getElementById('edit-activity-date').value,
                    time: document.getElementById('edit-activity-time').value,
                    location: document.getElementById('edit-activity-location').value,
                    lat: parseFloat(document.getElementById('edit-activity-lat').value) || null,
                    lng: parseFloat(document.getElementById('edit-activity-lng').value) || null
                };

                try {
                    // Update activity via API
                    // If title changed, we need to delete old and create new (or update participants/hour requests separately)
                    if (originalTitle !== newTitle) {
                        // Get old activity data first
                        const oldActivity = await apiCall(`/activities/${encodeURIComponent(originalTitle)}`);
                        
                        // Create new activity with new title
                        await apiCall('/activities', {
                            method: 'POST',
                            body: JSON.stringify(updatedActivity)
                        });
                        
                        // Update participants to use new title
                        const participants = await getActivityParticipants(originalTitle);
                        for (const participant of participants) {
                            await apiCall('/participants', {
                                method: 'POST',
                                body: JSON.stringify({
                                    ...participant,
                                    activityTitle: newTitle
                                })
                            });
                            await apiCall(`/participants/${encodeURIComponent(originalTitle)}/${encodeURIComponent(participant.studentId)}`, {
                                method: 'DELETE'
                            });
                        }
                        
                        // Update hour requests to use new title
                        const requests = await getHourRequests(originalTitle);
                        for (const request of requests) {
                            await apiCall('/hour-requests', {
                                method: 'POST',
                                body: JSON.stringify({
                                    ...request,
                                    activityTitle: newTitle
                                })
                            });
                        }
                        
                        // Delete old activity
                        await apiCall(`/activities/${encodeURIComponent(originalTitle)}`, {
                            method: 'DELETE'
                        });
                    } else {
                        // Just update the activity
                        await apiCall(`/activities/${encodeURIComponent(originalTitle)}`, {
                            method: 'PUT',
                            body: JSON.stringify(updatedActivity)
                        });
                    }

                    await renderActivities();
                    hideEditActivityModal();
                    
                    alert('แก้ไขข้อมูลกิจกรรมสำเร็จ');
                } catch (error) {
                    console.error('Error updating activity:', error);
                    alert('เกิดข้อผิดพลาดในการแก้ไขกิจกรรม: ' + error.message);
                }
            });
        }

        // --- Event Delegation for buttons on activity cards ---
        activityGrid.addEventListener('click', async (e) => {
            const title = e.target.closest('[data-title]')?.dataset.title || e.target.dataset.title;

            // Handle "View Participants" click
            if (e.target.matches('.view-participants-btn') || e.target.closest('.view-participants-btn')) {
                const btn = e.target.matches('.view-participants-btn') ? e.target : e.target.closest('.view-participants-btn');
                const activityTitle = btn.dataset.title;
                showParticipantsModal(activityTitle);
            }

            // Handle "View Hour Requests" click
            if (e.target.matches('.view-hour-requests-btn') || e.target.closest('.view-hour-requests-btn')) {
                const btn = e.target.matches('.view-hour-requests-btn') ? e.target : e.target.closest('.view-hour-requests-btn');
                const activityTitle = btn.dataset.title;
                showHourRequestsModal(activityTitle);
            }

            // Handle "Edit Activity" click
            if (e.target.matches('.edit-activity-btn') || e.target.closest('.edit-activity-btn')) {
                const btn = e.target.matches('.edit-activity-btn') ? e.target : e.target.closest('.edit-activity-btn');
                const activityTitle = btn.dataset.title;
                showEditActivityModal(activityTitle);
            }
            
            // Handle "Archive Activity" click
            if (e.target.matches('.archive-activity-btn') || e.target.closest('.archive-activity-btn')) {
                const btn = e.target.matches('.archive-activity-btn') ? e.target : e.target.closest('.archive-activity-btn');
                const activityTitle = btn.dataset.title;
                archiveActivity(activityTitle);
            }
            
            // Handle "Confirm Completion" click (removed - no longer using localStorage for pending activities)
            // This functionality should be handled through the database if needed
        });
    }

    // --- Details Page Logic (details.html) ---
    // Removed localStorage usage - details page should use API if needed
    const submitCompletionBtn = document.getElementById('submit-completion-btn');
    if (submitCompletionBtn) {
        // This functionality should be implemented using API if needed
        console.warn('Details page logic needs to be updated to use API instead of localStorage');
    }

    // --- Form Link Editing Logic (details.html) ---
    // Removed localStorage usage - form link editing should use API
    const editLinkBtn = document.getElementById('edit-link-btn');
    if (editLinkBtn) {
        // This functionality should be implemented using API if needed
        console.warn('Form link editing logic needs to be updated to use API instead of localStorage');
    }

});