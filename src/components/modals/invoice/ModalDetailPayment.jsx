import React, { useEffect, useState } from "react";
import { MdClose, MdDelete, MdOpenInNew, MdPayment } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatVatRate = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${Number(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })}%`;
};

const WORK_TYPE_LABELS = {
  TENDER: "Tender",
  MAINTENANCE: "Maintenance",
};

const STAGE_LABELS = {
  IDENTIFIED: "Identified",
  QUOTATION: "Quotation",
  CONTRACT: "Contract",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BA: "BA",
  INVOICE: "Invoice",
  PAYMENT: "Payment",
  CLOSED: "Closed",
};

const ModalDetailPayment = ({ show, paymentId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (show && paymentId) {
      fetchPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, paymentId]);

  const fetchPayment = async () => {
    try {
      setLoading(true);

      const response = await Api.get(`/work-item/payment/${paymentId}`);

      if (response.data?.success) {
        setPayment(response.data?.data || null);
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil detail payment.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil detail payment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await SwalHelper.confirm({
      title: "Hapus Payment?",
      message: `Payment untuk invoice "${payment?.invoice_number || "-"}" akan dinonaktifkan.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await Api.delete(`/work-item/payment/${paymentId}`);

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Payment berhasil dihapus.",
        );

        onSuccess?.();
        onClose();
      } else {
        SwalHelper.error(response.data?.message || "Gagal menghapus payment.");
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal menghapus payment.",
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
      <div className="flex h-[90vh] max-h-[90vh] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-custom-merah/10 text-custom-merah dark:bg-custom-merah/20">
              <MdPayment size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-black uppercase tracking-tight text-custom-gelap dark:text-white">
                Detail Payment
              </h2>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[1.5px] text-gray-400">
                Informasi pembayaran invoice
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
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {loading && !payment ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Memuat detail payment...
              </span>
            </div>
          ) : payment ? (
            <div className="space-y-5">
              {/* Payment Summary */}
              <div className="rounded-xl border border-custom-merah/20 bg-custom-merah/5 p-4 dark:border-custom-merah/20 dark:bg-custom-merah/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-[1.5px] text-gray-400">
                      Payment
                    </span>

                    <p className="mt-1 text-xl font-black tracking-tight text-custom-merah-terang">
                      {formatCurrency(payment.amount)}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold text-gray-400">
                      Dibayar pada {formatDate(payment.payment_date)}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
                    Paid
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-white px-3 py-2.5 dark:bg-white/5">
                    <span className="block text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Invoice
                    </span>

                    <span className="mt-1 block text-[11px] font-black text-custom-gelap dark:text-white">
                      {payment.invoice_number || "-"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-white px-3 py-2.5 dark:bg-white/5">
                    <span className="block text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Pekerjaan
                    </span>

                    <span className="mt-1 block truncate text-[11px] font-black text-custom-gelap dark:text-white">
                      {payment.work_number || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice */}
              <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[1.5px] text-custom-gelap dark:text-white">
                    Informasi Invoice
                  </h3>

                  <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                    Informasi invoice yang terkait dengan payment.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Invoice Number */}
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Nomor Invoice
                    </span>

                    <p className="mt-1 text-[11px] font-black text-custom-merah-terang">
                      {payment.invoice_number || "-"}
                    </p>
                  </div>

                  {/* Invoice Date */}
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Tanggal Invoice
                    </span>

                    <p className="mt-1 text-[11px] font-black text-custom-gelap dark:text-white">
                      {formatDate(payment.invoice_date)}
                    </p>
                  </div>

                  {/* Due Date */}
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Jatuh Tempo
                    </span>

                    <p className="mt-1 text-[11px] font-black text-custom-gelap dark:text-white">
                      {formatDate(payment.due_date)}
                    </p>
                  </div>
                </div>

                {/* Invoice Value Summary */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-white/5">
                    <span className="block text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Nilai Invoice
                    </span>

                    <span className="mt-1 block text-[11px] font-black text-custom-gelap dark:text-white">
                      {formatCurrency(payment.invoice_value)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-white/5">
                    <span className="block text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      PPN
                    </span>

                    <span className="mt-1 block text-[11px] font-black text-custom-gelap dark:text-white">
                      {formatVatRate(payment.vat_rate)}
                    </span>

                    <span className="mt-0.5 block text-[8px] font-semibold text-gray-400">
                      {formatCurrency(payment.vat_amount)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-red-50 px-3 py-2.5 dark:bg-red-500/10">
                    <span className="block text-[8px] font-black uppercase tracking-[1.2px] text-red-400">
                      Total Invoice
                    </span>

                    <span className="mt-1 block text-[11px] font-black text-custom-merah-terang">
                      {formatCurrency(payment.total_invoice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work */}
              <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[1.5px] text-custom-gelap dark:text-white">
                    Informasi Pekerjaan
                  </h3>

                  <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                    Pekerjaan yang terkait dengan invoice dan payment.
                  </p>
                </div>

                <div>
                  <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                    Nomor Pekerjaan
                  </span>

                  <p className="mt-1 text-[11px] font-black text-custom-gelap dark:text-white">
                    {payment.work_number || "-"}
                  </p>

                  <p
                    className="mt-0.5 truncate text-[10px] font-semibold text-gray-400"
                    title={payment.work_name}
                  >
                    {payment.work_name || "-"}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Jenis Pekerjaan
                    </span>

                    <p className="mt-1 text-[10px] font-black text-custom-gelap dark:text-white">
                      {WORK_TYPE_LABELS[payment.work_type] ||
                        payment.work_type ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Stage
                    </span>

                    <p className="mt-1 text-[10px] font-black text-custom-gelap dark:text-white">
                      {STAGE_LABELS[payment.current_stage] ||
                        payment.current_stage ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client */}
              <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[1.5px] text-custom-gelap dark:text-white">
                    Informasi Client
                  </h3>

                  <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                    Client yang terkait dengan pekerjaan.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Nama Client
                    </span>

                    <p className="mt-1 text-[11px] font-black text-custom-gelap dark:text-white">
                      {payment.client_name || "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Kode Client
                    </span>

                    <p className="mt-1 text-[11px] font-black text-custom-gelap dark:text-white">
                      {payment.client_code || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document */}
              {payment.document_url && (
                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                  <div className="mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[1.5px] text-custom-gelap dark:text-white">
                      Bukti Pembayaran
                    </h3>

                    <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                      Dokumen atau bukti pembayaran yang dilampirkan.
                    </p>
                  </div>

                  <a
                    href={payment.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-custom-merah px-4 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-custom-merah-terang"
                  >
                    <MdOpenInNew size={15} />
                    Buka Bukti Pembayaran
                  </a>
                </div>
              )}

              {/* Notes */}
              {payment.notes && (
                <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                  <div className="mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[1.5px] text-custom-gelap dark:text-white">
                      Catatan
                    </h3>
                  </div>

                  <div className="rounded-lg bg-gray-50 px-3 py-3 dark:bg-white/5">
                    <p className="text-[10px] font-medium leading-5 text-gray-600 dark:text-gray-300">
                      {payment.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* System */}
              <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                <div className="mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[1.5px] text-custom-gelap dark:text-white">
                    Informasi Sistem
                  </h3>

                  <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                    Informasi pencatatan data payment.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Dibuat Oleh
                    </span>

                    <p className="mt-1 text-[10px] font-black text-custom-gelap dark:text-white">
                      {payment.created_by || "-"}
                    </p>

                    <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                      {formatDateTime(payment.created_at)}
                    </p>
                  </div>

                  <div>
                    <span className="text-[8px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Diperbarui Oleh
                    </span>

                    <p className="mt-1 text-[10px] font-black text-custom-gelap dark:text-white">
                      {payment.updated_by || "-"}
                    </p>

                    <p className="mt-0.5 text-[9px] font-semibold text-gray-400">
                      {formatDateTime(payment.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Data payment tidak ditemukan.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        {payment && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-50 px-4 text-[9px] font-black uppercase tracking-wide text-red-600 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500/10 dark:text-red-400"
            >
              <MdDelete size={15} />
              Hapus Payment
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-gray-200 px-5 text-[10px] font-black uppercase tracking-wide text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalDetailPayment;
