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

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100 break-words">
      {value || "-"}
    </p>
  </div>
);

const SectionTitle = ({ icon: Icon, title, count }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Icon className="text-custom-merah-terang" size={20} />
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
        {title}
      </h3>
    </div>
    {count !== undefined && (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        {count}
      </span>
    )}
  </div>
);

const ModalDetailWorkItem = ({ idWorkItem, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

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

  const workItem = detail?.work_item;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-5xl max-h-[93vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
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
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <MdClose size={22} />
          </button>
        </div>

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
              <section>
                <SectionTitle icon={MdWork} title="Informasi Pekerjaan" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
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
                  </div>

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
                          width: `${Math.min(Number(workItem.progress_percent || 0), 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

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
                    <InfoItem label="Email" value={workItem.client_pic_email} />
                  </div>
                </div>
              </section>

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
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_BADGES[history.stage] || "bg-gray-100 text-gray-700"}`}
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
                              value={formatCurrency(proposal.total_amount)}
                            />
                          </div>
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
                              value={formatCurrency(contract.total_amount)}
                            />
                          </div>
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
                              value={formatCurrency(invoice.total_amount)}
                            />
                          </div>
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
                            <InfoItem label="Bank" value={payment.bank_name} />
                          </div>
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

              {detail.completion && (
                <section>
                  <SectionTitle icon={MdWork} title="Completion" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                      <InfoItem
                        label="Tanggal Selesai"
                        value={formatDate(detail.completion.completion_date)}
                      />
                      <InfoItem
                        label="Progress"
                        value={`${Number(detail.completion.progress_percent || 0)}%`}
                      />
                      <InfoItem
                        label="Catatan"
                        value={detail.completion.notes}
                      />
                    </div>
                  </div>
                </section>
              )}

              <section>
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoItem
                      label="Dibuat Oleh"
                      value={`${workItem.created_by || "-"} • ${formatDateTime(workItem.created_at)}`}
                    />
                    <InfoItem
                      label="Diperbarui Oleh"
                      value={
                        workItem.updated_by
                          ? `${workItem.updated_by} • ${formatDateTime(workItem.updated_at)}`
                          : "-"
                      }
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <button
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

export default ModalDetailWorkItem;
