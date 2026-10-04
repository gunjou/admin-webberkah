import React, { useCallback, useEffect, useMemo, useState } from "react";
import Api from "../utils/Api";
import SwalHelper from "../utils/Swal";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdRefresh,
  MdSearch,
  MdVisibility,
  MdDescription,
} from "react-icons/md";
import ModalCreateCompletion from "../components/modals/completion/ModalCreateCompletion";
import ModalDetailCompletion from "../components/modals/completion/ModalDetailCompletion";
import ModalEditCompletion from "../components/modals/completion/ModalEditCompletion";

const WORK_TYPE_OPTIONS = [
  { value: "", label: "Semua Jenis" },
  { value: "TENDER", label: "Tender" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const WORK_TYPE_BADGES = {
  TENDER: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  MAINTENANCE:
    "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
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

const Completion = () => {
  const [dataCompletion, setDataCompletion] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedCompletionId, setSelectedCompletionId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [filter, setFilter] = useState({
    search: "",
    work_type: "",
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const fetchCompletions = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        per_page: perPage,
      };

      if (filter.search.trim()) {
        params.search = filter.search.trim();
      }

      if (filter.work_type) {
        params.work_type = filter.work_type;
      }

      const response = await Api.get("/work-item/completion", {
        params,
      });

      if (response.data?.success) {
        const responseData = response.data?.data || {};
        const pageInfo = responseData.pagination || {};

        setDataCompletion(responseData.items || []);

        setPagination({
          page: pageInfo.page || 1,
          per_page: pageInfo.per_page || perPage,
          total: pageInfo.total || 0,
          total_pages: pageInfo.total_pages || 1,
        });
      } else {
        SwalHelper.error(response.data?.message || "Gagal mengambil data BA.");
      }
    } catch (error) {
      console.error("Gagal mengambil data BA:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data BA.",
      );
    } finally {
      setLoading(false);
    }
  }, [filter, page, perPage]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  const handleFilterChange = (key, value) => {
    setPage(1);

    setFilter((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleResetFilter = () => {
    setPage(1);

    setFilter({
      search: "",
      work_type: "",
    });
  };

  const handleRefresh = () => {
    fetchCompletions();
  };

  const handlePerPageChange = (value) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const displayedData = useMemo(() => {
    const data = [...dataCompletion];

    data.sort((a, b) => {
      const { key, direction } = sortConfig;

      let valueA = a[key];
      let valueB = b[key];

      if (
        key === "ba_date" ||
        key === "completion_date" ||
        key === "created_at"
      ) {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();
      } else {
        valueA = String(valueA || "").toLowerCase();
        valueB = String(valueB || "").toLowerCase();
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }

      return 0;
    });

    return data;
  }, [dataCompletion, sortConfig]);

  const handleCreate = () => {
    setShowCreate(true);
  };

  const handleDetail = (item) => {
    setSelectedCompletionId(item.id_completion);
    setShowDetail(true);
  };

  const handleEdit = (item) => {
    setSelectedCompletionId(item.id_completion);
    setShowEdit(true);
  };

  const handleDelete = async (item) => {
    const confirmed = await SwalHelper.confirm({
      title: "Nonaktifkan BA?",
      message: `BA "${item.ba_number}" akan dinonaktifkan.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await Api.delete(
        `/work-item/completion/${item.id_completion}`,
      );

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "BA berhasil dinonaktifkan.",
        );
        await fetchCompletions();
      } else {
        SwalHelper.error(response.data?.message || "Gagal menonaktifkan BA.");
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal menonaktifkan BA.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDocument = (item) => {
    if (!item.document_url) {
      SwalHelper.info("Dokumen BA tidak tersedia.");
      return;
    }

    window.open(item.document_url, "_blank");
  };

  return (
    <>
      {loading && <LoadingOverlay message="Memuat Berita Acara..." />}

      <div className="space-y-3 pb-3 font-poppins">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 px-1 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-custom-gelap dark:text-white">
              Berita Acara
            </h1>

            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
              Completion / BA Management
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-custom-gelap shadow-sm transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/5 dark:bg-custom-gelap dark:text-white"
            >
              <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-2xl bg-custom-merah-terang px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <MdAdd size={16} />
              BA Baru
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/5 dark:bg-custom-gelap">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={filter.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Cari nomor BA, pekerjaan, atau client..."
                className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 pl-9 pr-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Work Type */}
            <select
              value={filter.work_type}
              onChange={(e) => handleFilterChange("work_type", e.target.value)}
              className="h-10 w-44 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetFilter}
              className="h-10 whitespace-nowrap rounded-xl bg-gray-100 px-4 text-[9px] font-black uppercase tracking-widest text-custom-gelap transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/5 dark:bg-custom-gelap">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/5">
                  <th className="w-12 px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    #
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("ba_number")}
                  >
                    Nomor BA
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("work_name")}
                  >
                    Pekerjaan
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("client_name")}
                  >
                    Client
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("ba_date")}
                  >
                    Tanggal BA
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("completion_date")}
                  >
                    Tanggal Selesai
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Dokumen
                  </th>

                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Tidak ada data BA
                      </p>

                      <p className="mt-1 text-[9px] font-bold text-gray-400">
                        Data berita acara belum tersedia.
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedData.map((item, index) => (
                    <tr
                      key={item.id_completion}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-center align-top text-[11px] font-bold text-gray-400">
                        {(pagination.page - 1) * pagination.per_page +
                          index +
                          1}
                      </td>

                      {/* BA Number */}
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => handleDetail(item)}
                          className="whitespace-nowrap text-[11px] font-black text-custom-merah-terang hover:underline"
                        >
                          {item.ba_number || "-"}
                        </button>

                        <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                          {formatDate(item.created_at)}
                        </p>
                      </td>

                      {/* Work */}
                      <td className="max-w-[350px] px-4 py-3 align-top">
                        <p className="whitespace-nowrap text-[11px] font-black text-custom-gelap dark:text-white">
                          {item.work_number || "-"}
                        </p>

                        <p
                          className="mt-0.5 truncate text-[9px] font-bold text-gray-400"
                          title={item.work_name}
                        >
                          {item.work_name || "-"}
                        </p>

                        {item.work_type && (
                          <span
                            className={`mt-2 inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                              WORK_TYPE_BADGES[item.work_type] ||
                              "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                            }`}
                          >
                            {WORK_TYPE_LABELS[item.work_type] || item.work_type}
                          </span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3 align-top">
                        <p className="whitespace-nowrap text-[11px] font-black text-custom-gelap dark:text-white">
                          {item.client_name || "-"}
                        </p>

                        {item.client_code && (
                          <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                            {item.client_code}
                          </p>
                        )}
                      </td>

                      {/* BA Date */}
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.ba_date)}
                        </p>
                      </td>

                      {/* Completion Date */}
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.completion_date)}
                        </p>
                      </td>

                      {/* Document */}
                      <td className="px-4 py-3 text-center align-top">
                        {item.document_url ? (
                          <button
                            type="button"
                            onClick={() => handleDocument(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-custom-gelap transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                          >
                            <MdDescription size={14} />
                            Lihat
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400">
                            Tidak tersedia
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDetail(item)}
                            title="Detail"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-custom-gelap transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                          >
                            <MdVisibility size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white"
                          >
                            <MdEdit size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white dark:bg-red-500/10"
                          >
                            <MdDelete size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 dark:border-white/5 dark:bg-custom-gelap sm:flex-row">
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-[9px] font-bold uppercase text-gray-400">
                  Tampilkan
                </span>

                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(e.target.value)}
                  className="h-8 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-2 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  {PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} / halaman
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-5 w-px bg-gray-100 dark:bg-white/10" />

              <p className="whitespace-nowrap text-[9px] font-bold uppercase text-gray-400">
                Menampilkan {(pagination.page - 1) * pagination.per_page + 1}–
                {Math.min(
                  pagination.page * pagination.per_page,
                  pagination.total,
                )}{" "}
                dari {pagination.total} item
              </p>
            </div>

            {pagination.total_pages > 1 && (
              <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-custom-gelap transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  aria-label="Halaman sebelumnya"
                >
                  <span className="text-xs">‹</span>
                </button>

                {/* Pages */}
                {Array.from(
                  { length: pagination.total_pages },
                  (_, index) => index + 1,
                )
                  .filter(
                    (pageNumber) =>
                      pageNumber === 1 ||
                      pageNumber === pagination.total_pages ||
                      Math.abs(pageNumber - page) <= 1,
                  )
                  .map((pageNumber, index, pages) => {
                    const previousPage = pages[index - 1];

                    return (
                      <React.Fragment key={pageNumber}>
                        {previousPage && pageNumber - previousPage > 1 && (
                          <span className="flex h-8 w-5 items-center justify-center text-[10px] font-black text-gray-400">
                            ...
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setPage(pageNumber)}
                          className={`flex h-8 min-w-8 items-center justify-center rounded-xl px-2 text-[10px] font-black transition-all ${
                            page === pageNumber
                              ? "bg-custom-merah-terang text-white shadow-md shadow-custom-merah-terang/20"
                              : "bg-gray-100 text-custom-gelap hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                          } disabled:cursor-not-allowed`}
                          aria-label={`Halaman ${pageNumber}`}
                          aria-current={
                            page === pageNumber ? "page" : undefined
                          }
                        >
                          {pageNumber}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* Next */}
                <button
                  type="button"
                  disabled={page >= pagination.total_pages || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-custom-gelap text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-custom-cerah"
                  aria-label="Halaman berikutnya"
                >
                  <span className="text-xs">›</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Create */}
      {showCreate && (
        <ModalCreateCompletion
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={fetchCompletions}
        />
      )}

      {/* Modal Detail */}
      {showDetail && selectedCompletionId && (
        <ModalDetailCompletion
          show={showDetail}
          completionId={selectedCompletionId}
          onClose={() => {
            setShowDetail(false);
            setSelectedCompletionId(null);
          }}
        />
      )}

      {/* Modal Edit */}
      {showEdit && selectedCompletionId && (
        <ModalEditCompletion
          show={showEdit}
          completionId={selectedCompletionId}
          onClose={() => {
            setShowEdit(false);
            setSelectedCompletionId(null);
          }}
          onSuccess={fetchCompletions}
        />
      )}
    </>
  );
};

export default Completion;
