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
import ModalCreateInvoice from "../components/modals/invoice/ModalCreateInvoice";
import ModalDetailInvoice from "../components/modals/invoice/ModalDetailInvoice";
import ModalEditInvoice from "../components/modals/invoice/ModalEditInvoice";
import ModalCreatePayment from "../components/modals/invoice/ModalCreatePayment";
import ModalDetailPayment from "../components/modals/invoice/ModalDetailPayment";

const STAGE_OPTIONS = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "CLOSED",
    label: "Closed",
  },
];

const HEALTH_STATUS_OPTIONS = [
  {
    value: "",
    label: "Semua Health",
  },
  {
    value: "PAID",
    label: "Paid",
  },
  {
    value: "OVERDUE",
    label: "Overdue",
  },
  {
    value: "DUE_SOON",
    label: "Due Soon",
  },
  {
    value: "ON_TRACK",
    label: "On Track",
  },
];

const PAYMENT_STATUS_OPTIONS = [
  {
    value: "",
    label: "Semua Pembayaran",
  },
  {
    value: "PAID",
    label: "Paid",
  },
  {
    value: "UNPAID",
    label: "Unpaid",
  },
];

const PER_PAGE_OPTIONS = [25, 50, 100];

const WORK_TYPE_BADGES = {
  TENDER: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  MAINTENANCE:
    "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};

const PAYMENT_STATUS_BADGES = {
  BELUM_DIBAYAR: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",

  SEBAGIAN_DIBAYAR:
    "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",

  SUDAH_DIBAYAR:
    "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
};

const PAYMENT_STATUS_LABELS = {
  BELUM_DIBAYAR: "Belum Dibayar",
  SEBAGIAN_DIBAYAR: "Sebagian Dibayar",
  SUDAH_DIBAYAR: "Sudah Dibayar",
};

const HEALTH_STATUS_BADGES = {
  PAID: "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400",
  ON_TRACK:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
  DUE_SOON:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400",
  OVERDUE:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
};

const HEALTH_STATUS_LABELS = {
  PAID: "Paid",
  ON_TRACK: "On Track",
  DUE_SOON: "Due Soon",
  OVERDUE: "Overdue",
};

const WORK_TYPE_LABELS = {
  TENDER: "Tender",
  MAINTENANCE: "Maintenance",
};

const formatFullDate = (date) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  return {
    dayName: parsedDate.toLocaleDateString("id-ID", {
      weekday: "long",
    }),
    date: parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };
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

const formatVatRate = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return `${Number(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  })}%`;
};

const Invoice = () => {
  const [dataInvoice, setDataInvoice] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState(null);
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [showDetailPayment, setShowDetailPayment] = useState(false);

  const [filter, setFilter] = useState({
    stage: "ACTIVE",
    search: "",
    health_status: "",
    id_client: "",
    payment_status: "",
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

  const fetchInvoices = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        stage: filter.stage,
      };

      if (filter.search.trim()) {
        params.search = filter.search.trim();
      }

      if (filter.health_status) {
        params.health_status = filter.health_status;
      }

      if (filter.id_client) {
        params.id_client = Number(filter.id_client);
      }

      if (filter.payment_status) {
        params.payment_status = filter.payment_status;
      }

      // Pagination hanya untuk CLOSED
      if (filter.stage === "CLOSED") {
        params.page = page;
        params.per_page = perPage;
      }

      const response = await Api.get("/work-item/invoice", {
        params,
      });

      if (response.data?.success) {
        const responseData = response.data?.data || {};
        const items = responseData.items || [];
        const pageInfo = responseData.pagination || {};

        setDataInvoice(items);

        if (filter.stage === "CLOSED") {
          setPagination({
            page: pageInfo.page || page,
            per_page: pageInfo.per_page || perPage,
            total: pageInfo.total || 0,
            total_pages: pageInfo.total_pages || 1,
          });
        } else {
          // ACTIVE tidak menggunakan pagination
          setPagination({
            page: 1,
            per_page: items.length,
            total: items.length,
            total_pages: 1,
          });
        }
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil data invoice.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data invoice:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data invoice.",
      );
    } finally {
      setLoading(false);
    }
  }, [filter, page, perPage]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const fetchClientOptions = useCallback(async () => {
    try {
      const response = await Api.get("/work-item/master/clients/options");

      if (response.data?.success) {
        setClientOptions(response.data?.data || []);
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil data client.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil client options:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data client.",
      );
    }
  }, []);

  useEffect(() => {
    fetchClientOptions();
  }, [fetchClientOptions]);

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
      stage: filter.stage,
      search: "",
      health_status: "",
      id_client: "",
      payment_status: "",
    });
  };

  const handleRefresh = () => {
    fetchInvoices();
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
    const data = [...dataInvoice];

    data.sort((a, b) => {
      const { key, direction } = sortConfig;

      let valueA = a[key];
      let valueB = b[key];

      if (
        key === "invoice_date" ||
        key === "due_date" ||
        key === "created_at"
      ) {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();
      } else if (key === "invoice_value" || key === "vat_rate") {
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
  }, [dataInvoice, sortConfig]);

  const handleCreate = () => {
    setShowCreate(true);
  };

  const handleDetail = (item) => {
    setSelectedInvoiceId(item.id_invoice);
    setShowDetail(true);
  };

  const handleEdit = (item) => {
    setSelectedInvoiceId(item.id_invoice);
    setShowEdit(true);
  };

  const handleCreatePayment = (item) => {
    setSelectedPaymentInvoice(item);
    setShowCreatePayment(true);
  };

  const handleDetailPayment = (item) => {
    if (!item.id_payment) {
      SwalHelper.warning("Data payment tidak ditemukan.");
      return;
    }

    setSelectedPaymentId(item.id_payment);
    setShowDetailPayment(true);
  };

  const handleDelete = async (item) => {
    const confirmed = await SwalHelper.confirm({
      title: "Nonaktifkan Invoice?",
      message: `Invoice "${item.invoice_number}" akan dinonaktifkan.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await Api.delete(
        `/work-item/invoice/${item.id_invoice}`,
      );

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Invoice berhasil dinonaktifkan.",
        );
        await fetchInvoices();
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal menonaktifkan invoice.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal menonaktifkan invoice.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceClick = (item) => {
    SwalHelper.info(
      "Detail Invoice",
      `Invoice ${item.invoice_number || "-"} akan membuka detail invoice.`,
    );
  };

  const handleContractClick = (item) => {
    SwalHelper.info(
      "Detail Contract",
      `Contract ${item.contract_number || "-"} akan membuka detail contract.`,
    );
  };

  return (
    <>
      {loading && <LoadingOverlay message="Memuat Invoice..." />}

      <div className="space-y-3 pb-3 font-poppins">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 px-1 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-custom-gelap dark:text-white">
              Invoice
            </h1>

            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
              Invoice Management
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
              Invoice Baru
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-2xl border border-gray-100 bg-white p-3 dark:border-white/5 dark:bg-custom-gelap">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Stage Tabs */}
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
              {STAGE_OPTIONS.map((option) => {
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
                placeholder="Cari invoice, pekerjaan, work item, atau client..."
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

              {clientOptions.map((client) => (
                <option key={client.id_client} value={client.id_client}>
                  {client.name}
                </option>
              ))}
            </select>

            {/* Payment Status */}
            <select
              value={filter.payment_status}
              onChange={(e) =>
                handleFilterChange("payment_status", e.target.value)
              }
              className="h-10 w-40 shrink-0 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Health */}
            <select
              value={filter.health_status}
              onChange={(e) =>
                handleFilterChange("health_status", e.target.value)
              }
              className="h-10 w-36 shrink-0 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {HEALTH_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetFilter}
              title="Reset Filter"
              aria-label="Reset Filter"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-custom-gelap dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <MdRefresh size={17} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/5 dark:bg-custom-gelap">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/5">
                  <th className="w-12 px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    #
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("invoice_number")}
                  >
                    Nomor
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

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Health
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("invoice_date")}
                  >
                    Tanggal
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("due_date")}
                  >
                    Jatuh Tempo
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400"
                    onClick={() => handleSort("invoice_value")}
                  >
                    Nilai Invoice
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Pembayaran
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Payment
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-12 text-center">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Tidak ada data invoice
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedData.map((item, index) => (
                    <tr
                      key={item.id_invoice}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-center align-center text-[11px] font-bold text-gray-400">
                        {(pagination.page - 1) * pagination.per_page +
                          index +
                          1}
                      </td>

                      {/* Invoice & Contract */}
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-2">
                          {/* Invoice Number */}
                          <div>
                            <span className="block text-[7px] font-black uppercase tracking-[1.4px] text-gray-400">
                              No. Invoice
                            </span>

                            <button
                              type="button"
                              onClick={() => handleInvoiceClick(item)}
                              className="mt-0.5 block whitespace-nowrap text-[11px] font-black leading-4 text-custom-merah-terang transition hover:underline"
                            >
                              {item.invoice_number || "-"}
                            </button>
                          </div>

                          {/* Contract Number */}
                          <div>
                            <span className="block text-[7px] font-black uppercase tracking-[1.4px] text-gray-400">
                              No. Contract
                            </span>

                            <button
                              type="button"
                              onClick={() => handleContractClick(item)}
                              className="mt-0.5 block whitespace-nowrap text-[10px] font-bold leading-4 text-custom-gelap transition hover:text-custom-merah-terang hover:underline dark:text-white"
                            >
                              {item.contract_number || "-"}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Work */}
                      <td className="min-w-[320px] max-w-[420px] px-4 py-3 align-center">
                        {/* Work Number + Work Type */}
                        <div className="flex items-center gap-2">
                          <span className="whitespace-nowrap text-[9px] font-bold text-gray-400">
                            {item.work_number || "-"}
                          </span>

                          {item.work_type && (
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${
                                WORK_TYPE_BADGES[item.work_type] ||
                                "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                              }`}
                            >
                              {WORK_TYPE_LABELS[item.work_type] ||
                                item.work_type}
                            </span>
                          )}
                        </div>

                        {/* Work Name */}
                        <p
                          className="mt-1 line-clamp-2 text-[10px] font-black leading-4 text-custom-gelap dark:text-white"
                          title={item.work_name}
                        >
                          {item.work_name || "-"}
                        </p>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3 align-center">
                        <p className="whitespace-nowrap text-[11px] font-black text-custom-gelap dark:text-white whitespace-nowrap">
                          {item.client_pic_name
                            ? `Pak ${item.client_pic_name}`
                            : "-"}
                        </p>

                        <p className="mt-0.5 text-[9px] font-bold text-gray-400 whitespace-nowrap">
                          {item.client_name || "-"}
                        </p>

                        {/* {item.client_code && (
                          <p className="mt-0.5 text-[9px] font-bold text-gray-400 whitespace-nowrap">
                            {item.client_code}
                          </p>
                        )} */}
                      </td>

                      {/* Health */}
                      <td className="min-w-[140px] px-3 py-2 align-top">
                        <div
                          className={`inline-flex min-w-[120px] flex-col rounded-xl border px-3 py-2.5 ${
                            HEALTH_STATUS_BADGES[item.health_status] ||
                            "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
                          }`}
                        >
                          {/* Status */}
                          <span className="text-[8px] font-black uppercase tracking-[1.5px] opacity-75">
                            {HEALTH_STATUS_LABELS[item.health_status] ||
                              item.health_status ||
                              "-"}
                          </span>

                          {/* Main Information */}
                          <p className="mt-0.5 text-[15px] font-black leading-5 tracking-tight">
                            {item.health_status === "PAID"
                              ? "Lunas"
                              : `${Math.abs(Number(item.days_to_due || 0))} Hari`}
                          </p>

                          {/* Description */}
                          <p className="mt-0.5 text-[9px] font-bold leading-3.5 opacity-70">
                            {item.health_status === "PAID"
                              ? "Sudah dibayar"
                              : item.health_status === "OVERDUE"
                                ? "Melewati jatuh tempo"
                                : "Menuju jatuh tempo"}
                          </p>
                        </div>
                      </td>

                      {/* Invoice Date */}
                      <td className="min-w-[135px] px-4 py-3 align-center">
                        {(() => {
                          const date = formatFullDate(item.invoice_date);

                          if (!date) {
                            return (
                              <span className="text-[10px] font-bold text-gray-400">
                                -
                              </span>
                            );
                          }

                          return (
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase tracking-[1.5px] dark:text-white">
                                {date.dayName}
                              </span>

                              <span className="mt-0.5 text-[12px] font-black leading-4 whitespace-nowrap text-custom-gelap dark:text-white">
                                {date.date}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Due Date */}
                      <td className="min-w-[135px] px-4 py-3 align-center">
                        {(() => {
                          const date = formatFullDate(item.due_date);

                          if (!date) {
                            return (
                              <span className="text-[10px] font-bold text-gray-400">
                                -
                              </span>
                            );
                          }

                          return (
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase tracking-[1.5px]  dark:text-white">
                                {date.dayName}
                              </span>

                              <span className="mt-0.5 text-[12px] font-black leading-4 whitespace-nowrap text-custom-merah-terang">
                                {date.date}
                              </span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Invoice Value */}
                      <td className="min-w-[190px] px-4 py-3 align-top">
                        <div className="space-y-1.5">
                          {/* Nilai sebelum pajak */}
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[9px] font-bold text-gray-400">
                              Nilai
                            </span>

                            <span className="text-[10px] font-black text-custom-gelap dark:text-white">
                              {formatCurrency(item.invoice_value)}
                            </span>
                          </div>

                          {/* PPN */}
                          <div className="flex items-center justify-between gap-4">
                            <span className="inline-flex items-center rounded-lg bg-orange-50 px-0.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                              PPN ({formatVatRate(item.vat_rate)})
                            </span>

                            <span className="text-[10px] font-bold text-orange-600 dark:bg-orange-500/10">
                              {formatCurrency(item.vat_amount)}
                            </span>
                          </div>

                          {/* Total */}
                          <div className="mt-1 border-t border-dashed border-gray-200 pt-1.5 dark:border-gray-700">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">
                                Total
                              </span>

                              <span className="text-[11px] font-black text-custom-merah-terang">
                                {formatCurrency(item.total_invoice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                            PAYMENT_STATUS_BADGES[item.payment_status] ||
                            "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                          }`}
                        >
                          {PAYMENT_STATUS_LABELS[item.payment_status] ||
                            item.payment_status ||
                            "-"}
                        </span>

                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-[9px] font-bold text-gray-400">
                            Dibayar:{" "}
                            <span className="font-black text-gray-500 dark:text-gray-300">
                              {formatCurrency(item.paid_amount)}
                            </span>
                          </p>

                          {Number(item.outstanding_amount || 0) > 0 && (
                            <p className="text-[9px] font-bold text-gray-400">
                              Sisa:{" "}
                              <span className="font-black text-red-500">
                                {formatCurrency(item.outstanding_amount)}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Payment Management */}
                      <td className="px-4 py-3 align-top">
                        {item.payment_status === "PAID" ||
                        item.payment_status === "SUDAH_DIBAYAR" ? (
                          <button
                            type="button"
                            onClick={() => handleDetailPayment(item)}
                            className="inline-flex items-center rounded-xl bg-green-50 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-green-600 transition-all hover:bg-green-500 hover:text-white dark:bg-green-500/10 dark:text-green-400"
                          >
                            Detail Payment
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCreatePayment(item)}
                            className="inline-flex items-center rounded-xl bg-custom-merah-terang/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-custom-merah-terang transition-all hover:bg-custom-merah-terang hover:text-white"
                          >
                            Buat Payment
                          </button>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 align-center">
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
        <ModalCreateInvoice
          show={showCreate}
          onClose={() => setShowCreate(false)}
          onSuccess={fetchInvoices}
        />
      )}

      {/* Modal Detail */}
      {showDetail && selectedInvoiceId && (
        <ModalDetailInvoice
          show={showDetail}
          invoiceId={selectedInvoiceId}
          onClose={() => {
            setShowDetail(false);
            setSelectedInvoiceId(null);
          }}
        />
      )}

      {/* Modal Edit */}
      {showEdit && selectedInvoiceId && (
        <ModalEditInvoice
          show={showEdit}
          invoiceId={selectedInvoiceId}
          onClose={() => {
            setShowEdit(false);
            setSelectedInvoiceId(null);
          }}
          onSuccess={fetchInvoices}
        />
      )}

      {/* Modal Create Payment */}
      {showCreatePayment && selectedPaymentInvoice && (
        <ModalCreatePayment
          show={showCreatePayment}
          invoice={selectedPaymentInvoice}
          onClose={() => {
            setShowCreatePayment(false);
            setSelectedPaymentInvoice(null);
          }}
          onSuccess={fetchInvoices}
        />
      )}

      {/* Modal Detail Payment */}
      {showDetailPayment && selectedPaymentId && (
        <ModalDetailPayment
          show={showDetailPayment}
          paymentId={selectedPaymentId}
          onClose={() => {
            setShowDetailPayment(false);
            setSelectedPaymentId(null);
          }}
          onSuccess={fetchInvoices}
        />
      )}
    </>
  );
};

export default Invoice;
