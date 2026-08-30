import React, { useEffect, useState } from "react";
import {
  MdAdd,
  MdBusiness,
  MdClose,
  MdEmail,
  MdLocationOn,
  MdPhone,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalTambahClient = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({ code: "", name: "", address: "", phone: "", email: "" });
      setErrorMessage("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen && !isLoading) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.code.trim()) {
      setErrorMessage("Kode client wajib diisi.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage("Nama client wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      };

      const response = await Api.post("/work-item/master/clients", payload);

      if (!response.data?.success) {
        setErrorMessage(response.data?.message || "Gagal menambahkan client.");
        return;
      }

      await SwalHelper.success("Client berhasil ditambahkan.");

      onSuccess?.(response.data);
      onClose();
    } catch (error) {
      console.error("Gagal menambahkan client:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat menambahkan client.";

      setErrorMessage(message);
      await SwalHelper.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-white dark:bg-custom-gelap w-full max-w-xl rounded-[35px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center shadow-lg shadow-custom-merah-terang/20">
              <MdBusiness size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-custom-gelap dark:text-white tracking-tight">
                Tambah Client
              </h2>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-[2px] mt-1">
                Data Client Baru
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-custom-gelap dark:hover:text-white transition-colors disabled:opacity-50"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                <p className="text-[10px] font-bold text-red-500 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* CODE */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Kode Client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdBusiness
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Contoh: CL-0002"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                />
              </div>
            </div>

            {/* NAME */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Nama Client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MdBusiness
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama perusahaan/client"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                />
              </div>
            </div>

            {/* PHONE + EMAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Telepon
                </label>
                <div className="relative">
                  <MdPhone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nomor telepon"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Email
                </label>
                <div className="relative">
                  <MdEmail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email client"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Alamat
              </label>
              <div className="relative">
                <MdLocationOn
                  size={18}
                  className="absolute left-4 top-4 text-gray-400"
                />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Masukkan alamat client"
                  rows={4}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 resize-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-7 py-5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:bg-custom-merah transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MdAdd size={18} />
              )}
              {isLoading ? "Menyimpan..." : "Tambah Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTambahClient;
