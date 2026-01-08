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
} from "react-icons/md";

const Sidebar = ({ isOpen, isDark }) => {
  const location = useLocation();
  // Set default terbuka untuk 'Absensi'
  const [openSub, setOpenSub] = useState("Absensi");

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
    {
      name: "Absensi",
      icon: <MdFingerprint />,
      subMenu: [
        { name: "Presensi", path: "/absensi/presensi" },
        { name: "Rekapan", path: "/absensi/rekapan" },
        { name: "Lembur", path: "/absensi/lembur" },
      ],
    },
    // ------------------------
    { name: "Perhitungan Gaji", path: "/gaji", icon: <MdPayments /> },
    { name: "Hutang Pegawai", path: "/hutang", icon: <MdMoneyOff /> },
    { name: "Data Pegawai", path: "/pegawai", icon: <MdPeople /> },
    // --- MENU MASTER BARU ---
    {
      name: "Data Master",
      icon: <MdSettingsSuggest />, // Gunakan icon gear atau modul
      subMenu: [
        { name: "Departemen", path: "/master/departemen" },
        { name: "Jabatan & Level", path: "/master/jabatan" },
        { name: "Lokasi Absensi", path: "/master/lokasi" },
        { name: "Jam Kerja & Libur", path: "/master/jadwal" },
        { name: "Aturan Lembur", path: "/master/rules" },
        { name: "Kategori Izin", path: "/master/kategori" },
      ],
    },
  ];

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 bg-white dark:bg-custom-gelap border-r border-gray-200 dark:border-white/5 flex flex-col z-40`}
    >
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-3 h-20">
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

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.subMenu ? (
              <>
                <button
                  onClick={() =>
                    setOpenSub(openSub === item.name ? "" : item.name)
                  }
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    openSub === item.name
                      ? "text-custom-merah-terang dark:text-custom-cerah bg-gray-50 dark:bg-white/5"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    {isOpen && (
                      <span className="font-semibold text-sm">{item.name}</span>
                    )}
                  </div>
                  {isOpen &&
                    (openSub === item.name ? (
                      <MdExpandMore />
                    ) : (
                      <MdChevronRight />
                    ))}
                </button>

                {isOpen && openSub === item.name && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-white/5 pl-4">
                    {item.subMenu.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`block p-2 text-sm rounded-lg transition-colors ${
                          location.pathname === sub.path
                            ? "text-custom-merah-terang dark:text-custom-cerah font-bold"
                            : "text-gray-500 dark:text-gray-400 hover:text-custom-merah-terang dark:hover:text-white"
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? "bg-custom-merah-terang dark:bg-custom-merah text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && (
                  <span className="font-semibold text-sm">{item.name}</span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
