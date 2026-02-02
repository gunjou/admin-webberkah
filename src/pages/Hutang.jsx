import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MdSearch,
  MdAddCircle,
  MdPayments,
  MdHistory,
  MdClose,
  MdTrendingUp,
  MdTrendingDown,
  MdAccountBalanceWallet,
  MdPerson,
} from "react-icons/md";
import Swal from "sweetalert2";
import Api from "../utils/Api";
// import { formatTanggal } from "../../utils/Helpers"; // Asumsi Anda punya helper format tanggal

const Hutang = () => {
  const [loading, setLoading] = useState(false);
  const [dataHutang, setDataHutang] = useState([]);
  const [viewStatus, setViewStatus] = useState("aktif");
  const [searchTerm, setSearchTerm] = useState("");

  // state tambah hutang
  const [showAddModal, setShowAddModal] = useState(false);
  const [masterPegawai, setMasterPegawai] = useState([]);
  const [formData, setFormData] = useState({
    id_pegawai: "",
    tanggal_pengajuan: new Date().toISOString().split("T")[0], // Default hari ini
    jumlah_awal: "",
    keterangan: "",
    metode: "kasbon",
  });

  // state detail hutang
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // state pembayaran hutang
  const [showPayModal, setShowPayModal] = useState(false);
  const [payData, setPayData] = useState({
    id_pegawai: "",
    nama_pegawai: "", // Untuk tampilan di judul modal
    jumlah_bayar: "",
    tanggal: new Date().toISOString().split("T")[0],
    metode: "potong_gaji",
    keterangan: "",
  });

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

  // Fetch data pegawai untuk dropdown
  useEffect(() => {
    const fetchPegawaiBasic = async () => {
      try {
        const res = await Api.get("/pegawai/basic");
        setMasterPegawai(res.data.data);
      } catch (err) {
        console.error("Gagal load data pegawai:", err);
      }
    };
    fetchPegawaiBasic();
  }, []);

  // 1. Fetch Data dari Endpoint
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Api.get("/hutang", {
        params: { status_hutang: viewStatus },
      });
      setDataHutang(response.data.data || []);
      console.log(response.data.data);
    } catch (err) {
      console.error("Gagal load summary hutang:", err);
    } finally {
      setLoading(false);
    }
  }, [viewStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter pencarian lokal untuk nama/nip
  const filteredData = dataHutang.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.includes(searchTerm),
  );

  const handleSubmitHutang = async (e) => {
    e.preventDefault();

    // Konfirmasi sebelum simpan
    const confirm = await Swal.fire({
      title: "Konfirmasi Pinjaman",
      html: `Input hutang sebesar <b class="text-custom-merah-terang">Rp ${Number(formData.jumlah_awal).toLocaleString()}</b> untuk pegawai terpilih?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      confirmButtonColor: "#ef4444",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const res = await Api.post("/hutang", formData);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Hutang baru telah dicatat.",
          timer: 2000,
          showConfirmButton: false,
        });
        setShowAddModal(false);
        setFormData({
          id_pegawai: "",
          tanggal_pengajuan: new Date().toISOString().split("T")[0],
          jumlah_awal: "",
          keterangan: "",
          metode: "kasbon",
        });
        fetchData(); // Refresh table utama
      }
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan server",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (pegawai = null) => {
    if (pegawai) {
      // Jika dari Detail Pegawai
      setFormData({
        id_pegawai: pegawai.id_pegawai,
        nama_pegawai: pegawai.nama, // Simpan nama untuk label modal
        tanggal_pengajuan: new Date().toISOString().split("T")[0],
        jumlah_awal: "",
        keterangan: "",
        metode: "kasbon",
      });
    } else {
      // Jika dari Tombol Header Utama
      setFormData({
        id_pegawai: "",
        nama_pegawai: "",
        tanggal_pengajuan: new Date().toISOString().split("T")[0],
        jumlah_awal: "",
        keterangan: "",
        metode: "kasbon",
      });
    }
    setShowAddModal(true);
  };

  const openDetail = async (pegawai) => {
    setShowDetail(true);
    setLoadingDetail(true);
    try {
      const res = await Api.get(`/hutang/pegawai/${pegawai.id_pegawai}`, {
        params: { status_hutang: viewStatus },
      });
      setDetailData(res.data.data);
    } catch (err) {
      console.error("Gagal load detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fungsi untuk memicu modal bayar dari tabel
  const openPayModal = (pegawai) => {
    const def = getDefaultPeriode();
    const lastDate = getLastDateOfMonth(def.month, def.year);

    setPayData({
      ...payData,
      id_pegawai: pegawai.id_pegawai,
      nama_pegawai: pegawai.nama,
      sisa_hutang_maksimal: pegawai.sisa_hutang,
      jumlah_bayar: "",
      // Simpan bulan/tahun untuk UI, tapi simpan tanggal akhir untuk API
      selectedMonth: def.month,
      selectedYear: def.year,
      tanggal: lastDate,
      metode: "potong_gaji",
      keterangan: `Potongan cicilan hutang periode ${monthNames[def.month - 1]} ${def.year}`,
    });
    setShowPayModal(true);
  };

  // Fungsi untuk reset state ke kondisi awal (kosong)
  const resetAddFormData = () => {
    setFormData({
      id_pegawai: "",
      nama_pegawai: "", // Reset nama agar dropdown muncul kembali
      tanggal_pengajuan: new Date().toISOString().split("T")[0],
      jumlah_awal: "",
      keterangan: "",
      metode: "kasbon",
    });
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetAddFormData(); // Langsung reset saat close
  };

  const handleSubmitBayar = async (e) => {
    if (e) e.preventDefault();

    const nominalInput = parseFloat(payData.jumlah_bayar);
    const limitHutang = parseFloat(payData.sisa_hutang_maksimal);

    // VALIDASI: Cek jika input melebihi total hutang
    if (nominalInput > limitHutang) {
      Swal.fire({
        icon: "error",
        title: "Nominal Melebihi Batas",
        html: `Pembayaran (<b>Rp ${nominalInput.toLocaleString()}</b>) tidak boleh melebihi total sisa hutang (<b>Rp ${limitHutang.toLocaleString()}</b>).`,
        customClass: { popup: "rounded-[30px]" },
        confirmButtonColor: "#ef4444",
      });
      return; // Berhenti di sini, jangan lanjut ke API
    }

    // VALIDASI: Cek jika input nol atau negatif
    if (nominalInput <= 0 || isNaN(nominalInput)) {
      Swal.fire({
        icon: "warning",
        title: "Nominal Tidak Valid",
        text: "Silakan masukkan jumlah pembayaran yang benar.",
        customClass: { popup: "rounded-[30px]" },
      });
      return;
    }

    setLoading(true);
    try {
      const res = await Api.post("/hutang/pembayaran", {
        id_pegawai: payData.id_pegawai,
        jumlah_bayar: nominalInput,
        tanggal: payData.tanggal,
        metode: payData.metode,
        keterangan: payData.keterangan,
      });

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Pembayaran Berhasil",
          text: `Berhasil mencatat pembayaran sebesar Rp ${nominalInput.toLocaleString()}`,
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "rounded-[30px]" },
        });

        setShowPayModal(false);
        fetchData();
        if (showDetail) openDetail({ id_pegawai: payData.id_pegawai });
      }
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message ||
          "Terjadi kesalahan saat input pembayaran",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan tanggal terakhir (YYYY-MM-DD)
  const getLastDateOfMonth = (month, year) => {
    // Jam 0 di hari ke-0 bulan berikutnya adalah hari terakhir bulan ini
    const date = new Date(year, month, 0);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Logika Default Periode (Cutoff tanggal 5)
  const getDefaultPeriode = () => {
    const today = new Date();
    const day = today.getDate();
    let month = today.getMonth() + 1; // 1-12
    let year = today.getFullYear();

    if (day <= 5) {
      // Jika tanggal 1-5, default adalah bulan sebelumnya
      if (month === 1) {
        month = 12;
        year -= 1;
      } else {
        month -= 1;
      }
    }
    return { month, year };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-1">
      {/* Header & Stats Ringkas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
            Hutang & Kasbon
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
            Manajemen Piutang Pegawai Berkah Angsana
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
        >
          <MdAddCircle size={18} /> Input Transaksi Baru
        </button>
      </div>
      {/* Toolbar Filter */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center">
        {/* Toggle Status Aktif/Lunas */}
        <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl w-full md:w-auto border border-gray-200 dark:border-white/10">
          {[
            { id: "aktif", label: "Belum Lunas" },
            { id: "lunas", label: "Sudah Lunas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewStatus(tab.id)}
              className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                viewStatus === tab.id
                  ? "bg-white dark:bg-custom-cerah text-custom-merah-terang dark:text-white shadow-md scale-[1.02]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-custom-cerah"
            size={20}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau NIP pegawai..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[11px] font-bold outline-none dark:text-white focus:ring-2 focus:ring-custom-merah-terang/20"
          />
        </div>
      </div>
      {/* Summary Table */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar max-h-[370px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 font-black uppercase tracking-widest text-[9px] text-gray-400 border-b border-gray-100 dark:border-white/5">
                <th className="p-6 sticky left-0 bg-gray-50 dark:bg-[#2d1f29] z-40">
                  Pegawai
                </th>
                <th className="p-4 text-center">Jumlah Hutang</th>
                <th className="p-4 text-right">Total Pinjaman</th>
                <th className="p-4 text-right">Total Dibayar</th>
                <th className="p-4 text-right text-custom-merah-terang">
                  Sisa Tagihan
                </th>
                <th className="p-4 text-center">Update Terakhir</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id_pegawai}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                  >
                    {/* Sticky Info Pegawai */}
                    <td className="p-4 sticky left-0 bg-white dark:bg-custom-gelap z-20 border-r border-gray-100 dark:border-white/5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-custom-merah-terang text-white flex items-center justify-center font-black text-[11px] uppercase">
                          {item.nama.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-custom-gelap dark:text-white uppercase leading-tight truncate">
                            {item.nama}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-1 font-bold tracking-tighter uppercase truncate">
                            {item.nip}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Total Hutang (Frekuensi) */}
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black dark:text-white">
                        {item.total_hutang}{" "}
                        <span className="text-[8px] text-gray-400">Trans</span>
                      </span>
                    </td>

                    <td className="p-4 text-right text-[11px] font-bold text-gray-600 dark:text-gray-400">
                      Rp {item.total_pinjaman.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-right text-[11px] font-bold text-green-600">
                      Rp {item.total_dibayar.toLocaleString("id-ID")}
                    </td>

                    {/* Sisa Hutang */}
                    <td className="p-4 text-right">
                      <span className="text-xs font-black text-custom-merah-terang bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-100 dark:border-red-500/20 shadow-sm">
                        Rp {item.sisa_hutang.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td className="p-4 text-center text-[9px] text-gray-400 font-bold italic">
                      {item.last_update.split("T")[0]}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openDetail(item)}
                          className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          title="Detail Pegawai"
                        >
                          <MdHistory size={18} />
                        </button>
                        <button
                          onClick={() => openPayModal(item)} // 'item' adalah data pegawai di loop table
                          className="p-2 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Input Pembayaran"
                        >
                          <MdPayments size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center opacity-30">
                    <MdAccountBalanceWallet
                      size={48}
                      className="mx-auto mb-2"
                    />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      Tidak ada data hutang
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Akumulasi */}
        <div className="bg-gray-100 dark:bg-[#322730] p-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center px-8">
          <p className="text-[10px] font-black uppercase text-gray-400 italic">
            Total Akumulasi Periode Ini
          </p>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[8px] text-gray-400 uppercase font-black">
                Total Pinjaman
              </p>
              <p className="text-sm font-black dark:text-white">
                Rp{" "}
                {filteredData
                  .reduce((a, b) => a + b.total_pinjaman, 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-custom-merah-terang uppercase font-black">
                Sisa Piutang
              </p>
              <p className="text-sm font-black text-custom-merah-terang">
                Rp{" "}
                {filteredData
                  .reduce((a, b) => a + b.sisa_hutang, 0)
                  .toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADD HUTANG BARU */}
      {showAddModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
            onClick={handleCloseAddModal}
          >
            <div
              className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl border border-white/20 flex flex-col my-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-custom-merah-terang/10 text-custom-merah-terang flex items-center justify-center">
                    <MdAddCircle size={24} />
                  </div>
                  <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase italic tracking-tighter">
                    Input Hutang Baru
                  </h3>
                </div>
                <button
                  onClick={handleCloseAddModal}
                  className="p-2 text-gray-400 hover:text-custom-merah-terang transition-all"
                >
                  <MdClose size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmitHutang} className="p-8 space-y-4">
                {/* Pilih Pegawai */}
                {/* Di dalam Modal Tambah Hutang (showAddModal) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nama Pegawai
                  </label>

                  {formData.nama_pegawai ? (
                    /* Tampilan jika dipicu dari Detail (Locked) */
                    <div className="w-full p-3.5 bg-gray-100 dark:bg-white/10 border border-orange-500/30 rounded-2xl text-xs font-black text-custom-merah-terang flex items-center gap-2">
                      <MdPerson size={16} />
                      {formData.nama_pegawai}
                      <span className="text-[8px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md ml-auto">
                        LOCKED
                      </span>
                    </div>
                  ) : (
                    /* Dropdown normal jika dipicu dari Header Utama */
                    <select
                      required
                      value={formData.id_pegawai}
                      onChange={(e) =>
                        setFormData({ ...formData, id_pegawai: e.target.value })
                      }
                      className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="">-- Pilih Pegawai --</option>
                      {masterPegawai.map((p) => (
                        <option key={p.id_pegawai} value={p.id_pegawai}>
                          {p.nip} - {p.nama_lengkap}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tanggal */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Tanggal Pengajuan
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.tanggal_pengajuan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tanggal_pengajuan: e.target.value,
                        })
                      }
                      className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none"
                    />
                  </div>
                  {/* Metode */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Metode Pencairan
                    </label>
                    <select
                      value={formData.metode}
                      onChange={(e) =>
                        setFormData({ ...formData, metode: e.target.value })
                      }
                      className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="kasbon">KASBON</option>
                      <option value="kas">KAS TUNAI</option>
                      <option value="transfer">TRANSFER</option>
                    </select>
                  </div>
                </div>

                {/* Nominal */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Jumlah Pinjaman (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 italic">
                      Rp
                    </span>
                    <input
                      required
                      type="number"
                      placeholder="contoh: 500000"
                      value={formData.jumlah_awal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jumlah_awal: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-black text-custom-merah-terang outline-none focus:ring-2 focus:ring-custom-merah-terang/20"
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Keterangan / Tujuan
                  </label>
                  <textarea
                    required
                    value={formData.keterangan}
                    onChange={(e) =>
                      setFormData({ ...formData, keterangan: e.target.value })
                    }
                    className="w-full h-24 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[25px] text-xs font-medium italic dark:text-white outline-none"
                    placeholder="Contoh: Renovasi rumah darurat atau biaya sekolah..."
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-custom-merah-terang text-white rounded-[25px] text-[10px] font-black uppercase tracking-[3px] hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 mt-2"
                >
                  {loading ? "Memproses..." : "Simpan Hutang Baru"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL DETAIL HUTANG PEGAWAI */}
      {showDetail &&
        createPortal(
          <div
            className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
            onClick={() => setShowDetail(false)}
          >
            <div
              className="bg-white dark:bg-custom-gelap w-full max-w-3xl rounded-[40px] shadow-2xl border border-white/20 flex flex-col my-auto overflow-hidden min-h-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              {loadingDetail ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                  <div className="w-12 h-12 border-4 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 italic">
                    Sinkronisasi Data...
                  </p>
                </div>
              ) : (
                <>
                  {/* --- MODAL HEADER: SEKARANG DENGAN NAMA PEGAWAI --- */}
                  <div className="p-8 pb-4 flex justify-between items-start border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-500/20 uppercase italic">
                        {/* Mencari nama dari data utama karena di detail mungkin hanya ada ID */}
                        {detailData?.nama_pegawai?.substring(0, 2) || "GA"}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-custom-gelap dark:text-white uppercase leading-tight italic tracking-tighter">
                          Detail Hutang:{" "}
                          <span className="text-custom-cerah">
                            {detailData?.nama_pegawai || "Pegawai"}
                          </span>
                        </h3>
                        <div className="flex gap-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">
                              Total Pinjaman
                            </span>
                            <span className="text-xs font-bold dark:text-white">
                              Rp{" "}
                              {detailData?.summary?.total_pinjaman.toLocaleString(
                                "id-ID",
                              )}
                            </span>
                          </div>
                          <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-custom-merah-terang font-black uppercase tracking-widest">
                              Sisa Tagihan
                            </span>
                            <span className="text-xs font-black text-custom-merah-terang">
                              Rp{" "}
                              {detailData?.summary?.sisa_hutang.toLocaleString(
                                "id-ID",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetail(false)}
                      className="p-2 text-gray-400 hover:text-custom-merah-terang transition-all"
                    >
                      <MdClose size={28} />
                    </button>
                  </div>

                  {/* --- MODAL BODY --- */}
                  <div className="p-8 pt-4 overflow-y-auto custom-scrollbar max-h-[60vh] space-y-6">
                    {detailData?.hutang.map((group, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 dark:bg-white/5 rounded-[30px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm"
                      >
                        {/* Group Header: Menggunakan Index (1, 2, 3...) */}
                        <div className="p-5 bg-gray-100/50 dark:bg-white/5 flex justify-between items-center border-b border-gray-200 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-custom-gelap text-custom-cerah rounded-lg flex items-center justify-center text-[10px] font-black">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="text-xs font-black dark:text-white uppercase tracking-tight italic">
                                "{group.keterangan}"
                              </h4>
                              {/* <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">
                                ID Pinjaman: #{group.id_hutang}
                              </p> */}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">
                              Awal Pinjaman
                            </p>
                            <p className="text-[10px] font-black text-custom-gelap dark:text-gray-300 italic">
                              {group.tanggal_pengajuan}
                            </p>
                          </div>
                        </div>

                        {/* Transaksi List */}
                        <div className="p-5 space-y-3">
                          {group.transaksi.map((trx, tIdx) => (
                            <div
                              key={tIdx}
                              className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-2xl border border-gray-50 dark:border-white/5 group transition-all hover:border-gray-200 dark:hover:border-white/10"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`p-2 rounded-xl shadow-sm ${trx.jenis_transaksi === "pembayaran" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}
                                >
                                  {trx.jenis_transaksi === "pembayaran" ? (
                                    <MdTrendingDown size={18} />
                                  ) : (
                                    <MdTrendingUp size={18} />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-black uppercase dark:text-white leading-tight">
                                      {trx.jenis_transaksi}
                                    </p>
                                    {/* TANGGAL TRANSAKSI: Ditambahkan sesuai request */}
                                    <span className="text-[8px] bg-gray-100 dark:bg-white/10 text-gray-500 px-1.5 py-0.5 rounded font-bold italic">
                                      {trx.tanggal}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-gray-400 font-medium italic mt-1 leading-none">
                                    "{trx.keterangan}" •{" "}
                                    <span className="uppercase font-black text-[7px] text-custom-cerah">
                                      {trx.metode}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-xs font-black ${trx.jenis_transaksi === "pembayaran" ? "text-green-600" : "text-orange-600"}`}
                                >
                                  {trx.jenis_transaksi === "pembayaran"
                                    ? "-"
                                    : "+"}{" "}
                                  Rp {trx.jumlah.toLocaleString("id-ID")}
                                </p>
                                <p className="text-[8px] font-bold text-gray-400 mt-0.5">
                                  Sisa: Rp{" "}
                                  {trx.saldo_setelah.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 bg-gray-50 dark:bg-black/20 flex gap-3">
                    <button
                      onClick={() =>
                        openAddModal({
                          id_pegawai: detailData.id_pegawai,
                          nama: detailData.hutang[0].nama,
                        })
                      }
                      className="flex-1 py-3.5 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all"
                    >
                      + Input Pinjaman Baru
                    </button>
                    <button
                      onClick={() =>
                        openPayModal({
                          id_pegawai: detailData.id_pegawai,
                          nama: detailData.hutang[0].nama,
                        })
                      }
                      className="flex-1 py-3.5 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all"
                    >
                      Input Pembayaran
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL BAYAR HUTANG */}
      {showPayModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowPayModal(false)}
          >
            <div
              className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center shadow-sm">
                    <MdPayments size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase italic tracking-tighter leading-tight">
                      Input Pembayaran
                    </h3>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[10px] text-custom-cerah font-black uppercase tracking-widest">
                        {payData.nama_pegawai}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                          Sisa Hutang:
                        </span>
                        <span className="text-[10px] font-black text-custom-merah-terang bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md border border-red-100 dark:border-red-500/20">
                          Rp{" "}
                          {payData.sisa_hutang_maksimal?.toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="p-2 text-gray-400 hover:text-custom-merah-terang transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitBayar} className="p-8 space-y-4">
                {/* GRID PERIODE & METODE */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Periode Potongan
                    </label>
                    <div className="flex gap-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-1">
                      <select
                        value={payData.selectedMonth}
                        onChange={(e) => {
                          const m = parseInt(e.target.value);
                          const y = payData.selectedYear;
                          setPayData({
                            ...payData,
                            selectedMonth: m,
                            tanggal: getLastDateOfMonth(m, y), // Update YYYY-MM-DD
                            keterangan: `Potongan cicilan hutang periode ${monthNames[m - 1]} ${y}`,
                          });
                        }}
                        className="flex-1 bg-transparent text-[10px] font-black dark:text-white outline-none p-2 cursor-pointer"
                      >
                        {monthNames.map((name, i) => (
                          <option key={i} value={i + 1}>
                            {name.substring(0, 3)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={payData.selectedYear}
                        onChange={(e) => {
                          const y = parseInt(e.target.value);
                          const m = payData.selectedMonth;
                          setPayData({
                            ...payData,
                            selectedYear: y,
                            tanggal: getLastDateOfMonth(m, y), // Update YYYY-MM-DD
                            keterangan: `Potongan cicilan hutang periode ${monthNames[m - 1]} ${y}`,
                          });
                        }}
                        className="bg-transparent text-[10px] font-black dark:text-white outline-none p-2 cursor-pointer"
                      >
                        {[2025, 2026, 2027].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Metode
                    </label>
                    <select
                      value={payData.metode}
                      onChange={(e) =>
                        setPayData({ ...payData, metode: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black dark:text-white outline-none uppercase cursor-pointer"
                    >
                      <option value="potong_gaji">POTONG GAJI</option>
                      <option value="kas">KAS TUNAI</option>
                      <option value="transfer">TRANSFER</option>
                    </select>
                  </div>
                </div>

                {/* Info Tanggal Akhir (Sebagai Validasi Visual) */}
                <p className="text-[8px] text-gray-400 font-bold italic ml-1 mt-[-8px]">
                  * Transaksi akan dicatat pada tanggal:{" "}
                  <span className="text-custom-cerah">{payData.tanggal}</span>
                </p>

                {/* Nominal Bayar */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Jumlah Pembayaran (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 italic">
                      Rp
                    </span>
                    <input
                      required
                      type="number"
                      value={payData.jumlah_bayar}
                      placeholder={`Maksimal: ${payData.sisa_hutang_maksimal}`}
                      onChange={(e) =>
                        setPayData({ ...payData, jumlah_bayar: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm font-black text-green-600 outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Keterangan
                  </label>
                  <textarea
                    required
                    value={payData.keterangan}
                    onChange={(e) =>
                      setPayData({ ...payData, keterangan: e.target.value })
                    }
                    className="w-full h-20 p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[25px] text-xs font-medium italic dark:text-white outline-none"
                    placeholder="Contoh: Cicilan ke-2 atau Pelunasan..."
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-green-600 text-white rounded-[25px] text-[10px] font-black uppercase tracking-[3px] hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Hutang;
