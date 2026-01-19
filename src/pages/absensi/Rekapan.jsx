import React, { useState, useEffect, useCallback } from "react";
import { MdSearch, MdFileDownload } from "react-icons/md";
import Api from "../../utils/Api";

const Rekapan = () => {
  const [loading, setLoading] = useState(false);
  const [dataRekapan, setDataRekapan] = useState([]);
  const [masterDept, setMasterDept] = useState([]);
  const [masterStatus, setMasterStatus] = useState([]);

  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    id_departemen: "",
    id_status_pegawai: "",
    search: "",
  });

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

  const daysInMonth = new Date(filter.tahun, filter.bulan, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [resDept, resStatus] = await Promise.all([
          Api.get("/master/departemen"),
          Api.get("/master/status-pegawai"),
        ]);
        setMasterDept(resDept.data.data);
        setMasterStatus(resStatus.data.data);
      } catch (err) {
        console.error("Gagal load master data", err);
      }
    };
    fetchMaster();
  }, []);

  const fetchRekapan = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        bulan: filter.bulan,
        tahun: filter.tahun,
      };
      if (filter.id_departemen) params.id_departemen = filter.id_departemen;
      if (filter.id_status_pegawai)
        params.id_status_pegawai = filter.id_status_pegawai;
      if (filter.search) params.search = filter.search;

      const res = await Api.get("/presensi/rekap-bulanan", { params });
      setDataRekapan(res.data.data.data);
    } catch (err) {
      console.error("Gagal load rekapitulasi", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRekapan();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchRekapan]);

  const formatMenit = (menit) => {
    if (!menit || menit <= 0) return "0m";
    const h = Math.floor(menit / 60);
    const m = menit % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
            Rekapitulasi Kehadiran
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
            {monthNames[filter.bulan - 1]} {filter.tahun}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:opacity-90 shadow-lg shadow-green-600/20">
          <MdFileDownload size={16} /> Export
        </button>
      </div>

      {/* Filter Row - Lebih Compact */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[25px] border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select
            value={filter.bulan}
            onChange={(e) =>
              setFilter({ ...filter, bulan: parseInt(e.target.value) })
            }
            className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-xl text-[10px] font-bold outline-none dark:text-white"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={filter.tahun}
            onChange={(e) =>
              setFilter({ ...filter, tahun: parseInt(e.target.value) })
            }
            className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-xl text-[10px] font-bold outline-none dark:text-white"
          >
            {[2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={filter.id_departemen}
            onChange={(e) =>
              setFilter({ ...filter, id_departemen: e.target.value })
            }
            className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-xl text-[10px] font-bold outline-none dark:text-white"
          >
            <option value="">Departemen</option>
            {masterDept.map((d) => (
              <option key={d.id_departemen} value={d.id_departemen}>
                {d.nama_departemen}
              </option>
            ))}
          </select>
          <select
            value={filter.id_status_pegawai}
            onChange={(e) =>
              setFilter({ ...filter, id_status_pegawai: e.target.value })
            }
            className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-xl text-[10px] font-bold outline-none dark:text-white"
          >
            <option value="">Status Pegawai</option>
            {masterStatus.map((s) => (
              <option key={s.id_status_pegawai} value={s.id_status_pegawai}>
                {s.nama_status}
              </option>
            ))}
          </select>
          <div className="relative col-span-2 md:col-span-1">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Cari..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-bold outline-none dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Table Container dengan Sticky & Max Height */}
      <div className="bg-white dark:bg-custom-gelap rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] min-h-[400px] relative custom-scrollbar rounded-[30px]">
          {/* Loading Spinner Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-custom-gelap/80 backdrop-blur-[2px] z-[100] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                {/* Spinner yang lebih tebal dan mencolok */}
                <div className="w-6 h-6 border-2 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[8px] font-black uppercase tracking-[2px] text-custom-cerah animate-pulse">
                  Memuat Data...
                </span>
              </div>
            </div>
          )}

          {/* Table Tetap Menggunakan border-separate untuk Presensi Sticky */}
          <table className="w-full text-left border-separate border-spacing-0 relative min-w-[1200px]">
            <thead>
              <tr className="text-[7px] font-black uppercase tracking-widest text-gray-400">
                {/* 1. PROFIL PEGAWAI (BG SOLID) */}
                <th className="p-3 sticky left-0 top-0 z-[70] bg-gray-100 dark:bg-[#251b22] min-w-[180px] border-b border-r border-gray-200 dark:border-white/10">
                  Profil Pegawai
                </th>

                {/* 2. STATISTIK UTAMA (BG SOLID, NO GAP) */}
                {/* Kita atur left secara presisi untuk mengunci posisi */}
                <th className="p-2 text-center text-green-600 bg-green-100 dark:bg-green-900 sticky top-0 border-b border-r border-green-200 dark:border-white/5">
                  H
                </th>
                <th className="p-2 text-center text-orange-600 bg-orange-100 dark:bg-orange-900 sticky top-0 border-b border-r border-orange-200 dark:border-white/5">
                  I
                </th>
                <th className="p-2 text-center text-red-600 bg-red-100 dark:bg-red-900 sticky top-0 border-b border-r border-red-200 dark:border-white/5">
                  A
                </th>
                <th className="p-2 text-center text-custom-merah-terang bg-red-100 sticky top-0 dark:bg-red-950 min-w-[80px] border-b border-r border-red-200 dark:border-white/10">
                  Minus
                </th>

                {/* 3. DAILY (HANYA STICKY TOP) */}
                {daysArray.map((day) => {
                  const isSunday =
                    new Date(filter.tahun, filter.bulan - 1, day).getDay() ===
                    0;
                  return (
                    <th
                      key={day}
                      className={`p-1 text-center min-w-[35px] sticky top-0 z-50 border-b border-r border-gray-100 dark:border-white/5 ${
                        isSunday
                          ? "bg-red-200 text-red-600 dark:bg-red-900"
                          : "bg-gray-50 dark:bg-[#1a1419]"
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-custom-gelap">
              {dataRekapan.map((pegawai) => (
                <tr
                  key={pegawai.id_pegawai}
                  className="hover:bg-gray-50/30 transition-all"
                >
                  {/* Kolom Profil di Body (BG harus SOLID agar tidak tembus) */}
                  <td className="p-2 sticky left-0 z-30 bg-white dark:bg-custom-gelap border-b border-r border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-custom-merah-terang text-white flex items-center justify-center font-black text-[9px]">
                        {pegawai.nama_panggilan?.charAt(0) ||
                          pegawai.nama.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-black dark:text-white uppercase truncate tracking-tighter">
                            {pegawai.nama_panggilan ||
                              pegawai.nama.split(" ")[0]}
                          </p>
                          <span
                            className={`text-[6px] font-black px-1 rounded-sm border ${
                              pegawai.nama_status === "Pegawai Tetap"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : pegawai.nama_status === "Pegawai Tidak Tetap"
                                  ? "bg-green-50 text-green-600 border-green-100"
                                  : "bg-purple-50 text-purple-600 border-purple-100"
                            }`}
                          >
                            {pegawai.id_status_pegawai === 1
                              ? "Pegawai Tetap"
                              : pegawai.id_status_pegawai === 2
                                ? "Pegawai Tidak Tetap"
                                : "Magang"}
                          </span>
                        </div>
                        <p className="text-[7px] text-gray-400 font-bold tracking-tight">
                          {pegawai.nip} • {pegawai.nama_departemen}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kolom Statistik di Body (BG SOLID) */}
                  <td className="p-2 text-center text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {pegawai.hadir}
                  </td>
                  <td className="p-2 text-center text-xs font-black text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {pegawai.izin}
                  </td>
                  <td className="p-2 text-center text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {pegawai.alpha}
                  </td>
                  <td className="p-2 text-center text-[9px] font-black text-custom-merah-terang bg-red-50 dark:bg-red-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {formatMenit(pegawai.total_kurang_jam)}
                  </td>

                  {/* Data Harian */}
                  {daysArray.map((day) => {
                    const status = pegawai.daily[day.toString()];
                    return (
                      <td
                        key={day}
                        className="p-0.5 text-center border-b border-r border-gray-50 dark:border-white/5"
                      >
                        <span
                          className={`inline-block w-5 h-5 leading-5 rounded-md text-[8px] font-black ${
                            status === "H"
                              ? "text-green-500"
                              : status === "I"
                                ? "bg-orange-500 text-white shadow-sm"
                                : status === "A"
                                  ? "bg-red-500 text-white shadow-sm"
                                  : status === "L"
                                    ? "text-gray-300 dark:text-gray-600 italic font-medium"
                                    : "text-gray-200 dark:text-gray-800"
                          }`}
                        >
                          {status || "•"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rekapan;
