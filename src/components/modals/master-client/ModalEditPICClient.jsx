import React, { useEffect, useState } from "react";
import {
  MdBusiness,
  MdClose,
  MdEmail,
  MdPerson,
  MdPhone,
  MdSave,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalEditPICClient = ({ isOpen, onClose, onSuccess, picId }) => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // GET DETAIL PIC
  // =========================================================

  const fetchPIC = async () => {
    if (!picId) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await Api.get(`/work-item/master/client-pics/${picId}`);

      if (response.data?.success) {
        const data = response.data.data;

        setFormData({
          name: data?.name || "",
          position: data?.position || "",
          phone: data?.phone || "",
          email: data?.email || "",
        });
      } else {
        setErrorMessage(response.data?.message || "Gagal mengambil data PIC.");
      }
    } catch (error) {
      console.error("Gagal mengambil data PIC:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat mengambil data PIC.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // LOAD DATA SAAT MODAL DIBUKA
  // =========================================================

  useEffect(() => {
    if (isOpen && picId) {
      fetchPIC();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, picId]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!formData.name.trim()) {
      setErrorMessage("Nama PIC wajib diisi.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        position: formData.position.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      };

      /*
       * Sesuaikan endpoint PUT dengan endpoint backend Anda.
       */
      const response = await Api.put(
        `/work-item/master/client-pics/${picId}`,
        payload,
      );

      if (response.data?.success) {
        await SwalHelper.success("PIC berhasil diperbarui.");

        onSuccess?.(response.data);

        handleClose();
      } else {
        setErrorMessage(response.data?.message || "Gagal memperbarui PIC.");
      }
    } catch (error) {
      console.error("Gagal memperbarui PIC:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat memperbarui PIC.";

      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (isSaving) return;

    setFormData({
      name: "",
      position: "",
      phone: "",
      email: "",
    });

    setErrorMessage("");
    setIsLoading(false);

    onClose();
  };

  // =========================================================
  // RENDER
  // =========================================================

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading && !isSaving) {
          handleClose();
        }
      }}
    >
      <div className="bg-white dark:bg-custom-gelap w-full max-w-xl rounded-[35px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center shadow-lg shadow-custom-merah-terang/20">
              <MdPerson size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-custom-gelap dark:text-white tracking-tight">
                Edit PIC Client
              </h2>

              <p className="text-[9px] text-gray-400 font-black uppercase tracking-[2px] mt-1">
                Perbarui Data Person In Charge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading || isSaving}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-custom-gelap dark:hover:text-white transition-colors disabled:opacity-50"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="p-7 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* ERROR */}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
                <p className="text-[10px] font-bold text-red-500 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* LOADING */}

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-custom-merah-terang/20 border-t-custom-merah-terang rounded-full animate-spin" />

                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">
                  Memuat Data PIC...
                </p>
              </div>
            ) : (
              <>
                {/* NAME */}

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Nama PIC <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <MdPerson
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama PIC"
                      disabled={isSaving}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* POSITION */}

                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Jabatan
                  </label>

                  <div className="relative">
                    <MdBusiness
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="Contoh: Manager"
                      disabled={isSaving}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* PHONE + EMAIL */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PHONE */}

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
                        disabled={isSaving}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}

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
                        placeholder="Email PIC"
                        disabled={isSaving}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <div className="px-7 py-5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading || isSaving}
              className="px-5 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading || isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:bg-custom-merah transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MdSave size={18} />
              )}

              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditPICClient;
