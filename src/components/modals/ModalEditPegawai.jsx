import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { MdClose, MdSave, MdWork, MdContactPhone } from "react-icons/md";
import Api from "../../utils/Api";

const ModalEditPegawai = ({ isOpen, onClose, onRefresh, data }) => {
  const modalContentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [masterData, setMasterData] = useState({
    departemen: [],
    jabatan: [],
    status_pegawai: [],
    level_jabatan: [],
  });

  const [form, setForm] = useState({
    // Field Table: pegawai
    nama_lengkap: "",
    nama_panggilan: "",
    nip: "",
    jenis_kelamin: "",
    tanggal_masuk: "",
    id_status_pegawai: "",
    id_jabatan: "",
    id_departemen: "",

    // Field Table: pegawai_pribadi
    nik: "",
    alamat: "",
    no_telepon: "",
    email_pribadi: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    agama: "",
    status_nikah: "",
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

  useEffect(() => {
    if (isOpen && data) {
      const fetchMaster = async () => {
        try {
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
          console.error(err);
        }
      };
      fetchMaster();

      // Sinkronisasi data dari API ke Form
      setForm({
        nama_lengkap: data.nama_lengkap || "",
        nama_panggilan: data.nama_panggilan || "",
        nip: data.nip || "",
        jenis_kelamin: data.jenis_kelamin || "L",
        tanggal_masuk: data.tanggal_masuk || "",
        id_status_pegawai: data.id_status_pegawai || "",
        id_jabatan: data.id_jabatan || "",
        id_level_jabatan: data.id_level_jabatan || "",
        id_departemen: data.id_departemen || "",

        nik: data.nik || "",
        alamat: data.alamat || "",
        no_telepon: data.no_telepon || "",
        email_pribadi: data.email || "", // mapping dari pribadi.email di API Anda
        tempat_lahir: data.tempat_lahir || "",
        tanggal_lahir: data.tanggal_lahir || "",
        agama: data.agama || "",
        status_nikah: data.status_nikah || "",
      });
    }
  }, [isOpen, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // List field yang wajib diisi berdasarkan model backend
    const requiredFields = [
      { key: "nip", label: "NIP" },
      { key: "nama_lengkap", label: "Nama Lengkap" },
      { key: "nama_panggilan", label: "Nama Panggilan" },
      { key: "jenis_kelamin", label: "Jenis Kelamin" },
      { key: "tanggal_masuk", label: "Tanggal Masuk" },
      { key: "id_departemen", label: "Departemen" },
      { key: "id_jabatan", label: "Jabatan" },
      { key: "id_level_jabatan", label: "Level Jabatan" },
      { key: "id_status_pegawai", label: "Status Kerja" },
    ];

    // Validasi Loop
    for (const field of requiredFields) {
      if (!form[field.key] || form[field.key] === "") {
        alert(`${field.label} wajib diisi!`);
        return;
      }
    }

    setLoading(true);

    // Parsing data sebelum dikirim
    const payload = {
      ...form,
      id_departemen: parseInt(form.id_departemen),
      id_jabatan: parseInt(form.id_jabatan),
      id_level_jabatan: parseInt(form.id_level_jabatan),
      id_status_pegawai: parseInt(form.id_status_pegawai),
    };

    try {
      const res = await Api.put(
        `/pegawai/update-lengkap/${data.id_pegawai}`,
        payload
      );
      if (res.data.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal update data");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-custom-gelap w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50 dark:border-white/5">
          <h2 className="text-xl font-bold dark:text-white uppercase tracking-tight">
            Edit Profil Pegawai
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-all"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8"
        >
          {/* SEKSI 1: DATA PEGAWAI (Table: pegawai) */}
          <section className="space-y-5">
            <h3 className="text-[10px] font-black text-custom-merah-terang uppercase tracking-[3px] flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-2">
              <MdWork size={16} /> Informasi Kepegawaian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nama Lengkap <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.nama_lengkap}
                  onChange={(e) =>
                    setForm({ ...form, nama_lengkap: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nama Panggilan <span className="text-red-600">*</span>
                </label>
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.nama_panggilan}
                  onChange={(e) =>
                    setForm({ ...form, nama_panggilan: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  NIP <span className="text-red-600">*</span>
                </label>
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none"
                  value={form.nip}
                  //   disabled
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Departemen <span className="text-red-600">*</span>
                </label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none"
                  value={form.id_departemen}
                  onChange={(e) =>
                    setForm({ ...form, id_departemen: e.target.value })
                  }
                >
                  {masterData.departemen.map((d) => (
                    <option key={d.id_departemen} value={d.id_departemen}>
                      {d.nama_departemen}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Jabatan <span className="text-red-600">*</span>
                </label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none"
                  value={form.id_jabatan}
                  onChange={(e) =>
                    setForm({ ...form, id_jabatan: e.target.value })
                  }
                >
                  {masterData.jabatan.map((j) => (
                    <option key={j.id_jabatan} value={j.id_jabatan}>
                      {j.nama_jabatan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Level Jabatan <span className="text-red-600">*</span>
                </label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none"
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
                      {lvl.nama_level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Status Kerja <span className="text-red-600">*</span>
                </label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none"
                  value={form.id_status_pegawai}
                  onChange={(e) =>
                    setForm({ ...form, id_status_pegawai: e.target.value })
                  }
                >
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
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Tanggal Masuk <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  type="date"
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.tanggal_masuk}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_masuk: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          {/* SEKSI 2: DATA PRIBADI (Table: pegawai_pribadi) */}
          <section className="space-y-5">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] flex items-center gap-2 border-b border-gray-50 dark:border-white/5 pb-2">
              <MdContactPhone size={16} /> Informasi Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  NIK (KTP)
                </label>
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  No. Telepon
                </label>
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.no_telepon}
                  onChange={(e) =>
                    setForm({ ...form, no_telepon: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Email Pribadi
                </label>
                <input
                  type="email"
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.email_pribadi}
                  onChange={(e) =>
                    setForm({ ...form, email_pribadi: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Agama
                </label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none"
                  value={form.agama}
                  onChange={(e) => setForm({ ...form, agama: e.target.value })}
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Budha">Budha</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Tempat Lahir
                </label>
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.tempat_lahir}
                  onChange={(e) =>
                    setForm({ ...form, tempat_lahir: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang"
                  value={form.tanggal_lahir}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_lahir: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Status Nikah
                </label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none"
                  value={form.status_nikah}
                  onChange={(e) =>
                    setForm({ ...form, status_nikah: e.target.value })
                  }
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Jenis Kelamin
                </label>
                <div className="flex gap-4 p-2.5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                  <label className="flex items-center gap-1 text-[10px] dark:text-white cursor-pointer">
                    <input
                      type="radio"
                      value="L"
                      checked={form.jenis_kelamin === "L"}
                      onChange={(e) =>
                        setForm({ ...form, jenis_kelamin: e.target.value })
                      }
                      className="accent-custom-merah-terang"
                    />{" "}
                    L
                  </label>
                  <label className="flex items-center gap-1 text-[10px] dark:text-white cursor-pointer">
                    <input
                      type="radio"
                      value="P"
                      checked={form.jenis_kelamin === "P"}
                      onChange={(e) =>
                        setForm({ ...form, jenis_kelamin: e.target.value })
                      }
                      className="accent-custom-merah-terang"
                    />{" "}
                    P
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-4 space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Alamat Domisili
                </label>
                <textarea
                  className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs dark:text-white outline-none focus:border-custom-merah-terang h-20"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Footer Buttons */}
          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white dark:bg-custom-gelap py-4 border-t border-gray-50 dark:border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-custom-merah-terang text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MdSave size={18} />{" "}
              {loading ? "Menyimpan Data..." : "Simpan Perubahan"}
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

export default ModalEditPegawai;
