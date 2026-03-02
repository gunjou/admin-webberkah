import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { MdClose, MdLockReset, MdCloudUpload, MdFace } from "react-icons/md";
import Swal from "sweetalert2";
import Api from "../../utils/Api";

const ModalEditAkun = ({ isOpen, onClose, onRefresh, data }) => {
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const modalContentRef = useRef(null);

  // Styling Custom untuk SweetAlert agar serasi dengan Dashboard
  const swalCustom = {
    popup: "rounded-[35px] dark:bg-custom-gelap dark:text-white border-none",
    confirmButton:
      "rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest",
    cancelButton:
      "rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest",
  };

  useEffect(() => {
    if (!isOpen) {
      setPreview(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

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

  // Fungsi 1: Reset Password dengan SweetAlert2
  const handleResetPassword = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Reset",
      html: `Reset password untuk pegawai <br/><b className="text-custom-merah-terang">${data.nama_lengkap}</b> menjadi <b className="text-blue-500">'123456'</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "YA, RESET SEKARANG",
      cancelButtonText: "BATAL",
      confirmButtonColor: "#2563eb", // Blue 600
      cancelButtonColor: "#9ca3af", // Gray 400
      customClass: swalCustom,
    });

    if (!result.isConfirmed) return;

    setLoadingReset(true);
    try {
      const res = await Api.put(`/pegawai/reset-password/${data.id_pegawai}`, {
        password_baru: "123456",
      });
      if (res.data.success) {
        Swal.fire({
          title: "Berhasil!",
          text: "Password telah dikembalikan ke default: 123456",
          icon: "success",
          confirmButtonColor: "#22c55e",
          customClass: swalCustom,
        });
        onRefresh();
      }
    } catch (err) {
      Swal.fire({
        title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan sistem",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: swalCustom,
      });
    } finally {
      setLoadingReset(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Fungsi 2: Upload Image dengan SweetAlert Loading & Success
  const handleUploadImage = async () => {
    if (!selectedFile) {
      Swal.fire({
        title: "Pilih Foto!",
        text: "Silakan pilih file foto wajah terlebih dahulu.",
        icon: "info",
        confirmButtonColor: "#ef4444",
        customClass: swalCustom,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoadingUpload(true);
    try {
      const res = await Api.put(
        `/pegawai/update-wajah/${data.id_pegawai}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success) {
        Swal.fire({
          title: "Terunggah!",
          text: `Data biometrik wajah ${data.nama_lengkap} berhasil diperbarui.`,
          icon: "success",
          confirmButtonColor: "#ef4444",
          customClass: swalCustom,
        });
        onRefresh();
        onClose();
      }
    } catch (err) {
      Swal.fire({
        title: "Gagal Upload!",
        text: err.response?.data?.message || "Format file tidak didukung",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: swalCustom,
      });
    } finally {
      setLoadingUpload(false);
    }
  };

  if (!isOpen || !data) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        ref={modalContentRef}
        className="bg-white dark:bg-custom-gelap w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
          <div>
            <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter italic">
              Pengaturan Akun
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[8px] bg-custom-merah-terang text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest">
                Target
              </span>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 font-bold uppercase">
                {data.nama_lengkap}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {/* SEKSI 1: RESET PASSWORD */}
          <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-[30px] border border-gray-100 dark:border-white/10 group transition-all hover:border-blue-500/30">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MdLockReset size={18} className="text-blue-500" /> Keamanan Akun
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed italic">
              Aksi ini akan memaksa password kembali ke standar operasional.
            </p>
            <button
              onClick={handleResetPassword}
              disabled={loadingReset}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loadingReset ? "Processing..." : "Reset to Default"}
            </button>
          </div>

          {/* SEKSI 2: UPLOAD FACE RECOGNITION */}
          <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-[30px] border border-gray-100 dark:border-white/10 group transition-all hover:border-custom-merah-terang/30">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MdFace size={18} className="text-custom-merah-terang" />{" "}
              Sinkronisasi Wajah
            </h3>

            <div className="relative group w-full aspect-video bg-white dark:bg-custom-gelap rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center gap-2 mb-4 transition-all group-hover:border-custom-merah-terang shadow-inner">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : data.img_path ? (
                <img
                  src={data.img_path}
                  className="w-full h-full object-cover opacity-60"
                  alt="Current Face"
                />
              ) : (
                <>
                  <MdCloudUpload
                    size={32}
                    className="text-gray-300 group-hover:text-custom-merah-terang transition-colors"
                  />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                    No Biometric Data
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>

            <button
              onClick={handleUploadImage}
              disabled={loadingUpload || !selectedFile}
              className="w-full py-3.5 bg-custom-merah-terang hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-custom-merah-terang/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {loadingUpload ? "Uploading..." : "Update Face Data"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-custom-merah-terang transition-colors"
          >
            Kembali ke Daftar Pegawai
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalEditAkun;
