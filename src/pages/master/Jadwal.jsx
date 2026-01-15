import React, { useState, useEffect } from "react";
import Api from "../../utils/Api";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdAccessTime,
  MdEventBusy,
  MdClose,
  MdEventNote,
  MdRefresh,
} from "react-icons/md";

const Jadwal = () => {
  const [activeSubTab, setActiveSubTab] = useState("shift"); // 'shift' atau 'libur'
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    value: "", // jam_per_hari untuk shift, tanggal untuk libur
    jenis: "nasional", // khusus libur
  });

  // 1. Fetch Data berdasarkan Tab
  const fetchData = async () => {
    setIsLoading(true);
    const endpoint = activeSubTab === "shift" ? "x" : "/master/hari-libur";
    try {
      const response = await Api.get(endpoint);
      if (response.data.success) {
        setListData(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSearchTerm("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab]);

  // 2. Handle CRUD
  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({
        id: activeSubTab === "shift" ? data.id_jam_kerja : data.id_libur,
        nama: activeSubTab === "shift" ? data.nama_shift : data.nama_libur,
        value: activeSubTab === "shift" ? data.jam_per_hari : data.tanggal,
        jenis: activeSubTab === "libur" ? data.jenis : "nasional",
      });
    } else {
      setFormData({ id: null, nama: "", value: "", jenis: "nasional" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint =
      activeSubTab === "shift" ? "/master/jam-kerja" : "/master/hari-libur";

    const payload =
      activeSubTab === "shift"
        ? { nama_shift: formData.nama, jam_per_hari: parseInt(formData.value) }
        : {
            nama_libur: formData.nama,
            tanggal: formData.value,
            jenis: formData.jenis,
          };

    try {
      if (formData.id) {
        await Api.put(`${endpoint}/${formData.id}`, payload);
      } else {
        await Api.post(endpoint, payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Hapus ${activeSubTab} "${name}"?`)) {
      setIsLoading(true);
      const endpoint =
        activeSubTab === "shift" ? "/master/jam-kerja" : "/master/hari-libur";
      try {
        await Api.delete(`${endpoint}/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || "Gagal menghapus");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter Data
  const filteredData = listData.filter((item) => {
    const searchField =
      activeSubTab === "shift" ? item.nama_shift : item.nama_libur;
    return searchField?.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-3 bg-white dark:bg-custom-gelap text-custom-cerah rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
          >
            <MdAdd size={20} /> Tambah{" "}
            {activeSubTab === "shift" ? "Shift" : "Libur"}
          </button>
        </div>
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

      {/* Toolbar Search */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center">
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={`Cari ${
              activeSubTab === "shift" ? "Nama Shift" : "Keterangan Libur"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang/50"
          />
        </div>
      </div>

      {/* Table Container */}
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
              {isLoading && listData.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center font-bold text-gray-400 uppercase"
                  >
                    Memuat Data...
                  </td>
                </tr>
              ) : (
                filteredData.map((item, i) => (
                  <tr
                    key={i}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    {activeSubTab === "shift" ? (
                      <>
                        <td className="p-5 font-black text-custom-merah-terang italic">
                          #{item.id_jam_kerja}
                        </td>
                        <td className="p-5 font-bold text-custom-gelap dark:text-white uppercase">
                          {item.nama_shift}
                        </td>
                        <td className="p-5 text-center font-mono text-blue-500 font-bold">
                          {item.jam_per_hari} mnt
                        </td>
                        <td className="p-5 text-center">
                          <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg font-black text-gray-400 uppercase">
                            {item.jam_per_hari / 60} Jam / Hari
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-5 font-bold text-custom-merah-terang flex items-center gap-2">
                          <MdEventNote size={16} /> {item.tanggal}
                        </td>
                        <td className="p-5 font-bold text-custom-gelap dark:text-white uppercase">
                          {item.nama_libur}
                        </td>
                        <td className="p-5 text-center">
                          <span
                            className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                              item.jenis === "nasional"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {item.jenis}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              activeSubTab === "shift"
                                ? item.id_jam_kerja
                                : item.id_libur,
                              activeSubTab === "shift"
                                ? item.nama_shift
                                : item.nama_libur
                            )
                          }
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-white/5 rounded-xl transition-all"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20 p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">
                Form {activeSubTab === "shift" ? "Shift Kerja" : "Hari Libur"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)}>
                <MdClose size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">
                  Nama {activeSubTab === "shift" ? "Shift" : "Keterangan Libur"}
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  placeholder="..."
                />
              </div>

              {activeSubTab === "shift" ? (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">
                    Durasi Kerja (Menit)
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="Misal: 480"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">
                      Tanggal Libur
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">
                      Jenis Libur
                    </label>
                    <select
                      value={formData.jenis}
                      onChange={(e) =>
                        setFormData({ ...formData, jenis: e.target.value })
                      }
                      className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    >
                      <option value="nasional">Nasional</option>
                      <option value="internal">Internal</option>
                    </select>
                  </div>
                </>
              )}

              <button
                disabled={isLoading}
                className="w-full py-4 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 mt-4 disabled:opacity-50 transition-all"
              >
                {isLoading ? "Memproses..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Jadwal;
