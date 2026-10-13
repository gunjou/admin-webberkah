import React, { useCallback, useEffect, useState } from "react";
import {
  MdAccountTree,
  MdAccessTime,
  MdAutorenew,
  MdCheckCircle,
  MdChevronRight,
  MdErrorOutline,
  MdEventNote,
  MdGroups,
  MdInfoOutline,
  MdInventory2,
  MdPayments,
  MdReceiptLong,
  MdRefresh,
  MdTrendingUp,
  MdWarningAmber,
} from "react-icons/md";
import Api from "../utils/Api";
import SwalHelper from "../utils/Swal";

// ============================================================================ //
//                              #SECTION - CONSTANTS                            //
// ============================================================================ //

const HEALTH_STATUS = {
  COMPLETED: {
    label: "Completed",
    description: "Pekerjaan sudah ditutup",
    icon: MdCheckCircle,
    className:
      "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-400",
    progressClass: "bg-gray-500",
  },

  ACTIVE: {
    label: "Active",
    description: "Pekerjaan aktif",
    icon: MdAccountTree,
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400",
    progressClass: "bg-green-500",
  },

  ON_TRACK: {
    label: "On Track",
    description: "Target pekerjaan masih aman",
    icon: MdTrendingUp,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
    progressClass: "bg-blue-500",
  },

  DUE_SOON: {
    label: "Due Soon",
    description: "Mendekati target pekerjaan",
    icon: MdAccessTime,
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400",
    progressClass: "bg-orange-500",
  },

  EXPIRED: {
    label: "Expired",
    description: "Melewati target pekerjaan",
    icon: MdWarningAmber,
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
    progressClass: "bg-red-500",
  },
};

const PIPELINE_STAGES = [
  {
    key: "identified",
    label: "Identified",
    shortLabel: "Identified",
  },
  {
    key: "quotation",
    label: "Quotation",
    shortLabel: "Quotation",
  },
  {
    key: "contract",
    label: "Contract",
    shortLabel: "Contract",
  },
  {
    key: "ba",
    label: "BA",
    shortLabel: "BA",
  },
  {
    key: "invoice",
    label: "Invoice",
    shortLabel: "Invoice",
  },
  {
    key: "payment",
    label: "Payment",
    shortLabel: "Payment",
  },
];

// ============================================================================ //
//                              #SECTION - HELPERS                              //
// ============================================================================ //

const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getActivityIcon = (activityType) => {
  switch (activityType) {
    case "STAGE_CHANGE":
      return MdAutorenew;

    case "PROPOSAL":
      return MdEventNote;

    case "CONTRACT":
      return MdInventory2;

    case "BA":
      return MdAccountTree;

    case "INVOICE":
      return MdReceiptLong;

    case "PAYMENT":
      return MdPayments;

    default:
      return MdInfoOutline;
  }
};

const getActivityStyle = (activityType) => {
  switch (activityType) {
    case "STAGE_CHANGE":
      return {
        wrapper:
          "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        line: "bg-blue-200 dark:bg-blue-500/30",
      };

    case "PROPOSAL":
      return {
        wrapper:
          "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
        line: "bg-purple-200 dark:bg-purple-500/30",
      };

    case "CONTRACT":
      return {
        wrapper:
          "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
        line: "bg-indigo-200 dark:bg-indigo-500/30",
      };

    case "BA":
      return {
        wrapper:
          "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
        line: "bg-orange-200 dark:bg-orange-500/30",
      };

    case "INVOICE":
      return {
        wrapper:
          "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
        line: "bg-amber-200 dark:bg-amber-500/30",
      };

    case "PAYMENT":
      return {
        wrapper:
          "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
        line: "bg-green-200 dark:bg-green-500/30",
      };

    default:
      return {
        wrapper: "bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-300",
        line: "bg-gray-200 dark:bg-white/10",
      };
  }
};

// ============================================================================ //
//                         #SECTION - REUSABLE CARD                            //
// ============================================================================ //

const DashboardCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-custom-gelap ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-black tracking-tight text-custom-gelap dark:text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang">
            <Icon size={18} />
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

// ============================================================================ //
//                         #SECTION - KPI CARD                                  //
// ============================================================================ //

const HealthKpiCard = ({ label, value, description, status, icon: Icon }) => {
  const health = HEALTH_STATUS[status];

  return (
    <div
      className={`rounded-[24px] border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${health.className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[1.5px] opacity-70">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight">
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-[9px] font-bold leading-4 opacity-70">
            {description}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 dark:bg-black/10">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================ //
//                         #SECTION - ATTENTION CARD                            //
// ============================================================================ //

const AttentionCard = ({ label, value, description, icon: Icon, type }) => {
  const styles = {
    danger:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
    warning:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400",
    neutral:
      "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300",
  };

  return (
    <div
      className={`rounded-[22px] border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
        styles[type] || styles.neutral
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[1.4px] opacity-70">
            {label}
          </p>

          <p className="mt-1 text-xl font-black tracking-tight">
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-[9px] font-bold opacity-70">{description}</p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 dark:bg-black/10">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================ //
//                    #SECTION - DASHBOARD WORK ITEM                            //
// ============================================================================ //

const DashboardWorkItem = () => {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // ========================================================================== //
  //                           #SECTION - API                                    //
  // ========================================================================== //

  const fetchDashboardSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);

      const response = await Api.get("/work-item/dashboard/summary");

      if (response.data?.success) {
        setSummary(response.data?.data || null);
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal mengambil data dashboard.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mengambil data dashboard.",
      );
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchDashboardActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);

      const response = await Api.get("/work-item/dashboard/activity", {
        params: {
          limit: 5,
        },
      });

      if (response.data?.success) {
        setActivities(response.data?.data || []);
      } else {
        await SwalHelper.error(
          response.data?.message || "Gagal mengambil aktivitas dashboard.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil aktivitas dashboard:", error);

      await SwalHelper.error(
        error?.response?.data?.message ||
          "Gagal mengambil aktivitas dashboard.",
      );
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    await Promise.all([fetchDashboardSummary(), fetchDashboardActivity()]);
  }, [fetchDashboardSummary, fetchDashboardActivity]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ========================================================================== //
  //                           #SECTION - DATA                                  //
  // ========================================================================== //

  const overview = summary?.overview || {};

  const workType = summary?.work_type || {};

  const pipeline = summary?.pipeline || {};

  const attention = summary?.attention || {};

  const totalPipeline = PIPELINE_STAGES.reduce((total, stage) => {
    return total + Number(pipeline[stage.key] || 0);
  }, 0);

  // ========================================================================== //
  //                           #SECTION - LOADING                                //
  // ========================================================================== //

  const initialLoading = loadingSummary && !summary;

  if (initialLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-48 animate-pulse rounded-lg bg-gray-100 dark:bg-white/5" />
            <div className="mt-2 h-3 w-72 animate-pulse rounded-lg bg-gray-100 dark:bg-white/5" />
          </div>

          <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[24px] bg-gray-100 dark:bg-white/5"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-[28px] bg-gray-100 dark:bg-white/5 xl:col-span-2" />
          <div className="h-72 animate-pulse rounded-[28px] bg-gray-100 dark:bg-white/5" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="h-64 animate-pulse rounded-[28px] bg-gray-100 dark:bg-white/5" />
          <div className="h-64 animate-pulse rounded-[28px] bg-gray-100 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  // ========================================================================== //
  //                           #SECTION - RENDER                                 //
  // ========================================================================== //

  return (
    <div className="space-y-5 pb-8">
      {
        /* ====================================================================== */
        //   HEADER
        /* ====================================================================== */
      }

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[2px] text-custom-merah-terang">
            Work Monitoring
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-custom-gelap dark:text-white">
            Dashboard Work Item
          </h1>

          <p className="mt-1 max-w-2xl text-[10px] font-bold leading-5 text-gray-400">
            Ringkasan kondisi pekerjaan, pipeline, keuangan, dan aktivitas
            operasional terkini.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-custom-merah-terang px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MdRefresh size={17} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {
        /* ====================================================================== */
        //   HEALTH KPI
        /* ====================================================================== */
      }

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <HealthKpiCard
          label="Total Work Aktif"
          value={overview.total_work - overview.completed}
          description="Seluruh pekerjaan aktif"
          status="ACTIVE"
          icon={MdAccountTree}
        />

        <HealthKpiCard
          label="On Track"
          value={overview.on_track}
          description="Target pekerjaan masih aman"
          status="ON_TRACK"
          icon={MdTrendingUp}
        />

        <HealthKpiCard
          label="Due Soon"
          value={overview.due_soon}
          description="Mendekati target pekerjaan"
          status="DUE_SOON"
          icon={MdAccessTime}
        />

        <HealthKpiCard
          label="Expired"
          value={overview.expired}
          description="Melewati target pekerjaan"
          status="EXPIRED"
          icon={MdWarningAmber}
        />

        <HealthKpiCard
          label="Completed"
          value={overview.completed}
          description="Pekerjaan sudah ditutup"
          status="COMPLETED"
          icon={MdCheckCircle}
        />
      </div>

      {
        /* ====================================================================== */
        //   PIPELINE + WORK TYPE
        /* ====================================================================== */
      }

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* PIPELINE */}

        <DashboardCard
          title="Work Pipeline"
          subtitle="Distribusi pekerjaan berdasarkan stage"
          icon={MdAccountTree}
          className="xl:col-span-2"
        >
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px]">
              <div className="flex items-center">
                {PIPELINE_STAGES.map((stage, index) => {
                  const value = Number(pipeline[stage.key] || 0);

                  return (
                    <React.Fragment key={stage.key}>
                      <div className="min-w-[88px] flex-1">
                        <div className="flex flex-col items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-sm font-black text-custom-gelap dark:border-white/5 dark:bg-white/5 dark:text-white">
                            {formatNumber(value)}
                          </div>

                          <p className="mt-2 text-center text-[8px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {stage.label}
                          </p>
                        </div>
                      </div>

                      {index < PIPELINE_STAGES.length - 1 && (
                        <MdChevronRight
                          size={18}
                          className="shrink-0 text-gray-300 dark:text-gray-600"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* <div className="mt-7">
                <div className="flex h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                  {PIPELINE_STAGES.map((stage, index) => {
                    const value = Number(pipeline[stage.key] || 0);

                    return (
                      <div
                        key={stage.key}
                        className={`h-full ${
                          index === 0
                            ? "bg-gray-400"
                            : index === 1
                              ? "bg-purple-400"
                              : index === 2
                                ? "bg-indigo-400"
                                : index === 3
                                  ? "bg-orange-400"
                                  : index === 4
                                    ? "bg-amber-400"
                                    : index === 5
                                      ? "bg-green-400"
                                      : "bg-emerald-500"
                        }`}
                        style={{
                          width:
                            totalPipeline > 0
                              ? `${(value / totalPipeline) * 100}%`
                              : "0%",
                        }}
                      />
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                    Pipeline Distribution
                  </span>

                  <span className="text-[9px] font-black text-custom-gelap dark:text-white">
                    {formatNumber(totalPipeline)} records
                  </span>
                </div>
              </div> */}

              {/* BAR DETAIL */}

              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
                {PIPELINE_STAGES.map((stage) => {
                  const value = Number(pipeline[stage.key] || 0);

                  const percentage =
                    totalPipeline > 0 ? (value / totalPipeline) * 100 : 0;

                  return (
                    <div key={stage.key}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-gray-400">
                          {stage.shortLabel}
                        </span>

                        <span className="text-[8px] font-black text-gray-600 dark:text-gray-300">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                        <div
                          className="h-full rounded-full bg-custom-merah-terang transition-all"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* WORK TYPE */}

        {/* WORK TYPE */}

        <DashboardCard
          title="Work Type"
          subtitle="Komposisi jenis pekerjaan"
          icon={MdGroups}
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {/* PIE CHART */}

            <div className="relative h-44 w-44 shrink-0">
              {(() => {
                const tender = Number(workType.tender || 0);
                const maintenance = Number(workType.maintenance || 0);
                const total = tender + maintenance;

                const tenderPercentage = total > 0 ? (tender / total) * 100 : 0;

                const maintenancePercentage =
                  total > 0 ? (maintenance / total) * 100 : 0;

                const radius = 70;
                const circumference = 2 * Math.PI * radius;

                const tenderLength = (tenderPercentage / 100) * circumference;

                const maintenanceLength =
                  (maintenancePercentage / 100) * circumference;

                return (
                  <>
                    <svg
                      viewBox="0 0 180 180"
                      className="h-full w-full -rotate-90"
                    >
                      {/* Background */}

                      <circle
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="22"
                        className="text-gray-100 dark:text-white/5"
                      />

                      {/* Tender */}

                      {tender > 0 && (
                        <circle
                          cx="90"
                          cy="90"
                          r={radius}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="22"
                          strokeDasharray={`${tenderLength} ${circumference}`}
                          strokeDashoffset="0"
                          strokeLinecap="butt"
                          className="text-purple-500"
                        />
                      )}

                      {/* Maintenance */}

                      {maintenance > 0 && (
                        <circle
                          cx="90"
                          cy="90"
                          r={radius}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="22"
                          strokeDasharray={`${maintenanceLength} ${circumference}`}
                          strokeDashoffset={`-${tenderLength}`}
                          strokeLinecap="butt"
                          className="text-blue-500"
                        />
                      )}
                    </svg>

                    {/* CENTER */}

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[8px] font-black uppercase tracking-[1.5px] text-gray-400">
                        Total
                      </span>

                      <span className="mt-1 text-2xl font-black tracking-tight text-custom-gelap dark:text-white">
                        {formatNumber(total)}
                      </span>

                      <span className="text-[8px] font-bold text-gray-400">
                        Work Item
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* LEGEND */}

            <div className="w-full max-w-[220px] space-y-4">
              {/* TENDER */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />

                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Tender
                    </span>
                  </div>

                  <span className="text-sm font-black text-custom-gelap dark:text-white">
                    {formatNumber(workType.tender)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[8px] font-bold text-gray-400">
                    Persentase
                  </span>

                  <span className="text-[9px] font-black text-purple-600 dark:text-purple-400">
                    {overview.total_work
                      ? (
                          (Number(workType.tender || 0) /
                            Number(overview.total_work || 1)) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              {/* MAINTENANCE */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Maintenance
                    </span>
                  </div>

                  <span className="text-sm font-black text-custom-gelap dark:text-white">
                    {formatNumber(workType.maintenance)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[8px] font-bold text-gray-400">
                    Persentase
                  </span>

                  <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">
                    {overview.total_work
                      ? (
                          (Number(workType.maintenance || 0) /
                            Number(overview.total_work || 1)) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {
        /* ====================================================================== */
        //   ATTENTION
        /* ====================================================================== */
      }

      <DashboardCard
        title="Attention Required"
        subtitle="Kondisi yang membutuhkan follow-up"
        icon={MdWarningAmber}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AttentionCard
            label="Expired Work"
            value={attention.expired_work}
            description="Pekerjaan melewati target"
            icon={MdErrorOutline}
            type="danger"
          />

          <AttentionCard
            label="Due Soon Work"
            value={attention.due_soon_work}
            description="Mendekati target"
            icon={MdAccessTime}
            type="warning"
          />

          <AttentionCard
            label="Overdue Invoice"
            value={attention.overdue_invoice}
            description="Invoice melewati jatuh tempo"
            icon={MdReceiptLong}
            type="danger"
          />

          <AttentionCard
            label="Unpaid Invoice"
            value={attention.unpaid_invoice}
            description="Belum menerima pembayaran"
            icon={MdPayments}
            type="warning"
          />
        </div>
      </DashboardCard>

      {
        /* ====================================================================== */
        //   RECENT ACTIVITY
        /* ====================================================================== */
      }

      <DashboardCard
        title="Recent Activity"
        subtitle="Aktivitas operasional terbaru"
        icon={MdAutorenew}
      >
        {loadingActivity ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex animate-pulse gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gray-100 dark:bg-white/5" />

                <div className="flex-1">
                  <div className="h-3 w-48 rounded bg-gray-100 dark:bg-white/5" />

                  <div className="mt-2 h-2 w-72 rounded bg-gray-100 dark:bg-white/5" />

                  <div className="mt-2 h-2 w-32 rounded bg-gray-100 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-white/5">
              <MdInfoOutline size={22} />
            </div>

            <p className="mt-3 text-sm font-black text-gray-600 dark:text-gray-300">
              Belum ada aktivitas
            </p>

            <p className="mt-1 max-w-sm text-[9px] font-bold leading-4 text-gray-400">
              Aktivitas perubahan stage, proposal, kontrak, BA, invoice, dan
              payment akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.activity_type);

              const activityStyle = getActivityStyle(activity.activity_type);

              return (
                <div
                  key={`${activity.activity_type}-${activity.activity_id}-${index}`}
                  className="relative flex gap-3"
                >
                  {/* TIMELINE */}

                  <div className="relative flex w-9 shrink-0 justify-center">
                    {index < activities.length - 1 && (
                      <div
                        className={`absolute left-1/2 top-9 h-[calc(100%+1rem)] w-px -translate-x-1/2 ${activityStyle.line}`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl ${activityStyle.wrapper}`}
                    >
                      <Icon size={17} />
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1 pb-5">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black text-custom-gelap dark:text-white">
                              {activity.title}
                            </span>

                            {activity.activity_type && (
                              <span className="rounded-md bg-white px-1.5 py-1 text-[7px] font-black uppercase tracking-wider text-gray-400 shadow-sm dark:bg-white/5">
                                {activity.activity_type.replace("_", " ")}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[9px] font-bold leading-4 text-gray-500 dark:text-gray-400">
                            {activity.description}
                          </p>
                        </div>

                        <span className="shrink-0 text-[8px] font-bold text-gray-400">
                          {formatDateTime(activity.activity_date)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-custom-merah-terang/10 px-2 py-1 text-[8px] font-black text-custom-merah-terang">
                          {activity.work_number || "-"}
                        </span>

                        <span className="truncate text-[8px] font-bold text-gray-400">
                          {activity.work_name || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardCard>

      {
        /* ====================================================================== */
        //   INFORMATION
        /* ====================================================================== */
      }

      <div className="flex items-center gap-4 rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-custom-gelap">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang">
          <MdInfoOutline size={20} />
        </div>

        <p className="text-[9px] font-bold uppercase leading-5 tracking-widest text-gray-400">
          Dashboard menampilkan kondisi terkini pekerjaan berdasarkan data Work
          Item, Contract, BA, Invoice, dan Payment.
        </p>
      </div>
    </div>
  );
};

export default DashboardWorkItem;
