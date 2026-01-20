import React, { useState, useEffect, useCallback } from "react";
import { MdSearch, MdFileDownload } from "react-icons/md";
import Api from "../../utils/Api";
import ModalDetailRekapan from "../../components/modals/ModalDetailRekapan";

const Rekapan = () => {
  const [loading, setLoading] = useState(false);
  const [dataRekapan, setDataRekapan] = useState([]);
  const [masterDept, setMasterDept] = useState([]);
  const [masterStatus, setMasterStatus] = useState([]);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedPegawaiId, setSelectedPegawaiId] = useState(null);

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

  const handleOpenDetail = (id) => {
    setSelectedPegawaiId(id);
    setIsModalDetailOpen(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-0">
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
        <div className="overflow-x-auto overflow-y-auto max-h-[55vh] min-h-[400px] relative custom-scrollbar rounded-[30px]">
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
                {/* 1. PROFIL */}
                <th className="p-3 sticky left-0 top-0 z-[70] bg-gray-100 dark:bg-[#251b22] min-w-[180px] border-b border-r border-gray-200 dark:border-white/10">
                  Profil Pegawai
                </th>

                {/* 2. STATISTIK UTAMA (5 KOLOM: H, I, S, A, MINUS) */}
                {/* Statistik Utama di Header */}
                <th className="p-2 text-center text-blue-600 bg-blue-100 dark:bg-blue-900/30 sticky top-0 border-b border-r border-blue-200 dark:border-white/5">
                  H
                </th>
                <th className="p-2 text-center text-orange-600 bg-orange-100 dark:bg-orange-900/30 sticky top-0 border-b border-r border-orange-200 dark:border-white/5">
                  I
                </th>
                <th className="p-2 text-center text-green-600 bg-green-100 dark:bg-green-900/30 sticky top-0 border-b border-r border-green-200 dark:border-white/5">
                  S
                </th>
                <th className="p-2 text-center text-red-600 bg-red-100 dark:bg-red-900/30 sticky top-0 border-b border-r border-red-200 dark:border-white/5">
                  A
                </th>
                <th className="p-2 text-center text-custom-merah-terang bg-red-100 sticky top-0 dark:bg-red-950 min-w-[80px] border-b border-r border-red-200 dark:border-white/10">
                  Minus
                </th>

                {/* 3. DAILY */}
                {daysArray.map((day) => {
                  const isSunday =
                    new Date(filter.tahun, filter.bulan - 1, day).getDay() ===
                    0;
                  return (
                    <th
                      key={day}
                      className={`p-1 text-center min-w-[35px] sticky top-0 z-50 border-b border-r border-gray-100 dark:border-white/5 ${isSunday ? "bg-red-200 text-red-600 dark:bg-red-900" : "bg-gray-50 dark:bg-[#1a1419]"}`}
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
                  onClick={() => handleOpenDetail(pegawai.id_pegawai)}
                  key={pegawai.id_pegawai}
                  className="cursor-pointer hover:bg-gray-50 transition-all"
                >
                  {/* Profil */}
                  <td className="p-2 sticky left-0 z-30 bg-white dark:bg-custom-gelap border-b border-r border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-custom-merah-terang text-white flex items-center justify-center font-black text-[9px] uppercase">
                        {(() => {
                          // 1. Ambil nama, hilangkan spasi di awal/akhir, dan pecah berdasarkan spasi
                          const words = (pegawai.nama || "")
                            .trim()
                            .split(/\s+/);

                          // 2. Jika ada lebih dari 1 kata, ambil inisial kata pertama dan kedua
                          if (words.length > 1) {
                            return `${words[0].charAt(0)}${words[1].charAt(0)}`;
                          }

                          // 3. Jika hanya 1 kata, ambil huruf pertamanya saja
                          return words[0].charAt(0) || "?";
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black dark:text-white uppercase truncate tracking-tighter">
                          {pegawai.nama_panggilan || pegawai.nama.split(" ")[0]}
                        </p>
                        <p className="text-[7px] text-gray-400 font-bold tracking-tight">
                          {pegawai.nip}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Statistik Body */}
                  <td className="p-2 text-center text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {pegawai.hadir}
                  </td>
                  <td className="p-2 text-center text-xs font-black text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {(pegawai.izin || 0) + (pegawai.cuti || 0)}
                  </td>
                  <td className="p-2 text-center text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {pegawai.sakit}
                  </td>
                  <td className="p-2 text-center text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {pegawai.alpha}
                  </td>
                  <td className="p-2 text-center text-[9px] font-black text-custom-merah-terang bg-red-50 dark:bg-red-900/10 border-b border-r border-gray-100 dark:border-white/5">
                    {formatMenit(pegawai.total_kurang_jam)}
                  </td>

                  {/* Daily Icons/Status */}
                  {daysArray.map((day) => {
                    const status = pegawai.daily[day.toString()];
                    return (
                      <td
                        key={day}
                        className="p-0.5 text-center border-b border-r border-gray-50 dark:border-white/5"
                      >
                        <span
                          className={`inline-block w-5 h-5 leading-5 rounded-md text-[8px] font-black transition-all ${
                            status === "H"
                              ? "text-blue-500 bg-blue-50/50 dark:bg-blue-500/10" // Hadir: Biru lembut
                              : status === "S"
                                ? "text-green-600 bg-green-200/60 dark:bg-green-500/20" // Sakit: Hijau Soft
                                : status === "I"
                                  ? "text-orange-600 bg-orange-200/60 dark:bg-orange-500/20" // Izin: Oranye Soft
                                  : status === "C"
                                    ? "text-purple-600 bg-purple-200/60 dark:bg-purple-500/20" // Cuti: Ungu Soft
                                    : status === "A"
                                      ? "bg-red-500 text-white shadow-sm scale-110" // Alpha: Merah Solid & Standout
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

      {/* Legenda Keterangan Presensi */}
      <div className="mt-3 px-6 py-2 bg-white dark:bg-custom-gelap rounded-[25px] border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-blue-50/50 dark:bg-blue-500/10 text-blue-500 text-[8px] font-black border border-blue-100 dark:border-blue-500/20">
              H
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Hadir (Waktu Nyata)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-orange-100/60 dark:bg-orange-500/20 text-orange-600 text-[8px] font-black border border-orange-200 dark:border-orange-500/20">
              I
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Izin / Cuti Resmi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-green-100/60 dark:bg-green-500/20 text-green-600 text-[8px] font-black border border-green-200 dark:border-green-500/20">
              S
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Sakit (Surat Dokter)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-red-500 text-white text-[8px] font-black shadow-sm shadow-red-500/20">
              A
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Tanpa Keterangan (Alpha)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-gray-50 dark:bg-[#1a1419] text-gray-300 dark:text-gray-600 text-[8px] font-black border border-gray-100 dark:border-white/5 italic">
              L
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Libur / Akhir Pekan
            </span>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-custom-merah-terang bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md uppercase">
              Minus
            </span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Akumulasi Kurang Jam Kerja
            </span>
          </div>
        </div>
      </div>

      {/* Modal Detail Rekapan */}
      <ModalDetailRekapan
        isOpen={isModalDetailOpen}
        onClose={() => setIsModalDetailOpen(false)}
        idPegawai={selectedPegawaiId}
        bulan={filter.bulan}
        tahun={filter.tahun}
        monthName={monthNames[filter.bulan - 1]}
        onRefresh={fetchRekapan}
      />
    </div>
  );
};

export default Rekapan;
