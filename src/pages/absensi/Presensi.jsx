import React, { useState, useEffect } from "react";
import {
  MdSearch,
  MdFileDownload,
  MdOutlineLogin,
  MdOutlineLogout,
  MdEdit,
  MdCircle,
  MdAdd,
  MdDeleteOutline,
} from "react-icons/md";
import Swal from "sweetalert2";
import Api from "../../utils/Api";
import {
  formatTanggalIndoLengkap,
  formatTerlambat,
  toTitleCase,
} from "../../utils/Helpers";
import ModalEditPresensi from "../../components/modals/ModalEditPresensi";
import ModalTambahPresensi from "../../components/modals/ModalTambahPresensi";

const Presensi = () => {
  const [loading, setLoading] = useState(false);
  const [dataPresensi, setDataPresensi] = useState([]);
  const [masterDept, setMasterDept] = useState([]);
  const [masterStatus, setMasterStatus] = useState([]);
  const [filter, setFilter] = useState({
    tanggal: new Date().toLocaleDateString("en-CA"),
    id_departemen: "",
    id_status_pegawai: "",
    search: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalManualOpen, setIsModalManualOpen] = useState(false);
  const [selectedPresensi, setSelectedPresensi] = useState(null);

  // 1. Fetch Master Data (Hanya sekali saat mount)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resDept, resStatus] = await Promise.all([
          Api.get("/master/departemen"),
          Api.get("/master/status-pegawai"),
        ]);
        setMasterDept(resDept.data.data);
        setMasterStatus(resStatus.data.data);
      } catch (err) {
        console.error("Gagal load master data", err);
      }
    };
    fetchInitialData();
  }, []);

  // 1. Sederhanakan fetchData (Hapus useCallback agar selalu segar)
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      params.tanggal = filter.tanggal;

      // Hanya masukkan ke params jika ada nilainya
      if (filter.id_departemen) params.id_departemen = filter.id_departemen;
      if (filter.id_status_pegawai)
        params.id_status_pegawai = filter.id_status_pegawai;
      if (filter.search) params.search = filter.search;

      const res = await Api.get("/presensi", { params });
      setDataPresensi(res.data.data);
    } catch (err) {
      console.error("Gagal load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Satu-satunya useEffect untuk menghandle semua perubahan filter & pencarian
  useEffect(() => {
    // Jika sedang mengetik (search), beri jeda 500ms agar tidak spam API
    // Jika ganti tanggal/dept, langsung panggil (0ms)
    const timer = setTimeout(
      () => {
        fetchData();
      },
      filter.search ? 500 : 0
    );

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter.tanggal,
    filter.id_departemen,
    filter.id_status_pegawai,
    filter.search,
  ]);

  const handleEditPresensi = (item) => {
    setSelectedPresensi(item); // Menyimpan objek presensi yang dipilih
    setIsModalOpen(true); // Membuka modal
  };

  const handleDeletePresensi = (idAbsensi, namaPegawai) => {
    if (!idAbsensi) {
      return Swal.fire("Error", "ID Absensi tidak ditemukan", "error");
    }

    Swal.fire({
      title: "Hapus Presensi?",
      text: `Anda akan menghapus log presensi milik ${namaPegawai}. Tindakan ini tidak dapat dibatalkan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Warna merah tailwind
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true, // Memindahkan posisi tombol cancel ke kiri
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await Api.delete(`/presensi/${idAbsensi}`);

          Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Data presensi telah berhasil dihapus.",
            timer: 1500,
            showConfirmButton: false,
          });

          fetchData(); // Refresh data tabel
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Gagal Menghapus",
            text:
              err.response?.data?.message || "Terjadi kesalahan pada server",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 py-4">
        {/* Sisi Kiri: Judul & Tanggal */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
              Presensi Pegawai
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-custom-cerah/10 rounded-full border border-custom-cerah/20">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  loading
                    ? "bg-orange-500 animate-pulse"
                    : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                }`}
              ></div>
              <span className="text-[8px] font-black text-custom-cerah uppercase tracking-widest">
                {loading ? "Syncing..." : "Live"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-[1px] w-4 bg-custom-merah-terang"></div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-tight">
              {formatTanggalIndoLengkap(filter.tanggal)}
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Action Buttons Group */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsModalManualOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-custom-gelap border border-gray-200 dark:border-white/10 text-custom-gelap dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm active:scale-95"
          >
            <MdAdd size={18} className="text-custom-merah-terang" />
            <span>Input Manual</span>
          </button>

          <button className="group flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[1px] transition-all shadow-lg shadow-green-600/20 active:scale-95">
            <MdFileDownload
              size={18}
              className="group-hover:translate-y-0.5 transition-transform"
            />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-custom-gelap p-3 rounded-[20px] shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Tanggal
            </label>
            <input
              type="date"
              value={filter.tanggal}
              onChange={(e) =>
                setFilter({ ...filter, tanggal: e.target.value })
              }
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-lg text-[10px] outline-none dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Departemen
            </label>
            <select
              value={filter.id_departemen}
              onChange={(e) =>
                setFilter({ ...filter, id_departemen: e.target.value })
              }
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-lg text-[10px] outline-none dark:text-white"
            >
              <option value="">Semua Departemen</option>
              {masterDept.map((d) => (
                <option key={d.id_departemen} value={d.id_departemen}>
                  {d.nama_departemen}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Status Sdm
            </label>
            <select
              value={filter.id_status_pegawai}
              onChange={(e) =>
                setFilter({ ...filter, id_status_pegawai: e.target.value })
              }
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-lg text-[10px] outline-none dark:text-white"
            >
              <option value="">Semua Status</option>
              {masterStatus.map((s) => (
                <option key={s.id_status_pegawai} value={s.id_status_pegawai}>
                  {s.nama_status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Pencarian
            </label>
            <div className="relative">
              <MdSearch
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Nama / NIP..."
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[10px] outline-none dark:text-white focus:border-custom-cerah"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container dengan Max Height & Scroll */}
      <div className="bg-white dark:bg-custom-gelap rounded-[25px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        {/* Kontainer Scrollable */}
        <div className="overflow-x-auto overflow-y-auto max-h-[380px] custom-scrollbar">
          <table className="w-full text-left border-collapse relative">
            <thead>
              {/* Sticky Header: z-index penting agar tidak tertutup konten body */}
              <tr className="sticky top-0 z-20 bg-gray-50 dark:bg-[#1a1a1a] text-[8px] uppercase tracking-[1px] text-gray-400 border-b border-gray-100 dark:border-white/5 shadow-sm">
                <th className="px-4 py-3 font-black">Identitas Pegawai</th>
                <th className="px-4 py-3 font-black text-center">Shift</th>
                <th className="px-4 py-3 font-black text-center">Masuk</th>
                <th className="px-4 py-3 font-black text-center">Keluar</th>
                <th className="px-4 py-3 font-black text-center">Istirahat</th>
                <th className="px-4 py-3 font-black text-center">Ket</th>
                <th className="px-4 py-3 font-black text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5 relative">
              {loading ? (
                // SPINNER KECIL DI DALAM TABEL
                <tr>
                  <td colSpan="7" className="p-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[8px] font-black uppercase tracking-[2px] text-custom-cerah animate-pulse">
                        Memuat Data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : dataPresensi.length > 0 ? (
                dataPresensi.map((item, idx) => {
                  const isTerlambat = item.presensi.menit_terlambat > 0;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-all group"
                    >
                      {/* ... konten td sama seperti sebelumnya ... */}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-custom-merah-terang text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                            {item.pegawai.nama_panggilan.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-[10px] font-black dark:text-white tracking-tighter">
                                {toTitleCase(item.pegawai.nama_panggilan)}
                              </p>
                              <span
                                className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${
                                  item.pegawai.status_pegawai ===
                                  "Pegawai Tetap"
                                    ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                    : item.pegawai.status_pegawai ===
                                        "Kontrak" ||
                                      item.pegawai.status_pegawai ===
                                        "Pegawai Tidak Tetap"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : item.pegawai.status_pegawai === "Magang"
                                    ? "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                                    : "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"
                                }`}
                              >
                                {item.pegawai.status_pegawai}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400 mt-0.5">
                              <span className="font-mono tracking-tighter">
                                {item.pegawai.nip}
                              </span>
                              <MdCircle size={3} className="text-gray-300" />
                              <span className="text-custom-cerah uppercase tracking-tight truncate max-w-[80px]">
                                {item.pegawai.nama_departemen}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <p className="text-[9px] font-black dark:text-gray-200 uppercase">
                          {item.jam_kerja.nama_shift}
                        </p>
                        <p className="text-[8px] text-gray-400 font-bold leading-none">
                          {item.jam_kerja.jam_mulai}-
                          {item.jam_kerja.jam_selesai}
                        </p>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[10px] font-black dark:text-white flex items-center gap-1">
                            <MdOutlineLogin
                              className="text-green-500"
                              size={11}
                            />{" "}
                            {item.presensi.jam_masuk || "--:--"}
                          </span>
                          <span className="text-[7px] text-gray-400 font-bold truncate max-w-[70px]">
                            {item.presensi.lokasi_masuk || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[10px] font-black dark:text-white flex items-center gap-1">
                            <MdOutlineLogout
                              className="text-red-500"
                              size={11}
                            />{" "}
                            {item.presensi.jam_keluar || "--:--"}
                          </span>
                          <span className="text-[7px] text-gray-400 font-bold truncate max-w-[70px]">
                            {item.presensi.lokasi_keluar || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-md">
                          <span className="text-[9px] font-bold dark:text-white">
                            {item.presensi.istirahat.jam_mulai || "-"}
                          </span>
                          <div className="w-[1px] h-2 bg-gray-200 dark:bg-white/10"></div>
                          <span className="text-[9px] font-bold dark:text-white">
                            {item.presensi.istirahat.jam_selesai || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div
                          className={`px-1.5 py-0.5 rounded-md inline-block ${
                            isTerlambat
                              ? "bg-red-50 text-red-600 dark:bg-red-500/10"
                              : "bg-green-50 text-green-600 dark:bg-green-500/10"
                          }`}
                        >
                          <p className="text-[8px] font-black uppercase">
                            {isTerlambat
                              ? `-${formatTerlambat(
                                  item.presensi.menit_terlambat
                                )}`
                              : "OK"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleEditPresensi(item)}
                            className="p-1.5 text-custom-cerah hover:bg-custom-cerah/10 rounded-lg transition-all"
                            title="Edit Presensi"
                          >
                            <MdEdit size={16} />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            onClick={() =>
                              handleDeletePresensi(
                                item.presensi.id_absensi,
                                item.pegawai.nama_lengkap
                              )
                            }
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Hapus Presensi"
                          >
                            <MdDeleteOutline size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-10 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {loading
                      ? "Menghubungkan ke server..."
                      : "Tidak ada data presensi"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah */}
      <ModalTambahPresensi
        isOpen={isModalManualOpen}
        onClose={() => setIsModalManualOpen(false)}
        onRefresh={fetchData}
        currentFilterTanggal={filter.tanggal} // Agar default tanggal sesuai filter yang aktif
      />

      {/* Modal Edit */}
      <ModalEditPresensi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedPresensi}
        onRefresh={fetchData} // Agar tabel otomatis refresh setelah save
      />
    </div>
  );
};

export default Presensi;
