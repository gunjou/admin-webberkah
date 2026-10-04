import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDelete,
  MdDescription,
  MdEdit,
  MdLink,
  MdSave,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const INITIAL_FORM = {
  completion_date: "",
  ba_no: "",
  ba_date: "",
  expected_invoice_date: "",
  document_url: "",
  notes: "",
};

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
};

const ModalBA = ({ isOpen, workItemId, workItem, onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasBA, setHasBA] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isOpen || !workItemId) return;

    const fetchBA = async () => {
      setLoading(true);
      setIsEditing(false);

      try {
        const response = await Api.get(
          `/work-item/work/${workItemId}/completion`,
        );

        const data = response.data?.data;

        if (data) {
          const completionData = {
            completion_date: data.completion_date || "",
            ba_no: data.ba_no || "",
            ba_date: data.ba_date || "",
            expected_invoice_date: data.expected_invoice_date || "",
            document_url: data.document_url || "",
            notes: data.notes || "",
          };

          setHasBA(true);
          setForm(completionData);
          setOriginalForm(completionData);
          setIsEditing(false);
        } else {
          const newForm = {
            ...INITIAL_FORM,
            completion_date: workItem?.actual_completion_date || getToday(),
          };

          setHasBA(false);
          setForm(newForm);
          setOriginalForm(newForm);
          setIsEditing(true);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          const newForm = {
            ...INITIAL_FORM,
            completion_date: workItem?.actual_completion_date || getToday(),
          };

          setHasBA(false);
          setForm(newForm);
          setOriginalForm(newForm);
          setIsEditing(true);
        } else {
          console.error("Gagal mengambil data BA:", error);

          await SwalHelper.error(
            error.response?.data?.message || "Data BA gagal dimuat.",
          );

          onClose?.();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, workItemId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    setIsEditing(true);
  };

  const handleCancelEdit = (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    setForm(originalForm);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // BA sudah ada tetapi belum masuk edit mode.
    // Submit tidak boleh melakukan apa pun.
    if (hasBA && !isEditing) {
      return;
    }

    if (!form.completion_date) {
      await SwalHelper.warning("Tanggal penyelesaian wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        completion_date: form.completion_date,
        ba_no: form.ba_no.trim() || null,
        ba_date: form.ba_date || null,
        expected_invoice_date: form.expected_invoice_date || null,
        document_url: form.document_url.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (hasBA) {
        await Api.put(`/work-item/work/${workItemId}/completion`, payload);

        await SwalHelper.success("BA berhasil diperbarui.");

        const updatedForm = {
          completion_date: form.completion_date,
          ba_no: form.ba_no,
          ba_date: form.ba_date,
          expected_invoice_date: form.expected_invoice_date,
          document_url: form.document_url,
          notes: form.notes,
        };

        setForm(updatedForm);
        setOriginalForm(updatedForm);
        setIsEditing(false);
      } else {
        await Api.post(`/work-item/work/${workItemId}/completion`, payload);

        await SwalHelper.success("BA berhasil dibuat.");

        onSuccess?.();
      }
    } catch (error) {
      console.error("Gagal menyimpan BA:", error);

      await SwalHelper.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Data BA gagal disimpan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();

    const confirmed = await SwalHelper.confirm({
      title: "Hapus BA?",
      message: `Data BA untuk "${
        workItem?.work_no || "Work Item ini"
      }" akan dihapus.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setDeleting(true);

      await Api.delete(`/work-item/work/${workItemId}/completion`);

      await SwalHelper.success("BA berhasil dihapus.");

      onSuccess?.();
    } catch (error) {
      console.error("Gagal menghapus BA:", error);

      await SwalHelper.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "BA gagal dihapus.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      if (submitting || deleting) return;

      if (hasBA && isEditing) {
        const confirmed = window.confirm(
          "Perubahan yang belum disimpan akan dibatalkan. Tutup modal?",
        );

        if (!confirmed) return;
      }

      onClose?.();
    }
  };

  if (!isOpen) return null;

  const fieldsDisabled = submitting || deleting || (hasBA && !isEditing);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-[25px] bg-white shadow-2xl dark:bg-custom-gelap"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-custom-merah/10 text-custom-merah dark:bg-custom-merah/20 dark:text-custom-cerah">
              <MdDescription size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-black text-custom-gelap dark:text-white">
                {hasBA ? "Berita Acara Penyelesaian" : "Buat Berita Acara"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting || deleting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-100 hover:text-custom-merah disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/5"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* WORK ITEM INFO */}
        <div className="px-5 pt-5">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Work Item
                </p>

                <p className="mt-1 truncate font-bold text-custom-gelap dark:text-white">
                  {workItem?.work_no || "-"}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {workItem?.description || "-"}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-custom-merah/10 px-3 py-1 text-[10px] font-black uppercase text-custom-merah dark:bg-custom-merah/20 dark:text-custom-cerah">
                {workItem?.current_stage || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-custom-merah" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* COMPLETION DATE */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tanggal Penyelesaian
                    <span className="ml-1 text-custom-merah">*</span>
                  </label>

                  <input
                    type="date"
                    name="completion_date"
                    value={form.completion_date}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-custom-gelap outline-none transition-all focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                {/* BA NO */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Nomor BA
                  </label>

                  <input
                    type="text"
                    name="ba_no"
                    value={form.ba_no}
                    onChange={handleChange}
                    placeholder="Contoh: BA/001/IX/2026"
                    disabled={fieldsDisabled}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-custom-gelap outline-none transition-all placeholder:text-gray-300 focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600"
                  />
                </div>

                {/* BA DATE */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tanggal BA
                  </label>

                  <input
                    type="date"
                    name="ba_date"
                    value={form.ba_date}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-custom-gelap outline-none transition-all focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                {/* EXPECTED INVOICE DATE */}
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Estimasi Invoice
                  </label>

                  <input
                    type="date"
                    name="expected_invoice_date"
                    value={form.expected_invoice_date}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-custom-gelap outline-none transition-all focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                {/* DOCUMENT URL */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Link Dokumen BA
                  </label>

                  <div className="relative">
                    <MdLink
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="url"
                      name="document_url"
                      value={form.document_url}
                      onChange={handleChange}
                      placeholder="https://..."
                      disabled={fieldsDisabled}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm font-medium text-custom-gelap outline-none transition-all placeholder:text-gray-300 focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600"
                    />
                  </div>

                  {form.document_url && (
                    <a
                      href={form.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-custom-merah hover:underline dark:text-custom-cerah"
                    >
                      <MdLink size={13} />
                      Buka dokumen
                    </a>
                  )}
                </div>

                {/* NOTES */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Catatan
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    rows={4}
                    placeholder="Catatan penyelesaian atau BA..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-custom-gelap outline-none transition-all placeholder:text-gray-300 focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          {!loading && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/5">
              {/* LEFT */}
              <div>
                {hasBA && !isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || submitting}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
                  >
                    <MdDelete size={17} />
                    Hapus BA
                  </button>
                )}
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                {/* CREATE MODE */}
                {!hasBA && (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={submitting || deleting}
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-500 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || deleting}
                      className="inline-flex items-center gap-2 rounded-xl bg-custom-merah px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-custom-merah/20 transition-all hover:bg-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdSave size={17} />
                      {submitting ? "Menyimpan..." : "Simpan BA"}
                    </button>
                  </>
                )}

                {/* VIEW MODE */}
                {hasBA && !isEditing && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={submitting || deleting}
                    className="inline-flex items-center gap-2 rounded-xl bg-custom-merah px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-custom-merah/20 transition-all hover:bg-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MdEdit size={17} />
                    Edit BA
                  </button>
                )}

                {/* EDIT MODE */}
                {hasBA && isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={submitting || deleting}
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-500 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || deleting}
                      className="inline-flex items-center gap-2 rounded-xl bg-custom-merah px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-custom-merah/20 transition-all hover:bg-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdSave size={17} />
                      {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ModalBA;
