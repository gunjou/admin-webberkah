import React from "react";
import { MdApartment, MdDateRange, MdRefresh } from "react-icons/md";

const PengajuanFilter = ({
  filter,
  setFilter,
  departemen,
  onReset,
  viewMode,
}) => {
  const statusTabs =
    viewMode === "ACTIVE"
      ? [
          {
            value: "ACTIVE",
            label: "Aktif",
            light: "#A91D24",
            dark: "#B77171",
          },
          {
            value: "REQUESTED",
            label: "Requested",
            light: "#CA8A04",
            dark: "#FACC15",
          },
          {
            value: "REVIEWED",
            label: "Reviewed",
            light: "#059669",
            dark: "#12a878",
          },
          {
            value: "APPROVED",
            label: "Approved",
            light: "#16A34A",
            dark: "#7ce9a4",
          },
        ]
      : [
          { value: "PAID", label: "Paid", light: "#0284C7", dark: "#7DD3FC" },
          {
            value: "REJECTED",
            label: "Rejected",
            light: "#B91C1C",
            dark: "#FCA5A5",
          },
        ];

  return (
    <div className="bg-white dark:bg-custom-gelap p-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex h-[42px] bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 items-center gap-1 overflow-x-auto shrink-0">
          {statusTabs.map((tab) => {
            const isActive = filter.status === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  setFilter((prev) => ({ ...prev, status: tab.value }))
                }
                style={isActive ? { backgroundColor: tab.light } : undefined}
                className={`flex-1 h-full min-w-28 py-2 text-[8px] md:text-[9px] font-black uppercase rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-white shadow-md scale-[1.02] dark:text-custom-gelap"
                    : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <MdApartment
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-cerah pointer-events-none"
            />
            <select
              value={filter.id_departemen}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  id_departemen: e.target.value,
                }))
              }
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] font-bold text-custom-gelap dark:text-white outline-none appearance-none cursor-pointer"
            >
              <option value="">Semua Departemen</option>
              {departemen
                .filter((item) => item.status === 1)
                .map((item) => (
                  <option key={item.id_departemen} value={item.id_departemen}>
                    {item.nama_departemen}
                  </option>
                ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-0">
            <MdDateRange
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-cerah pointer-events-none"
            />
            <input
              type="date"
              value={filter.tanggal_mulai}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  tanggal_mulai: e.target.value,
                }))
              }
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] font-bold text-custom-gelap dark:text-white outline-none cursor-pointer"
            />
          </div>

          <div className="relative flex-1 min-w-0">
            <MdDateRange
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-cerah pointer-events-none"
            />
            <input
              type="date"
              value={filter.tanggal_selesai}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  tanggal_selesai: e.target.value,
                }))
              }
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] font-bold text-custom-gelap dark:text-white outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={onReset}
            className="h-10 w-24 shrink-0 rounded-xl flex items-center justify-center gap-2 bg-custom-gelap dark:bg-custom-cerah text-white text-[9px] font-black uppercase tracking-wider hover:bg-custom-merah dark:hover:bg-custom-merah-terang transition-all"
          >
            <MdRefresh size={16} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PengajuanFilter;
