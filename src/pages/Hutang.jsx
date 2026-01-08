import React, { useState } from "react";
import {
  MdSearch,
  MdAddCircle,
  MdHistory,
  MdPayments,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdErrorOutline,
  MdFilterList,
  MdArrowForward,
  MdClose,
} from "react-icons/md";

const Hutang = () => {
  const [viewStatus, setViewStatus] = useState("belum_lunas");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);

  // Dummy Data - Akumulasi Hutang per Pegawai
  const dataHutangSummary = [
    {
      id: 1,
      nama: "Gugun Ichijo",
      nip: "PEG-001",
      dept: "Operational",
      total_pinjaman: 5000000,
      total_bayar: 2000000,
      sisa_hutang: 3000000,
      last_update: "2026-01-05",
      status: "Belum Lunas",
      history: [
        {
          id: 101,
          tgl: "2025-11-10",
          jenis: "Kasbon",
          nominal: 3000000,
          ket: "Kebutuhan Darurat",
          status: "Cicil",
        },
        {
          id: 102,
          tgl: "2025-12-15",
          jenis: "Pinjaman",
          nominal: 2000000,
          ket: "Biaya Sekolah",
          status: "Belum Bayar",
        },
      ],
    },
    {
      id: 2,
      nama: "Andi Saputra",
      nip: "PEG-002",
      dept: "Finance",
      total_pinjaman: 1000000,
      total_bayar: 1000000,
      sisa_hutang: 0,
      last_update: "2025-12-20",
      status: "Lunas",
      history: [
        {
          id: 103,
          tgl: "2025-10-01",
          jenis: "Kasbon",
          nominal: 1000000,
          ket: "Service Motor",
          status: "Lunas",
        },
      ],
    },
  ];

  const openDetail = (pegawai) => {
    setSelectedPegawai(pegawai);
    setShowDetail(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Hutang & Kasbon Pegawai
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            Manajemen piutang dan cicilan karyawan Berkah Angsana
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all">
          <MdAddCircle size={20} /> Input Hutang Baru
        </button>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="bg-white dark:bg-custom-gelap p-6 rounded-[35px] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setViewStatus("belum_lunas")}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              viewStatus === "belum_lunas"
                ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-sm"
                : "text-gray-400"
            }`}
          >
            Belum Lunas
          </button>
          <button
            onClick={() => setViewStatus("lunas")}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              viewStatus === "lunas"
                ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-sm"
                : "text-gray-400"
            }`}
          >
            Sudah Lunas
          </button>
        </div>

        <div className="relative flex-1 w-full">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama pegawai yang berhutang..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang/50"
          />
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[390px]">
        {/* Area Scrollable */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[500px]">
            {/* Summary Table dengan Akumulasi Frekuensi & Footer */}
            <thead>
              <tr className="bg-gray-50 dark:bg-[#3d2e39] font-black uppercase tracking-[2px] text-[10px] text-gray-400">
                <th className="p-6 sticky left-0 top-0 bg-gray-50 dark:bg-[#3d2e39] z-40 w-[250px] border-b border-gray-100 dark:border-white/10">
                  Pegawai
                </th>
                <th className="p-4 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 w-[120px] border-b border-gray-100 dark:border-white/10 text-custom-cerah">
                  Frekuensi
                </th>
                <th className="p-4 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 w-[150px] border-b border-gray-100 dark:border-white/10">
                  Total Pinjaman
                </th>
                <th className="p-4 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 w-[150px] border-b border-gray-100 dark:border-white/10">
                  Total Dibayar
                </th>
                <th className="p-4 text-right sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 w-[180px] border-b border-gray-100 dark:border-white/10 text-custom-merah-terang">
                  Sisa Hutang
                </th>
                <th className="p-4 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 w-[150px] border-b border-gray-100 dark:border-white/10">
                  Update Terakhir
                </th>
                <th className="p-6 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 w-[150px] border-b border-gray-100 dark:border-white/10">
                  Opsi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataHutangSummary
                .filter((p) =>
                  viewStatus === "belum_lunas"
                    ? p.sisa_hutang > 0
                    : p.sisa_hutang === 0
                )
                .map((pegawai) => (
                  <tr
                    key={pegawai.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                  >
                    {/* Sticky Pegawai */}
                    <td className="p-4 sticky left-0 bg-white dark:bg-custom-gelap z-20 border-r border-gray-100 dark:border-white/10 shadow-[4px_0_8px_rgba(0,0,0,0.03)] w-[250px]">
                      <div className="flex items-center gap-3 pl-2">
                        <div className="w-9 h-9 rounded-2xl bg-custom-gelap text-custom-cerah flex items-center justify-center font-black text-[10px]">
                          {pegawai.nama.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-custom-gelap dark:text-white leading-none truncate">
                            {pegawai.nama}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase font-medium truncate">
                            {pegawai.nip} • {pegawai.dept}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Akumulasi Count */}
                    <td className="p-4 text-center w-[120px]">
                      <div className="inline-flex items-center justify-center bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                        <span className="text-xs font-black text-custom-gelap dark:text-white">
                          {pegawai.history.length}
                        </span>
                        <span className="text-[8px] ml-1 font-bold text-gray-400 uppercase">
                          Kali
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-right font-medium text-gray-600 dark:text-gray-400 w-[150px]">
                      Rp {pegawai.total_pinjaman.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-medium text-green-600 w-[150px]">
                      Rp {pegawai.total_bayar.toLocaleString()}
                    </td>

                    {/* Sisa Hutang */}
                    <td className="p-4 text-right w-[180px]">
                      <span className="text-sm font-black text-custom-merah-terang underline decoration-double underline-offset-4">
                        Rp {pegawai.sisa_hutang.toLocaleString()}
                      </span>
                    </td>

                    <td className="p-4 text-center text-[10px] text-gray-400 font-medium italic w-[150px]">
                      {pegawai.last_update}
                    </td>

                    <td className="p-4 text-center w-[150px]">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openDetail(pegawai)}
                          className="p-2 bg-gray-50 dark:bg-white/5 text-custom-cerah rounded-xl hover:bg-custom-merah-terang hover:text-white transition-all shadow-sm"
                          title="Riwayat Detail"
                        >
                          <MdHistory size={18} />
                        </button>
                        <button
                          className="p-2 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Input Bayar"
                        >
                          <MdPayments size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* FIXED FOOTER - Total Akumulasi Keseluruhan */}
        <div className="bg-gray-100 dark:bg-[#322730] border-t border-gray-200 dark:border-white/10 z-40 overflow-hidden">
          <table className="w-full text-[10px] font-black min-w-[500px] table-fixed">
            <tfoot>
              <tr className="italic text-custom-gelap dark:text-white bg-gray-100 dark:bg-[#322730]">
                <td className="p-6 w-[248px] sticky left-0 bg-gray-100 dark:bg-[#322730] border-r border-gray-200 dark:border-white/10 uppercase tracking-[2px]">
                  Total Keseluruhan
                </td>

                {/* Total Frekuensi */}
                <td className="p-4 text-center w-[120px] text-sm font-bold">
                  {dataHutangSummary.reduce((a, b) => a + b.history.length, 0)}{" "}
                  <span className="text-[8px] uppercase not-italic">
                    Transaksi
                  </span>
                </td>

                <td className="p-4 text-right w-[150px] text-sm font-bold">
                  Rp{" "}
                  {dataHutangSummary
                    .reduce((a, b) => a + b.total_pinjaman, 0)
                    .toLocaleString()}
                </td>
                <td className="p-4 text-right w-[150px] text-green-600 text-sm font-bold">
                  Rp{" "}
                  {dataHutangSummary
                    .reduce((a, b) => a + b.total_bayar, 0)
                    .toLocaleString()}
                </td>

                {/* Total Sisa Hutang */}
                <td className="p-4 text-right w-[180px] text-custom-merah-terang text-sm">
                  Rp{" "}
                  {dataHutangSummary
                    .reduce((a, b) => a + b.sisa_hutang, 0)
                    .toLocaleString()}
                </td>

                <td className="w-[150px]"></td>
                <td className="w-[150px]"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- MODAL DETAIL RIWAYAT HUTANG --- */}
      {showDetail && selectedPegawai && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <div className="bg-white dark:bg-custom-gelap w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/20">
            {/* Modal Header */}
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[20px] bg-custom-gelap text-custom-cerah flex items-center justify-center text-xl font-black shadow-lg">
                  {selectedPegawai.nama.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-custom-gelap dark:text-white">
                    {selectedPegawai.nama}
                  </h2>
                  <p className="text-sm text-gray-400 font-medium italic">
                    Sisa Hutang:{" "}
                    <span className="text-custom-merah-terang font-bold">
                      Rp {selectedPegawai.sisa_hutang.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 text-gray-400 hover:text-custom-merah-terang transition-colors"
              >
                <MdClose size={26} />
              </button>
            </div>

            {/* Modal Content - List History */}
            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-4">
                Daftar Transaksi Pinjaman
              </h3>
              {selectedPegawai.history.map((loan, i) => (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-white/5 p-4 rounded-[25px] border border-gray-100 dark:border-white/5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        loan.status === "Lunas"
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {loan.status === "Lunas" ? (
                        <MdCheckCircle size={22} />
                      ) : (
                        <MdErrorOutline size={22} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-custom-gelap dark:text-white uppercase">
                        {loan.jenis} •{" "}
                        <span className="text-[10px] font-medium opacity-60 italic">
                          {loan.tgl}
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5 leading-tight">
                        "{loan.ket}"
                      </p>
                      <p className="text-sm font-black text-custom-merah-terang mt-1">
                        Rp {loan.nominal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white dark:bg-white/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                      <MdEdit size={16} />
                    </button>
                    <button className="p-2 bg-white dark:bg-white/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50/50 dark:bg-black/20 flex gap-3">
              <button className="flex-1 py-3.5 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all shadow-custom-merah-terang/20 flex items-center justify-center gap-2">
                <MdAddCircle size={18} /> Tambah Transaksi
              </button>
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 py-3.5 bg-custom-gelap text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hutang;
