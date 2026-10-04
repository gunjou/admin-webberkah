import React, { useEffect, useState } from "react";
import { MdClose, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const INITIAL_FORM = {
  id_work_item: "",
  work_number: "",
  work_name: "",
  ba_number: "",
  ba_date: "",
  completion_date: "",
  document_url: "",
  notes: "",
};

const ModalEditCompletion = ({ show, onClose, completionId, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        completion_date: completion.completion_date || "",
        document_url: completion.document_url || "",
        notes: completion.notes || "",
      });
    } catch (err) {
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

    if (!form.completion_date) {
      return "Tanggal penyelesaian wajib diisi.";
    }

    if (form.completion_date < form.ba_date) {
      return "Tanggal penyelesaian tidak boleh lebih awal dari tanggal BA.";
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

      const payload = {
        // ID Work Item tetap menggunakan ID dari data existing.
        id_work_item: Number(form.id_work_item),
        ba_number: form.ba_number.trim(),
        ba_date: form.ba_date,
        completion_date: form.completion_date,
        document_url: form.document_url.trim() || null,
        notes: form.notes.trim() || null,
      };

      const response = await Api.put(
        `/work-item/completion/${completionId}`,
        payload,
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
      setError(err.response?.data?.message || "Gagal memperbarui BA.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-3xl max-h-[93vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
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

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(90vh-170px)] overflow-y-auto p-6">
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

                {/* BA Number */}
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

                {/* BA Date + Completion Date */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Tanggal Penyelesaian{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="completion_date"
                      value={form.completion_date}
                      min={form.ba_date || undefined}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Document URL */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    URL Dokumen
                  </label>

                  <input
                    type="text"
                    name="document_url"
                    value={form.document_url}
                    onChange={handleChange}
                    placeholder="/uploads/ba/BA-2026-001.pdf"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Masukkan path atau URL dokumen BA jika tersedia.
                  </p>
                </div>

                {/* Notes */}
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

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
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
  );
};

export default ModalEditCompletion;
