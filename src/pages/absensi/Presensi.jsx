import React, { useState } from "react";
import {
  MdSearch,
  MdFilterList,
  MdFileDownload,
  MdLocationOn,
  MdAccessTime,
} from "react-icons/md";

const Presensi = () => {
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Dummy Data Presensi (Berdasarkan skema tabel 'absensi')
  const dataPresensi = [
    {
      id: 1,
      nama: "Gugun Ichijo",
      nip: "PEG-001",
      shift: "Regular Pagi",
      masuk: "07:55:20",
      keluar: "17:05:00",
      lokasi: "Kantor Pusat",
      lat: -6.2088,
      lng: 106.8456,
      status: "Tepat Waktu",
      terlambat: 0,
    },
    {
      id: 2,
      nama: "Andi Saputra",
      nip: "PEG-002",
      shift: "Regular Pagi",
      masuk: "08:15:10",
      keluar: null,
      lokasi: "Gudang B",
      lat: -6.21,
      lng: 106.85,
      status: "Terlambat",
      terlambat: 15,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats Ringkas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white">
            Data Presensi
          </h1>
          <p className="text-sm text-gray-500">
            Monitoring kehadiran pegawai Berkah Angsana
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20">
            <MdFileDownload size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white dark:bg-custom-gelap p-6 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Tanggal
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-2xl text-sm focus:ring-2 focus:ring-custom-cerah outline-none dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Departemen
            </label>
            <select className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-2xl text-sm outline-none dark:text-white">
              <option>Semua Departemen</option>
              <option>Operational</option>
              <option>Finance</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Cari Pegawai
            </label>
            <div className="relative">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="NIP atau Nama..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-custom-gelap dark:bg-custom-cerah text-white p-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <MdFilterList /> Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-custom-gelap rounded-[35px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 text-[10px] uppercase tracking-widest text-gray-400">
                <th className="p-6 font-semibold">Pegawai</th>
                <th className="p-6 font-semibold text-center">Shift</th>
                <th className="p-6 font-semibold text-center">Masuk</th>
                <th className="p-6 font-semibold text-center">Keluar</th>
                <th className="p-6 font-semibold text-center">Lokasi</th>
                <th className="p-6 font-semibold text-center">Status</th>
                <th className="p-6 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataPresensi.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center font-bold shadow-lg shadow-custom-merah-terang/20">
                        {item.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-custom-gelap dark:text-white leading-none">
                          {item.nama}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                          {item.nip}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center text-xs dark:text-gray-400 font-medium">
                    {item.shift}
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-sm font-bold dark:text-white">
                      {item.masuk || "--:--"}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-sm font-bold dark:text-white">
                      {item.keluar || "--:--"}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-xl">
                      <MdLocationOn size={14} /> {item.lokasi}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                        item.status === "Tepat Waktu"
                          ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-custom-cerah transition-all">
                      <MdAccessTime size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination (Dummy) */}
        <div className="p-6 border-t border-gray-50 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-black/10">
          <p className="text-xs text-gray-400 font-medium">
            Menampilkan 2 dari 154 Pegawai
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-[10px] font-bold bg-white dark:bg-custom-gelap border border-gray-200 dark:border-white/10 rounded-xl text-gray-500">
              Prev
            </button>
            <button className="px-4 py-2 text-[10px] font-bold bg-custom-merah-terang text-white rounded-xl shadow-md">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presensi;
