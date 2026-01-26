import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MdSearch,
  MdRemoveRedEye,
  MdFileDownload,
  MdImage,
  MdPerson,
  MdClose,
  MdInfoOutline,
  MdAccessTime,
  MdAttachMoney,
  MdBadge,
  MdEdit,
  MdDelete,
  MdAdd,
} from "react-icons/md";
import Api from "../../utils/Api";
import Swal from "sweetalert2";
import { formatJam } from "../../utils/Helpers";

const Lembur = ({ refreshCount }) => {
  const [loading, setLoading] = useState(false);
  const [dataLembur, setDataLembur] = useState([]);
  const [masterAllPegawai, setMasterAllPegawai] = useState([]);
  const [masterPegawai, setMasterPegawai] = useState([]);
  const [masterStatus, setMasterStatus] = useState([]);
  const [masterJenisLembur, setMasterJenisLembur] = useState([]);

  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: 2026,
    id_pegawai: "",
    status_approval: "pending",
    search: "",
  });

  const [showAddLemburModal, setShowAddLemburModal] = useState(false);
  const [addLemburData, setAddLemburData] = useState({
    id_pegawai: "",
    id_jenis_lembur: "",
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    keterangan: "",
    lampiran: null,
  });

  const [showEditLembur, setShowEditLembur] = useState(false);
  const [editLemburData, setEditLemburData] = useState({
    id_lembur: "",
    id_jenis_lembur: "",
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    keterangan: "",
    lampiran: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const modalRef = useRef(null);

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

  // 1. Fetch Data Master (Disesuaikan dengan curl Anda)
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [resAllPegawai, resStatus, resPegawai, resJenisLembur] =
          await Promise.all([
            Api.get("/pegawai/basic"),
            Api.get("/master/status-pegawai"),
            Api.get("/lembur/pegawai"),
            Api.get("/master/jenis-lembur"),
          ]);
        setMasterAllPegawai(resAllPegawai.data.data);
        setMasterStatus(resStatus.data.data);
        setMasterPegawai(resPegawai.data.data);
        setMasterJenisLembur(resJenisLembur.data.data);
      } catch (err) {
        console.error("Gagal load data master lembur", err);
      }
    };
    fetchMaster();
  }, []);

  // 2. Fetch Data Lembur Utama
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        bulan: filter.bulan,
        tahun: filter.tahun,
        status_approval: filter.status_approval,
      };
      if (filter.id_pegawai) params.id_pegawai = filter.id_pegawai;
      if (filter.id_status_pegawai)
        params.id_status_pegawai = filter.id_status_pegawai;
      if (filter.id_departemen) params.id_departemen = filter.id_departemen;
      const res = await Api.get("/lembur", { params });
      setDataLembur(res.data.data);
    } catch (err) {
      console.error("Gagal load data lembur", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  // Handler Aksi (Approve/Reject) dengan Endpoint Spesifik
  const handleAction = async (id, status) => {
    // 1. Logika Jika Status REJECTED
    if (status === "rejected") {
      const { value: text, isConfirmed } = await Swal.fire({
        title: "Alasan Penolakan",
        input: "textarea",
        inputPlaceholder:
          "Contoh: Instruksi lembur tidak ditemukan atau pekerjaan tidak mendesak...",
        inputAttributes: {
          "aria-label": "Masukkan alasan penolakan",
        },
        showCancelButton: true,
        confirmButtonText: "Tolak Lembur",
        confirmButtonColor: "#ef4444", // Warna Merah untuk Tolak
        cancelButtonText: "Batal",
        // Validasi input agar alasan tidak kosong
        inputValidator: (value) => {
          if (!value) {
            return "Alasan penolakan wajib diisi!";
          }
        },
      });

      // Jika user menekan tombol "Tolak Lembur" dan mengisi alasan
      if (isConfirmed && text) {
        try {
          setLoading(true);
          // Mengirim ke endpoint rejected dengan body alasan_penolakan
          await Api.put(`/lembur/${id}/rejected`, {
            alasan_penolakan: text,
          });

          Swal.fire({
            icon: "success",
            title: "Lembur Ditolak",
            text: "Status lembur telah berhasil diupdate menjadi Rejected.",
            timer: 2000,
            showConfirmButton: false,
          });

          setShowModal(false);
          fetchData();
        } catch (err) {
          Swal.fire(
            "Gagal",
            err.response?.data?.message || "Terjadi kesalahan pada server",
            "error",
          );
        } finally {
          setLoading(false);
        }
      }
      return; // Keluar dari fungsi jika ditolak atau dibatalkan
    }

    // 2. Logika Jika Status APPROVED
    if (status === "approved") {
      const confirmApprove = await Swal.fire({
        title: "Setujui Lembur?",
        text: "Data lembur yang disetujui akan diproses ke dalam penggajian.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Setujui",
        confirmButtonColor: "#16a34a", // Warna Hijau untuk Approve
        cancelButtonText: "Batal",
      });

      if (confirmApprove.isConfirmed) {
        try {
          setLoading(true);
          // Mengirim ke endpoint approved
          await Api.put(`/lembur/${id}/approved`);

          Swal.fire({
            icon: "success",
            title: "Berhasil Disetujui",
            text: "Status lembur telah diupdate menjadi Approved.",
            timer: 2000,
            showConfirmButton: false,
          });

          setShowModal(false);
          fetchData();
        } catch (err) {
          Swal.fire(
            "Gagal",
            err.response?.data?.message || "Server Error",
            "error",
          );
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleSubmitAddLembur = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("id_pegawai", addLemburData.id_pegawai);
    formData.append("id_jenis_lembur", addLemburData.id_jenis_lembur);
    formData.append("tanggal", addLemburData.tanggal);
    formData.append("jam_mulai", addLemburData.jam_mulai);
    formData.append("jam_selesai", addLemburData.jam_selesai);
    formData.append("keterangan", addLemburData.keterangan || "");
    if (addLemburData.lampiran)
      formData.append("lampiran", addLemburData.lampiran);

    try {
      const res = await Api.post("/lembur/admin/pengajuan-lembur", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Lembur Terdaftar",
          text: "Data lembur pegawai berhasil ditambahkan.",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "rounded-[30px]" },
        });

        setShowAddLemburModal(false);
        setAddLemburData({
          id_pegawai: "",
          id_jenis_lembur: "",
          tanggal: "",
          jam_mulai: "",
          jam_selesai: "",
          keterangan: "",
          lampiran: null,
        });
        fetchData(); // Refresh tabel
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

  const handleOpenEditLembur = (row) => {
    setEditLemburData({
      id_lembur: row.id_lembur,
      id_jenis_lembur: row.id_jenis_lembur,
      tanggal: row.tanggal,
      jam_mulai: row.jam_mulai,
      jam_selesai: row.jam_selesai,
      keterangan: row.keterangan,
      lampiran: null,
    });
    setShowEditLembur(true);
  };

  const handleDeleteLembur = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data Lembur?",
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await Api.delete(`/lembur/${id}`);
        Swal.fire("Terhapus!", "Data lembur telah dihapus.", "success");
        fetchData(); // Refresh table
        if (refreshCount) refreshCount(); // Refresh Navbar count
      } catch (err) {
        Swal.fire("Gagal", "Server Error: Gagal menghapus data.", "error");
      }
    }
  };

  const handleSubmitEditLembur = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id_jenis_lembur", editLemburData.id_jenis_lembur);
    formData.append("tanggal", editLemburData.tanggal);
    formData.append("jam_mulai", editLemburData.jam_mulai);
    formData.append("jam_selesai", editLemburData.jam_selesai);
    formData.append("keterangan", editLemburData.keterangan);
    if (editLemburData.lampiran)
      formData.append("lampiran", editLemburData.lampiran);

    try {
      setLoading(true);
      await Api.put(`/lembur/admin/${editLemburData.id_lembur}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil Update",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowEditLembur(false);
      fetchData();
    } catch (err) {
      Swal.fire("Gagal", "Gagal memperbarui data lembur.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-10">
      {/* JUDUL & EXPORT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
            Manajemen Lembur
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
            {monthNames[filter.bulan - 1]} {filter.tahun}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BUTTON TAMBAH LEMBUR */}
          <button
            onClick={() => setShowAddLemburModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-custom-gelap dark:bg-custom-cerah text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <MdAdd size={18} /> Tambah Lembur
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all hover:opacity-90">
            <MdFileDownload size={18} /> Export Laporan
          </button>
        </div>
      </div>

      {/* FILTER BOX LEMBUR - WITH ACTIVE INDICATORS */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-center">
          {/* 1. Toggle Status (Tetap col-span-2) */}
          <div className="col-span-2 md:col-span-2 flex h-[42px] bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 items-center">
            {["pending", "approved", "rejected"].map((s) => {
              const isActive = filter.status_approval === s;
              const activeStyles = {
                pending: "bg-orange-600 text-white shadow-orange-500/20",
                approved: "bg-green-600 text-white shadow-green-500/20",
                rejected: "bg-red-600 text-white shadow-red-500/20",
              };
              return (
                <button
                  key={s}
                  onClick={() => setFilter({ ...filter, status_approval: s })}
                  className={`flex-1 h-full py-2 text-[8px] md:text-[9px] font-black uppercase rounded-lg transition-all duration-300 ${
                    isActive
                      ? `${activeStyles[s]} shadow-md scale-[1.02]`
                      : "text-gray-400"
                  }`}
                >
                  {s === "pending"
                    ? "Menunggu"
                    : s === "approved"
                      ? "Disetujui"
                      : "Ditolak"}
                </button>
              );
            })}
          </div>

          {/* 2. Filter Nama Pegawai - Highlight jika terpilih */}
          <div
            className={`relative h-[42px] flex items-center rounded-xl transition-all duration-300 ${
              filter.id_pegawai
                ? "bg-orange-50 dark:bg-orange-500/10 ring-2 ring-orange-500/50"
                : "bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
            }`}
          >
            <MdPerson
              className={`absolute left-3 ${filter.id_pegawai ? "text-orange-600" : "text-custom-cerah"}`}
              size={14}
            />
            <select
              value={filter.id_pegawai}
              onChange={(e) =>
                setFilter({ ...filter, id_pegawai: e.target.value })
              }
              className="w-full h-full pl-9 pr-4 bg-transparent text-[10px] font-bold dark:text-white outline-none appearance-none cursor-pointer"
            >
              <option value="">Semua Pegawai</option>
              {masterPegawai.map((p) => (
                <option key={p.id_pegawai} value={p.id_pegawai}>
                  {p.nama_panggilan}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Filter Bulan - Highlight jika bukan bulan berjalan */}
          <div
            className={`h-[42px] flex items-center rounded-xl transition-all duration-300 ${
              filter.bulan !== new Date().getMonth() + 1
                ? "bg-orange-50 dark:bg-orange-500/10 ring-2 ring-orange-500/50"
                : "bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
            }`}
          >
            <select
              value={filter.bulan}
              onChange={(e) =>
                setFilter({ ...filter, bulan: parseInt(e.target.value) })
              }
              className="w-full h-full px-3 bg-transparent text-[10px] font-bold dark:text-white outline-none cursor-pointer"
            >
              {monthNames.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Filter Tahun - Highlight jika bukan 2026 */}
          <div
            className={`h-[42px] flex items-center rounded-xl transition-all duration-300 ${
              filter.tahun !== 2026
                ? "bg-orange-50 dark:bg-orange-500/10 ring-2 ring-orange-500/50"
                : "bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
            }`}
          >
            <select
              value={filter.tahun}
              onChange={(e) =>
                setFilter({ ...filter, tahun: parseInt(e.target.value) })
              }
              className="w-full h-full px-3 bg-transparent text-[10px] font-bold dark:text-white outline-none cursor-pointer"
            >
              {[2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Filter Status Pegawai - Highlight jika terpilih */}
          <div
            className={`relative h-[42px] flex items-center rounded-xl transition-all duration-300 ${
              filter.id_status_pegawai
                ? "bg-orange-50 dark:bg-orange-500/10 ring-2 ring-orange-500/50"
                : "bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
            }`}
          >
            <MdBadge
              className={`absolute left-3 ${filter.id_status_pegawai ? "text-orange-600" : "text-custom-cerah"}`}
              size={14}
            />
            <select
              value={filter.id_status_pegawai}
              onChange={(e) =>
                setFilter({ ...filter, id_status_pegawai: e.target.value })
              }
              className="w-full h-full pl-9 pr-4 bg-transparent text-[10px] font-bold dark:text-white outline-none appearance-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              {masterStatus.map((s) => (
                <option key={s.id_status_pegawai} value={s.id_status_pegawai}>
                  {s.nama_status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-custom-gelap rounded-[35px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto max-h-[380px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 text-[8px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-4 py-4">Jenis & Keterangan</th>
                <th className="px-4 py-4 text-center">Tanggal & Waktu</th>
                <th className="px-4 py-4 text-center">Durasi</th>
                <th className="px-4 py-4 text-center">Estimasi Upah</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Bukti</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataLembur.length > 0
                ? dataLembur.map((row) => (
                    <tr
                      key={row.id_lembur}
                      className="hover:bg-gray-50/30 transition-all group"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-custom-merah-terang text-white flex items-center justify-center font-black text-[10px] uppercase">
                            {row.nama_panggilan?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black dark:text-white uppercase leading-none">
                              {row.nama_panggilan}
                            </p>
                            <p className="text-[7px] text-gray-400 mt-1 font-bold">
                              {row.nip}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 min-w-[200px]">
                        <p className="text-[9px] font-black text-custom-cerah uppercase tracking-tighter">
                          {row.jenis_lembur}
                        </p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                          "{row.keterangan}"
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <p className="text-[10px] font-bold dark:text-gray-300">
                          {row.tanggal}
                        </p>
                        <p className="text-[8px] text-gray-400 font-black uppercase">
                          {row.jam_mulai} - {row.jam_selesai}
                        </p>
                      </td>

                      {/* Durasi dalam format Jam */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-black dark:text-white bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                          {formatJam(row.menit_lembur)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-black text-green-600">
                          {row.total_bayaran
                            ? `Rp ${row.total_bayaran.toLocaleString("id-ID")}`
                            : "Rp 0"}
                        </span>
                      </td>

                      {/* Kolom Status Approval */}
                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                            row.status_approval === "approved"
                              ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                              : row.status_approval === "rejected"
                                ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                : "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status_approval === "approved"
                                ? "bg-green-500"
                                : row.status_approval === "rejected"
                                  ? "bg-red-500"
                                  : "bg-orange-500"
                            }`}
                          ></span>
                          {row.status_approval}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {row.path_lampiran ? (
                          <button
                            onClick={() => {
                              setSelectedImage(row.path_lampiran);
                              setIsImagePopupOpen(true);
                            }}
                            className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          >
                            <MdImage size={16} />
                          </button>
                        ) : (
                          <span className="text-[8px] font-black text-gray-300 italic uppercase">
                            No File
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          {/* Preview */}
                          <button
                            onClick={() => {
                              setSelectedData(row);
                              setShowModal(true);
                            }}
                            className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Detail"
                          >
                            <MdRemoveRedEye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditLembur(row)}
                            className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Edit"
                          >
                            <MdEdit size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteLembur(row.id_lembur)}
                            className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Hapus"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : // TAMPILAN SAAT DATA KOSONG
                  !loading && (
                    <tr>
                      <td colSpan="8" className="py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                            <MdSearch size={32} className="text-gray-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-black text-custom-gelap dark:text-white uppercase tracking-widest">
                              Data Tidak Ditemukan
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                              Tidak ada data lembur untuk filter periode atau
                              status ini.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {showModal &&
        selectedData &&
        createPortal(
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300"
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col"
            >
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center text-xl font-black">
                    {selectedData.nama_panggilan.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-custom-gelap dark:text-white uppercase">
                      {selectedData.nama_panggilan}
                    </h3>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">
                      {selectedData.nip} • {selectedData.nama_departemen}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-custom-merah-terang transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="p-8 pt-4 space-y-5">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-[25px] border border-gray-100 dark:border-white/10">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MdInfoOutline size={14} /> Keterangan{" "}
                    {selectedData.jenis_lembur}
                  </h4>
                  <p className="text-[12px] text-custom-gelap dark:text-gray-200 italic leading-relaxed">
                    "{selectedData.keterangan}"
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase">
                      Durasi Total
                    </p>
                    <p className="text-xs font-bold dark:text-white flex items-center gap-2">
                      <MdAccessTime /> {selectedData.menit_lembur} Menit
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase">
                      Estimasi Upah
                    </p>
                    <p className="text-xs font-bold text-green-600 flex items-center gap-2">
                      <MdAttachMoney />{" "}
                      {selectedData.total_bayaran
                        ? `Rp ${selectedData.total_bayaran.toLocaleString("id-ID")}`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-black/20 flex gap-3">
                {selectedData.status_approval === "pending" ? (
                  <>
                    <button
                      onClick={() =>
                        handleAction(selectedData.id_lembur, "approved")
                      }
                      className="flex-1 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() =>
                        handleAction(selectedData.id_lembur, "rejected")
                      }
                      className="flex-1 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      Tolak
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 bg-gray-200 dark:bg-white/10 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Tutup Rincian
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showAddLemburModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
            onClick={() => setShowAddLemburModal(false)}
          >
            <div
              className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl border border-white/20 flex flex-col my-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <MdAdd size={24} />
                  </div>
                  <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase italic tracking-tighter">
                    Tambah Lembur Pegawai
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddLemburModal(false)}
                  className="p-2 text-gray-400 hover:text-custom-merah-terang"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitAddLembur} className="p-8 space-y-4">
                {/* Pilih Pegawai */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Pilih Pegawai
                  </label>
                  <select
                    required
                    value={addLemburData.id_pegawai}
                    onChange={(e) =>
                      setAddLemburData({
                        ...addLemburData,
                        id_pegawai: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none appearance-none"
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {masterAllPegawai.map((p) => (
                      <option key={p.id_pegawai} value={p.id_pegawai}>
                        {p.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jenis Lembur & Tanggal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Jenis Lembur
                    </label>
                    <select
                      required
                      value={addLemburData.id_jenis_lembur}
                      onChange={(e) =>
                        setAddLemburData({
                          ...addLemburData,
                          id_jenis_lembur: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none"
                    >
                      <option value="">-- Pilih --</option>
                      {masterJenisLembur.map((j) => (
                        <option
                          key={j.id_jenis_lembur}
                          value={j.id_jenis_lembur}
                        >
                          {j.nama_jenis}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Tanggal
                    </label>
                    <input
                      required
                      type="date"
                      value={addLemburData.tanggal}
                      onChange={(e) =>
                        setAddLemburData({
                          ...addLemburData,
                          tanggal: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                </div>

                {/* Jam Mulai & Selesai */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Jam Mulai
                    </label>
                    <input
                      required
                      type="time"
                      value={addLemburData.jam_mulai}
                      onChange={(e) =>
                        setAddLemburData({
                          ...addLemburData,
                          jam_mulai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Jam Selesai
                    </label>
                    <input
                      required
                      type="time"
                      value={addLemburData.jam_selesai}
                      onChange={(e) =>
                        setAddLemburData({
                          ...addLemburData,
                          jam_selesai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Keterangan Pekerjaan
                  </label>
                  <textarea
                    value={addLemburData.keterangan}
                    onChange={(e) =>
                      setAddLemburData({
                        ...addLemburData,
                        keterangan: e.target.value,
                      })
                    }
                    className="w-full h-20 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-medium italic dark:text-white outline-none"
                    placeholder="Tugas apa yang dikerjakan saat lembur..."
                  />
                </div>

                {/* Lampiran */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Lampiran Bukti (Opsional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setAddLemburData({
                        ...addLemburData,
                        lampiran: e.target.files[0],
                      })
                    }
                    className="w-full p-2 text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-custom-gelap file:text-white"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-orange-600 text-white rounded-[25px] text-xs font-black uppercase tracking-[3px] hover:bg-orange-700 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Simpan Pengajuan Lembur"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {showEditLembur &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
            onClick={() => setShowEditLembur(false)}
          >
            <div
              className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl border border-white/20 flex flex-col my-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase italic tracking-tighter">
                  Edit Data Lembur
                </h3>
                <button
                  onClick={() => setShowEditLembur(false)}
                  className="p-2 text-gray-400 hover:text-custom-merah-terang"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitEditLembur} className="p-8 space-y-4">
                {/* Jenis Lembur */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Jenis Lembur
                  </label>
                  <select
                    value={editLemburData.id_jenis_lembur}
                    onChange={(e) =>
                      setEditLemburData({
                        ...editLemburData,
                        id_jenis_lembur: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none"
                  >
                    {masterJenisLembur.map((jl) => (
                      <option
                        key={jl.id_jenis_lembur}
                        value={jl.id_jenis_lembur}
                      >
                        {jl.nama_jenis}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal & Jam */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Tanggal Lembur
                  </label>
                  <input
                    type="date"
                    value={editLemburData.tanggal}
                    onChange={(e) =>
                      setEditLemburData({
                        ...editLemburData,
                        tanggal: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={editLemburData.jam_mulai}
                      onChange={(e) =>
                        setEditLemburData({
                          ...editLemburData,
                          jam_mulai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={editLemburData.jam_selesai}
                      onChange={(e) =>
                        setEditLemburData({
                          ...editLemburData,
                          jam_selesai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Keterangan Pekerjaan
                  </label>
                  <textarea
                    value={editLemburData.keterangan}
                    onChange={(e) =>
                      setEditLemburData({
                        ...editLemburData,
                        keterangan: e.target.value,
                      })
                    }
                    className="w-full h-20 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-medium italic dark:text-white outline-none"
                  />
                </div>

                {/* Lampiran */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Ganti Lampiran Bukti
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setEditLemburData({
                        ...editLemburData,
                        lampiran: e.target.files[0],
                      })
                    }
                    className="w-full p-2 text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-custom-merah-terang file:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-custom-gelap text-white rounded-[25px] text-xs font-black uppercase tracking-[3px] hover:bg-black transition-all shadow-xl"
                >
                  Simpan Data Lembur
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* IMAGE POPUP */}
      {isImagePopupOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsImagePopupOpen(false)}
          >
            <div className="relative max-w-4xl w-full flex flex-col items-center">
              <button className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white">
                <MdClose size={32} />
              </button>
              <img
                src={selectedImage}
                alt="Bukti"
                className="max-w-full max-h-[80vh] rounded-[30px] shadow-2xl border border-white/10 object-contain animate-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Lembur;
