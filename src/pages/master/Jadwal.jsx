import React, { useState } from "react";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdAccessTime,
  MdEventBusy,
  MdClose,
  MdCheckCircle,
  MdEventNote,
} from "react-icons/md";

const Jadwal = () => {
  const [activeSubTab, setActiveSubTab] = useState("shift");
  const [showModal, setShowModal] = useState(false);

  // Data sesuai INSERT SQL ref_jam_kerja
  const [listShift] = useState([
    { id_jam_kerja: 1, nama_shift: "Normal", jam_per_hari: 480, status: 1 },
    {
      id_jam_kerja: 2,
      nama_shift: "Cleaning Shift",
      jam_per_hari: 720,
      status: 1,
    },
  ]);

  // Data sesuai INSERT SQL ref_hari_libur (Tahun 2025)
  const [listLibur] = useState([
    {
      tanggal: "2025-01-01",
      nama_libur: "Tahun Baru Masehi",
      jenis: "nasional",
    },
    {
      tanggal: "2025-01-27",
      nama_libur: "Isra Miraj Nabi Muhammad SAW",
      jenis: "nasional",
    },
    {
      tanggal: "2025-03-31",
      nama_libur: "Idul Fitri 1446 Hijriah",
      jenis: "nasional",
    },
    {
      tanggal: "2025-05-01",
      nama_libur: "Hari Buruh Internasional",
      jenis: "nasional",
    },
    {
      tanggal: "2025-11-08",
      nama_libur: "Gathering Berkah Angsana",
      jenis: "internal",
    },
    { tanggal: "2025-12-25", nama_libur: "Hari Raya Natal", jenis: "nasional" },
    // ... data lainnya tersimpan di state
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Jam Kerja & Libur
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Manajemen Waktu Operasional
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
        >
          <MdAdd size={20} /> Tambah{" "}
          {activeSubTab === "shift" ? "Shift" : "Hari Libur"}
        </button>
      </div>

      {/* Switcher Tab */}
      <div className="flex bg-white dark:bg-custom-gelap p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setActiveSubTab("shift")}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeSubTab === "shift"
              ? "bg-custom-merah-terang text-white shadow-md"
              : "text-gray-400 hover:text-custom-merah-terang"
          }`}
        >
          <MdAccessTime size={16} /> Shift Kerja
        </button>
        <button
          onClick={() => setActiveSubTab("libur")}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeSubTab === "libur"
              ? "bg-custom-merah-terang text-white shadow-md"
              : "text-gray-400 hover:text-custom-merah-terang"
          }`}
        >
          <MdEventBusy size={16} /> Hari Libur
        </button>
      </div>

      {/* Table Container - MAX HEIGHT 400PX */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                {activeSubTab === "shift" ? (
                  <>
                    <th className="p-6 w-24">ID</th>
                    <th className="p-6">Nama Shift</th>
                    <th className="p-6 text-center">Durasi (Menit)</th>
                    <th className="p-6 text-center">Setara Jam</th>
                  </>
                ) : (
                  <>
                    <th className="p-6">Tanggal</th>
                    <th className="p-6">Nama Keterangan Libur</th>
                    <th className="p-6 text-center">Jenis</th>
                  </>
                )}
                <th className="p-6 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[11px]">
              {activeSubTab === "shift"
                ? listShift.map((s) => (
                    <tr
                      key={s.id_jam_kerja}
                      className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5 font-black text-custom-merah-terang italic">
                        #{s.id_jam_kerja}
                      </td>
                      <td className="p-5 font-bold text-custom-gelap dark:text-white uppercase">
                        {s.nama_shift}
                      </td>
                      <td className="p-5 text-center font-mono text-blue-500 font-bold">
                        {s.jam_per_hari} mnt
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg font-black text-gray-400 uppercase">
                          {s.jam_per_hari / 60} Jam / Hari
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all">
                            <MdEdit size={16} />
                          </button>
                          <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                            <MdDeleteOutline size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : listLibur.map((l, i) => (
                    <tr
                      key={i}
                      className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-2 font-bold text-custom-merah-terang">
                          <MdEventNote size={16} /> {l.tanggal}
                        </div>
                      </td>
                      <td className="p-5 font-bold text-custom-gelap dark:text-white">
                        {l.nama_libur}
                      </td>
                      <td className="p-5 text-center">
                        <span
                          className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                            l.jenis === "nasional"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {l.jenis}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl">
                            <MdEdit size={16} />
                          </button>
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                            <MdDeleteOutline size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-blue-50 dark:bg-blue-500/5 rounded-[30px] border border-blue-100 dark:border-blue-500/10 flex items-center gap-4">
          <MdAccessTime className="text-blue-500" size={32} />
          <div className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase leading-relaxed tracking-widest">
            Shift Kerja Normal di Berkah Angsana adalah 480 menit (8 Jam)
            termasuk waktu istirahat.
          </div>
        </div>
        <div className="p-5 bg-red-50 dark:bg-red-500/5 rounded-[30px] border border-red-100 dark:border-red-500/10 flex items-center gap-4">
          <MdEventBusy className="text-red-500" size={32} />
          <div className="text-[10px] font-bold text-red-800 dark:text-red-300 uppercase leading-relaxed tracking-widest">
            Libur Nasional mengikuti SKB 3 Menteri, sedangkan Libur Internal
            adalah kebijakan Direksi.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jadwal;
