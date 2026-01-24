import React, { useState, useEffect } from "react";
import { MdClose, MdInfoOutline, MdVisibility } from "react-icons/md";
import Api from "../../utils/Api";
import Swal from "sweetalert2"; // Import SweetAlert2

const NotificationModal = ({ isOpen, onClose, refreshCount }) => {
  const [activeTab, setActiveTab] = useState("izin");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ izin: [], lembur: [] });
  const [previewImage, setPreviewImage] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null); // Untuk spinner per item

  const fetchData = async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const [resIzin, resLembur] = await Promise.all([
        Api.get("/perizinan", { params: { status_approval: "pending" } }),
        Api.get("/lembur", { params: { status_approval: "pending" } }),
      ]);
      setData({
        izin: resIzin.data.data || [],
        lembur: resLembur.data.data || [],
      });
    } catch (err) {
      console.error("Gagal load notifikasi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const currentList = activeTab === "izin" ? data.izin : data.lembur;

  const handleAction = async (id, status, type) => {
    const label = type === "izin" ? "Izin" : "Lembur";
    let alasan = "";

    // Jika Rejected, gunakan SweetAlert2 Input Alasan
    if (status === "rejected") {
      const { value: text, isDismissed } = await Swal.fire({
        title: "ALASAN PENOLAKAN",
        input: "textarea",
        inputPlaceholder: "Tuliskan alasan penolakan di sini...",
        showCancelButton: true,
        confirmButtonText: "KIRIM PENOLAKAN",
        cancelButtonText: "BATAL",
        confirmButtonColor: "#dc2626",
        customClass: {
          popup: "rounded-[30px] dark:bg-custom-gelap dark:text-white",
          title: "text-xs font-black uppercase tracking-widest",
          input:
            "text-[10px] font-bold rounded-2xl border-gray-100 dark:bg-white/5 dark:text-white",
          confirmButton:
            "text-[10px] font-black uppercase px-6 py-2.5 rounded-xl",
          cancelButton:
            "text-[10px] font-black uppercase px-6 py-2.5 rounded-xl",
        },
      });

      if (isDismissed) return;
      if (!text) {
        Swal.fire({
          icon: "error",
          title: "GAGAL",
          text: "Alasan penolakan wajib diisi!",
          customClass: { popup: "rounded-3xl" },
        });
        return;
      }
      alasan = text;
    }

    setActionLoading(true);
    setActiveActionId(id);

    try {
      const endpoint = type === "izin" ? "/perizinan" : "/lembur";
      const url = `${endpoint}/${id}/${status}`;
      const payload = status === "rejected" ? { alasan_penolakan: alasan } : {};

      const response = await Api.put(url, payload);

      if (response.data.success) {
        // NOTIFIKASI BERHASIL DENGAN SWEETALERT2
        Swal.fire({
          icon: "success",
          title: `${label} Berhasil ${status === "approved" ? "Disetujui" : "Ditolak"}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            popup: "rounded-2xl font-black uppercase text-[10px]",
          },
        });

        await fetchData(); // Refresh list data
        if (refreshCount) refreshCount(); // Refresh count di Navbar
      }
    } catch (err) {
      console.error("Gagal melakukan aksi:", err);
      Swal.fire("ERROR", "Gagal memproses permohonan", "error");
    } finally {
      setActionLoading(false);
      setActiveActionId(null);
    }
  };

  return (
    <>
      <div className="absolute right-0 mt-3 w-[320px] md:w-[380px] bg-white dark:bg-[#2d1f29] rounded-[30px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Header Section */}
        <div className="p-5 bg-custom-gelap text-white flex justify-between items-center">
          <div className="leading-tight">
            <h3 className="text-sm font-black uppercase tracking-tighter italic">
              Persetujuan Pending
            </h3>
            <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">
              Administrator Berkah Angsana
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Tab Switcher - Ultra High Contrast & Compact */}
        <div className="flex p-1 bg-gray-200 dark:bg-black/60 gap-1 mx-5 mt-3 rounded-xl border border-gray-300 dark:border-white/5">
          {["izin", "lembur"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all duration-300 ${isActive ? "bg-custom-merah-terang text-white shadow-lg scale-[1.02] z-10" : "text-gray-500 dark:text-gray-600"}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className={isActive ? "opacity-100" : "opacity-60"}>
                    {tab}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[7px] font-black border transition-colors ${isActive ? "bg-white text-custom-merah-terang border-white" : "bg-gray-300 dark:bg-white/5 border-transparent text-gray-500"}`}
                  >
                    {loading ? "..." : data[tab].length}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-4 min-h-[150px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-50">
              <div className="w-6 h-6 border-2 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Sinkronisasi...
              </p>
            </div>
          ) : currentList.length > 0 ? (
            <div className="space-y-3">
              {currentList.map((item, idx) => {
                const isItemProcessing =
                  activeActionId === (item.id_lembur || item.id_izin);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 group transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-custom-merah-terang text-white flex items-center justify-center font-black text-[10px] uppercase shadow-sm">
                          {item.nama_panggilan?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black dark:text-white uppercase leading-none">
                            {item.nama_panggilan}
                          </h4>
                          <p className="text-[8px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">
                            {activeTab === "izin"
                              ? item.kategori_izin
                              : item.jenis_lembur}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-custom-cerah opacity-70 italic">
                        {item.tanggal || item.tgl_mulai}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mb-2 line-clamp-2 leading-tight italic">
                      "{item.keterangan || "Tidak ada keterangan"}"
                    </p>

                    {item.path_lampiran && (
                      <button
                        onClick={() => setPreviewImage(item.path_lampiran)}
                        className="w-full mb-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center gap-2 text-[9px] font-black uppercase border border-blue-100 dark:border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <MdVisibility size={14} /> Lihat Bukti Lampiran
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          handleAction(
                            item.id_lembur || item.id_izin,
                            "approved",
                            activeTab,
                          )
                        }
                        className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase hover:bg-green-600 transition-all shadow-sm flex items-center justify-center min-h-[28px]"
                      >
                        {isItemProcessing ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          "Setuju"
                        )}
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          handleAction(
                            item.id_lembur || item.id_izin,
                            "rejected",
                            activeTab,
                          )
                        }
                        className="flex-1 py-1.5 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center justify-center min-h-[28px]"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30">
              <MdInfoOutline size={32} />
              <p className="text-[10px] font-black uppercase mt-2 italic">
                Belum ada pengajuan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL IMAGE PREVIEW --- */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-sm w-full animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/50 hover:text-white transition-all"
            >
              <MdClose size={28} />
            </button>
            <div className="bg-white dark:bg-custom-gelap p-1.5 rounded-[35px] shadow-2xl border border-white/20 overflow-hidden">
              <img
                src={previewImage}
                alt="Lampiran"
                className="w-full h-auto rounded-[30px] shadow-inner"
              />
              <div className="py-4 text-center">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[3px]">
                  Dokumen Lampiran
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationModal;
