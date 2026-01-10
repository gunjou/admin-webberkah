import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  MdClose,
  MdSave,
  MdAccountBalance,
  MdCreditCard,
  MdBadge,
} from "react-icons/md";
import Api from "../../utils/Api";

const ModalEditRekening = ({ isOpen, onClose, onRefresh, data }) => {
  const [loading, setLoading] = useState(false);
  const modalContentRef = useRef(null);

  const [form, setForm] = useState({
    nama_bank: "",
    no_rekening: "",
    atas_nama: "",
  });

  // Handle Click Outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Sync data saat modal dibuka
  useEffect(() => {
    if (isOpen && data) {
      setForm({
        nama_bank: data.rekening?.bank || "", // Sesuaikan dengan key API Anda: bank
        no_rekening: data.rekening?.nomor || "", // Sesuaikan dengan key API Anda: nomor
        atas_nama: data.rekening?.an || "", // Sesuaikan dengan key API Anda: an
      });
    }
  }, [isOpen, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_bank || !form.no_rekening) {
      alert("Nama Bank dan Nomor Rekening wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      // Menyesuaikan payload dengan struktur table: nama_bank, no_rekening, atas_nama
      const payload = {
        nama_bank: form.nama_bank,
        no_rekening: form.no_rekening,
        atas_nama: form.atas_nama,
      };

      const res = await Api.put(
        `/pegawai/update-rekening/${data.id_pegawai}`,
        payload
      );

      if (res.data.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui data rekening");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold dark:text-white uppercase tracking-tight flex items-center gap-2">
              <MdAccountBalance className="text-green-500" /> Rekening Payroll
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Update Informasi Bank: {data.nama_lengkap}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          {/* Nama Bank */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Nama Bank <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MdAccountBalance className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                placeholder="Contoh: BRI, BCA, Mandiri"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-green-500 transition-all"
                value={form.nama_bank}
                onChange={(e) =>
                  setForm({ ...form, nama_bank: e.target.value })
                }
              />
            </div>
          </div>

          {/* Nomor Rekening */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Nomor Rekening <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MdCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="number"
                placeholder="Masukkan nomor rekening..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-green-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={form.no_rekening}
                onChange={(e) =>
                  setForm({ ...form, no_rekening: e.target.value })
                }
              />
            </div>
          </div>

          {/* Atas Nama */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Atas Nama Rekening
            </label>
            <div className="relative">
              <MdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Sesuai buku tabungan..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-green-500 transition-all"
                value={form.atas_nama}
                onChange={(e) =>
                  setForm({ ...form, atas_nama: e.target.value })
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-green-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MdSave size={18} />{" "}
              {loading ? "Menyimpan..." : "Simpan Rekening"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ModalEditRekening;
