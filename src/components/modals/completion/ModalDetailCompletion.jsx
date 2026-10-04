import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDescription,
  MdWork,
  MdBusiness,
  MdPerson,
  MdInfo,
  MdOpenInNew,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const WORK_TYPE_LABELS = {
  TENDER: "Tender",
  MAINTENANCE: "Maintenance",
};

const WORK_TYPE_BADGES = {
  TENDER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  MAINTENANCE:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
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

const formatProgress = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0%";
  }

  return `${Number(value).toLocaleString("id-ID", {
    minimumFractionDigits: 0,
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

const ModalDetailCompletion = ({ show, onClose, completionId }) => {
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCompletionDetail = async () => {
    try {
      setLoading(true);
      setCompletion(null);

      const response = await Api.get(`/work-item/completion/${completionId}`);

      if (response.data?.success) {
        setCompletion(response.data?.data || null);
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal mengambil detail BA.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil detail BA:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mengambil detail BA.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && completionId) {
      fetchCompletionDetail();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, completionId]);

  if (!show) return null;

  const progress = Math.min(
    Math.max(Number(completion?.progress_percent || 0), 0),
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
                Detail Berita Acara
              </h2>
            </div>

            {completion && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {completion.ba_number || "-"}
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
          ) : !completion ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Data BA tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informasi BA */}
              <section>
                <SectionTitle
                  icon={MdDescription}
                  title="Informasi Berita Acara"
                />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Nomor BA" value={completion.ba_number} />

                    <InfoItem
                      label="Tanggal BA"
                      value={formatDate(completion.ba_date)}
                    />

                    <InfoItem
                      label="Tanggal Penyelesaian"
                      value={formatDate(completion.completion_date)}
                    />

                    <InfoItem
                      label="Dokumen BA"
                      value={
                        completion.document_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                completion.document_url,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-custom-merah-terang px-3 py-1.5 text-xs font-medium text-white transition hover:bg-custom-merah"
                          >
                            <MdDescription size={15} />
                            Lihat Dokumen
                            <MdOpenInNew size={14} />
                          </button>
                        ) : (
                          "-"
                        )
                      }
                    />

                    <InfoItem
                      label="Nomor Pekerjaan"
                      value={completion.work_number}
                    />

                    <InfoItem
                      label="Jenis Pekerjaan"
                      value={
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            WORK_TYPE_BADGES[completion.work_type] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {WORK_TYPE_LABELS[completion.work_type] ||
                            completion.work_type ||
                            "-"}
                        </span>
                      }
                    />
                  </div>

                  {/* Notes */}
                  {completion.notes && (
                    <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Catatan
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                        {completion.notes}
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
                      value={completion.work_number}
                    />

                    <InfoItem
                      label="Jenis Pekerjaan"
                      value={
                        WORK_TYPE_LABELS[completion.work_type] ||
                        completion.work_type
                      }
                    />

                    <InfoItem
                      label="Tahap Saat Ini"
                      value={
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            STAGE_BADGES[completion.current_stage] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {STAGE_LABELS[completion.current_stage] ||
                            completion.current_stage ||
                            "-"}
                        </span>
                      }
                    />

                    <div className="md:col-span-2 lg:col-span-3">
                      <InfoItem
                        label="Nama Pekerjaan"
                        value={completion.work_name}
                      />
                    </div>

                    <InfoItem
                      label="Progress"
                      value={formatProgress(completion.progress_percent)}
                    />
                  </div>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Progress Pekerjaan
                      </span>

                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {formatProgress(completion.progress_percent)}
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
                    <InfoItem
                      label="Kode Client"
                      value={completion.client_code}
                    />

                    <InfoItem
                      label="Nama Client"
                      value={completion.client_name}
                    />
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
                      value={completion.client_pic_name}
                    />

                    <InfoItem
                      label="Jabatan"
                      value={completion.client_pic_position}
                    />

                    <InfoItem
                      label="No. Telepon"
                      value={completion.client_pic_phone}
                    />

                    <InfoItem
                      label="Email"
                      value={completion.client_pic_email}
                    />

                    <InfoItem
                      label="PIC Internal"
                      value={completion.internal_pic_name}
                    />
                  </div>
                </div>
              </section>

              {/* Catatan */}
              {completion.notes && (
                <section>
                  <SectionTitle icon={MdDescription} title="Catatan" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                      {completion.notes}
                    </p>
                  </div>
                </section>
              )}

              {/* Informasi Sistem */}
              <section>
                <SectionTitle icon={MdInfo} title="Informasi Sistem" />

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoItem
                      label="Dibuat Oleh"
                      value={`${completion.created_by || "-"} • ${formatDateTime(
                        completion.created_at,
                      )}`}
                    />

                    <InfoItem
                      label="Diperbarui Oleh"
                      value={
                        completion.updated_by
                          ? `${completion.updated_by} • ${formatDateTime(
                              completion.updated_at,
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
  );
};

export default ModalDetailCompletion;
