import React, { useState, useEffect } from "react";
import Api from "../../utils/Api";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdEventAvailable,
  MdClose,
  MdCheckCircle,
  MdBlock,
  MdInfoOutline,
  MdRefresh,
} from "react-icons/md";

const Kategori = () => {
  const [showModal, setShowModal] = useState(false);
  const [listIzin, setListIzin] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    potong_cuti: false,
  });

  // 1. Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await Api.get("/master/jenis-izin");
      if (response.data.success) {
        setListIzin(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat jenis izin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle CRUD
  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({
        id: data.id_jenis_izin,
        nama: data.nama_izin,
        potong_cuti: data.potong_cuti,
      });
    } else {
      setFormData({ id: null, nama: "", potong_cuti: false });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      nama_izin: formData.nama,
      potong_cuti: formData.potong_cuti,
    };

    try {
      if (formData.id) {
        await Api.put(`/master/jenis-izin/${formData.id}`, payload);
      } else {
        await Api.post("/master/jenis-izin", payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Hapus kategori izin "${nama}"?`)) {
      setIsLoading(true);
      try {
        await Api.delete(`/master/jenis-izin/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || "Gagal menghapus data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter Search
  const filteredData = listIzin.filter((item) =>
    item.nama_izin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Kategori Izin & Cuti
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Pengaturan Parameter Absensi
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-3 bg-white dark:bg-custom-gelap text-custom-cerah rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
          >
            <MdAdd size={20} /> Tambah Kategori
          </button>
        </div>
      </div>

      {/* Toolbar Search */}
      <div className="bg-white dark:bg-custom-gelap p-3 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center">
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari jenis izin..."
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
                <th className="p-6">Nama Kategori Izin</th>
                <th className="p-6 text-center">Kebijakan Cuti</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[11px]">
              {isLoading && listIzin.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest"
                  >
                    Memuat Data...
                  </td>
                </tr>
              ) : (
                filteredData.map((izin) => (
                  <tr
                    key={izin.id_jenis_izin}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-5 font-black text-custom-merah-terang italic">
                      #{izin.id_jenis_izin}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-gelap text-custom-cerah rounded-xl">
                          <MdEventAvailable size={18} />
                        </div>
                        <span className="text-sm font-bold text-custom-gelap dark:text-white uppercase tracking-tight">
                          {izin.nama_izin}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {izin.potong_cuti ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-100 dark:border-red-500/20">
                          <MdBlock size={14} /> Memotong Cuti
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-100 dark:border-green-500/20">
                          <MdCheckCircle size={14} /> Bebas Cuti
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 text-[8px] font-black uppercase">
                        {izin.status === 1 ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(izin)}
                          className="p-2.5 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(izin.id_jenis_izin, izin.nama_izin)
                          }
                          className="p-2.5 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
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

      {/* Logic Information */}
      <div className="p-3 bg-white dark:bg-custom-gelap rounded-[35px] border border-gray-100 dark:border-white/5 flex items-center gap-4 shadow-sm">
        <div className="w-8 h-8 bg-custom-merah-terang/10 text-custom-merah-terang rounded-2xl flex items-center justify-center flex-shrink-0">
          <MdInfoOutline size={24} />
        </div>
        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed tracking-widest">
          Kategori yang berstatus{" "}
          <span className="text-red-500 font-black">"Memotong Cuti"</span> akan
          secara otomatis mengurangi saldo cuti tahunan pegawai.
        </p>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20 p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white tracking-tight">
                {formData.id ? "Edit Kategori" : "Tambah Kategori"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)}>
                <MdClose size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  Nama Jenis Izin
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  placeholder="Misal: Cuti Bersama"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <div>
                  <p className="text-xs font-bold dark:text-white">
                    Potong Kuota Cuti?
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase font-black">
                    Aktifkan jika mengurangi saldo
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.potong_cuti}
                  onChange={(e) =>
                    setFormData({ ...formData, potong_cuti: e.target.checked })
                  }
                  className="w-6 h-6 accent-custom-merah-terang cursor-pointer"
                />
              </div>

              <button
                disabled={isLoading}
                className="w-full py-4 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 mt-2 disabled:opacity-50 transition-all"
              >
                {isLoading ? "Memproses..." : "Simpan Kategori"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Kategori;
