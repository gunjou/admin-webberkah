import React, { useState, useEffect } from "react";
import Api from "../../utils/Api";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdGavel,
  MdClose,
  MdFunctions,
  MdTrendingUp,
  MdRefresh,
} from "react-icons/md";

const Rules = () => {
  const [showModal, setShowModal] = useState(false);
  const [listRules, setListRules] = useState([]);
  const [listJenisLembur, setListJenisLembur] = useState([]); // State untuk dropdown
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    id_jenis_lembur: "",
    urutan_jam: "",
    menit_dari: "",
    menit_sampai: "",
    pengali: "",
  });

  // 1. Fetch Semua Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resRules, resJenis] = await Promise.all([
        Api.get("/master/lembur-rule"),
        Api.get("/master/jenis-lembur"),
      ]);

      if (resRules.data.success) setListRules(resRules.data.data);
      if (resJenis.data.success) setListJenisLembur(resJenis.data.data);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({
        id: data.id_rule,
        id_jenis_lembur: data.id_jenis_lembur,
        urutan_jam: data.urutan_jam,
        menit_dari: data.menit_dari,
        menit_sampai: data.menit_sampai || "",
        pengali: data.pengali,
      });
    } else {
      setFormData({
        id: null,
        id_jenis_lembur: "",
        urutan_jam: "",
        menit_dari: "",
        menit_sampai: "",
        pengali: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      id_jenis_lembur: parseInt(formData.id_jenis_lembur),
      urutan_jam: parseInt(formData.urutan_jam),
      menit_dari: parseInt(formData.menit_dari),
      menit_sampai: formData.menit_sampai
        ? parseInt(formData.menit_sampai)
        : null,
      pengali: parseFloat(formData.pengali),
    };

    try {
      if (formData.id) {
        await Api.put(`/master/lembur-rule/${formData.id}`, payload);
      } else {
        await Api.post("/master/lembur-rule", payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan aturan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus aturan perhitungan ini?")) {
      setIsLoading(true);
      try {
        await Api.delete(`/master/lembur-rule/${id}`);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus");
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
            Aturan Pengali Lembur
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Konfigurasi Formula Perhitungan Gaji
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-3 bg-white dark:bg-custom-gelap text-custom-cerah rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:rotate-180 transition-all duration-500"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
          >
            <MdAdd size={20} /> Tambah Rule
          </button>
        </div>
      </div>

      {/* Table Container */}
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
              {listRules.map((rule) => (
                <tr
                  key={rule.id_rule}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3 font-black text-custom-gelap dark:text-white uppercase tracking-tight">
                      <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-custom-cerah">
                        <MdGavel size={18} />
                      </div>
                      {rule.nama_jenis}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg font-black text-gray-400 uppercase">
                      Ke-{rule.urutan_jam}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 font-mono font-bold text-gray-500 italic">
                      {rule.menit_dari}{" "}
                      <span className="text-[10px] not-italic text-gray-400">
                        s/d
                      </span>{" "}
                      {rule.menit_sampai || "∞"}{" "}
                      <span className="text-[8px] uppercase font-poppins text-gray-400">
                        Menit
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-custom-merah-terang text-white font-black text-xs shadow-md shadow-custom-merah-terang/20">
                      {rule.pengali}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(rule)}
                        className="p-2 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id_rule)}
                        className="p-2 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                      >
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

      {/* Logic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-custom-gelap rounded-[30px] border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <MdTrendingUp className="text-blue-500" size={32} />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Sistem Progresif: Pengali meningkat seiring bertambahnya jam kerja
            lembur.
          </p>
        </div>
        <div className="p-5 bg-white dark:bg-custom-gelap rounded-[30px] border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <MdFunctions className="text-orange-500" size={32} />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Sistem Flat: Pengali tetap (konstan) berapapun durasi menit lembur
            yang dilakukan.
          </p>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20 p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">
                Konfigurasi Aturan
              </h2>
              <button type="button" onClick={() => setShowModal(false)}>
                <MdClose size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dropdown Jenis Lembur */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  Pilih Kategori Lembur
                </label>
                <select
                  required
                  value={formData.id_jenis_lembur}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_jenis_lembur: e.target.value,
                    })
                  }
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang cursor-pointer"
                >
                  <option value="">-- Pilih Jenis --</option>
                  {listJenisLembur.map((j) => (
                    <option key={j.id_jenis_lembur} value={j.id_jenis_lembur}>
                      {j.nama_jenis}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Urutan Jam
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.urutan_jam}
                    onChange={(e) =>
                      setFormData({ ...formData, urutan_jam: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Pengali (X)
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.pengali}
                    onChange={(e) =>
                      setFormData({ ...formData, pengali: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Menit Dari
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.menit_dari}
                    onChange={(e) =>
                      setFormData({ ...formData, menit_dari: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Menit Sampai
                  </label>
                  <input
                    type="number"
                    value={formData.menit_sampai}
                    onChange={(e) =>
                      setFormData({ ...formData, menit_sampai: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="Kosongkan jika ∞"
                  />
                </div>
              </div>

              <button
                disabled={isLoading}
                className="w-full py-4 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 mt-4 disabled:opacity-50 transition-all"
              >
                {isLoading ? "Memproses..." : "Simpan Aturan Perhitungan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Rules;
