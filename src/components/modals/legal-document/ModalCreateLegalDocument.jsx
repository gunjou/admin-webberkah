import React, { useState } from "react";
import { MdClose, MdCloudUpload, MdDescription } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalCreateLegalDocument = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    document_name: "",
    description: "",
  });

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setDocument(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.document_name.trim()) {
      SwalHelper.error("Nama dokumen wajib diisi.");
      return;
    }

    if (!document) {
      SwalHelper.error("Silakan pilih file dokumen.");
      return;
    }

    const formData = new FormData();
    formData.append("document_name", form.document_name.trim());
    formData.append("description", form.description.trim());
    formData.append("document", document);

    setLoading(true);

    try {
      const response = await Api.post("/work-item/legal-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Dokumen berhasil ditambahkan.",
        );

        onClose();
        await onSuccess?.();
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal menambahkan dokumen.",
        );
      }
    } catch (error) {
      console.error("Gagal menambahkan dokumen:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal menambahkan dokumen.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-white/10 dark:bg-custom-gelap">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-custom-gelap dark:text-white">
              Tambah Dokumen
            </h2>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Legal Document Management
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
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
              placeholder="Contoh: NPWP Perusahaan"
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-xs font-bold text-custom-gelap outline-none transition-all focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            />

            <p className="mt-1 text-right text-[9px] text-gray-400">
              {form.document_name.length}/150 karakter
            </p>
          </div>

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
              className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-custom-gelap outline-none transition-all focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          {/* FILE UPLOAD */}

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">
              File Dokumen <span className="text-red-500">*</span>
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-7 text-center transition-all hover:border-custom-merah-terang dark:border-white/10 dark:bg-white/[0.02]">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-custom-merah-terang/10 text-custom-merah-terang">
                <MdCloudUpload size={26} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-custom-gelap dark:text-white">
                {document ? "Ganti File" : "Pilih File Dokumen"}
              </span>

              <span className="mt-1 text-[9px] text-gray-400">
                Klik untuk memilih file dari perangkat
              </span>

              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
                required
              />
            </label>

            {document && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-100 p-3 dark:bg-white/5">
                <MdDescription
                  size={22}
                  className="shrink-0 text-custom-merah-terang"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-black text-custom-gelap dark:text-white">
                    {document.name}
                  </p>

                  <p className="mt-1 text-[9px] text-gray-400">
                    {(document.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDocument(null)}
                  disabled={loading}
                  className="text-[9px] font-black uppercase text-red-500"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl bg-gray-100 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdCloudUpload size={15} />
              {loading ? "Mengunggah..." : "Simpan Dokumen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateLegalDocument;
