import React from "react";
import {
  MdEdit,
  MdDelete,
  MdFlag,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";

const STATUS_STYLE = {
  REQUESTED: { label: "Requested", light: "#CA8A04", dark: "#FACC15" },
  REVIEWED: { label: "Reviewed", light: "#059669", dark: "#12a878" },
  APPROVED: { label: "Approved", light: "#16A34A", dark: "#7CE9A4" },
  REJECTED: { label: "Rejected", light: "#B91C1C", dark: "#FCA5A5" },
  PAID: { label: "Paid", light: "#0284C7", dark: "#7DD3FC" },
  ACTIVE: { label: "Aktif", light: "#A91D24", dark: "#B77171" },
};

const PRIORITY_STYLE = {
  NORMAL: { label: "Normal", light: "#52525B", dark: "#A1A1AA" },
  URGENT: { label: "Urgent", light: "#B45309", dark: "#FCD34D" },
  TOP_URGENT: { label: "Top Urgent", light: "#B91C1C", dark: "#FCA5A5" },
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

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
    month: "short",
    year: "numeric",
  });
};

const PengajuanTable = ({
  data = [],
  loading = false,
  sortConfig,
  onSort,
  onDetail,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-custom-gelap rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-custom-cerah border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white dark:bg-custom-gelap rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex flex-col items-center justify-center h-64 px-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-custom-cerah/10 flex items-center justify-center mb-3">
            <MdFlag size={22} className="text-custom-cerah" />
          </div>
          <p className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
            Tidak Ada Data
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Belum terdapat data pengajuan pada filter yang dipilih.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-custom-gelap rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
      <div className="max-h-[calc(100vh-320px)] overflow-auto">
        <table className="w-full min-w-[1150px]">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-custom-gelap">
              <th className="w-12 px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                No
              </th>
              <th className="w-44 px-4 py-4 text-left">
                <button
                  type="button"
                  onClick={() => onSort?.("date")}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-custom-merah-terang"
                >
                  Pengajuan
                  {sortConfig?.key === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <MdArrowUpward size={13} />
                    ) : (
                      <MdArrowDownward size={13} />
                    ))}
                </button>
              </th>
              <th className="w-40 px-4 py-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-400">
                Pemohon
              </th>
              <th className="min-w-[300px] px-4 py-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-400">
                Pekerjaan
              </th>
              <th className="w-32 px-4 py-4 text-center">
                <button
                  type="button"
                  onClick={() => onSort?.("priority")}
                  className="mx-auto flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-custom-merah-terang"
                >
                  Priority
                  {sortConfig?.key === "priority" &&
                    (sortConfig.direction === "desc" ? (
                      <MdArrowDownward size={13} />
                    ) : (
                      <MdArrowUpward size={13} />
                    ))}
                </button>
              </th>
              <th className="w-36 px-4 py-4 text-right text-[9px] font-black uppercase tracking-widest text-gray-400">
                Total
              </th>
              <th className="w-28 px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                Status
              </th>
              {/* <th className="w-28 px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                Approve
              </th> */}
              <th className="w-32 px-4 py-4 text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {data.map((item, index) => {
              const status = STATUS_STYLE[item.status] || STATUS_STYLE.ACTIVE;
              const priority =
                PRIORITY_STYLE[item.priority] || PRIORITY_STYLE.NORMAL;

              return (
                <tr
                  key={item.id_request}
                  className="group transition-colors hover:bg-custom-cerah/[0.04] dark:hover:bg-white/[0.03]"
                >
                  <td
                    onClick={() => onDetail?.(item.id_request)}
                    className="cursor-pointer px-2 py-4 text-center"
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-[9px] font-black text-gray-500 dark:bg-white/10 dark:text-gray-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </td>

                  <td
                    onClick={() => onDetail?.(item.id_request)}
                    className="cursor-pointer px-2 py-4"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="whitespace-nowrap text-[9px] font-bold tracking-wide text-gray-400 dark:text-gray-600">
                        {item.request_number || "-"}
                      </span>
                      <span className="whitespace-nowrap text-[11px] font-black tracking-tight text-custom-gelap dark:text-white">
                        {formatDate(item.tanggal_request)}
                      </span>
                    </div>
                  </td>

                  <td
                    onClick={() => onDetail?.(item.id_request)}
                    className="cursor-pointer px-2 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-custom-merah-terang/10 dark:bg-custom-cerah/10">
                        <span className="text-[10px] font-black text-custom-merah-terang dark:text-custom-cerah">
                          {getInitials(item.nama_pegawai)}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="whitespace-nowrap text-[11px] font-black leading-tight text-custom-gelap dark:text-white">
                          {item.nama_panggilan || "-"}
                        </span>

                        <span className="w-fit whitespace-nowrap rounded-md bg-custom-cerah/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-custom-merah dark:text-custom-cerah">
                          {item.nama_departemen || "-"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td
                    onClick={() => onDetail?.(item.id_request)}
                    className="cursor-pointer px-2 py-4"
                  >
                    <div className="min-w-[200px] max-w-[480px]">
                      <p className="text-[11px] font-black leading-5 text-custom-gelap dark:text-white">
                        {item.nama_pekerjaan || "-"}
                      </p>

                      {item.note && (
                        <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-4 text-gray-600 dark:text-gray-500">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </td>

                  <td
                    onClick={() => onDetail?.(item.id_request)}
                    className="cursor-pointer px-4 py-4 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm dark:hidden"
                        style={{
                          backgroundColor: priority.light,
                          color: "#FFFFFF",
                        }}
                      >
                        <MdFlag size={15} className="shrink-0" />
                        <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-wider">
                          {priority.label}
                        </span>
                      </span>

                      <span
                        className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm dark:inline-flex"
                        style={{
                          backgroundColor: priority.dark,
                          color: "#2C2129",
                        }}
                      >
                        <MdFlag size={15} className="shrink-0" />
                        <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-wider">
                          {priority.label}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td
                    onClick={() => onDetail?.(item.id_request)}
                    className="cursor-pointer px-4 py-4 text-right"
                  >
                    <span className="whitespace-nowrap text-[13px] font-black text-custom-gelap dark:text-white">
                      {formatCurrency(item.total_amount)}
                    </span>
                  </td>

                  <td
                    onClick={() => onDetail?.(item.id_request)}
                    className="cursor-pointer px-4 py-4 text-center"
                  >
                    <span
                      className="inline-flex min-w-[86px] justify-center rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-wider dark:hidden"
                      style={{
                        color: status.light,
                        backgroundColor: `${status.light}15`,
                      }}
                    >
                      {status.label}
                    </span>

                    <span
                      className="hidden min-w-[86px] justify-center rounded-full px-3 py-1.5 text-[8px] font-black uppercase tracking-wider dark:inline-flex"
                      style={{
                        color: status.dark,
                        backgroundColor: `${status.dark}18`,
                      }}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(item.id_request)}
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600/10 text-teal-600 transition-all hover:scale-105 hover:bg-teal-600 hover:text-white"
                      >
                        <MdEdit size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete?.(item.id_request)}
                        title="Hapus"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/10 text-red-600 transition-all hover:scale-105 hover:bg-red-600 hover:text-white"
                      >
                        <MdDelete size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PengajuanTable;
