import React, { useState } from "react";
import { MdClose, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import SwalHelper from "../../utils/Swal";
import Api from "../../utils/Api";

const ModalChangePassword = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setForm({
      old_password: "",
      new_password: "",
    });
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    resetForm();
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.old_password || !form.new_password) {
      await SwalHelper.warning("Password lama dan password baru wajib diisi.");
      return;
    }

    // if (form.new_password.length < 8) {
    //   await SwalHelper.warning("Password baru minimal 8 karakter.");
    //   return;
    // }

    if (form.old_password === form.new_password) {
      await SwalHelper.warning(
        "Password baru harus berbeda dari password lama.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await Api.put("/auth/change-password", {
        old_password: form.old_password,
        new_password: form.new_password,
      });

      if (res.data?.success === false) {
        throw new Error(res.data?.message || "Password gagal diubah.");
      }

      resetForm();
      onClose();

      await SwalHelper.success("Password akun kamu berhasil diperbarui.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Terjadi kesalahan saat mengubah password.";

      await SwalHelper.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-custom-merah-terang/10 text-custom-merah-terang">
              <MdLock size={23} />
            </div>

            <div>
              <h2 className="text-sm font-black text-custom-gelap dark:text-white">
                Ganti Password
              </h2>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Perbarui keamanan akun kamu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
            title="Tutup"
          >
            <MdClose size={21} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* Password Lama */}
          <div>
            <label
              htmlFor="old_password"
              className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-200"
            >
              Password Lama
            </label>

            <div className="relative">
              <input
                id="old_password"
                name="old_password"
                type={showOldPassword ? "text" : "password"}
                value={form.old_password}
                onChange={handleChange}
                placeholder="Masukkan password lama"
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-2 focus:ring-custom-merah-terang/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />

              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label={
                  showOldPassword
                    ? "Sembunyikan password lama"
                    : "Tampilkan password lama"
                }
              >
                {showOldPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label
              htmlFor="new_password"
              className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-200"
            >
              Password Baru
            </label>

            <div className="relative">
              <input
                id="new_password"
                name="new_password"
                type={showNewPassword ? "text" : "password"}
                value={form.new_password}
                onChange={handleChange}
                placeholder="Masukkan password baru"
                autoComplete="new-password"
                minLength={5}
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-2 focus:ring-custom-merah-terang/10 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                aria-label={
                  showNewPassword
                    ? "Sembunyikan password baru"
                    : "Tampilkan password baru"
                }
              >
                {showNewPassword ? (
                  <MdVisibilityOff size={20} />
                ) : (
                  <MdVisibility size={20} />
                )}
              </button>
            </div>

            <p className="mt-2 text-[10px] text-gray-400">
              Gunakan minimal 8 karakter untuk password baru.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-custom-merah-terang/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isSubmitting ? "Menyimpan..." : "Simpan Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalChangePassword;
