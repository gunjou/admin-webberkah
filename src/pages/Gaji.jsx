import React, { useState } from "react";
import {
  MdSearch,
  MdFileDownload,
  MdPayments,
  MdAccountBalanceWallet,
  MdCalendarToday,
  MdAttachMoney,
  MdOutlineInfo,
} from "react-icons/md";

const Gaji = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(2026);

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const [dataGaji, setDataGaji] = useState([
    {
      id: 1,
      nama: "Gugun Ichijo",
      dept: "Operational",
      pokok: 5000000,
      t_jabatan: 1000000,
      t_transport: 500000,
      t_makan: 500000,
      t_khusus: 250000,
      potongan: 100000,
      hutang: 200000,
      lembur: 450000,
    },
    {
      id: 2,
      nama: "Andi Saputra",
      dept: "Finance",
      pokok: 4500000,
      t_jabatan: 0,
      t_transport: 400000,
      t_makan: 400000,
      t_khusus: 0,
      potongan: 50000,
      hutang: 0,
      lembur: 0,
    },
    {
      id: 3,
      nama: "Andi Saputra",
      dept: "Finance",
      pokok: 4500000,
      t_jabatan: 0,
      t_transport: 400000,
      t_makan: 400000,
      t_khusus: 0,
      potongan: 50000,
      hutang: 0,
      lembur: 0,
    },
    {
      id: 4,
      nama: "Andi Saputra",
      dept: "Finance",
      pokok: 4500000,
      t_jabatan: 0,
      t_transport: 400000,
      t_makan: 400000,
      t_khusus: 0,
      potongan: 50000,
      hutang: 0,
      lembur: 0,
    },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Section - Integrated Filters, Status, & Export */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 animate-in slide-in-from-top duration-500">
        {/* Judul & Periode */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Payroll & Settlement
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Laporan{" "}
            <span className="text-custom-merah-terang">
              {monthNames[selectedMonth]} {selectedYear}
            </span>
          </p>
        </div>

        {/* Integrated Toolbar Area */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* 1. Search Bar */}
          <div className="relative flex-1 md:flex-none md:w-56">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari pegawai..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-medium outline-none focus:ring-1 focus:ring-custom-merah-terang/30 transition-all shadow-sm dark:text-white"
            />
          </div>

          {/* 2. Filter Status Pegawai (New) */}
          <div className="flex items-center bg-white dark:bg-custom-gelap px-2 py-1 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-tight outline-none dark:text-white cursor-pointer py-1.5">
              <option value="all">Semua Pegawai</option>
              <option value="tetap">Pegawai Tetap</option>
              <option value="tidak-tetap">Tidak Tetap</option>
              <option value="magang">Pegawai Magang</option>
            </select>
          </div>

          {/* 3. Month & Year Selectors */}
          <div className="flex items-center gap-1 bg-white dark:bg-custom-gelap p-1 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <MdCalendarToday className="ml-2 text-custom-cerah" size={14} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent border-none text-[10px] font-black outline-none dark:text-white cursor-pointer px-1 py-1.5"
            >
              {monthNames.map((name, i) => (
                <option key={i} value={i}>
                  {name.substring(0, 3)}
                </option>
              ))}
            </select>
            <div className="w-[1px] h-3 bg-gray-200 dark:bg-white/20"></div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent border-none text-[10px] font-black outline-none dark:text-white cursor-pointer px-1 pr-2"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          {/* 4. Export Button */}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-custom-merah-terang text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 active:scale-95 transition-all">
            <MdFileDownload size={18} /> Export
          </button>
        </div>
      </div>

      {/* Table Payroll Detail - High Precision Accounting Version */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[370px]">
        {/* Area Scrollable Utama */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-[10px] border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#3d2e39] font-black uppercase tracking-widest text-gray-400">
                {/* Pojok Kiri Atas - Sticky Double (Atas & Kiri) */}
                <th className="p-4 text-left sticky left-0 top-0 bg-gray-50 dark:bg-[#3d2e39] z-40 border-b border-gray-100 dark:border-white/10 w-[220px]">
                  Data Pegawai
                </th>
                <th className="p-3 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10">
                  Gaji Pokok
                </th>
                <th className="p-3 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10">
                  T. Jabatan
                </th>
                <th className="p-3 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10">
                  T. Transp
                </th>
                <th className="p-3 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10">
                  T. Makan
                </th>
                <th className="p-3 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10">
                  T. Khusus
                </th>
                <th className="p-3 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 text-red-500">
                  Potongan
                </th>

                {/* Kolom Hutang - Sticky Top */}
                <th className="p-3 text-right sticky top-0 z-30 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-500/10 text-orange-600">
                  Hutang
                </th>

                {/* Gaji Sblm Lembur - Sticky Top */}
                <th className="p-3 text-right sticky top-0 z-30 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-500/10 text-custom-merah-terang min-w-[120px]">
                  Gaji Sblm Lembr
                </th>

                <th className="p-3 text-right sticky top-0 z-30 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-500/10 text-blue-600">
                  Lembur
                </th>

                {/* Gaji Bersih - Sticky Top */}
                <th className="p-4 text-right sticky top-0 z-30 bg-green-50 dark:bg-green-950/20 border-b border-green-100 dark:border-green-500/10 text-green-700 min-w-[130px]">
                  Gaji Bersih
                </th>

                <th className="p-4 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataGaji.map((row) => {
                const totalTunjangan =
                  row.t_jabatan + row.t_transport + row.t_makan + row.t_khusus;
                const gajiSblmLembur =
                  row.pokok + totalTunjangan - row.potongan - row.hutang;
                const netGaji = gajiSblmLembur + row.lembur;

                return (
                  <tr
                    key={row.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                  >
                    {/* Kolom Pegawai - Sticky Left */}
                    <td className="p-2 sticky left-0 bg-white dark:bg-custom-gelap z-20 border-r border-gray-100 dark:border-white/10 shadow-[4px_0_8px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center gap-2 pl-2">
                        <div className="w-7 h-7 rounded-lg bg-custom-gelap text-custom-cerah flex items-center justify-center font-black text-[8px] flex-shrink-0">
                          {row.nama.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-custom-gelap dark:text-white leading-none truncate">
                            {row.nama}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span
                              className={`text-[7px] font-black px-1 rounded-sm uppercase ${
                                row.status_pegawai === "Tetap"
                                  ? "bg-blue-100 text-blue-600"
                                  : row.status_pegawai === "Tidak Tetap"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {row.status_pegawai || "Tetap"}
                            </span>
                            <span className="text-[7px] text-gray-400 font-medium truncate">
                              | {row.dept}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Data Angka - Ramping (p-2.5) */}
                    <td className="p-2.5 text-right font-medium text-gray-600 dark:text-gray-400">
                      {row.pokok.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-gray-500">
                      {row.t_jabatan.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-gray-500">
                      {row.t_transport.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-gray-500">
                      {row.t_makan.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right text-gray-500">
                      {row.t_khusus.toLocaleString()}
                    </td>

                    <td className="p-2.5 text-right font-bold text-red-500">
                      -{row.potongan.toLocaleString()}
                    </td>

                    {/* Hutang */}
                    <td className="p-2.5 text-right font-bold bg-orange-50/20 dark:bg-orange-500/5 text-orange-600">
                      <div className="flex flex-col items-end">
                        <span>-{row.hutang.toLocaleString()}</span>
                        {row.hutang > 0 && (
                          <span className="text-[6px] bg-orange-500 text-white px-1 rounded uppercase tracking-tighter mt-0.5">
                            Potong
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gaji Sblm Lembur */}
                    <td className="p-2.5 text-right font-black bg-red-50/50 dark:bg-red-500/5 text-custom-merah-terang">
                      {gajiSblmLembur.toLocaleString()}
                    </td>

                    {/* Lembur */}
                    <td className="p-2.5 text-right font-bold bg-blue-50/50 dark:bg-blue-500/5 text-blue-600">
                      +{row.lembur.toLocaleString()}
                    </td>

                    {/* Gaji Bersih */}
                    <td className="p-2.5 text-right bg-green-50/50 dark:bg-green-500/5">
                      <span className="text-[11px] font-black text-green-700 dark:text-green-400 underline decoration-double underline-offset-2">
                        Rp {netGaji.toLocaleString()}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="p-2.5 text-center">
                      <button className="p-1.5 bg-custom-merah-terang text-white rounded-lg hover:bg-custom-gelap transition-all shadow-sm">
                        <MdPayments size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FIXED FOOTER (Tetap terlihat di bawah) */}
        <div className="bg-gray-100 dark:bg-white/10 border-t border-gray-200 dark:border-white/10 z-40 overflow-hidden">
          <table className="w-full text-[9px] font-black min-w-[500px]">
            <tfoot>
              <tr className="text-custom-gelap dark:text-white italic bg-gray-50 dark:bg-[#322730]">
                <td className="p-4 w-[220px] sticky left-0 bg-gray-50 dark:bg-[#322730] border-r border-gray-200 dark:border-white/10 uppercase tracking-widest">
                  Grand Total
                </td>
                <td className="p-3 pr-0 text-right">
                  {dataGaji.reduce((a, b) => a + b.pokok, 0).toLocaleString()}
                </td>
                <td className="p-3 pr-0 text-right text-gray-400">
                  {dataGaji
                    .reduce((a, b) => a + b.t_jabatan, 0)
                    .toLocaleString()}
                </td>
                <td className="p-3 pr-0 text-right text-gray-400">
                  {dataGaji
                    .reduce((a, b) => a + b.t_transport, 0)
                    .toLocaleString()}
                </td>
                <td className="p-3 text-right text-gray-400">
                  {dataGaji.reduce((a, b) => a + b.t_makan, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right text-gray-400">
                  {dataGaji
                    .reduce((a, b) => a + b.t_khusus, 0)
                    .toLocaleString()}
                </td>
                <td className="p-3 text-right text-red-500">
                  {dataGaji
                    .reduce((a, b) => a + b.potongan, 0)
                    .toLocaleString()}
                </td>
                <td className="p-3 pr-0 text-right text-orange-600">
                  {dataGaji.reduce((a, b) => a + b.hutang, 0).toLocaleString()}
                </td>
                <td className="p-3 pl-8 text-right text-custom-merah-terang underline">
                  {dataGaji
                    .reduce(
                      (acc, b) =>
                        acc +
                        (b.pokok +
                          b.t_jabatan +
                          b.t_transport +
                          b.t_makan +
                          b.t_khusus -
                          b.potongan -
                          b.hutang),
                      0
                    )
                    .toLocaleString()}
                </td>
                <td className="p-3 pl-4 text-right text-blue-600">
                  {dataGaji.reduce((a, b) => a + b.lembur, 0).toLocaleString()}
                </td>
                <td className="p-4 text-right text-green-700 dark:text-green-400 text-xs">
                  Rp{" "}
                  {dataGaji
                    .reduce(
                      (acc, b) =>
                        acc +
                        (b.pokok +
                          b.t_jabatan +
                          b.t_transport +
                          b.t_makan +
                          b.t_khusus -
                          b.potongan -
                          b.hutang +
                          b.lembur),
                      0
                    )
                    .toLocaleString()}
                </td>
                <td className="w-[60px]"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-5 bg-white dark:bg-custom-gelap rounded-[30px] border border-gray-100 dark:border-white/5 flex items-start gap-3">
        <MdOutlineInfo className="text-custom-cerah mt-0.5" size={20} />
        <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
          <span className="font-bold text-custom-gelap dark:text-white uppercase block mb-1">
            Rumus Perhitungan:
          </span>
          1.{" "}
          <span className="text-custom-merah-terang font-bold">
            Gaji Sblm Lembur
          </span>{" "}
          = (Gaji Pokok + Total Tunjangan) - Potongan - Hutang. <br />
          2. <span className="text-green-600 font-bold">
            Gaji Bersih (Net)
          </span>{" "}
          = Gaji Sblm Lembur + Akumulasi Lembur.
        </div>
      </div>
    </div>
  );
};

export default Gaji;
