import React, { useState, useEffect } from "react";
import Api from "../../utils/Api"; // Pastikan path ke config Api axios benar
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdBusiness,
  MdClose,
  MdCheckCircle,
  MdRefresh,
} from "react-icons/md";

const Departemen = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: "" });
  const [listDepartemen, setListDepartemen] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fungsi Fetch Data dari API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await Api.get("/master/departemen");
      if (response.data.success) {
        setListDepartemen(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data departemen:", error);
      alert("Terjadi kesalahan saat mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Load data saat komponen pertama kali dibuka
  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({ id: data.id_departemen, nama: data.nama_departemen });
    } else {
      setFormData({ id: null, nama: "" });
    }
    setShowModal(true);
  };

  // 3. Fungsi Simpan (Tambah/Edit) ke API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama) return alert("Nama departemen wajib diisi");

    setIsLoading(true);
    try {
      if (formData.id) {
        // Mode Edit
        await Api.put(`/master/departemen/${formData.id}`, {
          nama_departemen: formData.nama,
        });
      } else {
        // Mode Tambah
        await Api.post("/master/departemen", {
          nama_departemen: formData.nama,
        });
      }

      setShowModal(false);
      fetchData(); // Refresh data setelah simpan
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Filter data berdasarkan input search
  const filteredData = listDepartemen.filter((item) =>
    item.nama_departemen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, nama) => {
    // Konfirmasi sederhana (Bisa diganti dengan SweetAlert2 nanti)
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus departemen "${nama}"?`
    );

    if (confirmDelete) {
      setIsLoading(true);
      try {
        // Menggunakan endpoint DELETE /master/departemen/{id}
        const response = await Api.delete(`/master/departemen/${id}`);

        if (response.data.success) {
          // Refresh data setelah berhasil hapus
          fetchData();
          alert("Data berhasil dihapus");
        }
      } catch (error) {
        console.error("Gagal menghapus data:", error);
        alert(error.response?.data?.message || "Gagal menghapus data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Master Departemen
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Struktur Organisasi Berkah Angsana
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-3 bg-white dark:bg-custom-gelap text-custom-cerah rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:rotate-180 transition-all duration-500"
            title="Refresh Data"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
          >
            <MdAdd size={20} /> Tambah Departemen
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center">
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama departemen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang/50 transition-colors"
          />
        </div>
      </div>

      {/* Table List with Fixed Height & Scroll */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="p-6 w-24">ID</th>
                <th className="p-6">Nama Departemen</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-2 h-2 bg-custom-merah-terang rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-custom-merah-terang rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="w-2 h-2 bg-custom-merah-terang rounded-full animate-bounce [animation-delay:-.5s]"></div>
                      Loading Data...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((dept) => (
                  <tr
                    key={dept.id_departemen}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-5 font-black text-custom-merah-terang italic">
                      #{dept.id_departemen}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-gelap text-custom-cerah rounded-xl">
                          <MdBusiness size={18} />
                        </div>
                        <span className="text-sm font-bold text-custom-gelap dark:text-white">
                          {dept.nama_departemen}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          dept.status === 1
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {dept.status === 1 ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="p-2 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(
                              dept.id_departemen,
                              dept.nama_departemen
                            )
                          }
                          className="p-2 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Hapus Departemen"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-gray-400 italic"
                  >
                    Data tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-8 pb-4 flex justify-between items-center text-poppins">
              <h2 className="text-xl font-bold text-custom-gelap dark:text-white">
                {formData.id ? "Edit Departemen" : "Tambah Departemen"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="p-8 pt-4 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Nama Departemen
                </label>
                <div className="relative">
                  <MdBusiness
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-custom-cerah"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    placeholder="Contoh: Sipil"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[20px] text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 bg-custom-merah-terang text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    "Memproses..."
                  ) : (
                    <>
                      <MdCheckCircle size={18} /> Simpan Data
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Departemen;
