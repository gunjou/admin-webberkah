import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdBusiness,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdPerson,
  MdCalendarToday,
  MdUpdate,
  MdRefresh,
} from "react-icons/md";
import Api from "../../../utils/Api";

const ModalDetailClient = ({ clientId, isOpen, onClose }) => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDetail = async () => {
    if (!clientId) return;

    setIsLoading(true);
    setErrorMessage("");
    setClient(null);

    try {
      const response = await Api.get(`/work-item/master/clients/${clientId}`);

      if (response.data?.success) {
        setClient(response.data.data);
      } else {
        setErrorMessage(
          response.data?.message || "Gagal mengambil detail client.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil detail client:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat mengambil detail client.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && clientId) {
      fetchDetail();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-custom-gelap w-full max-w-xl rounded-[30px] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
              <MdBusiness size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-custom-gelap dark:text-white">
                Detail Client
              </h2>

              <p className="text-[10px] text-gray-400 mt-0.5">
                Informasi lengkap client
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-custom-gelap dark:hover:text-white transition-colors"
          >
            <MdClose size={21} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="min-h-[260px] flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-[3px] border-custom-merah-terang/20 border-t-custom-merah-terang rounded-full animate-spin" />

              <p className="text-xs text-gray-400 font-bold mt-4">
                Memuat detail...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="min-h-[260px] flex flex-col items-center justify-center text-center">
              <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                <MdBusiness size={22} />
              </div>

              <p className="text-sm font-bold text-red-500 mt-3">
                Gagal Memuat Data
              </p>

              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                {errorMessage}
              </p>

              <button
                onClick={fetchDetail}
                className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-custom-merah-terang text-white rounded-xl text-xs font-bold hover:bg-custom-merah transition-colors"
              >
                <MdRefresh size={16} />
                Coba Lagi
              </button>
            </div>
          ) : client ? (
            <div className="space-y-5">
              {/* =====================================================
                  IDENTITY
              ====================================================== */}

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium">Client</p>

                    <h3 className="text-lg font-bold text-custom-gelap dark:text-white mt-0.5">
                      {client.name}
                    </h3>
                  </div>

                  <span className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-custom-merah-terang/10 text-custom-merah-terang text-xs font-bold">
                    {client.code || "-"}
                  </span>
                </div>
              </div>

              {/* =====================================================
                  CONTACT
              ====================================================== */}

              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">
                  Informasi Kontak
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* PHONE */}
                  <div className="px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <MdPhone
                        size={18}
                        className="text-blue-500 flex-shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400">Telepon</p>

                        <p className="text-sm font-semibold text-custom-gelap dark:text-white mt-0.5 truncate">
                          {client.phone || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <MdEmail
                        size={18}
                        className="text-purple-500 flex-shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400">Email</p>

                        <p className="text-sm font-semibold text-custom-gelap dark:text-white mt-0.5 truncate">
                          {client.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  ADDRESS
              ====================================================== */}

              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">Alamat</p>

                <div className="px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                  <div className="flex items-start gap-3">
                    <MdLocationOn
                      size={18}
                      className="text-orange-500 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {client.address || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  AUDIT
              ====================================================== */}

              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">
                  Informasi Data
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* CREATED BY */}
                  <div className="px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <MdPerson
                        size={18}
                        className="text-gray-400 flex-shrink-0"
                      />

                      <div>
                        <p className="text-[10px] text-gray-400">Dibuat Oleh</p>

                        <p className="text-sm font-semibold text-custom-gelap dark:text-white mt-0.5">
                          {client.created_by || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* UPDATED BY */}
                  <div className="px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <MdPerson
                        size={18}
                        className="text-gray-400 flex-shrink-0"
                      />

                      <div>
                        <p className="text-[10px] text-gray-400">Diubah Oleh</p>

                        <p className="text-sm font-semibold text-custom-gelap dark:text-white mt-0.5">
                          {client.updated_by || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CREATED AT */}
                  <div className="px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <MdCalendarToday
                        size={17}
                        className="text-gray-400 flex-shrink-0"
                      />

                      <div>
                        <p className="text-[10px] text-gray-400">Dibuat Pada</p>

                        <p className="text-sm font-semibold text-custom-gelap dark:text-white mt-0.5">
                          {client.created_at
                            ? new Date(client.created_at).toLocaleString(
                                "id-ID",
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* UPDATED AT */}
                  <div className="px-4 py-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <MdUpdate
                        size={18}
                        className="text-gray-400 flex-shrink-0"
                      />

                      <div>
                        <p className="text-[10px] text-gray-400">
                          Diperbarui Pada
                        </p>

                        <p className="text-sm font-semibold text-custom-gelap dark:text-white mt-0.5">
                          {client.updated_at
                            ? new Date(client.updated_at).toLocaleString(
                                "id-ID",
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailClient;
