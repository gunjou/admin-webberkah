import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdWork,
  MdBusiness,
  MdTimeline,
  MdDescription,
  MdReceipt,
  MdPayments,
  MdHistory,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";
import DocumentPreviewModal from "../DocumentPreviewModal";
import {
  HEALTH_STATUS_BADGES,
  HEALTH_STATUS_LABELS,
} from "../../../utils/WorkBadge";

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
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  IN_PROGRESS:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  COMPLETED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  BA: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  INVOICE:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  PAYMENT:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
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
  if (value === null || value === undefined || value === "") return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const getHealthDaysLabel = (healthStatus, daysToEnd) => {
  if (healthStatus === "COMPLETED") {
    return "Pekerjaan selesai";
  }

  if (daysToEnd === null || daysToEnd === undefined) {
    return "-";
  }

  const days = Math.abs(Number(daysToEnd));

  if (healthStatus === "EXPIRED") {
    return `${days} Hari Terlambat`;
  }

  if (healthStatus === "DUE_SOON") {
    return `${days} Hari Menuju Target`;
  }

  if (healthStatus === "ON_TRACK") {
    return `${days} Hari Tersisa`;
  }

  return "-";
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-medium text-gray-800 dark:text-gray-100">
      {value || "-"}
    </p>
  </div>
);

const SectionTitle = ({ icon: Icon, title, count }) => (
  <div className="mb-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon className="text-custom-merah-terang" size={20} />

      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
    </div>

    {count !== undefined && (
      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        {count}
      </span>
    )}
  </div>
);

const DocumentButton = ({ url, label = "Preview Dokumen", onClick }) => {
  if (!url) {
    return (
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
        Belum ada dokumen
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-custom-merah-terang/10 px-3 py-1.5 text-xs font-semibold text-custom-merah-terang transition hover:bg-custom-merah-terang/15 dark:bg-custom-merah-terang/20 dark:text-custom-cerah dark:hover:bg-custom-merah-terang/30"
    >
      <MdDescription size={15} />
      {label}
    </button>
  );
};

const ModalDetailWorkItem = ({ idWorkItem, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState("");

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const response = await Api.get(`/work-item/work/${idWorkItem}`);

      if (response.data?.success) {
        setDetail(response.data.data);
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil detail pekerjaan.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil detail pekerjaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idWorkItem) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idWorkItem]);

  const handleDocumentPreview = (url, title = "Preview Dokumen") => {
    if (!url) {
      SwalHelper.warning("Dokumen belum tersedia.");
      return;
    }

    setSelectedDocumentUrl(url);
    setSelectedDocumentTitle(title);
    setShowDocumentPreview(true);
  };

  const handleCloseDocumentPreview = () => {
    setShowDocumentPreview(false);
    setSelectedDocumentUrl("");
    setSelectedDocumentTitle("");
  };

  const workItem = detail?.work_item;

  return (
    <>
      <div
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div className="w-full max-w-5xl max-h-[93vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2">
                <MdWork className="text-custom-merah-terang" size={22} />

                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Detail Pekerjaan
                </h2>
              </div>

              {workItem && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {workItem.work_number}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <MdClose size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-130px)] overflow-y-auto p-6">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-custom-merah-terang"></div>
              </div>
            ) : !workItem ? (
              <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Data pekerjaan tidak ditemukan.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Informasi Pekerjaan */}
                <section>
                  <SectionTitle icon={MdWork} title="Informasi Pekerjaan" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    {/* Work Information */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <InfoItem
                        label="Nomor Pekerjaan"
                        value={workItem.work_number}
                      />

                      <InfoItem
                        label="Jenis Pekerjaan"
                        value={workItem.work_type}
                      />

                      <InfoItem
                        label="Tahap Saat Ini"
                        value={
                          STAGE_LABELS[workItem.current_stage] ||
                          workItem.current_stage
                        }
                      />

                      <div className="md:col-span-2 lg:col-span-3">
                        <InfoItem
                          label="Nama Pekerjaan"
                          value={workItem.work_name}
                        />
                      </div>

                      <InfoItem
                        label="Progress"
                        value={`${Number(workItem.progress_percent || 0)}%`}
                      />

                      <InfoItem
                        label="Tanggal Mulai"
                        value={formatDate(workItem.start_date)}
                      />

                      <InfoItem
                        label="Target Selesai"
                        value={formatDate(workItem.target_end_date)}
                      />

                      <InfoItem
                        label="Tanggal Selesai"
                        value={formatDate(workItem.completion_date)}
                      />

                      <InfoItem
                        label="PIC Internal"
                        value={workItem.internal_pic_name}
                      />

                      {/* Document */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Dokumen
                        </p>

                        <div className="mt-1">
                          <DocumentButton
                            url={workItem.document_url}
                            onClick={() =>
                              handleDocumentPreview(
                                workItem.document_url,
                                `Dokumen ${workItem.work_number}`,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Health */}
                    <div
                      className={`mt-5 rounded-xl border px-4 py-3 ${
                        HEALTH_STATUS_BADGES[workItem.health_status] ||
                        "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
                      }`}
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[1.5px] opacity-70">
                            Health Pekerjaan
                          </p>

                          <p className="mt-0.5 text-base font-black tracking-tight">
                            {HEALTH_STATUS_LABELS[workItem.health_status] ||
                              workItem.health_status ||
                              "-"}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm font-black">
                            {getHealthDaysLabel(
                              workItem.health_status,
                              workItem.days_to_end,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Progress Pekerjaan
                        </span>

                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {Number(workItem.progress_percent || 0)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-custom-merah-terang transition-all"
                          style={{
                            width: `${Math.min(
                              Number(workItem.progress_percent || 0),
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Notes */}
                    {workItem.notes && (
                      <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Catatan
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                          {workItem.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Client & PIC */}
                <section>
                  <SectionTitle icon={MdBusiness} title="Client & PIC Client" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <InfoItem
                        label="Kode Client"
                        value={workItem.client_code}
                      />

                      <InfoItem
                        label="Nama Client"
                        value={workItem.client_name}
                      />

                      <InfoItem
                        label="PIC Client"
                        value={workItem.client_pic_name}
                      />

                      <InfoItem
                        label="Jabatan"
                        value={workItem.client_pic_position}
                      />

                      <InfoItem
                        label="Telepon"
                        value={workItem.client_pic_phone}
                      />

                      <InfoItem
                        label="Email"
                        value={workItem.client_pic_email}
                      />
                    </div>
                  </div>
                </section>

                {/* Timeline Tahapan */}
                <section>
                  <SectionTitle
                    icon={MdTimeline}
                    title="Timeline Tahapan"
                    count={detail.stage_histories?.length || 0}
                  />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    {detail.stage_histories?.length ? (
                      <div className="space-y-4">
                        {detail.stage_histories.map((history, index) => (
                          <div
                            key={history.id_stage_history}
                            className="relative flex gap-4"
                          >
                            {index < detail.stage_histories.length - 1 && (
                              <div className="absolute left-[9px] top-6 h-full w-px bg-gray-200 dark:bg-gray-700"></div>
                            )}

                            <div className="relative z-10 mt-1 h-5 w-5 shrink-0 rounded-full border-4 border-white bg-custom-merah-terang dark:border-custom-gelap"></div>

                            <div className="min-w-0 flex-1 pb-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    STAGE_BADGES[history.stage] ||
                                    "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {STAGE_LABELS[history.stage] || history.stage}
                                </span>

                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDateTime(history.started_at)}
                                </span>
                              </div>

                              {history.ended_at && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  Selesai: {formatDateTime(history.ended_at)}
                                </p>
                              )}

                              {history.notes && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                  {history.notes}
                                </p>
                              )}

                              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                Oleh: {history.created_by || "-"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada riwayat tahapan.
                      </p>
                    )}
                  </div>
                </section>

                {/* Riwayat Progress */}
                <section>
                  <SectionTitle
                    icon={MdHistory}
                    title="Riwayat Progress"
                    count={detail.progress_histories?.length || 0}
                  />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    {detail.progress_histories?.length ? (
                      <div className="space-y-3">
                        {detail.progress_histories.map((history) => (
                          <div
                            key={history.id_progress_history}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {Number(history.progress_percent || 0)}%
                              </p>

                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(history.progress_date)}
                              </p>
                            </div>

                            <p className="max-w-[60%] text-right text-xs text-gray-500 dark:text-gray-400">
                              {history.notes || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada riwayat progress.
                      </p>
                    )}
                  </div>
                </section>

                {/* Proposal */}
                <section>
                  <SectionTitle
                    icon={MdDescription}
                    title="Proposal"
                    count={detail.proposals?.length || 0}
                  />

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                    {detail.proposals?.length ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {detail.proposals.map((proposal) => (
                          <div key={proposal.id_proposal} className="p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <InfoItem
                                label="Nomor Proposal"
                                value={proposal.proposal_number}
                              />

                              <InfoItem
                                label="Tanggal"
                                value={formatDate(proposal.proposal_date)}
                              />

                              <InfoItem
                                label="Nilai"
                                value={formatCurrency(proposal.proposal_value)}
                              />

                              <InfoItem
                                label="Berlaku Sampai"
                                value={formatDate(proposal.valid_until)}
                              />

                              <InfoItem
                                label="Status"
                                value={proposal.status}
                              />

                              <InfoItem
                                label="Catatan"
                                value={proposal.notes}
                              />
                            </div>

                            {proposal.document_url && (
                              <div className="mt-4">
                                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Dokumen Proposal
                                </p>

                                <DocumentButton
                                  url={proposal.document_url}
                                  onClick={() =>
                                    handleDocumentPreview(
                                      proposal.document_url,
                                      `Proposal ${proposal.proposal_number}`,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada proposal.
                      </p>
                    )}
                  </div>
                </section>

                {/* Contract */}
                <section>
                  <SectionTitle
                    icon={MdDescription}
                    title="Contract"
                    count={detail.contracts?.length || 0}
                  />

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                    {detail.contracts?.length ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {detail.contracts.map((contract) => (
                          <div key={contract.id_contract} className="p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <InfoItem
                                label="Nomor Contract"
                                value={contract.contract_number}
                              />

                              <InfoItem
                                label="Tanggal"
                                value={formatDate(contract.contract_date)}
                              />

                              <InfoItem
                                label="Nilai"
                                value={formatCurrency(contract.contract_value)}
                              />

                              <InfoItem
                                label="Mulai"
                                value={formatDate(contract.start_date)}
                              />

                              <InfoItem
                                label="Selesai"
                                value={formatDate(contract.end_date)}
                              />

                              <InfoItem
                                label="PPN"
                                value={`${contract.vat_rate || 0}%`}
                              />

                              <InfoItem
                                label="Status"
                                value={contract.status}
                              />

                              <InfoItem
                                label="Catatan"
                                value={contract.notes}
                              />
                            </div>

                            {contract.document_url && (
                              <div className="mt-4">
                                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Dokumen Contract
                                </p>

                                <DocumentButton
                                  url={contract.document_url}
                                  onClick={() =>
                                    handleDocumentPreview(
                                      contract.document_url,
                                      `Contract ${contract.contract_number}`,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada contract.
                      </p>
                    )}
                  </div>
                </section>

                {/* Invoice */}
                <section>
                  <SectionTitle
                    icon={MdReceipt}
                    title="Invoice"
                    count={detail.invoices?.length || 0}
                  />

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                    {detail.invoices?.length ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {detail.invoices.map((invoice) => (
                          <div key={invoice.id_invoice} className="p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <InfoItem
                                label="Nomor Invoice"
                                value={invoice.invoice_number}
                              />

                              <InfoItem
                                label="Tanggal Invoice"
                                value={formatDate(invoice.invoice_date)}
                              />

                              <InfoItem
                                label="Nilai Invoice"
                                value={formatCurrency(invoice.invoice_value)}
                              />

                              <InfoItem
                                label="PPN"
                                value={`${invoice.vat_rate || 0}%`}
                              />

                              <InfoItem
                                label="Jatuh Tempo"
                                value={formatDate(invoice.due_date)}
                              />

                              <InfoItem label="Catatan" value={invoice.notes} />
                            </div>

                            {invoice.document_url && (
                              <div className="mt-4">
                                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Dokumen Invoice
                                </p>

                                <DocumentButton
                                  url={invoice.document_url}
                                  onClick={() =>
                                    handleDocumentPreview(
                                      invoice.document_url,
                                      `Invoice ${invoice.invoice_number}`,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada invoice.
                      </p>
                    )}
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <SectionTitle
                    icon={MdPayments}
                    title="Payment"
                    count={detail.payments?.length || 0}
                  />

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                    {detail.payments?.length ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {detail.payments.map((payment) => (
                          <div key={payment.id_payment} className="p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <InfoItem
                                label="Tanggal Pembayaran"
                                value={formatDate(payment.payment_date)}
                              />

                              <InfoItem
                                label="Nilai Pembayaran"
                                value={formatCurrency(payment.amount)}
                              />

                              <InfoItem
                                label="Bank"
                                value={payment.bank_name}
                              />

                              <InfoItem label="Catatan" value={payment.notes} />
                            </div>

                            {payment.document_url && (
                              <div className="mt-4">
                                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Bukti Pembayaran
                                </p>

                                <DocumentButton
                                  url={payment.document_url}
                                  onClick={() =>
                                    handleDocumentPreview(
                                      payment.document_url,
                                      `Bukti Pembayaran ${formatDate(
                                        payment.payment_date,
                                      )}`,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Belum ada payment.
                      </p>
                    )}
                  </div>
                </section>

                {/* Completion / BA */}
                {detail.completion && (
                  <section>
                    <SectionTitle icon={MdWork} title="Completion / BA" />

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <InfoItem
                          label="Nomor BA"
                          value={detail.completion.ba_number}
                        />

                        <InfoItem
                          label="Tanggal BA"
                          value={formatDate(detail.completion.ba_date)}
                        />

                        <InfoItem
                          label="Tanggal Selesai"
                          value={formatDate(detail.completion.completion_date)}
                        />

                        <InfoItem
                          label="Catatan"
                          value={detail.completion.notes}
                        />

                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Dokumen BA
                          </p>

                          <div className="mt-1">
                            <DocumentButton
                              url={detail.completion.document_url}
                              onClick={() =>
                                handleDocumentPreview(
                                  detail.completion.document_url,
                                  `Dokumen BA ${detail.completion.ba_number}`,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Audit Information */}
                <section>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <InfoItem
                        label="Dibuat Oleh"
                        value={`${workItem.created_by || "-"} • ${formatDateTime(
                          workItem.created_at,
                        )}`}
                      />

                      <InfoItem
                        label="Diperbarui Oleh"
                        value={
                          workItem.updated_by
                            ? `${workItem.updated_by} • ${formatDateTime(
                                workItem.updated_at,
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

      {/* Document Preview Modal */}
      {showDocumentPreview && selectedDocumentUrl && (
        <DocumentPreviewModal
          show={showDocumentPreview}
          url={selectedDocumentUrl}
          title={selectedDocumentTitle}
          onClose={handleCloseDocumentPreview}
        />
      )}
    </>
  );
};

export default ModalDetailWorkItem;
