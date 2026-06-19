import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Required for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('raino_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid retrying for authentication endpoints to prevent infinite refresh loops
    const isAuthRoute =
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/logout');

    // If request failed with 401 (Unauthorized) and was not a retry, and is not an auth route
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using stored refresh token
        const refreshToken = localStorage.getItem('raino_refresh_token');
        const refreshResponse = await api.post('/auth/refresh-token', { refreshToken });
        const { token: newToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

        if (newToken) {
          localStorage.setItem('raino_access_token', newToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('raino_refresh_token', newRefreshToken);
        }

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token also expired -> logout user
        localStorage.removeItem('raino_access_token');
        localStorage.removeItem('raino_refresh_token');
        window.dispatchEvent(new CustomEvent('auth-logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
