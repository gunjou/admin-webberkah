import React, { useState, useEffect, useCallback } from "react";
import {
  MdTimer,
  MdEventNote,
  MdWorkspacePremium,
  MdBlock,
  MdHistoryToggleOff,
  MdFormatListNumbered,
} from "react-icons/md";
import Api from "../utils/Api";

const Leaderboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("terlambat");
  const [params, setParams] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: 2026,
    limit: 10,
  });

  const categories = [
    {
      id: "terlambat",
      label: "Paling Terlambat",
      icon: <MdHistoryToggleOff />,
    },
    { id: "terbaik", label: "Pegawai Terbaik", icon: <MdWorkspacePremium /> },
    { id: "rajin", label: "Paling Rajin", icon: <MdTimer /> },
  ];

  const fetchLeaderboard = useCallback(async () => {
    if (activeCategory !== "terlambat") {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await Api.get("/leaderboard/terlambat", { params });
      setData(response.data.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }, [params, activeCategory]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === "pegawai tetap") {
      return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20";
    } else if (s === "pegawai tidak tetap") {
      return "bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100 dark:border-green-500/20";
    } else if (s === "magang") {
      return "bg-purple-50 dark:bg-purple-500/10 text-purple-600 border-purple-100 dark:border-purple-500/20";
    }
    // Default jika tidak cocok
    return "bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10";
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4 animate-in fade-in duration-500 overflow-hidden">
      {/* 1. HEADER & INTEGRATED FILTERS (Sama Tinggi) */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 flex-shrink-0">
        {/* TAB SISTEM KATEGORI */}
        <div className="flex bg-white dark:bg-custom-gelap p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-x-auto no-scrollbar h-[46px] items-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap h-full ${
                activeCategory === cat.id
                  ? "bg-custom-merah-terang text-white shadow-lg shadow-custom-merah-terang/20"
                  : "text-gray-400 hover:text-custom-merah-terang"
              }`}
            >
              <span className="text-sm">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* GRUP FILTER (Bulan, Tahun, Limit) */}
        <div className="flex items-center gap-2 flex-shrink-0 h-[46px]">
          {/* Filter Periode */}
          <div className="flex items-center gap-1 bg-white dark:bg-custom-gelap px-3 py-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm h-full">
            <MdEventNote className="text-custom-merah-terang" size={16} />
            <select
              value={params.bulan}
              onChange={(e) =>
                setParams({ ...params, bulan: parseInt(e.target.value) })
              }
              className="bg-transparent border-none text-[10px] font-black uppercase outline-none dark:text-white cursor-pointer px-1"
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name.substring(0, 3)}
                </option>
              ))}
            </select>
            <div className="w-[1px] h-3 bg-gray-200 dark:bg-white/10 mx-1"></div>
            <select
              value={params.tahun}
              onChange={(e) =>
                setParams({ ...params, tahun: parseInt(e.target.value) })
              }
              className="bg-transparent border-none text-[10px] font-black outline-none dark:text-white cursor-pointer px-1"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* Filter Limit (TOP PEGAWAI) */}
          <div className="flex items-center gap-2 bg-white dark:bg-custom-gelap px-4 py-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm h-full">
            <MdFormatListNumbered className="text-blue-500" size={16} />
            <select
              value={params.limit}
              onChange={(e) =>
                setParams({ ...params, limit: parseInt(e.target.value) })
              }
              className="bg-transparent border-none text-[10px] font-black uppercase outline-none dark:text-white cursor-pointer"
            >
              <option value={5}>TOP 5</option>
              <option value={10}>TOP 10</option>
              <option value={20}>TOP 20</option>
              <option value={50}>TOP 50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. TOP 3 HIGHLIGHT (MEDIUM SIZE) */}
      {activeCategory === "terlambat" && !loading && data.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
          {data.slice(0, 3).map((item, index) => (
            <div
              key={item.id_pegawai}
              className={`p-4 rounded-[30px] border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 bg-white dark:bg-custom-gelap group hover:border-custom-merah-terang transition-all`}
            >
              <div
                className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center font-black text-xl italic ${
                  index === 0
                    ? "bg-red-500 text-white"
                    : index === 1
                      ? "bg-orange-500 text-white"
                      : "bg-yellow-500 text-white"
                }`}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <h3 className="text-[11px] font-black dark:text-white uppercase truncate">
                  {item.nama}
                </h3>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  {item.departemen}
                </p>
                <p className="text-[13px] font-black text-custom-merah-terang mt-0.5">
                  {item.total_menit_terlambat}{" "}
                  <span className="text-[7px] text-gray-400 italic">MENIT</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. SCROLLABLE TABLE AREA */}
      <div className="flex-1 bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {activeCategory === "terlambat" ? (
            <table className="w-full text-[10px] border-collapse min-w-[600px]">
              <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-[#3d2e39] shadow-sm">
                <tr className="font-black uppercase tracking-widest text-gray-400">
                  <th className="p-4 text-center w-20">Rank</th>
                  <th className="p-4 text-left">Pegawai</th>
                  <th className="p-4 text-left">Departemen</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Total Terlambat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        {/* Spinner Kecil & Halus */}
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 border-4 border-custom-merah-terang/20 border-t-custom-merah-terang rounded-full animate-spin"></div>
                          <div className="absolute w-2 h-2 bg-custom-merah-terang rounded-full animate-pulse"></div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <span className="font-black uppercase text-[10px] text-gray-400 tracking-[4px] animate-pulse">
                            Menyinkronkan Rangking...
                          </span>
                          <span className="text-[8px] text-gray-400 italic font-bold uppercase opacity-50">
                            Mohon Tunggu Sebentar
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item.id_pegawai}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                    >
                      <td className="p-4 text-center font-black text-gray-400 italic group-hover:text-custom-merah-terang">
                        #{index + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-black dark:text-white uppercase tracking-tighter">
                            {item.nama}
                          </span>
                          <span className="text-[8px] text-gray-400 font-bold">
                            {item.nip}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-400 uppercase">
                        {item.departemen}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-lg font-black text-[8px] uppercase border transition-all ${getStatusStyles(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg font-black italic">
                          {item.total_menit_terlambat} Menit
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-20 text-center italic text-gray-400 font-black uppercase tracking-widest"
                    >
                      Data Kosong
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <MdBlock size={40} className="text-gray-300" />
              </div>
              <h2 className="text-sm font-black dark:text-white uppercase tracking-[4px]">
                Dalam Perhitungan
              </h2>
              <p className="text-[10px] text-gray-500 italic mt-2">
                Kategori{" "}
                <b className="text-custom-merah-terang uppercase">
                  "{activeCategory}"
                </b>{" "}
                sedang disinkronkan oleh sistem master.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
