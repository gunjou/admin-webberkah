import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDescription,
  MdWork,
  MdBusiness,
  MdPerson,
  MdReceipt,
  MdInfo,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

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

const ModalDetailContract = ({ show, onClose, contractId }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (show && contractId) {
      fetchContractDetail();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, contractId]);

  if (!show) return null;

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
                Detail Kontrak
              </h2>
            </div>

            {contract && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {contract.contract_number || "-"}
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
          ) : !contract ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Data kontrak tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informasi Kontrak */}
              <section>
                <SectionTitle icon={MdDescription} title="Informasi Kontrak" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
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
                      label="Status"
                      value={
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_BADGES[contract.status] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {STATUS_LABELS[contract.status] ||
                            contract.status ||
                            "-"}
                        </span>
                      }
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
                      label="Nilai Kontrak"
                      value={formatCurrency(contract.contract_value)}
                    />

                    <InfoItem
                      label="PPN"
                      value={
                        contract.vat_rate !== null &&
                        contract.vat_rate !== undefined
                          ? `${contract.vat_rate}%`
                          : "-"
                      }
                    />
                  </div>

                  {/* Contract Summary */}
                  <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Nilai Kontrak
                        </p>

                        <p className="mt-1 text-base font-semibold text-custom-merah-terang">
                          {formatCurrency(contract.contract_value)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          PPN
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {contract.vat_rate !== null &&
                          contract.vat_rate !== undefined
                            ? `${contract.vat_rate}%`
                            : "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Periode Kontrak
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {formatDate(contract.start_date)} s/d{" "}
                          {formatDate(contract.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {contract.notes && (
                    <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Catatan
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                        {contract.notes}
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
                      value={contract.work_number}
                    />

                    <InfoItem
                      label="Jenis Pekerjaan"
                      value={
                        WORK_TYPE_LABELS[contract.work_type] ||
                        contract.work_type
                      }
                    />

                    <InfoItem
                      label="Tahap Saat Ini"
                      value={contract.current_stage}
                    />

                    <div className="md:col-span-2 lg:col-span-3">
                      <InfoItem
                        label="Nama Pekerjaan"
                        value={contract.work_name}
                      />
                    </div>

                    <InfoItem
                      label="Progress"
                      value={`${Number(contract.progress_percent || 0)}%`}
                    />
                  </div>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Progress Pekerjaan
                      </span>

                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {Number(contract.progress_percent || 0)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-custom-merah-terang transition-all"
                        style={{
                          width: `${Math.min(
                            Number(contract.progress_percent || 0),
                            100,
                          )}%`,
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
                      value={contract.client_code}
                    />

                    <InfoItem
                      label="Nama Client"
                      value={contract.client_name}
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
                      value={contract.client_pic_name}
                    />

                    <InfoItem
                      label="Jabatan"
                      value={contract.client_pic_position}
                    />

                    <InfoItem
                      label="No. Telepon"
                      value={contract.client_pic_phone}
                    />

                    <InfoItem label="Email" value={contract.client_pic_email} />
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
                      value={`${contract.created_by || "-"} • ${formatDateTime(
                        contract.created_at,
                      )}`}
                    />

                    <InfoItem
                      label="Diperbarui Oleh"
                      value={
                        contract.updated_by
                          ? `${contract.updated_by} • ${formatDateTime(
                              contract.updated_at,
                            )}`
                          : "-"
                      }
                    />
                  </div>
                </div>
              </section>

              {/* Contract Reference */}
              <section>
                <SectionTitle icon={MdReceipt} title="Ringkasan Contract" />

                <div className="rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                    <InfoItem
                      label="Nomor Contract"
                      value={contract.contract_number}
                    />

                    <InfoItem
                      label="Tanggal Contract"
                      value={formatDate(contract.contract_date)}
                    />

                    <InfoItem
                      label="Status"
                      value={
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_BADGES[contract.status] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {STATUS_LABELS[contract.status] ||
                            contract.status ||
                            "-"}
                        </span>
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

export default ModalDetailContract;
