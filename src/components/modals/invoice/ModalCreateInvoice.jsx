import React, { useEffect, useState } from "react";
import { MdAttachFile, MdClose, MdDescription, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";
import { formatRupiahNumber, parseRupiahNumber } from "../../../utils/Helpers";

const INITIAL_FORM = {
  id_work_item: "",
  id_completion: "",
  invoice_number: "",
  invoice_date: "",
  invoice_value: "",
  vat_rate: "",
  due_date: "",
  notes: "",
  document: null,
};

const ModalCreateInvoice = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);

  const [workItems, setWorkItems] = useState([]);
  const [completions, setCompletions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [errors, setErrors] = useState({});

  const fetchOptions = async () => {
    setLoadingOptions(true);

    try {
      const [workResponse, completionResponse] = await Promise.all([
        Api.get("/work-item/work/options?context=invoice"),
        Api.get("/work-item/completion/options?context=invoice"),
      ]);

      if (workResponse.data?.success) {
        setWorkItems(workResponse.data?.data || []);
      } else {
        setWorkItems([]);

        await SwalHelper.error(
          workResponse.data?.message || "Gagal mengambil opsi pekerjaan.",
        );
      }

      if (completionResponse.data?.success) {
        setCompletions(completionResponse.data?.data || []);
      } else {
        setCompletions([]);

        await SwalHelper.error(
          completionResponse.data?.message || "Gagal mengambil opsi BA.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil opsi invoice:", error);

      setWorkItems([]);
      setCompletions([]);

      await SwalHelper.error(
        error?.response?.data?.message ||
          "Gagal mengambil opsi pekerjaan dan BA.",
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (show) {
      setForm(INITIAL_FORM);
      setErrors({});
      fetchOptions();
    } else {
      setForm(INITIAL_FORM);
      setErrors({});
      setWorkItems([]);
      setCompletions([]);
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

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0] || null;

    handleChange("document", file);

    // Supaya file yang sama bisa dipilih kembali setelah dihapus
    event.target.value = "";
  };

  const handleRemoveDocument = () => {
    handleChange("document", null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.id_work_item) {
      newErrors.id_work_item = "Pekerjaan wajib dipilih.";
    }

    if (!form.id_completion) {
      newErrors.id_completion = "BA wajib dipilih.";
    }

    if (!form.invoice_number.trim()) {
      newErrors.invoice_number = "Nomor invoice wajib diisi.";
    }

    if (!form.invoice_date) {
      newErrors.invoice_date = "Tanggal invoice wajib diisi.";
    }

    if (
      form.invoice_value === "" ||
      form.invoice_value === null ||
      Number(form.invoice_value) <= 0
    ) {
      newErrors.invoice_value = "Nilai invoice harus lebih besar dari 0.";
    }

    if (
      form.vat_rate === "" ||
      form.vat_rate === null ||
      Number(form.vat_rate) < 0 ||
      Number(form.vat_rate) > 100
    ) {
      newErrors.vat_rate = "PPN harus berada di antara 0 sampai 100%.";
    }

    if (!form.due_date) {
      newErrors.due_date = "Tanggal jatuh tempo wajib diisi.";
    }

    if (
      form.invoice_date &&
      form.due_date &&
      form.due_date < form.invoice_date
    ) {
      newErrors.due_date =
        "Tanggal jatuh tempo tidak boleh lebih awal dari tanggal invoice.";
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
      const formData = new FormData();

      formData.append("id_work_item", String(form.id_work_item));

      formData.append("id_completion", String(form.id_completion));

      formData.append("invoice_number", form.invoice_number.trim());

      formData.append("invoice_date", form.invoice_date);

      formData.append("invoice_value", String(Number(form.invoice_value)));

      formData.append("vat_rate", String(Number(form.vat_rate)));

      formData.append("due_date", form.due_date);

      formData.append("notes", form.notes.trim());

      if (form.document) {
        formData.append("document", form.document);
      }

      const response = await Api.post("/work-item/invoice", formData, {
        transformRequest: [
          (data, headers) => {
            if (data instanceof FormData) {
              delete headers["Content-Type"];
            }

            return data;
          },
        ],
      });

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Invoice berhasil dibuat.",
        );

        if (onSuccess) {
          await onSuccess();
        }

        onClose();
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal membuat invoice.",
        );
      }
    } catch (error) {
      console.error("Gagal membuat invoice:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal membuat invoice.",
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
        if (event.target === event.currentTarget && !loading) {
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
              Tambah Invoice
            </h2>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
              Create New Invoice
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
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pekerjaan <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.id_work_item}
                  onChange={(event) =>
                    handleChange("id_work_item", event.target.value)
                  }
                  disabled={loadingOptions || loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.id_work_item
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } cursor-pointer bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                >
                  <option value="">
                    {loadingOptions ? "Memuat pekerjaan..." : "Pilih Pekerjaan"}
                  </option>

                  {workItems.map((item) => (
                    <option
                      key={item.id ?? item.id_work_item}
                      value={item.id ?? item.id_work_item}
                    >
                      {item.label ||
                        `${item.work_number || ""} - ${item.work_name || ""}`}
                    </option>
                  ))}
                </select>

                {renderError("id_work_item")}
              </div>

              {/* BA */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Berita Acara <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.id_completion}
                  onChange={(event) =>
                    handleChange("id_completion", event.target.value)
                  }
                  disabled={loadingOptions || loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.id_completion
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } cursor-pointer bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                >
                  <option value="">
                    {loadingOptions ? "Memuat BA..." : "Pilih BA"}
                  </option>

                  {completions.map((item) => (
                    <option
                      key={item.id ?? item.id_completion}
                      value={item.id ?? item.id_completion}
                    >
                      {item.label ||
                        `${item.ba_number || ""} - ${item.work_number || ""}`}
                    </option>
                  ))}
                </select>

                {renderError("id_completion")}
              </div>

              {/* Invoice Number */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nomor Invoice <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={form.invoice_number}
                  onChange={(event) =>
                    handleChange("invoice_number", event.target.value)
                  }
                  placeholder="Contoh: INV-202609-001"
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.invoice_number
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("invoice_number")}
              </div>

              {/* VAT */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  PPN (%) <span className="text-red-500">*</span>
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
                    placeholder="12"
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

              {/* Invoice Date */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal Invoice <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.invoice_date}
                  onChange={(event) =>
                    handleChange("invoice_date", event.target.value)
                  }
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.invoice_date
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("invoice_date")}
              </div>

              {/* Due Date */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Jatuh Tempo <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.due_date}
                  min={form.invoice_date || undefined}
                  onChange={(event) =>
                    handleChange("due_date", event.target.value)
                  }
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.due_date
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("due_date")}
              </div>

              {/* Invoice Value */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nilai Invoice <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 dark:text-gray-400">
                    Rp
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatRupiahNumber(form.invoice_value)}
                    onChange={(event) =>
                      handleChange(
                        "invoice_value",
                        parseRupiahNumber(event.target.value),
                      )
                    }
                    placeholder="0"
                    disabled={loading}
                    className={`h-10 w-full rounded-xl border ${
                      errors.invoice_value
                        ? "border-red-500"
                        : "border-gray-100 dark:border-white/10"
                    } bg-gray-50 pl-9 pr-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                  />
                </div>

                {renderError("invoice_value")}
              </div>

              {/* Document */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Dokumen Invoice
                </label>

                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                  {!form.document ? (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-custom-merah-terang hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-custom-merah-terang">
                      <MdAttachFile size={16} className="text-gray-400" />

                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">
                        Pilih Dokumen
                      </span>

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleDocumentChange}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 dark:bg-white/5">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-custom-merah-terang dark:bg-red-500/10">
                          <MdDescription size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-black text-custom-gelap dark:text-white">
                            {form.document.name}
                          </p>

                          <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                            {(form.document.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveDocument}
                        disabled={loading}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        title="Hapus dokumen"
                      >
                        <MdClose size={16} />
                      </button>
                    </div>
                  )}

                  <p className="mt-2 text-[8px] font-bold text-gray-400">
                    Format yang didukung: PDF, DOC, DOCX, XLS, XLSX.
                  </p>
                </div>
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
              disabled={loading || loadingOptions}
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
                  Simpan Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateInvoice;
