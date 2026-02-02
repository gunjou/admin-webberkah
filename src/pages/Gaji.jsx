import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MdSearch,
  MdFileDownload,
  MdPayments,
  MdCalendarToday,
  MdOutlineInfo,
  MdClose,
} from "react-icons/md";
import Api from "../utils/Api";
import Swal from "sweetalert2";

const Gaji = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [payrollData, setPayrollData] = useState([]);
  const [summary, setSummary] = useState(null);

  // slip preview state
  const [showSimulasi, setShowSimulasi] = useState(false);
  const [simulasiData, setSimulasiData] = useState(null);
  const [loadingSimulasi, setLoadingSimulasi] = useState(false);

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

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const periode = `${String(selectedMonth).padStart(2, "0")}-${selectedYear}`;

      // FETCH SEMUA SUMBER DATA SECARA PARALEL
      const [resPayroll, resKomponen, resPotHutang, resLembur] =
        await Promise.all([
          Api.get("/payroll", { params: { periode } }),
          Api.get("/payroll/komponen-gaji"),
          Api.get("/hutang/pembayaran", {
            params: { bulan: selectedMonth, tahun: selectedYear },
          }),
          Api.get("/lembur/rekap/summary", {
            params: {
              bulan: selectedMonth,
              tahun: selectedYear,
              status_approval: "approved",
            },
          }),
        ]);

      const listPayroll = resPayroll.data.data.data;
      const listKomponen = resKomponen.data.data.data;
      const listPotHutang = resPotHutang.data.data;
      const listLembur = resLembur.data.data; // Data lembur pegawai

      const mergedData = listPayroll.map((p) => {
        const detailK = listKomponen.find((k) => k.id_pegawai === p.id_pegawai);

        // 1. Ambil Potongan Hutang (Hanya metode potong_gaji)
        const hutangPegawai = listPotHutang
          .filter(
            (h) => h.id_pegawai === p.id_pegawai && h.metode === "potong_gaji",
          )
          .reduce((acc, curr) => acc + curr.jumlah, 0);

        // 2. Ambil Upah Lembur dari Rekap Summary
        const upahLembur =
          listLembur.find((l) => l.id_pegawai === p.id_pegawai)
            ?.total_upah_lembur || 0;

        const getVal = (kode) =>
          detailK?.komponen_gaji.find((c) => c.kode === kode)?.nilai || 0;

        return {
          ...p,
          gapok: getVal("GAPOK"),
          t_jab: getVal("T_JAB"),
          t_mkn: getVal("T_MKN"),
          t_trp: getVal("T_TRP"),
          t_khs: getVal("T_KHS"),
          potongan_hutang: hutangPegawai,
          lembur: upahLembur, // Sekarang nilai lembur diambil dari API Lembur
        };
      });

      // HITUNG AKUMULASI UNTUK FOOTER SUMMARY
      const totalHutang = mergedData.reduce(
        (acc, row) => acc + row.potongan_hutang,
        0,
      );
      const totalLembur = mergedData.reduce((acc, row) => acc + row.lembur, 0);

      // Subtotal = (Total Diterima Backend - Potongan Hutang)
      const totalSubtotal = mergedData.reduce(
        (acc, row) => acc + (row.total_diterima - row.potongan_hutang),
        0,
      );

      // Grand Total = Subtotal + Lembur
      const grandTotal = totalSubtotal + totalLembur;

      setPayrollData(mergedData);
      setSummary({
        jumlah_pegawai: mergedData.length,
        total_pot_hutang: totalHutang,
        total_lembur: totalLembur,
        total_basic: totalSubtotal,
        grand_total: grandTotal,
      });
    } catch (err) {
      console.error("Gagal sinkronisasi data payroll lengkap:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const handleSimulate = async (id_pegawai) => {
    setShowSimulasi(true);
    setLoadingSimulasi(true);
    try {
      // Jalankan simulasi payroll dan fetch rekap lembur harian secara paralel
      const [resSimulasi, resLemburDetail] = await Promise.all([
        Api.post("/payroll/simulate", {
          id_pegawai,
          bulan: selectedMonth,
          tahun: selectedYear,
        }),
        Api.get("/lembur/rekap", {
          params: {
            id_pegawai,
            bulan: selectedMonth,
            tahun: selectedYear,
            status_approval: "approved",
          },
        }),
      ]);

      const pData = payrollData.find((p) => p.id_pegawai === id_pegawai);

      setSimulasiData({
        ...resSimulasi.data.data,
        potongan_hutang: pData?.potongan_hutang || 0,
        lembur: pData?.lembur || 0,
        detail_lembur: resLemburDetail.data.data, // Data harian lembur
      });
    } catch (err) {
      console.error("Gagal simulasi:", err);
    } finally {
      setLoadingSimulasi(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-1">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-1">
        <div>
          <h1 className="text-2xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
            Payroll & Settlement
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
            Periode Berjalan:{" "}
            <span className="text-custom-merah-terang">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          {/* Month & Year Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-custom-gelap p-1 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <MdCalendarToday className="ml-2 text-custom-cerah" size={14} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent border-none text-[10px] font-black outline-none dark:text-white cursor-pointer px-1 py-1.5"
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>
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

          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
            <MdFileDownload size={18} /> Export Laporan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in zoom-in duration-300">
          {[
            {
              label: "Total Pegawai",
              val: `${summary.jumlah_pegawai} Pegawai`,
              color: "border-gray-200",
              text: "dark:text-white",
            },
            {
              label: "Gaji Pokok & Tunj",
              val: `Rp ${Math.floor(summary.total_basic).toLocaleString()}`,
              color: "border-l-blue-500",
              text: "text-blue-600",
            },
            {
              label: "Total Lemburan",
              val: `Rp ${summary.total_lembur.toLocaleString()}`,
              color: "border-l-orange-500",
              text: "text-orange-500",
            },
            {
              label: "Grand Total (Net)",
              val: `Rp ${Math.floor(summary.grand_total).toLocaleString()}`,
              color: "border-l-green-600",
              text: "text-green-600",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-white dark:bg-custom-gelap p-3.5 rounded-[25px] border border-gray-100 dark:border-white/5 shadow-sm border-l-4 ${card.color}`}
            >
              <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                {card.label}
              </p>
              <h3 className={`text-base font-black italic ${card.text}`}>
                {card.val}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* Table Payroll - Ultra Compact Dual Sticky */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[385px]">
        {" "}
        <div className="flex-1 overflow-auto no-scrollbar relative">
          <table className="w-full text-[8.5px] border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#3d2e39] font-black uppercase tracking-widest text-gray-400">
                {/* HEADER STICKY TOP */}
                <th className="p-3 text-left sticky left-0 top-0 bg-gray-50 dark:bg-[#3d2e39] z-[50] w-[180px] border-b border-gray-100 dark:border-white/10 text-[8.5px]">
                  Data Pegawai
                </th>
                <th className="px-1 py-2 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] border-b border-gray-100 dark:border-white/10 italic w-[40px]">
                  HK
                </th>
                <th className="px-1 py-2 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] border-b border-gray-100 dark:border-white/10">
                  Gapok
                </th>
                <th className="px-1 py-2 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] border-b border-gray-100 dark:border-white/10">
                  T.Jab
                </th>
                <th className="px-1 py-2 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] border-b border-gray-100 dark:border-white/10">
                  T.Mkn
                </th>
                <th className="px-1 py-2 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] border-b border-gray-100 dark:border-white/10">
                  T.Trp
                </th>
                <th className="px-1 py-2 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] border-b border-gray-100 dark:border-white/10">
                  T.Khs
                </th>
                <th className="px-1 py-2 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] text-red-500 border-b border-gray-100 dark:border-white/10">
                  Pot.Abs
                </th>
                <th className="px-1 py-2 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] text-orange-600 border-b border-gray-100 dark:border-white/10">
                  Pot.Hut
                </th>

                <th className="px-2 py-2 text-right sticky top-0 z-[40] bg-red-50 dark:bg-[#4a2b2f] text-custom-merah-terang border-b border-red-100 dark:border-red-500/10 border-l min-w-[110px]">
                  Subtotal
                </th>
                <th className="px-2 py-2 text-right sticky top-0 z-[40] bg-orange-50 dark:bg-[#4d3a2b] text-orange-600 border-b border-orange-100 dark:border-orange-500/10 min-w-[90px]">
                  Lembur
                </th>
                <th className="px-3 py-2 text-right sticky top-0 z-[40] bg-green-50 dark:bg-[#2b4d36] text-green-700 border-b border-green-100 dark:border-green-500/10 min-w-[120px]">
                  Total NET
                </th>
                <th className="px-3 py-2 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-[40] border-b border-gray-100 dark:border-white/10">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5 relative">
              {loading ? (
                /* LOADING STATE - Menjaga tinggi agar spinner tetap di tengah */
                <tr>
                  <td colSpan="13" className="p-0">
                    <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-white/50 dark:bg-custom-gelap/50 backdrop-blur-[1px]">
                      <div className="relative">
                        {/* Outer Ring */}
                        <div className="w-12 h-12 border-4 border-custom-cerah/20 border-t-custom-cerah rounded-full animate-spin"></div>
                        {/* Inner Dot */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-custom-merah-terang rounded-full animate-pulse"></div>
                      </div>
                      <p className="mt-4 text-[10px] font-black uppercase tracking-[4px] text-gray-400 animate-pulse italic">
                        Sinkronisasi Payroll...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : payrollData.length === 0 ? (
                /* EMPTY STATE */
                <tr>
                  <td colSpan="13" className="py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                      Data tidak ditemukan untuk periode ini
                    </p>
                  </td>
                </tr>
              ) : (
                /* DATA STATE */
                payrollData.map((row) => {
                  const potHutang = row.potongan_hutang || 0;
                  const tKhusus = row.t_khs || 0;
                  const subtotalBase = row.total_diterima - potHutang;
                  const lembur = row.lembur || 0;
                  const finalNet = subtotalBase + lembur;

                  return (
                    <tr
                      key={row.id_payroll}
                      className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                    >
                      <td className="p-2 sticky left-0 bg-white dark:bg-custom-gelap z-[30] border-r border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="flex items-center gap-2 pl-1">
                          <div className="w-6 h-6 rounded-lg bg-custom-merah-terang text-white flex items-center justify-center font-black text-[8px] uppercase shadow-sm">
                            {row.nama_lengkap.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-custom-gelap dark:text-white uppercase leading-tight truncate text-[8.5px]">
                              {row.nama_lengkap}
                            </p>
                            <p className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">
                              {row.nama_status}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center font-black text-custom-cerah">
                        {row.total_hari_kerja}
                      </td>
                      <td className="px-1 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                        Rp {row.gapok.toLocaleString()}
                      </td>
                      <td className="px-1 py-2 text-right text-gray-500">
                        {row.t_jab.toLocaleString()}
                      </td>
                      <td className="px-1 py-2 text-right text-gray-500">
                        {row.t_mkn.toLocaleString()}
                      </td>
                      <td className="px-1 py-2 text-right text-gray-500">
                        {row.t_trp.toLocaleString()}
                      </td>
                      <td className="px-1 py-2 text-right text-gray-500">
                        {tKhusus.toLocaleString()}
                      </td>
                      <td className="px-1 py-2 text-right font-bold text-red-500">
                        -{Math.floor(row.total_potongan).toLocaleString()}
                      </td>
                      <td className="px-1 py-2 text-right font-bold text-orange-600">
                        -{potHutang.toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-right font-black bg-red-50/30 dark:bg-red-500/5 text-custom-merah-terang">
                        Rp {Math.floor(subtotalBase).toLocaleString()}
                      </td>
                      <td className="px-2 py-2 text-right font-black bg-orange-50/20 dark:bg-orange-500/5 text-orange-600">
                        +Rp {lembur.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right bg-green-50/50 dark:bg-green-500/5">
                        <span className="text-[9.5px] font-black text-green-700 dark:text-green-400 underline decoration-double underline-offset-2 italic">
                          Rp {Math.floor(finalNet).toLocaleString()}
                        </span>
                      </td>
                      <td
                        onClick={() => handleSimulate(row.id_pegawai)}
                        className="px-3 py-2 text-center"
                      >
                        <button className="p-1.5 bg-custom-merah-terang text-white rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm">
                          <MdPayments size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* FOOTER STICKY BOTTOM - RAMPING */}
            <tfoot className="sticky bottom-0 z-[60]">
              <tr className="text-custom-gelap dark:text-white italic bg-gray-100 dark:bg-[#322730] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] text-[7.5px]">
                <td className="p-3 sticky left-0 bg-gray-100 dark:bg-[#322730] border-r border-gray-200 dark:border-white/10 uppercase tracking-widest font-black z-[70]">
                  Total Akumulasi
                </td>
                <td className="w-[40px] bg-gray-100 dark:bg-[#322730]"></td>
                <td
                  colSpan="6"
                  className="p-1 text-right opacity-40 uppercase tracking-tighter bg-gray-100 dark:bg-[#322730] font-black italic"
                >
                  Summary Report —&gt;
                </td>

                {/* Total Potongan Hutang */}
                <td className="px-1 py-2 text-right text-orange-600 font-black bg-gray-100 dark:bg-[#322730]">
                  -Rp {summary?.total_pot_hutang?.toLocaleString()}
                </td>

                {/* Total Subtotal (Setelah Potong Hutang) */}
                <td className="px-2 py-2 text-right text-custom-merah-terang font-black border-l border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#322730] min-w-[110px]">
                  Rp {Math.floor(summary?.total_basic || 0).toLocaleString()}
                </td>

                {/* Total Lembur */}
                <td className="px-2 py-2 text-right text-orange-600 font-black bg-gray-100 dark:bg-[#322730] min-w-[90px]">
                  Rp {(summary?.total_lembur || 0).toLocaleString()}
                </td>

                {/* Grand Total */}
                <td className="px-3 py-2 text-right text-green-700 dark:text-green-400 text-[9.5px] font-black bg-gray-100 dark:bg-[#322730] min-w-[120px]">
                  Rp {Math.floor(summary?.grand_total || 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 bg-gray-100 dark:bg-[#322730]"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Info Perhitungan - Compact Version */}
      <div className="p-1 bg-white dark:bg-custom-gelap rounded-[25px] border border-gray-100 dark:border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-custom-cerah/10 flex items-center justify-center flex-shrink-0">
          <MdOutlineInfo className="text-custom-cerah" size={18} />
        </div>
        <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">
          <span className="font-black text-custom-gelap dark:text-white uppercase tracking-widest mr-2">
            Metrik:
          </span>
          1.{" "}
          <span className="font-bold text-custom-merah-terang">Subtotal</span> =
          (Pokok + Tunjangan) - Potongan.
          <span className="mx-2 text-gray-300">|</span>
          2. <span className="font-bold text-green-600">Total Net</span> =
          Subtotal + Lembur.
          <span className="mx-2 text-gray-300">|</span>
          3. <span className="font-bold text-orange-600">HK</span> = Hari Kerja
        </div>
      </div>

      {showSimulasi &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowSimulasi(false)}
          >
            <div
              className="bg-white dark:bg-custom-gelap w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/20 flex flex-col overflow-hidden max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {loadingSimulasi ? (
                <div className="p-20 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                    Mensimulasikan Payroll...
                  </p>
                </div>
              ) : (
                <>
                  {/* Header Modal */}
                  <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div>
                      <h3 className="text-base font-black text-custom-gelap dark:text-white uppercase italic tracking-tighter">
                        Rincian Payroll Pegawai
                      </h3>
                      <p className="text-[9px] text-custom-cerah font-bold uppercase tracking-widest">
                        {simulasiData?.pegawai.nama_lengkap} •{" "}
                        {simulasiData?.periode}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSimulasi(false)}
                      className="p-2 text-gray-400 hover:text-custom-merah-terang transition-all"
                    >
                      <MdClose size={24} />
                    </button>
                  </div>

                  {/* Body Modal - Scrollable */}
                  <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
                    {/* 1. Pendapatan (Earnings) */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                        <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                          Komponen Pendapatan
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {simulasiData?.pendapatan.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10"
                          >
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                              {item.nama}
                            </span>
                            <span className="text-[10px] font-black text-custom-gelap dark:text-white italic">
                              Rp {item.nilai.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Potongan (Deductions) - Itemized by Date */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                        <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                          Daftar Potongan (Absensi/Terlambat)
                        </h4>
                      </div>
                      <div className="bg-red-50/30 dark:bg-red-500/5 rounded-3xl border border-red-100 dark:border-red-500/10 overflow-hidden">
                        <table className="w-full text-[9px]">
                          <thead className="bg-red-50 dark:bg-red-500/10 text-red-600 font-black uppercase">
                            <tr>
                              <th className="p-2 text-left">Tanggal</th>
                              <th className="p-2 text-left">Kode</th>
                              <th className="p-2 text-right">Potongan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-100/50 dark:divide-red-500/10">
                            {simulasiData?.potongan.length > 0 ? (
                              simulasiData.potongan.map((pot, idx) => (
                                <tr
                                  key={idx}
                                  className="text-gray-500 dark:text-gray-400"
                                >
                                  <td className="p-2 font-medium">
                                    {pot.tanggal}
                                  </td>
                                  <td className="p-2 font-black text-[8px] uppercase">
                                    {pot.kode}
                                  </td>
                                  <td className="p-2 text-right font-bold text-red-500">
                                    -{pot.nilai.toLocaleString()}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="3"
                                  className="p-4 text-center italic text-gray-400"
                                >
                                  Tidak ada potongan bulan ini
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. Potongan Hutang (Hutang/Kasbon) */}
                    {simulasiData?.potongan_hutang > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                          <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            Potongan Hutang & Kasbon
                          </h4>
                        </div>
                        <div className="p-4 bg-orange-50/30 dark:bg-orange-500/5 rounded-3xl border border-orange-100 dark:border-orange-500/10 flex justify-between items-center group hover:border-orange-500/30 transition-all">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                              Cicilan Periode Ini
                            </span>
                            <span className="text-[8px] text-gray-400 font-medium uppercase italic">
                              Metode: Potong Gaji
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-orange-600 italic">
                              -Rp{" "}
                              {simulasiData.potongan_hutang.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. Detail Upah Lembur (Itemized by Date) */}
                    {simulasiData?.detail_lembur?.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                          <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            Rincian Kerja Lembur (Approved)
                          </h4>
                        </div>
                        <div className="bg-blue-50/30 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/10 overflow-hidden">
                          <table className="w-full text-[8.5px]">
                            <thead className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-black uppercase">
                              <tr>
                                <th className="p-2 text-left">Tanggal</th>
                                <th className="p-2 text-center">Durasi</th>
                                <th className="p-2 text-center">Pengali</th>
                                <th className="p-2 text-right">Upah</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100/50 dark:divide-blue-500/10 text-gray-600 dark:text-gray-400">
                              {simulasiData.detail_lembur.map((item, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors"
                                >
                                  <td className="p-2 font-medium">
                                    {item.tanggal}
                                    {item.hari_libur && (
                                      <span className="ml-1 text-[7px] bg-red-500 text-white px-1 rounded">
                                        Libur
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2 text-center font-bold">
                                    {(item.menit_lembur / 60).toFixed(1)} Jam
                                  </td>
                                  <td className="p-2 text-center italic">
                                    x{item.pengali}
                                  </td>
                                  <td className="p-2 text-right font-black text-blue-600">
                                    Rp {item.upah_lembur.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-blue-50/50 dark:bg-blue-500/10 font-black text-blue-700 dark:text-blue-400">
                                <td
                                  colSpan="3"
                                  className="p-2 text-right uppercase tracking-tighter"
                                >
                                  Total Upah Lembur
                                </td>
                                <td className="p-2 text-right underline decoration-double">
                                  Rp {simulasiData.lembur.toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Modal - Tetap Sticky di Bawah */}
                  <div className="p-6 bg-custom-gelap text-white border-t border-white/5 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="flex gap-4 text-[8px] font-black uppercase text-gray-400 tracking-tighter">
                          <span>
                            Hadir: {simulasiData?.statistik.total_hari_kerja} HK
                          </span>
                          <span>
                            Terlambat:{" "}
                            {simulasiData?.statistik.total_menit_terlambat}m
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-300 italic opacity-60 leading-tight">
                          * Nilai akhir sudah mencakup komponen lembur <br />{" "}
                          dan pemotongan hutang pegawai.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">
                          Total Akhir Diterima
                        </p>
                        <h2 className="text-2xl font-black text-custom-cerah italic leading-none">
                          Rp{" "}
                          {Math.floor(
                            (simulasiData?.ringkasan.total_diterima || 0) -
                              (simulasiData?.potongan_hutang || 0) +
                              (simulasiData?.lembur || 0),
                          ).toLocaleString()}
                        </h2>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Gaji;
