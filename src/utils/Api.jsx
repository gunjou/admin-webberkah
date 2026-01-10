import axios from "axios";

// const baseURL = process.env.REACT_APP_API_URL;
const baseURL = "http://127.0.0.1:5000";
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

    // Cek jika status 401 dan bukan sedang mencoba login
    if (response?.status === 401 && !originalRequest._retry) {
      // Jika pesan error spesifik mengarah ke token expired
      const statusMessage = response.data?.status;

      if (
        statusMessage === "Token expired, Login ulang" ||
        response.data?.message?.includes("expired")
      ) {
        if (isRefreshing) {
          // Jika sedang proses refresh, masukkan request ini ke antrian
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
          // Panggil API Refresh Token
          // Pastikan header Authorization berisi Refresh Token (tergantung backend Anda)
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

            // Ulangi request asli dengan token baru
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return Api(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          handleForceLogout("Sesi kedaluwarsa. Silakan login ulang.");
          return Promise.reject(refreshError);
        }
      }
    }

    // Jika error lainnya (misal: password salah saat login)
    return Promise.reject(error);
  }
);

// Helper function untuk logout paksa
const handleForceLogout = (message) => {
  alert(message);
  localStorage.clear();
  window.location.replace("/login");
};

export default Api;
