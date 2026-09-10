import React, { useEffect, useState } from "react";
import {
  MdAdd,
  MdCalendarToday,
  MdClose,
  MdDelete,
  MdDescription,
  MdPayments,
  MdSave,
} from "react-icons/md";
import Api from "../../utils/Api";
import SwalHelper from "../../utils/Swal";
import {
  isSupportedAttachment,
  uploadAttachment,
} from "../../utils/attachment";

const STATUS_STYLE = {
  REQUESTED: { label: "Requested", light: "#CA8A04" },
  REVIEWED: { label: "Reviewed", light: "#059669" },
  APPROVED: { label: "Approved", light: "#16A34A" },
  REJECTED: { label: "Rejected", light: "#B91C1C" },
  PAID: { label: "Paid", light: "#0284C7" },
};

const PRIORITY_STYLE = {
  NORMAL: { label: "Normal", light: "#52525B" },
  URGENT: { label: "Urgent", light: "#B45309" },
  TOP_URGENT: { label: "Top Urgent", light: "#B91C1C" },
};

const emptyItem = (itemNo = 1) => ({
  item_no: itemNo,
  keterangan: "",
  unit: "",
  harga_satuan: 0,
  jumlah: 1,
});

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const ModalEditPengajuan = ({
  data,
  departemen = [],
  loading = false,
  onClose,
  onRefresh,
  onRefreshList,
}) => {
  const [form, setForm] = useState({
    tanggal_request: "",
    id_departemen: "",
    nama_pekerjaan: "",
    priority: "NORMAL",
    note: "",
    items: [],
    payment_description: "",
    payment_bank: "",
    payment_account_number: "",
    payment_account_name: "",
  });

  const [attachment, setAttachment] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;

    setForm({
      tanggal_request: data.tanggal_request || "",
      id_departemen: data.departemen?.id_departemen || "",
      nama_pekerjaan: data.nama_pekerjaan || "",
      priority: data.priority || "NORMAL",
      note: data.note || "",
      items: (data.items || []).map((item, index) => ({
        item_no: item.item_no || index + 1,
        keterangan: item.keterangan || "",
        unit: item.unit || "",
        harga_satuan: item.harga_satuan ?? 0,
        jumlah: item.jumlah ?? 0,
      })),
      payment_description: data.payment?.description || "",
      payment_bank: data.payment?.bank || "",
      payment_account_number: data.payment?.account_number || "",
      payment_account_name: data.payment?.account_name || "",
    });

    setAttachment(null);
    setRemoveAttachment(false);
  }, [data]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, saving]);

  if (!data && !loading) return null;

  const status = STATUS_STYLE[data?.status] || STATUS_STYLE.REQUESTED;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, emptyItem(prev.items.length + 1)],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          item_no: itemIndex + 1,
        })),
    }));
  };

  const getItemTotal = (item) =>
    (Number(item.harga_satuan) || 0) * (Number(item.jumlah) || 0);

  const totalAmount = form.items.reduce(
    (total, item) => total + getItemTotal(item),
    0,
  );

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !saving) onClose();
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!isSupportedAttachment(file)) {
      SwalHelper.warning(
        "Format attachment tidak didukung. Gunakan gambar atau dokumen yang diperbolehkan.",
      );
      event.target.value = "";
      return;
    }

    setAttachment(file);
    setRemoveAttachment(false);
    event.target.value = "";
  };

  const handleRemoveNewAttachment = () => {
    setAttachment(null);
  };

  const handleRemoveExistingAttachment = () => {
    setAttachment(null);
    setRemoveAttachment(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!data?.id_request || saving) return;

    if (!form.tanggal_request) {
      await SwalHelper.warning("Tanggal pengajuan wajib diisi.");
      return;
    }

    if (!form.id_departemen) {
      await SwalHelper.warning("Departemen wajib dipilih.");
      return;
    }

    if (!form.nama_pekerjaan.trim()) {
      await SwalHelper.warning("Nama pekerjaan wajib diisi.");
      return;
    }

    if (!form.items.length) {
      await SwalHelper.warning("Minimal terdapat satu item pengajuan.");
      return;
    }

    const invalidItem = form.items.find(
      (item) =>
        !item.keterangan.trim() ||
        !item.unit.trim() ||
        item.harga_satuan === "" ||
        Number(item.harga_satuan) < 0 ||
        item.jumlah === "" ||
        Number(item.jumlah) <= 0,
    );

    if (invalidItem) {
      await SwalHelper.warning(
        "Pastikan seluruh item memiliki keterangan, unit, harga yang valid, dan jumlah lebih dari 0.",
      );
      return;
    }

    try {
      setSaving(true);

      let attachmentData = {
        name: data?.attachment?.name?.trim() || null,
        url: data?.attachment?.path || null,
      };

      if (attachment) {
        attachmentData = await uploadAttachment(attachment);
      } else if (removeAttachment) {
        attachmentData = {
          name: null,
          url: null,
        };
      }

      const payload = {
        tanggal_request: form.tanggal_request,
        id_departemen: Number(form.id_departemen),
        nama_pekerjaan: form.nama_pekerjaan.trim(),
        priority: form.priority,
        note: form.note.trim() || null,
        items: form.items.map((item, index) => ({
          item_no: index + 1,
          keterangan: item.keterangan.trim(),
          unit: item.unit.trim(),
          harga_satuan: Number(item.harga_satuan),
          jumlah: Number(item.jumlah),
        })),
        payment_description: form.payment_description.trim() || null,
        payment_bank: form.payment_bank.trim(),
        payment_account_number: form.payment_account_number.trim(),
        payment_account_name: form.payment_account_name.trim(),
        attachment_name: attachmentData.name,
        attachment_path: attachmentData.url,
      };

      await Api.put(`/purchase-requests/${data.id_request}`, payload);

      await SwalHelper.success("Pengajuan berhasil diperbarui.");

      await onRefresh?.();
      await onRefreshList?.();

      onClose();
    } catch (error) {
      console.error("PUT ERROR STATUS:", error.response?.status);
      console.error("PUT ERROR DATA:", error.response?.data);
      console.error("PUT ERROR URL:", error.config?.url);
      console.error("PUT ERROR METHOD:", error.config?.method);

      await SwalHelper.error(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal memperbarui pengajuan.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-custom-gelap">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-white/5 dark:bg-custom-gelap">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-black tracking-tight text-custom-gelap dark:text-white">
                Edit Pengajuan
              </h2>

              {data?.status && (
                <span
                  className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: status.light }}
                >
                  {status.label}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs font-bold text-gray-400">
              {data?.request_number || "-"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            <MdClose size={19} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-custom-cerah border-t-transparent" />
            </div>
          ) : (
            <form
              id="edit-pengajuan-form"
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* INFORMASI PENGAJUAN */}
              <section className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="mb-4 flex items-center gap-2">
                  <MdDescription
                    size={19}
                    className="text-custom-merah-terang"
                  />

                  <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                    Informasi Pengajuan
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Tanggal Pengajuan" required>
                    <div className="relative">
                      <MdCalendarToday
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="date"
                        value={form.tanggal_request}
                        onChange={(event) =>
                          updateField("tanggal_request", event.target.value)
                        }
                        disabled={saving}
                        required
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-xs font-medium text-custom-gelap outline-none transition-all focus:border-custom-cerah focus:ring-2 focus:ring-custom-cerah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                      />
                    </div>
                  </FormField>

                  <FormField label="Departemen" required>
                    <select
                      value={form.id_departemen}
                      onChange={(event) =>
                        updateField("id_departemen", event.target.value)
                      }
                      disabled={saving}
                      required
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-custom-gelap outline-none transition-all focus:border-custom-cerah focus:ring-2 focus:ring-custom-cerah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-custom-gelap dark:text-white"
                    >
                      <option value="">Pilih Departemen</option>

                      {departemen.map((item) => (
                        <option
                          key={item.id_departemen}
                          value={item.id_departemen}
                        >
                          {item.nama_departemen}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Nama Pekerjaan" required full>
                    <input
                      type="text"
                      value={form.nama_pekerjaan}
                      onChange={(event) =>
                        updateField("nama_pekerjaan", event.target.value)
                      }
                      disabled={saving}
                      required
                      placeholder="Nama pekerjaan"
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-custom-gelap outline-none transition-all focus:border-custom-cerah focus:ring-2 focus:ring-custom-cerah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    />
                  </FormField>

                  <FormField label="Priority" required>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(PRIORITY_STYLE).map(([value, item]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateField("priority", value)}
                          disabled={saving}
                          className={`h-10 rounded-lg border px-2 text-[9px] font-black uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-60 ${form.priority === value ? "text-white" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400"}`}
                          style={
                            form.priority === value
                              ? {
                                  backgroundColor: item.light,
                                  borderColor: item.light,
                                }
                              : undefined
                          }
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Catatan">
                    <textarea
                      value={form.note}
                      onChange={(event) =>
                        updateField("note", event.target.value)
                      }
                      disabled={saving}
                      rows={2}
                      placeholder="Catatan pengajuan..."
                      className="min-h-20 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-custom-gelap outline-none transition-all placeholder:text-gray-400 focus:border-custom-cerah focus:ring-2 focus:ring-custom-cerah/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    />
                  </FormField>
                </div>
              </section>

              {/* ITEMS */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                      Detail Item
                    </h3>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Ubah item yang diperlukan dalam pengajuan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    disabled={saving}
                    className="flex h-9 items-center gap-2 rounded-lg bg-custom-merah-terang px-3 text-[9px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MdAdd size={16} />
                    Tambah Item
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 dark:bg-white/[0.03]">
                        <tr>
                          <th className="w-12 px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                            No
                          </th>
                          <th className="px-3 py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Keterangan
                          </th>
                          <th className="w-24 px-3 py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Unit
                          </th>
                          <th className="w-36 px-3 py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Harga
                          </th>
                          <th className="w-28 px-3 py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Jumlah
                          </th>
                          <th className="w-36 px-3 py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Total
                          </th>
                          <th className="w-14 px-3 py-3 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {form.items.map((item, index) => (
                          <tr key={`${item.item_no}-${index}`}>
                            <td className="px-3 py-3 text-center text-xs font-bold text-gray-400">
                              {index + 1}
                            </td>

                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.keterangan}
                                onChange={(event) =>
                                  updateItem(
                                    index,
                                    "keterangan",
                                    event.target.value,
                                  )
                                }
                                disabled={saving}
                                required
                                className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                              />
                            </td>

                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.unit}
                                onChange={(event) =>
                                  updateItem(index, "unit", event.target.value)
                                }
                                disabled={saving}
                                required
                                className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-xs font-medium uppercase text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                              />
                            </td>

                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.harga_satuan}
                                onChange={(event) =>
                                  updateItem(
                                    index,
                                    "harga_satuan",
                                    event.target.value,
                                  )
                                }
                                disabled={saving}
                                required
                                className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-right text-xs font-medium text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                              />
                            </td>

                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.jumlah}
                                onChange={(event) =>
                                  updateItem(
                                    index,
                                    "jumlah",
                                    event.target.value,
                                  )
                                }
                                disabled={saving}
                                required
                                className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-right text-xs font-medium text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                              />
                            </td>

                            <td className="px-3 py-3 text-right text-xs font-black text-custom-gelap dark:text-white">
                              {formatCurrency(getItemTotal(item))}
                            </td>

                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={saving || form.items.length <= 1}
                                className="flex h-9 w-9 items-center justify-center rounded-md bg-custom-merah-terang/10 text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <MdDelete size={17} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot>
                        <tr className="border-t-2 border-custom-cerah/20 bg-custom-merah-terang/[0.04]">
                          <td
                            colSpan="5"
                            className="px-3 py-4 text-right text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400"
                          >
                            Total Pengajuan
                          </td>

                          <td className="px-3 py-4 text-right text-sm font-black text-custom-merah-terang dark:text-custom-merah-terang">
                            {formatCurrency(totalAmount)}
                          </td>

                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              <section className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="mb-4 flex items-center gap-2">
                  <MdPayments size={19} className="text-custom-merah-terang" />

                  <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                    Pembayaran
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Deskripsi">
                    <input
                      type="text"
                      value={form.payment_description}
                      onChange={(event) =>
                        updateField("payment_description", event.target.value)
                      }
                      disabled={saving}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    />
                  </FormField>

                  <FormField label="Bank" required>
                    <input
                      type="text"
                      value={form.payment_bank}
                      onChange={(event) =>
                        updateField("payment_bank", event.target.value)
                      }
                      disabled={saving}
                      required
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    />
                  </FormField>

                  <FormField label="No. Rekening" required>
                    <input
                      type="text"
                      value={form.payment_account_number}
                      onChange={(event) =>
                        updateField(
                          "payment_account_number",
                          event.target.value,
                        )
                      }
                      disabled={saving}
                      required
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    />
                  </FormField>

                  <FormField label="Nama Rekening" required>
                    <input
                      type="text"
                      value={form.payment_account_name}
                      onChange={(event) =>
                        updateField("payment_account_name", event.target.value)
                      }
                      disabled={saving}
                      required
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-custom-gelap outline-none focus:border-custom-cerah dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                    />
                  </FormField>
                </div>
              </section>

              {/* ATTACHMENT */}
              <section className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="mb-4 flex items-center gap-2">
                  <MdDescription
                    size={19}
                    className="text-custom-merah-terang"
                  />

                  <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                    Attachment
                  </h3>
                </div>

                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <input
                    id="edit-attachment"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleAttachmentChange}
                    disabled={saving}
                    className="hidden"
                  />

                  {attachment ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-custom-gelap dark:text-white">
                          {attachment.name}
                        </p>

                        <p className="mt-0.5 text-[9px] font-medium text-gray-400">
                          File baru akan diupload saat disimpan.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveNewAttachment}
                        disabled={saving}
                        className="shrink-0 rounded-lg bg-red-600/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Batal
                      </button>
                    </div>
                  ) : data?.attachment?.path && !removeAttachment ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-custom-gelap dark:text-white">
                          {data.attachment.name || "lampiran-pengajuan"}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] font-medium text-gray-400">
                          Attachment tersimpan
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <label
                          htmlFor="edit-attachment"
                          className="cursor-pointer rounded-lg bg-custom-merah-terang/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white"
                        >
                          Ganti
                        </label>

                        <button
                          type="button"
                          onClick={handleRemoveExistingAttachment}
                          disabled={saving}
                          className="rounded-lg bg-red-600/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-medium text-gray-400">
                        {removeAttachment
                          ? "Attachment akan dihapus saat disimpan."
                          : "Belum ada attachment."}
                      </p>

                      <label
                        htmlFor="edit-attachment"
                        className="cursor-pointer rounded-lg bg-custom-merah-terang px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90"
                      >
                        Pilih File
                      </label>
                    </div>
                  )}
                </div>
              </section>
            </form>
          )}
        </div>

        {/* FOOTER */}
        {!loading && data && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-gray-100 bg-white px-6 py-4 dark:border-white/5 dark:bg-custom-gelap">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-lg bg-gray-100 px-5 text-[10px] font-black uppercase tracking-wider text-gray-600 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Batal
            </button>

            <button
              type="submit"
              form="edit-pengajuan-form"
              disabled={saving}
              className="flex h-10 items-center gap-2 rounded-lg bg-custom-merah-terang px-6 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:bg-custom-merah disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <MdSave size={17} />
              )}

              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FormField = ({ label, required = false, full = false, children }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-gray-400">
      {label}
      {required && <span className="ml-1 text-custom-merah-terang">*</span>}
    </label>
    {children}
  </div>
);

export default ModalEditPengajuan;
