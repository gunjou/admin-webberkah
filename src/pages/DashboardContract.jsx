import React, { useMemo, useState } from "react";
import {
  MdBusinessCenter,
  MdDescription,
  MdWarning,
  MdAccessTime,
  MdArrowForward,
  MdCalendarToday,
  MdCheckCircle,
  MdSchedule,
  MdOutlineAssignment,
  MdRefresh,
  MdChevronRight,
  MdInfoOutline,
  MdTrendingUp,
} from "react-icons/md";

const DashboardContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  // =========================================================
  // DUMMY DATA
  // =========================================================

  const summary = {
    activeWork: 24,
    pendingContract: 5,
    atRisk: 4,
    delayed: 3,
  };

  const pipeline = [
    {
      key: "PROPOSAL",
      label: "Proposal",
      count: 4,
      description: "Menunggu keputusan",
      icon: <MdDescription />,
    },
    {
      key: "CONTRACT",
      label: "Contract",
      count: 5,
      description: "Menunggu kontrak",
      icon: <MdBusinessCenter />,
    },
    {
      key: "EXECUTION",
      label: "Execution",
      count: 12,
      description: "Sedang berjalan",
      icon: <MdTrendingUp />,
    },
    {
      key: "COMPLETION",
      label: "Completion",
      count: 3,
      description: "Menuju selesai",
      icon: <MdCheckCircle />,
    },
  ];

  const attentionItems = [
    {
      id: 1,
      title: "Kontrak belum tersedia",
      work: "Instalasi Panel Distribusi Gedung A",
      client: "PT. Energi Nusantara",
      days: 8,
      reason: "Menunggu dokumen kontrak dari client",
      severity: "DELAYED",
    },
    {
      id: 2,
      title: "Deadline kontrak mendekat",
      work: "Maintenance Electrical System",
      client: "PT. Lombok Engineering",
      days: 2,
      reason: "Deadline kontrak 28 Aug 2026",
      severity: "AT_RISK",
    },
    {
      id: 3,
      title: "Pekerjaan belum memiliki kontrak",
      work: "Pengadaan Spare Part Generator",
      client: "PT. Mitra Infrastruktur",
      days: 5,
      reason: "Pekerjaan sudah dimulai",
      severity: "AT_RISK",
    },
    {
      id: 4,
      title: "Kontrak melewati target",
      work: "Upgrade Control Panel",
      client: "CV. Sinar Teknik",
      days: 4,
      reason: "Menunggu approval client",
      severity: "DELAYED",
    },
  ];

  const activeWorks = [
    {
      id: 1,
      name: "Instalasi Panel Distribusi Gedung A",
      client: "PT. Energi Nusantara",
      stage: "EXECUTION",
      health: "ON TRACK",
      progress: 75,
      contract: "CTR-2026-014",
      endDate: "15 Sep 2026",
    },
    {
      id: 2,
      name: "Maintenance Electrical System",
      client: "PT. Lombok Engineering",
      stage: "CONTRACT",
      health: "AT RISK",
      progress: 0,
      contract: "-",
      endDate: "28 Aug 2026",
    },
    {
      id: 3,
      name: "Pengadaan Spare Part Generator",
      client: "PT. Mitra Infrastruktur",
      stage: "EXECUTION",
      health: "AT RISK",
      progress: 35,
      contract: "-",
      endDate: "10 Sep 2026",
    },
    {
      id: 4,
      name: "Upgrade Control Panel",
      client: "CV. Sinar Teknik",
      stage: "CONTRACT",
      health: "DELAYED",
      progress: 0,
      contract: "-",
      endDate: "22 Aug 2026",
    },
    {
      id: 5,
      name: "Maintenance Genset Area Produksi",
      client: "PT. Berkah Power System",
      stage: "EXECUTION",
      health: "ON TRACK",
      progress: 60,
      contract: "CTR-2026-011",
      endDate: "05 Sep 2026",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Contract dibuat",
      work: "Instalasi Panel Distribusi Gedung A",
      user: "Admin Contract",
      time: "10 menit lalu",
    },
    {
      id: 2,
      action: "Health diubah menjadi At Risk",
      work: "Maintenance Electrical System",
      user: "Admin Contract",
      time: "1 jam lalu",
    },
    {
      id: 3,
      action: "Progress diperbarui menjadi 60%",
      work: "Maintenance Genset Area Produksi",
      user: "Admin Contract",
      time: "3 jam lalu",
    },
  ];

  // =========================================================
  // FILTER
  // =========================================================

  const filteredWorks = useMemo(() => {
    if (selectedFilter === "ALL") return activeWorks;

    return activeWorks.filter((item) => item.health === selectedFilter);
  }, [selectedFilter]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getHealthStyle = (health) => {
    switch (health) {
      case "ON TRACK":
        return "bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100 dark:border-green-500/20";

      case "AT RISK":
        return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 border-yellow-100 dark:border-yellow-500/20";

      case "DELAYED":
        return "bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/20";

      default:
        return "bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10";
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Dashboard Contract
          </h1>

          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[2.5px] mt-1">
            Work & Contract Monitoring
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2.5 bg-white dark:bg-custom-gelap text-gray-400 rounded-xl border border-gray-100 dark:border-white/10 hover:text-custom-merah-terang transition-all"
        >
          <MdRefresh size={19} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* ACTIVE WORK */}
        <div className="bg-white dark:bg-custom-gelap rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Active Work
              </p>

              <p className="text-2xl font-black text-custom-gelap dark:text-white mt-1">
                {summary.activeWork}
              </p>

              <p className="text-[8px] text-gray-400 mt-0.5">pekerjaan aktif</p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
              <MdBusinessCenter size={19} />
            </div>
          </div>
        </div>

        {/* PENDING CONTRACT */}
        <div className="bg-white dark:bg-custom-gelap rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Pending Contract
              </p>

              <p className="text-2xl font-black text-custom-gelap dark:text-white mt-1">
                {summary.pendingContract}
              </p>

              <p className="text-[8px] text-gray-400 mt-0.5">
                belum memiliki kontrak
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <MdDescription size={19} />
            </div>
          </div>
        </div>

        {/* AT RISK */}
        <div className="bg-white dark:bg-custom-gelap rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                At Risk
              </p>

              <p className="text-2xl font-black text-yellow-600 mt-1">
                {summary.atRisk}
              </p>

              <p className="text-[8px] text-gray-400 mt-0.5">perlu perhatian</p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
              <MdWarning size={19} />
            </div>
          </div>
        </div>

        {/* DELAYED */}
        <div className="bg-white dark:bg-custom-gelap rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Delayed
              </p>

              <p className="text-2xl font-black text-red-600 mt-1">
                {summary.delayed}
              </p>

              <p className="text-[8px] text-gray-400 mt-0.5">melewati target</p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
              <MdAccessTime size={19} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          WORK PIPELINE
      ====================================================== */}

      <div className="bg-white dark:bg-custom-gelap rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm px-5 py-5">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
              Work Pipeline
            </h2>

            <p className="text-[8px] text-gray-400 mt-1">
              Distribusi pekerjaan berdasarkan lifecycle
            </p>
          </div>

          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
            24 Active
          </span>
        </div>

        {/* TIMELINE */}

        <div className="relative px-2">
          {/* GARIS */}
          <div className="absolute left-[8%] right-[8%] top-[15px] h-[2px] bg-gray-100 dark:bg-white/10" />

          {/* PROGRESS GARIS */}
          <div
            className="absolute left-[8%] top-[15px] h-[2px] bg-custom-merah-terang/60"
            style={{ width: "65%" }}
          />

          <div className="relative grid grid-cols-4">
            {pipeline.map((item, index) => {
              const isActive = index <= 2;

              return (
                <div
                  key={item.key}
                  className="flex flex-col items-center text-center"
                >
                  {/* DOT */}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-custom-gelap transition-all ${
                      isActive
                        ? "bg-custom-merah-terang text-white"
                        : "bg-gray-200 dark:bg-white/10 text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </div>

                  {/* LABEL */}
                  <p
                    className={`mt-3 text-[9px] font-black uppercase tracking-widest ${
                      isActive
                        ? "text-custom-gelap dark:text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </p>

                  {/* COUNT */}
                  <p
                    className={`text-xl font-black mt-0.5 ${
                      isActive ? "text-custom-merah-terang" : "text-gray-400"
                    }`}
                  >
                    {item.count}
                  </p>

                  {/* DESCRIPTION */}
                  <p className="text-[8px] text-gray-400 mt-0.5 hidden sm:block">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          NEEDS ATTENTION + RECENT ACTIVITY
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        {/* NEEDS ATTENTION */}

        <div className="bg-white dark:bg-custom-gelap rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                Needs Attention
              </h2>

              <p className="text-[8px] text-gray-400 mt-1">
                Tindakan yang perlu ditindaklanjuti
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 text-[8px] font-black">
              {attentionItems.length}
            </span>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* SEVERITY */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.severity === "DELAYED"
                        ? "bg-red-50 dark:bg-red-500/10 text-red-500"
                        : "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600"
                    }`}
                  >
                    {item.severity === "DELAYED" ? (
                      <MdAccessTime size={17} />
                    ) : (
                      <MdWarning size={17} />
                    )}
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-custom-gelap dark:text-white truncate">
                        {item.title}
                      </p>

                      <span
                        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full border text-[7px] font-black uppercase tracking-wider ${getHealthStyle(
                          item.severity === "DELAYED" ? "DELAYED" : "AT RISK",
                        )}`}
                      >
                        {item.severity === "DELAYED" ? "Delayed" : "At Risk"}
                      </span>
                    </div>

                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {item.work}
                    </p>

                    <p className="text-[8px] text-gray-400 mt-1 truncate">
                      {item.client} · {item.reason}
                    </p>
                  </div>

                  {/* DAYS */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-xs font-black ${
                        item.severity === "DELAYED"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {item.days}d
                    </p>

                    <p className="text-[7px] text-gray-400 uppercase font-black tracking-wider">
                      {item.severity === "DELAYED" ? "overdue" : "remaining"}
                    </p>
                  </div>

                  <button className="p-1.5 rounded-lg text-gray-300 hover:text-custom-merah-terang transition-colors">
                    <MdChevronRight size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY */}

        <div className="bg-white dark:bg-custom-gelap rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
              Recent Activity
            </h2>

            <p className="text-[8px] text-gray-400 mt-1">Aktivitas terbaru</p>
          </div>

          <div className="p-5">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-lg bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center flex-shrink-0">
                      {index === 0 ? (
                        <MdDescription size={14} />
                      ) : (
                        <MdSchedule size={14} />
                      )}
                    </div>

                    {index !== recentActivities.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 dark:bg-white/10 mt-1.5" />
                    )}
                  </div>

                  <div className="pb-3 min-w-0">
                    <p className="text-[10px] font-bold text-custom-gelap dark:text-white">
                      {activity.action}
                    </p>

                    <p className="text-[8px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {activity.work}
                    </p>

                    <p className="text-[7px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACTIVE WORK
      ====================================================== */}

      <div className="bg-white dark:bg-custom-gelap rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                Active Work
              </h2>

              <p className="text-[8px] text-gray-400 mt-1">
                Pekerjaan yang sedang ditangani
              </p>
            </div>

            <div className="flex gap-1 bg-gray-50 dark:bg-white/5 rounded-lg p-1">
              {["ALL", "ON TRACK", "AT RISK", "DELAYED"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2.5 py-1.5 rounded-md text-[7px] font-black uppercase tracking-wider transition-all ${
                    selectedFilter === filter
                      ? "bg-white dark:bg-custom-gelap text-custom-merah-terang shadow-sm"
                      : "text-gray-400"
                  }`}
                >
                  {filter === "ALL" ? "Semua" : filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[8px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3">Pekerjaan</th>

                <th className="px-5 py-3">Client</th>

                <th className="px-5 py-3">Stage</th>

                <th className="px-5 py-3 w-36">Progress</th>

                <th className="px-5 py-3">Health</th>

                <th className="px-5 py-3">Target</th>

                <th className="px-5 py-3 text-center">Opsi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredWorks.map((work) => (
                <tr
                  key={work.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-[10px] font-black text-custom-gelap dark:text-white">
                      {work.name}
                    </p>

                    <p className="text-[7px] text-gray-400 mt-0.5">
                      {work.contract !== "-"
                        ? work.contract
                        : "Belum ada kontrak"}
                    </p>
                  </td>

                  <td className="px-5 py-3.5 text-[9px] font-bold text-gray-500 dark:text-gray-300">
                    {work.client}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-300 text-[7px] font-black uppercase tracking-wider">
                      {work.stage}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
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

                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[7px] font-black uppercase tracking-wider ${getHealthStyle(
                        work.health,
                      )}`}
                    >
                      {work.health}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <MdCalendarToday size={11} />

                      <span className="text-[8px] font-bold">
                        {work.endDate}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <button className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-custom-merah-terang hover:text-white transition-all">
                      <MdChevronRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          FOOTER INFO
      ====================================================== */}

      <div className="px-4 py-3 bg-white dark:bg-custom-gelap rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
        <MdInfoOutline
          size={18}
          className="text-custom-merah-terang flex-shrink-0"
        />

        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
          Dashboard menampilkan kondisi operasional pekerjaan dan kontrak yang
          membutuhkan perhatian Admin Contract.
        </p>
      </div>
    </div>
  );
};

export default DashboardContract;
