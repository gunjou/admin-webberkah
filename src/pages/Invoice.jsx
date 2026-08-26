import React, { useMemo, useState } from "react";
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdChevronRight,
  MdReceiptLong,
  MdBusiness,
  MdDescription,
  MdCalendarToday,
  MdCheckCircle,
  MdWarning,
  MdAccessTime,
  MdPayments,
  MdClose,
  MdArrowDropDown,
  MdErrorOutline,
  MdSchedule,
} from "react-icons/md";

const Invoice = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");

  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("ALL");

  const [agingFilter, setAgingFilter] = useState("ALL");

  const [periodFilter, setPeriodFilter] = useState("ALL");

  const [showFilter, setShowFilter] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // =========================================================
  // DUMMY DATA
  // =========================================================

  const [invoices] = useState([
    {
      id: 1,
      nomor: "INV-2026-0018",
      client: "PT. Energi Nusantara",
      pekerjaan: "Instalasi Panel Distribusi Gedung A",
      kodePekerjaan: "WK-2026-001",
      contract: "CTR-2026-014",
      tanggalInvoice: "10 Jun 2026",
      tanggalJatuhTempo: "10 Jul 2026",
      amount: 250000000,
      paid: 0,
      outstanding: 250000000,
      paymentStatus: "BELUM_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "31_60",
    },
    {
      id: 2,
      nomor: "INV-2026-0021",
      client: "PT. Lombok Engineering",
      pekerjaan: "Maintenance Electrical System",
      kodePekerjaan: "WK-2026-002",
      contract: "CTR-2026-011",
      tanggalInvoice: "25 Jun 2026",
      tanggalJatuhTempo: "25 Jul 2026",
      amount: 180000000,
      paid: 0,
      outstanding: 180000000,
      paymentStatus: "BELUM_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "31_60",
    },
    {
      id: 3,
      nomor: "INV-2026-0025",
      client: "PT. Mitra Infrastruktur",
      pekerjaan: "Pengadaan Spare Part Generator",
      kodePekerjaan: "WK-2026-003",
      contract: "-",
      tanggalInvoice: "15 Jul 2026",
      tanggalJatuhTempo: "14 Aug 2026",
      amount: 120000000,
      paid: 50000000,
      outstanding: 70000000,
      paymentStatus: "SEBAGIAN_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "1_30",
    },
    {
      id: 4,
      nomor: "INV-2026-0028",
      client: "PT. Mitra Infrastruktur",
      pekerjaan: "Maintenance Trafo Utama",
      kodePekerjaan: "WK-2026-010",
      contract: "CTR-2026-018",
      tanggalInvoice: "01 Aug 2026",
      tanggalJatuhTempo: "31 Aug 2026",
      amount: 90000000,
      paid: 0,
      outstanding: 90000000,
      paymentStatus: "BELUM_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "CURRENT",
    },
    {
      id: 5,
      nomor: "INV-2026-0029",
      client: "CV. Sinar Teknik",
      pekerjaan: "Penggantian Kabel Distribusi",
      kodePekerjaan: "WK-2026-011",
      contract: "CTR-2026-019",
      tanggalInvoice: "03 Aug 2026",
      tanggalJatuhTempo: "02 Sep 2026",
      amount: 75000000,
      paid: 0,
      outstanding: 75000000,
      paymentStatus: "BELUM_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "CURRENT",
    },
    {
      id: 6,
      nomor: "INV-2026-0030",
      client: "PT. Berkah Power System",
      pekerjaan: "Maintenance Genset Area Produksi",
      kodePekerjaan: "WK-2026-005",
      contract: "CTR-2026-011",
      tanggalInvoice: "05 Jul 2026",
      tanggalJatuhTempo: "04 Aug 2026",
      amount: 65000000,
      paid: 65000000,
      outstanding: 0,
      paymentStatus: "LUNAS",
      invoiceStatus: "PAID",
      aging: "PAID",
    },
    {
      id: 7,
      nomor: "INV-2026-0031",
      client: "PT. Energi Nusantara",
      pekerjaan: "Pengadaan dan Instalasi UPS",
      kodePekerjaan: "WK-2026-006",
      contract: "-",
      tanggalInvoice: "12 Aug 2026",
      tanggalJatuhTempo: "11 Sep 2026",
      amount: 210000000,
      paid: 100000000,
      outstanding: 110000000,
      paymentStatus: "SEBAGIAN_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "CURRENT",
    },
    {
      id: 8,
      nomor: "INV-2026-0032",
      client: "PT. Berkah Power System",
      pekerjaan: "Perawatan Sistem Control",
      kodePekerjaan: "WK-2026-008",
      contract: "CTR-2026-005",
      tanggalInvoice: "01 May 2026",
      tanggalJatuhTempo: "31 May 2026",
      amount: 85000000,
      paid: 0,
      outstanding: 85000000,
      paymentStatus: "BELUM_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: ">90",
    },
    {
      id: 9,
      nomor: "INV-2026-0034",
      client: "PT. Lombok Engineering",
      pekerjaan: "Rewiring Gedung Operasional",
      kodePekerjaan: "WK-2026-007",
      contract: "CTR-2026-008",
      tanggalInvoice: "20 Jul 2026",
      tanggalJatuhTempo: "19 Aug 2026",
      amount: 145000000,
      paid: 0,
      outstanding: 145000000,
      paymentStatus: "BELUM_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "1_30",
    },
    {
      id: 10,
      nomor: "INV-2026-0036",
      client: "PT. Energi Nusantara",
      pekerjaan: "Inspection Sistem Proteksi",
      kodePekerjaan: "WK-2026-009",
      contract: "-",
      tanggalInvoice: "15 Aug 2026",
      tanggalJatuhTempo: "14 Sep 2026",
      amount: 165000000,
      paid: 0,
      outstanding: 165000000,
      paymentStatus: "BELUM_DIBAYAR",
      invoiceStatus: "ISSUED",
      aging: "CURRENT",
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

    return invoices.filter((invoice) => {
      const matchSearch =
        invoice.nomor.toLowerCase().includes(keyword) ||
        invoice.client.toLowerCase().includes(keyword) ||
        invoice.pekerjaan.toLowerCase().includes(keyword) ||
        invoice.kodePekerjaan.toLowerCase().includes(keyword) ||
        invoice.contract.toLowerCase().includes(keyword);

      const matchPaymentStatus =
        paymentStatusFilter === "ALL" ||
        invoice.paymentStatus === paymentStatusFilter;

      const matchInvoiceStatus =
        invoiceStatusFilter === "ALL" ||
        invoice.invoiceStatus === invoiceStatusFilter;

      const matchAging = agingFilter === "ALL" || invoice.aging === agingFilter;

      return (
        matchSearch && matchPaymentStatus && matchInvoiceStatus && matchAging
      );
    });
  }, [
    invoices,
    searchTerm,
    paymentStatusFilter,
    invoiceStatusFilter,
    agingFilter,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalInvoice = invoices.length;

  const totalOutstanding = invoices.reduce(
    (total, item) => total + item.outstanding,
    0,
  );

  const totalOverdue = invoices
    .filter((item) => item.aging !== "CURRENT" && item.aging !== "PAID")
    .reduce((total, item) => total + item.outstanding, 0);

  const totalPaid = invoices.reduce((total, item) => total + item.paid, 0);

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
    setPaymentStatusFilter("ALL");
    setInvoiceStatusFilter("ALL");
    setAgingFilter("ALL");
    setPeriodFilter("ALL");
  };

  // =========================================================
  // PAYMENT STATUS STYLE
  // =========================================================

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "LUNAS":
        return {
          className:
            "bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100 dark:border-green-500/20",
          icon: <MdCheckCircle size={12} />,
          label: "Lunas",
        };

      case "SEBAGIAN_DIBAYAR":
        return {
          className:
            "bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20",
          icon: <MdPayments size={12} />,
          label: "Sebagian",
        };

      case "BELUM_DIBAYAR":
        return {
          className:
            "bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/20",
          icon: <MdWarning size={12} />,
          label: "Belum Dibayar",
        };

      default:
        return {
          className:
            "bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10",
          icon: null,
          label: status,
        };
    }
  };

  // =========================================================
  // INVOICE STATUS STYLE
  // =========================================================

  const getInvoiceStatusStyle = (status) => {
    switch (status) {
      case "ISSUED":
        return "bg-purple-50 dark:bg-purple-500/10 text-purple-600";

      case "PAID":
        return "bg-green-50 dark:bg-green-500/10 text-green-600";

      default:
        return "bg-gray-50 dark:bg-white/5 text-gray-500";
    }
  };

  // =========================================================
  // AGING STYLE
  // =========================================================

  const getAgingStyle = (aging) => {
    switch (aging) {
      case "CURRENT":
        return {
          text: "text-green-600",
          label: "Current",
        };

      case "1_30":
        return {
          text: "text-blue-600",
          label: "1–30 Hari",
        };

      case "31_60":
        return {
          text: "text-yellow-600",
          label: "31–60 Hari",
        };

      case "61_90":
        return {
          text: "text-orange-600",
          label: "61–90 Hari",
        };

      case ">90":
        return {
          text: "text-red-600",
          label: "> 90 Hari",
        };

      case "PAID":
        return {
          text: "text-green-600",
          label: "Paid",
        };

      default:
        return {
          text: "text-gray-400",
          label: "-",
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
            Invoice
          </h1>

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[3px] mt-1">
            Invoice Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* SEARCH */}

          <div className="relative w-[280px] lg:w-[350px]">
            <MdSearch
              size={19}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari invoice, client, pekerjaan..."
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
            Tambah Invoice
          </button>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5 flex-shrink-0">
        {/* TOTAL */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-custom-merah-terang/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-custom-merah-terang" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Total Invoice
                </p>
              </div>

              <p className="text-3xl font-black text-custom-gelap dark:text-white mt-3">
                {totalInvoice}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Seluruh transaksi invoice
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
              <MdReceiptLong size={24} />
            </div>
          </div>
        </div>

        {/* OUTSTANDING */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-yellow-500/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Outstanding
                </p>
              </div>

              <p className="text-2xl font-black text-yellow-600 mt-4">
                {formatCurrency(totalOutstanding)}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Belum lunas
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
              <MdPayments size={24} />
            </div>
          </div>
        </div>

        {/* OVERDUE */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-red-100 dark:border-red-500/10 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-red-500/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Overdue
                </p>
              </div>

              <p className="text-2xl font-black text-red-600 mt-4">
                {formatCurrency(totalOverdue)}
              </p>

              <p className="text-[8px] font-bold text-gray-400 mt-2">
                Perlu ditindaklanjuti
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
              <MdWarning size={24} />
            </div>
          </div>
        </div>

        {/* PAID */}

        <div className="relative overflow-hidden bg-custom-gelap dark:bg-[#3d2e39] rounded-[28px] border border-custom-gelap dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-custom-cerah" />

                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                  Paid
                </p>
              </div>

              <p className="text-2xl font-black text-white mt-4">
                {formatCurrency(totalPaid)}
              </p>

              <p className="text-[8px] font-bold text-white/40 mt-2">
                Total pembayaran diterima
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/10 text-custom-cerah flex items-center justify-center">
              <MdCheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE CONTAINER
      ====================================================== */}

      <div className="flex-1 min-h-0 bg-white dark:bg-custom-gelap rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {/* ===================================================
            TABLE TOOLBAR
        ==================================================== */}

        <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                Daftar Invoice
              </h2>

              <p className="text-[8px] text-gray-400 mt-1">
                Menampilkan {filteredData.length} dari {invoices.length} invoice
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

          {/* =================================================
              FILTER PANEL
          ================================================== */}

          {showFilter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              {/* PAYMENT STATUS */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Payment Status
                </label>

                <div className="relative">
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Status</option>

                    <option value="BELUM_DIBAYAR">Belum Dibayar</option>

                    <option value="SEBAGIAN_DIBAYAR">Sebagian Dibayar</option>

                    <option value="LUNAS">Lunas</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* INVOICE STATUS */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Invoice Status
                </label>

                <div className="relative">
                  <select
                    value={invoiceStatusFilter}
                    onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Status</option>

                    <option value="ISSUED">Issued</option>

                    <option value="PAID">Paid</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* AGING */}

              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Aging
                </label>

                <div className="relative">
                  <select
                    value={agingFilter}
                    onChange={(e) => setAgingFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Aging</option>

                    <option value="CURRENT">Current</option>

                    <option value="1_30">1–30 Hari</option>

                    <option value="31_60">31–60 Hari</option>

                    <option value="61_90">61–90 Hari</option>

                    <option value=">90">&gt; 90 Hari</option>
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
                  Periode
                </label>

                <div className="relative">
                  <select
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    className="appearance-none w-full h-9 px-3 pr-8 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[9px] font-bold text-gray-600 dark:text-gray-300 outline-none"
                  >
                    <option value="ALL">Semua Periode</option>

                    <option value="THIS_MONTH">Bulan Ini</option>

                    <option value="LAST_MONTH">Bulan Lalu</option>

                    <option value="THIS_YEAR">Tahun Ini</option>
                  </select>

                  <MdArrowDropDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* RESET */}

              <div className="sm:col-span-2 xl:col-span-4 flex justify-end">
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
          <table className="w-full min-w-[1350px] text-left border-collapse">
            {/* =================================================
                STICKY HEADER
            ================================================== */}

            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[8px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Invoice
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Client
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Pekerjaan / Contract
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Tanggal
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Jatuh Tempo
                </th>

                <th className="px-5 py-4 text-right bg-gray-50 dark:bg-[#3d2e39]">
                  Nilai Invoice
                </th>

                <th className="px-5 py-4 text-right bg-gray-50 dark:bg-[#3d2e39]">
                  Dibayar
                </th>

                <th className="px-5 py-4 text-right bg-gray-50 dark:bg-[#3d2e39]">
                  Outstanding
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Payment
                </th>

                <th className="px-5 py-4 bg-gray-50 dark:bg-[#3d2e39]">
                  Aging
                </th>

                <th className="px-5 py-4 text-center bg-gray-50 dark:bg-[#3d2e39]">
                  Opsi
                </th>
              </tr>
            </thead>

            {/* =================================================
                TABLE BODY
            ================================================== */}

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-20 text-center">
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
                  <td colSpan="11" className="py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 flex items-center justify-center">
                        <MdReceiptLong size={28} />
                      </div>

                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">
                        Invoice Tidak Ditemukan
                      </p>

                      <p className="text-[8px] text-gray-400 mt-1">
                        Tidak ada invoice yang sesuai filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((invoice) => {
                  const payment = getPaymentStatusStyle(invoice.paymentStatus);

                  const aging = getAgingStyle(invoice.aging);

                  const isOverdue =
                    invoice.aging !== "CURRENT" && invoice.aging !== "PAID";

                  return (
                    <tr
                      key={invoice.id}
                      className={`group hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors ${
                        isOverdue
                          ? "bg-red-50/[0.18] dark:bg-red-500/[0.02]"
                          : ""
                      }`}
                    >
                      {/* INVOICE */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isOverdue
                                ? "bg-red-50 dark:bg-red-500/10 text-red-600"
                                : "bg-custom-merah-terang/10 text-custom-merah-terang"
                            }`}
                          >
                            <MdReceiptLong size={19} />
                          </div>

                          <div>
                            <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                              {invoice.nomor}
                            </p>

                            <span
                              className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-wider ${getInvoiceStatusStyle(
                                invoice.invoiceStatus,
                              )}`}
                            >
                              {invoice.invoiceStatus}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CLIENT */}

                      <td className="px-5 py-5 min-w-[190px]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center flex-shrink-0">
                            <MdBusiness size={15} />
                          </div>

                          <div>
                            <p className="text-[9px] font-bold text-gray-600 dark:text-gray-300">
                              {invoice.client}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* WORK / CONTRACT */}

                      <td className="px-5 py-5 min-w-[280px]">
                        <p className="text-[9px] font-black text-custom-gelap dark:text-white">
                          {invoice.pekerjaan}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[7px] font-black text-custom-merah-terang uppercase tracking-wider">
                            {invoice.kodePekerjaan}
                          </span>

                          <span className="text-gray-300 dark:text-gray-600">
                            •
                          </span>

                          <div className="flex items-center gap-1 text-gray-400">
                            <MdDescription size={11} />

                            <span className="text-[7px] font-bold">
                              {invoice.contract}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* INVOICE DATE */}

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-1.5">
                          <MdCalendarToday
                            size={13}
                            className="text-gray-400"
                          />

                          <span className="text-[8px] font-bold text-gray-500 dark:text-gray-300 whitespace-nowrap">
                            {invoice.tanggalInvoice}
                          </span>
                        </div>
                      </td>

                      {/* DUE DATE */}

                      <td className="px-5 py-5">
                        <div
                          className={`flex items-center gap-1.5 ${
                            isOverdue
                              ? "text-red-600"
                              : "text-gray-500 dark:text-gray-300"
                          }`}
                        >
                          {isOverdue ? (
                            <MdWarning size={14} />
                          ) : (
                            <MdSchedule size={14} />
                          )}

                          <span className="text-[8px] font-black whitespace-nowrap">
                            {invoice.tanggalJatuhTempo}
                          </span>
                        </div>
                      </td>

                      {/* AMOUNT */}

                      <td className="px-5 py-5 text-right">
                        <p className="text-[9px] font-black text-custom-gelap dark:text-white whitespace-nowrap">
                          {formatCurrency(invoice.amount)}
                        </p>
                      </td>

                      {/* PAID */}

                      <td className="px-5 py-5 text-right">
                        <p className="text-[9px] font-bold text-green-600 whitespace-nowrap">
                          {formatCurrency(invoice.paid)}
                        </p>
                      </td>

                      {/* OUTSTANDING */}

                      <td className="px-5 py-5 text-right">
                        <p
                          className={`text-[10px] font-black whitespace-nowrap ${
                            invoice.outstanding > 0
                              ? isOverdue
                                ? "text-red-600"
                                : "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatCurrency(invoice.outstanding)}
                        </p>
                      </td>

                      {/* PAYMENT STATUS */}

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[7px] font-black uppercase tracking-wider whitespace-nowrap ${payment.className}`}
                        >
                          {payment.icon}
                          {payment.label}
                        </span>
                      </td>

                      {/* AGING */}

                      <td className="px-5 py-5">
                        <span className={`text-[8px] font-black ${aging.text}`}>
                          {aging.label}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-5 text-center">
                        <button
                          className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-custom-merah-terang hover:text-white transition-all"
                          title="Lihat Detail Invoice"
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

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <p className="text-[8px] font-bold text-gray-400">
            {filteredData.length} invoice ditampilkan
          </p>

          <p className="text-[8px] font-bold text-gray-400">
            Scroll untuk melihat data lainnya
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
