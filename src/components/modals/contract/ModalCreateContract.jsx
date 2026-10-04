import React, { useEffect, useState } from "react";
import { MdClose, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

const INITIAL_FORM = {
  id_work_item: "",
  contract_number: "",
  contract_date: "",
  start_date: "",
  end_date: "",
  contract_value: "",
  vat_rate: 11,
  status: "ACTIVE",
  notes: "",
};

const ModalCreateContract = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [workItems, setWorkItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingWorkItems, setLoadingWorkItems] = useState(false);

  const [errors, setErrors] = useState({});

  const fetchWorkItems = async () => {
    setLoadingWorkItems(true);

    try {
      const response = await Api.get(
        "/work-item/work/options?context=contract",
      );

      if (response.data?.success) {
        setWorkItems(response.data?.data || []);
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

    if (!form.contract_number.trim()) {
      newErrors.contract_number = "Nomor kontrak wajib diisi.";
    }

    if (!form.contract_date) {
      newErrors.contract_date = "Tanggal kontrak wajib diisi.";
    }

    if (!form.start_date) {
      newErrors.start_date = "Tanggal mulai wajib diisi.";
    }

    if (!form.end_date) {
      newErrors.end_date = "Tanggal selesai wajib diisi.";
    }

    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      newErrors.end_date =
        "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
    }

    if (
      form.contract_value === "" ||
      form.contract_value === null ||
      Number(form.contract_value) <= 0
    ) {
      newErrors.contract_value = "Nilai kontrak harus lebih besar dari 0.";
    }

    if (
      form.vat_rate === "" ||
      form.vat_rate === null ||
      Number(form.vat_rate) < 0 ||
      Number(form.vat_rate) > 100
    ) {
      newErrors.vat_rate = "PPN harus berada di antara 0 sampai 100%.";
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
        contract_number: form.contract_number.trim(),
        contract_date: form.contract_date,
        start_date: form.start_date,
        end_date: form.end_date,
        contract_value: Number(form.contract_value),
        vat_rate: Number(form.vat_rate),
        status: form.status,
        notes: form.notes.trim() || null,
      };

      const response = await Api.post("/work-item/contract", payload);

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Kontrak berhasil dibuat.",
        );

        if (onSuccess) {
          await onSuccess();
        }

        onClose();
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal membuat kontrak.",
        );
      }
    } catch (error) {
      console.error("Gagal membuat kontrak:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal membuat kontrak.",
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
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
              Tambah Kontrak
            </h2>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
              Create New Contract
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
                  onChange={(event) =>
                    handleChange("id_work_item", event.target.value)
                  }
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

              {/* Contract Number */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nomor Kontrak <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={form.contract_number}
                  onChange={(event) =>
                    handleChange("contract_number", event.target.value)
                  }
                  placeholder="Contoh: CTR-202609-001"
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.contract_number
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("contract_number")}
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    handleChange("status", event.target.value)
                  }
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

              {/* Contract Date */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal Kontrak <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.contract_date}
                  onChange={(event) =>
                    handleChange("contract_date", event.target.value)
                  }
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.contract_date
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("contract_date")}
              </div>

              {/* Contract Value */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nilai Kontrak <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 dark:text-gray-400">
                    Rp
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.contract_value}
                    onChange={(event) =>
                      handleChange("contract_value", event.target.value)
                    }
                    placeholder="0"
                    disabled={loading}
                    className={`h-10 w-full rounded-xl border ${
                      errors.contract_value
                        ? "border-red-500"
                        : "border-gray-100 dark:border-white/10"
                    } bg-gray-50 pl-9 pr-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                  />
                </div>

                {renderError("contract_value")}
              </div>

              {/* Start Date */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) =>
                    handleChange("start_date", event.target.value)
                  }
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.start_date
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("start_date")}
              </div>

              {/* End Date */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.end_date}
                  min={form.start_date || undefined}
                  onChange={(event) =>
                    handleChange("end_date", event.target.value)
                  }
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.end_date
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("end_date")}
              </div>

              {/* VAT */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  PPN (%)
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.vat_rate}
                    onChange={(event) =>
                      handleChange("vat_rate", event.target.value)
                    }
                    placeholder="11"
                    disabled={loading}
                    className={`h-10 w-full rounded-xl border ${
                      errors.vat_rate
                        ? "border-red-500"
                        : "border-gray-100 dark:border-white/10"
                    } bg-gray-50 px-3 pr-9 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 dark:text-gray-400">
                    %
                  </span>
                </div>

                {renderError("vat_rate")}
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Catatan
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    handleChange("notes", event.target.value)
                  }
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
                  Simpan Kontrak
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateContract;
