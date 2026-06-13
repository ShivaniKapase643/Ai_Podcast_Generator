import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for API key and auth token
client.interceptors.request.use(config => {
  const apiKey = localStorage.getItem('apiKey');
  if (apiKey) config.headers['x-api-key'] = apiKey;

  const token = localStorage.getItem('authToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;

  return config;
});

// Response interceptor for error handling
client.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || error.message || 'Network error';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Episodes
export const getEpisodes = (page = 1, limit = 10) =>
  client.get('/episodes', { params: { page, limit } });

export const getEpisode = (id) =>
  client.get(`/episodes/${id}`);

export const deleteEpisode = (id) =>
  client.delete(`/episodes/${id}`);

export const getEpisodeStats = () =>
  client.get('/episodes/stats');

export const getAudioUrl = (id) =>
  `${API_BASE}/episodes/${id}/audio`;

export const getPdfUrl = (id) =>
  `${API_BASE}/episodes/${id}/pdf`;

export const getTranscript = (id) =>
  client.get(`/episodes/${id}/transcript`);

// Generation
export const triggerGeneration = (dryRun = false) =>
  client.post(`/generate${dryRun ? '?dryRun=true' : ''}`);

export const getGenerationStreamUrl = () =>
  `${API_BASE}/generate/stream`;

// News Preview
export const getNewsPreview = () =>
  client.get('/news/preview');

// Subscribers
export const getSubscribers = () =>
  client.get('/subscribers');

export const subscribe = (email, name = '') =>
  client.post('/subscribers', { email, name });

export const unsubscribe = (email) =>
  client.delete(`/subscribers/${encodeURIComponent(email)}`);

// Schedule
export const getScheduleStatus = () =>
  client.get('/schedule/status');

export const toggleSchedule = (enabled) =>
  client.post('/schedule/toggle', { enabled });

// Health
export const healthCheck = () =>
  client.get('/health');

// ─── USER AUTH & PROFILE ─────────────────────────

export const register = (username, email, password, displayName) =>
  client.post('/auth/register', { username, email, password, displayName });

export const login = (emailOrUsername, password) =>
  client.post('/auth/login', { emailOrUsername, password });

export const logout = () =>
  client.post('/auth/logout');

export const getMe = () =>
  client.get('/auth/me');

export const updateProfile = (data) =>
  client.put('/profile', data);

export const changePassword = (currentPassword, newPassword) =>
  client.put('/profile/password', { currentPassword, newPassword });

// ─── BOOKMARKS ──────────────────────────────────

export const getBookmarks = () =>
  client.get('/bookmarks');

export const addBookmark = (episodeId) =>
  client.post(`/bookmarks/${episodeId}`);

export const removeBookmark = (episodeId) =>
  client.delete(`/bookmarks/${episodeId}`);

// ─── LISTENING HISTORY ──────────────────────────

export const getHistory = () =>
  client.get('/history');

export const saveProgress = (episodeId, progressSeconds, completed) =>
  client.post('/history', { episodeId, progressSeconds, completed });

// ─── RATINGS ────────────────────────────────────

export const rateEpisode = (episodeId, rating) =>
  client.post(`/episodes/${episodeId}/rate`, { rating });

export const getEpisodeRating = (episodeId) =>
  client.get(`/episodes/${episodeId}/rating`);

// ─── RECOMMENDATIONS ────────────────────────────

export const getRecommendations = () =>
  client.get('/recommendations');

export default client;
