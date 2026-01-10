import React, { useState, useEffect } from "react";
import {
  MdSearch,
  MdAdd,
  MdAccountBalance,
  MdSchool,
  MdPerson,
  MdEmail,
  MdPhone,
  MdBadge,
  MdLocationOn,
  MdDeleteOutline,
  MdEdit,
  MdRefresh,
  MdDownload,
} from "react-icons/md";
import ReactDOM from "react-dom";

import Api from "../utils/Api";
import ModalTambahPegawai from "../components/modals/ModalTambahPegawai";
import ModalEditPegawai from "../components/modals/ModalEditPegawai";
import ModalEditRekening from "../components/modals/ModalEditRekening";
import ModalEditPendidikan from "../components/modals/ModalEditPendidikan";
import ModalEditAkun from "../components/modals/ModalEditAkun";
import ModalEditLokasi from "../components/modals/ModalEditLokasi";

const Pegawai = () => {
  const [mainTab, setMainTab] = useState("core");
  const [dataPegawai, setDataPegawai] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRekeningModalOpen, setIsRekeningModalOpen] = useState(false);
  const [isPendidikanModalOpen, setIsPendidikanModalOpen] = useState(false);
  const [isAkunModalOpen, setIsAkunModalOpen] = useState(false);
  const [isLokasiModalOpen, setIsLokasiModalOpen] = useState(false);

  // 1. Fungsi untuk Fetch Data dari API
  const fetchPegawai = async () => {
    setIsLoading(true);
    try {
      const response = await Api.get("/pegawai/all-data");
      if (response.data.success) {
        setDataPegawai(response.data.data);
      }
      // console.log(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data pegawai:", error);
      // Anda bisa menambahkan alert atau toast di sini
    } finally {
      setIsLoading(false);
    }
  };

  // 2. useEffect untuk memanggil API saat halaman terbuka
  useEffect(() => {
    fetchPegawai();
  }, []);

  // 3. Logika Client-side Filter
  const filteredPegawai = dataPegawai.filter((p) => {
    const matchesSearch =
      p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nip.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "Semua Status" || p.status_pegawai === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Fungsi handler klik edit
  const handleEditClick = (pegawai) => {
    setSelectedPegawai(pegawai);
    if (mainTab === "lokasi") {
      setIsLokasiModalOpen(true);
    } else if (mainTab === "akun") {
      setIsAkunModalOpen(true);
    } else if (mainTab === "rekening") {
      setIsRekeningModalOpen(true);
    } else if (mainTab === "pendidikan") {
      setIsPendidikanModalOpen(true);
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleDeletePegawai = async (id, nama) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus data pegawai "${nama}"? Semua data terkait (akun, lokasi, & riwayat) akan ikut terhapus.`
    );

    if (confirmDelete) {
      setIsDeleting(true); // Aktifkan overlay spinner
      try {
        const res = await Api.delete(`/pegawai/delete/${id}`);

        if (res.data.success) {
          alert("Pegawai berhasil dihapus dari sistem.");
          fetchPegawai();
        }
      } catch (err) {
        console.error("Gagal menghapus pegawai:", err);
        alert(err.response?.data?.message || "Gagal menghapus data pegawai.");
      } finally {
        setIsDeleting(false); // Matikan overlay spinner
      }
    }
  };

  const handleDownload = async (type) => {
    setIsDeleting(true);

    try {
      const labelMap = {
        "Pegawai Tetap": "Pegawai Tetap",
        "Pegawai Tidak Tetap": "Pegawai Tidak Tetap",
        "Pegawai Magang": "Pegawai Magang",
      };

      const currentLabel = labelMap[selectedStatus] || "Pegawai";
      const extension = type === "pdf" ? "pdf" : "xlsx";

      // 1. Mapping Path Endpoint (Menambahkan Lokasi Absensi)
      const endpointMap = {
        rekening: `/export/report/rekening/${extension}`,
        pendidikan: `/export/report/pendidikan/${extension}`,
        akun: `/export/report/akun/${extension}`,
        lokasi: `/export/report/lokasi-absensi/${extension}`, // Endpoint Lokasi
      };

      const baseUrl = endpointMap[mainTab] || `/export/report/${extension}`;

      const { data: blobData } = await Api.get(baseUrl, {
        responseType: "blob",
        params: {
          tab: mainTab,
          status: selectedStatus === "Semua Status" ? "" : selectedStatus,
        },
      });

      // 2. Mapping Prefix Nama File
      const prefixMap = {
        rekening: "Data Rekening",
        pendidikan: "Data Pendidikan",
        akun: "Data Akun Sistem",
        lokasi: "Data Lokasi Absensi", // Prefix file Lokasi
      };

      const prefix = prefixMap[mainTab] || "Data";

      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${prefix} ${currentLabel} Berkah Angsana.${extension}`;

      document.body.appendChild(link);
      link.click();

      // 3. Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download Error:", err);
      alert("Gagal mengunduh laporan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* HEADER & INTEGRATED TOOLBAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Database Pegawai
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Manajemen Induk & Berkas Karyawan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-none md:w-56">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari Pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-medium outline-none shadow-sm dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="bg-white dark:bg-custom-gelap px-3 py-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-tight outline-none dark:text-white cursor-pointer"
            >
              <option>Semua Status</option>
              <option value="Pegawai Tetap">Pegawai Tetap</option>
              <option value="Pegawai Tidak Tetap">Pegawai Tidak Tetap</option>
              <option value="Pegawai Magang">Pegawai Magang</option>
            </select>
          </div>

          {/* Tombol Refresh Manual */}
          <button
            onClick={fetchPegawai}
            className={`p-2.5 bg-white dark:bg-custom-gelap rounded-xl border border-gray-100 dark:border-white/10 shadow-sm transition-all ${
              isLoading ? "animate-spin" : ""
            }`}
          >
            <MdRefresh size={18} className="text-custom-merah-terang" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-custom-merah-terang text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
          >
            <MdAdd size={18} /> Tambah
          </button>
        </div>
      </div>

      {/* WRAPPER UNTUK TABS & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* CATEGORY TABS (Sisi Kiri) */}
        <div className="flex bg-white dark:bg-custom-gelap p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
          {[
            { id: "core", label: "Data Pegawai", icon: <MdPerson /> },
            {
              id: "rekening",
              label: "Rekening Bank",
              icon: <MdAccountBalance />,
            },
            { id: "pendidikan", label: "Pendidikan", icon: <MdSchool /> },
            { id: "akun", label: "Akun Sistem", icon: <MdBadge /> },
            { id: "lokasi", label: "Lokasi Absensi", icon: <MdLocationOn /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
              className={`whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                mainTab === tab.id
                  ? "bg-custom-merah-terang text-white shadow-lg shadow-custom-merah-terang/20"
                  : "text-gray-400 hover:text-custom-merah-terang"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ACTION BUTTONS (Sisi Kanan) */}
        <div className="flex items-center gap-2">
          {/* Tombol Download Excel */}
          {/* <button
            onClick={() => handleDownload("excel")}
            className="flex items-center gap-2 px-5 py-3 bg-green-600/10 text-green-600 dark:bg-green-500/5 dark:text-green-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all border border-green-600/20"
          >
            <MdDownload size={16} /> .xlsx
          </button> */}

          {/* Tombol Download PDF */}
          <button
            onClick={() => handleDownload("pdf")}
            className="flex items-center gap-2 px-5 py-3 bg-red-600/10 text-red-600 dark:bg-red-500/5 dark:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
          >
            <MdDownload size={16} /> .pdf
          </button>
        </div>
      </div>

      {/* TABLE DATA LIST */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[380px]">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-[10px] border-collapse min-w-[400px] table-fixed">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#3d2e39] font-black uppercase tracking-widest text-gray-400">
                <th className="p-4 text-left sticky left-0 top-0 bg-gray-50 dark:bg-[#3d2e39] z-40 border-b border-gray-100 dark:border-white/10 w-[250px]">
                  Pegawai
                </th>

                {/* Kolom Berubah Sesuai Tab */}
                {mainTab === "core" && (
                  <>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Jabatan / Dept
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Kontak
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Alamat Pribadi
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[120px]">
                      Tgl Masuk
                    </th>
                  </>
                )}

                {mainTab === "rekening" && (
                  <>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Nama Bank
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Nomor Rekening
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Atas Nama
                    </th>
                  </>
                )}

                {mainTab === "pendidikan" && (
                  <>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[100px]">
                      Jenjang
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[250px]">
                      Institusi
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Jurusan
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[100px]">
                      Tahun Masuk
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[100px]">
                      Tahun Lulus
                    </th>
                  </>
                )}

                {/* Kolom Akun Pegawai */}
                {mainTab === "akun" && (
                  <>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[180px]">
                      Username Akun
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Kode Pemulihan
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[120px]">
                      Data Wajah
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[180px]">
                      Login Terakhir
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[120px]">
                      Status
                    </th>
                  </>
                )}

                {/* Kolom Lokasi Penugasan */}
                {mainTab === "lokasi" && (
                  <>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[400px]">
                      Titik Absensi Terdaftar
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Total Lokasi
                    </th>
                  </>
                )}

                <th className="p-4 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[120px]">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-custom-merah-terang border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        Sinkronisasi Data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredPegawai.length > 0 ? (
                filteredPegawai.map((p) => (
                  <tr
                    key={p.id_pegawai}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                  >
                    <td className="p-3 sticky left-0 bg-white dark:bg-custom-gelap z-20 border-r border-gray-100 dark:border-white/10 shadow-[4px_0_8px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-3 pl-2">
                        {/* Avatar Foto Profile - Ukuran disesuaikan (w-8 h-8) */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm bg-gray-50 flex-shrink-0">
                          <img
                            src={
                              p.pribadi?.image_path ||
                              `https://ui-avatars.com/api/?name=${p.nama_lengkap}&background=1b1b1b&color=efefef`
                            }
                            alt={p.nama_panggilan}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/150/1b1b1b/ffffff?text=BA";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-custom-gelap dark:text-white leading-none truncate">
                            {p.nama_lengkap}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span
                              className={`text-[7px] font-black px-1 rounded-sm uppercase ${
                                p.status_pegawai === "Tetap"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              {p.status_pegawai}
                            </span>
                            <span className="text-[7px] text-gray-400 font-medium">
                              | {p.nip}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* DATA DINAMIS BERDASARKAN TAB */}
                    {mainTab === "core" && (
                      <>
                        <td className="p-3 text-gray-600 dark:text-gray-300">
                          <p className="font-bold leading-none">{p.jabatan}</p>
                          <p className="text-[8px] text-gray-400 mt-1 uppercase">
                            {p.departemen}
                          </p>
                        </td>
                        <td className="p-3 text-gray-500">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1">
                              <MdEmail className="text-custom-cerah" />{" "}
                              {p.pribadi.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <MdPhone className="text-custom-cerah" />{" "}
                              {p.pribadi.no_telepon}
                            </span>
                          </div>
                        </td>
                        <td
                          className="p-3 text-gray-500 italic truncate"
                          title={p.pribadi.alamat}
                        >
                          <MdLocationOn className="inline mr-1" />{" "}
                          {p.pribadi.alamat}
                        </td>
                        <td className="p-3 text-center text-gray-500 font-bold">
                          {p.tanggal_masuk}
                        </td>
                      </>
                    )}

                    {mainTab === "rekening" && (
                      <>
                        <td className="p-3 text-center">
                          <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-3 py-1 rounded-lg font-black">
                            {p.rekening.bank}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-sm font-bold text-custom-merah-terang tracking-tighter">
                          {p.rekening.nomor}
                        </td>
                        <td className="p-3 text-gray-500 font-bold uppercase">
                          {p.rekening.an}
                        </td>
                      </>
                    )}

                    {mainTab === "pendidikan" && (
                      <>
                        <td className="p-3 text-center font-black text-custom-merah-terang">
                          {/* Jika pendidikan adalah object, langsung akses propertinya */}
                          {p.pendidikan ? p.pendidikan.jenjang : "-"}
                        </td>
                        <td className="p-3 font-bold text-custom-gelap dark:text-white uppercase">
                          {p.pendidikan
                            ? p.pendidikan.institusi
                            : "Belum Mengisi"}
                        </td>
                        <td className="p-3 text-gray-500">
                          {p.pendidikan ? p.pendidikan.jurusan : "-"}
                        </td>
                        <td className="p-3 text-center font-bold text-gray-400">
                          {p.pendidikan ? p.pendidikan.tahun_masuk : "-"}
                        </td>
                        <td className="p-3 text-center font-bold text-gray-400">
                          {p.pendidikan ? p.pendidikan.tahun_lulus : "-"}
                        </td>
                      </>
                    )}

                    {/* Data Akun Pegawai */}
                    {mainTab === "akun" && (
                      <>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-custom-cerah animate-pulse"></div>
                            <span className="font-bold text-custom-gelap dark:text-white text-sm tracking-tighter">
                              {p.auth_pegawai?.username || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <code className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20 rounded-lg text-custom-merah-terang font-mono font-black tracking-[2px] text-[11px]">
                            {p.auth_pegawai?.recovery_code || "------"}
                          </code>
                        </td>
                        <td className="p-3 text-center">
                          {p.auth_pegawai?.img_path ? (
                            <div className="relative group inline-block">
                              <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-white dark:border-white/10 shadow-md transition-transform hover:scale-110">
                                <img
                                  src={p.auth_pegawai.img_path}
                                  alt="Data Wajah"
                                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                                />
                              </div>
                              {/* Tooltip kecil saat hover */}
                              <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 bg-custom-gelap text-white text-[8px] px-2 py-1 rounded font-bold uppercase whitespace-nowrap z-50">
                                Terverifikasi
                              </div>
                            </div>
                          ) : (
                            <span className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md border border-red-100 dark:border-red-500/20 uppercase tracking-tighter italic">
                              Belum Set
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center text-gray-400 font-medium">
                          {p.auth_pegawai?.last_login_at || "Belum Aktif"}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              p.auth_pegawai?.status === 1
                                ? "bg-green-100 text-green-600 border border-green-200"
                                : "bg-red-100 text-red-600 border border-red-200"
                            }`}
                          >
                            {p.auth_pegawai?.status === 1 ? "Aktif" : "Suspend"}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Data Lokasi Penugasan (Multi-Location) */}
                    {mainTab === "lokasi" && (
                      <>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {p.lokasi_absensi && p.lokasi_absensi.length > 0 ? (
                              p.lokasi_absensi.map((lok, idx) => (
                                <div
                                  key={idx}
                                  className="group/loc relative flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg hover:border-custom-merah-terang transition-all"
                                >
                                  <MdLocationOn
                                    className="text-custom-merah-terang"
                                    size={12}
                                  />
                                  <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                                    {lok.nama_lokasi}
                                  </span>
                                  {/* Tooltip Koordinat saat Hover */}
                                  <div className="absolute bottom-full mb-2 left-0 hidden group-hover/loc:block z-50 bg-custom-gelap text-white p-2 rounded-xl text-[8px] whitespace-nowrap shadow-xl">
                                    Lat: {lok.latitude} <br /> Lng:{" "}
                                    {lok.longitude} <br /> Rad:{" "}
                                    {lok.radius_meter}m
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-[9px] text-gray-400 italic">
                                Belum ada akses lokasi
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-custom-merah-terang/10 text-custom-merah-terang font-black text-xs">
                            {p.lokasi_absensi?.length || 0}
                          </div>
                        </td>
                      </>
                    )}

                    {/* AKSI DINAMIS BERDASARKAN TAB */}
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(p)} // Kita buat fungsi handler
                          className="p-2 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title={`Edit Data ${mainTab}`}
                        >
                          <MdEdit size={14} />
                        </button>

                        {/* Tombol Delete biasanya hanya untuk menghapus Pegawai secara keseluruhan (Data Core) */}
                        {mainTab === "core" && (
                          <button
                            onClick={() =>
                              handleDeletePegawai(p.id_pegawai, p.nama_lengkap)
                            }
                            className="p-2 bg-gray-50 dark:bg-white/5 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Hapus Pegawai"
                          >
                            <MdDeleteOutline size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="p-20 text-center text-gray-400 italic"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER TOTAL */}
      <div className="p-4 bg-white dark:bg-custom-gelap rounded-[25px] border border-gray-100 dark:border-white/5 flex justify-between items-center shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Total Karyawan Terdaftar:{" "}
          <span className="text-custom-merah-terang">
            {dataPegawai.length} Orang
          </span>
        </p>
        {/* <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-blue-600 uppercase">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Tetap
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-orange-600 uppercase">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Tidak
            Tetap
          </div>
        </div> */}
      </div>

      {/* Modal Tambah Pegawai */}
      <ModalTambahPegawai
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchPegawai} // Fungsi fetch data Anda
      />

      {/* Modal Edit Pegawai */}
      <ModalEditPegawai
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onRefresh={fetchPegawai}
        data={selectedPegawai}
        activeTab={mainTab} // Mengirim tab yang aktif agar modal tahu form mana yang muncul
      />

      {/* Modal Edit Rekening Pegawai */}
      <ModalEditRekening
        isOpen={isRekeningModalOpen}
        onClose={() => setIsRekeningModalOpen(false)}
        onRefresh={fetchPegawai}
        data={selectedPegawai}
      />

      {/* Modal Edit Pendidikan Pegawai */}
      <ModalEditPendidikan
        isOpen={isPendidikanModalOpen}
        onClose={() => setIsPendidikanModalOpen(false)}
        onRefresh={fetchPegawai}
        data={selectedPegawai}
      />

      {/* Modal Edit Akun Pegawai */}
      <ModalEditAkun
        isOpen={isAkunModalOpen}
        onClose={() => setIsAkunModalOpen(false)}
        onRefresh={fetchPegawai}
        data={selectedPegawai}
      />

      {/* Modal Edit Lokasi Absensi Pegawai */}
      <ModalEditLokasi
        isOpen={isLokasiModalOpen}
        onClose={() => setIsLokasiModalOpen(false)}
        onRefresh={fetchPegawai}
        data={selectedPegawai}
      />

      {/* Spinner Overlay Sederhana */}
      {isDeleting &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              {/* Circle Spinner */}
              <div className="w-12 h-12 border-4 border-t-custom-merah-terang border-white/20 rounded-full animate-spin"></div>
              <p className="text-white text-[10px] font-black uppercase tracking-[3px] animate-pulse">
                Menghapus Data...
              </p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Pegawai;
