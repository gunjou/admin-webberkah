import React, { useState, useEffect, useRef } from "react";
import {
  MdClose,
  MdPerson,
  MdBadge,
  MdLock,
  MdCalendarToday,
  MdAssignmentInd, // Icon tambahan untuk status
} from "react-icons/md";
import ReactDOM from "react-dom";
import Api from "../../utils/Api";
import { toTitleCase, toSafeUsername } from "../../utils/Helpers";

const ModalTambahPegawai = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const modalContentRef = useRef(null);
  const [masterData, setMasterData] = useState({
    departemen: [],
    jabatan: [],
    status_pegawai: [],
    level_jabatan: [],
  });

  const [form, setForm] = useState({
    nama_lengkap: "",
    nip: "",
    username: "",
    password: "",
    tanggal_masuk: new Date().toISOString().split("T")[0],
    id_departemen: "",
    id_jabatan: "",
    id_level_jabatan: "",
    id_status_pegawai: "",
    jenis_kelamin: "L",
  });

  // Fetch data master untuk dropdown saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchMaster = async () => {
        try {
          // Sesuaikan endpoint master status pegawai sesuai backend Anda
          const [resDept, resJab, resStat, resLevel] = await Promise.all([
            Api.get("/master/departemen"),
            Api.get("/master/jabatan"),
            Api.get("/master/status-pegawai"),
            Api.get("/master/level-jabatan"),
          ]);
          setMasterData({
            departemen: resDept.data.data,
            jabatan: resJab.data.data,
            status_pegawai: resStat.data.data,
            level_jabatan: resLevel.data.data,
          });
        } catch (err) {
          console.error("Gagal load master data", err);
        }
      };
      fetchMaster();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Persiapan Payload dengan tipe data yang benar
    const payload = {
      nama_lengkap: toTitleCase(form.nama_lengkap),
      nip: form.nip,
      username: toSafeUsername(form.username),
      password: form.password,
      tanggal_masuk: form.tanggal_masuk,
      jenis_kelamin: form.jenis_kelamin,
      // Pastikan ID dikirim sebagai Number/Integer
      id_departemen: parseInt(form.id_departemen),
      id_jabatan: parseInt(form.id_jabatan),
      id_level_jabatan: parseInt(form.id_level_jabatan),
      id_status_pegawai: parseInt(form.id_status_pegawai),
    };

    // 2. Validasi sederhana sebelum kirim
    if (
      !payload.id_departemen ||
      !payload.id_jabatan ||
      !payload.id_status_pegawai
    ) {
      alert("Harap pilih Departemen, Jabatan, dan Status Pegawai");
      setLoading(false);
      return;
    }

    try {
      // Interceptor di Api.js akan otomatis menyisipkan Bearer Token di sini
      const res = await Api.post("/pegawai/register", payload);

      if (res.data.success) {
        alert("Pegawai berhasil didaftarkan!");

        // Reset Form ke kondisi awal
        setForm({
          nama_lengkap: "",
          nip: "",
          username: "",
          password: "",
          tanggal_masuk: new Date().toISOString().split("T")[0],
          id_departemen: "",
          id_jabatan: "",
          id_level_jabatan: "",
          id_status_pegawai: "",
          jenis_kelamin: "L",
        });

        onRefresh(); // Memanggil fetch data di halaman utama
        onClose(); // Menutup modal
      }
    } catch (err) {
      // Mengambil pesan error dari backend jika ada
      const errorMsg =
        err.response?.data?.message || "Gagal mendaftarkan pegawai";
      alert(errorMsg);
      console.error("Error Register:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Jika modalContentRef ada dan yang diklik BUKAN bagian dari konten modal
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(event.target)
      ) {
        onClose(); // Tutup modal
      }
    };

    if (isOpen) {
      // Tambahkan event listener saat modal terbuka
      document.addEventListener("mousedown", handleOutsideClick);
      // Mencegah scroll pada body saat modal terbuka
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Bersihkan event listener dan kembalikan scroll saat modal tertutup
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300 font-poppins">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-custom-gelap w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-custom-gelap dark:text-white uppercase tracking-tight">
              Pendaftaran Pegawai Baru
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Input Data Minimal Sistem
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Row 1: Nama & NIP */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-custom-cerah" />
                <input
                  required
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang"
                  value={form.nama_lengkap}
                  onChange={(e) =>
                    setForm({ ...form, nama_lengkap: e.target.value })
                  }
                  placeholder="Masukkan Nama Lengkap"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                NIP (Nomor Induk)
              </label>
              <div className="relative">
                <MdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-custom-cerah" />
                <input
                  required
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang"
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  placeholder="xx.xxxx.xx"
                />
              </div>
            </div>

            {/* Row 2: Auth Data */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Username Sistem
              </label>
              <div className="relative">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  required
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  required
                  type="password"
                  title="Minimal 6 karakter"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="******"
                />
              </div>
            </div>

            {/* Row 3: Struktur Organisasi */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Departemen
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang cursor-pointer"
                value={form.id_departemen}
                onChange={(e) =>
                  setForm({ ...form, id_departemen: e.target.value })
                }
              >
                <option value="">Pilih Departemen</option>
                {masterData.departemen.map((d) => (
                  <option key={d.id_departemen} value={d.id_departemen}>
                    {d.nama_departemen}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Jabatan
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang cursor-pointer"
                value={form.id_jabatan}
                onChange={(e) =>
                  setForm({ ...form, id_jabatan: e.target.value })
                }
              >
                <option value="">Pilih Jabatan</option>
                {masterData.jabatan.map((j) => (
                  <option key={j.id_jabatan} value={j.id_jabatan}>
                    {j.nama_jabatan}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Level Jabatan <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang cursor-pointer"
                value={form.id_level_jabatan}
                onChange={(e) =>
                  setForm({ ...form, id_level_jabatan: e.target.value })
                }
              >
                <option value="">Pilih Level</option>
                {masterData.level_jabatan.map((lvl) => (
                  <option
                    key={lvl.id_level_jabatan}
                    value={lvl.id_level_jabatan}
                  >
                    {lvl.nama_level} (Level {lvl.urutan_level})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 4: Status Pegawai & Tanggal Masuk */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Status Kepegawaian
              </label>
              <div className="relative">
                <MdAssignmentInd className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                <select
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang cursor-pointer"
                  value={form.id_status_pegawai}
                  onChange={(e) =>
                    setForm({ ...form, id_status_pegawai: e.target.value })
                  }
                >
                  <option value="">Pilih Status</option>
                  {masterData.status_pegawai.map((s) => (
                    <option
                      key={s.id_status_pegawai}
                      value={s.id_status_pegawai}
                    >
                      {s.nama_status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Tanggal Masuk
              </label>
              <div className="relative">
                <MdCalendarToday className="absolute left-4 top-1/2 -translate-y-1/2 text-custom-merah-terang" />
                <input
                  required
                  type="date"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang"
                  value={form.tanggal_masuk}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_masuk: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Row 5: Jenis Kelamin */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Jenis Kelamin
              </label>
              <div className="flex gap-8 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl">
                <label className="flex items-center gap-2 text-xs dark:text-white cursor-pointer group">
                  <input
                    type="radio"
                    name="jk"
                    value="L"
                    checked={form.jenis_kelamin === "L"}
                    onChange={(e) =>
                      setForm({ ...form, jenis_kelamin: e.target.value })
                    }
                    className="w-4 h-4 accent-custom-merah-terang"
                  />
                  <span className="font-bold group-hover:text-custom-merah-terang transition-colors">
                    Laki-laki
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs dark:text-white cursor-pointer group">
                  <input
                    type="radio"
                    name="jk"
                    value="P"
                    checked={form.jenis_kelamin === "P"}
                    onChange={(e) =>
                      setForm({ ...form, jenis_kelamin: e.target.value })
                    }
                    className="w-4 h-4 accent-custom-merah-terang"
                  />
                  <span className="font-bold group-hover:text-custom-merah-terang transition-colors">
                    Perempuan
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-custom-merah-terang text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Daftarkan Pegawai"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest"
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

export default ModalTambahPegawai;
