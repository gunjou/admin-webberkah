import React, { useState, useEffect, useRef } from "react";
import {
  MdMenu,
  MdDarkMode,
  MdLightMode,
  MdLogout,
  MdPerson,
  MdNotificationsNone,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import NotificationModal from "./modals/NotificationModal";
import Api from "../utils/Api";

const Navbar = ({ isDark, setIsDark, toggleSidebar }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // FUNGSI REFRESH COUNT
  const fetchNotifCount = async () => {
    setIsRefreshing(true); // Mulai loading
    try {
      const res = await Api.get("/dashboard/notifikasi/count");
      if (res.data.success) {
        setNotifCount(res.data.data.total);
      }
    } catch (err) {
      console.error("Gagal mengambil count:", err);
    } finally {
      // Beri sedikit delay (misal 500ms) agar transisi spinner terlihat smooth
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Panggil saat pertama kali load aplikasi
  useEffect(() => {
    fetchNotifCount();
  }, []);

  // Handle Klik Luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-custom-gelap border-b border-gray-200 dark:border-white/10 h-16 flex items-center justify-between px-6 transition-colors duration-300 relative z-200">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-custom-gelap dark:text-white"
      >
        <MdMenu size={24} />
      </button>

      <div className="flex items-center gap-4">
        {/* BELL NOTIFICATION */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-custom-cerah relative transition-all"
          >
            {/* LOGIKA IKON: Tampilkan Spinner jika sedang refresh, jika tidak tampilkan Lonceng */}
            {isRefreshing ? (
              <div className="w-6 h-6 border-2 border-custom-merah-terang border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MdNotificationsNone size={24} />
            )}

            {/* Badge Angka (Sembunyikan saat refresh agar tidak tumpang tindih) */}
            {!isRefreshing && notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-custom-gelap animate-in zoom-in duration-300">
                {notifCount}
              </span>
            )}
          </button>

          <NotificationModal
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onAction={(id, status, type) => console.log(id, status, type)}
            refreshCount={fetchNotifCount}
          />
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-custom-cerah transition-all"
        >
          {isDark ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
        </button>

        {/* 3. Bungkus Profile dengan Ref */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-custom-merah-terang dark:bg-custom-merah flex items-center justify-center text-white font-black text-xs uppercase">
              {user?.username?.charAt(0) || "A"}
            </div>

            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-custom-gelap dark:text-white leading-none capitalize">
                {user?.account_type || "Admin"}
              </p>
              <p className="text-[9px] text-gray-400 font-black uppercase mt-1 tracking-widest">
                {user?.role || "Administrator"}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#3d2e39] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10 mb-1">
                <p className="text-[10px] font-black text-custom-merah-terang uppercase">
                  Username: {user?.username}
                </p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <MdPerson className="text-custom-cerah" size={18} /> Profile
                Saya
              </button>
              <hr className="my-1 border-gray-100 dark:border-white/10" />
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <MdLogout size={18} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
