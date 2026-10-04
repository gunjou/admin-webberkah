import React, { useCallback, useEffect, useState } from "react";
import Api from "../utils/Api";
import SwalHelper from "../utils/Swal";
import LoadingOverlay from "../components/LoadingOverlay";
import {
  MdAdd,
  MdRefresh,
  MdSearch,
  MdVisibility,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import ModalDetailQuotation from "../components/modals/quotation/ModalDetailQuotation";
import ModalCreateQuotation from "../components/modals/quotation/ModalCreateQuotation";
import ModalEditQuotation from "../components/modals/quotation/ModalEditQuotation";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const Quotation = () => {
  const [dataQuotation, setDataQuotation] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [filter, setFilter] = useState({
    search: "",
    status: "",
    id_work_item: "",
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

  const fetchQuotations = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        per_page: perPage,
      };

      if (filter.search.trim()) {
        params.search = filter.search.trim();
      }

      if (filter.status) {
        params.status = filter.status;
      }

      if (filter.id_work_item) {
        params.id_work_item = filter.id_work_item;
      }

      const response = await Api.get("/work-item/quotation", { params });

      if (response.data?.success) {
        const responseData = response.data.data || {};

        setDataQuotation(responseData.items || []);

        const pageInfo = responseData.pagination || {};

        setPagination({
          page: pageInfo.page || 1,
          per_page: pageInfo.per_page || perPage,
          total: pageInfo.total || 0,
          total_pages: pageInfo.total_pages || 1,
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data quotation:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data penawaran.",
      );
    } finally {
      setLoading(false);
    }
  }, [filter, page, perPage]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

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
      status: "",
      id_work_item: "",
    });
  };

  const handleRefresh = () => {
    fetchQuotations();
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

  const displayedData = [...dataQuotation].sort((a, b) => {
    const { key, direction } = sortConfig;

    let valueA = a[key];
    let valueB = b[key];

    if (
      key === "created_at" ||
      key === "proposal_date" ||
      key === "valid_until"
    ) {
      valueA = new Date(valueA || 0).getTime();
      valueB = new Date(valueB || 0).getTime();
    }

    if (key === "proposal_value") {
      valueA = Number(valueA || 0);
      valueB = Number(valueB || 0);
    }

    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
      valueB = (valueB || "").toLowerCase();
    }

    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;

    return 0;
  });

  const handleCreate = () => {
    setShowCreate(true);
  };

  const handleDetail = (item) => {
    setSelectedQuotationId(item.id_proposal);
    setShowDetail(true);
  };

  const handleEdit = (item) => {
    setSelectedQuotationId(item.id_proposal);
    setShowEdit(true);
  };

  const handleDelete = async (item) => {
    const confirmed = await SwalHelper.confirm({
      title: "Nonaktifkan Penawaran?",
      message: `Penawaran "${item.proposal_number}" akan dinonaktifkan.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await Api.delete(
        `/work-item/quotation/${item.id_proposal}`,
      );

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Penawaran berhasil dinonaktifkan.",
        );
        await fetchQuotations();
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal menonaktifkan penawaran.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal menonaktifkan penawaran.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusClass = (status) => {
    const classes = {
      DRAFT: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",

      SUBMITTED:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",

      WON: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",

      LOST: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",

      EXPIRED:
        "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",

      CANCELLED:
        "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-300",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
    );
  };

  const formatStatus = (status) => {
    const labels = {
      DRAFT: "Draft",
      SUBMITTED: "Submitted",
      WON: "Won",
      LOST: "Lost",
      EXPIRED: "Expired",
      CANCELLED: "Cancelled",
    };

    return labels[status] || status || "-";
  };

  return (
    <>
      {loading && <LoadingOverlay message="Memuat Penawaran..." />}

      <div className="space-y-3 pb-3 font-poppins">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
          <div>
            <h1 className="text-xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
              Penawaran
            </h1>

            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
              Quotation Management
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/5 text-custom-gelap dark:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-custom-merah-terang text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <MdAdd size={16} />
              Penawaran Baru
            </button>
          </div>
        </div>

        {/* =====================================================
            FILTER
        ====================================================== */}

        <div className="bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={filter.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Cari nomor / pekerjaan / client..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang placeholder:text-gray-400"
              />
            </div>

            <select
              value={filter.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-44 h-10 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-black text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang cursor-pointer"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleResetFilter}
              className="h-10 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-custom-gelap dark:text-white text-[9px] font-black uppercase tracking-widest transition-all hover:bg-gray-200 dark:hover:bg-white/10 whitespace-nowrap"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <th className="w-12 px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    #
                  </th>

                  <th
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("proposal_number")}
                  >
                    Nomor Penawaran
                  </th>

                  <th
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("work_number")}
                  >
                    Work Item
                  </th>

                  <th
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("client_name")}
                  >
                    Client
                  </th>

                  <th
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("proposal_date")}
                  >
                    Tanggal
                  </th>

                  <th
                    className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("proposal_value")}
                  >
                    Nilai
                  </th>

                  <th
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("valid_until")}
                  >
                    Berlaku Sampai
                  </th>

                  <th
                    className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </th>

                  <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        Tidak ada data penawaran
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedData.map((item, index) => (
                    <tr
                      key={item.id_proposal}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-[11px] font-bold text-gray-400">
                        {(pagination.page - 1) * pagination.per_page +
                          index +
                          1}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => handleDetail(item)}
                          className="text-[11px] font-black text-custom-merah-terang hover:underline whitespace-nowrap"
                        >
                          {item.proposal_number}
                        </button>

                        <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                          {formatDate(item.created_at)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top max-w-[350px]">
                        <p className="text-[11px] font-black text-custom-gelap dark:text-white whitespace-nowrap">
                          {item.work_number || "-"}
                        </p>

                        <p
                          className="text-[9px] text-gray-400 font-bold mt-0.5 truncate"
                          title={item.work_name}
                        >
                          {item.work_name || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="text-[11px] font-black text-custom-gelap dark:text-white whitespace-nowrap">
                          {item.client_name || "-"}
                        </p>

                        <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                          Pak {item.client_pic_name || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.proposal_date)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatCurrency(item.proposal_value)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.valid_until)}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${getStatusClass(item.status)}`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDetail(item)}
                            title="Detail"
                            className="flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100 dark:bg-white/5 text-custom-gelap dark:text-white transition-all hover:bg-gray-200 dark:hover:bg-white/10"
                          >
                            <MdVisibility size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            className="flex items-center justify-center h-8 w-8 rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white"
                          >
                            <MdEdit size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete"
                            className="flex items-center justify-center h-8 w-8 rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 transition-all hover:bg-red-500 hover:text-white"
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

        {/* =====================================================
            PAGINATION
        ====================================================== */}

        {pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">
                  Tampilkan
                </span>

                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(e.target.value)}
                  className="h-8 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2 text-[10px] font-black text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang cursor-pointer"
                >
                  {PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} / halaman
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-5 w-px bg-gray-100 dark:bg-white/10" />

              <p className="text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">
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
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100 dark:bg-white/5 text-custom-gelap dark:text-white transition-all hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Halaman sebelumnya"
                >
                  <span className="text-xs">‹</span>
                </button>

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
                          <span className="flex items-center justify-center h-8 w-5 text-[10px] font-black text-gray-400">
                            ...
                          </span>
                        )}

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setPage(pageNumber)}
                          className={`flex items-center justify-center h-8 min-w-8 px-2 rounded-xl text-[10px] font-black transition-all ${
                            page === pageNumber
                              ? "bg-custom-merah-terang text-white shadow-md shadow-custom-merah-terang/20"
                              : "bg-gray-100 dark:bg-white/5 text-custom-gelap dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
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

                <button
                  type="button"
                  disabled={page >= pagination.total_pages || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-custom-gelap dark:bg-custom-cerah text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
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
        <ModalCreateQuotation
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={fetchQuotations}
        />
      )}

      {/* Modal Detail */}
      {showDetail && selectedQuotationId && (
        <ModalDetailQuotation
          show={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedQuotationId(null);
          }}
          quotationId={selectedQuotationId}
        />
      )}

      {/* Modal Edit */}
      {showEdit && selectedQuotationId && (
        <ModalEditQuotation
          show={showEdit}
          onClose={() => {
            setShowEdit(false);
            setSelectedQuotationId(null);
          }}
          quotationId={selectedQuotationId}
          onSuccess={fetchQuotations}
        />
      )}
    </>
  );
};

export default Quotation;
