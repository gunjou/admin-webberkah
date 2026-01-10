import React, { useState } from "react";
import {
  MdSearch,
  MdRemoveRedEye,
  MdFileDownload,
  MdAccessTime,
  MdAttachMoney,
  MdClose,
  MdInfoOutline,
  MdImage,
  MdCalendarToday,
} from "react-icons/md";

const Lembur = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeTab, setActiveTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

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

  // Data Dummy Berkah Angsana
  const dataLembur = [
    {
      id: 1,
      nama: "Gugun Ichijo",
      nip: "PEG-001",
      tgl: "2026-01-05",
      mulai: "17:00",
      selesai: "20:00",
      durasi: 180,
      upah: 75000,
      keterangan: "Penyelesaian laporan akhir tahun departemen operasional.",
      status: "PENDING",
      lampiran: "lampiran_laporan.jpg",
    },
    {
      id: 2,
      nama: "Andi Saputra",
      nip: "PEG-002",
      tgl: "2026-01-04",
      mulai: "18:00",
      selesai: "21:00",
      durasi: 180,
      upah: 60000,
      keterangan: "Maintenance server mendadak di kantor pusat.",
      status: "APPROVED",
      lampiran: null,
    },
    {
      id: 3,
      nama: "Siti Aminah",
      nip: "PEG-015",
      tgl: "2026-01-03",
      mulai: "17:30",
      selesai: "19:30",
      durasi: 120,
      upah: 45000,
      keterangan: "Input data stok barang masuk dari gudang pusat.",
      status: "APPROVED",
      lampiran: "stok_log.png",
    },
    {
      id: 4,
      nama: "Budi Santoso",
      nip: "PEG-009",
      tgl: "2026-01-02",
      mulai: "17:00",
      selesai: "22:00",
      durasi: 300,
      upah: 120000,
      keterangan: "Lembur tanpa instruksi manager.",
      status: "REJECTED",
      alasan_tolak: "Instruksi tidak ditemukan.",
      lampiran: null,
    },
  ];

  const handleOpenModal = (data) => {
    setSelectedData(data);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Manajemen Lembur
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            Periode Laporan:{" "}
            <span className="text-custom-merah-terang font-bold">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all">
          <MdFileDownload size={20} /> Cetak Rekapitulasi
        </button>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="bg-white dark:bg-custom-gelap p-6 rounded-[35px] shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
        <div className="flex flex-col xl:flex-row justify-between gap-6">
          {/* Group 1: Tabs & Filter Bulan/Tahun */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === "pending"
                    ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Menunggu
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === "history"
                    ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Riwayat
              </button>
            </div>

            {/* Selector Bulan & Tahun */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-100 dark:border-white/10">
              <MdCalendarToday className="ml-2 text-custom-cerah" size={16} />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent border-none text-[11px] font-bold outline-none dark:text-white cursor-pointer px-2"
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="w-[1px] h-4 bg-gray-300 dark:bg-white/20 mx-1"></div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent border-none text-[11px] font-bold outline-none dark:text-white cursor-pointer px-2 pr-4"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          {/* Group 2: Search */}
          <div className="relative w-full xl:w-80">
            <MdSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari nama atau NIP..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang/50 transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 border-b border-gray-50 dark:border-white/5">
                <th className="px-4 pb-4">Pegawai</th>
                <th className="px-4 pb-4 text-center">Tanggal</th>
                <th className="px-4 pb-4 text-center">Estimasi Upah</th>
                <th className="px-4 pb-4 text-center">Status</th>
                <th className="px-4 pb-4 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataLembur
                .filter((item) =>
                  activeTab === "pending"
                    ? item.status === "PENDING"
                    : item.status !== "PENDING"
                )
                .map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(row)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-custom-gelap text-custom-cerah flex items-center justify-center font-black text-xs group-hover:bg-custom-merah-terang group-hover:text-white transition-colors">
                          {row.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-custom-gelap dark:text-white leading-tight">
                            {row.nama}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">
                            {row.nip}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold dark:text-gray-300">
                          {row.tgl}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">
                          {row.mulai}-{row.selesai}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-black text-green-600">
                        Rp {row.upah.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          row.status === "APPROVED"
                            ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                            : row.status === "REJECTED"
                            ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <div className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-xl group-hover:text-custom-merah-terang transition-colors">
                          <MdRemoveRedEye size={20} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL POP-UP DETAIL KETERANGAN --- */}
      {showModal && selectedData && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <div className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col">
            {/* Modal Header */}
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center text-xl font-black">
                  {selectedData.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-custom-gelap dark:text-white">
                    {selectedData.nama}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                    {selectedData.tgl} • {selectedData.nip}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-custom-merah-terang transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 pt-4 space-y-6">
              <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-[30px] border border-gray-100 dark:border-white/10 relative">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MdInfoOutline size={16} /> Alasan Lembur
                </h4>
                <p className="text-sm text-custom-gelap dark:text-gray-200 italic leading-relaxed">
                  "{selectedData.keterangan}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Durasi Total
                  </p>
                  <p className="text-sm font-bold dark:text-white flex items-center gap-2">
                    <MdAccessTime /> {selectedData.durasi} Menit
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase">
                    Upah Estimasi
                  </p>
                  <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                    <MdAttachMoney /> Rp {selectedData.upah.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedData.status === "REJECTED" && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-tighter">
                    Catatan Penolakan
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-medium">
                    {selectedData.alasan_tolak}
                  </p>
                </div>
              )}

              {selectedData.lampiran && (
                <button className="w-full flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                  <MdImage size={18} /> Lihat Bukti Lampiran
                </button>
              )}
            </div>

            {/* Modal Footer / Action */}
            <div className="p-6 bg-gray-50 dark:bg-black/20 flex gap-3">
              {selectedData.status === "PENDING" ? (
                <>
                  <button className="flex-1 py-3.5 bg-custom-merah-terang text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all shadow-custom-merah-terang/20">
                    Setujui
                  </button>
                  <button className="flex-1 py-3.5 bg-white dark:bg-custom-gelap border border-gray-200 dark:border-white/10 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-red-500 hover:text-red-500 transition-all">
                    Tolak
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3.5 bg-custom-gelap dark:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                >
                  Tutup Rincian
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lembur;
