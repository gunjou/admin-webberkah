import React, { useState } from "react";
import {
  MdPeople,
  MdFingerprint,
  MdAccessTime,
  MdAssignmentLate,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState("log");
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- DATA DUMMY ---
  const stats = [
    {
      label: "Total Pegawai",
      value: "154",
      icon: <MdPeople />,
      color: "bg-blue-500",
      trend: "+2",
    },
    {
      label: "Hadir Hari Ini",
      value: "142",
      icon: <MdFingerprint />,
      color: "bg-green-500",
      trend: "92%",
    },
    {
      label: "Terlambat",
      value: "12",
      icon: <MdAccessTime />,
      color: "bg-orange-500",
      trend: "-3%",
    },
    {
      label: "Persetujuan",
      value: "8",
      icon: <MdAssignmentLate />,
      color: "bg-custom-merah-terang",
      trend: "8",
    },
  ];

  const recentAbsensi = [
    {
      id: 1,
      nama: "Andi Pratama",
      jam: "07:55",
      status: "Tepat Waktu",
      dept: "Operational",
    },
    {
      id: 2,
      nama: "Siti Aminah",
      jam: "08:05",
      status: "Terlambat",
      dept: "Finance",
    },
    {
      id: 3,
      nama: "Budi Santoso",
      jam: "07:45",
      status: "Tepat Waktu",
      dept: "IT Support",
    },
    {
      id: 4,
      nama: "Dewi Lestari",
      jam: "08:15",
      status: "Terlambat",
      dept: "Operational",
    },
    {
      id: 5,
      nama: "Rahmat Hidayat",
      jam: "07:30",
      status: "Tepat Waktu",
      dept: "Security",
    },
    {
      id: 6,
      nama: "Linda Permata",
      jam: "08:20",
      status: "Terlambat",
      dept: "HRD",
    },
    {
      id: 7,
      nama: "Eko Prasetyo",
      jam: "07:50",
      status: "Tepat Waktu",
      dept: "Operational",
    },
    {
      id: 8,
      nama: "Maya Sari",
      jam: "07:58",
      status: "Tepat Waktu",
      dept: "Finance",
    },
  ];

  // --- LOGIKA KALENDER ---
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d);
      const isSunday = dateStr.getDay() === 0;
      const isToday = new Date().toDateString() === dateStr.toDateString();

      days.push(
        <div
          key={d}
          className="aspect-square flex flex-col items-center justify-center relative"
        >
          <button
            className={`
            w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-xs rounded-xl transition-all duration-300
            ${
              isSunday
                ? "text-red-500 font-bold bg-red-50 dark:bg-red-500/10"
                : "text-custom-gelap dark:text-gray-300 hover:bg-custom-merah-terang hover:text-white"
            }
            ${
              isToday
                ? "ring-2 ring-custom-merah-terang ring-offset-2 dark:ring-offset-custom-gelap font-black"
                : ""
            }
          `}
          >
            {d}
          </button>
          {!isSunday && d % 5 === 0 && (
            <div className="absolute bottom-1 w-1 h-1 bg-blue-400 rounded-full"></div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6 pb-0 animate-in fade-in duration-700">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitoring aktivitas Berkah Angsana secara real-time.
        </p>
      </div>

      {/* Stats Cards Grid - Versi Ringkas & Horizontal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-custom-gelap p-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4 transition-all hover:translate-y-[-2px]"
          >
            <div
              className={`flex-shrink-0 p-2.5 rounded-xl text-white ${stat.color} shadow-lg shadow-inherit/20`}
            >
              {React.cloneElement(stat.icon, { size: 20 })}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
                {stat.label}
              </p>
              <h3 className="text-xl font-black text-custom-gelap dark:text-white leading-tight">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Monitoring Section (2/3) - FIXED HEIGHT & SCROLLABLE */}
        <div className="lg:col-span-2 h-full">
          <div className="bg-white dark:bg-custom-gelap rounded-[35px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-full min-h-[300px] max-h-[440px]">
            {/* Header & Toggle Area (Static) */}
            <div className="p-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
              <h3 className="text-xl font-bold text-custom-gelap dark:text-white">
                Monitoring Kehadiran
              </h3>
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-full sm:w-auto">
                <button
                  onClick={() => setViewMode("log")}
                  className={`flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    viewMode === "log"
                      ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Absensi Terbaru
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    viewMode === "chart"
                      ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Sebaran Lokasi
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
              {viewMode === "log" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead className="sticky top-0 bg-white dark:bg-custom-gelap z-20">
                      <tr className="text-[10px] uppercase tracking-[2px] text-gray-400">
                        <th className="pb-4 font-semibold">Pegawai</th>
                        <th className="pb-4 font-semibold">Waktu</th>
                        <th className="pb-4 font-semibold text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {recentAbsensi.map((row) => (
                        <tr
                          key={row.id}
                          className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center text-xs font-black shadow-sm uppercase">
                                {row.nama.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-custom-gelap dark:text-gray-200">
                                  {row.nama}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium">
                                  {row.dept}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-semibold dark:text-gray-300 tracking-wider">
                            {row.jam}
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                                row.status === "Tepat Waktu"
                                  ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-200/50"
                                  : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200/50"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-6 py-6">
                  {[
                    {
                      label: "Kantor Pusat",
                      value: 85,
                      color: "bg-custom-merah-terang",
                      count: "120 Pegawai",
                    },
                    {
                      label: "Gudang Logistic",
                      value: 60,
                      color: "bg-custom-cerah",
                      count: "45 Pegawai",
                    },
                    {
                      label: "Remote / Luar Kota",
                      value: 15,
                      color: "bg-custom-gelap dark:bg-white/20",
                      count: "12 Pegawai",
                    },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-bold text-custom-gelap dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {item.count}
                          </p>
                        </div>
                        <span className="text-xs font-black text-custom-merah-terang">
                          {item.value}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all duration-1000`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Area (Static) */}
            <div className="p-4 border-t border-gray-50 dark:border-white/5 bg-gray-50/10 dark:bg-black/20 flex-shrink-0 text-center">
              <button className="text-[10px] font-black text-gray-400 hover:text-custom-merah-terang uppercase tracking-[3px] transition-all">
                Lihat Laporan Lengkap →
              </button>
            </div>
          </div>
        </div>

        {/* Kalender Kerja (1/3) - Versi Compact */}
        <div className="bg-white dark:bg-custom-gelap rounded-[30px] p-5 shadow-sm border border-gray-100 dark:border-white/5 h-fit lg:sticky lg:top-6">
          {/* Header: Dibuat lebih rapat */}
          <div className="flex justify-between items-center mb-4">
            <div className="leading-tight">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Kalender
              </h4>
              <p className="text-sm font-black text-custom-merah-terang uppercase">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                  )
                }
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400"
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                  )
                }
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400"
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Grid Nama Hari - Ukuran font diperkecil */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
              <span
                key={i}
                className={`text-[9px] font-black ${
                  i === 0 ? "text-custom-merah-terang" : "text-gray-400"
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Grid Tanggal - Padding aspect-square dikurangi */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}{" "}
            {/* Pastikan di renderCalendar() ukuran button diperkecil menjadi w-7 h-7 */}
          </div>

          {/* Keterangan & Action - Disederhanakan */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
                  <span className="w-2 h-2 bg-red-500 rounded-sm"></span> Libur
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
                  <span className="w-2 h-2 bg-blue-400 rounded-sm"></span> Hadir
                </div>
              </div>
            </div>

            <button className="w-full py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-custom-merah-terang hover:text-white text-custom-gelap dark:text-gray-300 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-transparent hover:border-custom-merah-terang shadow-sm">
              Kelola Libur & Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
