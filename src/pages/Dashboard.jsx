import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import {
  MdFingerprint,
  MdAccessTime,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdWatchLater,
  MdInfoOutline,
  MdSick,
  MdEventBusy,
  MdArrowForward,
} from "react-icons/md";
import Api from "../utils/Api";
import { formatTerlambat } from "../utils/Helpers";
import LoadingOverlay from "../components/LoadingOverlay";

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("log");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Data States
  const [dataLibur, setDataLibur] = useState([]);
  const [totalPegawai, setTotalPegawai] = useState(0);
  const [dataHadir, setDataHadir] = useState({ items: [], total: 0 });
  const [dataTerlambat, setDataTerlambat] = useState({ items: [], total: 0 });
  const [dataAlpha, setDataAlpha] = useState({ items: [], total: 0 });
  const [dataIzin, setDataIzin] = useState({
    items: [],
    total: 0,
    summary: {},
  });
  const [dataSebaran, setDataSebaran] = useState({
    items: [],
    totalPegawai: 0,
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    data: [],
    type: "",
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        resLibur,
        resCount,
        resHadir,
        resTerlambat,
        resIzin,
        resAlpha,
        resSebaran,
      ] = await Promise.all([
        Api.get("/master/hari-libur"),
        Api.get("/dashboard/pegawai-aktif/count"),
        Api.get("/dashboard/hadir-hari-ini"),
        Api.get("/dashboard/terlambat-hari-ini"),
        Api.get("/dashboard/izin-hari-ini"),
        Api.get("/dashboard/alpha-hari-ini"),
        Api.get("/dashboard/sebaran-lokasi-hari-ini"),
      ]);

      setDataLibur(resLibur.data.data);
      setTotalPegawai(resCount.data.data.total);
      setDataHadir({
        items: resHadir.data.data,
        total: resHadir.data.meta.total,
      });
      setDataTerlambat({
        items: resTerlambat.data.data.items || [],
        total: resTerlambat.data.meta.total,
      });
      setDataIzin({
        items: resIzin.data.data.items || [],
        total: resIzin.data.meta.total,
        summary: resIzin.data.meta.summary,
      });
      setDataAlpha({
        items: resAlpha.data.data.items || [],
        total: resAlpha.data.meta.total,
      });
      setDataSebaran({
        items: resSebaran.data.data.items,
        totalPegawai: resSebaran.data.meta.total_pegawai,
      });
      console.log("Cek Res Libur:", resLibur);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- STATS CARDS CONFIGURATION ---
  const stats = [
    {
      label: "Hadir",
      value: dataHadir.total,
      subValue: `/ ${totalPegawai} Pegawai`,
      icon: <MdFingerprint />,
      color: "bg-blue-500",
      action: () =>
        setModalConfig({
          isOpen: true,
          title: "Detail Hadir Hari Ini",
          data: dataHadir.items,
          type: "HADIR",
        }),
    },
    {
      label: "Terlambat",
      value: dataTerlambat.total,
      subValue: "Butuh Perhatian",
      icon: <MdAccessTime />,
      color: "bg-orange-500",
      action: () =>
        setModalConfig({
          isOpen: true,
          title: "Detail Pegawai Terlambat",
          data: dataTerlambat.items,
          type: "TERLAMBAT",
        }),
    },
    {
      label: "Izin & Sakit",
      value: dataIzin.total,
      subValue: `${dataIzin.summary?.SAKIT || 0} Sakit • ${dataIzin.summary?.IZIN || 0} Izin`,
      icon: <MdSick />,
      color: "bg-green-500",
      action: () =>
        setModalConfig({
          isOpen: true,
          title: "Detail Izin & Sakit",
          data: dataIzin.items,
          type: "IZIN",
        }),
    },
    {
      label: "Alpha",
      value: dataAlpha.total,
      subValue: "Tanpa Keterangan",
      icon: <MdEventBusy />,
      color: "bg-red-500",
      action: () =>
        setModalConfig({
          isOpen: true,
          title: "Detail Pegawai Alpha",
          data: dataAlpha.items,
          type: "ALPHA",
        }),
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
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split("T")[0]; // Format YYYY-MM-DD

      // Cari apakah tanggal ini ada di data libur API
      const holiday = dataLibur.find((h) => h.tanggal === dateStr);
      const isSunday = dateObj.getDay() === 0;
      const isToday = new Date().toDateString() === dateObj.toDateString();

      days.push(
        <div
          key={d}
          className="aspect-square flex flex-col items-center justify-center relative group"
        >
          <button
            className={`
        w-7 h-7 flex items-center justify-center text-[10px] rounded-lg transition-all duration-300 relative
        ${
          isSunday || holiday
            ? "text-red-500 font-bold bg-red-50 dark:bg-red-500/10"
            : "text-custom-gelap dark:text-gray-300 hover:bg-custom-merah-terang hover:text-white"
        }
        ${isToday ? "ring-2 ring-custom-merah-terang ring-offset-2 dark:ring-offset-custom-gelap font-black" : ""}
      `}
          >
            {d}
            {holiday && (
              <span
                className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${holiday.jenis === "internal" ? "bg-blue-500" : "bg-red-500"}`}
              ></span>
            )}
          </button>

          {/* TOOLTIP FIX: Menggunakan z-index tinggi dan posisi yang tidak terpotong */}
          {holiday && (
            <div
              className={`
        absolute z-[999] hidden group-hover:block w-max max-w-[140px] 
        bg-gray-900 text-white text-[9px] font-black p-2 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200
        /* Logika Posisi: Jika tanggal di sisi kanan, tooltip muncul di kiri, dan sebaliknya */
        ${dateObj.getDay() > 3 ? "right-full mr-2" : "left-full ml-2"}
        top-1/2 -translate-y-1/2
      `}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[7px] text-gray-400 uppercase tracking-widest">
                  {holiday.jenis}
                </span>
                <p className="leading-tight">{holiday.nama_libur}</p>
              </div>
              {/* Panah Tooltip */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 border-4 border-transparent ${
                  dateObj.getDay() > 3
                    ? "left-full border-l-gray-900"
                    : "right-full border-r-gray-900"
                }`}
              ></div>
            </div>
          )}
        </div>,
      );
    }
    return days;
  };

  return (
    <div className="space-y-6 pb-0 animate-in fade-in duration-700">
      {/* LOADING SPINNER OVERLAY */}
      {loading && <LoadingOverlay message="Sinkronisasi Data..." />}

      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
            Dashboard Monitoring
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
            Real-time Status Pegawai Berkah Angsana
          </p>
        </div>
      </div>

      {/* Stats Cards Grid - Compact & Eyecatching */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={stat.action}
            className="bg-white dark:bg-custom-gelap p-3.5 rounded-[28px] shadow-sm border border-gray-100 dark:border-white/5 cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
          >
            {/* Background Decorative Element - Dibuat lebih kecil & halus */}
            <div
              className={`absolute -right-3 -top-3 w-12 h-12 rounded-full ${stat.color} opacity-[0.12] group-hover:scale-150 transition-transform duration-500`}
            ></div>

            <div className="flex items-center gap-3 mb-2">
              {/* Icon Container - Ukuran dikurangi sedikit (p-3 -> p-2.5) */}
              <div
                className={`flex-shrink-0 p-2.5 rounded-[15px] text-white ${stat.color} shadow-lg shadow-inherit/20 transition-transform duration-300 group-hover:rotate-[-5deg]`}
              >
                {React.cloneElement(stat.icon, { size: 18 })}
              </div>

              {/* Label Next to Icon - Font sedikit lebih kecil (12px -> 10px) */}
              <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[1.2px] leading-none">
                  {stat.label}
                </p>
              </div>
            </div>

            {/* Value & SubValue - Gap dirapatkan */}
            <div className="flex items-baseline gap-2 pl-0.5">
              <h3 className="text-2xl font-black text-custom-gelap dark:text-white leading-none tracking-tighter">
                {stat.value}
              </h3>
              <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-white/5">
                {stat.subValue}
              </span>
            </div>

            {/* Floating Arrow Icon - Disesuaikan posisinya */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              <MdArrowForward className="text-gray-400" size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Monitoring Section (2/3) - FIXED HEIGHT & SCROLLABLE */}
        <div className="lg:col-span-2 relative h-full">
          <div className="bg-white dark:bg-custom-gelap rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-full max-h-[400px]">
            {" "}
            {/* Tinggi dikurangi dari 440 ke 400 */}
            {/* LOADING OVERLAY */}
            {loading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-custom-gelap/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[3px] text-custom-cerah">
                  Singkronisasi Lokasi...
                </span>
              </div>
            )}
            {/* Header & Toggle Area */}
            <div className="p-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
              <div>
                <h3 className="text-xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
                  Monitoring Kehadiran
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Update Terakhir: {new Date().toLocaleTimeString("id-ID")} WITA
                </p>
              </div>

              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-full sm:w-auto border border-gray-200 dark:border-white/10">
                <button
                  onClick={() => setViewMode("log")}
                  className={`flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    viewMode === "log"
                      ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-md"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Log Absensi
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={`flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    viewMode === "chart"
                      ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-md"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Sebaran Lokasi
                </button>
              </div>
            </div>
            {/* Scrollable Content Area - Lebih Padat */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
              {viewMode === "log" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white dark:bg-custom-gelap z-20">
                      <tr className="text-[9px] uppercase tracking-[2px] text-gray-400 border-b border-gray-50 dark:border-white/5">
                        <th className="pb-3 font-black">Pegawai</th>
                        <th className="pb-3 font-black text-center">Waktu</th>
                        <th className="pb-3 font-black text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                      {dataHadir.items.length > 0 ? (
                        [...dataHadir.items]
                          .reverse()
                          .slice(0, 15)
                          .map((row) => (
                            <tr
                              key={row.id_absensi}
                              className="group hover:bg-gray-50/50 transition-colors"
                            >
                              {/* Padding dikurangi dari py-4 ke py-2.5 */}
                              <td className="py-2.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-custom-merah-terang uppercase">
                                    {row.nama_panggilan.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-custom-gelap dark:text-gray-200 uppercase leading-none">
                                      {row.nama_lengkap}
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">
                                      {row.nama_departemen}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 text-center">
                                <span
                                  className={`text-[11px] font-black tracking-widest ${row.menit_terlambat > 0 ? "text-red-500" : "text-custom-gelap dark:text-gray-300"}`}
                                >
                                  {row.jam_checkin}
                                </span>
                              </td>
                              <td className="py-2.5 text-right">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border ${
                                    row.menit_terlambat === 0
                                      ? "bg-green-100 text-green-600 border-green-200/50"
                                      : "bg-red-100 text-red-600 border-red-200/50"
                                  }`}
                                >
                                  {row.menit_terlambat === 0
                                    ? "Tepat"
                                    : `Telat`}
                                </span>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-widest"
                          >
                            Belum ada absensi masuk
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* --- Sebaran Lokasi Versi Kecil --- */
                <div className="space-y-4 py-4">
                  {dataSebaran.items.map((item, i) => {
                    const percentage = Math.round(
                      (item.total / dataSebaran.totalPegawai) * 100,
                    );
                    return (
                      <div key={item.id_lokasi} className="space-y-1 group">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className="text-custom-gelap dark:text-white">
                            {item.nama_lokasi}
                          </span>
                          <span className="text-gray-400">
                            {item.total} Pegawai • {percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden border border-gray-200/50 dark:border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-custom-merah-terang to-custom-cerah transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Footer Area */}
            <div className="p-5 border-t border-gray-50 dark:border-white/5 bg-gray-50/10 dark:bg-black/20 flex-shrink-0 flex justify-between items-center">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                PT. Berkah Angsana System v2.0
              </p>
              <button
                onClick={() => navigate("/absensi/presensi")}
                className="text-[10px] font-black text-custom-merah-terang hover:underline hover:scale-105 active:scale-95 uppercase tracking-[2px] transition-all cursor-pointer"
              >
                Detail Laporan →
              </button>
            </div>
          </div>
        </div>

        {/* Kalender Kerja (1/3) - Versi Compact */}
        <div className="bg-white dark:bg-custom-gelap rounded-[30px] p-5 shadow-sm border border-gray-100 dark:border-white/5 lg:sticky lg:top-6 flex flex-col overflow-visible h-fit max-h-[400px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="leading-tight">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Kalender Kerja
              </h4>
              <p className="text-sm font-black text-custom-merah-terang uppercase">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
                  )
                }
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400"
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
                  )
                }
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400"
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Grid Nama Hari */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2 flex-shrink-0">
            {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
              <span
                key={i}
                className={`text-[9px] font-black ${i === 0 ? "text-red-500" : "text-gray-400"}`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Grid Tanggal - Scrollable if content exceeds */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>

          {/* Keterangan - Disederhanakan & Tanpa Button */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/5 p-2 rounded-xl border border-red-100 dark:border-red-500/10">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-[8px] font-black text-red-600 uppercase">
                  Libur Nasional
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/5 p-2 rounded-xl border border-blue-100 dark:border-blue-500/10">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-[8px] font-black text-blue-600 uppercase">
                  Event Kantor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DINAMIS --- */}
      {modalConfig.isOpen && (
        <DashboardDetailModal
          config={modalConfig}
          onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        />
      )}
    </div>
  );
};

// --- MODAL DETAIL DINAMIS ---
const DashboardDetailModal = ({ config, onClose }) => {
  // Fungsi untuk handle klik pada area hitam (overlay)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="bg-white dark:bg-custom-gelap w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/20">
        <div className="p-8 flex justify-between items-center bg-custom-gelap text-white">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              {config.title}
            </h2>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
              PT. Berkah Angsana • {config.data.length} Orang
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-transparent custom-scrollbar">
          <div className="grid gap-3">
            {config.data.length > 0 ? (
              config.data.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-[25px] border border-gray-100 dark:border-white/5 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-custom-merah-terang text-white flex items-center justify-center font-black text-xs uppercase">
                      {item.nama_panggilan?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black dark:text-white uppercase leading-tight">
                        {item.nama_lengkap}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">
                        {item.nip} • {item.nama_departemen}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {config.type === "HADIR" && (
                      <div className="flex flex-col items-end">
                        {/* Label kecil di atas jam */}
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">
                          Jam Masuk
                        </p>
                        <div className="flex items-center gap-1.5">
                          <MdWatchLater
                            className={
                              item.menit_terlambat > 0
                                ? "text-red-500"
                                : "text-blue-500"
                            }
                            size={14}
                          />
                          <span
                            className={`text-[11px] font-black tracking-tight ${
                              item.menit_terlambat > 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-custom-gelap dark:text-white"
                            }`}
                          >
                            {item.jam_checkin}
                          </span>
                        </div>

                        {/* Tambahkan indikator menit terlambat kecil jika ada */}
                        {item.menit_terlambat > 0 && (
                          <span className="text-[7px] font-black text-red-500/70 uppercase mt-0.5">
                            Terlambat {formatTerlambat(item.menit_terlambat)}
                          </span>
                        )}
                      </div>
                    )}
                    {config.type === "TERLAMBAT" && (
                      <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">
                          Terlambat
                        </p>
                        <span className="text-[9px] font-black text-orange-600 bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded-md border border-orange-200/50 dark:border-orange-500/20">
                          {formatTerlambat(item.menit_terlambat)}
                        </span>
                      </div>
                    )}
                    {config.type === "IZIN" && (
                      <div className="text-right flex flex-col items-end gap-1.5">
                        {/* Highlight Kategori Izin */}
                        <span
                          className={`text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase border ${
                            item.kategori_izin === "SAKIT"
                              ? "bg-green-100 text-green-600 border-green-200/50 dark:bg-green-500/10 dark:text-green-400"
                              : "bg-orange-100 text-orange-600 border-orange-200/50 dark:bg-orange-500/10 dark:text-orange-400"
                          }`}
                        >
                          {item.kategori_izin}
                        </span>

                        {/* Keterangan di bawah Badge */}
                        <p className="text-[10px] text-gray-400 font-bold italic max-w-[180px] leading-tight line-clamp-2">
                          "{item.keterangan || "Tanpa keterangan tambahan"}"
                        </p>
                      </div>
                    )}
                    {config.type === "ALPHA" && (
                      <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md max-w-[180px] uppercase tracking-tighter">
                        Tidak Absen
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-30 flex flex-col items-center">
                <MdInfoOutline size={48} />
                <p className="text-[10px] font-black uppercase mt-2">
                  Tidak ada data untuk kategori ini
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Dashboard;
