import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDescription,
  MdWork,
  MdBusiness,
  MdPerson,
  MdInfo,
  MdAssignment,
  MdOpenInNew,
  MdPayment,
  MdAccountBalance,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

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

const STAGE_BADGES = {
  IDENTIFIED: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  QUOTATION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CONTRACT:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  IN_PROGRESS:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  BA: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  INVOICE:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  PAYMENT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  CLOSED: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

const PAYMENT_STATUS_LABELS = {
  BELUM_DIBAYAR: "Belum Dibayar",
  SEBAGIAN_DIBAYAR: "Sebagian Dibayar",
  LUNAS: "Lunas",
};

const PAYMENT_STATUS_BADGES = {
  BELUM_DIBAYAR:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
  SEBAGIAN_DIBAYAR:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400",
  LUNAS:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400",
};

const HEALTH_STATUS_LABELS = {
  PAID: "Paid",
  ON_TRACK: "On Track",
  DUE_SOON: "Due Soon",
  OVERDUE: "Overdue",
};

const HEALTH_STATUS_BADGES = {
  PAID: "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400",
  ON_TRACK:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
  DUE_SOON:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400",
  OVERDUE:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
};

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

const formatProgress = (value) => {
  const progress = Number(value || 0);

  return `${progress.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })}%`;
};

const getHealthDaysLabel = (status, days) => {
  const value = Math.abs(Number(days || 0));

  if (status === "PAID") {
    return "Pembayaran telah lunas";
  }

  if (status === "OVERDUE") {
    return `Terlambat ${value} hari`;
  }

  if (status === "DUE_SOON") {
    return `${value} hari menuju jatuh tempo`;
  }

  return `${value} hari menuju jatuh tempo`;
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
      {label}
    </p>

    <div className="mt-1 break-words text-sm font-semibold text-gray-800 dark:text-gray-100">
      {value || "-"}
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="mb-4 flex items-center gap-2">
    <Icon className="text-custom-merah-terang" size={20} />

    <h3 className="text-sm font-black uppercase tracking-wide text-gray-800 dark:text-gray-100">
      {title}
    </h3>
  </div>
);

const ModalDetailInvoice = ({ show, onClose, invoiceId }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      setInvoice(null);

      const response = await Api.get(`/work-item/invoice/${invoiceId}`);

      if (response.data?.success) {
        setInvoice(response.data?.data || null);
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal mengambil detail invoice.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil detail invoice:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mengambil detail invoice.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && invoiceId) {
      fetchInvoiceDetail();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, invoiceId]);

  if (!show) return null;

  const progress = Math.min(
    Math.max(Number(invoice?.progress_percent || 0), 0),
    100,
  );

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="flex h-[92vh] min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MdDescription
                className="shrink-0 text-custom-merah-terang"
                size={22}
              />

              <h2 className="text-lg font-black text-gray-800 dark:text-gray-100">
                Detail Invoice
              </h2>
            </div>

            {invoice && (
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {invoice.invoice_number || "-"}
                </p>

                {invoice.contract_number && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>

                    <p className="text-xs font-semibold text-gray-400">
                      {invoice.contract_number}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-custom-merah-terang" />
            </div>
          ) : !invoice ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Data invoice tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-6">
              {/* ================= INVOICE ================= */}
              <section>
                <SectionTitle icon={MdDescription} title="Informasi Invoice" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                      label="Nomor Invoice"
                      value={invoice.invoice_number}
                    />

                    <InfoItem
                      label="Tanggal Invoice"
                      value={formatDate(invoice.invoice_date)}
                    />

                    <InfoItem
                      label="Jatuh Tempo"
                      value={formatDate(invoice.due_date)}
                    />
                  </div>

                  {/* Invoice Value */}
                  <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                          Nilai Invoice
                        </p>

                        <p className="mt-1 text-lg font-black text-custom-merah-terang">
                          {formatCurrency(invoice.invoice_value)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                          PPN
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-700 dark:text-gray-200">
                          {formatVatRate(invoice.vat_rate)}
                        </p>

                        <p className="mt-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {formatCurrency(invoice.vat_amount)}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                          Total Invoice
                        </p>

                        <p className="mt-1 text-lg font-black text-gray-800 dark:text-white">
                          {formatCurrency(invoice.total_invoice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-white/5">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Dibayar
                      </p>

                      <p className="mt-1 text-sm font-black text-green-600 dark:text-green-400">
                        {formatCurrency(invoice.paid_amount)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-white/5">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Sisa Tagihan
                      </p>

                      <p className="mt-1 text-sm font-black text-red-500">
                        {formatCurrency(invoice.outstanding_amount)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-white/5">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Status Pembayaran
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                          PAYMENT_STATUS_BADGES[invoice.payment_status] ||
                          "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[invoice.payment_status] ||
                          invoice.payment_status ||
                          "-"}
                      </span>
                    </div>
                  </div>

                  {/* Health */}
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 ${
                      HEALTH_STATUS_BADGES[invoice.health_status] ||
                      "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[1.5px] opacity-70">
                          Health Invoice
                        </p>

                        <p className="mt-0.5 text-base font-black tracking-tight">
                          {HEALTH_STATUS_LABELS[invoice.health_status] ||
                            invoice.health_status ||
                            "-"}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm font-black">
                          {getHealthDaysLabel(
                            invoice.health_status,
                            invoice.days_to_due,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document */}
                  <div className="mt-4">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Dokumen Invoice
                    </p>

                    {invoice.invoice_document_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            invoice.invoice_document_url,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-custom-merah-terang px-3 py-2 text-xs font-bold text-white transition hover:bg-custom-merah"
                      >
                        <MdDescription size={16} />
                        Lihat Dokumen
                        <MdOpenInNew size={14} />
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-gray-400">
                        Dokumen invoice tidak tersedia.
                      </span>
                    )}
                  </div>

                  {invoice.invoice_notes && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Catatan Invoice
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                        {invoice.invoice_notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ================= WORK ================= */}
              <section>
                <SectionTitle icon={MdWork} title="Informasi Pekerjaan" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                      label="Nomor Pekerjaan"
                      value={invoice.work_number}
                    />

                    <InfoItem
                      label="Jenis Pekerjaan"
                      value={
                        WORK_TYPE_LABELS[invoice.work_type] || invoice.work_type
                      }
                    />

                    <InfoItem
                      label="Tahap Saat Ini"
                      value={
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            STAGE_BADGES[invoice.current_stage] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STAGE_LABELS[invoice.current_stage] ||
                            invoice.current_stage ||
                            "-"}
                        </span>
                      }
                    />

                    <div className="md:col-span-2 lg:col-span-3">
                      <InfoItem
                        label="Nama Pekerjaan"
                        value={invoice.work_name}
                      />
                    </div>

                    <InfoItem
                      label="Tanggal Mulai"
                      value={formatDate(invoice.start_date)}
                    />

                    <InfoItem
                      label="Target Selesai"
                      value={formatDate(invoice.target_end_date)}
                    />

                    <InfoItem
                      label="Tanggal Penyelesaian"
                      value={formatDate(invoice.completion_date)}
                    />
                  </div>

                  {/* Progress */}
                  <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Progress Pekerjaan
                      </span>

                      <span className="text-sm font-black text-custom-merah-terang">
                        {formatProgress(invoice.progress_percent)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-custom-merah-terang transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  {invoice.work_notes && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Catatan Pekerjaan
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                        {invoice.work_notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ================= CLIENT ================= */}
              <section>
                <SectionTitle icon={MdBusiness} title="Informasi Client" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Kode Client" value={invoice.client_code} />

                    <InfoItem label="Nama Client" value={invoice.client_name} />

                    <InfoItem
                      label="No. Telepon"
                      value={invoice.client_phone}
                    />

                    <InfoItem label="Email" value={invoice.client_email} />

                    <div className="md:col-span-2">
                      <InfoItem label="Alamat" value={invoice.client_address} />
                    </div>
                  </div>
                </div>
              </section>

              {/* ================= PIC ================= */}
              <section>
                <SectionTitle icon={MdPerson} title="PIC Client" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                      label="Nama PIC"
                      value={invoice.client_pic_name}
                    />

                    <InfoItem
                      label="Jabatan"
                      value={invoice.client_pic_position}
                    />

                    <InfoItem
                      label="No. Telepon"
                      value={invoice.client_pic_phone}
                    />

                    <InfoItem label="Email" value={invoice.client_pic_email} />

                    <InfoItem
                      label="PIC Internal"
                      value={invoice.internal_pic_name}
                    />
                  </div>
                </div>
              </section>

              {/* ================= CONTRACT ================= */}
              <section>
                <SectionTitle
                  icon={MdAccountBalance}
                  title="Informasi Contract"
                />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                      label="Nomor Contract"
                      value={invoice.contract_number}
                    />

                    <InfoItem
                      label="Tanggal Contract"
                      value={formatDate(invoice.contract_date)}
                    />

                    <InfoItem
                      label="Nilai Contract"
                      value={formatCurrency(invoice.contract_value)}
                    />

                    <InfoItem
                      label="Mulai Contract"
                      value={formatDate(invoice.contract_start_date)}
                    />

                    <InfoItem
                      label="Selesai Contract"
                      value={formatDate(invoice.contract_end_date)}
                    />

                    <InfoItem
                      label="PPN Contract"
                      value={formatVatRate(invoice.contract_vat_rate)}
                    />
                  </div>
                </div>
              </section>

              {/* ================= BA ================= */}
              <section>
                <SectionTitle
                  icon={MdAssignment}
                  title="Informasi Berita Acara"
                />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Nomor BA" value={invoice.ba_number} />

                    <InfoItem
                      label="Tanggal BA"
                      value={formatDate(invoice.ba_date)}
                    />

                    <InfoItem
                      label="Tanggal Penyelesaian"
                      value={formatDate(invoice.completion_date)}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                      Dokumen BA
                    </p>

                    {invoice.ba_document_url ? (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            invoice.ba_document_url,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        <MdDescription size={16} />
                        Lihat Dokumen BA
                        <MdOpenInNew size={14} />
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-gray-400">
                        Dokumen BA tidak tersedia.
                      </span>
                    )}
                  </div>

                  {invoice.ba_notes && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Catatan BA
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                        {invoice.ba_notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ================= PAYMENTS ================= */}
              <section>
                <SectionTitle icon={MdPayment} title="Informasi Pembayaran" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-500/10">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-green-600 dark:text-green-400">
                        Total Dibayar
                      </p>

                      <p className="mt-1 text-lg font-black text-green-700 dark:text-green-300">
                        {formatCurrency(invoice.paid_amount)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-500/10">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-red-500">
                        Sisa Tagihan
                      </p>

                      <p className="mt-1 text-lg font-black text-red-600 dark:text-red-400">
                        {formatCurrency(invoice.outstanding_amount)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Status Pembayaran
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                          PAYMENT_STATUS_BADGES[invoice.payment_status] ||
                          "border-gray-200 bg-white text-gray-600"
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[invoice.payment_status] ||
                          invoice.payment_status ||
                          "-"}
                      </span>
                    </div>
                  </div>

                  {invoice.payments?.length > 0 ? (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-gray-400">
                              Tanggal
                            </th>

                            <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-gray-400">
                              Nilai
                            </th>

                            <th className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider text-gray-400">
                              Catatan
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {invoice.payments.map((payment, index) => (
                            <tr
                              key={payment.id_payment || index}
                              className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                            >
                              <td className="px-3 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                {formatDate(payment.payment_date)}
                              </td>

                              <td className="px-3 py-3 text-xs font-black text-gray-800 dark:text-white">
                                {formatCurrency(payment.amount)}
                              </td>

                              <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                {payment.notes || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-400">
                        Belum ada pembayaran.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ================= SYSTEM ================= */}
              <section>
                <SectionTitle icon={MdInfo} title="Informasi Sistem" />

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoItem
                      label="Dibuat Oleh"
                      value={`${invoice.created_by || "-"} • ${formatDateTime(
                        invoice.created_at,
                      )}`}
                    />

                    <InfoItem
                      label="Diperbarui Oleh"
                      value={
                        invoice.updated_by
                          ? `${invoice.updated_by} • ${formatDateTime(
                              invoice.updated_at,
                            )}`
                          : "-"
                      }
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailInvoice;
