import React, { useCallback, useEffect, useState } from "react";
import { MdClose, MdVisibility, MdDescription } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalDetailLegalDocument = ({ show, documentId, onClose, onPreview }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);

    try {
      const response = await Api.get(`/work-item/legal-document/${documentId}`);

      if (response.data?.success) {
        setDocument(response.data?.data || null);
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil detail dokumen.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil detail dokumen:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil detail dokumen.",
      );
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (show) {
      fetchDetail();
    } else {
      setDocument(null);
    }
  }, [show, fetchDetail]);

  if (!show) return null;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-custom-gelap">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-custom-gelap dark:text-white">
              Detail Dokumen
            </h2>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Legal Document Information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <MdClose size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs font-bold text-gray-400">
            Memuat detail dokumen...
          </div>
        ) : !document ? (
          <div className="p-10 text-center text-xs font-bold text-gray-400">
            Detail dokumen tidak tersedia.
          </div>
        ) : (
          <div className="space-y-5 p-5">
            {/* DOCUMENT HEADER */}

            <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/[0.03]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-custom-merah-terang/10 text-custom-merah-terang">
                <MdDescription size={26} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="break-words text-sm font-black text-custom-gelap dark:text-white">
                  {document.document_name || "-"}
                </h3>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
                Deskripsi
              </p>

              <p className="whitespace-pre-wrap break-words text-xs leading-6 text-gray-600 dark:text-gray-300">
                {document.description || "Tidak ada deskripsi."}
              </p>
            </div>

            {/* FILE */}

            <div className="rounded-xl border border-gray-100 p-4 dark:border-white/10">
              <p className="mb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                File Dokumen
              </p>

              {document.file_url ? (
                <>
                  {/* <p className="break-all text-[10px] font-medium text-gray-500 dark:text-gray-300">
                    {document.file_url.split("/").pop()}
                  </p> */}

                  <button
                    type="button"
                    onClick={() => onPreview?.(document)}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-custom-merah-terang px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90"
                  >
                    <MdVisibility size={15} />
                    Preview Dokumen
                  </button>
                </>
              ) : (
                <p className="text-[10px] font-bold text-gray-400">
                  File tidak tersedia.
                </p>
              )}
            </div>

            {/* AUDIT INFORMATION */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Dibuat Oleh
                </p>

                <p className="mt-2 text-[11px] font-bold text-custom-gelap dark:text-white">
                  {document.created_by || "-"}
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  {formatDate(document.created_at)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Terakhir Diperbarui
                </p>

                <p className="mt-2 text-[11px] font-bold text-custom-gelap dark:text-white">
                  {document.updated_by || "-"}
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  {formatDate(document.updated_at)}
                </p>
              </div>
            </div>

            {/* CLOSE */}

            <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gray-100 px-5 py-3 text-[9px] font-black uppercase tracking-widest text-custom-gelap transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalDetailLegalDocument;
