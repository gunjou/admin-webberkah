import React, { useEffect, useState } from "react";
import { MdClose, MdSave } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const INITIAL_FORM = {
  work_number: "",
  work_name: "",
  work_type: "TENDER",
  id_client: "",
  id_client_pic: "",
  internal_pic_name: "",
  progress_percent: 0,
  start_date: "",
  target_end_date: "",
  notes: "",
};

const ModalCreateWorkItem = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [clients, setClients] = useState([]);
  const [clientPics, setClientPics] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingClientPics, setLoadingClientPics] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoadingClients(true);

    try {
      const response = await Api.get("/work-item/master/clients/options");

      if (response.data.success) {
        setClients(response.data.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil client:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mengambil data client.",
      );
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchClientPics = async (idClient) => {
    if (!idClient) {
      setClientPics([]);
      return;
    }

    setLoadingClientPics(true);

    try {
      const response = await Api.get(
        `/work-item/master/clients/${idClient}/pics`,
      );

      if (response.data.success) {
        setClientPics(response.data.data || []);
      } else {
        setClientPics([]);
      }
    } catch (error) {
      console.error("Gagal mengambil client PIC:", error);

      setClientPics([]);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal mengambil data client PIC.",
      );
    } finally {
      setLoadingClientPics(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  };

  const handleClientChange = async (value) => {
    setForm((current) => ({
      ...current,
      id_client: value,
      id_client_pic: "",
    }));

    setErrors((current) => ({
      ...current,
      id_client: "",
      id_client_pic: "",
    }));

    setClientPics([]);

    if (value) {
      await fetchClientPics(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.work_number.trim()) {
      newErrors.work_number = "Work number wajib diisi.";
    }

    if (!form.work_name.trim()) {
      newErrors.work_name = "Nama pekerjaan wajib diisi.";
    }

    if (!form.work_type) {
      newErrors.work_type = "Work type wajib dipilih.";
    }

    if (!form.id_client) {
      newErrors.id_client = "Client wajib dipilih.";
    }

    if (!form.id_client_pic) {
      newErrors.id_client_pic = "Client PIC wajib dipilih.";
    }

    if (!form.internal_pic_name.trim()) {
      newErrors.internal_pic_name = "PIC internal wajib diisi.";
    }

    if (!form.start_date) {
      newErrors.start_date = "Tanggal mulai wajib diisi.";
    }

    if (!form.target_end_date) {
      newErrors.target_end_date = "Target selesai wajib diisi.";
    }

    if (
      form.start_date &&
      form.target_end_date &&
      form.target_end_date < form.start_date
    ) {
      newErrors.target_end_date =
        "Target selesai tidak boleh sebelum tanggal mulai.";
    }

    if (form.progress_percent === "" || form.progress_percent === null) {
      newErrors.progress_percent = "Progress wajib diisi.";
    } else if (
      Number(form.progress_percent) < 0 ||
      Number(form.progress_percent) > 100
    ) {
      newErrors.progress_percent =
        "Progress harus berada di antara 0 sampai 100.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        work_number: form.work_number.trim(),
        work_name: form.work_name.trim(),
        work_type: form.work_type,
        id_client: Number(form.id_client),
        id_client_pic: Number(form.id_client_pic),
        internal_pic_name: form.internal_pic_name.trim(),
        progress_percent: Number(form.progress_percent),
        start_date: form.start_date,
        target_end_date: form.target_end_date,
        notes: form.notes.trim() || null,
      };

      const response = await Api.post("/work-item/work", payload);

      if (response.data.success) {
        await SwalHelper.success(
          response.data.message || "Work item berhasil ditambahkan.",
        );

        if (onSuccess) {
          await onSuccess();
        }

        onClose();
      }
    } catch (error) {
      console.error("Gagal menambahkan work item:", error);

      await SwalHelper.error(
        error?.response?.data?.message || "Gagal menambahkan work item.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) => {
    if (!errors[field]) return null;

    return (
      <p className="mt-1 text-[9px] font-bold text-red-500">{errors[field]}</p>
    );
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-3xl max-h-[93vh] overflow-hidden bg-white dark:bg-custom-gelap rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div>
            <h2 className="text-sm font-black text-custom-gelap dark:text-white uppercase tracking-tight">
              Tambah Work Item
            </h2>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[1.5px] mt-0.5">
              Create New Work Item
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-300 transition-all hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50"
          >
            <MdClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(90vh-135px)] overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Work Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.work_number}
                  onChange={(e) => handleChange("work_number", e.target.value)}
                  placeholder="Contoh: WI-202609-001"
                  className={`w-full h-10 rounded-xl border ${errors.work_number ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang placeholder:text-gray-400`}
                />
                {renderError("work_number")}
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Work Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.work_type}
                  onChange={(e) => handleChange("work_type", e.target.value)}
                  className={`w-full h-10 rounded-xl border ${errors.work_type ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-black text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang cursor-pointer`}
                >
                  <option value="TENDER">TENDER</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
                {renderError("work_type")}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Nama Pekerjaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.work_name}
                  onChange={(e) => handleChange("work_name", e.target.value)}
                  rows={3}
                  placeholder="Masukkan nama pekerjaan..."
                  className={`w-full rounded-xl border ${errors.work_name ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 py-2.5 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang placeholder:text-gray-400 resize-none`}
                />
                {renderError("work_name")}
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.id_client}
                  onChange={(e) => handleClientChange(e.target.value)}
                  disabled={loadingClients || loading}
                  className={`w-full h-10 rounded-xl border ${errors.id_client ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-black text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {loadingClients ? "Memuat client..." : "Pilih Client"}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id_client} value={client.id_client}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {renderError("id_client")}
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Client PIC <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.id_client_pic}
                  onChange={(e) =>
                    handleChange("id_client_pic", e.target.value)
                  }
                  disabled={!form.id_client || loadingClientPics || loading}
                  className={`w-full h-10 rounded-xl border ${errors.id_client_pic ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-black text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {!form.id_client
                      ? "Pilih client terlebih dahulu"
                      : loadingClientPics
                        ? "Memuat PIC..."
                        : clientPics.length === 0
                          ? "Tidak ada PIC"
                          : "Pilih Client PIC"}
                  </option>
                  {clientPics.map((pic) => (
                    <option key={pic.id_client_pic} value={pic.id_client_pic}>
                      {pic.name}
                      {pic.position ? ` - ${pic.position}` : ""}
                    </option>
                  ))}
                </select>
                {renderError("id_client_pic")}
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  PIC Internal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.internal_pic_name}
                  onChange={(e) =>
                    handleChange("internal_pic_name", e.target.value)
                  }
                  placeholder="Nama PIC internal"
                  className={`w-full h-10 rounded-xl border ${errors.internal_pic_name ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang placeholder:text-gray-400`}
                />
                {renderError("internal_pic_name")}
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.progress_percent}
                  onChange={(e) =>
                    handleChange("progress_percent", e.target.value)
                  }
                  className={`w-full h-10 rounded-xl border ${errors.progress_percent ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang`}
                />
                {renderError("progress_percent")}
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  className={`w-full h-10 rounded-xl border ${errors.start_date ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang`}
                />
                {renderError("start_date")}
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Target Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.target_end_date}
                  onChange={(e) =>
                    handleChange("target_end_date", e.target.value)
                  }
                  className={`w-full h-10 rounded-xl border ${errors.target_end_date ? "border-red-500" : "border-gray-100 dark:border-white/10"} bg-gray-50 dark:bg-white/5 px-3 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang`}
                />
                {renderError("target_end_date")}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Catatan
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2.5 text-[10px] font-bold text-custom-gelap dark:text-white outline-none focus:border-custom-merah-terang placeholder:text-gray-400 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-custom-gelap dark:text-white text-[9px] font-black uppercase tracking-widest transition-all hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-custom-merah-terang text-white text-[9px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <MdSave size={16} />
                  Simpan Work Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreateWorkItem;
