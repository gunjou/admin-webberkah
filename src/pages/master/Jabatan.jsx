import React, { useState, useEffect } from "react";
import Api from "../../utils/Api";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdBadge,
  MdClose,
  MdLayers,
  MdSort,
  MdRefresh,
} from "react-icons/md";

const Jabatan = () => {
  const [activeSubTab, setActiveSubTab] = useState("jabatan"); // "jabatan" atau "level"
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [listData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    urutan: "",
  });

  // 1. Fetch Data berdasarkan Tab yang aktif
  const fetchData = async () => {
    setIsLoading(true);
    const endpoint =
      activeSubTab === "jabatan" ? "/master/jabatan" : "/master/level-jabatan";
    try {
      const response = await Api.get(endpoint);
      if (response.data.success) {
        setListData(response.data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSearchTerm(""); // Reset search saat ganti tab
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab]);

  // 2. Handle CRUD Modal
  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({
        id:
          activeSubTab === "jabatan" ? data.id_jabatan : data.id_level_jabatan,
        nama: activeSubTab === "jabatan" ? data.nama_jabatan : data.nama_level,
        urutan: activeSubTab === "level" ? data.urutan_level : "",
      });
    } else {
      setFormData({ id: null, nama: "", urutan: "" });
    }
    setShowModal(true);
  };

  // 3. Simpan Data (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint =
      activeSubTab === "jabatan" ? "/master/jabatan" : "/master/level-jabatan";
    const payload =
      activeSubTab === "jabatan"
        ? { nama_jabatan: formData.nama }
        : { nama_level: formData.nama, urutan_level: formData.urutan };

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

  // 4. Hapus Data
  const handleDelete = async (id, name) => {
    if (window.confirm(`Hapus ${activeSubTab} "${name}"?`)) {
      setIsLoading(true);
      const endpoint =
        activeSubTab === "jabatan"
          ? "/master/jabatan"
          : "/master/level-jabatan";
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

  // Filter Search
  const filteredData = listData.filter((item) => {
    const name =
      activeSubTab === "jabatan" ? item.nama_jabatan : item.nama_level;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
            {activeSubTab === "jabatan" ? "Jabatan" : "Level"}
          </button>
        </div>
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

      {/* Search Bar */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center">
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder={`Cari ${activeSubTab}...`}
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
              {isLoading && listData.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center font-bold text-gray-400"
                  >
                    LOADING DATA...
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
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
                        {item.status === 1 ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              activeSubTab === "jabatan"
                                ? item.id_jabatan
                                : item.id_level_jabatan,
                              activeSubTab === "jabatan"
                                ? item.nama_jabatan
                                : item.nama_level
                            )
                          }
                          className="p-2 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
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

      {/* Info Context */}
      <div className="p-6 bg-custom-merah-terang/5 rounded-[30px] border border-custom-merah-terang/10 flex items-center gap-4">
        <MdSort className="text-custom-merah-terang" size={24} />
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed tracking-widest">
          {activeSubTab === "level"
            ? "Urutan Level Jabatan digunakan untuk mendefinisikan senioritas pegawai (1 = Terendah)."
            : "Jabatan mendefinisikan peran fungsional pegawai dalam struktur Berkah Angsana."}
        </p>
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
                Form {activeSubTab === "jabatan" ? "Jabatan" : "Level"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)}>
                <MdClose size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  Nama {activeSubTab === "jabatan" ? "Jabatan" : "Level"}
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

              {activeSubTab === "level" && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Urutan Level
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.urutan}
                    onChange={(e) =>
                      setFormData({ ...formData, urutan: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="1"
                  />
                </div>
              )}

              <button
                disabled={isLoading}
                className="w-full py-4 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 mt-4 disabled:opacity-50"
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

export default Jabatan;
