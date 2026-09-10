import React, { useEffect, useState } from "react";
import { MdAdd, MdClose, MdDelete, MdSave } from "react-icons/md";
import Api from "../../utils/Api";
import SwalHelper from "../../utils/Swal";
import {
  isSupportedAttachment,
  uploadAttachment,
} from "../../utils/attachment";

const INITIAL_FORM = {
  id_pegawai: "",
  tanggal_request: new Date().toISOString().split("T")[0],
  id_departemen: "",
  nama_pekerjaan: "",
  priority: "NORMAL",
  note: "",
  items: [
    {
      keterangan: "",
      unit: "",
      harga_satuan: "",
      jumlah: 1,
    },
  ],
  payment_description: "",
  payment_bank: "",
  payment_account_number: "",
  payment_account_name: "",
  attachment: null,
};

const ModalCreatePengajuan = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [pegawai, setPegawai] = useState([]);
  const [departemen, setDepartemen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoading(true);

        const [pegawaiRes, departemenRes] = await Promise.all([
          Api.get("/pegawai/basic"),
          Api.get("/master/departemen"),
        ]);

        if (pegawaiRes.data.success) {
          setPegawai(pegawaiRes.data.data || []);
        }

        if (departemenRes.data.success) {
          setDepartemen(departemenRes.data.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil master data:", error);

        await SwalHelper.error(
          error?.response?.data?.message ||
            "Gagal mengambil data pegawai atau departemen.",
        );

        onClose?.();
      } finally {
        setLoading(false);
      }
    };

    loadMasterData();
  }, [onClose]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
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
      items: [
        ...prev.items,
        {
          keterangan: "",
          unit: "",
          harga_satuan: "",
          jumlah: 1,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;

    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const totalAmount = form.items.reduce(
    (total, item) =>
      total + (Number(item.harga_satuan) || 0) * (Number(item.jumlah) || 0),
    0,
  );

  const validateForm = () => {
    if (!form.id_pegawai) {
      SwalHelper.warning("Pegawai wajib dipilih.");
      return false;
    }

    if (!form.tanggal_request) {
      SwalHelper.warning("Tanggal request wajib diisi.");
      return false;
    }

    if (!form.id_departemen) {
      SwalHelper.warning("Departemen wajib dipilih.");
      return false;
    }

    if (!form.nama_pekerjaan.trim()) {
      SwalHelper.warning("Nama pekerjaan wajib diisi.");
      return false;
    }

    if (!form.items.length) {
      SwalHelper.warning("Minimal harus terdapat satu item.");
      return false;
    }

    for (const item of form.items) {
      if (!item.keterangan.trim()) {
        SwalHelper.warning("Keterangan item wajib diisi.");
        return false;
      }

      if (!item.unit.trim()) {
        SwalHelper.warning("Unit item wajib diisi.");
        return false;
      }

      if (item.harga_satuan === "" || Number(item.harga_satuan) < 0) {
        SwalHelper.warning(
          "Harga satuan wajib diisi dan tidak boleh kurang dari 0.",
        );
        return false;
      }

      if (item.jumlah === "" || Number(item.jumlah) <= 0) {
        SwalHelper.warning("Jumlah item wajib diisi dan harus lebih dari 0.");
        return false;
      }
    }

    if (!validatePayment()) return false;

    return true;
  };

  const validatePayment = () => {
    const bank = form.payment_bank.trim();
    const accountNumber = form.payment_account_number.trim();
    const accountName = form.payment_account_name.trim();

    if (!bank) {
      SwalHelper.warning("Nama bank wajib diisi.");
      return false;
    }

    if (bank.length < 2) {
      SwalHelper.warning("Nama bank tidak valid.");
      return false;
    }

    if (!accountNumber) {
      SwalHelper.warning("Nomor rekening wajib diisi.");
      return false;
    }

    if (!/^\d+$/.test(accountNumber)) {
      SwalHelper.warning("Nomor rekening hanya boleh berisi angka.");
      return false;
    }

    if (accountNumber.length < 5) {
      SwalHelper.warning("Nomor rekening minimal 5 digit.");
      return false;
    }

    if (!accountName) {
      SwalHelper.warning("Nama rekening wajib diisi.");
      return false;
    }

    if (accountName.length < 2) {
      SwalHelper.warning("Nama rekening tidak valid.");
      return false;
    }

    return true;
  };

  const handleAttachmentChange = async (file) => {
    if (!file) return;

    try {
      const isValid = await isSupportedAttachment(file);

      if (!isValid) {
        await SwalHelper.warning("Format attachment tidak didukung.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        attachment: file,
      }));
    } catch (error) {
      console.error("Gagal memvalidasi attachment:", error);
      await SwalHelper.error("Gagal memvalidasi attachment.");
    }
  };

  const handleRemoveAttachment = () => {
    setForm((prev) => ({
      ...prev,
      attachment: null,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      let attachmentData = null;

      if (form.attachment) {
        attachmentData = await uploadAttachment(form.attachment);
      }

      const payload = {
        id_pegawai: Number(form.id_pegawai),
        tanggal_request: form.tanggal_request,
        id_departemen: Number(form.id_departemen),
        nama_pekerjaan: form.nama_pekerjaan.trim(),
        priority: form.priority,
        note: form.note.trim() || null,

        items: form.items.map((item) => ({
          keterangan: item.keterangan.trim(),
          unit: item.unit.trim(),
          harga_satuan: Number(item.harga_satuan),
          jumlah: Number(item.jumlah),
        })),

        payment_description: form.payment_description.trim() || null,
        payment_bank: form.payment_bank.trim(),
        payment_account_number: form.payment_account_number.trim(),
        payment_account_name: form.payment_account_name.trim(),

        attachment_name: attachmentData?.name || "lampiran-pengajuan",
        attachment_path: attachmentData?.url || null,
      };

      await Api.post("/purchase-requests/admin", payload);

      await SwalHelper.success("Pengajuan berhasil dibuat.");

      await onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error("Gagal membuat pengajuan:", error);

      await SwalHelper.error(
        error?.response?.data?.message ||
          error?.message ||
          "Gagal membuat pengajuan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose?.();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-custom-gelap"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/5">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-custom-gelap dark:text-white">
              Pengajuan Baru
            </h2>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[2px] text-gray-400">
              Create Purchase Request
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-gray-400"
          >
            <MdClose size={19} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-custom-cerah border-t-transparent" />
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Memuat Data...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="space-y-6 p-6">
              {/* INFORMASI PENGAJUAN */}
              <section>
                <div className="mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                    Informasi Pengajuan
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Pegawai <span className="text-red-600 text-xs">*</span>
                    </label>
                    <select
                      value={form.id_pegawai}
                      onChange={(e) =>
                        handleChange("id_pegawai", e.target.value)
                      }
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none transition-colors focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="">Pilih Pegawai</option>
                      {pegawai.map((item) => (
                        <option key={item.id_pegawai} value={item.id_pegawai}>
                          {item.nama_lengkap}
                          {item.nip ? ` - ${item.nip}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Tanggal Request{" "}
                      <span className="text-red-600 text-xs">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_request}
                      onChange={(e) =>
                        handleChange("tanggal_request", e.target.value)
                      }
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none transition-colors focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Departemen <span className="text-red-600 text-xs">*</span>
                    </label>
                    <select
                      value={form.id_departemen}
                      onChange={(e) =>
                        handleChange("id_departemen", e.target.value)
                      }
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none transition-colors focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Priority <span className="text-red-600 text-xs">*</span>
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) => handleChange("priority", e.target.value)}
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none transition-colors focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                      <option value="TOP_URGENT">Top Urgent</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Nama Pekerjaan{" "}
                      <span className="text-red-600 text-xs">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nama_pekerjaan}
                      onChange={(e) =>
                        handleChange("nama_pekerjaan", e.target.value)
                      }
                      placeholder="Masukkan nama pekerjaan"
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none transition-colors focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Catatan
                    </label>
                    <textarea
                      value={form.note}
                      onChange={(e) => handleChange("note", e.target.value)}
                      placeholder="Masukkan catatan pengajuan"
                      rows={3}
                      disabled={submitting}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-medium text-custom-gelap outline-none transition-colors focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>
              </section>

              {/* ITEM */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                      Item Pengajuan
                    </h3>
                    <p className="mt-1 text-[9px] text-gray-400">
                      Tambahkan barang atau kebutuhan yang diajukan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    disabled={submitting}
                    className="flex items-center gap-1.5 rounded-xl bg-custom-merah-terang px-3 py-2 text-[9px] font-black uppercase tracking-wider text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MdAdd size={15} />
                    Tambah Item
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, index) => {
                    const itemTotal =
                      (Number(item.harga_satuan) || 0) *
                      (Number(item.jumlah) || 0);

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/[0.03]"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Item {String(index + 1).padStart(2, "0")}
                          </span>

                          {form.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={submitting}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/10 text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50"
                              title="Hapus Item"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                          <div className="md:col-span-5">
                            <label className="mb-1 block text-[8px] font-black uppercase tracking-wider text-gray-400">
                              Keterangan{" "}
                              <span className="text-red-600 text-xs">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.keterangan}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "keterangan",
                                  e.target.value,
                                )
                              }
                              placeholder="Nama barang/kebutuhan"
                              disabled={submitting}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-1 block text-[8px] font-black uppercase tracking-wider text-gray-400">
                              Unit{" "}
                              <span className="text-red-600 text-xs">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) =>
                                handleItemChange(index, "unit", e.target.value)
                              }
                              placeholder="PCS"
                              disabled={submitting}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="mb-1 block text-[8px] font-black uppercase tracking-wider text-gray-400">
                              Harga Satuan{" "}
                              <span className="text-red-600 text-xs">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.harga_satuan}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "harga_satuan",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              disabled={submitting}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </div>

                          <div className="md:col-span-1">
                            <label className="mb-1 block text-[8px] font-black uppercase tracking-wider text-gray-400">
                              Jumlah{" "}
                              <span className="text-red-600 text-xs">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.jumlah}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "jumlah",
                                  e.target.value,
                                )
                              }
                              disabled={submitting}
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[10px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                            />
                          </div>

                          <div className="flex items-end md:col-span-2">
                            <div className="w-full rounded-xl bg-custom-cerah/10 px-3 py-2.5">
                              <p className="text-[7px] font-black uppercase tracking-wider text-gray-400">
                                Total
                              </p>
                              <p className="mt-0.5 text-[10px] font-black text-custom-merah dark:text-custom-cerah">
                                {formatCurrency(itemTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex justify-end">
                  <div className="rounded-2xl px-5 py-3 bg-white shadow-sm ring-1 ring-custom-merah-terang dark:bg-custom-gelap dark:ring-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-white/50">
                      Total Pengajuan
                    </p>
                    <p className="mt-1 text-base font-black tracking-tight text-custom-merah-terang dark:text-custom-cerah">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                </div>
              </section>

              {/* PEMBAYARAN */}
              <section>
                <div className="mb-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                    Informasi Pembayaran
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Deskripsi Pembayaran
                    </label>
                    <input
                      type="text"
                      value={form.payment_description}
                      onChange={(e) =>
                        handleChange("payment_description", e.target.value)
                      }
                      placeholder="Deskripsi pembayaran"
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Bank <span className="text-red-600 text-xs">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.payment_bank}
                      onChange={(e) =>
                        handleChange("payment_bank", e.target.value)
                      }
                      placeholder="Nama bank"
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Nomor Rekening{" "}
                      <span className="text-red-600 text-xs">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.payment_account_number}
                      onChange={(e) =>
                        handleChange(
                          "payment_account_number",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      placeholder="Nomor rekening"
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      Nama Rekening{" "}
                      <span className="text-red-600 text-xs">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.payment_account_name}
                      onChange={(e) =>
                        handleChange("payment_account_name", e.target.value)
                      }
                      placeholder="Nama pemilik rekening"
                      disabled={submitting}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-bold text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                </div>
              </section>

              {/* ATTACHMENT */}
              <section>
                <div>
                  <label className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Attachment
                  </label>

                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                    <input
                      id="attachment"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) =>
                        handleAttachmentChange(e.target.files?.[0] || null)
                      }
                      disabled={submitting}
                      className="hidden"
                    />

                    <label
                      htmlFor="attachment"
                      className="flex cursor-pointer items-center justify-center rounded-xl border border-custom-merah-terang/30 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-wider text-custom-merah-terang transition-all hover:bg-custom-merah-terang/5 dark:bg-white/5"
                    >
                      Pilih Lampiran
                    </label>

                    {form.attachment && (
                      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 dark:bg-white/5">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-custom-gelap dark:text-white">
                            {form.attachment.name}
                          </p>
                          <p className="text-[9px] font-medium text-gray-400">
                            {(form.attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveAttachment}
                          disabled={submitting}
                          className="shrink-0 rounded-lg bg-red-600/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-red-600 transition-all hover:bg-red-600 hover:text-white"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 dark:border-white/5 dark:bg-custom-gelap">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-[9px] font-black uppercase tracking-wider text-gray-500 transition-all hover:bg-gray-200 disabled:opacity-50 dark:bg-white/5 dark:text-gray-400"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-2.5 text-[9px] font-black uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <MdSave size={15} />
                    Simpan Pengajuan
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalCreatePengajuan;
