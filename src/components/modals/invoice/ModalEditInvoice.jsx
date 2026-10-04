import React, { useEffect, useState } from "react";
import { MdClose, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const INITIAL_FORM = {
  id_work_item: "",
  id_completion: "",
  work_number: "",
  work_name: "",
  ba_number: "",
  invoice_number: "",
  invoice_date: "",
  invoice_value: "",
  vat_rate: "",
  due_date: "",
  document_url: "",
  notes: "",
};

const ModalEditInvoice = ({ show, onClose, invoiceId, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      setError("");

      const response = await Api.get(`/work-item/invoice/${invoiceId}`);

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal mengambil detail invoice.");
        return;
      }

      const invoice = response.data?.data;

      if (!invoice) {
        setError("Data invoice tidak ditemukan.");
        return;
      }

      setForm({
        id_work_item: invoice.id_work_item ? String(invoice.id_work_item) : "",
        id_completion: invoice.id_completion
          ? String(invoice.id_completion)
          : "",

        work_number: invoice.work_number || "",
        work_name: invoice.work_name || "",
        ba_number: invoice.ba_number || "",

        invoice_number: invoice.invoice_number || "",
        invoice_date: invoice.invoice_date || "",

        invoice_value:
          invoice.invoice_value !== null && invoice.invoice_value !== undefined
            ? invoice.invoice_value
            : "",

        vat_rate:
          invoice.vat_rate !== null && invoice.vat_rate !== undefined
            ? invoice.vat_rate
            : "",

        due_date: invoice.due_date || "",
        document_url: invoice.document_url || "",
        notes: invoice.notes || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal mengambil detail invoice.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show || !invoiceId) return;

    setForm(INITIAL_FORM);
    setError("");

    fetchDetail();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, invoiceId]);

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
    if (!form.invoice_number.trim()) {
      return "Nomor invoice wajib diisi.";
    }

    if (!form.invoice_date) {
      return "Tanggal invoice wajib diisi.";
    }

    if (form.invoice_value === "" || Number(form.invoice_value) <= 0) {
      return "Nilai invoice harus lebih besar dari 0.";
    }

    if (
      form.vat_rate === "" ||
      Number(form.vat_rate) < 0 ||
      Number(form.vat_rate) > 100
    ) {
      return "PPN harus berada di antara 0 sampai 100%.";
    }

    if (!form.due_date) {
      return "Tanggal jatuh tempo wajib diisi.";
    }

    if (form.due_date < form.invoice_date) {
      return "Tanggal jatuh tempo tidak boleh sebelum tanggal invoice.";
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
        // Tetap menggunakan relasi awal.
        // User tidak dapat mengubahnya dari form.
        id_work_item: Number(form.id_work_item),
        id_completion: Number(form.id_completion),

        invoice_number: form.invoice_number.trim(),
        invoice_date: form.invoice_date,
        invoice_value: Number(form.invoice_value),
        vat_rate: Number(form.vat_rate),
        due_date: form.due_date,
        document_url: form.document_url.trim() || null,
        notes: form.notes.trim() || null,
      };

      const response = await Api.put(
        `/work-item/invoice/${invoiceId}`,
        payload,
      );

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal memperbarui invoice.");
        return;
      }

      await SwalHelper.success(
        response.data?.message || "Invoice berhasil diperbarui.",
      );

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui invoice.");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex h-[93vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Edit Invoice
            </h2>

            {!loading && (
              <div className="mt-3 space-y-2">
                {/* Work Item */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Pekerjaan
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-custom-merah-terang dark:text-custom-cerah">
                    {form.work_number ? `${form.work_number} - ` : ""}
                    {form.work_name || "-"}
                  </p>
                </div>

                {/* Berita Acara */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Berita Acara
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-custom-merah-terang dark:text-custom-cerah">
                    {form.ba_number || "-"}
                  </p>
                </div>
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
          <div className="max-h-[calc(90vh-210px)] overflow-y-auto p-6">
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

                {/* Invoice Number */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nomor Invoice <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="invoice_number"
                    value={form.invoice_number}
                    onChange={handleChange}
                    placeholder="Contoh: INV-2026-001"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Invoice Date + Due Date */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Tanggal Invoice <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="invoice_date"
                      value={form.invoice_date}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Jatuh Tempo <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="due_date"
                      value={form.due_date}
                      min={form.invoice_date || undefined}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Invoice Value + VAT */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nilai Invoice <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Rp
                      </span>

                      <input
                        type="number"
                        name="invoice_value"
                        value={form.invoice_value}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0"
                        disabled={saving}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      PPN (%)
                    </label>

                    <input
                      type="number"
                      name="vat_rate"
                      value={form.vat_rate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="11"
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Document URL */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    URL Dokumen Invoice
                  </label>

                  <input
                    type="url"
                    name="document_url"
                    value={form.document_url}
                    onChange={handleChange}
                    placeholder="https://example.com/invoice.pdf"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
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
                    placeholder="Masukkan catatan invoice"
                    disabled={saving}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 pb-6 pt-4 dark:border-gray-700">
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

export default ModalEditInvoice;
