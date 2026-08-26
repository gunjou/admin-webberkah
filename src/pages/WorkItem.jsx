import React, { useMemo, useState } from "react";
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdChevronRight,
  MdBusiness,
  MdCheckCircle,
  MdWarning,
  MdAccessTime,
  MdDescription,
  MdCalendarToday,
  MdClose,
  MdArrowDropDown,
  MdTrendingUp,
  MdWorkOutline,
} from "react-icons/md";

const WorkItem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [healthFilter, setHealthFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================
  // DUMMY DATA
  // =========================================================

  const [workItems] = useState([
    {
      id: 1,
      kode: "WK-2026-001",
      nama: "Instalasi Panel Distribusi Gedung A",
      client: "PT. Energi Nusantara",
      pic: "Budi Santoso",
      stage: "EXECUTION",
      health: "ON TRACK",
      status: "ACTIVE",
      progress: 75,
      contract: "CTR-2026-014",
      startDate: "01 Aug 2026",
      endDate: "15 Sep 2026",
      value: 185000000,
    },
    {
      id: 2,
      kode: "WK-2026-002",
      nama: "Maintenance Electrical System",
      client: "PT. Lombok Engineering",
      pic: "Sinta Dewi",
      stage: "CONTRACT",
      health: "AT RISK",
      status: "ACTIVE",
      progress: 0,
      contract: "-",
      startDate: "20 Aug 2026",
      endDate: "28 Aug 2026",
      value: 75000000,
    },
    {
      id: 3,
      kode: "WK-2026-003",
      nama: "Pengadaan Spare Part Generator",
      client: "PT. Mitra Infrastruktur",
      pic: "Andi Pratama",
      stage: "EXECUTION",
      health: "AT RISK",
      status: "ACTIVE",
      progress: 35,
      contract: "-",
      startDate: "10 Aug 2026",
      endDate: "10 Sep 2026",
      value: 120000000,
    },
    {
      id: 4,
      kode: "WK-2026-004",
      nama: "Upgrade Control Panel",
      client: "CV. Sinar Teknik",
      pic: "Rina Amelia",
      stage: "CONTRACT",
      health: "DELAYED",
      status: "ACTIVE",
      progress: 0,
      contract: "-",
      startDate: "15 Aug 2026",
      endDate: "22 Aug 2026",
      value: 95000000,
    },
    {
      id: 5,
      kode: "WK-2026-005",
      nama: "Maintenance Genset Area Produksi",
      client: "PT. Berkah Power System",
      pic: "Dimas Hadi",
      stage: "EXECUTION",
      health: "ON TRACK",
      status: "ACTIVE",
      progress: 60,
      contract: "CTR-2026-011",
      startDate: "05 Aug 2026",
      endDate: "05 Sep 2026",
      value: 65000000,
    },
    {
      id: 6,
      kode: "WK-2026-006",
      nama: "Pengadaan dan Instalasi UPS",
      client: "PT. Energi Nusantara",
      pic: "Budi Santoso",
      stage: "PROPOSAL",
      health: "ON TRACK",
      status: "ACTIVE",
      progress: 0,
      contract: "-",
      startDate: "25 Aug 2026",
      endDate: "20 Sep 2026",
      value: 210000000,
    },
    {
      id: 7,
      kode: "WK-2026-007",
      nama: "Rewiring Gedung Operasional",
      client: "PT. Lombok Engineering",
      pic: "Sinta Dewi",
      stage: "COMPLETION",
      health: "ON TRACK",
      status: "ACTIVE",
      progress: 95,
      contract: "CTR-2026-008",
      startDate: "01 Jul 2026",
      endDate: "30 Aug 2026",
      value: 145000000,
    },
    {
      id: 8,
      kode: "WK-2026-008",
      nama: "Perawatan Sistem Control",
      client: "PT. Berkah Power System",
      pic: "Dimas Hadi",
      stage: "COMPLETION",
      health: "DELAYED",
      status: "COMPLETED",
      progress: 100,
      contract: "CTR-2026-005",
      startDate: "01 Jun 2026",
      endDate: "15 Aug 2026",
      value: 85000000,
    },
    {
      id: 9,
      kode: "WK-2026-009",
      nama: "Instalasi Sistem Proteksi",
      client: "PT. Energi Nusantara",
      pic: "Budi Santoso",
      stage: "PROPOSAL",
      health: "ON TRACK",
      status: "ACTIVE",
      progress: 0,
      contract: "-",
      startDate: "26 Aug 2026",
      endDate: "30 Sep 2026",
      value: 165000000,
    },
    {
      id: 10,
      kode: "WK-2026-010",
      nama: "Maintenance Trafo Utama",
      client: "PT. Mitra Infrastruktur",
      pic: "Andi Pratama",
      stage: "EXECUTION",
      health: "ON TRACK",
      status: "ACTIVE",
      progress: 50,
      contract: "CTR-2026-018",
      startDate: "12 Aug 2026",
      endDate: "18 Sep 2026",
      value: 135000000,
    },
    {
      id: 11,
      kode: "WK-2026-011",
      nama: "Penggantian Kabel Distribusi",
      client: "CV. Sinar Teknik",
      pic: "Rina Amelia",
      stage: "CONTRACT",
      health: "AT RISK",
      status: "ACTIVE",
      progress: 0,
      contract: "CTR-2026-019",
      startDate: "23 Aug 2026",
      endDate: "12 Sep 2026",
      value: 90000000,
    },
    {
      id: 12,
      kode: "WK-2026-012",
      nama: "Inspection Panel MCC",
      client: "PT. Berkah Power System",
      pic: "Dimas Hadi",
      stage: "COMPLETION",
      health: "ON TRACK",
      status: "COMPLETED",
      progress: 100,
      contract: "CTR-2026-004",
      startDate: "05 Jun 2026",
      endDate: "10 Aug 2026",
      value: 70000000,
    },
  ]);

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return workItems.filter((item) => {
      const matchSearch =
        item.kode.toLowerCase().includes(keyword) ||
        item.nama.toLowerCase().includes(keyword) ||
        item.client.toLowerCase().includes(keyword) ||
        item.pic.toLowerCase().includes(keyword);

      const matchStage = stageFilter === "ALL" || item.stage === stageFilter;

      const matchHealth =
        healthFilter === "ALL" || item.health === healthFilter;

      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchSearch && matchStage && matchHealth && matchStatus;
    });
  }, [workItems, searchTerm, stageFilter, healthFilter, statusFilter]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalWork = workItems.length;

  const activeWork = workItems.filter(
    (item) => item.status === "ACTIVE",
  ).length;

  const atRiskWork = workItems.filter(
    (item) => item.health === "AT RISK",
  ).length;

  const delayedWork = workItems.filter(
    (item) => item.health === "DELAYED",
  ).length;

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetFilter = () => {
    setStageFilter("ALL");
    setHealthFilter("ALL");
    setStatusFilter("ALL");
  };

  // =========================================================
  // HEALTH STYLE
  // =========================================================

  const getHealthStyle = (health) => {
    switch (health) {
      case "ON TRACK":
        return {
          className:
            "bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100 dark:border-green-500/20",
          icon: <MdCheckCircle size={12} />,
        };

      case "AT RISK":
        return {
          className:
            "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 border-yellow-100 dark:border-yellow-500/20",
          icon: <MdWarning size={12} />,
        };

      case "DELAYED":
        return {
          className:
            "bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/20",
          icon: <MdAccessTime size={12} />,
        };

      default:
        return {
          className:
            "bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10",
          icon: null,
        };
    }
  };

  // =========================================================
  // STAGE STYLE
  // =========================================================

  const getStageStyle = (stage) => {
    switch (stage) {
      case "PROPOSAL":
        return "bg-blue-50 dark:bg-blue-500/10 text-blue-600";

      case "CONTRACT":
        return "bg-purple-50 dark:bg-purple-500/10 text-purple-600";

      case "EXECUTION":
        return "bg-custom-merah-terang/10 text-custom-merah-terang";

      case "COMPLETION":
        return "bg-green-50 dark:bg-green-500/10 text-green-600";

      default:
        return "bg-gray-50 dark:bg-white/5 text-gray-500";
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Pekerjaan
          </h1>

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[3px] mt-1">
            Work Item Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* SEARCH */}

          <div className="relative w-[280px] lg:w-[340px]">
            <MdSearch
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pekerjaan, client, PIC..."
              className="w-full h-11 pl-10 pr-4 bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 rounded-xl text-[10px] text-gray-700 dark:text-white outline-none focus:border-custom-merah-terang/50 shadow-sm transition-all"
            />
          </div>

          {/* REFRESH */}

          <button
            onClick={handleRefresh}
            className="h-11 w-11 flex items-center justify-center bg-white dark:bg-custom-gelap text-gray-400 rounded-xl border border-gray-100 dark:border-white/10 hover:text-custom-merah-terang transition-all shadow-sm"
            title="Refresh"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>

          {/* ADD */}

          <button className="h-11 flex items-center gap-2 px-5 bg-custom-merah-terang text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-[1.02] transition-all whitespace-nowrap">
            <MdAdd size={18} />
            Tambah Pekerjaan
          </button>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5 flex-shrink-0">
        {/* TOTAL WORK */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-custom-merah-terang/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-custom-merah-terang" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Total Work Item
                </p>
              </div>

              <p className="text-3xl font-black text-custom-gelap dark:text-white mt-3">
                {totalWork}
              </p>

              <div className="flex items-center gap-1.5 mt-2">
                <MdTrendingUp size={13} className="text-custom-merah-terang" />

                <span className="text-[8px] font-bold text-gray-400">
                  Seluruh pekerjaan terdaftar
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
              <MdWorkOutline size={24} />
            </div>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-green-500/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Active
                </p>
              </div>

              <p className="text-3xl font-black text-custom-gelap dark:text-white mt-3">
                {activeWork}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Sedang berjalan
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center justify-center">
              <MdCheckCircle size={24} />
            </div>
          </div>
        </div>

        {/* AT RISK */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-yellow-500/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  At Risk
                </p>
              </div>

              <p className="text-3xl font-black text-yellow-600 mt-3">
                {atRiskWork}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Membutuhkan perhatian
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
              <MdWarning size={24} />
            </div>
          </div>
        </div>

        {/* DELAYED */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-red-500/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Delayed
                </p>
              </div>

              <p className="text-3xl font-black text-red-600 mt-3">
                {delayedWork}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Melewati target
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
              <MdAccessTime size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE SECTION
      ====================================================== */}

      <div className="flex-1 min-h-0 bg-white dark:bg-custom-gelap rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {/* TABLE TOOLBAR */}

        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                Daftar Pekerjaan
              </h2>

              <p className="text-[8px] text-gray-400 mt-1">
                Menampilkan {filteredData.length} dari {workItems.length}{" "}
                pekerjaan
              </p>
            </div>

            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                showFilter
                  ? "bg-custom-merah-terang text-white"
                  : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-300"
              }`}
            >
              <MdFilterList size={16} />
              Filter
            </button>
          </div>

          {/* FILTER PANEL */}

          {showFilter && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              {/* STAGE */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Stage
                </label>

                <div className="relative">
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Stage</option>

                    <option value="PROPOSAL">Proposal</option>

                    <option value="CONTRACT">Contract</option>

                    <option value="EXECUTION">Execution</option>

                    <option value="COMPLETION">Completion</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* HEALTH */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Health
                </label>

                <div className="relative">
                  <select
                    value={healthFilter}
                    onChange={(e) => setHealthFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Health</option>

                    <option value="ON TRACK">On Track</option>

                    <option value="AT RISK">At Risk</option>

                    <option value="DELAYED">Delayed</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* STATUS */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Status
                </label>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Status</option>

                    <option value="ACTIVE">Active</option>

                    <option value="COMPLETED">Completed</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* RESET */}

              <div className="sm:col-span-3 flex justify-end">
                <button
                  onClick={resetFilter}
                  className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-custom-merah-terang transition-colors"
                >
                  <MdClose size={14} />
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            SCROLLABLE TABLE
        ==================================================== */}

        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full min-w-[1100px] text-left border-collapse">
            {/* STICKY HEADER */}

            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[8px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                <th className="px-5 py-4 sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Pekerjaan
                </th>

                <th className="px-5 py-4 sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Client
                </th>

                <th className="px-5 py-4 sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Stage
                </th>

                <th className="px-5 py-4 sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Progress
                </th>

                <th className="px-5 py-4 sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Health
                </th>

                <th className="px-5 py-4 sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Contract
                </th>

                <th className="px-5 py-4 sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Deadline
                </th>

                <th className="px-5 py-4 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39]">
                  Opsi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-custom-merah-terang border-t-transparent rounded-full animate-spin" />

                      <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-3">
                        Memuat Data
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 flex items-center justify-center">
                        <MdBusiness size={28} />
                      </div>

                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">
                        Data Tidak Ditemukan
                      </p>

                      <p className="text-[8px] text-gray-400 mt-1">
                        Tidak ada pekerjaan yang sesuai.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((work) => {
                  const health = getHealthStyle(work.health);

                  return (
                    <tr
                      key={work.id}
                      className="group hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* WORK */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center flex-shrink-0">
                            <MdBusiness size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                              {work.nama}
                            </p>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[7px] font-black text-custom-merah-terang uppercase tracking-wider">
                                {work.kode}
                              </span>

                              <span className="text-gray-300 dark:text-gray-600">
                                •
                              </span>

                              <span className="text-[7px] text-gray-400">
                                PIC: {work.pic}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CLIENT */}

                      <td className="px-5 py-5">
                        <p className="text-[9px] font-bold text-gray-600 dark:text-gray-300">
                          {work.client}
                        </p>

                        <p className="text-[8px] text-gray-400 mt-1">
                          {formatCurrency(work.value)}
                        </p>
                      </td>

                      {/* STAGE */}

                      <td className="px-5 py-5">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[7px] font-black uppercase tracking-wider ${getStageStyle(
                            work.stage,
                          )}`}
                        >
                          {work.stage}
                        </span>
                      </td>

                      {/* PROGRESS */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-custom-merah-terang rounded-full"
                              style={{
                                width: `${work.progress}%`,
                              }}
                            />
                          </div>

                          <span className="text-[8px] font-black text-gray-400">
                            {work.progress}%
                          </span>
                        </div>
                      </td>

                      {/* HEALTH */}

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[7px] font-black uppercase tracking-wider ${health.className}`}
                        >
                          {health.icon}
                          {work.health}
                        </span>
                      </td>

                      {/* CONTRACT */}

                      <td className="px-5 py-5">
                        {work.contract !== "-" ? (
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-300">
                            <MdDescription
                              size={14}
                              className="text-custom-cerah"
                            />

                            <span className="text-[8px] font-bold">
                              {work.contract}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 text-[7px] font-black uppercase tracking-wider">
                            Belum Ada
                          </span>
                        )}
                      </td>

                      {/* DEADLINE */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-1.5">
                          <MdCalendarToday
                            size={13}
                            className={
                              work.health === "DELAYED"
                                ? "text-red-500"
                                : "text-gray-400"
                            }
                          />

                          <span className="text-[8px] font-bold text-gray-500 dark:text-gray-300 whitespace-nowrap">
                            {work.endDate}
                          </span>
                        </div>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-5 text-center">
                        <button
                          className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-custom-merah-terang hover:text-white transition-all"
                          title="Lihat Detail"
                        >
                          <MdChevronRight size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}

        <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-[8px] font-bold text-gray-400">
            {filteredData.length} pekerjaan ditampilkan
          </p>

          <p className="text-[8px] font-bold text-gray-400">
            Scroll untuk melihat data lainnya
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkItem;
