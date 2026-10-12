import React, { useEffect, useState } from "react";
import { MdAttachFile, MdClose, MdDescription, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const INITIAL_FORM = {
  id_work_item: "",
  ba_number: "",
  ba_date: getTodayDate(),
  document: null,
  notes: "",
};

const ModalCreateCompletion = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [workItems, setWorkItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingWorkItems, setLoadingWorkItems] = useState(false);

  const [errors, setErrors] = useState({});

  const fetchWorkItems = async () => {
    setLoadingWorkItems(true);

    try {
      const response = await Api.get(
        "/work-item/work/options?context=completion",
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
      setForm({
        ...INITIAL_FORM,
        ba_date: getTodayDate(),
      });

      setErrors({});
      fetchWorkItems();
    } else {
      setForm({
        ...INITIAL_FORM,
        ba_date: getTodayDate(),
      });

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

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0] || null;

    handleChange("document", file);

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

    if (!form.ba_number.trim()) {
      newErrors.ba_number = "Nomor BA wajib diisi.";
    }

    if (!form.ba_date) {
      newErrors.ba_date = "Tanggal BA wajib diisi.";
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
      formData.append("ba_number", form.ba_number.trim());
      formData.append("ba_date", form.ba_date);
      formData.append("notes", form.notes.trim());

      if (form.document) {
        formData.append("document", form.document);
      }

      const response = await Api.post("/work-item/completion", formData, {
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
          response.data?.message || "BA berhasil dibuat.",
        );

        if (onSuccess) {
          await onSuccess();
        }

        onClose();
      } else {
        await SwalHelper.error(response.data?.message || "Gagal membuat BA.");
      }
    } catch (error) {
      console.error("Gagal membuat BA:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal membuat BA.",
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
          if (!loading) {
            onClose();
          }
        }
      }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[93vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-custom-gelap dark:text-white">
              Tambah BA
            </h2>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
              Create New Completion
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
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

              {/* BA Number */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nomor BA <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={form.ba_number}
                  onChange={(e) => handleChange("ba_number", e.target.value)}
                  placeholder="Contoh: BA-202610-001"
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.ba_number
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("ba_number")}
              </div>

              {/* BA Date */}
              <div>
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal BA <span className="text-red-500">*</span>
                </label>

                <input
                  type="date"
                  value={form.ba_date}
                  onChange={(e) => handleChange("ba_date", e.target.value)}
                  disabled={loading}
                  className={`h-10 w-full rounded-xl border ${
                    errors.ba_date
                      ? "border-red-500"
                      : "border-gray-100 dark:border-white/10"
                  } bg-gray-50 px-3 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white`}
                />

                {renderError("ba_date")}

                <p className="mt-1 text-[8px] font-bold text-gray-400">
                  Default menggunakan tanggal hari ini.
                </p>
              </div>

              {/* Document */}
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Dokumen BA
                </label>

                {form.document ? (
                  <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
                    <div className="flex min-w-0 items-center gap-2">
                      <MdDescription
                        size={18}
                        className="shrink-0 text-blue-600 dark:text-blue-400"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold text-blue-700 dark:text-blue-300">
                          {form.document.name}
                        </p>

                        <p className="mt-0.5 text-[8px] font-medium text-blue-500 dark:text-blue-400">
                          {(form.document.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveDocument}
                      disabled={loading}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-500/20"
                      title="Hapus dokumen"
                    >
                      <MdClose size={16} />
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed ${
                      errors.document
                        ? "border-red-500"
                        : "border-gray-200 dark:border-white/10"
                    } bg-gray-50 text-[9px] font-black uppercase tracking-wider text-gray-400 transition hover:border-custom-merah-terang hover:text-custom-merah-terang dark:bg-white/5`}
                  >
                    <MdAttachFile size={17} />

                    <span>Pilih Dokumen BA</span>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleDocumentChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                )}

                <p className="mt-1 text-[8px] font-bold text-gray-400">
                  Opsional. Format: PDF, JPG, JPEG, PNG, WEBP.
                </p>

                {renderError("document")}
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
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-custom-gelap transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
                  Simpan BA
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateCompletion;
