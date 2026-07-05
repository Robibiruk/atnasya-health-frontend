// Axios instance — auto-attaches Firebase token, redirects on 401.
import axios, { AxiosError } from "axios";
import { auth } from "./firebase";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach the current Firebase user's ID token.
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // token refresh failed; request proceeds unauthenticated and 401 handles it
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: redirect to /login on 401 from protected endpoints only.
// Do NOT redirect on 401 from /auth/register (registration may fail for other reasons).
// Avoid redirect storms during auth initialization or when already on /login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const onLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";
    if (status === 401 && !url.includes("/auth/register") && !url.includes("/auth/me") && !onLoginPage) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
