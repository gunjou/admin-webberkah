import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const ModalUpdateProgress = ({
  show,
  onClose,
  workItemId,
  workItemName,
  currentProgress = 0,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    progress_percent: currentProgress,
    progress_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (show) {
      setForm({
        progress_percent: currentProgress ?? 0,
        progress_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [show, currentProgress]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "progress_percent") {
      // Izinkan input dikosongkan sementara
      if (value === "") {
        setForm((prev) => ({
          ...prev,
          progress_percent: "",
        }));
        return;
      }

      const progress = Math.min(100, Math.max(0, Number(value)));

      setForm((prev) => ({
        ...prev,
        progress_percent: progress,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const progress = Number(form.progress_percent);

    if (form.progress_percent === "" || isNaN(progress)) {
      SwalHelper.warning("Progress wajib diisi.");
      return false;
    }

    if (progress < 0 || progress > 100) {
      SwalHelper.warning("Progress harus berada di antara 0 sampai 100%.");
      return false;
    }

    if (!form.progress_date) {
      SwalHelper.warning("Tanggal progress wajib diisi.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = {
        progress_percent: Number(form.progress_percent),
        progress_date: form.progress_date,
        notes: form.notes.trim() || null,
      };

      const response = await Api.put(
        `/work-item/work/${workItemId}/progress`,
        payload,
      );

      if (response.data?.success) {
        await SwalHelper.success(
          response.data?.message || "Progress pekerjaan berhasil diperbarui.",
        );

        onSuccess?.();
        onClose();
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal memperbarui progress pekerjaan.",
        );
      }
    } catch (error) {
      SwalHelper.error(
        error.response?.data?.message ||
          "Gagal memperbarui progress pekerjaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const progressValue =
    form.progress_percent === "" ? 0 : Number(form.progress_percent);

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-custom-gelap dark:text-white">
              Update Progress
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Perbarui progress pekerjaan.
            </p>

            {workItemName && (
              <div className="min-w-0 rounded-lg py-2 dark:bg-white/5">
                {/* <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Pekerjaan
                </p> */}

                <p
                  className="min-w-0 truncate text-sm font-semibold text-custom-gelap dark:text-white"
                  title={workItemName}
                >
                  {workItemName}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Progress */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Progress Pekerjaan (%)
              </label>

              <span className="text-xs font-bold text-custom-merah">
                {progressValue}%
              </span>
            </div>

            {/* Number Input */}
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="progress_percent"
                value={form.progress_percent}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                disabled={loading}
                placeholder="0"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-custom-merah focus:ring-1 focus:ring-custom-merah disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                %
              </span>
            </div>

            {/* Slider */}
            <div className="mt-4">
              <input
                type="range"
                name="progress_percent"
                value={progressValue}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                disabled={loading}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-custom-merah disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700"
              />

              {/* Slider Labels */}
              <div className="mt-1 flex justify-between text-[10px] font-medium text-gray-400 dark:text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Progress Date */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Tanggal Progress
            </label>

            <input
              type="date"
              name="progress_date"
              value={form.progress_date}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-custom-merah focus:ring-1 focus:ring-custom-merah disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Catatan
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              placeholder="Contoh: Pekerjaan instalasi sudah mencapai 75%."
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-custom-merah focus:ring-1 focus:ring-custom-merah disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-custom-merah px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Progress"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUpdateProgress;
