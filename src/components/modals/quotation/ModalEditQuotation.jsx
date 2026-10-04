import React, { useEffect, useState } from "react";
import { MdClose, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

const INITIAL_FORM = {
  id_work_item: "",
  work_number: "",
  work_name: "",
  proposal_number: "",
  proposal_date: "",
  proposal_value: "",
  valid_until: "",
  status: "DRAFT",
  notes: "",
};

const ModalEditQuotation = ({ show, onClose, quotationId, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    if (!quotationId) return;

    try {
      setLoading(true);
      setError("");

      const response = await Api.get(`/work-item/quotation/${quotationId}`);

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal mengambil detail penawaran.");
        return;
      }

      const quotation = response.data.data;

      if (!quotation) {
        setError("Data penawaran tidak ditemukan.");
        return;
      }

      setForm({
        id_work_item: quotation.id_work_item
          ? String(quotation.id_work_item)
          : "",
        work_number: quotation.work_number || "",
        work_name: quotation.work_name || "",
        proposal_number: quotation.proposal_number || "",
        proposal_date: quotation.proposal_date || "",
        proposal_value:
          quotation.proposal_value !== null &&
          quotation.proposal_value !== undefined
            ? quotation.proposal_value
            : "",
        valid_until: quotation.valid_until || "",
        status: quotation.status || "DRAFT",
        notes: quotation.notes || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal mengambil detail penawaran.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show || !quotationId) return;

    setForm(INITIAL_FORM);
    setError("");

    fetchDetail();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, quotationId]);

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
    if (!form.proposal_number.trim()) {
      return "Nomor penawaran wajib diisi.";
    }

    if (!form.proposal_date) {
      return "Tanggal penawaran wajib diisi.";
    }

    if (form.proposal_value !== "" && Number(form.proposal_value) < 0) {
      return "Nilai penawaran tidak boleh kurang dari 0.";
    }

    if (form.valid_until && form.valid_until < form.proposal_date) {
      return "Tanggal berlaku sampai tidak boleh sebelum tanggal penawaran.";
    }

    if (!form.status) {
      return "Status penawaran wajib dipilih.";
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
        id_work_item: Number(form.id_work_item),
        proposal_number: form.proposal_number.trim(),
        proposal_date: form.proposal_date,
        proposal_value:
          form.proposal_value === "" ? null : Number(form.proposal_value),
        valid_until: form.valid_until || null,
        status: form.status,
        notes: form.notes.trim() || null,
      };

      const response = await Api.put(
        `/work-item/quotation/${quotationId}`,
        payload,
      );

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal memperbarui penawaran.");
        return;
      }

      await SwalHelper.success(
        response.data?.message || "Penawaran berhasil diperbarui.",
      );

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui penawaran.");
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
      <div className="w-full max-w-3xl max-h-[93vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Edit Penawaran
            </h2>

            {/* Work Item */}
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

                {/* Proposal Number */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nomor Penawaran <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="proposal_number"
                    value={form.proposal_number}
                    onChange={handleChange}
                    placeholder="Contoh: QTN-2026-001"
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                {/* Date */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Tanggal Penawaran <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="proposal_date"
                      value={form.proposal_date}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Berlaku Sampai
                    </label>

                    <input
                      type="date"
                      name="valid_until"
                      value={form.valid_until}
                      min={form.proposal_date || undefined}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Value + Status */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nilai Penawaran
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        Rp
                      </span>

                      <input
                        type="number"
                        name="proposal_value"
                        value={form.proposal_value}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        disabled={saving}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    placeholder="Masukkan catatan penawaran"
                    disabled={saving}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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

export default ModalEditQuotation;
