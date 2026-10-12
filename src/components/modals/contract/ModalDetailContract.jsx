import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDescription,
  MdWork,
  MdBusiness,
  MdInfo,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";
import DocumentPreviewModal from "../DocumentPreviewModal";
import {
  HEALTH_STATUS_BADGES,
  HEALTH_STATUS_LABELS,
} from "../../../utils/WorkBadge";

// ==================================================
// CONSTANTS
// ==================================================

const STATUS_BADGES = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_LABELS = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const WORK_TYPE_LABELS = {
  TENDER: "Tender",
  MAINTENANCE: "Maintenance",
};

// ==================================================
// FORMATTERS
// ==================================================

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
  }).format(Number(value));
};

const formatVatRate = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${Number(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })}%`;
};

// ==================================================
// HEALTH HELPERS
// ==================================================

const getHealthDaysLabel = (healthStatus, daysToEnd) => {
  if (healthStatus === "COMPLETED") {
    return "BA Sudah Diterbitkan";
  }

  if (daysToEnd === null || daysToEnd === undefined) {
    return "-";
  }

  const days = Math.abs(Number(daysToEnd));

  if (healthStatus === "EXPIRED") {
    return `${days} Hari Terlambat`;
  }

  if (healthStatus === "DUE_SOON") {
    return `${days} Hari Menuju Akhir`;
  }

  if (healthStatus === "ON_TRACK") {
    return `${days} Hari Tersisa`;
  }

  return "-";
};

// ==================================================
// REUSABLE COMPONENTS
// ==================================================

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

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="mb-4 flex items-center gap-2">
    <Icon className="text-custom-merah-terang" size={20} />

    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
      {title}
    </h3>
  </div>
);

// ==================================================
// COMPONENT
// ==================================================

const ModalDetailContract = ({ show, onClose, contractId }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState("");

  // ==================================================
  // FETCH DETAIL
  // ==================================================

  const fetchContractDetail = async () => {
    try {
      setLoading(true);
      setContract(null);

      const response = await Api.get(`/work-item/contract/${contractId}`);

      if (response.data?.success) {
        setContract(response.data?.data || null);
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal mengambil detail kontrak.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil detail kontrak:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mengambil detail kontrak.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // EFFECT
  // ==================================================

  useEffect(() => {
    if (show && contractId) {
      fetchContractDetail();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, contractId]);

  // ==================================================
  // DOCUMENT
  // ==================================================

  const handleDocumentPreview = () => {
    if (!contract?.document_url) {
      SwalHelper.warning("Dokumen kontrak belum tersedia.");
      return;
    }

    setSelectedDocumentUrl(contract.document_url);

    setSelectedDocumentTitle(
      `${contract.contract_number || "Kontrak"} - Dokumen Kontrak`,
    );

    setShowDocumentPreview(true);
  };

  const handleCloseDocumentPreview = () => {
    setShowDocumentPreview(false);
    setSelectedDocumentUrl("");
    setSelectedDocumentTitle("");
  };

  // ==================================================
  // RENDER
  // ==================================================

  if (!show) return null;

  return (
    <>
      <div
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div className="max-h-[93vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-custom-merah-terang dark:bg-red-500/10">
                <MdDescription size={22} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-800 dark:text-white">
                  Detail Kontrak
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Informasi lengkap kontrak pekerjaan
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div className="max-h-[calc(93vh-73px)] overflow-y-auto px-6 py-5">
            {/* ==================================================
                LOADING
            ================================================== */}

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-custom-merah-terang" />

                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Memuat detail kontrak...
                  </p>
                </div>
              </div>
            ) : !contract ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <MdInfo
                    size={40}
                    className="mx-auto text-gray-300 dark:text-gray-600"
                  />

                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Data kontrak tidak ditemukan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ==================================================
                    INFORMASI KONTRAK
                ================================================== */}

                {/* ==================================================
    INFORMASI KONTRAK
================================================== */}

                <section>
                  <SectionTitle
                    icon={MdDescription}
                    title="Informasi Kontrak"
                  />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    {/* Contract Information */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      <InfoItem
                        label="Nomor Kontrak"
                        value={contract.contract_number}
                      />

                      <InfoItem
                        label="Tanggal Kontrak"
                        value={formatDate(contract.contract_date)}
                      />

                      <InfoItem
                        label="Tanggal Mulai"
                        value={formatDate(contract.start_date)}
                      />

                      <InfoItem
                        label="Tanggal Selesai"
                        value={formatDate(contract.end_date)}
                      />

                      <InfoItem
                        label="Status"
                        value={
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                              STATUS_BADGES[contract.status] ||
                              "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
                            }`}
                          >
                            {STATUS_LABELS[contract.status] ||
                              contract.status ||
                              "-"}
                          </span>
                        }
                      />

                      <InfoItem
                        label="Health"
                        value={
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                              HEALTH_STATUS_BADGES[contract.health_status] ||
                              "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
                            }`}
                          >
                            {HEALTH_STATUS_LABELS[contract.health_status] ||
                              contract.health_status ||
                              "-"}
                          </span>
                        }
                      />
                    </div>

                    {/* Contract Value */}
                    <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Contract Value */}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                            Nilai Kontrak
                          </p>

                          <p className="mt-1 text-lg font-black text-custom-merah-terang">
                            {formatCurrency(contract.contract_value)}
                          </p>
                        </div>

                        {/* VAT */}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                            PPN
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-700 dark:text-gray-200">
                            {formatVatRate(contract.vat_rate)}
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {formatCurrency(contract.vat_amount)}
                          </p>
                        </div>

                        {/* Total Contract */}
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                            Total Kontrak
                          </p>

                          <p className="mt-1 text-lg font-black text-gray-800 dark:text-white">
                            {formatCurrency(contract.total_contract)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Health */}
                    <div
                      className={`mt-4 rounded-xl border px-4 py-3 ${
                        HEALTH_STATUS_BADGES[contract.health_status] ||
                        "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[1.5px] opacity-70">
                            Health Contract
                          </p>

                          <p className="mt-0.5 text-base font-black tracking-tight">
                            {HEALTH_STATUS_LABELS[contract.health_status] ||
                              contract.health_status ||
                              "-"}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm font-black">
                            {getHealthDaysLabel(
                              contract.health_status,
                              contract.days_to_end,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Document */}
                    <div className="mt-4">
                      <p className="mb-2 text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                        Dokumen Kontrak
                      </p>

                      {contract.document_url ? (
                        <button
                          type="button"
                          onClick={handleDocumentPreview}
                          className="inline-flex items-center gap-2 rounded-lg bg-custom-merah-terang px-3 py-2 text-xs font-bold text-white transition hover:bg-custom-merah"
                        >
                          <MdDescription size={16} />
                          Preview Dokumen
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          Dokumen kontrak tidak tersedia.
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {contract.notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-[9px] font-black uppercase tracking-[1.2px] text-gray-400">
                          Catatan Kontrak
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                          {contract.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ==================================================
                    INFORMASI PEKERJAAN
                ================================================== */}

                <section>
                  <SectionTitle icon={MdWork} title="Informasi Pekerjaan" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {/* Work Number */}
                      <InfoItem
                        label="Nomor Pekerjaan"
                        value={contract.work_number}
                      />

                      {/* Work Name */}
                      <div className="md:col-span-2">
                        <InfoItem
                          label="Nama Pekerjaan"
                          value={contract.work_name}
                        />
                      </div>

                      {/* Work Type */}
                      <InfoItem
                        label="Jenis Pekerjaan"
                        value={
                          WORK_TYPE_LABELS[contract.work_type] ||
                          contract.work_type ||
                          "-"
                        }
                      />

                      {/* Current Stage */}
                      <InfoItem label="Stage" value={contract.current_stage} />

                      {/* Progress */}
                      <InfoItem
                        label="Progress"
                        value={
                          contract.progress_percent !== null &&
                          contract.progress_percent !== undefined
                            ? `${Number(contract.progress_percent)}%`
                            : "-"
                        }
                      />
                    </div>
                  </div>
                </section>

                {/* ==================================================
                    INFORMASI CLIENT
                ================================================== */}

                <section>
                  <SectionTitle icon={MdBusiness} title="Informasi Client" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {/* Client Code */}
                      <InfoItem
                        label="Kode Client"
                        value={contract.client_code}
                      />

                      {/* Client Name */}
                      <InfoItem
                        label="Nama Client"
                        value={contract.client_name}
                      />

                      {/* Client PIC */}
                      <InfoItem
                        label="PIC Client"
                        value={contract.client_pic_name}
                      />

                      {/* Position */}
                      <InfoItem
                        label="Jabatan"
                        value={contract.client_pic_position}
                      />

                      {/* Phone */}
                      <InfoItem
                        label="Telepon"
                        value={contract.client_pic_phone}
                      />

                      {/* Email */}
                      <InfoItem
                        label="Email"
                        value={contract.client_pic_email}
                      />
                    </div>
                  </div>
                </section>

                {/* ==================================================
                    CATATAN
                ================================================== */}

                {contract.notes && (
                  <section>
                    <SectionTitle icon={MdInfo} title="Catatan" />

                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                        {contract.notes}
                      </p>
                    </div>
                  </section>
                )}

                {/* ==================================================
                    METADATA
                ================================================== */}

                <section>
                  <SectionTitle icon={MdInfo} title="Informasi Sistem" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                      <InfoItem
                        label="Dibuat Oleh"
                        value={contract.created_by}
                      />

                      <InfoItem
                        label="Tanggal Dibuat"
                        value={formatDateTime(contract.created_at)}
                      />

                      <InfoItem
                        label="Diubah Oleh"
                        value={contract.updated_by}
                      />

                      <InfoItem
                        label="Tanggal Diubah"
                        value={formatDateTime(contract.updated_at)}
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================
          DOCUMENT PREVIEW
      ================================================== */}

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

export default ModalDetailContract;
