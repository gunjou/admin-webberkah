import React, { useEffect, useState } from "react";
import { MdClose, MdPayment } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalCreatePayment = ({ show, onClose, invoice, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: "",
    document_url: "",
    notes: "",
  });

  useEffect(() => {
    if (show) {
      setForm({
        payment_date: new Date().toISOString().split("T")[0],
        amount: invoice?.outstanding_amount ?? invoice?.total_invoice ?? "",
        document_url: "",
        notes: "",
      });
    }
  }, [show, invoice]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  const validateForm = () => {
    if (!form.payment_date) {
      SwalHelper.warning("Tanggal pembayaran wajib diisi.");
      return false;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      SwalHelper.warning("Jumlah pembayaran harus lebih dari 0.");
      return false;
    }

    const outstanding = Number(invoice?.outstanding_amount || 0);

    if (outstanding > 0 && Number(form.amount) > outstanding) {
      SwalHelper.warning(
        "Jumlah pembayaran tidak boleh melebihi sisa pembayaran.",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        id_invoice: Number(invoice.id_invoice),
        payment_date: form.payment_date,
        amount: Number(form.amount),
        document_url: form.document_url.trim() || null,
        notes: form.notes.trim() || null,
      };

      const response = await Api.post("/work-item/payment", payload);

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Pembayaran berhasil dibuat.",
        );

        onSuccess?.();
        onClose();
      } else {
        SwalHelper.error(response.data?.message || "Gagal membuat pembayaran.");
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal membuat pembayaran.",
      );
    } finally {
      setLoading(false);
    }
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
      <div className="flex h-[90vh] max-h-[90vh] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-custom-merah/10 text-custom-merah dark:bg-custom-merah/20">
              <MdPayment size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-black uppercase tracking-tight text-custom-gelap dark:text-white">
                Buat Payment
              </h2>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
                Catat pembayaran invoice
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="shrink-0 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <MdClose size={21} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* Invoice Information */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.5px] text-gray-400">
                      Invoice
                    </span>

                    <p className="mt-0.5 text-sm font-black text-custom-merah-terang">
                      {invoice?.invoice_number || "-"}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] font-black uppercase tracking-[1.5px] text-gray-400">
                      Work
                    </span>

                    <p className="mt-0.5 text-[10px] font-black text-custom-gelap dark:text-white">
                      {invoice?.work_number || "-"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <p
                    className="truncate text-[10px] font-black text-custom-gelap dark:text-white"
                    title={invoice?.work_name}
                  >
                    {invoice?.work_name || "-"}
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                    {invoice?.client_name || "-"}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-white px-3 py-2.5 dark:bg-white/5">
                    <span className="block text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Total Invoice
                    </span>

                    <span className="mt-1 block text-[12px] font-black text-custom-gelap dark:text-white">
                      {formatCurrency(invoice?.total_invoice)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-500/10">
                    <span className="block text-[8px] font-black uppercase tracking-[1.2px] text-red-400">
                      Sisa Pembayaran
                    </span>

                    <span className="mt-1 block text-[12px] font-black text-red-500">
                      {formatCurrency(invoice?.outstanding_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[1.5px] text-custom-gelap dark:text-white">
                    Informasi Pembayaran
                  </h3>

                  <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                    Masukkan informasi pembayaran yang diterima.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Payment Date */}
                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-[1.2px] text-gray-500 dark:text-gray-300">
                      Tanggal Pembayaran <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      name="payment_date"
                      value={form.payment_date}
                      onChange={handleChange}
                      disabled={loading}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 outline-none transition focus:border-custom-merah focus:ring-1 focus:ring-custom-merah dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-[1.2px] text-gray-500 dark:text-gray-300">
                      Jumlah Pembayaran <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      disabled={loading}
                      placeholder="Contoh: 39200000"
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 outline-none transition focus:border-custom-merah focus:ring-1 focus:ring-custom-merah dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />

                    {Number(invoice?.outstanding_amount || 0) > 0 && (
                      <p className="mt-1.5 text-[8px] font-semibold text-gray-400">
                        Maksimal pembayaran:{" "}
                        <span className="font-black text-red-500">
                          {formatCurrency(invoice?.outstanding_amount)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Document URL */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-[1.2px] text-gray-500 dark:text-gray-300">
                      URL Bukti Pembayaran
                    </label>

                    <input
                      type="url"
                      name="document_url"
                      value={form.document_url}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="https://example.com/payment.pdf"
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-700 outline-none transition focus:border-custom-merah focus:ring-1 focus:ring-custom-merah dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[9px] font-black uppercase tracking-[1.2px] text-gray-500 dark:text-gray-300">
                      Catatan
                    </label>

                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      disabled={loading}
                      rows={3}
                      placeholder="Catatan pembayaran..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-gray-700 outline-none transition focus:border-custom-merah focus:ring-1 focus:ring-custom-merah dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Amount Summary */}
              <div className="rounded-xl border border-custom-merah/20 bg-custom-merah/5 p-4 dark:border-custom-merah/20 dark:bg-custom-merah/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.5px] text-gray-400">
                      Pembayaran yang akan dicatat
                    </span>

                    <p className="mt-1 text-[10px] font-semibold text-gray-500 dark:text-gray-300">
                      Pastikan jumlah pembayaran sudah sesuai bukti.
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-base font-black text-custom-merah-terang">
                    {formatCurrency(form.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-gray-200 px-5 text-[10px] font-black uppercase tracking-wide text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-custom-merah px-5 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreatePayment;
