import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  MdClose,
  MdSave,
  MdSchool,
  MdAccountBalance,
  MdTimeline,
} from "react-icons/md";
import Api from "../../utils/Api";

const ModalEditPendidikan = ({ isOpen, onClose, onRefresh, data }) => {
  const [loading, setLoading] = useState(false);
  const modalContentRef = useRef(null);

  const [form, setForm] = useState({
    jenjang: "",
    institusi: "",
    jurusan: "",
    tahun_masuk: "",
    tahun_lulus: "",
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
        jenjang: data.pendidikan?.jenjang || "",
        institusi: data.pendidikan?.institusi || "",
        jurusan: data.pendidikan?.jurusan || "",
        tahun_masuk: data.pendidikan?.tahun_masuk || "",
        tahun_lulus: data.pendidikan?.tahun_lulus || "",
      });
    }
  }, [isOpen, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDASI: Cek semua field tidak boleh kosong
    if (
      !form.jenjang ||
      !form.institusi ||
      !form.jurusan ||
      !form.tahun_masuk ||
      !form.tahun_lulus
    ) {
      alert("Semua field pendidikan wajib diisi!");
      return;
    }

    // VALIDASI: Cek tahun masuk tidak boleh lebih besar dari tahun lulus
    if (parseInt(form.tahun_masuk) > parseInt(form.tahun_lulus)) {
      alert("Tahun masuk tidak boleh lebih besar dari tahun lulus!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_pegawai: data.id_pegawai,
        jenjang: form.jenjang,
        institusi: form.institusi,
        jurusan: form.jurusan,
        tahun_masuk: parseInt(form.tahun_masuk),
        tahun_lulus: parseInt(form.tahun_lulus),
      };

      const res = await Api.put(
        `/pegawai/update-pendidikan/${data.id_pegawai}`,
        payload
      );

      if (res.data.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui data pendidikan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-custom-gelap w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold dark:text-white uppercase tracking-tight flex items-center gap-2">
              <MdSchool className="text-custom-merah-terang" /> Pendidikan
              Terakhir
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Data Akademik: {data.nama_lengkap}
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
          <div className="grid grid-cols-2 gap-4">
            {/* Jenjang */}
            <div className="space-y-1 col-span-2 md:col-span-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Jenjang <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                value={form.jenjang}
                onChange={(e) => setForm({ ...form, jenjang: e.target.value })}
              >
                <option value="">Pilih Jenjang</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA/SMK">SMA/SMK</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>

            {/* Institusi */}
            <div className="space-y-1 col-span-2 md:col-span-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Institusi/Kampus <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdAccountBalance className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  placeholder="Nama Institusi"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.institusi}
                  onChange={(e) =>
                    setForm({ ...form, institusi: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Jurusan */}
            <div className="space-y-1 col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Jurusan <span className="text-red-500">*</span>
              </label>
              <input
                required
                placeholder="Contoh: Teknik Informatika"
                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                value={form.jurusan}
                onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
              />
            </div>

            {/* Tahun Masuk */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Tahun Masuk <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdTimeline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="number"
                  placeholder="2020"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.tahun_masuk}
                  onChange={(e) =>
                    setForm({ ...form, tahun_masuk: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Tahun Lulus */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Tahun Lulus <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdTimeline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="number"
                  placeholder="2024"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.tahun_lulus}
                  onChange={(e) =>
                    setForm({ ...form, tahun_lulus: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-custom-merah-terang text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MdSave size={18} />{" "}
              {loading ? "Menyimpan..." : "Simpan Pendidikan"}
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

export default ModalEditPendidikan;
