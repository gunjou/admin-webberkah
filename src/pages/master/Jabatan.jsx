import React, { useState } from "react";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdBadge,
  MdClose,
  MdCheckCircle,
  MdLayers,
  MdSort,
} from "react-icons/md";

const Jabatan = () => {
  const [activeSubTab, setActiveSubTab] = useState("jabatan");
  const [showModal, setShowModal] = useState(false);

  // Data sesuai SQL ref_jabatan
  const [listJabatan] = useState([
    { id_jabatan: 1, nama_jabatan: "Direktur", status: 1 },
    { id_jabatan: 2, nama_jabatan: "Manager", status: 1 },
    { id_jabatan: 3, nama_jabatan: "Supervisor", status: 1 },
    { id_jabatan: 4, nama_jabatan: "Koordinator", status: 1 },
    { id_jabatan: 5, nama_jabatan: "Pekerja / Staff", status: 1 },
    { id_jabatan: 6, nama_jabatan: "Pekerja Lepas", status: 1 },
    { id_jabatan: 7, nama_jabatan: "Magang", status: 1 },
  ]);

  // Data sesuai SQL ref_level_jabatan
  const [listLevel] = useState([
    { id_level_jabatan: 1, nama_level: "Pemula", urutan_level: 1 },
    { id_level_jabatan: 2, nama_level: "Menengah", urutan_level: 2 },
    { id_level_jabatan: 3, nama_level: "Senior", urutan_level: 3 },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Jabatan & Hirarki
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Struktur Jabatan Berkah Angsana
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
        >
          <MdAdd size={20} /> Tambah{" "}
          {activeSubTab === "jabatan" ? "Jabatan" : "Level"}
        </button>
      </div>

      {/* Switcher Tab */}
      <div className="flex bg-white dark:bg-custom-gelap p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setActiveSubTab("jabatan")}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeSubTab === "jabatan"
              ? "bg-custom-merah-terang text-white shadow-md"
              : "text-gray-400 hover:text-custom-merah-terang"
          }`}
        >
          <MdBadge size={16} /> Daftar Jabatan
        </button>
        <button
          onClick={() => setActiveSubTab("level")}
          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeSubTab === "level"
              ? "bg-custom-merah-terang text-white shadow-md"
              : "text-gray-400 hover:text-custom-merah-terang"
          }`}
        >
          <MdLayers size={16} /> Level Jabatan
        </button>
      </div>

      {/* Table Container with MAX-HEIGHT */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                <th className="p-6 w-24">ID</th>
                <th className="p-6">
                  {activeSubTab === "jabatan"
                    ? "Nama Jabatan"
                    : "Kategori Level"}
                </th>
                {activeSubTab === "level" && (
                  <th className="p-6 text-center">Urutan</th>
                )}
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[11px]">
              {(activeSubTab === "jabatan" ? listJabatan : listLevel).map(
                (item) => (
                  <tr
                    key={
                      activeSubTab === "jabatan"
                        ? item.id_jabatan
                        : item.id_level_jabatan
                    }
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-5 font-black text-custom-merah-terang italic">
                      #
                      {activeSubTab === "jabatan"
                        ? item.id_jabatan
                        : item.id_level_jabatan}
                    </td>
                    <td className="p-5 font-bold text-custom-gelap dark:text-white uppercase tracking-tight">
                      {activeSubTab === "jabatan"
                        ? item.nama_jabatan
                        : item.nama_level}
                    </td>
                    {activeSubTab === "level" && (
                      <td className="p-5 text-center">
                        <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg font-black text-custom-cerah">
                          {item.urutan_level}
                        </span>
                      </td>
                    )}
                    <td className="p-5 text-center">
                      <span className="px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter bg-green-100 text-green-600">
                        Aktif
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <MdEdit size={16} />
                        </button>
                        <button className="p-2 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                          <MdDeleteOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Context */}
      <div className="p-6 bg-custom-merah-terang/5 rounded-[30px] border border-custom-merah-terang/10 flex items-center gap-4">
        <MdSort className="text-custom-merah-terang" size={24} />
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed tracking-widest">
          {activeSubTab === "level"
            ? "Urutan Level Jabatan digunakan untuk mendefinisikan senioritas pegawai (Pemula - Senior)."
            : "Jabatan mendefinisikan peran fungsional pegawai dalam struktur Berkah Angsana."}
        </p>
      </div>

      {/* Modal Form Placeholder */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300 text-poppins">
          <div className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">
                Form {activeSubTab === "jabatan" ? "Jabatan" : "Level"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <MdClose size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  Nama {activeSubTab === "jabatan" ? "Jabatan" : "Level"}
                </label>
                <input
                  type="text"
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  placeholder="..."
                />
              </div>

              <button className="w-full py-4 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 mt-4">
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jabatan;
