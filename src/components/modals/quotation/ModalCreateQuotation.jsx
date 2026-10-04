import React, { useEffect, useState } from "react";
import { MdClose, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "DRAFT" },
  { value: "SUBMITTED", label: "SUBMITTED" },
  { value: "WON", label: "WON" },
  { value: "LOST", label: "LOST" },
  { value: "EXPIRED", label: "EXPIRED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

const INITIAL_FORM = {
  id_work_item: "",
  proposal_number: "",
  proposal_date: "",
  proposal_value: "",
  valid_until: "",
  status: "DRAFT",
  notes: "",
};

const ModalCreateQuotation = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [workItems, setWorkItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingWorkItems, setLoadingWorkItems] = useState(false);

  const [errors, setErrors] = useState({});

  const fetchWorkItems = async () => {
    setLoadingWorkItems(true);

    try {
      const response = await Api.get(
        "/work-item/work/options?context=quotation",
      );

      if (response.data.success) {
        setWorkItems(response.data.data || []);
      } else {
        setWorkItems([]);

        await SwalHelper.error(
          response.data?.message || "Gagal mengambil opsi pekerjaan.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil work item:", error);

      setWorkItems([]);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mengambil opsi pekerjaan.",
      );
    } finally {
      setLoadingWorkItems(false);
    }
  };

  useEffect(() => {
    if (show) {
      setForm(INITIAL_FORM);
      setErrors({});
      fetchWorkItems();
    } else {
      setForm(INITIAL_FORM);
      setErrors({});
      setWorkItems([]);
    }
  }, [show]);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.id_work_item) {
      newErrors.id_work_item = "Pekerjaan wajib dipilih.";
    }

    if (!form.proposal_number.trim()) {
      newErrors.proposal_number = "Nomor penawaran wajib diisi.";
    }

    if (!form.proposal_date) {
      newErrors.proposal_date = "Tanggal penawaran wajib diisi.";
    }

    if (
      form.proposal_value === "" ||
      form.proposal_value === null ||
      Number(form.proposal_value) <= 0
    ) {
      newErrors.proposal_value = "Nilai penawaran harus lebih dari 0.";
    }

    if (!form.valid_until) {
      newErrors.valid_until = "Tanggal berlaku sampai wajib diisi.";
    }

    if (
      form.proposal_date &&
      form.valid_until &&
      form.valid_until < form.proposal_date
    ) {
      newErrors.valid_until =
        "Tanggal berlaku sampai tidak boleh sebelum tanggal penawaran.";
    }

    if (!form.status) {
      newErrors.status = "Status wajib dipilih.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        id_work_item: Number(form.id_work_item),
        proposal_number: form.proposal_number.trim(),
        proposal_date: form.proposal_date,
        proposal_value: Number(form.proposal_value),
        valid_until: form.valid_until,
        status: form.status,
        notes: form.notes.trim() || null,
      };

      const response = await Api.post("/work-item/quotation", payload);

      if (response.data.success) {
        await SwalHelper.success(
          response.data.message || "Penawaran berhasil ditambahkan.",
        );

        if (onSuccess) {
          await onSuccess();
        }

        onClose();
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal menambahkan penawaran.",
        );
      }
    } catch (error) {
      console.error("Gagal menambahkan quotation:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal menambahkan penawaran.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;

    return (
      <p className="mt-1 text-[9px] font-bold text-red-500">{errors[field]}</p>
    );
  };

  if (!show) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[93vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-custom-gelap dark:text-white">
              Tambah Penawaran
            </h2>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
              Create New Quotation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(90vh-135px)] overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Work Item */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pekerjaan <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.id_work_item}
                  onChange={(e) => handleChange("id_work_item", e.target.value)}
                  disabled={loadingWorkItems || loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.id_work_item
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } cursor-pointer bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                >
                  <option value="">
                    {loadingWorkItems
                      ? "Memuat pekerjaan..."
                      : "Pilih Pekerjaan"}
                  </option>

                  {workItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>

                {renderError("id_work_item")}
              </div>

              {/* Proposal Number */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nomor Penawaran <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={form.proposal_number}
                  onChange={(e) =>
                    handleChange("proposal_number", e.target.value)
                  }
                  placeholder="Contoh: QTN-202609-001"
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.proposal_number
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("proposal_number")}
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.status
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } cursor-pointer bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                {renderError("status")}
              </div>

              {/* Proposal Date */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal Penawaran <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.proposal_date}
                  onChange={(e) =>
                    handleChange("proposal_date", e.target.value)
                  }
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.proposal_date
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("proposal_date")}
              </div>

              {/* Valid Until */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Berlaku Sampai <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.valid_until}
                  min={form.proposal_date || undefined}
                  onChange={(e) => handleChange("valid_until", e.target.value)}
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.valid_until
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("valid_until")}
              </div>

              {/* Proposal Value */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nilai Penawaran <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 dark:text-gray-400">
                    Rp
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.proposal_value}
                    onChange={(e) =>
                      handleChange("proposal_value", e.target.value)
                    }
                    placeholder="0"
                    disabled={loading}
                    className={`h-10 w-full rounded-xl border ${
                      errors.proposal_value
                        ? "border-red-500"
                        : "border-gray-100 dark:border-white/10"
                    } bg-gray-50 pl-9 pr-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                  />
                </div>

                {renderError("proposal_value")}
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Catatan
                </label>

                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-custom-gelap transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || loadingWorkItems}
              className="flex items-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <MdSave size={16} />
                  Simpan Penawaran
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateQuotation;
