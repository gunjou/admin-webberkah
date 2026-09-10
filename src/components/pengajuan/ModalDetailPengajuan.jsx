import React, { useEffect, useState } from "react";
import {
  MdClose,
  MdDownload,
  MdFlag,
  MdCalendarToday,
  MdPerson,
  MdBusiness,
  MdPayments,
  MdDescription,
  MdCheckCircle,
  MdCircle,
  MdImage,
  MdRateReview,
} from "react-icons/md";
import Api from "../../utils/Api";
import SwalHelper from "../../utils/Swal";

const STATUS_STYLE = {
  REQUESTED: { label: "Requested", light: "#CA8A04", dark: "#FACC15" },
  REVIEWED: { label: "Reviewed", light: "#059669", dark: "#12a878" },
  APPROVED: { label: "Approved", light: "#16A34A", dark: "#7CE9A4" },
  REJECTED: { label: "Rejected", light: "#B91C1C", dark: "#FCA5A5" },
  PAID: { label: "Paid", light: "#0284C7", dark: "#7DD3FC" },
};

const PRIORITY_STYLE = {
  NORMAL: { label: "Normal", light: "#52525B", dark: "#A1A1AA" },
  URGENT: { label: "Urgent", light: "#B45309", dark: "#FCD34D" },
  TOP_URGENT: { label: "Top Urgent", light: "#B91C1C", dark: "#FCA5A5" },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatFileDate = (date) => {
  if (!date) return "";

  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};

const sanitizeFileName = (value = "") =>
  value
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();

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

const ModalDetailPengajuan = ({
  data,
  loading = false,
  onClose,
  onAttachment,
  onRefresh,
  onRefreshList,
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!data && !loading) return null;

  const status = STATUS_STYLE[data?.status] || STATUS_STYLE.REQUESTED;
  const priority = PRIORITY_STYLE[data?.priority] || PRIORITY_STYLE.NORMAL;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleStatusAction = async (action) => {
    if (!data?.id_request || actionLoading) return;

    const note = actionNote.trim() || null;

    if (action === "reject" && !note) {
      await SwalHelper.warning("Note wajib diisi ketika melakukan reject.");
      return;
    }

    try {
      setActionLoading(true);
      setActionType(action);

      await Api.post(`/purchase-requests/${data.id_request}/${action}`, {
        note,
      });

      if (action === "review") {
        setActionNote("");
        await onRefresh?.();
        return;
      }

      await onRefreshList?.();
      onClose();
    } catch (error) {
      console.error(`Gagal melakukan ${action}:`, error);
      await SwalHelper.error(
        error?.response?.data?.message || `Gagal melakukan ${action}.`,
      );
    } finally {
      setActionLoading(false);
      setActionType(null);
    }
  };

  const handleDownload = async () => {
    if (!data?.id_request) return;

    try {
      setActionLoading(true);
      setActionType("download");

      const response = await Api.get(
        `/purchase-requests/${data.id_request}/pdf`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Pengajuan ${sanitizeFileName(data.pegawai?.nama_panggilan || "Tanpa Nama")} - ${sanitizeFileName(data.nama_pekerjaan || "Tanpa Pekerjaan")} ${formatFileDate(data.tanggal_request)}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mendownload PDF:", error);
      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mendownload PDF pengajuan.",
      );
    } finally {
      setActionLoading(false);
      setActionType(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-custom-gelap">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-white/5 dark:bg-custom-gelap">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-black tracking-tight text-custom-gelap dark:text-white">
                Detail Pengajuan
              </h2>

              {data?.status && (
                <span
                  className="rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: status.light }}
                >
                  {status.label}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs font-bold text-gray-400">
              {data?.request_number || "-"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={actionLoading}
              className="flex h-9 items-center gap-2 rounded-lg bg-custom-merah-terang px-3 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:bg-custom-merah disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading && actionType === "download" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <MdDownload size={16} />
              )}
              Download
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <MdClose size={19} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-custom-merah-terang border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* PEKERJAAN */}
              <section className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="mb-3 flex items-center gap-2">
                  <MdDescription
                    size={19}
                    className="text-custom-merah-terang"
                  />

                  <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                    Pekerjaan
                  </h3>
                </div>

                <p className="text-sm font-black text-custom-gelap dark:text-white">
                  {data?.nama_pekerjaan || "-"}
                </p>

                {data?.note && (
                  <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {data.note}
                  </p>
                )}
              </section>

              {/* REQUEST INFORMATION */}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-custom-merah-terang/10 text-custom-merah-terang">
                      <MdPerson size={19} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Pemohon
                      </p>
                      <p className="mt-0.5 text-xs font-black text-custom-gelap dark:text-white">
                        {data?.pegawai?.nama_lengkap || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-custom-merah-terang/10 text-custom-merah-terang">
                      <MdBusiness size={19} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Departemen
                      </p>
                      <p className="mt-0.5 text-xs font-black text-custom-gelap dark:text-white">
                        {data?.departemen?.nama_departemen || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-custom-merah-terang/10 text-custom-merah-terang">
                      <MdCalendarToday size={18} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Tanggal
                      </p>
                      <p className="mt-0.5 text-xs font-black text-custom-gelap dark:text-white">
                        {formatDate(data?.tanggal_request)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRIORITY & TOTAL */}
              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className="rounded-xl p-4 shadow-sm"
                  style={{ backgroundColor: priority.light }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/70">
                        Priority
                      </p>

                      <p className="mt-1 text-lg font-black uppercase tracking-tight text-white">
                        {priority.label}
                      </p>
                    </div>

                    <MdFlag size={32} className="text-white/80" />
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-custom-merah-terang dark:bg-custom-gelap dark:ring-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/50">
                        Total Pengajuan
                      </p>

                      <p className="mt-1 text-lg font-black tracking-tight text-custom-merah-terang">
                        {formatCurrency(data?.total_amount)}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-custom-merah-terang/10">
                      <MdPayments
                        size={24}
                        className="text-custom-merah-terang"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                    Detail Item
                  </h3>

                  <span className="rounded-md bg-custom-merah-terang/10 px-2 py-1 text-[9px] font-black text-custom-gelap dark:text-custom-merah-terang">
                    {data?.items?.length || 0} Item
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead className="bg-gray-50 dark:bg-white/[0.03]">
                        <tr>
                          <th className="w-12 px-4 py-3 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                            No
                          </th>
                          <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Keterangan
                          </th>
                          <th className="w-24 px-4 py-3 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Unit
                          </th>
                          <th className="w-32 px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Harga
                          </th>
                          <th className="w-20 px-4 py-3 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Jumlah
                          </th>
                          <th className="w-36 px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {data?.items?.map((item) => (
                          <tr key={item.id_item}>
                            <td className="px-4 py-3 text-center text-xs font-bold text-gray-400">
                              {item.item_no}
                            </td>

                            <td className="px-4 py-3 text-xs font-bold text-custom-gelap dark:text-white">
                              {item.keterangan}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span className="rounded-md bg-gray-100 px-2 py-1 text-[9px] font-black uppercase text-gray-500 dark:bg-white/5 dark:text-gray-400">
                                {item.unit}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300">
                              {formatCurrency(item.harga_satuan)}
                            </td>

                            <td className="px-4 py-3 text-center text-xs font-bold text-custom-gelap dark:text-white">
                              {item.jumlah}
                            </td>

                            <td className="px-4 py-3 text-right text-xs font-black text-custom-gelap dark:text-white">
                              {formatCurrency(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      {/* TOTAL */}
                      <tfoot>
                        <tr className="border-t-2 border-custom-merah-terang/20 bg-custom-merah-terang/[0.04]">
                          <td
                            colSpan="5"
                            className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400"
                          >
                            Total Pengajuan
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-black text-custom-merah-terang dark:text-custom-merah-terang">
                            {formatCurrency(data?.total_amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              {data?.payment && (
                <section className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                  <div className="mb-4 flex items-center gap-2">
                    <MdPayments
                      size={19}
                      className="text-custom-merah-terang"
                    />

                    <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                      Pembayaran
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <DetailField
                      label="Deskripsi"
                      value={data.payment.description}
                    />
                    <DetailField label="Bank" value={data.payment.bank} />
                    <DetailField
                      label="No. Rekening"
                      value={data.payment.account_number}
                    />
                    <DetailField
                      label="Nama Rekening"
                      value={data.payment.account_name}
                    />
                  </div>
                </section>
              )}

              {/* ATTACHMENT */}
              {data?.attachment?.path && (
                <section>
                  <div className="mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                      Attachment
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAttachment(data.attachment)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-left transition-all hover:border-custom-merah-terang/30 hover:bg-custom-merah-terang/[0.04] dark:border-white/5 dark:bg-white/[0.02]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang transition-all group-hover:bg-custom-merah-terang group-hover:text-white">
                      <MdImage size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Lampiran
                      </p>

                      <p className="mt-1 truncate text-xs font-black text-custom-gelap dark:text-white">
                        {data.attachment.name || "Attachment"}
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        Klik untuk melihat lampiran
                      </p>
                    </div>
                  </button>
                </section>
              )}

              {/* HISTORY */}
              {data?.history?.length > 0 && (
                <section>
                  <div className="mb-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
                      Riwayat Pengajuan
                    </h3>
                    <p className="mt-1 text-[10px] text-gray-400">
                      Perjalanan status pengajuan dari awal hingga status
                      terakhir.
                    </p>
                  </div>

                  {(() => {
                    const normalStatuses = [
                      "REQUESTED",
                      "REVIEWED",
                      "APPROVED",
                      "PAID",
                    ];
                    const rejectedStatuses = [
                      "REQUESTED",
                      "REVIEWED",
                      "REJECTED",
                    ];
                    const historyStatuses =
                      data.status === "REJECTED"
                        ? rejectedStatuses
                        : normalStatuses;

                    const historyMap = Object.fromEntries(
                      data.history.map((history) => [history.status, history]),
                    );

                    const lastStatusIndex = historyStatuses.findIndex(
                      (status) => status === data.status,
                    );

                    return (
                      <div className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-5 dark:border-white/5 dark:bg-white/[0.02]">
                        <div className="relative w-full">
                          {/* LINE */}
                          <div
                            className="absolute top-5 h-0.5 bg-gray-200 dark:bg-white/10"
                            style={{
                              left: `${50 / historyStatuses.length}%`,
                              right: `${50 / historyStatuses.length}%`,
                            }}
                          >
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width:
                                  lastStatusIndex <= 0
                                    ? "0%"
                                    : `${(lastStatusIndex / (historyStatuses.length - 1)) * 100}%`,
                                backgroundColor:
                                  data.status === "REJECTED"
                                    ? STATUS_STYLE.REJECTED.light
                                    : "#B77171",
                              }}
                            />
                          </div>

                          {/* STEPS */}
                          <div className="relative flex w-full">
                            {historyStatuses.map((status, index) => {
                              const history = historyMap[status];
                              const statusStyle =
                                STATUS_STYLE[status] || STATUS_STYLE.REQUESTED;
                              const isPassed = index <= lastStatusIndex;

                              return (
                                <div
                                  key={status}
                                  className="flex min-w-0 flex-1 flex-col items-center"
                                >
                                  {/* DOT */}
                                  <div
                                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${isPassed ? "text-white" : "bg-gray-200 text-gray-400 dark:bg-white/10 dark:text-gray-500"}`}
                                    style={
                                      isPassed
                                        ? { backgroundColor: statusStyle.light }
                                        : undefined
                                    }
                                  >
                                    {isPassed ? (
                                      <MdCheckCircle size={19} />
                                    ) : (
                                      <MdCircle size={15} />
                                    )}
                                  </div>

                                  {/* INFORMATION */}
                                  <div className="mt-3 w-full px-2 text-center">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${isPassed ? "text-white" : "bg-gray-200 text-gray-400 dark:bg-white/10 dark:text-gray-500"}`}
                                      style={
                                        isPassed
                                          ? {
                                              backgroundColor:
                                                statusStyle.light,
                                            }
                                          : undefined
                                      }
                                    >
                                      {statusStyle.label}
                                    </span>

                                    {history ? (
                                      <>
                                        <p className="mt-2 truncate text-xs font-black text-custom-gelap dark:text-white">
                                          {history.nama_pegawai || "-"}
                                        </p>

                                        <p className="mt-1 text-[10px] font-medium text-gray-400">
                                          {formatDateTime(history.created_at)}
                                        </p>

                                        {history.note && (
                                          <p className="mx-auto mt-2 line-clamp-2 max-w-[180px] text-[10px] leading-4 text-gray-500 dark:text-gray-400">
                                            {history.note}
                                          </p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="mt-2 text-[10px] font-medium italic text-gray-400 dark:text-gray-500">
                                        Belum dilakukan
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>
              )}

              {/* META */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-gray-100 pt-4 dark:border-white/5">
                <DetailField
                  label="Dibuat"
                  value={formatDateTime(data?.created_at)}
                />

                <DetailField
                  label="Diperbarui"
                  value={formatDateTime(data?.updated_at)}
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTION */}
        {!loading && data && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4 dark:border-white/5 dark:bg-custom-gelap">
            <div className="flex flex-col gap-2">
              <div className=" items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Note
                </label>

                {["REQUESTED", "REVIEWED"].includes(data.status) && (
                  <span className="flex text-[10px] font-medium italic text-gray-800">
                    (Opsional) Hanya wajib saat Reject
                  </span>
                )}
              </div>

              <div className="flex items-stretch gap-2">
                <textarea
                  value={actionNote}
                  onChange={(event) => setActionNote(event.target.value)}
                  disabled={
                    actionLoading ||
                    !["REQUESTED", "REVIEWED"].includes(data.status)
                  }
                  rows={1}
                  placeholder={
                    data.status === "REQUESTED"
                      ? "Tambahkan catatan review (opsional)..."
                      : data.status === "REVIEWED"
                        ? "Tambahkan catatan approval atau rejection..."
                        : "Tidak ada tindakan yang tersedia."
                  }
                  className="h-10 min-h-10 flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-custom-gelap outline-none transition-all placeholder:text-gray-400 focus:border-custom-merah-terang focus:ring-2 focus:ring-custom-merah-terang/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />

                {data.status === "REQUESTED" && (
                  <button
                    type="button"
                    onClick={() => handleStatusAction("review")}
                    disabled={actionLoading}
                    className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-custom-merah-terang px-6 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading && actionType === "review" ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <MdRateReview size={17} />
                    )}
                    Review
                  </button>
                )}

                {data.status === "REVIEWED" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStatusAction("reject")}
                      disabled={actionLoading}
                      className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-custom-merah-terang bg-custom-merah-terang/10 px-6 text-[10px] font-black uppercase tracking-wider text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading && actionType === "reject" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <MdClose size={17} />
                      )}
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusAction("approve")}
                      disabled={actionLoading}
                      className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-custom-merah-terang px-6 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:bg-custom-merah disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading && actionType === "approve" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <MdCheckCircle size={17} />
                      )}
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailField = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-xs font-bold text-custom-gelap dark:text-white">
      {value || "-"}
    </p>
  </div>
);

export default ModalDetailPengajuan;
