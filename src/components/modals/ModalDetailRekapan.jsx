import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { MdClose, MdAccessTime, MdEdit } from "react-icons/md";
import ModalEditPresensi from "./ModalEditPresensi";
import Api from "../../utils/Api";

const ModalDetailRekapan = ({
  isOpen,
  onClose,
  idPegawai, // Terima ID Pegawai saja
  bulan, // Terima Bulan filter (1-12)
  tahun, // Terima Tahun filter
  monthName,
  onRefresh, // Callback untuk refresh tabel utama
}) => {
  const [loading, setLoading] = useState(false);
  const [dataPegawai, setDataPegawai] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // 1. Fungsi Fetch Data Detail
  const fetchDetail = useCallback(async () => {
    if (!idPegawai || !isOpen) return;

    setLoading(true);
    try {
      const res = await Api.get(`/presensi/detail-rekap/${idPegawai}`, {
        params: { bulan, tahun },
      });
      setDataPegawai(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil detail rekap:", err);
    } finally {
      setLoading(false);
    }
  }, [idPegawai, bulan, tahun, isOpen]);

  // 2. Jalankan fetch saat modal dibuka atau ID/Bulan/Tahun berubah
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // e.target adalah elemen yang diklik
    // e.currentTarget adalah elemen yang memiliki event listener ini (si overlay)
    // Jika target dan currentTarget sama, berarti user klik tepat di area hitam, bukan di dalam kotak putih
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOpenEdit = (log) => {
    const formattedData = {
      pegawai: {
        id_pegawai: dataPegawai.id_pegawai,
        nama_lengkap: dataPegawai.nama,
      },
      presensi: {
        id_absensi: log.id_absensi,
        jam_masuk: log.jam_masuk,
        jam_keluar: log.jam_keluar,
        id_lokasi_masuk: log.id_lokasi_masuk,
        id_lokasi_keluar: log.id_lokasi_keluar,
        istirahat: {
          jam_mulai: log.istirahat_mulai,
          jam_selesai: log.istirahat_selesai,
          id_lokasi_istirahat: log.id_lokasi_istirahat,
        },
      },
      tanggal: log.tanggal_full,
    };

    setEditData(formattedData);
    setIsEditOpen(true);
  };

  return ReactDOM.createPortal(
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-custom-gelap w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 relative"
      >
        {/* Loading Overlay inside Modal */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[1px] z-[110] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 md:p-8 flex justify-between items-center bg-gradient-to-r from-custom-merah-terang to-custom-gelap text-white">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30">
              {dataPegawai?.nama.charAt(0) || "?"}
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter">
                {dataPegawai?.nama || "Memuat..."}
              </h2>
              <p className="text-xs text-white/70 tracking-widest uppercase font-medium">
                {dataPegawai?.nip} • {dataPegawai?.nama_departemen}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-4 flex items-center gap-2 px-2">
            <MdAccessTime size={16} className="text-custom-merah-terang" />
            Riwayat Log - {monthName} {tahun}
          </h3>

          <div className="grid gap-3">
            {dataPegawai?.logs?.map((log, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-white/5 px-5 py-4 rounded-[25px] border border-gray-100 dark:border-white/5 hover:border-custom-cerah/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Tanggal */}
                  <div className="flex items-center gap-3 min-w-[70px] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 pb-2 md:pb-0 md:pr-4">
                    <span className="text-2xl font-black text-custom-merah-terang leading-none">
                      {log.tanggal_hari}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase leading-none">
                      {monthName.substring(0, 3)}
                    </span>
                  </div>

                  {/* Grid Waktu */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                        Masuk
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold dark:text-white">
                          {log.jam_masuk || "--:--"}
                        </p>
                        {log.menit_terlambat > 0 && (
                          <span className="text-[8px] font-bold text-red-500">
                            -{log.menit_terlambat}m
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                        Pulang
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold dark:text-white">
                          {log.jam_keluar || "--:--"}
                        </p>
                        {log.menit_kurang_jam > 0 && (
                          <span className="text-[8px] font-bold text-orange-500">
                            -{log.menit_kurang_jam}m
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">
                        Istirahat
                      </p>
                      <p className="text-sm font-medium dark:text-gray-300">
                        {log.istirahat_mulai
                          ? `${log.istirahat_mulai} - ${log.istirahat_selesai}`
                          : "--:--"}
                      </p>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="flex items-center gap-3 ml-auto">
                    {/* Badge Status Dinamis */}
                    <span
                      className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                        log.status === "H"
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" // Hadir: Biru
                          : log.status === "S"
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20" // Sakit: Hijau
                            : log.status === "I"
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" // Izin: Oranye
                              : log.status === "C"
                                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" // Cuti: Ungu
                                : log.status === "A"
                                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20" // Alpa: Merah
                                  : "bg-gray-200 text-gray-500" // Libur/Lainnya
                      }`}
                    >
                      {log.status === "H"
                        ? "Hadir"
                        : log.status === "S"
                          ? "Sakit"
                          : log.status === "I"
                            ? "Izin"
                            : log.status === "C"
                              ? "Cuti"
                              : log.status === "A"
                                ? "Alpa"
                                : "Libur"}
                    </span>

                    {/* Tombol Edit */}
                    {log.id_absensi && (
                      <button
                        onClick={() => handleOpenEdit(log)}
                        className="p-2 bg-custom-cerah/10 text-custom-cerah hover:bg-custom-cerah hover:text-white rounded-xl transition-all shadow-sm"
                        title="Edit Log Presensi"
                      >
                        <MdEdit size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!loading && dataPegawai?.logs?.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-xs italic">
                Tidak ada log aktivitas bulan ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditOpen && (
        <ModalEditPresensi
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          data={editData}
          onRefresh={() => {
            fetchDetail(); // Refresh data di modal detail ini
            onRefresh(); // Refresh tabel utama
          }}
        />
      )}
    </div>,
    document.body,
  );
};

export default ModalDetailRekapan;
