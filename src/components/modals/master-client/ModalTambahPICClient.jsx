import React, { useEffect, useRef, useState } from "react";
import {
  MdAdd,
  MdBusiness,
  MdClose,
  MdEmail,
  MdPerson,
  MdPhone,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalTambahPic = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_client: "",
    name: "",
    position: "",
    phone: "",
    email: "",
  });

  const [clientOptions, setClientOptions] = useState([]);
  const [isLoadingClientOptions, setIsLoadingClientOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const clientDropdownRef = useRef(null);

  // =========================================================
  // FETCH CLIENT OPTIONS
  // =========================================================

  const fetchClientOptions = async () => {
    setIsLoadingClientOptions(true);

    try {
      const response = await Api.get("/work-item/master/clients/options");

      if (response.data?.success) {
        setClientOptions(response.data.data || []);
      } else {
        setClientOptions([]);
        setErrorMessage(
          response.data?.message || "Gagal mengambil daftar client.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil client options:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat mengambil daftar client.";

      setClientOptions([]);
      setErrorMessage(message);
    } finally {
      setIsLoadingClientOptions(false);
    }
  };

  // =========================================================
  // LOAD CLIENT OPTIONS SAAT MODAL DIBUKA
  // =========================================================

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setClientDropdownOpen(false);
      fetchClientOptions();
    }
  }, [isOpen]);

  // =========================================================
  // CLICK OUTSIDE DROPDOWN
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target)
      ) {
        setClientDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  // HANDLE CLOSE
  // =========================================================

  const handleClose = () => {
    if (isLoading) return;

    setFormData({
      id_client: "",
      name: "",
      position: "",
      phone: "",
      email: "",
    });

    setClientOptions([]);
    setErrorMessage("");
    setClientDropdownOpen(false);

    onClose();
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.id_client) {
      setErrorMessage("Client wajib dipilih.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage("Nama PIC wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        position: formData.position.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
      };

      const response = await Api.post(
        `/work-item/master/clients/${formData.id_client}/pics`,
        payload,
      );

      if (response.data?.success) {
        await SwalHelper.success("PIC berhasil ditambahkan.");

        onSuccess?.(response.data);
        handleClose();
      } else {
        setErrorMessage(response.data?.message || "Gagal menambahkan PIC.");
      }
    } catch (error) {
      console.error("Gagal menambahkan PIC:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat menambahkan PIC.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedClient = clientOptions.find(
    (client) => String(client.id_client) === String(formData.id_client),
  );

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) handleClose();
      }}
    >
      <div className="bg-white dark:bg-custom-gelap w-full max-w-xl rounded-[35px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center shadow-lg shadow-custom-merah-terang/20">
              <MdPerson size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-custom-gelap dark:text-white tracking-tight">
                Tambah PIC Client
              </h2>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-[2px] mt-1">
                Person In Charge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
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

            {/* CLIENT */}
            <div ref={clientDropdownRef}>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Client <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <MdBusiness
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    !isLoading &&
                    !isLoadingClientOptions &&
                    setClientDropdownOpen((prev) => !prev)
                  }
                  disabled={isLoading || isLoadingClientOptions}
                  className="w-full pl-11 pr-10 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-left text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50 transition-colors"
                >
                  <span
                    className={
                      selectedClient
                        ? "text-custom-gelap dark:text-white"
                        : "text-gray-400"
                    }
                  >
                    {isLoadingClientOptions
                      ? "Memuat client..."
                      : selectedClient?.name || "Pilih client"}
                  </span>

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className={`w-4 h-4 transition-transform ${clientDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m19 9-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>

                {clientDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-[100] bg-white dark:bg-[#3d2e39] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="max-h-52 overflow-y-auto p-1.5">
                      {clientOptions.length > 0 ? (
                        clientOptions.map((client) => {
                          const isSelected =
                            String(formData.id_client) ===
                            String(client.id_client);

                          return (
                            <button
                              key={client.id_client}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  id_client: client.id_client,
                                }));

                                setErrorMessage("");
                                setClientDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs transition-colors ${isSelected ? "bg-custom-merah-terang/10 text-custom-merah-terang font-bold" : "text-custom-gelap dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                            >
                              <span>{client.name}</span>

                              {isSelected && (
                                <span className="text-custom-merah-terang font-black">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Tidak ada client
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                  disabled={isLoading}
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
                    placeholder="Email PIC"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang/50 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-7 py-5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-3 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading || isLoadingClientOptions}
              className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:bg-custom-merah transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <MdAdd size={18} />
              )}

              {isLoading ? "Menyimpan..." : "Tambah PIC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTambahPic;
