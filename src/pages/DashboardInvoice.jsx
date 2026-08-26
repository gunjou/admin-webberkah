import React, { useState } from "react";
import {
  MdRefresh,
  MdWarning,
  MdErrorOutline,
  MdCheckCircle,
  MdAccessTime,
  MdArrowForward,
  MdTrendingUp,
  MdTrendingDown,
  MdReceiptLong,
  MdPayments,
  MdCalendarToday,
  MdBusiness,
  MdNotificationsActive,
} from "react-icons/md";

const DashboardInvoice = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // =========================================================
  // DUMMY DATA
  // =========================================================

  const summary = {
    outstanding: 850000000,
    overdue: 420000000,
    dueSoon: 180000000,
    collected: 1250000000,
  };

  const monthlyData = [
    {
      month: "Mar",
      invoice: 180,
      payment: 150,
    },
    {
      month: "Apr",
      invoice: 220,
      payment: 190,
    },
    {
      month: "May",
      invoice: 240,
      payment: 210,
    },
    {
      month: "Jun",
      invoice: 280,
      payment: 250,
    },
    {
      month: "Jul",
      invoice: 320,
      payment: 280,
    },
    {
      month: "Aug",
      invoice: 350,
      payment: 310,
    },
  ];

  const agingData = [
    {
      label: "Current",
      amount: 250000000,
      percentage: 29,
      count: 8,
      type: "current",
    },
    {
      label: "1–30 Hari",
      amount: 180000000,
      percentage: 21,
      count: 6,
      type: "normal",
    },
    {
      label: "31–60 Hari",
      amount: 140000000,
      percentage: 16,
      count: 4,
      type: "warning",
    },
    {
      label: "61–90 Hari",
      amount: 100000000,
      percentage: 12,
      count: 3,
      type: "danger",
    },
    {
      label: "> 90 Hari",
      amount: 180000000,
      percentage: 22,
      count: 5,
      type: "critical",
    },
  ];

  const actionRequired = [
    {
      id: 1,
      invoice: "INV-2026-0018",
      client: "PT. Energi Nusantara",
      amount: 250000000,
      dueDate: "10 Jul 2026",
      days: 47,
      type: "OVERDUE",
      priority: "HIGH",
    },
    {
      id: 2,
      invoice: "INV-2026-0021",
      client: "PT. Lombok Engineering",
      amount: 180000000,
      dueDate: "25 Jul 2026",
      days: 32,
      type: "OVERDUE",
      priority: "HIGH",
    },
    {
      id: 3,
      invoice: "INV-2026-0028",
      client: "PT. Mitra Infrastruktur",
      amount: 90000000,
      dueDate: "31 Aug 2026",
      days: 5,
      type: "DUE_SOON",
      priority: "MEDIUM",
    },
    {
      id: 4,
      invoice: "INV-2026-0031",
      client: "CV. Sinar Teknik",
      amount: 75000000,
      dueDate: "02 Sep 2026",
      days: 7,
      type: "DUE_SOON",
      priority: "MEDIUM",
    },
  ];

  const clientOutstanding = [
    {
      client: "PT. Energi Nusantara",
      invoices: 5,
      outstanding: 285000000,
      overdue: 250000000,
    },
    {
      client: "PT. Lombok Engineering",
      invoices: 4,
      outstanding: 210000000,
      overdue: 180000000,
    },
    {
      client: "PT. Mitra Infrastruktur",
      invoices: 3,
      outstanding: 155000000,
      overdue: 90000000,
    },
    {
      client: "CV. Sinar Teknik",
      invoices: 2,
      outstanding: 110000000,
      overdue: 0,
    },
    {
      client: "PT. Berkah Power System",
      invoices: 3,
      outstanding: 90000000,
      overdue: 0,
    },
  ];

  // =========================================================
  // FORMAT
  // =========================================================

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)} M`;
    }

    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)} jt`;
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    setIsRefreshing(true);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // =========================================================
  // AGING STYLE
  // =========================================================

  const getAgingStyle = (type) => {
    switch (type) {
      case "current":
        return {
          bar: "bg-green-500",
          text: "text-green-600",
        };

      case "normal":
        return {
          bar: "bg-blue-500",
          text: "text-blue-600",
        };

      case "warning":
        return {
          bar: "bg-yellow-500",
          text: "text-yellow-600",
        };

      case "danger":
        return {
          bar: "bg-orange-500",
          text: "text-orange-600",
        };

      case "critical":
        return {
          bar: "bg-red-500",
          text: "text-red-600",
        };

      default:
        return {
          bar: "bg-gray-400",
          text: "text-gray-500",
        };
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Invoice Dashboard
          </h1>

          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[3px] mt-1">
            Monitoring & Collection
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="h-11 w-11 flex items-center justify-center bg-white dark:bg-custom-gelap text-gray-400 rounded-xl border border-gray-100 dark:border-white/10 hover:text-custom-merah-terang transition-all shadow-sm"
        >
          <MdRefresh size={20} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5 flex-shrink-0">
        {/* OUTSTANDING */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-custom-merah-terang/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-custom-merah-terang" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Outstanding
                </p>
              </div>

              <p className="text-2xl font-black text-custom-gelap dark:text-white mt-4">
                {formatCurrency(summary.outstanding)}
              </p>

              <div className="flex items-center gap-1.5 mt-2">
                <MdReceiptLong size={13} className="text-custom-merah-terang" />

                <span className="text-[8px] font-bold text-gray-400">
                  Total belum lunas
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
              <MdReceiptLong size={24} />
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
                {formatCurrency(summary.overdue)}
              </p>

              <div className="flex items-center gap-1.5 mt-2">
                <MdWarning size={13} className="text-red-500" />

                <span className="text-[8px] font-bold text-gray-400">
                  Perlu ditindaklanjuti
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
              <MdWarning size={24} />
            </div>
          </div>
        </div>

        {/* DUE SOON */}

        <div className="relative overflow-hidden bg-white dark:bg-custom-gelap rounded-[28px] border border-yellow-100 dark:border-yellow-500/10 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-yellow-500/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Due Soon
                </p>
              </div>

              <p className="text-2xl font-black text-yellow-600 mt-4">
                {formatCurrency(summary.dueSoon)}
              </p>

              <div className="flex items-center gap-1.5 mt-2">
                <MdAccessTime size={13} className="text-yellow-500" />

                <span className="text-[8px] font-bold text-gray-400">
                  Jatuh tempo ≤ 7 hari
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
              <MdAccessTime size={24} />
            </div>
          </div>
        </div>

        {/* COLLECTED */}

        <div className="relative overflow-hidden bg-custom-gelap dark:bg-[#3d2e39] rounded-[28px] border border-custom-gelap dark:border-white/5 shadow-sm p-5 group">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-custom-cerah" />

                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                  Collected
                </p>
              </div>

              <p className="text-2xl font-black text-white mt-4">
                {formatCurrency(summary.collected)}
              </p>

              <div className="flex items-center gap-1.5 mt-2">
                <MdTrendingUp size={13} className="text-green-400" />

                <span className="text-[8px] font-bold text-white/40">
                  Pembayaran terkumpul
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/10 text-custom-cerah flex items-center justify-center">
              <MdPayments size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ===================================================
            LEFT COLUMN
        ==================================================== */}

        <div className="xl:col-span-2 flex flex-col gap-5 min-h-0">
          {/* =================================================
              TREND
          ================================================== */}

          <div className="bg-white dark:bg-custom-gelap rounded-[30px] border border-gray-100 dark:border-white/5 shadow-sm p-5 flex-1 min-h-[300px]">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                  Invoice & Payment Trend
                </h2>

                <p className="text-[8px] text-gray-400 mt-1">
                  Perbandingan invoice dan pembayaran 6 bulan terakhir
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-custom-merah-terang" />

                  <span className="text-[8px] font-bold text-gray-400">
                    Invoice
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />

                  <span className="text-[8px] font-bold text-gray-400">
                    Payment
                  </span>
                </div>
              </div>
            </div>

            {/* CHART */}

            <div className="relative h-[210px]">
              {/* GRID */}

              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="border-t border-gray-100 dark:border-white/5"
                  />
                ))}
              </div>

              {/* SVG */}

              <svg
                viewBox="0 0 600 200"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full overflow-visible"
              >
                {/* INVOICE */}

                <polyline
                  points="0,115 120,95 240,90 360,65 480,40 600,25"
                  fill="none"
                  stroke="#A91D24"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* PAYMENT */}

                <polyline
                  points="0,135 120,120 240,108 360,82 480,65 600,48"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* INVOICE DOTS */}

                {[
                  [0, 115],
                  [120, 95],
                  [240, 90],
                  [360, 65],
                  [480, 40],
                  [600, 25],
                ].map(([x, y], index) => (
                  <circle
                    key={`invoice-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#A91D24"
                  />
                ))}

                {/* PAYMENT DOTS */}

                {[
                  [0, 135],
                  [120, 120],
                  [240, 108],
                  [360, 82],
                  [480, 65],
                  [600, 48],
                ].map(([x, y], index) => (
                  <circle
                    key={`payment-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#22c55e"
                  />
                ))}
              </svg>

              {/* MONTH */}

              <div className="absolute left-0 right-0 bottom-[-24px] flex justify-between">
                {monthlyData.map((item) => (
                  <span
                    key={item.month}
                    className="text-[8px] font-bold text-gray-400"
                  >
                    {item.month}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              CLIENT OUTSTANDING
          ================================================== */}

          <div className="bg-white dark:bg-custom-gelap rounded-[30px] border border-gray-100 dark:border-white/5 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                  Outstanding by Client
                </h2>

                <p className="text-[8px] text-gray-400 mt-1">
                  Client dengan saldo invoice terbesar
                </p>
              </div>

              <button className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-custom-merah-terang">
                Lihat Semua
                <MdArrowForward size={13} />
              </button>
            </div>

            <div className="space-y-3">
              {clientOutstanding.map((item, index) => {
                const maxOutstanding = clientOutstanding[0].outstanding;

                const percentage = (item.outstanding / maxOutstanding) * 100;

                return (
                  <div key={item.client} className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center flex-shrink-0">
                      <MdBusiness size={14} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-[9px] font-black text-custom-gelap dark:text-white truncate">
                            {item.client}
                          </p>

                          <p className="text-[7px] text-gray-400">
                            {item.invoices} invoice
                          </p>
                        </div>

                        <p className="text-[9px] font-black text-custom-gelap dark:text-white">
                          {formatCurrency(item.outstanding)}
                        </p>
                      </div>

                      <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-custom-merah-terang rounded-full"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="w-24 text-right">
                      {item.overdue > 0 ? (
                        <span className="text-[7px] font-black text-red-500 uppercase">
                          {formatCurrency(item.overdue)} overdue
                        </span>
                      ) : (
                        <span className="text-[7px] font-black text-green-600 uppercase">
                          Tidak overdue
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="flex flex-col gap-5 min-h-0">
          {/* =================================================
              AGING
          ================================================== */}

          <div className="bg-white dark:bg-custom-gelap rounded-[30px] border border-gray-100 dark:border-white/5 shadow-sm p-5">
            <div className="mb-5">
              <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                Aging Analysis
              </h2>

              <p className="text-[8px] text-gray-400 mt-1">
                Distribusi outstanding berdasarkan umur invoice
              </p>
            </div>

            <div className="space-y-4">
              {agingData.map((item) => {
                const style = getAgingStyle(item.type);

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${style.bar}`} />

                        <span className="text-[8px] font-bold text-gray-500 dark:text-gray-300">
                          {item.label}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-[8px] font-black ${style.text}`}>
                          {formatCurrency(item.amount)}
                        </span>

                        <span className="text-[7px] text-gray-400 ml-1">
                          ({item.count})
                        </span>
                      </div>
                    </div>

                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar}`}
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================
              ACTION REQUIRED
          ================================================== */}

          <div className="bg-white dark:bg-custom-gelap rounded-[30px] border border-gray-100 dark:border-white/5 shadow-sm flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
                    <MdNotificationsActive size={17} />
                  </div>

                  <div>
                    <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                      Action Required
                    </h2>

                    <p className="text-[7px] text-gray-400 mt-0.5">
                      Invoice yang membutuhkan perhatian
                    </p>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 text-[7px] font-black">
                  {actionRequired.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {actionRequired.map((item) => {
                const isOverdue = item.type === "OVERDUE";

                return (
                  <div
                    key={item.id}
                    className="px-5 py-4 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          isOverdue ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[9px] font-black text-custom-gelap dark:text-white">
                            {item.invoice}
                          </p>

                          <span
                            className={`text-[7px] font-black uppercase ${
                              isOverdue ? "text-red-600" : "text-yellow-600"
                            }`}
                          >
                            {isOverdue
                              ? `${item.days} hari overdue`
                              : `${item.days} hari lagi`}
                          </span>
                        </div>

                        <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-1">
                          {item.client}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[9px] font-black text-custom-gelap dark:text-white">
                            {formatCurrency(item.amount)}
                          </p>

                          <p className="text-[7px] text-gray-400">
                            Jatuh tempo {item.dueDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 dark:border-white/5">
              <button className="w-full flex items-center justify-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-custom-merah-terang">
                Lihat Semua Reminder
                <MdArrowForward size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInvoice;
