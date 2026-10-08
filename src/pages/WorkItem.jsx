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
  MdLockOpen,
  MdLock,
} from "react-icons/md";
import ModalCreateWorkItem from "../components/modals/work-item/ModalCreateWorkItem";
import ModalDetailWorkItem from "../components/modals/work-item/ModalDetailWorkItem";
import ModalEditWorkItem from "../components/modals/work-item/ModalEditWorkItem";
import ModalUpdateProgress from "../components/modals/work-item/ModalUpdateProgress";

const STAGE_FILTER_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
];

const WORK_TYPE_OPTIONS = [
  { value: "", label: "Semua Work Type" },
  { value: "TENDER", label: "Tender" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const STAGE_OPTIONS = [
  { value: "", label: "Semua Stage" },
  { value: "IDENTIFIED", label: "Identified" },
  { value: "QUOTATION", label: "Quotation" },
  { value: "CONTRACT", label: "Contract" },
  { value: "BA", label: "BA" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PAYMENT", label: "Payment" },
  // { value: "CLOSED", label: "Closed" },
];

const PER_PAGE_OPTIONS = [25, 50, 100];

const WorkItem = () => {
  const [dataWorkItem, setDataWorkItem] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedWorkItemName, setSelectedWorkItemName] = useState("");
  const [selectedWorkItemProgress, setSelectedWorkItemProgress] = useState(0);
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);

  const [filter, setFilter] = useState({
    stage: "ACTIVE",
    search: "",
    work_type: "",
    current_stage: "",
    id_client: "",
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

  const fetchClients = useCallback(async () => {
    try {
      const response = await Api.get("/work-item/master/clients/options");

      if (response.data.success) {
        setClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data client:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data client.",
      );
    }
  }, []);

  const fetchWorkItems = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        stage: filter.stage,
      };

      if (filter.search.trim()) {
        params.search = filter.search.trim();
      }

      if (filter.work_type) {
        params.work_type = filter.work_type;
      }

      if (filter.current_stage) {
        params.current_stage = filter.current_stage;
      }

      if (filter.id_client) {
        params.id_client = Number(filter.id_client);
      }

      // Pagination hanya digunakan untuk CLOSED
      if (filter.stage === "CLOSED") {
        params.page = page;
        params.per_page = perPage;
      }

      const response = await Api.get("/work-item/work", { params });

      if (response.data?.success) {
        const responseData = response.data?.data || {};
        const items = responseData.items || [];

        setDataWorkItem(items);

        if (filter.stage === "CLOSED") {
          const pageInfo = responseData.pagination || {};

          setPagination({
            page: pageInfo.page || page,
            per_page: pageInfo.per_page || perPage,
            total: pageInfo.total || 0,
            total_pages: pageInfo.total_pages || 1,
          });
        } else {
          // ACTIVE tidak memiliki pagination
          setPagination({
            page: 1,
            per_page: items.length,
            total: items.length,
            total_pages: 1,
          });
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data work item:", error);

      SwalHelper.error(
        error.response?.data?.message || "Gagal mengambil data work item.",
      );
    } finally {
      setLoading(false);
    }
  }, [filter, page, perPage]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

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
      work_type: "",
      current_stage: "",
      id_client: "",
    }));
  };

  const handleRefresh = () => {
    fetchWorkItems();
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

  const displayedData = [...dataWorkItem].sort((a, b) => {
    const { key, direction } = sortConfig;

    let valueA = a[key];
    let valueB = b[key];

    if (
      key === "created_at" ||
      key === "start_date" ||
      key === "target_end_date"
    ) {
      valueA = new Date(valueA || 0).getTime();
      valueB = new Date(valueB || 0).getTime();
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
    setSelectedWorkItemId(item.id_work_item);
    setShowDetail(true);
  };

  const handleEdit = (item) => {
    setSelectedWorkItemId(item.id_work_item);
    setShowEdit(true);
  };

  const handleUpdateProgress = (item) => {
    setSelectedWorkItemId(item.id_work_item);
    setSelectedWorkItemName(`${item.work_number} - ${item.work_name}` ?? "");
    setSelectedWorkItemProgress(item.progress_percent ?? 0);
    setShowUpdateProgress(true);
  };

  const handleDelete = async (item) => {
    const confirmed = await SwalHelper.confirm({
      title: "Nonaktifkan Pekerjaan?",
      message: `Pekerjaan "${item.work_number} - ${item.work_name}" akan dinonaktifkan.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await Api.delete(`/work-item/work/${item.id_work_item}`);

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Pekerjaan berhasil dinonaktifkan.",
        );
        await fetchWorkItems();
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal menonaktifkan pekerjaan.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal menonaktifkan pekerjaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (item) => {
    if (item.current_stage !== "PAYMENT") {
      SwalHelper.warning(
        "Work Item hanya dapat ditutup ketika berada pada stage Payment.",
      );
      return;
    }

    const confirmed = await SwalHelper.confirm({
      title: "Tutup Pekerjaan?",
      message: `Pekerjaan "${item.work_number} - ${item.work_name}" akan ditutup dan stage akan berubah menjadi Closed.`,
      confirmText: "Ya, Tutup Pekerjaan",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await Api.post(
        `/work-item/work/${item.id_work_item}/close`,
      );

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Pekerjaan berhasil ditutup.",
        );

        await fetchWorkItems();
      } else {
        SwalHelper.error(response.data?.message || "Gagal menutup pekerjaan.");
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message || "Gagal menutup pekerjaan.",
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

  const formatStage = (stage) => {
    if (!stage) return "-";

    return stage.replaceAll("_", " ");
  };

  const getStageClass = (stage) => {
    const classes = {
      IDENTIFIED:
        "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      QUOTATION:
        "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
      CONTRACT:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
      IN_PROGRESS:
        "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
      COMPLETED:
        "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      BA: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
      INVOICE:
        "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
      PAYMENT:
        "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
      CLOSED: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
    };

    return (
      classes[stage] ||
      "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
    );
  };

  const getWorkTypeClass = (workType) => {
    if (workType === "TENDER") {
      return "bg-custom-merah-terang/10 text-custom-merah-terang dark:text-custom-cerah";
    }

    return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
  };

  return (
    <>
      {loading && <LoadingOverlay message="Memuat Work Item..." />}

      <div className="space-y-3 pb-3 font-poppins">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
          <div>
            <h1 className="text-xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
              Work Item
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
              Work Item Management
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
              Work Item Baru
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Active / Closed */}
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
                placeholder="Cari nomor / nama work item..."
                className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 pl-9 pr-3 text-[10px] font-bold text-custom-gelap outline-none placeholder:text-gray-400 focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Work Type */}
            <select
              value={filter.work_type}
              onChange={(e) => handleFilterChange("work_type", e.target.value)}
              className="h-10 w-44 shrink-0 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Current Stage */}
            <select
              value={filter.current_stage}
              onChange={(e) =>
                handleFilterChange("current_stage", e.target.value)
              }
              disabled={filter.stage === "CLOSED"}
              className={`h-10 w-44 shrink-0 rounded-xl border px-3 text-[10px] font-black outline-none ${
                filter.stage === "CLOSED"
                  ? "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400 dark:border-white/5 dark:bg-white/5 dark:text-gray-600"
                  : "cursor-pointer border-gray-100 bg-gray-50 text-custom-gelap focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              {STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Client */}
            <select
              value={filter.id_client}
              onChange={(e) => handleFilterChange("id_client", e.target.value)}
              className="h-10 w-52 shrink-0 cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 text-[10px] font-black text-custom-gelap outline-none focus:border-custom-merah-terang dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Semua Client</option>

              {clients.map((client) => (
                <option key={client.id_client} value={client.id_client}>
                  {client.client_code
                    ? `${client.client_code} - ${client.name}`
                    : client.name}
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

        <div className="bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <th className="w-12 px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("work_number")}
                  >
                    Work Number
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider cursor-pointer">
                    Work Item
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Client-PIC
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    PIC
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Type
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Target
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Close
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {displayedData.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-4 py-12 text-center">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        Tidak ada data work item
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedData.map((item, index) => (
                    <tr
                      key={item.id_work_item}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-[11px] font-bold text-gray-400">
                        {filter.stage === "CLOSED"
                          ? (pagination.page - 1) * pagination.per_page +
                            index +
                            1
                          : index + 1}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <button
                          type="button"
                          onClick={() => handleDetail(item.id_work_item)}
                          className="text-[11px] font-black text-custom-merah-terang hover:underline whitespace-nowrap"
                        >
                          {item.work_number}
                        </button>
                        <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                          {formatDate(item.created_at)}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top min-w-[320px] max-w-[420px]">
                        <p className="text-[11px] line-clamp-2 font-black text-custom-gelap dark:text-white leading-relaxed">
                          {item.work_name || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="text-[11px] font-black text-custom-gelap dark:text-white whitespace-nowrap">
                          Pak {item.client_pic_name || "-"}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold mt-0.5 whitespace-nowrap">
                          {item.client_name || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <p className="text-[11px] font-black text-custom-gelap dark:text-white whitespace-nowrap">
                          {item.internal_pic_name || "-"}
                        </p>
                        {/* <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                          Client: {item.client_pic_name || "-"}
                        </p> */}
                      </td>

                      <td className="px-4 py-3 text-center align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getWorkTypeClass(item.work_type)}`}
                        >
                          {item.work_type || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${getStageClass(item.current_stage)}`}
                        >
                          {formatStage(item.current_stage)}
                        </span>
                      </td>

                      <td className="min-w-[150px] px-4 py-3 align-top">
                        <div className="space-y-2">
                          {/* Progress + Edit */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-custom-gelap dark:text-white">
                                {item.progress_percent ?? 0}%
                              </span>

                              <span className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                                Progress
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleUpdateProgress(item)}
                              className="inline-flex h-7 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-[9px] font-bold text-gray-500 transition hover:border-custom-merah-terang hover:bg-red-50 hover:text-custom-merah-terang dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 dark:hover:border-custom-merah-terang dark:hover:bg-custom-merah-terang/10"
                              title="Update Progress"
                            >
                              <MdEdit size={13} />
                            </button>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-custom-merah-terang transition-all duration-300"
                              style={{
                                width: `${Math.min(Math.max(item.progress_percent ?? 0, 0), 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {formatDate(item.target_end_date)}
                        </p>
                        {item.completion_date && (
                          <p className="text-[9px] text-green-500 font-bold mt-0.5">
                            Selesai: {formatDate(item.completion_date)}
                          </p>
                        )}
                      </td>

                      {/* Close Management */}
                      <td className="px-4 py-3 align-top text-center">
                        {item.current_stage === "CLOSED" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:border-gray-700 dark:bg-white/10 dark:text-gray-400">
                            <MdLock size={14} />
                            Closed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleClose(item)}
                            disabled={
                              item.current_stage !== "PAYMENT" || loading
                            }
                            title={
                              item.current_stage === "PAYMENT"
                                ? "Close Work Item"
                                : "Close hanya tersedia pada stage Payment"
                            }
                            className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                              item.current_stage === "PAYMENT"
                                ? "border-green-500 bg-green-500 text-white shadow-sm shadow-green-200 hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-md hover:shadow-green-200 dark:border-green-500 dark:bg-green-500 dark:shadow-none dark:hover:bg-green-400"
                                : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60 dark:border-gray-700 dark:bg-white/5 dark:text-gray-500"
                            }`}
                          >
                            <MdLockOpen size={14} />
                            Close Work
                          </button>
                        )}
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

        {filter.stage === "CLOSED" && pagination.total > 0 && (
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
                          className={`flex items-center justify-center h-8 min-w-8 px-2 rounded-xl text-[10px] font-black transition-all ${page === pageNumber ? "bg-custom-merah-terang text-white shadow-md shadow-custom-merah-terang/20" : "bg-gray-100 dark:bg-white/5 text-custom-gelap dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"} disabled:cursor-not-allowed`}
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
        <ModalCreateWorkItem
          onClose={() => setShowCreate(false)}
          onSuccess={fetchWorkItems}
        />
      )}

      {/* Modal Detail */}
      {showDetail && selectedWorkItemId && (
        <ModalDetailWorkItem
          idWorkItem={selectedWorkItemId}
          onClose={() => {
            setShowDetail(false);
            setSelectedWorkItemId(null);
          }}
        />
      )}

      {/* Modal Edit */}
      {showEdit && selectedWorkItemId && (
        <ModalEditWorkItem
          idWorkItem={selectedWorkItemId}
          onClose={() => {
            setShowEdit(false);
            setSelectedWorkItemId(null);
          }}
          onSuccess={fetchWorkItems}
        />
      )}

      {showUpdateProgress && selectedWorkItemId && (
        <ModalUpdateProgress
          show={showUpdateProgress}
          workItemId={selectedWorkItemId}
          workItemName={selectedWorkItemName}
          currentProgress={selectedWorkItemProgress}
          onClose={() => {
            setShowUpdateProgress(false);
            setSelectedWorkItemId(null);
            setSelectedWorkItemProgress(0);
          }}
          onSuccess={fetchWorkItems}
        />
      )}
    </>
  );
};

export default WorkItem;
