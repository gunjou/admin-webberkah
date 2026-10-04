import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDescription,
  MdWork,
  MdBusiness,
  MdPerson,
  MdReceipt,
  MdInfo,
  MdAssignment,
  MdOpenInNew,
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

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
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

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>

    <div className="mt-1 break-words text-sm font-medium text-gray-800 dark:text-gray-100">
      {value || "-"}
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="mb-4 flex items-center gap-2">
    <Icon className="text-custom-merah-terang" size={20} />

    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="max-h-[93vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <MdDescription className="text-custom-merah-terang" size={22} />

              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Detail Invoice
              </h2>
            </div>

            {invoice && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {invoice.invoice_number || "-"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-130px)] overflow-y-auto p-6">
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
              {/* Informasi Invoice */}
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

                    <InfoItem
                      label="Nilai Invoice"
                      value={formatCurrency(invoice.invoice_value)}
                    />

                    <InfoItem
                      label="PPN"
                      value={formatVatRate(invoice.vat_rate)}
                    />

                    <InfoItem
                      label="Tahap Saat Ini"
                      value={
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            STAGE_BADGES[invoice.current_stage] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {STAGE_LABELS[invoice.current_stage] ||
                            invoice.current_stage ||
                            "-"}
                        </span>
                      }
                    />
                  </div>

                  {/* Invoice Summary */}
                  <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Nilai Invoice
                        </p>

                        <p className="mt-1 text-base font-semibold text-custom-merah-terang">
                          {formatCurrency(invoice.invoice_value)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          PPN
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {formatVatRate(invoice.vat_rate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Jatuh Tempo
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {formatDate(invoice.due_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document */}
                  <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Dokumen Invoice
                    </p>

                    <div className="mt-2">
                      {invoice.document_url ? (
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              invoice.document_url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-custom-merah-terang px-3 py-2 text-xs font-medium text-white transition hover:bg-custom-merah"
                        >
                          <MdDescription size={16} />
                          Lihat Dokumen
                          <MdOpenInNew size={14} />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Dokumen tidak tersedia.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Catatan
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                        {invoice.notes}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Informasi Pekerjaan */}
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
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            STAGE_BADGES[invoice.current_stage] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
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
                      label="Progress"
                      value={formatProgress(invoice.progress_percent)}
                    />

                    <InfoItem
                      label="Tanggal Mulai"
                      value={formatDate(invoice.start_date)}
                    />

                    <InfoItem
                      label="Target Selesai"
                      value={formatDate(invoice.target_end_date)}
                    />
                  </div>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Progress Pekerjaan
                      </span>

                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
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
                </div>
              </section>

              {/* Client */}
              <section>
                <SectionTitle icon={MdBusiness} title="Client" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <InfoItem label="Kode Client" value={invoice.client_code} />

                    <InfoItem label="Nama Client" value={invoice.client_name} />
                  </div>
                </div>
              </section>

              {/* PIC Client */}
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

              {/* Berita Acara */}
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
                </div>
              </section>

              {/* Informasi Sistem */}
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

              {/* Ringkasan Invoice */}
              <section>
                <SectionTitle icon={MdReceipt} title="Ringkasan Invoice" />

                <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
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
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailInvoice;
