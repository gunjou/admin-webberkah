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
} from "react-icons/md";
import ModalCreateContract from "../components/modals/contract/ModalCreateContract";
import ModalDetailContract from "../components/modals/contract/ModalDetailContract";
import ModalEditContract from "../components/modals/contract/ModalEditContract";

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STAGE_FILTER_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
];

const PER_PAGE_OPTIONS = [25, 50, 100];

const STATUS_BADGES = {
  ACTIVE: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  COMPLETED: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  CANCELLED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const STATUS_LABELS = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
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
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const Contract = () => {
  const [dataContract, setDataContract] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [filter, setFilter] = useState({
    stage: "ACTIVE",
    search: "",
    status: "",
    id_client: "",
    id_work_item: "",
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 25,
    total: 0,
    total_pages: 1,
  });

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const fetchContracts = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        stage: filter.stage,
      };

      if (filter.search.trim()) {
        params.search = filter.search.trim();
      }

      if (filter.status) {
        params.status = filter.status;
      }

      if (filter.id_work_item) {
        params.id_work_item = Number(filter.id_work_item);
      }

      if (filter.id_client) {
        params.id_client = Number(filter.id_client);
      }

      if (filter.stage === "CLOSED") {
        params.page = page;
        params.per_page = perPage;
      }

      const response = await Api.get("/work-item/contract", {
        params,
      });

      if (response.data?.success) {
        const responseData = response.data?.data || {};
        const items = responseData.items || [];

        setDataContract(items);

        if (filter.stage === "CLOSED") {
          const pageInfo = responseData.pagination || {};

          setPagination({
            page: pageInfo.page || page,
            per_page: pageInfo.per_page || perPage,
            total: pageInfo.total || 0,
            total_pages: pageInfo.total_pages || 1,
          });
        } else {
          setPagination({
            page: 1,
            per_page: items.length,
            total: items.length,
            total_pages: 1,
          });
        }
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil data kontrak.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data kontrak:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data kontrak.",
      );
    } finally {
      setLoading(false);
    }
  }, [filter, page, perPage]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await Api.get("/work-item/master/clients/options");

      if (response.data?.success) {
        setClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data client:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data client.",
      );
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleFilterChange = (key, value) => {
    setPage(1);

    setFilter((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleResetFilter = () => {
    setPage(1);

    setFilter((current) => ({
      stage: current.stage,
      search: "",
      status: "",
      id_client: "",
      id_work_item: "",
    }));
  };

  const handleRefresh = () => {
    fetchContracts();
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
    const data = [...dataContract];

    data.sort((a, b) => {
      const { key, direction } = sortConfig;

      let valueA = a[key];
      let valueB = b[key];

      if (
        key === "contract_date" ||
        key === "start_date" ||
        key === "end_date" ||
        key === "created_at"
      ) {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();
      } else if (key === "contract_value" || key === "vat_rate") {
        valueA = Number(valueA || 0);
        valueB = Number(valueB || 0);
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
  }, [dataContract, sortConfig]);

  const handleCreate = () => {
    setShowCreate(true);
  };

  const handleDetail = (item) => {
    setSelectedContractId(item.id_contract);
    setShowDetail(true);
  };

  const handleEdit = (item) => {
    setSelectedContractId(item.id_contract);
    setShowEdit(true);
  };

  const handleDelete = async (item) => {
    const confirmed = await SwalHelper.confirm({
      title: "Nonaktifkan Kontrak?",
      message: `Kontrak "${item.contract_number}" akan dinonaktifkan.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await Api.delete(
        `/work-item/contract/${item.id_contract}`,
      );

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Kontrak berhasil dinonaktifkan.",
        );
        await fetchContracts();
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal menonaktifkan kontrak.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal menonaktifkan kontrak.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay message="Memuat Kontrak..." />}

      <div className="space-y-3 pb-3 font-poppins">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 px-1 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-custom-gelap dark:text-white">
              Kontrak
            </h1>

            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
              Contract Management
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
              Kontrak Baru
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/5 dark:bg-custom-gelap">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Stage */}
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
              {STAGE_FILTER_OPTIONS.map((option) => {
                const active = filter.stage === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFilterChange("stage", option.value)}
                    className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                      active
                        ? "bg-custom-merah-terang text-white shadow-sm"
                        : "text-gray-400 hover:bg-white hover:text-custom-gelap dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative min-w-[260px] flex-1">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={filter.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Cari nomor kontrak / pekerjaan / client..."
                className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 pl-9 pr-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Client */}
            <select
              value={filter.id_client}
              onChange={(e) => handleFilterChange("id_client", e.target.value)}
              className="h-10 w-44 shrink-0 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Semua Client</option>

              {clients.map((client) => (
                <option key={client.id_client} value={client.id_client}>
                  {client.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="h-10 w-44 shrink-0 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetFilter}
              className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gray-100 px-4 text-[9px] font-black uppercase tracking-widest text-custom-gelap transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <MdRefresh size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/5 dark:bg-custom-gelap">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/5">
                  <th className="w-12 px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    #
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("contract_number")}
                  >
                    Nomor Kontrak
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("work_number")}
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
                    onClick={() => handleSort("contract_date")}
                  >
                    Tanggal
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("contract_value")}
                  >
                    Nilai Kontrak
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("start_date")}
                  >
                    Periode
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    PPN
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Status
                  </th>

                  <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-12 text-center">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Tidak ada data kontrak
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedData.map((item, index) => (
                    <tr
                      key={item.id_contract}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-center align-top text-[11px] font-bold text-gray-400">
                        {filter.stage === "CLOSED"
                          ? (pagination.page - 1) * pagination.per_page +
                            index +
                            1
                          : index + 1}
                      </td>

                      {/* Contract Number */}
                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => handleDetail(item)}
                          className="whitespace-nowrap text-[11px] font-black text-custom-merah-terang hover:underline"
                        >
                          {item.contract_number || "-"}
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
                          <span className="mt-2 inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            {item.work_type}
                          </span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3 align-top">
                        <p className="whitespace-nowrap text-[11px] font-black text-custom-gelap dark:text-white">
                          {item.client_pic_name
                            ? `Pak ${item.client_pic_name}`
                            : "-"}
                        </p>

                        <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                          {item.client_name || "-"}
                        </p>

                        {item.client_code && (
                          <p className="mt-0.5 text-[9px] font-bold text-gray-400">
                            {item.client_code}
                          </p>
                        )}
                      </td>

                      {/* Contract Date */}
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.contract_date)}
                        </p>
                      </td>

                      {/* Contract Value */}
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <p className="text-[11px] font-black text-custom-merah-terang">
                          {formatCurrency(item.contract_value)}
                        </p>
                      </td>

                      {/* Period */}
                      <td className="whitespace-nowrap px-4 py-3 align-top">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.start_date)}
                        </p>

                        <p className="my-0.5 text-[9px] font-bold text-gray-400">
                          s/d
                        </p>

                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.end_date)}
                        </p>
                      </td>

                      {/* VAT */}
                      <td className="px-4 py-3 text-center align-top">
                        <span className="inline-flex items-center rounded-lg bg-orange-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                          {item.vat_rate !== null && item.vat_rate !== undefined
                            ? `${item.vat_rate}%`
                            : "-"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center align-top">
                        <span
                          className={`inline-flex items-center whitespace-nowrap rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                            STATUS_BADGES[item.status] ||
                            "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                          }`}
                        >
                          {STATUS_LABELS[item.status] || item.status || "-"}
                        </span>
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
        {filter.stage === "CLOSED" && pagination.total > 0 && (
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
        <ModalCreateContract
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={fetchContracts}
        />
      )}

      {/* Modal Detail */}
      {showDetail && selectedContractId && (
        <ModalDetailContract
          show={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedContractId(null);
          }}
          contractId={selectedContractId}
        />
      )}

      {/* Modal Edit */}
      {showEdit && selectedContractId && (
        <ModalEditContract
          show={showEdit}
          onClose={() => {
            setShowEdit(false);
            setSelectedContractId(null);
          }}
          contractId={selectedContractId}
          onSuccess={fetchContracts}
        />
      )}
    </>
  );
};

export default Contract;
