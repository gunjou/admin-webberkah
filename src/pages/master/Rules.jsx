import React, { useState } from "react";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdGavel,
  MdClose,
  MdCheckCircle,
  MdFunctions,
  MdTrendingUp,
} from "react-icons/md";

const Rules = () => {
  const [showModal, setShowModal] = useState(false);

  // Data Dummy berdasarkan JOIN SQL ref_lembur_rule & ref_jenis_lembur
  const [rules] = useState([
    {
      id_rule: 1,
      jenis: "Lembur Umum",
      urutan: 1,
      dari: 0,
      sampai: 60,
      pengali: 1.5,
      ket: "Jam pertama",
    },
    {
      id_rule: 2,
      jenis: "Lembur Umum",
      urutan: 2,
      dari: 61,
      sampai: 120,
      pengali: 2.0,
      ket: "Jam kedua",
    },
    {
      id_rule: 3,
      jenis: "Lembur Umum",
      urutan: 3,
      dari: 121,
      sampai: null,
      pengali: 3.0,
      ket: "Jam ketiga dst",
    },
    {
      id_rule: 4,
      jenis: "Lembur Cleaning",
      urutan: 1,
      dari: 0,
      sampai: null,
      pengali: 1.5,
      ket: "Flat rate",
    },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Aturan Pengali Lembur
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Konfigurasi Formula Perhitungan Gaji
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
        >
          <MdAdd size={20} /> Tambah Aturan
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="p-6">Kategori Lembur</th>
                <th className="p-6 text-center">Urutan</th>
                <th className="p-6">Rentang Menit</th>
                <th className="p-6 text-center">Pengali (x)</th>
                <th className="p-6 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[11px]">
              {rules.map((rule) => (
                <tr
                  key={rule.id_rule}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          rule.jenis.includes("Umum")
                            ? "bg-blue-50 text-blue-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        <MdGavel size={18} />
                      </div>
                      <span className="font-black text-custom-gelap dark:text-white uppercase tracking-tight">
                        {rule.jenis}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg font-black text-gray-400">
                      KE-{rule.urutan}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 font-mono font-bold text-gray-500">
                      <span className="bg-gray-50 dark:bg-white/5 px-2 py-1 rounded border border-gray-100 dark:border-white/10">
                        {rule.dari}
                      </span>
                      <span>sampai</span>
                      <span className="bg-gray-50 dark:bg-white/5 px-2 py-1 rounded border border-gray-100 dark:border-white/10">
                        {rule.sampai || "∞"}
                      </span>
                      <span className="text-[9px] uppercase font-poppins text-gray-400 ml-1 tracking-tighter">
                        Menit
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-custom-merah-terang text-white font-black text-sm shadow-md shadow-custom-merah-terang/20">
                      {rule.pengali}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-2">
                      <button className="p-2.5 bg-gray-100 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                        <MdEdit size={16} />
                      </button>
                      <button className="p-2.5 bg-gray-100 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
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

      {/* Logic Documentation Card */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-custom-gelap rounded-[35px] border border-gray-100 dark:border-white/5 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <MdTrendingUp size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">
              Logika Berjenjang (Progresif)
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Digunakan pada{" "}
              <span className="font-bold dark:text-white">Lembur Umum</span>.
              Pengali akan meningkat seiring bertambahnya durasi lembur (misal:
              jam ke-3 dibayar 3x lipat).
            </p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-custom-gelap rounded-[35px] border border-gray-100 dark:border-white/5 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <MdFunctions size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">
              Logika Flat (Tetap)
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              Digunakan pada{" "}
              <span className="font-bold dark:text-white">Lembur Cleaning</span>
              . Berapapun durasinya, pengali tetap sama sejak menit pertama.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
