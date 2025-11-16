// API Configuration (รองรับทั้ง local และ production)
const API_BASE_URL = (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') + '/api';

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

// ==================== ACTIVITIES API ====================

export async function getActivities() {
  return await apiCall('/activities');
}

export async function getArchivedActivities() {
  return await apiCall('/activities/archived');
}

export async function getActivity(title) {
  return await apiCall(`/activities/${encodeURIComponent(title)}`);
}

export async function createActivity(activityData) {
  return await apiCall('/activities', {
    method: 'POST',
    body: JSON.stringify(activityData)
  });
}

export async function updateActivity(title, activityData) {
  return await apiCall(`/activities/${encodeURIComponent(title)}`, {
    method: 'PUT',
    body: JSON.stringify(activityData)
  });
}

export async function deleteActivity(title) {
  return await apiCall(`/activities/${encodeURIComponent(title)}`, {
    method: 'DELETE'
  });
}

export async function archiveActivity(title) {
  return await apiCall(`/activities/${encodeURIComponent(title)}/archive`, {
    method: 'POST'
  });
}

export async function restoreActivity(title) {
  return await apiCall(`/activities/${encodeURIComponent(title)}/restore`, {
    method: 'POST'
  });
}

// ==================== PARTICIPANTS API ====================

export async function getParticipants(activityTitle) {
  return await apiCall(`/participants/${encodeURIComponent(activityTitle)}`);
}

export async function addParticipant(participantData) {
  return await apiCall('/participants', {
    method: 'POST',
    body: JSON.stringify(participantData)
  });
}

export async function removeParticipant(activityTitle, studentId) {
  return await apiCall(`/participants/${encodeURIComponent(activityTitle)}/${encodeURIComponent(studentId)}`, {
    method: 'DELETE'
  });
}

// ==================== HOUR REQUESTS API ====================

export async function getHourRequests(activityTitle) {
  return await apiCall(`/hour-requests/${encodeURIComponent(activityTitle)}`);
}

export async function getStudentHourRequests(studentId) {
  return await apiCall(`/hour-requests/student/${encodeURIComponent(studentId)}`);
}

export async function createHourRequest(requestData) {
  return await apiCall('/hour-requests', {
    method: 'POST',
    body: JSON.stringify(requestData)
  });
}

export async function approveHourRequest(requestId) {
  return await apiCall(`/hour-requests/${requestId}/approve`, {
    method: 'POST'
  });
}

export async function rejectHourRequest(requestId) {
  return await apiCall(`/hour-requests/${requestId}/reject`, {
    method: 'POST'
  });
}

// ==================== STUDENTS API ====================

export async function getStudent(studentId) {
  return await apiCall(`/students/${encodeURIComponent(studentId)}`);
}

export async function createOrUpdateStudent(studentData) {
  return await apiCall('/students', {
    method: 'POST',
    body: JSON.stringify(studentData)
  });
}

