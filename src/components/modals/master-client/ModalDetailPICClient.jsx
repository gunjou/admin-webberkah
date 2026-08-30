import React, { useEffect, useState } from "react";
import {
  MdBusiness,
  MdClose,
  MdEmail,
  MdPerson,
  MdPhone,
  MdWork,
} from "react-icons/md";
import Api from "../../../utils/Api";

const ModalDetailPICClient = ({ isOpen, onClose, picId }) => {
  const [pic, setPic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // GET DETAIL PIC
  // =========================================================

  const fetchDetailPIC = async () => {
    if (!picId) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await Api.get(`/work-item/master/client-pics/${picId}`);

      if (response.data?.success) {
        setPic(response.data.data);
      } else {
        setPic(null);
        setErrorMessage(
          response.data?.message || "Gagal mengambil detail PIC.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil detail PIC:", error);

      setPic(null);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat mengambil detail PIC.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // EFFECT
  // =========================================================

  useEffect(() => {
    if (isOpen && picId) {
      fetchDetailPIC();
    }

    if (!isOpen) {
      setPic(null);
      setErrorMessage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, picId]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (isLoading) return;

    setPic(null);
    setErrorMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[30px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
              <MdPerson size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-custom-gelap dark:text-white">
                Detail PIC
              </h2>

              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                Informasi Person In Charge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-custom-gelap dark:hover:text-white transition-colors disabled:opacity-50"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="px-6 py-5">
          {/* LOADING */}

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-custom-merah-terang/20 border-t-custom-merah-terang rounded-full animate-spin" />

              <p className="text-xs text-gray-400 font-medium mt-4">
                Memuat detail PIC...
              </p>
            </div>
          )}

          {/* ERROR */}

          {!isLoading && errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Gagal memuat data
              </p>

              <p className="text-xs text-red-500/80 mt-1">{errorMessage}</p>
            </div>
          )}

          {/* DATA */}

          {!isLoading && !errorMessage && pic && (
            <div className="space-y-5">
              {/* =================================================
                  PIC PROFILE
              ================================================== */}

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-custom-gelap dark:bg-[#3d2e39] text-custom-cerah flex items-center justify-center flex-shrink-0">
                    <MdPerson size={23} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-custom-gelap dark:text-white truncate">
                      {pic.name || "-"}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <MdWork size={14} className="text-custom-merah-terang" />

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {pic.position || "Jabatan tidak tersedia"}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                    Number(pic.is_active) === 1
                      ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                  }`}
                >
                  {Number(pic.is_active) === 1 ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>

              {/* =================================================
                  CLIENT
              ================================================== */}

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center flex-shrink-0">
                    <MdBusiness size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Client
                    </p>

                    <p className="text-sm font-bold text-custom-gelap dark:text-white truncate mt-0.5">
                      {pic.client_name || "-"}
                    </p>

                    {pic.client_code && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {pic.client_code}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  CONTACT
              ================================================== */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PHONE */}

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MdPhone size={16} className="text-custom-merah-terang" />

                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Telepon
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-custom-gelap dark:text-white break-all">
                    {pic.phone || "-"}
                  </p>
                </div>

                {/* EMAIL */}

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MdEmail size={16} className="text-custom-merah-terang" />

                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Email
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-custom-gelap dark:text-white break-all">
                    {pic.email || "-"}
                  </p>
                </div>
              </div>

              {/* =================================================
                  METADATA
              ================================================== */}

              <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      Dibuat Oleh
                    </p>

                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
                      {pic.created_by || "-"}
                    </p>

                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDate(pic.created_at)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      Diperbarui Oleh
                    </p>

                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">
                      {pic.updated_by || "-"}
                    </p>

                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatDate(pic.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailPICClient;
