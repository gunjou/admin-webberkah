import React, { useState, useEffect, useRef } from "react";
import {
  MdMenu,
  MdDarkMode,
  MdLightMode,
  MdLogout,
  MdPerson,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isDark, setIsDark, toggleSidebar }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Inisialisasi Ref untuk kontainer profile
  const profileRef = useRef(null);

  // 2. Effect untuk menangani klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Jika ref ada dan klik TIDAK berada di dalam elemen ref tersebut
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    // Tambahkan event listener saat dropdown terbuka
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Bersihkan event listener saat komponen unmount atau dropdown tertutup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // Efek untuk mengganti tema (Tetap sama)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="bg-white dark:bg-custom-gelap border-b border-gray-200 dark:border-white/10 h-16 flex items-center justify-between px-6 transition-colors duration-300 relative z-40">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-custom-gelap dark:text-white"
      >
        <MdMenu size={24} />
      </button>

      <div className="flex items-center gap-4">
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
