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
  MdBadge,
  MdCalendarToday,
  MdDelete,
  MdEdit,
  MdAdd,
} from "react-icons/md";
import Api from "../../utils/Api";
import Swal from "sweetalert2";

const Perizinan = ({ refreshCount }) => {
  const [loading, setLoading] = useState(false);
  const [dataIzin, setDataIzin] = useState([]);
  const [masterAllPegawai, setMasterAllPegawai] = useState([]);
  const [masterPegawai, setMasterPegawai] = useState([]);
  const [masterStatus, setMasterStatus] = useState([]);
  const [masterJenisIzin, setMasterJenisIzin] = useState([]);

  // Filter sesuai parser API Perizinan
  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: 2026,
    status_approval: "pending",
    kategori_izin: "", // IZIN | SAKIT | CUTI
    id_pegawai: "",
    id_status_pegawai: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({
    id_pegawai: "",
    id_jenis_izin: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    alasan: "",
    lampiran: null,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id_izin: "",
    id_jenis_izin: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    alasan: "",
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

  // 1. Fetch Data Master (Identik dengan Lembur)
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [resAllPegawai, resStatus, resPegawai, resJenisIzin] =
          await Promise.all([
            Api.get("/pegawai/basic"),
            Api.get("/master/status-pegawai"),
            Api.get("/perizinan/pegawai"),
            Api.get("/master/jenis-izin"),
          ]);
        setMasterAllPegawai(resAllPegawai.data.data);
        setMasterStatus(resStatus.data.data);
        setMasterPegawai(resPegawai.data.data);
        setMasterJenisIzin(resJenisIzin.data.data);
      } catch (err) {
        console.error("Gagal load data master perizinan", err);
      }
    };
    fetchMaster();
  }, []);

  // 2. Fetch Data Perizinan
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
      if (filter.kategori_izin) params.kategori_izin = filter.kategori_izin;

      const res = await Api.get("/perizinan", { params });
      setDataIzin(res.data.data);
    } catch (err) {
      console.error("Gagal load data perizinan", err);
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

  // Handler Approval/Reject (Identik dengan logic Lembur)
  const handleAction = async (id, status) => {
    if (status === "rejected") {
      const { value: text, isConfirmed } = await Swal.fire({
        title: "Alasan Penolakan",
        input: "textarea",
        inputPlaceholder: "Berikan alasan kenapa izin tidak disetujui...",
        showCancelButton: true,
        confirmButtonText: "Tolak Izin",
        confirmButtonColor: "#ef4444",
        cancelButtonText: "Batal",
        inputValidator: (value) => {
          if (!value) return "Alasan penolakan wajib diisi!";
        },
      });

      if (isConfirmed && text) {
        try {
          setLoading(true);
          await Api.put(`/perizinan/${id}/rejected`, {
            alasan_penolakan: text,
          });
          Swal.fire({
            icon: "success",
            title: "Izin Ditolak",
            timer: 2000,
            showConfirmButton: false,
          });
          setShowModal(false);
          fetchData();
        } catch (err) {
          Swal.fire("Gagal", "Terjadi kesalahan pada server", "error");
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    if (status === "approved") {
      const confirmApprove = await Swal.fire({
        title: "Setujui Izin?",
        text: "Pegawai akan dianggap sah untuk tidak hadir pada tanggal tersebut.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Setujui",
        confirmButtonColor: "#16a34a",
      });

      if (confirmApprove.isConfirmed) {
        try {
          setLoading(true);
          await Api.put(`/perizinan/${id}/approved`);
          Swal.fire({
            icon: "success",
            title: "Berhasil Disetujui",
            timer: 2000,
            showConfirmButton: false,
          });
          setShowModal(false);
          fetchData();
        } catch (err) {
          Swal.fire("Gagal", "Server Error", "error");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup saat komponen unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("id_pegawai", addData.id_pegawai);
    formData.append("id_jenis_izin", addData.id_jenis_izin);
    formData.append("tanggal_mulai", addData.tanggal_mulai);
    formData.append("tanggal_selesai", addData.tanggal_selesai);
    formData.append("alasan", addData.alasan);
    if (addData.lampiran) formData.append("lampiran", addData.lampiran);

    try {
      const res = await Api.post("/perizinan/admin/pengajuan-izin", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Pengajuan Berhasil",
          text: "Izin pegawai telah berhasil didaftarkan.",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "rounded-[30px]" },
        });

        setShowAddModal(false);
        setAddData({
          id_pegawai: "",
          id_jenis_izin: "",
          tanggal_mulai: "",
          tanggal_selesai: "",
          alasan: "",
          lampiran: null,
        });
        fetchData(); // Refresh table
        if (refreshCount) refreshCount(); // Refresh Navbar count
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

  // Handler Hapus
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Perizinan?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await Api.delete(`/perizinan/${id}`);
        Swal.fire("Berhasil", "Data perizinan telah dihapus.", "success");
        fetchData();
        if (refreshCount) refreshCount();
      } catch (err) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
      }
    }
  };

  // Handler Buka Modal Edit
  const handleOpenEdit = (row) => {
    setEditData({
      id_izin: row.id_izin,
      id_jenis_izin: row.id_jenis_izin,
      tanggal_mulai: row.tgl_mulai,
      tanggal_selesai: row.tgl_selesai,
      alasan: row.keterangan,
      lampiran: null,
    });
    setShowEditModal(true);
  };

  // Handler Submit Edit (Menggunakan FormData karena ada File)
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("id_jenis_izin", editData.id_jenis_izin);
    formData.append("tanggal_mulai", editData.tanggal_mulai);
    formData.append("tanggal_selesai", editData.tanggal_selesai);
    formData.append("alasan", editData.alasan);
    if (editData.lampiran) formData.append("lampiran", editData.lampiran);

    try {
      await Api.put(`/perizinan/admin/${editData.id_izin}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil Update",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      Swal.fire("Gagal", "Gagal memperbarui data perizinan", "error");
    } finally {
      setLoading(true);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
            Manajemen Perizinan
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
            {monthNames[filter.bulan - 1]} {filter.tahun}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BUTTON TAMBAH IZIN */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-custom-gelap dark:bg-custom-cerah text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <MdAdd size={18} /> Tambah Izin
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all hover:opacity-90">
            <MdFileDownload size={18} /> Export Rekap
          </button>
        </div>
      </div>

      {/* FILTER BOX */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-center">
          {" "}
          {/* Tambahkan items-center di grid utama */}
          {/* 1. Status Toggle - Pastikan tinggi (h) sama dengan yang lain */}
          <div className="col-span-2 md:col-span-2 flex h-[42px] bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 items-center">
            {["pending", "approved", "rejected"].map((s) => {
              const isActive = filter.status_approval === s;
              // ... (activeStyles tetap sama)
              return (
                <button
                  key={s}
                  onClick={() => setFilter({ ...filter, status_approval: s })}
                  className={`flex-1 h-full py-2 text-[8px] md:text-[9px] font-black uppercase rounded-lg transition-all duration-300 ${isActive ? "bg-orange-600 text-white shadow-md scale-[1.02]" : "text-gray-400"}`}
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
          {/* 2. Filter Pegawai */}
          <div
            className={`relative h-[42px] flex items-center rounded-xl transition-all duration-300 ${filter.id_pegawai ? "bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-500/50" : "bg-gray-50 dark:bg-white/5"}`}
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
              className="w-full h-full pl-9 pr-2 bg-transparent text-[10px] font-bold dark:text-white outline-none appearance-none cursor-pointer"
            >
              <option value="">Semua Pegawai</option>
              {masterPegawai.map((p) => (
                <option key={p.id_pegawai} value={p.id_pegawai}>
                  {p.nama_panggilan}
                </option>
              ))}
            </select>
          </div>
          {/* 3. Filter Bulan */}
          <div
            className={`h-[42px] flex items-center rounded-xl transition-all duration-300 ${filter.bulan !== new Date().getMonth() + 1 ? "bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-500/50" : "bg-gray-50 dark:bg-white/5"}`}
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
          {/* 4. Filter Tahun */}
          <div
            className={`h-[42px] flex items-center rounded-xl transition-all duration-300 ${filter.tahun !== 2026 ? "bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-500/50" : "bg-gray-50 dark:bg-white/5"}`}
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
          {/* 5. Filter Status Pegawai */}
          <div
            className={`relative h-[42px] flex items-center rounded-xl transition-all duration-300 ${filter.id_status_pegawai ? "bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-500/50" : "bg-gray-50 dark:bg-white/5"}`}
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
              className="w-full h-full pl-9 pr-2 bg-transparent text-[10px] font-bold dark:text-white outline-none appearance-none cursor-pointer"
            >
              <option value="">Status</option>
              {masterStatus.map((s) => (
                <option key={s.id_status_pegawai} value={s.id_status_pegawai}>
                  {s.nama_status}
                </option>
              ))}
            </select>
          </div>
          {/* 6. Filter Kategori Izin */}
          <div
            className={`h-[42px] flex items-center rounded-xl transition-all duration-300 ${filter.kategori_izin ? "bg-orange-50 dark:bg-orange-500/10 ring-1 ring-orange-500/50" : "bg-gray-50 dark:bg-white/5"}`}
          >
            <select
              value={filter.kategori_izin}
              onChange={(e) =>
                setFilter({ ...filter, kategori_izin: e.target.value })
              }
              className="w-full h-full px-3 bg-transparent text-[10px] font-bold dark:text-white outline-none cursor-pointer"
            >
              <option value="">Kategori</option>
              <option value="IZIN">IZIN</option>
              <option value="SAKIT">SAKIT</option>
              <option value="CUTI">CUTI</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-custom-gelap rounded-[35px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto max-h-[440px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 text-[8px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4">Pegawai</th>
                <th className="px-4 py-4">Kategori & Keterangan</th>
                <th className="px-4 py-4 text-center">Periode Izin</th>{" "}
                {/* Ter-expand */}
                <th className="px-4 py-4 text-center">Durasi</th>{" "}
                <th className="px-4 py-4 text-center">Status Approval</th>
                <th className="px-4 py-4 text-center">Bukti</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataIzin.length > 0
                ? dataIzin.map((row) => (
                    <tr
                      key={row.id_izin}
                      className="hover:bg-gray-50/30 transition-all"
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
                              {row.nama_departemen} • {row.nip}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${
                            row.kategori_izin === "SAKIT"
                              ? "bg-green-100 text-green-600"
                              : row.kategori_izin === "CUTI"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {row.kategori_izin}
                        </span>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 line-clamp-1 italic mt-1">
                          "{row.keterangan}"
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center min-w-[120px]">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-md">
                            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                            <p className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-tighter">
                              {row.tgl_mulai}
                            </p>
                          </div>
                          <div className="h-2 w-px bg-gray-200 dark:bg-white/10 my-0.5"></div>
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">
                              {row.tgl_selesai}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[11px] font-black dark:text-white uppercase leading-none">
                            {row.durasi_izin} Hari
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                            row.status_approval === "approved"
                              ? "bg-green-100 text-green-600"
                              : row.status_approval === "rejected"
                                ? "bg-red-100 text-red-600"
                                : "bg-orange-100 text-orange-600"
                          }`}
                        >
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
                            className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                          >
                            <MdImage size={16} />
                          </button>
                        ) : (
                          <span className="text-[8px] text-gray-300 italic uppercase">
                            No Bukti
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          {/* Tombol Detail/Preview */}
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

                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleOpenEdit(row)}
                            className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Edit"
                          >
                            <MdEdit size={16} />
                          </button>

                          {/* Tombol Delete */}
                          <button
                            onClick={() => handleDelete(row.id_izin)}
                            className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Hapus"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : !loading && (
                    <tr>
                      <td colSpan="7" className="py-20 text-center opacity-50">
                        <MdSearch
                          size={32}
                          className="mx-auto text-gray-400 mb-2"
                        />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Tidak Ada Data Perizinan
                        </p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col my-auto"
            >
              {/* Header Section */}
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-500/20">
                    {selectedData.nama_panggilan.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase leading-tight">
                      {selectedData.nama_panggilan}
                    </h3>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">
                      {selectedData.nip} • {selectedData.nama_departemen}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-400 hover:text-custom-merah-terang transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-8 pt-4 space-y-5">
                <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-[25px] border border-gray-100 dark:border-white/10">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MdInfoOutline
                      size={14}
                      className="text-custom-merah-terang"
                    />
                    Detail Keterangan {selectedData.kategori_izin}
                  </h4>
                  <p className="text-[13px] text-custom-gelap dark:text-gray-200 italic leading-relaxed font-medium">
                    "
                    {selectedData.keterangan ||
                      "Tidak ada keterangan tambahan."}
                    "
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-tighter">
                      Mulai - Selesai
                    </p>
                    <p className="text-[11px] font-bold dark:text-white flex items-center gap-2">
                      <MdCalendarToday className="text-custom-cerah" />{" "}
                      {selectedData.tgl_mulai} <br /> s/d{" "}
                      {selectedData.tgl_selesai}
                    </p>
                  </div>
                  <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-tighter">
                      Status Pegawai
                    </p>
                    <p className="text-[11px] font-black text-custom-cerah uppercase tracking-tighter">
                      {selectedData.status_pegawai}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex gap-3">
                {selectedData.status_approval === "pending" ? (
                  <>
                    <button
                      onClick={() =>
                        handleAction(selectedData.id_izin, "approved")
                      }
                      className="flex-1 py-3.5 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Setujui Izin
                    </button>
                    <button
                      onClick={() =>
                        handleAction(selectedData.id_izin, "rejected")
                      }
                      className="flex-1 py-3.5 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Tolak
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3.5 bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all"
                  >
                    Tutup Rincian
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body, // Ini yang membuat modal pindah ke luar hierarki komponen
        )}

      {showAddModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl border border-white/20 flex flex-col my-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-custom-cerah/10 text-custom-cerah flex items-center justify-center">
                    <MdAdd size={24} />
                  </div>
                  <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase italic tracking-tighter">
                    Tambah Izin Pegawai
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-custom-merah-terang"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitAdd} className="p-8 space-y-4">
                {/* Pilih Pegawai */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Pilih Pegawai
                  </label>
                  <select
                    required
                    value={addData.id_pegawai}
                    onChange={(e) =>
                      setAddData({ ...addData, id_pegawai: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none"
                  >
                    <option value="">-- Pilih Pegawai --</option>
                    {masterAllPegawai.map((p) => (
                      <option key={p.id_pegawai} value={p.id_pegawai}>
                        {p.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jenis Izin */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Jenis Izin
                  </label>
                  <select
                    required
                    value={addData.id_jenis_izin}
                    onChange={(e) =>
                      setAddData({ ...addData, id_jenis_izin: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none"
                  >
                    <option value="">-- Pilih Jenis --</option>
                    {masterJenisIzin.map((j) => (
                      <option key={j.id_jenis_izin} value={j.id_jenis_izin}>
                        {j.nama_izin}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Mulai
                    </label>
                    <input
                      required
                      type="date"
                      value={addData.tanggal_mulai}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          tanggal_mulai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Selesai
                    </label>
                    <input
                      required
                      type="date"
                      value={addData.tanggal_selesai}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          tanggal_selesai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                </div>

                {/* Alasan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Alasan / Keterangan
                  </label>
                  <textarea
                    required
                    value={addData.alasan}
                    onChange={(e) =>
                      setAddData({ ...addData, alasan: e.target.value })
                    }
                    className="w-full h-20 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-medium italic dark:text-white outline-none"
                    placeholder="Tulis alasan izin..."
                  />
                </div>

                {/* Lampiran */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Upload Bukti (Opsional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setAddData({ ...addData, lampiran: e.target.files[0] })
                    }
                    className="w-full p-2 text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-custom-gelap file:text-white"
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-custom-merah-terang text-white rounded-[25px] text-xs font-black uppercase tracking-[3px] hover:bg-red-700 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? "Memproses..." : "Kirim Pengajuan"}
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {showEditModal &&
        createPortal(
          <div
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl border border-white/20 flex flex-col my-auto overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
                <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase italic tracking-tighter">
                  Edit Perizinan
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-custom-merah-terang"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="p-8 space-y-4">
                {/* Jenis Izin */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Jenis Izin
                  </label>
                  <select
                    value={editData.id_jenis_izin}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        id_jenis_izin: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold outline-none dark:text-white cursor-pointer"
                  >
                    <option value="" disabled>
                      Pilih Jenis Izin
                    </option>
                    {masterJenisIzin.map((jenis) => (
                      <option
                        key={jenis.id_jenis_izin}
                        value={jenis.id_jenis_izin}
                      >
                        {jenis.nama_izin}{" "}
                        {/* Sesuaikan "nama_jenis_izin" dengan key dari API Anda */}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal Mulai & Selesai */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Tgl Mulai
                    </label>
                    <input
                      type="date"
                      value={editData.tanggal_mulai}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          tanggal_mulai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Tgl Selesai
                    </label>
                    <input
                      type="date"
                      value={editData.tanggal_selesai}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          tanggal_selesai: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white"
                    />
                  </div>
                </div>

                {/* Alasan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Keterangan / Alasan
                  </label>
                  <textarea
                    value={editData.alasan}
                    onChange={(e) =>
                      setEditData({ ...editData, alasan: e.target.value })
                    }
                    className="w-full h-24 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs font-medium italic dark:text-white outline-none"
                  />
                </div>

                {/* Lampiran */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Ganti Lampiran (Opsional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setEditData({ ...editData, lampiran: e.target.files[0] })
                    }
                    className="w-full p-2 text-[10px] text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-custom-merah-terang file:text-white hover:file:bg-red-700"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-custom-gelap text-white rounded-[25px] text-xs font-black uppercase tracking-[3px] hover:bg-black transition-all shadow-xl"
                >
                  Simpan Perubahan
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

export default Perizinan;
