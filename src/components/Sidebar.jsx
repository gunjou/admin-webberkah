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
  MdRequestPage,
  MdRequestQuote,
  MdAssignmentTurnedIn,
} from "react-icons/md";
import { FaMedal } from "react-icons/fa";
import { hasAccess, ROLE_GROUPS, ROLES, getUserRole } from "../utils/rbac";

const Sidebar = ({ isOpen, isDark }) => {
  const location = useLocation();

  // =======================================================
  // USER ROLE
  // =======================================================

  const userRole = getUserRole();
  const isSuperAdmin = userRole === ROLES.SUPER_ADMIN;

  // =======================================================
  // SUB MENU STATE
  // Default collapse
  // =======================================================

  const [openSub, setOpenSub] = useState("");

  // =======================================================
  // CATEGORY HELPER
  // =======================================================

  const getCategory = (category) => {
    if (typeof category === "function") {
      return category(userRole);
    }

    return category;
  };

  // =======================================================
  // MENU ITEMS
  // =======================================================

  const menuItems = [
    // =====================================================
    // DASHBOARD
    // =====================================================

    {
      category: "Dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard />,
      allowedRoles: [ROLES.SUPER_ADMIN],
    },

    {
      category: "Dashboard",
      name: "Dashboard",
      path: "/dashboard-hr",
      icon: <MdDashboard />,
      allowedRoles: [ROLES.HR],
    },

    {
      category: "Dashboard",
      name: "Dashboard",
      path: "/dashboard-finance",
      icon: <MdDashboard />,
      allowedRoles: [ROLES.FINANCE],
    },

    {
      category: "Dashboard",
      name: "Dashboard",
      path: "/dashboard-contract",
      icon: <MdDashboard />,
      allowedRoles: [ROLES.CONTRACT],
    },

    {
      category: "Dashboard",
      name: "Dashboard",
      path: "/dashboard-invoice",
      icon: <MdDashboard />,
      allowedRoles: [ROLES.INVOICE],
    },

    // =====================================================
    // HRIS
    // =====================================================

    {
      category: (role) =>
        role === ROLES.SUPER_ADMIN ? "HRIS & Finance" : "HRIS",

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
      category: (role) => {
        if (role === ROLES.SUPER_ADMIN) return "HRIS & Finance";
        if (role === ROLES.HR) return "HRIS";
        if (role === ROLES.FINANCE) return "Finance";

        return null;
      },

      name: "Data Pegawai",
      path: "/pegawai",
      icon: <MdPeople />,
      allowedRoles: ROLE_GROUPS.HRIS_FINANCE,
    },

    {
      category: (role) =>
        role === ROLES.SUPER_ADMIN ? "HRIS & Finance" : "Finance",

      name: "Pengajuan",
      path: "/pengajuan",
      icon: <MdRequestPage />,
      allowedRoles: ROLE_GROUPS.FINANCE,
    },

    {
      category: (role) =>
        role === ROLES.SUPER_ADMIN ? "HRIS & Finance" : "HRIS",

      name: "Leaderboard",
      path: "/leaderboard",
      icon: <FaMedal />,
      allowedRoles: ROLE_GROUPS.HRIS,
    },

    {
      category: (role) => {
        if (role === ROLES.SUPER_ADMIN) return "HRIS & Finance";
        if (role === ROLES.HR) return "HRIS";
        if (role === ROLES.FINANCE) return "Finance";

        return null;
      },

      name: "Perhitungan Gaji",
      path: "/gaji",
      icon: <MdPayments />,
      allowedRoles: ROLE_GROUPS.HRIS_FINANCE,
    },

    {
      category: (role) => {
        if (role === ROLES.SUPER_ADMIN) return "HRIS & Finance";
        if (role === ROLES.HR) return "HRIS";
        if (role === ROLES.FINANCE) return "Finance";

        return null;
      },

      name: "Hutang Pegawai",
      path: "/hutang",
      icon: <MdMoneyOff />,
      allowedRoles: ROLE_GROUPS.HRIS_FINANCE,
    },

    // =====================================================
    // CONTRACT & INVOICE
    // =====================================================

    {
      category: "Contract & Invoice",
      name: "Pekerjaan",
      path: "/work-item",
      icon: <MdBusinessCenter />,
      allowedRoles: ROLE_GROUPS.CONTRACT_INVOICE,
    },

    {
      category: "Contract & Invoice",
      name: "Penawaran",
      path: "/quotation",
      icon: <MdRequestQuote />,
      allowedRoles: ROLE_GROUPS.CONTRACT_INVOICE,
    },

    {
      category: "Contract & Invoice",
      name: "Kontrak",
      path: "/contract",
      icon: <MdDescription />,
      allowedRoles: ROLE_GROUPS.CONTRACT_INVOICE,
    },

    {
      category: "Contract & Invoice",
      name: "BA",
      path: "/completion",
      icon: <MdAssignmentTurnedIn />,
      allowedRoles: ROLE_GROUPS.CONTRACT_INVOICE,
    },

    {
      category: "Contract & Invoice",
      name: "Invoice",
      path: "/invoice",
      icon: <MdReceiptLong />,
      allowedRoles: ROLE_GROUPS.CONTRACT_INVOICE,
    },

    // =====================================================
    // MASTER
    // =====================================================

    {
      category: "Master",
      name: "Data Master",
      icon: <MdSettingsSuggest />,

      subMenu: [
        // -------------------------------------------------
        // HRIS MASTER
        // -------------------------------------------------

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

        // -------------------------------------------------
        // CONTRACT & INVOICE MASTER
        // -------------------------------------------------

        {
          name: "Client & PIC",
          path: "/master/client",
          allowedRoles: ROLE_GROUPS.CONTRACT_INVOICE,
        },
      ],
    },
  ];

  // =======================================================
  // FILTER MENU BERDASARKAN ROLE
  // =======================================================

  const visibleMenuItems = menuItems
    .map((item) => {
      // ---------------------------------------------------
      // SUPER ADMIN
      // Hanya boleh melihat dashboard utama
      // ---------------------------------------------------

      if (
        isSuperAdmin &&
        item.category === "Dashboard" &&
        item.path !== "/dashboard"
      ) {
        return null;
      }

      // ---------------------------------------------------
      // SINGLE MENU
      // ---------------------------------------------------

      if (!item.subMenu) {
        return hasAccess(item.allowedRoles) ? item : null;
      }

      // ---------------------------------------------------
      // SUB MENU
      // ---------------------------------------------------

      const visibleSubMenu = item.subMenu.filter((sub) =>
        hasAccess(sub.allowedRoles),
      );

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

  // =======================================================
  // RENDER
  // =======================================================

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

      <nav className="flex-1 px-4 mt-4 overflow-y-auto pb-12">
        {visibleMenuItems.map((item, index) => {
          const active = item.path && isActive(item.path);
          const subActive = item.subMenu && hasActiveSubMenu(item.subMenu);

          const previousItem = visibleMenuItems[index - 1];

          // -------------------------------------------------
          // CATEGORY
          // -------------------------------------------------

          const currentCategory = getCategory(item.category);

          const previousCategory = previousItem
            ? getCategory(previousItem.category)
            : null;

          const showCategory =
            currentCategory && currentCategory !== previousCategory;

          return (
            <React.Fragment key={item.path || item.name}>
              {/* =================================================
                  CATEGORY
              ================================================== */}

              {showCategory && (
                <div
                  className={`${
                    index === 0
                      ? ""
                      : "mt-6 pt-4 border-t border-gray-100 dark:border-white/5"
                  } mb-2 px-2`}
                >
                  {isOpen && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {currentCategory}
                    </span>
                  )}
                </div>
              )}

              <div className="mb-1">
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
                        <span className="text-xl flex-shrink-0">
                          {item.icon}
                        </span>

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
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
