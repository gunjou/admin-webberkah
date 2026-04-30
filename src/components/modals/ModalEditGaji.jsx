import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { MdClose, MdPayments } from "react-icons/md";
import Api from "../../utils/Api";
import Swal from "sweetalert2";

const ModalEditGaji = ({ isOpen, onClose, onRefresh, data }) => {
  const [loading, setLoading] = useState(false);
  const modalContentRef = useRef(null);

  const [form, setForm] = useState({
    gaji_pokok: "",
    t_jab: "",
    t_khs: "",
    t_trp: "",
    t_mkn: "",
  });

  // --- HELPER FUNCTIONS ---

  // Menghapus semua karakter kecuali angka, lalu menambah titik setiap 3 digit
  const formatRupiah = (value) => {
    if (!value) return "";
    const numberString = value.toString().replace(/[^0-9]/g, "");
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Mengembalikan string bertitik ke tipe data Integer untuk API
  const parseToNumber = (value) => {
    if (!value) return 0;
    return parseInt(value.toString().replace(/\./g, ""), 10) || 0;
  };

  // --- HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Otomatis terformat saat user mengetik
    setForm((prev) => ({
      ...prev,
      [name]: formatRupiah(value),
    }));
  };

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
      const getVal = (kode) =>
        data.komponen_gaji?.find((c) => c.kode === kode)?.nilai || 0;

      setForm({
        gaji_pokok: formatRupiah(data.gaji_pokok || 0),
        t_jab: formatRupiah(getVal("T_JAB")),
        t_khs: formatRupiah(getVal("T_KHS")),
        t_trp: formatRupiah(getVal("T_TRP")),
        t_mkn: formatRupiah(getVal("T_MKN")),
      });
    }
  }, [isOpen, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Helper untuk mencari id_komponen asli dari data awal berdasarkan kode
      const getCompId = (kode) =>
        data.komponen_gaji?.find((c) => c.kode === kode)?.id_komponen;

      // Konstruksi payload sesuai ekspektasi API Anda
      const payload = {
        gaji_pokok: parseToNumber(form.gaji_pokok),
        komponen_gaji: [
          { id_komponen: getCompId("T_JAB"), nilai: parseToNumber(form.t_jab) },
          { id_komponen: getCompId("T_KHS"), nilai: parseToNumber(form.t_khs) },
          { id_komponen: getCompId("T_TRP"), nilai: parseToNumber(form.t_trp) },
          { id_komponen: getCompId("T_MKN"), nilai: parseToNumber(form.t_mkn) },
        ].filter((item) => item.id_komponen !== undefined), // Pastikan hanya ID yang ada yang terkirim
      };

      const res = await Api.put(
        `/pegawai/update-gaji/${data.id_pegawai}`,
        payload,
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data gaji berhasil diperbarui dengan ID Komponen.",
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: "rounded-[30px]" },
        });
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-custom-gelap w-full max-w-xl rounded-[40px] shadow-2xl border border-white/20 animate-in zoom-in duration-300"
      >
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold dark:text-white uppercase tracking-tight flex items-center gap-2">
              <MdPayments className="text-custom-merah-terang" /> Edit Nominal
              Gaji
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
              Pegawai:{" "}
              <span className="text-custom-gelap dark:text-white">
                {data.nama_lengkap}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 rounded-full"
          >
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Gaji Pokok Utama
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-custom-merah-terang">
                  Rp
                </span>
                <input
                  required
                  type="text"
                  name="gaji_pokok"
                  value={form.gaji_pokok}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-black dark:text-white outline-none focus:border-custom-merah-terang transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Input Tunjangan lainnya (T_JAB, T_KHS, etc) */}
            {[
              {
                label: "T. Jabatan",
                name: "t_jab",
                color: "focus:border-blue-500",
              },
              {
                label: "T. Khusus",
                name: "t_khs",
                color: "focus:border-purple-500",
              },
              {
                label: "T. Transport",
                name: "t_trp",
                color: "focus:border-orange-500",
              },
              {
                label: "T. Makan",
                name: "t_mkn",
                color: "focus:border-green-500",
              },
            ].map((item) => (
              <div key={item.name} className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {item.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    name={item.name}
                    value={form[item.name]}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none ${item.color} transition-all`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-custom-merah-terang text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? "Sinkronisasi..." : "Simpan Perubahan Gaji"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 dark:bg-white/10 text-gray-400 rounded-[20px] text-[10px] font-black uppercase tracking-widest"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ModalEditGaji;
