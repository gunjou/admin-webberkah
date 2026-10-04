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
import NotificationRouter from "./modals/NotificationRouter";
import Api from "../utils/Api";

const Navbar = ({ isDark, setIsDark, toggleSidebar }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const role = user?.role;

  // =======================================================
  // ROLE
  // =======================================================

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isHrisRole = ["HR", "SUPER_ADMIN"].includes(role);
  const isFinanceRole = role === "FINANCE";
  const isContractInvoiceRole = ["CONTRACT", "INVOICE"].includes(role);

  const hasNotification = isHrisRole || isFinanceRole || isContractInvoiceRole;

  // =======================================================
  // NOTIFICATION ENDPOINT
  // =======================================================

  const getNotificationCountEndpoint = () => {
    // -----------------------------------------------------
    // SUPER ADMIN
    // -----------------------------------------------------

    if (isSuperAdmin) {
      // TODO:
      // Endpoint notifikasi SUPER_ADMIN
      return "/dashboard/notifikasi/count";
    }

    // -----------------------------------------------------
    // HR
    // -----------------------------------------------------

    if (role === "HR") {
      // TODO:
      // Endpoint notifikasi HR
      return "/dashboard/notifikasi/count?role=hr";
    }

    // -----------------------------------------------------
    // FINANCE
    // -----------------------------------------------------

    if (role === "FINANCE") {
      // TODO:
      // Endpoint notifikasi FINANCE
      return "/dashboard/notifikasi/count?role=finance";
    }

    // -----------------------------------------------------
    // CONTRACT & INVOICE
    // -----------------------------------------------------

    if (isContractInvoiceRole) {
      // TODO:
      // CONTRACT dan INVOICE menggunakan notifikasi yang sama
      return "/dashboard/notifikasi/count?role=contract_invoice";
    }

    return null;
  };

  // =======================================================
  // FETCH NOTIFICATION COUNT
  // =======================================================

  const fetchNotifCount = async () => {
    if (!hasNotification) {
      setNotifCount(0);
      return;
    }

    setIsRefreshing(true);

    try {
      const endpoint = getNotificationCountEndpoint();

      if (!endpoint) {
        setNotifCount(0);
        return;
      }

      const res = await Api.get(endpoint);

      if (res.data.success) {
        setNotifCount(res.data.data.total || 0);
      }
    } catch (err) {
      console.error("Gagal mengambil notification count:", err);
      setNotifCount(0);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  // =======================================================
  // LOAD NOTIFICATION COUNT
  // =======================================================

  useEffect(() => {
    fetchNotifCount();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // =======================================================
  // CLICK OUTSIDE
  // =======================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =======================================================
  // NOTIFICATION CLICK
  // =======================================================

  const handleNotificationClick = () => {
    if (!hasNotification || isRefreshing) return;

    setNotifOpen((prev) => !prev);
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <header className="bg-white dark:bg-custom-gelap border-b border-gray-200 dark:border-white/10 h-16 flex items-center justify-between px-6 transition-colors duration-300 relative z-200">
      {/* ===================================================
          SIDEBAR TOGGLE
      ==================================================== */}

      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-custom-gelap dark:text-white transition-colors"
        title="Toggle Sidebar"
      >
        <MdMenu size={24} />
      </button>

      {/* ===================================================
          RIGHT SIDE
      ==================================================== */}

      <div className="flex items-center gap-3">
        {/* =================================================
            NOTIFICATION
        ================================================== */}

        {hasNotification && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotificationClick}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-custom-cerah relative transition-all disabled:opacity-70"
              title="Notifikasi"
            >
              {isRefreshing ? (
                <div className="w-6 h-6 border-2 border-custom-merah-terang border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdNotificationsNone size={24} />
              )}

              {!isRefreshing && notifCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-custom-gelap animate-in zoom-in duration-300">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </button>

            <NotificationRouter
              role={role}
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              refreshCount={fetchNotifCount}
            />
          </div>
        )}

        {/* =================================================
            DARK MODE
        ================================================== */}

        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-custom-cerah transition-all"
          title={isDark ? "Gunakan Light Mode" : "Gunakan Dark Mode"}
        >
          {isDark ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
        </button>

        {/* =================================================
            PROFILE
        ================================================== */}

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-custom-merah-terang dark:bg-custom-merah flex items-center justify-center text-white font-black text-xs uppercase">
              {user?.username?.charAt(0) || "A"}
            </div>

            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-custom-gelap dark:text-white leading-none capitalize">
                {user?.display_name || "Admin"}
              </p>

              <p className="text-[9px] text-gray-400 font-black uppercase mt-1 tracking-widest">
                {user?.role || "Administrator"}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#3d2e39] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 mb-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Account
                </p>

                <p className="text-xs font-bold text-custom-gelap dark:text-white mt-1">
                  {user?.display_name || "Administrator"}
                </p>

                <p className="text-[9px] font-black text-custom-merah-terang uppercase mt-1">
                  {user?.role || "Administrator"}
                </p>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <MdPerson className="text-custom-cerah" size={18} />
                Profile Saya
              </button>

              <hr className="my-1 border-gray-100 dark:border-white/10" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <MdLogout size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
