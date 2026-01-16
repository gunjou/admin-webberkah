import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  MdClose,
  MdSave,
  MdAccessTime,
  MdLocationOn,
  MdCoffee,
} from "react-icons/md";
import Swal from "sweetalert2";
import Api from "../../utils/Api";

const ModalEditPresensi = ({ isOpen, onClose, data, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [masterLokasi, setMasterLokasi] = useState([]);
  const [formData, setFormData] = useState({
    jam_masuk: "",
    jam_keluar: "",
    id_lokasi_masuk: "",
    id_lokasi_keluar: "",
    istirahat_mulai: "",
    istirahat_selesai: "",
    id_lokasi_istirahat: "",
  });

  const isIstirahatMulaiEmpty = !formData.istirahat_mulai;
  const isIstirahatSelesaiEmpty = !formData.istirahat_selesai;
  const isJamKeluarEmpty = !formData.jam_keluar;

  // 1. Fetch Master Lokasi
  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        const res = await Api.get("/master/lokasi-absensi");
        setMasterLokasi(res.data.data);
      } catch (err) {
        console.error("Gagal load master lokasi", err);
      }
    };
    if (isOpen) fetchLokasi();
  }, [isOpen]);

  // 2. Sinkronisasi data awal (Reset state setiap data berubah)
  useEffect(() => {
    if (data) {
      setFormData({
        jam_masuk: data.presensi.jam_masuk || "",
        jam_keluar: data.presensi.jam_keluar || "",
        id_lokasi_masuk: data.presensi.id_lokasi_masuk || "",
        id_lokasi_keluar: data.presensi.id_lokasi_keluar || "",
        istirahat_mulai: data.presensi.istirahat.jam_mulai || "",
        istirahat_selesai: data.presensi.istirahat.jam_selesai || "",
        id_lokasi_istirahat: data.presensi.istirahat.id_lokasi_istirahat || "",
      });
    }
  }, [data]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Frontend sebelum kirim (Sesuai permintaan sebelumnya)
    if (formData.id_lokasi_istirahat && !formData.istirahat_selesai) {
      return Swal.fire(
        "Peringatan",
        "Jam selesai istirahat harus diisi sebelum memilih lokasi",
        "warning"
      );
    }

    const isTryingCheckout = formData.jam_keluar || formData.id_lokasi_keluar;
    const isIstirahatEmpty =
      !formData.istirahat_mulai || !formData.istirahat_selesai;

    if (isTryingCheckout && isIstirahatEmpty) {
      return Swal.fire(
        "Peringatan",
        "Data istirahat harus lengkap sebelum mengisi data checkout",
        "warning"
      );
    }

    setLoading(true);

    try {
      const idAbsensi = data?.presensi?.id_absensi;
      if (!idAbsensi) throw new Error("ID Absensi tidak ditemukan");

      // 1. Susun Payload dengan semua field (mengembalikan null jika kosong)
      const payload = {
        jam_masuk: formData.jam_masuk || null,
        jam_keluar: formData.jam_keluar || null,
        // Konversi ke Integer jika ada, jika tidak kirim null
        id_lokasi_masuk: formData.id_lokasi_masuk
          ? parseInt(formData.id_lokasi_masuk)
          : null,
        id_lokasi_keluar: formData.id_lokasi_keluar
          ? parseInt(formData.id_lokasi_keluar)
          : null,
        istirahat_mulai: formData.istirahat_mulai || null,
        istirahat_selesai: formData.istirahat_selesai || null,
        id_lokasi_istirahat: formData.id_lokasi_istirahat
          ? parseInt(formData.id_lokasi_istirahat)
          : null,
      };

      console.log("Payload dikirim:", payload);

      // 2. Kirim ke API
      await Api.put(`/presensi/${idAbsensi}`, payload);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Log presensi telah diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });

      onRefresh();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-custom-gelap w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10">
        <div className="p-7">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">
                Edit Log Log
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Pegawai:{" "}
                <span className="text-custom-cerah">
                  {data?.pegawai.nama_lengkap}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-full transition-all"
            >
              <MdClose size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* GRID JAM UTAMA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdAccessTime size={12} /> Jam Masuk
                </label>
                <input
                  type="time"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-cerah"
                  value={formData.jam_masuk}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_masuk: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdAccessTime size={12} /> Jam Keluar
                </label>
                <input
                  type="time"
                  disabled={isIstirahatMulaiEmpty || isIstirahatSelesaiEmpty} // DISABLE JIKA ISTIRAHAT KOSONG
                  className={`w-full p-3 rounded-2xl text-xs dark:text-white outline-none border ${
                    isIstirahatMulaiEmpty || isIstirahatSelesaiEmpty
                      ? "bg-gray-200 dark:bg-white/5 opacity-50 cursor-not-allowed"
                      : "bg-gray-50 dark:bg-white/5 border-gray-100"
                  }`}
                  value={formData.jam_keluar}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_keluar: e.target.value })
                  }
                />
              </div>
            </div>

            {/* LOG ISTIRAHAT */}
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-[25px] border border-gray-100 dark:border-white/5 space-y-3">
              <p className="text-[9px] font-black text-custom-cerah uppercase tracking-widest flex items-center gap-2">
                <MdCoffee size={14} /> Periode Istirahat
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  className="w-full bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 p-2.5 rounded-xl text-xs dark:text-white outline-none"
                  value={formData.istirahat_mulai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      istirahat_mulai: e.target.value,
                    })
                  }
                />
                <input
                  type="time"
                  className={`w-full bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 p-2.5 rounded-xl text-xs dark:text-white outline-none${
                    isIstirahatMulaiEmpty
                      ? "bg-gray-100 dark:bg-white/5 border-transparent cursor-not-allowed opacity-50"
                      : "bg-white dark:bg-custom-gelap border-gray-100 dark:border-white/10"
                  }`}
                  disabled={isIstirahatMulaiEmpty}
                  value={formData.istirahat_selesai}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      istirahat_selesai: e.target.value,
                    })
                  }
                />
              </div>
              <select
                className={`w-full p-2.5 rounded-xl text-xs dark:text-white outline-none border transition-all ${
                  isIstirahatSelesaiEmpty
                    ? "bg-gray-100 dark:bg-white/5 border-transparent cursor-not-allowed opacity-50"
                    : "bg-white dark:bg-custom-gelap border-gray-100 dark:border-white/10"
                }`}
                value={formData.id_lokasi_istirahat}
                disabled={isIstirahatSelesaiEmpty} // DISABLE JIKA JAM SELESAI NULL
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id_lokasi_istirahat: e.target.value,
                  })
                }
              >
                <option value="">Lokasi Check-in Istirahat</option>
                {masterLokasi.map((l) => (
                  <option key={l.id_lokasi} value={l.id_lokasi}>
                    {l.nama_lokasi}
                  </option>
                ))}
              </select>
            </div>

            {/* DROPDOWN LOKASI UTAMA */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdLocationOn size={12} /> Penempatan Masuk
                </label>
                <select
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-cerah"
                  value={formData.id_lokasi_masuk}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_lokasi_masuk: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Lokasi</option>
                  {masterLokasi.map((l) => (
                    <option key={l.id_lokasi} value={l.id_lokasi}>
                      {l.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdLocationOn size={12} /> Penempatan Keluar
                </label>
                <select
                  disabled={isJamKeluarEmpty} // DISABLE JIKA ISTIRAHAT KOSONG
                  className={`w-full p-3 rounded-2xl text-xs dark:text-white outline-none border ${
                    isJamKeluarEmpty
                      ? "bg-gray-200 dark:bg-white/5 opacity-50 cursor-not-allowed"
                      : "bg-gray-50 dark:bg-white/5 border-gray-100"
                  }`}
                  value={formData.id_lokasi_keluar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_lokasi_keluar: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Lokasi</option>
                  {masterLokasi.map((l) => (
                    <option key={l.id_lokasi} value={l.id_lokasi}>
                      {l.nama_lokasi}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-[20px] font-black text-[10px] uppercase tracking-[2px] flex items-center justify-center gap-3 transition-all
                ${
                  loading
                    ? "bg-gray-400 dark:bg-white/10 text-gray-200 cursor-not-allowed shadow-none"
                    : "bg-custom-merah text-white shadow-lg shadow-custom-cerah/20 hover:scale-[1.01] active:scale-95"
                }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MdSave size={18} />
              )}
              {loading ? "Sedang Memproses..." : "Update Informasi Presensi"}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalEditPresensi;
