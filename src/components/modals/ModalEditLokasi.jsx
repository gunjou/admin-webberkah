import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  MdClose,
  MdSave,
  MdLocationOn,
  MdMyLocation,
  MdCheckCircle,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import Api from "../../utils/Api";

const ModalEditLokasi = ({ isOpen, onClose, onRefresh, data }) => {
  const [loading, setLoading] = useState(false);
  const [masterLokasi, setMasterLokasi] = useState([]);
  const [selectedLokasiIds, setSelectedLokasiIds] = useState([]);
  const modalContentRef = useRef(null);

  // Handle Click Outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        modalContentRef.current &&
        !modalContentRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Fetch Master Lokasi & Sync Data Pegawai
  useEffect(() => {
    if (isOpen && data) {
      const fetchMasterLokasi = async () => {
        try {
          const res = await Api.get("/master/lokasi-absensi");
          setMasterLokasi(res.data.data);

          // Sync lokasi yang sudah dimiliki pegawai (berdasarkan id_lokasi)
          // Asumsi: data.lokasi_absensi berisi list lokasi pegawai saat ini
          const currentIds =
            data.lokasi_absensi?.map((loc) => loc.id_lokasi) || [];
          setSelectedLokasiIds(currentIds);
        } catch (err) {
          console.error("Gagal load master lokasi", err);
        }
      };
      fetchMasterLokasi();
    }
  }, [isOpen, data]);

  const toggleLokasi = (id) => {
    setSelectedLokasiIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        id_pegawai: data.id_pegawai,
        id_lokasi_list: selectedLokasiIds, // Mengirim array ID lokasi
      };

      const res = await Api.put(
        `/pegawai/update-lokasi/${data.id_pegawai}`,
        payload
      );

      if (res.data.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui lokasi absensi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !data) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center bg-white dark:bg-custom-gelap">
          <div>
            <h2 className="text-xl font-bold dark:text-white uppercase tracking-tight flex items-center gap-2">
              <MdLocationOn className="text-custom-cerah" /> Lokasi Absensi
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
              Penempatan Wilayah:{" "}
              <p className="text-black text-[12px]">{data.nama_lengkap}</p>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* List Lokasi */}
        <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">
            Pilih Lokasi yang Diizinkan ({selectedLokasiIds.length})
          </p>

          <div className="space-y-3">
            {masterLokasi.map((loc) => {
              const isSelected = selectedLokasiIds.includes(loc.id_lokasi);
              return (
                <div
                  key={loc.id_lokasi}
                  onClick={() => toggleLokasi(loc.id_lokasi)}
                  className={`p-4 rounded-[25px] border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-custom-cerah bg-custom-cerah/5 dark:bg-custom-cerah/10"
                      : "border-gray-100 dark:border-white/5 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected
                          ? "bg-custom-cerah text-white"
                          : "bg-gray-100 dark:bg-white/5 text-gray-400"
                      }`}
                    >
                      <MdMyLocation size={20} />
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isSelected ? "text-custom-cerah" : "dark:text-white"
                        }`}
                      >
                        {loc.nama_lokasi}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-medium">
                        Radius: {loc.radius_meter}m |{" "}
                        {loc.latitude?.toFixed(4) ?? "0.0000"},{" "}
                        {loc.longitude?.toFixed(4) ?? "0.0000"}
                      </p>
                    </div>
                  </div>
                  {isSelected ? (
                    <MdCheckCircle size={24} className="text-custom-cerah" />
                  ) : (
                    <MdRadioButtonUnchecked
                      size={24}
                      className="text-gray-200 dark:text-white/10"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-50 dark:border-white/5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-custom-merah-terang text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <MdSave size={18} />{" "}
            {loading ? "Menyimpan..." : "Update Penempatan Lokasi"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalEditLokasi;
