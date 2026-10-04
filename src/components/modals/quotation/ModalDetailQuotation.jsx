import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDescription,
  MdWork,
  MdBusiness,
  MdPerson,
  MdNotes,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  WON: "Won",
  LOST: "Lost",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

const STATUS_BADGES = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  WON: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  EXPIRED:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  CANCELLED:
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
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

const ModalDetailQuotation = ({ quotationId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const response = await Api.get(`/work-item/quotation/${quotationId}`);

      if (response.data?.success) {
        setDetail(response.data.data);
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil detail penawaran.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil detail penawaran.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId) {
      fetchDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
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
                Detail Penawaran
              </h2>
            </div>

            {detail && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {detail.proposal_number || "-"}
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
          ) : !detail ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              Data penawaran tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informasi Penawaran */}
              <section>
                <SectionTitle
                  icon={MdDescription}
                  title="Informasi Penawaran"
                />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                      label="Nomor Penawaran"
                      value={detail.proposal_number}
                    />

                    <InfoItem
                      label="Tanggal Penawaran"
                      value={formatDate(detail.proposal_date)}
                    />

                    <InfoItem
                      label="Nilai Penawaran"
                      value={formatCurrency(detail.proposal_value)}
                    />

                    <InfoItem
                      label="Berlaku Sampai"
                      value={formatDate(detail.valid_until)}
                    />

                    <InfoItem
                      label="Status"
                      value={
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            STATUS_BADGES[detail.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STATUS_LABELS[detail.status] || detail.status || "-"}
                        </span>
                      }
                    />
                  </div>

                  {detail.notes && (
                    <div className="mt-5 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Catatan
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">
                        {detail.notes}
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
                      value={detail.work_number}
                    />

                    <InfoItem
                      label="Jenis Pekerjaan"
                      value={detail.work_type}
                    />

                    <div className="md:col-span-2 lg:col-span-3">
                      <InfoItem
                        label="Nama Pekerjaan"
                        value={detail.work_name}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Client */}
              <section>
                <SectionTitle icon={MdBusiness} title="Client" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Kode Client" value={detail.client_code} />

                    <InfoItem label="Nama Client" value={detail.client_name} />
                  </div>
                </div>
              </section>

              {/* PIC Client */}
              <section>
                <SectionTitle icon={MdPerson} title="PIC Client" />

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem label="Nama" value={detail.client_pic_name} />

                    <InfoItem
                      label="Jabatan"
                      value={detail.client_pic_position}
                    />

                    <InfoItem label="Telepon" value={detail.client_pic_phone} />

                    <InfoItem label="Email" value={detail.client_pic_email} />
                  </div>
                </div>
              </section>

              {/* Catatan */}
              {!detail.notes && (
                <section>
                  <SectionTitle icon={MdNotes} title="Catatan" />

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tidak ada catatan.
                    </p>
                  </div>
                </section>
              )}

              {/* Metadata */}
              <section>
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoItem
                      label="Dibuat Oleh"
                      value={`${detail.created_by || "-"} • ${formatDateTime(
                        detail.created_at,
                      )}`}
                    />

                    <InfoItem
                      label="Diperbarui Oleh"
                      value={
                        detail.updated_by
                          ? `${detail.updated_by} • ${formatDateTime(
                              detail.updated_at,
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

export default ModalDetailQuotation;
