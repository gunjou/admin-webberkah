import React, { useState } from "react";
import {
  MdSearch,
  MdFileDownload,
  MdClose,
  MdAccessTime,
} from "react-icons/md";

const Rekapan = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2026);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);

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

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Dummy Data dengan Logs Mendetail
  const dataRekapan = [
    {
      id: 1,
      nama: "Gugun Ichijo",
      nip: "PEG-2024001",
      dept: "Operational",
      hadir: 24,
      izin: 1,
      alpa: 0,
      total_terlambat: 45,
      total_kurang_jam: 30,
      total_istirahat_lebih: 15,
      daily: { 1: "H", 2: "H", 3: "I", 4: "H", 5: "A", 6: "M" },
      logs: [
        {
          tgl: "2026-01-01",
          masuk: "07:55",
          keluar: "17:05",
          istirahat_mulai: "12:00",
          istirahat_selesai: "13:00",
          lokasi: "Kantor Pusat",
          late: 0,
          kurang: 0,
          istirahat_lebih: 0,
        },
        {
          tgl: "2026-01-02",
          masuk: "08:15",
          keluar: "17:00",
          istirahat_mulai: "12:00",
          istirahat_selesai: "13:15",
          lokasi: "Kantor Pusat",
          late: 15,
          kurang: 0,
          istirahat_lebih: 15,
        },
        {
          tgl: "2026-01-05",
          masuk: null,
          keluar: null,
          status: "A",
          keterangan: "Tanpa Keterangan",
        },
      ],
    },
  ];

  const handleOpenDetail = (pegawai) => {
    setSelectedPegawai(pegawai);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white leading-tight">
            Rekapan & Akumulasi Waktu
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Periode {monthNames[selectedMonth]} {selectedYear}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-custom-merah-terang text-white rounded-2xl text-xs font-bold shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-transform">
          <MdFileDownload size={20} /> Export Rekapan
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-custom-gelap p-6 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
        <div className="flex gap-4 flex-1">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3.5 rounded-2xl text-sm outline-none dark:text-white"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-32 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3.5 rounded-2xl text-sm outline-none dark:text-white"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
        <div className="relative flex-1">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari Pegawai..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Table Rekapan */}
      <div className="bg-white dark:bg-custom-gelap rounded-[35px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 border-r border-gray-100 dark:border-white/5 sticky left-0 bg-gray-50 dark:bg-[#3d2e39] z-20 min-w-[220px]">
                  Pegawai
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-center text-green-600 bg-green-50/30">
                  H
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-center text-orange-600 bg-orange-50/30">
                  I
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-center text-red-600 bg-red-50/30">
                  A
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-center text-custom-merah-terang bg-red-50 dark:bg-red-500/5 min-w-[100px]">
                  Total Kurang
                </th>
                {daysArray.map((day) => {
                  const isSunday =
                    new Date(selectedYear, selectedMonth, day).getDay() === 0;
                  return (
                    <th
                      key={day}
                      className={`p-2 text-[9px] font-bold text-center min-w-[35px] border-l border-gray-50 dark:border-white/5 ${
                        isSunday
                          ? "text-red-500 bg-red-50/30 dark:bg-red-500/5"
                          : "text-gray-400"
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataRekapan.map((pegawai) => {
                const totalMinus =
                  pegawai.total_terlambat +
                  pegawai.total_kurang_jam +
                  pegawai.total_istirahat_lebih;
                return (
                  <tr
                    key={pegawai.id}
                    className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(pegawai)}
                  >
                    <td className="p-4 sticky left-0 bg-white dark:bg-custom-gelap z-10 border-r border-gray-100 dark:border-white/5 shadow-[5px_0_10px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-custom-gelap text-custom-cerah flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-custom-merah-terang group-hover:text-white transition-colors">
                          {pegawai.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-custom-gelap dark:text-white leading-none">
                            {pegawai.nama}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-1 font-medium italic">
                            {pegawai.dept}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center text-xs font-bold text-green-600">
                      {pegawai.hadir}
                    </td>
                    <td className="p-2 text-center text-xs font-bold text-orange-600">
                      {pegawai.izin}
                    </td>
                    <td className="p-2 text-center text-xs font-bold text-red-600">
                      {pegawai.alpa}
                    </td>
                    <td className="p-2 text-center bg-red-50/50 dark:bg-red-500/5">
                      <span className="text-[11px] font-black text-custom-merah-terang">
                        {Math.floor(totalMinus / 60)}h {totalMinus % 60}m
                      </span>
                    </td>
                    {daysArray.map((day) => {
                      const status = pegawai.daily[day];
                      return (
                        <td
                          key={day}
                          className="p-2 text-center border-l border-gray-50 dark:border-white/5"
                        >
                          <span
                            className={`inline-block w-6 h-6 leading-6 rounded-lg text-[10px] font-black ${
                              status === "H"
                                ? "text-green-500"
                                : status === "I"
                                ? "bg-orange-500 text-white shadow-sm"
                                : status === "A"
                                ? "bg-red-500 text-white shadow-md animate-pulse"
                                : status === "M"
                                ? "text-gray-300 dark:text-gray-600 font-normal"
                                : ""
                            }`}
                          >
                            {status || "•"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DETAIL --- */}
      {showDetail && selectedPegawai && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-custom-gelap w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
            {/* Modal Header */}
            <div className="p-6 md:p-8 flex justify-between items-center bg-gradient-to-r from-custom-merah to-custom-gelap text-white">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30">
                  {selectedPegawai.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedPegawai.nama}</h2>
                  <p className="text-xs text-white/70 tracking-widest uppercase font-medium">
                    {selectedPegawai.nip} • {selectedPegawai.dept}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-4 flex items-center gap-2 px-2">
                <MdAccessTime size={16} className="text-custom-merah-terang" />
                Riwayat Log - {monthNames[selectedMonth]}
              </h3>

              <div className="grid gap-2">
                {selectedPegawai.logs.map((log, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 dark:bg-white/5 px-4 py-3 rounded-[20px] border border-gray-100 dark:border-white/5 hover:border-custom-cerah/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Tanggal - Mini Version */}
                      <div className="flex items-center gap-3 min-w-[60px] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 pb-2 md:pb-0 md:pr-4">
                        <span className="text-xl font-black text-custom-merah-terang leading-none">
                          {new Date(log.tgl).getDate()}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                          {monthNames[selectedMonth].substring(0, 3)}
                        </span>
                      </div>

                      {/* Grid Waktu & Lokasi - Lebih Rapat */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                        {/* Masuk */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase">
                              Masuk
                            </p>
                            {log.late > 0 && (
                              <span className="text-[8px] font-bold text-red-500 tracking-tighter">
                                -{log.late}m
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold dark:text-white leading-none">
                              {log.masuk || "--:--"}
                            </p>
                            {log.masuk && (
                              <span
                                className="text-[9px] text-blue-500 font-medium truncate max-w-[80px]"
                                title={log.lokasi_masuk}
                              >
                                @{log.lokasi_masuk}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pulang */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase">
                              Pulang
                            </p>
                            {log.kurang > 0 && (
                              <span className="text-[8px] font-bold text-gray-500 tracking-tighter">
                                -{log.kurang}m
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold dark:text-white leading-none">
                              {log.keluar || "--:--"}
                            </p>
                            {log.keluar && (
                              <span
                                className="text-[9px] text-blue-500 font-medium truncate max-w-[80px]"
                                title={log.lokasi_keluar}
                              >
                                @{log.lokasi_keluar}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Istirahat - Di layar kecil baris baru, di layar besar kolom ke-3 */}
                        <div className="col-span-2 md:col-span-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase">
                              Istirahat
                            </p>
                            {log.istirahat_lebih > 0 && (
                              <span className="text-[8px] font-bold text-orange-500 tracking-tighter">
                                +{log.istirahat_lebih}m
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium dark:text-gray-300 leading-none">
                              {log.istirahat_mulai
                                ? `${log.istirahat_mulai}-${log.istirahat_selesai}`
                                : "--:--"}
                            </p>
                            {log.istirahat_selesai && (
                              <span className="text-[9px] text-blue-400 font-medium truncate max-w-[60px]">
                                @{log.lokasi_istirahat || "Sama"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Badge Alpa/Izin Khusus */}
                      {!log.masuk && !log.keluar && (
                        <div className="ml-auto">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              log.status === "A"
                                ? "bg-red-500 text-white"
                                : "bg-orange-500 text-white"
                            }`}
                          >
                            {log.status === "A" ? "Alpa" : "Izin"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 dark:bg-black/20 text-center border-t border-gray-100 dark:border-white/10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px]">
                Audit Log System Berkah Angsana
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rekapan;
