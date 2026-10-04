import React, { useEffect, useMemo, useState } from "react";
import {
  MdClose,
  MdEditNote,
  MdFlag,
  MdNotes,
  MdSave,
  MdTrendingUp,
} from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const TENDER_STAGES = [
  "PENAWARAN",
  "KONTRAK",
  "PELAKSANAAN",
  "PEKERJAAN_SELESAI",
];
//   "BA",
//   "INVOICE",
//   "PEMBAYARAN",
//   "CLOSED",

const MAINTENANCE_STAGES = [
  "PELAKSANAAN",
  "PENAWARAN",
  "KONTRAK",
  "PEKERJAAN_SELESAI",
];
//   "BA",
//   "INVOICE",
//   "PEMBAYARAN",
//   "CLOSED",

const HEALTH_OPTIONS = [
  {
    value: "ON_TRACK",
    label: "On Track",
    description: "Pekerjaan berjalan sesuai rencana.",
  },
  {
    value: "AT_RISK",
    label: "At Risk",
    description: "Terdapat risiko yang dapat mempengaruhi pekerjaan.",
  },
  {
    value: "WARNING",
    label: "Warning",
    description: "Pekerjaan membutuhkan perhatian lebih.",
  },
  {
    value: "DELAYED",
    label: "Delayed",
    description: "Pekerjaan mengalami keterlambatan.",
  },
];

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
};

const formatStage = (stage) => {
  if (!stage) return "-";

  return stage
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const INITIAL_FORM = {
  update_date: getToday(),
  stage: "",
  progress_percent: 0,
  health: "",
  reason: "",
  next_action: "",
  note: "",
};

const ModalUpdateWorkItem = ({
  isOpen,
  workItemId,
  workItem,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const timelineStages = useMemo(() => {
    return workItem?.work_type === "MAINTENANCE"
      ? MAINTENANCE_STAGES
      : TENDER_STAGES;
  }, [workItem?.work_type]);

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      update_date: getToday(),
      stage: workItem?.current_stage || timelineStages[0] || "",
      progress_percent: Number(workItem?.progress_percent ?? 0),
      health: "",
      reason: workItem?.current_reason || "",
      next_action: workItem?.next_action || "",
      note: "",
    });
  }, [isOpen, workItem, timelineStages]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProgressChange = (event) => {
    setForm((prev) => ({
      ...prev,
      progress_percent: Number(event.target.value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.stage) {
      await SwalHelper.warning("Stage pekerjaan wajib dipilih.");
      return;
    }

    if (
      form.progress_percent === "" ||
      Number(form.progress_percent) < 0 ||
      Number(form.progress_percent) > 100
    ) {
      await SwalHelper.warning(
        "Progress harus berada di antara 0 sampai 100%.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        update_date: form.update_date || null,
        stage: form.stage,
        progress_percent: Number(form.progress_percent),
        health: form.health || null,
        reason: form.reason.trim() || null,
        next_action: form.next_action.trim() || null,
        note: form.note.trim() || null,
      };

      await Api.post(`/work-item/work/${workItemId}/updates`, payload);

      await SwalHelper.success("Update monitoring berhasil disimpan.");

      onSuccess?.();
    } catch (error) {
      console.error("Gagal menyimpan update monitoring:", error);

      await SwalHelper.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Update monitoring gagal disimpan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-[#241b22]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-custom-merah/10 text-custom-merah dark:bg-custom-merah/20 dark:text-custom-cerah">
              <MdEditNote size={26} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-custom-gelap dark:text-white">
                Update Monitoring
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Perbarui perkembangan pekerjaan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed dark:hover:bg-white/10 dark:hover:text-white"
          >
            <MdClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-5 p-6">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Work Item
              </p>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-custom-gelap dark:text-white">
                    {workItem?.work_no || "-"}
                  </p>

                  <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                    {workItem?.description || "-"}
                  </p>
                </div>

                {workItem?.work_type && (
                  <span className="rounded-full bg-custom-merah/10 px-3 py-1 text-xs font-bold text-custom-merah dark:bg-custom-merah/20 dark:text-custom-cerah">
                    {workItem.work_type}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-custom-gelap dark:text-gray-200">
                  Tanggal Monitoring
                </label>

                <input
                  type="date"
                  name="update_date"
                  value={form.update_date}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-custom-gelap dark:text-gray-200">
                  Stage <span className="text-custom-merah">*</span>
                </label>

                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 dark:border-white/10 dark:bg-[#2c2129] dark:text-gray-200"
                >
                  {timelineStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {formatStage(stage)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 dark:border-white/10">
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-custom-gelap dark:text-gray-200">
                  <MdTrendingUp className="text-custom-merah" size={19} />
                  Progress Pekerjaan
                </label>

                <span className="rounded-lg bg-custom-merah/10 px-3 py-1 text-sm font-bold text-custom-merah dark:bg-custom-merah/20 dark:text-custom-cerah">
                  {form.progress_percent}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                name="progress_percent"
                value={form.progress_percent}
                onChange={handleProgressChange}
                disabled={submitting}
                className="w-full cursor-pointer accent-[#A91D24]"
              />

              <div className="mt-1 flex justify-between text-[10px] font-medium text-gray-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-custom-gelap dark:text-gray-200">
                <MdFlag className="text-custom-merah" size={18} />
                Health
              </label>

              <select
                name="health"
                value={form.health}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 dark:border-white/10 dark:bg-[#2c2129] dark:text-gray-200"
              >
                <option value="">Gunakan kalkulasi sistem</option>

                {HEALTH_OPTIONS.map((health) => (
                  <option key={health.value} value={health.value}>
                    {health.label}
                  </option>
                ))}
              </select>

              {form.health && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {
                    HEALTH_OPTIONS.find((item) => item.value === form.health)
                      ?.description
                  }
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-custom-gelap dark:text-gray-200">
                Current Reason
              </label>

              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                disabled={submitting}
                rows={3}
                placeholder="Jelaskan kondisi pekerjaan saat ini..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-custom-gelap dark:text-gray-200">
                Next Action
              </label>

              <textarea
                name="next_action"
                value={form.next_action}
                onChange={handleChange}
                disabled={submitting}
                rows={3}
                placeholder="Apa tindakan berikutnya yang perlu dilakukan?"
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-custom-gelap dark:text-gray-200">
                <MdNotes className="text-custom-merah" size={18} />
                Catatan Monitoring
              </label>

              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                disabled={submitting}
                rows={3}
                placeholder="Tambahkan catatan monitoring..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-custom-merah focus:ring-2 focus:ring-custom-merah/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end dark:border-white/10 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-custom-merah px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdSave size={18} />
              {submitting ? "Menyimpan..." : "Simpan Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUpdateWorkItem;
