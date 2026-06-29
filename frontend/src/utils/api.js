import axios from 'axios';

// In production (Vercel), hit the Render backend directly.
// In local dev, use '/api' to go through the Vite proxy.
const RENDER_URL = 'https://fundmanagement-xlr5.onrender.com';
const BASE = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_URL || RENDER_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queue = [];
const drain = (err, token) => { queue.forEach((p) => (err ? p.reject(err) : p.resolve(token))); queue = []; };

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      if (isRefreshing) return new Promise((res, rej) => queue.push({ resolve: res, reject: rej }))
        .then((t) => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });

      orig._retry = true;
      isRefreshing = true;
      const rf = localStorage.getItem('refreshToken');
      if (!rf) { drain(err); isRefreshing = false; window.location.href = '/login'; return Promise.reject(err); }

      try {
        const { data } = await axios.post(`${BASE}/auth/refresh-token`, { refreshToken: rf });
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        orig.headers.Authorization = `Bearer ${newToken}`;
        drain(null, newToken);
        return api(orig);
      } catch (rfErr) {
        drain(rfErr);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(rfErr);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(err);
  }
);

export default api;
