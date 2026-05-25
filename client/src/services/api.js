const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const api = {
  // --- QUESTIONS ---
  getQuestions: async () => {
    const res = await fetch(`${BASE_URL}/questions`);
    return handleResponse(res);
  },
  
  addQuestion: async (questionData) => {
    const res = await fetch(`${BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData)
    });
    return handleResponse(res);
  },

  // --- PROGRESS ---
  getProgress: async (userId) => {
    const res = await fetch(`${BASE_URL}/progress/${userId}`);
    return handleResponse(res);
  },

  updateProgress: async (userId, questionId, progressData) => {
    const res = await fetch(`${BASE_URL}/progress/${userId}/${questionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressData)
    });
    return handleResponse(res);
  },

  // --- RECOMMENDATIONS ---
  getDailyRecommendations: async (userId) => {
    const res = await fetch(`${BASE_URL}/recommendations/${userId}`);
    return handleResponse(res);
  },

  getQuestionRecommendations: async (userId, questionId) => {
    const res = await fetch(`${BASE_URL}/recommendations/${userId}/${questionId}`);
    return handleResponse(res);
  },

  // --- USERS ---
  getUsers: async () => {
    const res = await fetch(`${BASE_URL}/users`);
    return handleResponse(res);
  },

  createUser: async (username, email) => {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    return handleResponse(res);
  },

  updateUser: async (userId, userData) => {
    const res = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  syncLeetCode: async (userId, username) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/sync/leetcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return handleResponse(res);
  },

  syncCodeChef: async (userId, username) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/sync/codechef`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return handleResponse(res);
  },

  syncCodeChefManual: async (userId, username, problemsText) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/sync/codechef/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, problemsText })
    });
    return handleResponse(res);
  },

  disconnectPlatform: async (userId, platform) => {
    const res = await fetch(`${BASE_URL}/users/${userId}/disconnect/${platform}`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
export default api;
