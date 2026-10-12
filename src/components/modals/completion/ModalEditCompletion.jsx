import React, { useEffect, useState } from "react";
import { MdAttachFile, MdClose, MdDescription, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";
import DocumentPreviewModal from "../DocumentPreviewModal";

const INITIAL_FORM = {
  id_work_item: "",
  work_number: "",
  work_name: "",
  ba_number: "",
  ba_date: "",
  document: null,
  document_url: "",
  notes: "",
};

const ModalEditCompletion = ({ show, onClose, completionId, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  const fetchDetail = async () => {
    if (!completionId) return;

    try {
      setLoading(true);
      setError("");

      const response = await Api.get(`/work-item/completion/${completionId}`);

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal mengambil detail BA.");
        return;
      }

      const completion = response.data.data;

      if (!completion) {
        setError("Data BA tidak ditemukan.");
        return;
      }

      setForm({
        id_work_item: completion.id_work_item
          ? String(completion.id_work_item)
          : "",
        work_number: completion.work_number || "",
        work_name: completion.work_name || "",
        ba_number: completion.ba_number || "",
        ba_date: completion.ba_date || "",
        document: null,
        document_url: completion.document_url || "",
        notes: completion.notes || "",
      });
    } catch (err) {
      console.error("Gagal mengambil detail BA:", err);

      setError(err.response?.data?.message || "Gagal mengambil detail BA.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show || !completionId) return;

    setForm(INITIAL_FORM);
    setError("");

    fetchDetail();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, completionId]);

  useEffect(() => {
    if (!show) {
      setForm(INITIAL_FORM);
      setError("");
      setShowDocumentPreview(false);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0] || null;

    setForm((prev) => ({
      ...prev,
      document: file,
    }));

    if (error) {
      setError("");
    }

    // Memungkinkan memilih file yang sama lagi
    event.target.value = "";
  };

  const handleRemoveDocument = () => {
    setForm((prev) => ({
      ...prev,
      document: null,
    }));
  };

  const handlePreviewExistingDocument = () => {
    if (!form.document_url) {
      SwalHelper.info("Dokumen BA tidak tersedia.");
      return;
    }

    setShowDocumentPreview(true);
  };

  const validateForm = () => {
    if (!form.id_work_item) {
      return "Work Item tidak ditemukan.";
    }

    if (!form.ba_number.trim()) {
      return "Nomor BA wajib diisi.";
    }

    if (!form.ba_date) {
      return "Tanggal BA wajib diisi.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();

      formData.append("id_work_item", String(form.id_work_item));

      formData.append("ba_number", form.ba_number.trim());

      formData.append("ba_date", form.ba_date);

      formData.append("notes", form.notes.trim());

      if (form.document) {
        formData.append("document", form.document);
      }

      const response = await Api.put(
        `/work-item/completion/${completionId}`,
        formData,
        {
          transformRequest: [
            (data, headers) => {
              if (data instanceof FormData) {
                delete headers["Content-Type"];
              }

              return data;
            },
          ],
        },
      );

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal memperbarui BA.");
        return;
      }

      await SwalHelper.success(
        response.data?.message || "BA berhasil diperbarui.",
      );

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      console.error("Gagal memperbarui BA:", err);

      setError(err.response?.data?.message || "Gagal memperbarui BA.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !saving) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <div className="flex max-h-[93vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-custom-gelap">
          {/* ======================================================
              HEADER
          ====================================================== */}

          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Edit Berita Acara
              </h2>

              {!loading && (
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Pekerjaan
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-custom-merah-terang dark:text-custom-cerah">
                    {form.work_number ? `${form.work_number} - ` : ""}
                    {form.work_name || "-"}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="ml-4 shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <MdClose size={22} />
            </button>
          </div>

          {/* ======================================================
              FORM
          ====================================================== */}

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-custom-merah-terang" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Error */}

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  {/* ==================================================
                      WORK ITEM
                  ================================================== */}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Pekerjaan
                    </label>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {form.work_number || "-"}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {form.work_name || "-"}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Work Item tidak dapat diubah dari form edit BA.
                    </p>
                  </div>

                  {/* ==================================================
                      BA NUMBER
                  ================================================== */}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nomor BA <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="ba_number"
                      value={form.ba_number}
                      onChange={handleChange}
                      placeholder="Contoh: BA-2026-001"
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  {/* ==================================================
                      BA DATE
                  ================================================== */}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Tanggal BA <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="ba_date"
                      value={form.ba_date}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  {/* ==================================================
                      DOCUMENT
                  ================================================== */}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Dokumen BA
                    </label>

                    {/* Existing document */}

                    {form.document_url && !form.document && (
                      <div className="mb-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex min-w-0 items-center gap-2">
                          <MdDescription
                            size={20}
                            className="shrink-0 text-custom-merah-terang"
                          />

                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                              Dokumen BA saat ini
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-gray-400">
                              Dokumen tersimpan di CDN
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handlePreviewExistingDocument}
                          disabled={saving}
                          className="ml-3 shrink-0 rounded-lg bg-custom-merah-terang px-3 py-2 text-[9px] font-black uppercase tracking-wider text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Preview
                        </button>
                      </div>
                    )}

                    {/* New document */}

                    {form.document ? (
                      <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                        <div className="flex min-w-0 items-center gap-2">
                          <MdDescription
                            size={20}
                            className="shrink-0 text-blue-600 dark:text-blue-400"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-blue-700 dark:text-blue-300">
                              {form.document.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-blue-500 dark:text-blue-400">
                              {(form.document.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveDocument}
                          disabled={saving}
                          className="ml-3 shrink-0 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-wider text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[9px] font-black uppercase tracking-wider text-gray-400 transition hover:border-custom-merah-terang hover:text-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:hover:border-custom-merah-terang">
                        <MdAttachFile size={17} />

                        <span>Ganti Dokumen BA</span>

                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={handleDocumentChange}
                          disabled={saving}
                          className="hidden"
                        />
                      </label>
                    )}

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Kosongkan jika tidak ingin mengganti dokumen. Format: PDF,
                      JPG, JPEG, PNG, WEBP.
                    </p>
                  </div>

                  {/* ==================================================
                      NOTES
                  ================================================== */}

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Catatan
                    </label>

                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Masukkan catatan BA"
                      disabled={saving}
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================
                FOOTER
            ====================================================== */}

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading || saving}
                className="flex items-center gap-2 rounded-lg bg-custom-merah-terang px-5 py-2.5 text-sm font-medium text-white transition hover:bg-custom-merah disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdSave size={18} />

                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ========================================================
          DOCUMENT PREVIEW
      ======================================================== */}

      <DocumentPreviewModal
        show={showDocumentPreview}
        url={form.document_url}
        title={
          form.ba_number
            ? `Dokumen BA - ${form.ba_number}`
            : "Preview Dokumen BA"
        }
        onClose={() => setShowDocumentPreview(false)}
      />
    </>
  );
};

export default ModalEditCompletion;
