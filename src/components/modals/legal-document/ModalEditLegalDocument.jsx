import React, { useCallback, useEffect, useState } from "react";
import { MdClose, MdCloudUpload, MdDescription } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalEditLegalDocument = ({ show, documentId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    document_name: "",
    description: "",
  });

  const [document, setDocument] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!documentId) return;

    setLoadingDetail(true);

    try {
      const response = await Api.get(`/work-item/legal-document/${documentId}`);

      if (response.data?.success) {
        const item = response.data?.data || {};

        setExistingDocument(item);
        setForm({
          document_name: item.document_name || "",
          description: item.description || "",
        });
        setDocument(null);
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal mengambil detail dokumen.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil detail dokumen:", error);

      await SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil detail dokumen.",
      );
    } finally {
      setLoadingDetail(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (show && documentId) {
      fetchDetail();
    }
  }, [show, documentId, fetchDetail]);

  if (!show) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Ambil file lama dari CDN jika pengguna tidak memilih file baru.
  const getExistingFile = async () => {
    if (!existingDocument?.file_url) {
      return null;
    }

    const response = await fetch(existingDocument.file_url);

    if (!response.ok) {
      throw new Error("Gagal mengambil file dokumen saat ini.");
    }

    const blob = await response.blob();

    const fileName =
      existingDocument.file_url.split("/").pop()?.split("?")[0] || "document";

    return new File([blob], fileName, {
      type: blob.type || "application/octet-stream",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const documentName = form.document_name.trim();
    const description = form.description.trim();

    if (!documentName) {
      await SwalHelper.error("Nama dokumen wajib diisi.");
      return;
    }

    if (!documentId) {
      await SwalHelper.error("ID dokumen tidak valid.");
      return;
    }

    setLoading(true);

    try {
      // Siapkan file terlebih dahulu.
      // File baru digunakan jika dipilih, selain itu gunakan file lama.
      const fileToUpload = document || (await getExistingFile());

      if (!fileToUpload) {
        throw new Error("File dokumen tidak tersedia.");
      }

      // Selalu kirim seluruh field ke endpoint.
      const formData = new FormData();

      formData.set("document_name", documentName);
      formData.set("description", description);
      formData.set("document", fileToUpload, fileToUpload.name);

      // Debug payload sebelum dikirim.
      console.log("Payload update legal document:");

      for (const [key, value] of formData.entries()) {
        console.log(
          `${key}:`,
          value instanceof File
            ? {
                name: value.name,
                type: value.type,
                size: value.size,
              }
            : value,
        );
      }

      const response = await Api.put(
        `/work-item/legal-document/${documentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response.data?.success) {
        await SwalHelper.error(
          response.data?.message || "Gagal memperbarui dokumen.",
        );
        return;
      }

      await SwalHelper.success(
        response.data?.message || "Dokumen berhasil diperbarui.",
      );

      onClose();
      await onSuccess?.();
    } catch (error) {
      console.error("Gagal memperbarui dokumen:", error);

      await SwalHelper.error(
        error.response?.data?.message ||
          error.message ||
          "Gagal memperbarui dokumen.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-custom-gelap">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-custom-gelap dark:text-white">
              Edit Dokumen
            </h2>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Perbarui informasi dan file dokumen
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <MdClose size={18} />
          </button>
        </div>

        {loadingDetail ? (
          <div className="p-10 text-center text-xs font-bold text-gray-400">
            Memuat detail dokumen...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            {/* NAMA DOKUMEN */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">
                Nama Dokumen <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="document_name"
                value={form.document_name}
                onChange={handleChange}
                maxLength={150}
                required
                disabled={loading}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-xs font-bold text-custom-gelap outline-none transition-all focus:border-custom-merah-terang disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* DESKRIPSI */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">
                Deskripsi
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Keterangan dokumen (opsional)"
                disabled={loading}
                className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-custom-gelap outline-none transition-all focus:border-custom-merah-terang disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* FILE SAAT INI */}
            {existingDocument?.file_url && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  File Saat Ini
                </p>

                <div className="flex items-center gap-3">
                  <MdDescription
                    size={22}
                    className="shrink-0 text-custom-merah-terang"
                  />

                  <p className="min-w-0 flex-1 break-all text-[10px] font-bold text-custom-gelap dark:text-white">
                    {existingDocument.file_url.split("/").pop()?.split("?")[0]}
                  </p>
                </div>
              </div>
            )}

            {/* GANTI FILE */}
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">
                Ganti File
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition-all hover:border-custom-merah-terang dark:border-white/10 dark:bg-white/[0.02]">
                <MdCloudUpload
                  size={28}
                  className="mb-2 text-custom-merah-terang"
                />

                <span className="text-[10px] font-black uppercase tracking-widest text-custom-gelap dark:text-white">
                  {document ? "Ganti Pilihan File" : "Pilih File Baru"}
                </span>

                <span className="mt-1 text-[9px] text-gray-400">
                  {document
                    ? "File baru akan menggantikan file saat ini"
                    : "Kosongkan jika tidak ingin mengganti file"}
                </span>

                <input
                  type="file"
                  onChange={(event) => {
                    setDocument(event.target.files?.[0] || null);
                  }}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              {document && (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-100 p-3 dark:bg-white/5">
                  <MdDescription
                    size={22}
                    className="shrink-0 text-custom-merah-terang"
                  />

                  <p className="min-w-0 flex-1 truncate text-[10px] font-black text-custom-gelap dark:text-white">
                    {document.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => setDocument(null)}
                    disabled={loading}
                    className="text-[9px] font-black uppercase text-red-500"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-white/5">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl bg-gray-100 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-white/5 dark:text-white"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading || loadingDetail}
                className="flex items-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdCloudUpload size={15} />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalEditLegalDocument;
