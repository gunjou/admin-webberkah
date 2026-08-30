import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdFingerprint,
  MdPayments,
  MdPeople,
  MdMoneyOff,
  MdExpandMore,
  MdChevronRight,
  MdSettingsSuggest,
  MdBusinessCenter,
  MdReceiptLong,
  MdDescription,
} from "react-icons/md";
import { FaMedal } from "react-icons/fa";
import { hasAccess, ROLE_GROUPS } from "../utils/rbac";

const Sidebar = ({ isOpen, isDark }) => {
  const location = useLocation();

  const [openSub, setOpenSub] = useState("Absensi");

  const menuItems = [
    // =====================================================
    // DASHBOARD
    // =====================================================

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard />,
      allowedRoles: ROLE_GROUPS.HRIS,
    },

    {
      name: "Dashboard Kontrak",
      path: "/dashboard-contract",
      icon: <MdDashboard />,
      allowedRoles: ROLE_GROUPS.CONTRACT,
    },

    {
      name: "Dashboard Invoice",
      path: "/dashboard-invoice",
      icon: <MdDashboard />,
      allowedRoles: ROLE_GROUPS.INVOICE,
    },

    // =====================================================
    // HRIS
    // =====================================================

    {
      name: "Absensi",
      icon: <MdFingerprint />,
      allowedRoles: ROLE_GROUPS.HRIS,

      subMenu: [
        {
          name: "Presensi",
          path: "/absensi/presensi",
        },
        {
          name: "Rekapan",
          path: "/absensi/rekapan",
        },
        {
          name: "Perizinan",
          path: "/absensi/perizinan",
        },
        {
          name: "Lembur",
          path: "/absensi/lembur",
        },
      ],
    },

    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: <FaMedal />,
      allowedRoles: ROLE_GROUPS.HRIS,
    },

    {
      name: "Perhitungan Gaji",
      path: "/gaji",
      icon: <MdPayments />,
      allowedRoles: ROLE_GROUPS.HRIS,
    },

    {
      name: "Hutang Pegawai",
      path: "/hutang",
      icon: <MdMoneyOff />,
      allowedRoles: ROLE_GROUPS.HRIS,
    },

    {
      name: "Data Pegawai",
      path: "/pegawai",
      icon: <MdPeople />,
      allowedRoles: ROLE_GROUPS.HRIS,
    },

    // =====================================================
    // CONTRACT
    // =====================================================

    {
      name: "Work Item",
      path: "/work-item",
      icon: <MdBusinessCenter />,
      allowedRoles: ROLE_GROUPS.CONTRACT,
    },

    {
      name: "Contract",
      path: "/contract",
      icon: <MdDescription />,
      allowedRoles: ROLE_GROUPS.CONTRACT,
    },

    // =====================================================
    // INVOICE
    // =====================================================

    {
      name: "Invoice",
      path: "/invoice",
      icon: <MdReceiptLong />,
      allowedRoles: ROLE_GROUPS.INVOICE,
    },

    // =====================================================
    // MASTER
    // =====================================================

    {
      name: "Data Master",
      icon: <MdSettingsSuggest />,

      subMenu: [
        {
          name: "Departemen",
          path: "/master/departemen",
          allowedRoles: ROLE_GROUPS.HRIS,
        },

        {
          name: "Jabatan & Level",
          path: "/master/jabatan",
          allowedRoles: ROLE_GROUPS.HRIS,
        },

        {
          name: "Lokasi Absensi",
          path: "/master/lokasi",
          allowedRoles: ROLE_GROUPS.HRIS,
        },

        {
          name: "Jam Kerja & Libur",
          path: "/master/jadwal",
          allowedRoles: ROLE_GROUPS.HRIS,
        },

        {
          name: "Aturan Lembur",
          path: "/master/rules",
          allowedRoles: ROLE_GROUPS.HRIS,
        },

        {
          name: "Kategori Izin",
          path: "/master/kategori",
          allowedRoles: ROLE_GROUPS.HRIS,
        },

        {
          name: "Client & PIC",
          path: "/master/client",
          allowedRoles: ROLE_GROUPS.CLIENT,
        },
      ],
    },
  ];

  const visibleMenuItems = menuItems
    .map((item) => {
      // Single menu
      if (!item.subMenu) {
        return hasAccess(item.allowedRoles) ? item : null;
      }

      // Filter submenu
      const visibleSubMenu = item.subMenu.filter((sub) =>
        hasAccess(sub.allowedRoles),
      );

      // Jika tidak ada submenu yang boleh dilihat,
      // parent juga disembunyikan
      if (visibleSubMenu.length === 0) {
        return null;
      }

      return {
        ...item,
        subMenu: visibleSubMenu,
      };
    })
    .filter(Boolean);

  // =======================================================
  // HELPER
  // =======================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  const hasActiveSubMenu = (subMenu) => {
    return subMenu?.some((sub) => location.pathname === sub.path);
  };

  return (
    <aside
      className={`${isOpen ? "w-64" : "w-20"} h-screen flex-shrink-0 transition-all duration-300 bg-white dark:bg-custom-gelap border-r border-gray-200 dark:border-white/5 flex flex-col z-40`}
    >
      {/* ===================================================
          LOGO
      ==================================================== */}

      <div className="p-4 flex items-center gap-3 h-20 flex-shrink-0">
        <div className="w-10 h-10 flex-shrink-0">
          <img
            src={
              process.env.PUBLIC_URL +
              (isDark ? "/images/logo_white.png" : "/images/logo.png")
            }
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {isOpen && (
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg text-custom-merah-terang dark:text-white uppercase tracking-tighter">
              Berkah Angsana
            </span>
          </div>
        )}
      </div>

      {/* ===================================================
          NAVIGATION
      ==================================================== */}

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const active = item.path && isActive(item.path);

          const subActive = item.subMenu && hasActiveSubMenu(item.subMenu);

          return (
            <div key={item.name}>
              {/* =================================================
                  SUB MENU
              ================================================== */}

              {item.subMenu ? (
                <>
                  <button
                    onClick={() =>
                      setOpenSub(openSub === item.name ? "" : item.name)
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      openSub === item.name || subActive
                        ? "text-custom-merah-terang dark:text-custom-cerah bg-gray-50 dark:bg-white/5"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>

                      {isOpen && (
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {isOpen &&
                      (openSub === item.name ? (
                        <MdExpandMore />
                      ) : (
                        <MdChevronRight />
                      ))}
                  </button>

                  {/* =================================================
                      SUB MENU ITEMS
                  ================================================== */}

                  {isOpen && openSub === item.name && (
                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-white/5 pl-4">
                      {item.subMenu.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center gap-2 p-2 text-sm rounded-lg transition-colors ${
                            isActive(sub.path)
                              ? "text-custom-merah-terang dark:text-custom-cerah font-bold bg-custom-merah-terang/5 dark:bg-white/5"
                              : "text-gray-500 dark:text-gray-400 hover:text-custom-merah-terang dark:hover:text-white"
                          }`}
                        >
                          {sub.icon && (
                            <span className="text-base">{sub.icon}</span>
                          )}

                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* =================================================
                   SINGLE MENU
                ================================================== */

                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    active
                      ? "bg-custom-merah-terang dark:bg-custom-merah text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>

                  {isOpen && (
                    <span className="font-semibold text-sm whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
