import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  MdClose,
  MdSave,
  MdAccessTime,
  MdLocationOn,
  MdCalendarToday,
  MdWorkHistory,
} from "react-icons/md";
import Swal from "sweetalert2";
import Api from "../../utils/Api";

const ModalTambahPresensi = ({
  isOpen,
  onClose,
  onRefresh,
  currentFilterTanggal,
}) => {
  const [loading, setLoading] = useState(false);
  const [masterPegawai, setMasterPegawai] = useState([]);
  const [masterLokasi, setMasterLokasi] = useState([]);
  const [masterJamKerja, setMasterJamKerja] = useState([]);

  const initialFormState = {
    tanggal: currentFilterTanggal || new Date().toISOString().split("T")[0],
    id_pegawai: "",
    id_jam_kerja: "",
    jam_masuk: "",
    id_lokasi_masuk: "",
    jam_keluar: null,
    id_lokasi_keluar: null,
    istirahat_mulai: null,
    istirahat_selesai: null,
    id_lokasi_istirahat: null,
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fungsi untuk reset form
  const resetForm = () => {
    setFormData(initialFormState);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        tanggal: currentFilterTanggal || new Date().toISOString().split("T")[0],
      }));
    }
  }, [isOpen, currentFilterTanggal]);

  // 1. Fetch Master Data
  useEffect(() => {
    if (isOpen) {
      const fetchInitial = async () => {
        try {
          const [resPeg, resLok, resJam] = await Promise.all([
            Api.get("/pegawai/basic"),
            Api.get("/master/lokasi-absensi"),
            Api.get("/master/jam-kerja"), // Fetch master jam kerja
          ]);
          setMasterPegawai(resPeg.data.data);
          setMasterLokasi(resLok.data.data);
          setMasterJamKerja(resJam.data.data);
        } catch (err) {
          console.error("Gagal load data", err);
        }
      };
      fetchInitial();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Field Wajib termasuk Jam Kerja
    if (
      !formData.id_pegawai ||
      !formData.tanggal ||
      !formData.id_jam_kerja ||
      !formData.jam_masuk ||
      !formData.id_lokasi_masuk
    ) {
      return Swal.fire(
        "Peringatan",
        "Mohon isi Nama Pegawai, Tanggal, Jam Kerja, Jam Masuk, dan Lokasi Masuk",
        "warning"
      );
    }

    setLoading(true);
    try {
      const payload = {
        tanggal: formData.tanggal,
        id_pegawai: parseInt(formData.id_pegawai),
        id_jam_kerja: parseInt(formData.id_jam_kerja),
        jam_masuk: formData.jam_masuk,
        id_lokasi_masuk: parseInt(formData.id_lokasi_masuk),
        jam_keluar: formData.jam_keluar || null,
        id_lokasi_keluar: formData.id_lokasi_keluar
          ? parseInt(formData.id_lokasi_keluar)
          : null,
        istirahat_mulai: formData.istirahat_mulai || null,
        istirahat_selesai: formData.istirahat_selesai || null,
        id_lokasi_istirahat: formData.id_lokasi_istirahat
          ? parseInt(formData.id_lokasi_istirahat)
          : null,
      };

      await Api.post("/presensi/manual", payload);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Presensi manual telah ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      });

      resetForm(); // <--- FORM DIRESET DI SINI SETELAH SUKSES
      onRefresh(); // Refresh data di tabel utama
      onClose(); // Tutup modal
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[35px] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in duration-300">
        <div className="p-7">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">
              Input Presensi Manual
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 rounded-full transition-all"
            >
              <MdClose size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar"
          >
            {/* INPUT PEGAWAI */}
            <select
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-cerah font-mono" // Tambahkan font-mono di sini
              value={formData.id_pegawai}
              onChange={(e) =>
                setFormData({ ...formData, id_pegawai: e.target.value })
              }
            >
              <option value="" className="font-sans">
                Pilih Pegawai (NIP — NAMA)
              </option>
              {masterPegawai.map((p) => {
                // Menyeragamkan panjang NIP (asumsi NIP sekitar 10-12 karakter)
                // Karakter \u00A0 adalah non-breaking space agar spasi tidak diciutkan oleh HTML
                const paddedNip = p.nip.padEnd(12, "\u00A0");

                return (
                  <option key={p.id_pegawai} value={p.id_pegawai}>
                    {paddedNip} │ {p.nama_lengkap}
                  </option>
                );
              })}
            </select>

            {/* TANGGAL & JAM KERJA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdCalendarToday size={12} /> Tanggal
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none"
                  value={formData.tanggal}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdWorkHistory size={12} /> Jam Kerja *
                </label>
                <select
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-cerah"
                  value={formData.id_jam_kerja}
                  onChange={(e) =>
                    setFormData({ ...formData, id_jam_kerja: e.target.value })
                  }
                >
                  <option value="">Pilih Shift</option>
                  {masterJamKerja.map((j) => (
                    <option key={j.id_jam_kerja} value={j.id_jam_kerja}>
                      {j.nama_shift} ({j.jam_mulai} - {j.jam_selesai})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* JAM MASUK & LOKASI MASUK */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdAccessTime size={12} /> Jam Masuk *
                </label>
                <input
                  type="time"
                  disabled={!formData.id_jam_kerja}
                  className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none ${
                    !formData.id_jam_kerja
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  value={formData.jam_masuk}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_masuk: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1 flex items-center gap-1">
                  <MdLocationOn size={12} /> Lokasi Masuk *
                </label>
                <select
                  className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none ${
                    !formData.jam_masuk ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  value={formData.id_lokasi_masuk}
                  disabled={!formData.jam_masuk}
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
            </div>

            {/* OPSIONAL: ISTIRAHAT */}
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-[25px] border border-gray-100 dark:border-white/5 space-y-3">
              <p className="text-[9px] font-black text-custom-cerah uppercase tracking-widest flex items-center gap-2">
                Log Istirahat (Opsional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  disabled={!formData.id_lokasi_masuk}
                  className={`w-full bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 p-2.5 rounded-xl text-xs dark:text-white outline-none ${
                    !formData.id_lokasi_masuk
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  value={formData.istirahat_mulai || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      istirahat_mulai: e.target.value,
                    })
                  }
                />
                <input
                  type="time"
                  disabled={!formData.istirahat_mulai}
                  className={`}w-full bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 p-2.5 rounded-xl text-xs dark:text-white outline-none ${
                    !formData.istirahat_mulai
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  value={formData.istirahat_selesai || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      istirahat_selesai: e.target.value,
                    })
                  }
                />
              </div>
              <select
                className={`w-full p-2.5 rounded-xl text-xs dark:text-white outline-none border ${
                  !formData.istirahat_selesai
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={!formData.istirahat_selesai}
                value={formData.id_lokasi_istirahat || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id_lokasi_istirahat: e.target.value,
                  })
                }
              >
                <option value="">Lokasi Selesai Istirahat</option>
                {masterLokasi.map((l) => (
                  <option key={l.id_lokasi} value={l.id_lokasi}>
                    {l.nama_lokasi}
                  </option>
                ))}
              </select>
            </div>

            {/* OPSIONAL: KELUAR */}
            <div className="grid grid-cols-2 gap-4 opacity-80">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Jam Keluar
                </label>
                <input
                  type="time"
                  disabled={!formData.id_lokasi_istirahat}
                  className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none ${
                    !formData.id_lokasi_istirahat
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  value={formData.jam_keluar || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_keluar: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Lokasi Keluar
                </label>
                <select
                  disabled={!formData.jam_keluar}
                  className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 rounded-2xl text-xs dark:text-white outline-none ${
                    !formData.jam_keluar ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  value={formData.id_lokasi_keluar || ""}
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
              {loading ? "Sedang Memproses..." : "Simpan Presensi Manual"}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalTambahPresensi;
