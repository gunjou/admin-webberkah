import React, { useCallback, useEffect, useState } from "react";
import Api from "../utils/Api";
import SwalHelper from "../utils/Swal";
import LoadingOverlay from "../components/LoadingOverlay";
import DocumentPreviewModal from "../components/modals/DocumentPreviewModal";
import ModalCreateLegalDocument from "../components/modals/legal-document/ModalCreateLegalDocument";
import ModalEditLegalDocument from "../components/modals/legal-document/ModalEditLegalDocument";
import ModalDetailLegalDocument from "../components/modals/legal-document/ModalDetailLegalDocument";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdRefresh,
  MdSearch,
  MdVisibility,
  MdDescription,
  MdInsertDriveFile,
  MdDownload,
} from "react-icons/md";

const LegalDocument = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(
    "Preview Dokumen Legalitas",
  );

  // ============================================================
  // FETCH LEGAL DOCUMENTS
  // ============================================================

  const fetchDocuments = useCallback(async () => {
    setLoading(true);

    try {
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await Api.get("/work-item/legal-document", {
        params,
      });

      if (response.data?.success) {
        const responseData = response.data?.data || {};
        setDocuments(responseData.items || []);
      } else {
        setDocuments([]);
        SwalHelper.error(
          response.data?.message || "Gagal mengambil dokumen legalitas.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil dokumen legalitas:", error);
      setDocuments([]);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil dokumen legalitas.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    fetchDocuments();
  };

  // ============================================================
  // DOCUMENT DOWNLOAD
  // ============================================================

  const handleDocumentDownload = async (item) => {
    if (!item.file_url) {
      SwalHelper.info("File dokumen tidak tersedia.");
      return;
    }

    setDownloadingId(item.id_legal_document);

    try {
      const response = await fetch(item.file_url);

      if (!response.ok) {
        throw new Error("Gagal mengambil file dari server.");
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("File dokumen kosong.");
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const fileName =
        item.document_name ||
        item.file_url.split("/").pop()?.split("?")[0] ||
        "dokumen";

      const link = window.document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.style.display = "none";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      // Beri waktu browser memproses unduhan sebelum melepas URL.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (error) {
      console.error("Gagal mengunduh dokumen:", error);

      SwalHelper.error(
        error.message?.includes("fetch")
          ? "Gagal mengakses file. Periksa koneksi atau konfigurasi CORS CDN."
          : error.message || "Gagal mengunduh dokumen.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = () => {
    setShowCreate(true);
  };

  // ============================================================
  // DETAIL
  // ============================================================

  const handleDetail = (item) => {
    setSelectedDocumentId(item.id_legal_document);
    setShowDetail(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (item) => {
    setSelectedDocumentId(item.id_legal_document);
    setShowEdit(true);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (item) => {
    const confirmed = await SwalHelper.confirm({
      title: "Nonaktifkan dokumen?",
      message: `Dokumen "${item.document_name}" akan dinonaktifkan.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await Api.delete(
        `/work-item/legal-document/${item.id_legal_document}`,
      );

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Dokumen legalitas berhasil dinonaktifkan.",
        );

        await fetchDocuments();
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal menonaktifkan dokumen legalitas.",
        );
      }
    } catch (error) {
      console.error("Gagal menonaktifkan dokumen legalitas:", error);

      SwalHelper.error(
        error.response?.data?.message ||
          "Gagal menonaktifkan dokumen legalitas.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DOCUMENT PREVIEW
  // ============================================================

  const handleDocumentPreview = (item) => {
    if (!item.file_url) {
      SwalHelper.info("File dokumen tidak tersedia.");
      return;
    }

    setSelectedDocumentUrl(item.file_url);
    setSelectedDocumentTitle(item.document_name || "Preview Dokumen Legalitas");
    setShowDocumentPreview(true);
  };

  const handleCloseDocumentPreview = () => {
    setShowDocumentPreview(false);
    setSelectedDocumentUrl("");
    setSelectedDocumentTitle("Preview Dokumen Legalitas");
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {loading && <LoadingOverlay message="Memuat dokumen legalitas..." />}

      <div className="space-y-3 pb-3 font-poppins">
        {/* HEADER */}

        <div className="flex flex-col items-start justify-between gap-4 px-1 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-custom-gelap dark:text-white">
              Legal Document
            </h1>

            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
              Company Legal Documents Management
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-custom-gelap shadow-sm transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/5 dark:bg-custom-gelap dark:text-white"
            >
              <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-2xl bg-custom-merah-terang px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <MdAdd size={16} />
              Dokumen Baru
            </button>
          </div>
        </div>

        {/* SEARCH */}

        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/5 dark:bg-custom-gelap">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau deskripsi dokumen..."
                className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 pl-9 pr-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-4 text-[9px] font-black uppercase tracking-widest text-custom-gelap transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <MdRefresh size={15} />
              Reset
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/5 dark:bg-custom-gelap">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/5">
                  <th className="w-12 px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Nama Dokumen
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Deskripsi
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Oleh
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Tanggal
                  </th>

                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Dokumen
                  </th>

                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <MdDescription
                        size={32}
                        className="mx-auto text-gray-300 dark:text-gray-600"
                      />

                      <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Tidak ada dokumen
                      </p>

                      <p className="mt-1 text-[9px] font-bold text-gray-400">
                        Dokumen legalitas belum tersedia.
                      </p>
                    </td>
                  </tr>
                ) : (
                  documents.map((item, index) => (
                    <tr
                      key={item.id_legal_document}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      {/* NUMBER */}

                      <td className="px-4 py-4 text-center align-top text-[11px] font-bold text-gray-400">
                        {index + 1}
                      </td>

                      {/* DOCUMENT NAME */}

                      <td className="max-w-[250px] min-w-[200px] line-clamp-2 px-4 py-4 align-top">
                        <p
                          onClick={() => handleDetail(item)}
                          className="text-left text-[11px] font-black text-custom-merah-terang cursor-pointer hover:underline"
                        >
                          {item.document_name || "-"}
                        </p>
                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-[280px] px-4 py-4 align-top">
                        <p
                          className="line-clamp-3 text-[10px] font-medium leading-5 text-gray-500 dark:text-gray-300"
                          title={item.description || ""}
                        >
                          {item.description || "Tidak ada deskripsi"}
                        </p>
                      </td>

                      {/* CREATED BY */}

                      <td className="whitespace-nowrap px-4 py-4 align-top">
                        <p className="text-[10px] font-bold text-custom-gelap dark:text-white">
                          {item.created_by || "-"}
                        </p>
                      </td>

                      {/* CREATED AT */}

                      <td className="whitespace-nowrap px-4 py-4 align-top">
                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-300">
                          {formatDate(item.created_at)}
                        </p>
                      </td>

                      {/* PREVIEW */}

                      <td className="px-4 py-4 align-top text-center">
                        <button
                          type="button"
                          onClick={() => handleDocumentPreview(item)}
                          title="Preview dokumen"
                          className="inline-flex items-center gap-1 rounded-xl border border-custom-merah-terang/20 bg-custom-merah-terang/10 px-3 text-[9px] font-black uppercase tracking-widest text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white dark:border-custom-merah-terang/30 dark:text-custom-cerah"
                        >
                          <MdVisibility size={14} />
                          Preview
                        </button>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDocumentDownload(item)}
                            disabled={downloadingId === item.id_legal_document}
                            title="Download dokumen"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-custom-gelap transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                          >
                            {downloadingId === item.id_legal_document ? (
                              <MdRefresh size={15} className="animate-spin" />
                            ) : (
                              <MdDownload size={15} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDetail(item)}
                            title="Detail"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-custom-gelap transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                          >
                            <MdVisibility size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white"
                          >
                            <MdEdit size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Nonaktifkan"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white dark:bg-red-500/10"
                          >
                            <MdDelete size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-4 py-3 dark:border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Menampilkan {documents.length} dokumen
            </p>
          </div>
        </div>
      </div>

      {/* CREATE */}

      {showCreate && (
        <ModalCreateLegalDocument
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={fetchDocuments}
        />
      )}

      {/* DETAIL */}

      {showDetail && selectedDocumentId && (
        <ModalDetailLegalDocument
          show={showDetail}
          documentId={selectedDocumentId}
          onClose={() => {
            setShowDetail(false);
            setSelectedDocumentId(null);
          }}
          onPreview={handleDocumentPreview}
        />
      )}

      {/* EDIT */}

      {showEdit && selectedDocumentId && (
        <ModalEditLegalDocument
          show={showEdit}
          documentId={selectedDocumentId}
          onClose={() => {
            setShowEdit(false);
            setSelectedDocumentId(null);
          }}
          onSuccess={fetchDocuments}
        />
      )}

      {/* DOCUMENT PREVIEW */}

      <DocumentPreviewModal
        show={showDocumentPreview}
        url={selectedDocumentUrl}
        title={selectedDocumentTitle}
        onClose={handleCloseDocumentPreview}
      />
    </>
  );
};

export default LegalDocument;
