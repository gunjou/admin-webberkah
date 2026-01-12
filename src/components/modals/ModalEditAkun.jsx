import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { MdClose, MdLockReset, MdCloudUpload, MdFace } from "react-icons/md";
import Api from "../../utils/Api";

const ModalEditAkun = ({ isOpen, onClose, onRefresh, data }) => {
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const modalContentRef = useRef(null);

  // Reset state saat modal tutup/buka
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

  // Fungsi 1: Reset Password
  const handleResetPassword = async () => {
    if (
      !window.confirm(
        `Reset password untuk ${data.nama_lengkap} menjadi '123456'?`
      )
    )
      return;

    setLoadingReset(true);
    try {
      const res = await Api.put(`/pegawai/reset-password/${data.id_pegawai}`, {
        password_baru: "123456",
      });
      if (res.data.success) {
        alert("Password berhasil di-reset ke default: 123456");
        onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal reset password");
    } finally {
      setLoadingReset(false);
    }
  };

  // Fungsi 2: Handle File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Fungsi 3: Upload Image Face Recognition
  const handleUploadImage = async () => {
    if (!selectedFile) {
      alert("Pilih file foto terlebih dahulu!");
      return;
    }

    const formData = new FormData();
    // 1. UBAH "image" MENJADI "file" agar sesuai dengan CURL/Swagger Anda
    formData.append("file", selectedFile);

    setLoadingUpload(true);
    try {
      const res = await Api.put(
        `/pegawai/update-wajah/${data.id_pegawai}`,
        formData,
        {
          headers: {
            // 2. Biarkan Axios & Browser yang menentukan Content-Type beserta boundary-nya
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        alert("Data wajah berhasil diperbarui!");
        onRefresh();
        onClose();
      }
    } catch (err) {
      // Log error untuk debug lebih lanjut jika masih gagal
      console.error("Upload Error:", err.response?.data);
      alert(err.response?.data?.message || "Gagal upload foto");
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
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold dark:text-white uppercase tracking-tight">
              Pengaturan Akun
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Admin Control: {data.nama_lengkap}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-8">
          {/* SEKSI 1: RESET PASSWORD */}
          <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-[30px] border border-gray-100 dark:border-white/10">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MdLockReset size={18} className="text-blue-500" /> Keamanan
              Sistem
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Tindakan ini akan mengembalikan password pengguna menjadi{" "}
              <span className="font-black text-custom-merah-terang">
                '123456'
              </span>
              .
            </p>
            <button
              onClick={handleResetPassword}
              disabled={loadingReset}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loadingReset ? "Memproses..." : "Reset Password Sekarang"}
            </button>
          </div>

          {/* SEKSI 2: UPLOAD FACE RECOGNITION */}
          <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-[30px] border border-gray-100 dark:border-white/10">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MdFace size={18} className="text-custom-merah-terang" /> Data
              Biometrik Wajah
            </h3>

            {/* Area Preview/Upload */}
            <div className="relative group w-full aspect-video bg-white dark:bg-custom-gelap rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center gap-2 mb-4 transition-all hover:border-custom-merah-terang">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : data.img_path ? (
                <img
                  src={data.img_path}
                  className="w-full h-full object-cover opacity-50 grayscale"
                  alt="Current Face"
                />
              ) : (
                <>
                  <MdCloudUpload
                    size={32}
                    className="text-gray-300 group-hover:text-custom-merah-terang"
                  />
                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                    Belum ada foto wajah
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
              className="w-full py-3 bg-custom-merah-terang hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
            >
              {loadingUpload ? "Mengunggah..." : "Upload Foto Wajah"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalEditAkun;
