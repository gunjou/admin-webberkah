import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const swalConfig = {
  confirmButtonColor: "#A91D24",
  cancelButtonColor: "#7c161b",
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: "font-poppins rounded-[25px]",
    title: "text-lg md:text-xl font-bold text-custom-gelap",
    htmlContainer: "text-sm md:text-base text-gray-600",
    confirmButton: "px-5 py-2.5 rounded-xl text-sm font-bold",
    cancelButton: "px-5 py-2.5 rounded-xl text-sm font-bold",
  },
};

const SwalHelper = {
  success: (message = "Data berhasil disimpan.") => {
    return Swal.fire({
      ...swalConfig,
      icon: "success",
      title: "Berhasil",
      text: message,
      iconColor: "#A91D24",
    });
  },

  error: (message = "Terjadi kesalahan.") => {
    return Swal.fire({
      ...swalConfig,
      icon: "error",
      title: "Gagal",
      text: message,
      iconColor: "#7c161b",
    });
  },

  warning: (message = "Perhatian.") => {
    return Swal.fire({
      ...swalConfig,
      icon: "warning",
      title: "Perhatian",
      text: message,
      iconColor: "#B77171",
    });
  },

  info: (message = "Informasi.") => {
    return Swal.fire({
      ...swalConfig,
      icon: "info",
      title: "Informasi",
      text: message,
      iconColor: "#B77171",
    });
  },

  confirm: ({
    title = "Konfirmasi",
    message = "Apakah Anda yakin?",
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
  } = {}) => {
    return Swal.fire({
      ...swalConfig,
      icon: "warning",
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: "#A91D24",
      cancelButtonColor: "#6B7280",
      timer: undefined,
      timerProgressBar: false,
    });
  },
};

export default SwalHelper;
