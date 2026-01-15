import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL;
// const baseURL = "http://127.0.0.1:5000";
const Api = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
});

// Flag untuk mencegah loop refresh yang tidak berakhir
let isRefreshing = false;
let refreshSubscribers = [];

// Fungsi untuk mengulangi request yang tertunda setelah token diperbarui
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

// 1. Interceptor Request: Tambahkan token ke setiap header
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor Response: Handle Token Expired & Refresh
Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // Jika status 401 (Unauthorized)
    if (response?.status === 401) {
      // Kondisi A: Token expired tapi ada Refresh Token (Coba perbarui)
      const isExpired =
        response.data?.message?.includes("expired") ||
        response.data?.status === "Token expired";

      if (isExpired && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(Api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          handleForceLogout("Sesi berakhir. Silakan login kembali.");
          return Promise.reject(error);
        }

        try {
          const res = await axios.post(
            `${baseURL}/auth/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );

          if (res.data.success) {
            const newToken = res.data.data.access_token;
            localStorage.setItem("token", newToken);
            isRefreshing = false;
            onRefreshed(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return Api(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          handleForceLogout("Sesi kedaluwarsa. Silakan login ulang.");
          return Promise.reject(refreshError);
        }
      }

      // Kondisi B: Token tidak valid sama sekali atau Refresh Token gagal
      else if (!originalRequest._retry) {
        handleForceLogout("Sesi tidak valid. Silakan login ulang.");
      }
    }

    return Promise.reject(error);
  }
);

const handleForceLogout = (message) => {
  // Gunakan flag agar alert tidak muncul berkali-kali jika ada banyak request gagal bersamaan
  if (!window.isLoggingOut) {
    window.isLoggingOut = true;
    alert(message);
    localStorage.clear(); // Hapus semua (token, user data, dll)
    window.location.href = "/login"; // Force redirect ke login
  }
};

export default Api;
