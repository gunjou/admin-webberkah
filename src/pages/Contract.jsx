import React, { useMemo, useState } from "react";
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdChevronRight,
  MdDescription,
  MdBusiness,
  MdCheckCircle,
  MdWarning,
  MdAccessTime,
  MdCalendarToday,
  MdClose,
  MdArrowDropDown,
  MdTrendingUp,
  MdCloudDone,
  MdErrorOutline,
} from "react-icons/md";

const Contract = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("ALL");

  const [showFilter, setShowFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================
  // DUMMY DATA
  // =========================================================

  const [contracts] = useState([
    {
      id: 1,
      nomor: "CTR-2026-014",
      pekerjaan: "Instalasi Panel Distribusi Gedung A",
      kodePekerjaan: "WK-2026-001",
      client: "PT. Energi Nusantara",
      pic: "Budi Santoso",
      nilai: 185000000,
      tanggalMulai: "01 Aug 2026",
      tanggalSelesai: "15 Sep 2026",
      status: "ACTIVE",
      period: "NORMAL",
      document: true,
    },
    {
      id: 2,
      nomor: "CTR-2026-011",
      pekerjaan: "Maintenance Genset Area Produksi",
      kodePekerjaan: "WK-2026-005",
      client: "PT. Berkah Power System",
      pic: "Dimas Hadi",
      nilai: 65000000,
      tanggalMulai: "05 Aug 2026",
      tanggalSelesai: "05 Sep 2026",
      status: "ACTIVE",
      period: "NORMAL",
      document: true,
    },
    {
      id: 3,
      nomor: "CTR-2026-008",
      pekerjaan: "Rewiring Gedung Operasional",
      kodePekerjaan: "WK-2026-007",
      client: "PT. Lombok Engineering",
      pic: "Sinta Dewi",
      nilai: 145000000,
      tanggalMulai: "01 Jul 2026",
      tanggalSelesai: "30 Aug 2026",
      status: "ACTIVE",
      period: "EXPIRING",
      document: true,
    },
    {
      id: 4,
      nomor: "CTR-2026-005",
      pekerjaan: "Perawatan Sistem Control",
      kodePekerjaan: "WK-2026-008",
      client: "PT. Berkah Power System",
      pic: "Dimas Hadi",
      nilai: 85000000,
      tanggalMulai: "01 Jun 2026",
      tanggalSelesai: "15 Aug 2026",
      status: "EXPIRED",
      period: "EXPIRED",
      document: true,
    },
    {
      id: 5,
      nomor: "CTR-2026-018",
      pekerjaan: "Maintenance Trafo Utama",
      kodePekerjaan: "WK-2026-010",
      client: "PT. Mitra Infrastruktur",
      pic: "Andi Pratama",
      nilai: 135000000,
      tanggalMulai: "12 Aug 2026",
      tanggalSelesai: "18 Sep 2026",
      status: "ACTIVE",
      period: "NORMAL",
      document: true,
    },
    {
      id: 6,
      nomor: "CTR-2026-019",
      pekerjaan: "Penggantian Kabel Distribusi",
      kodePekerjaan: "WK-2026-011",
      client: "CV. Sinar Teknik",
      pic: "Rina Amelia",
      nilai: 90000000,
      tanggalMulai: "23 Aug 2026",
      tanggalSelesai: "12 Sep 2026",
      status: "DRAFT",
      period: "NORMAL",
      document: false,
    },
    {
      id: 7,
      nomor: "CTR-2026-004",
      pekerjaan: "Inspection Panel MCC",
      kodePekerjaan: "WK-2026-012",
      client: "PT. Berkah Power System",
      pic: "Dimas Hadi",
      nilai: 70000000,
      tanggalMulai: "05 Jun 2026",
      tanggalSelesai: "10 Aug 2026",
      status: "COMPLETED",
      period: "EXPIRED",
      document: true,
    },
    {
      id: 8,
      nomor: "CTR-2026-021",
      pekerjaan: "Instalasi Sistem Proteksi",
      kodePekerjaan: "WK-2026-009",
      client: "PT. Energi Nusantara",
      pic: "Budi Santoso",
      nilai: 165000000,
      tanggalMulai: "26 Aug 2026",
      tanggalSelesai: "30 Sep 2026",
      status: "DRAFT",
      period: "NORMAL",
      document: false,
    },
    {
      id: 9,
      nomor: "CTR-2026-022",
      pekerjaan: "Upgrade Sistem Distribusi",
      kodePekerjaan: "WK-2026-013",
      client: "PT. Lombok Engineering",
      pic: "Sinta Dewi",
      nilai: 210000000,
      tanggalMulai: "20 Aug 2026",
      tanggalSelesai: "20 Oct 2026",
      status: "ACTIVE",
      period: "NORMAL",
      document: true,
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

    return contracts.filter((contract) => {
      const matchSearch =
        contract.nomor.toLowerCase().includes(keyword) ||
        contract.pekerjaan.toLowerCase().includes(keyword) ||
        contract.client.toLowerCase().includes(keyword) ||
        contract.pic.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "ALL" || contract.status === statusFilter;

      const matchPeriod =
        periodFilter === "ALL" || contract.period === periodFilter;

      return matchSearch && matchStatus && matchPeriod;
    });
  }, [contracts, searchTerm, statusFilter, periodFilter]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalContract = contracts.length;

  const activeContract = contracts.filter(
    (item) => item.status === "ACTIVE",
  ).length;

  const expiringContract = contracts.filter(
    (item) => item.period === "EXPIRING",
  ).length;

  const expiredContract = contracts.filter(
    (item) => item.status === "EXPIRED",
  ).length;

  // =========================================================
  // TOTAL CONTRACT VALUE
  // =========================================================

  const totalValue = contracts.reduce((total, item) => total + item.nilai, 0);

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
  // RESET FILTER
  // =========================================================

  const resetFilter = () => {
    setStatusFilter("ALL");
    setPeriodFilter("ALL");
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          className:
            "bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100 dark:border-green-500/20",
          icon: <MdCheckCircle size={12} />,
        };

      case "DRAFT":
        return {
          className:
            "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20",
          icon: <MdDescription size={12} />,
        };

      case "COMPLETED":
        return {
          className:
            "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-white/10",
          icon: <MdCloudDone size={12} />,
        };

      case "EXPIRED":
        return {
          className:
            "bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/20",
          icon: <MdErrorOutline size={12} />,
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
  // PERIOD STYLE
  // =========================================================

  const getPeriodStyle = (period) => {
    switch (period) {
      case "EXPIRING":
        return {
          className: "text-yellow-600",
          label: "Segera Berakhir",
        };

      case "EXPIRED":
        return {
          className: "text-red-600",
          label: "Berakhir",
        };

      default:
        return {
          className: "text-gray-400",
          label: "Normal",
        };
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Contract
          </h1>

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[3px] mt-1">
            Contract Management
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
              placeholder="Cari contract, pekerjaan, client..."
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
            Tambah Contract
          </button>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5 flex-shrink-0">
        {/* TOTAL CONTRACT */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-custom-merah-terang/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-custom-merah-terang" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Total Contract
                </p>
              </div>

              <p className="text-3xl font-black text-custom-gelap dark:text-white mt-3">
                {totalContract}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Seluruh kontrak terdaftar
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
              <MdDescription size={24} />
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

              <p className="text-3xl font-black text-green-600 mt-3">
                {activeContract}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Kontrak sedang berjalan
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center justify-center">
              <MdCheckCircle size={24} />
            </div>
          </div>
        </div>

        {/* EXPIRING */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-yellow-500/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Expiring Soon
                </p>
              </div>

              <p className="text-3xl font-black text-yellow-600 mt-3">
                {expiringContract}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Perlu diperhatikan
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
              <MdAccessTime size={24} />
            </div>
          </div>
        </div>

        {/* TOTAL VALUE */}

        <div className="relative overflow-hidden bg-custom-gelap dark:bg-[#3d2e39] rounded-[28px] border border-custom-gelap dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-custom-cerah" />

                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                  Contract Value
                </p>
              </div>

              <p className="text-xl font-black text-white mt-4 leading-tight">
                {formatCurrency(totalValue)}
              </p>

              <p className="text-[8px] font-bold text-white/40 mt-2">
                Total nilai kontrak
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/10 text-custom-cerah flex items-center justify-center">
              <MdTrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE CONTAINER
      ====================================================== */}

      <div className="flex-1 min-h-0 bg-white dark:bg-custom-gelap rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {/* TABLE HEADER */}

        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                Daftar Contract
              </h2>

              <p className="text-[8px] text-gray-400 mt-1">
                Menampilkan {filteredData.length} dari {contracts.length}{" "}
                contract
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

          {/* FILTER */}

          {showFilter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              {/* STATUS */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Status Contract
                </label>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Status</option>

                    <option value="DRAFT">Draft</option>

                    <option value="ACTIVE">Active</option>

                    <option value="COMPLETED">Completed</option>

                    <option value="EXPIRED">Expired</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* PERIOD */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Masa Berlaku
                </label>

                <div className="relative">
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Periode</option>

                    <option value="NORMAL">Normal</option>

                    <option value="EXPIRING">Segera Berakhir</option>

                    <option value="EXPIRED">Berakhir</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* RESET */}

              <div className="sm:col-span-2 flex justify-end">
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
          <table className="w-full min-w-[1150px] text-left border-collapse">
            {/* STICKY HEADER */}

            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[8px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Contract
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Pekerjaan
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Client
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Nilai
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Periode
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Status
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Dokumen
                </th>

                <th className="px-5 py-4 text-center bg-gray-50 dark:bg-[#3d2e39]">
                  Opsi
                </th>
              </tr>
            </thead>

            {/* BODY */}

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
                        <MdDescription size={28} />
                      </div>

                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">
                        Contract Tidak Ditemukan
                      </p>

                      <p className="text-[8px] text-gray-400 mt-1">
                        Tidak ada contract yang sesuai.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((contract) => {
                  const status = getStatusStyle(contract.status);

                  const period = getPeriodStyle(contract.period);

                  return (
                    <tr
                      key={contract.id}
                      className="group hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* CONTRACT */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center flex-shrink-0">
                            <MdDescription size={19} />
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                              {contract.nomor}
                            </p>

                            <p className="text-[7px] text-gray-400 mt-1">
                              PIC: {contract.pic}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PEKERJAAN */}

                      <td className="px-5 py-5 min-w-[250px]">
                        <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                          {contract.pekerjaan}
                        </p>

                        <p className="text-[7px] text-custom-merah-terang font-black uppercase tracking-wider mt-1">
                          {contract.kodePekerjaan}
                        </p>
                      </td>

                      {/* CLIENT */}

                      <td className="px-5 py-5 min-w-[190px]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center">
                            <MdBusiness size={14} />
                          </div>

                          <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300">
                            {contract.client}
                          </span>
                        </div>
                      </td>

                      {/* VALUE */}

                      <td className="px-5 py-5">
                        <p className="text-[9px] font-black text-custom-gelap dark:text-white whitespace-nowrap">
                          {formatCurrency(contract.nilai)}
                        </p>
                      </td>

                      {/* PERIOD */}

                      <td className="px-5 py-5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <MdCalendarToday
                              size={12}
                              className={period.className}
                            />

                            <span
                              className={`text-[8px] font-black ${period.className}`}
                            >
                              {period.label}
                            </span>
                          </div>

                          <p className="text-[7px] text-gray-400 mt-1 ml-4">
                            {contract.tanggalMulai}
                            {" - "}
                            {contract.tanggalSelesai}
                          </p>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[7px] font-black uppercase tracking-wider ${status.className}`}
                        >
                          {status.icon}
                          {contract.status}
                        </span>
                      </td>

                      {/* DOCUMENT */}

                      <td className="px-5 py-5">
                        {contract.document ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600 text-[8px] font-black uppercase tracking-wider">
                            <MdCheckCircle size={13} />
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-yellow-600 text-[8px] font-black uppercase tracking-wider">
                            <MdWarning size={13} />
                            Belum Ada
                          </span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-5 text-center">
                        <button
                          className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-custom-merah-terang hover:text-white transition-all"
                          title="Lihat Detail Contract"
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
            {filteredData.length} contract ditampilkan
          </p>

          <p className="text-[8px] font-bold text-gray-400">
            Scroll untuk melihat data lainnya
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contract;
