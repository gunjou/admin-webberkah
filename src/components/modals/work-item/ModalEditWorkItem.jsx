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
  start_date: "",
  target_end_date: "",
  notes: "",
};

const ModalEditWorkItem = ({ idWorkItem, onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [clients, setClients] = useState([]);
  const [clientPics, setClientPics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingPics, setLoadingPics] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      setLoadingClients(true);

      const response = await Api.get("/work-item/master/clients/options");

      if (response.data?.success) {
        setClients(response.data.data || []);
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil data client.",
        );
      }
    } catch (err) {
      SwalHelper.error(
        err.response?.data?.message || "Gagal mengambil data client.",
      );
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchClientPics = async (idClient, selectedPicId = "") => {
    if (!idClient) {
      setClientPics([]);
      return;
    }

    try {
      setLoadingPics(true);

      const response = await Api.get(
        `/work-item/master/clients/${idClient}/pics`,
      );

      if (response.data?.success) {
        const pics = response.data.data || [];
        setClientPics(pics);

        if (selectedPicId) {
          const exists = pics.some(
            (pic) => Number(pic.id_client_pic) === Number(selectedPicId),
          );

          if (exists) {
            setForm((prev) => ({ ...prev, id_client_pic: selectedPicId }));
          }
        }
      } else {
        SwalHelper.error(
          response.data?.message || "Gagal mengambil data PIC client.",
        );
      }
    } catch (err) {
      SwalHelper.error(
        err.response?.data?.message || "Gagal mengambil data PIC client.",
      );
    } finally {
      setLoadingPics(false);
    }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await Api.get(`/work-item/work/${idWorkItem}`);

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal mengambil detail pekerjaan.");
        return;
      }

      const workItem = response.data.data?.work_item;

      if (!workItem) {
        setError("Data pekerjaan tidak ditemukan.");
        return;
      }

      setForm({
        work_number: workItem.work_number || "",
        work_name: workItem.work_name || "",
        work_type: workItem.work_type || "TENDER",
        id_client: workItem.id_client ? String(workItem.id_client) : "",
        id_client_pic: workItem.id_client_pic
          ? String(workItem.id_client_pic)
          : "",
        internal_pic_name: workItem.internal_pic_name || "",
        start_date: workItem.start_date || "",
        target_end_date: workItem.target_end_date || "",
        notes: workItem.notes || "",
      });

      await fetchClientPics(workItem.id_client, workItem.id_client_pic);
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal mengambil detail pekerjaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!idWorkItem) return;

    const loadData = async () => {
      await fetchClients();
      await fetchDetail();
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idWorkItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleClientChange = async (e) => {
    const idClient = e.target.value;

    setForm((prev) => ({
      ...prev,
      id_client: idClient,
      id_client_pic: "",
    }));

    setClientPics([]);
    setError("");

    if (idClient) {
      await fetchClientPics(idClient);
    }
  };

  const validateForm = () => {
    if (!form.work_number.trim()) {
      return "Nomor pekerjaan wajib diisi.";
    }

    if (!form.work_name.trim()) {
      return "Nama pekerjaan wajib diisi.";
    }

    if (!form.work_type) {
      return "Jenis pekerjaan wajib dipilih.";
    }

    if (!form.id_client) {
      return "Client wajib dipilih.";
    }

    if (!form.id_client_pic) {
      return "PIC client wajib dipilih.";
    }

    if (!form.internal_pic_name.trim()) {
      return "PIC internal wajib diisi.";
    }

    if (!form.start_date) {
      return "Tanggal mulai wajib diisi.";
    }

    if (!form.target_end_date) {
      return "Target selesai wajib diisi.";
    }

    if (form.target_end_date < form.start_date) {
      return "Target selesai tidak boleh lebih awal dari tanggal mulai.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        work_number: form.work_number.trim(),
        work_name: form.work_name.trim(),
        work_type: form.work_type,
        id_client: Number(form.id_client),
        id_client_pic: Number(form.id_client_pic),
        internal_pic_name: form.internal_pic_name.trim(),
        start_date: form.start_date,
        target_end_date: form.target_end_date,
        notes: form.notes.trim() || null,
      };

      const response = await Api.put(`/work-item/work/${idWorkItem}`, payload);

      if (!response.data?.success) {
        setError(response.data?.message || "Gagal memperbarui pekerjaan.");
        return;
      }

      await SwalHelper.success(
        response.data?.message || "Work item berhasil diperbarui.",
      );

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui pekerjaan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-3xl max-h-[93vh] overflow-hidden rounded-xl bg-white shadow-xl dark:bg-custom-gelap">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Edit Pekerjaan
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Perbarui informasi pekerjaan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <MdClose size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-custom-merah-terang"></div>
              </div>
            ) : (
              <div className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Nomor Pekerjaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="work_number"
                      value={form.work_number}
                      onChange={handleChange}
                      placeholder="Contoh: WI-2026-001"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Jenis Pekerjaan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="work_type"
                      value={form.work_type}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="TENDER">Tender</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nama Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="work_name"
                    value={form.work_name}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Masukkan nama pekerjaan"
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Client <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_client"
                      value={form.id_client}
                      onChange={handleClientChange}
                      disabled={loadingClients}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700"
                    >
                      <option value="">
                        {loadingClients ? "Memuat client..." : "Pilih client"}
                      </option>
                      {clients.map((client) => (
                        <option key={client.id_client} value={client.id_client}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      PIC Client <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_client_pic"
                      value={form.id_client_pic}
                      onChange={handleChange}
                      disabled={!form.id_client || loadingPics}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:disabled:bg-gray-700"
                    >
                      <option value="">
                        {!form.id_client
                          ? "Pilih client terlebih dahulu"
                          : loadingPics
                            ? "Memuat PIC..."
                            : "Pilih PIC client"}
                      </option>
                      {clientPics.map((pic) => (
                        <option
                          key={pic.id_client_pic}
                          value={pic.id_client_pic}
                        >
                          {pic.name}
                          {pic.position ? ` - ${pic.position}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    PIC Internal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="internal_pic_name"
                    value={form.internal_pic_name}
                    onChange={handleChange}
                    placeholder="Nama PIC internal"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Tanggal Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Target Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="target_end_date"
                      value={form.target_end_date}
                      min={form.start_date || undefined}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Catatan
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Masukkan catatan pekerjaan"
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-custom-merah-terang focus:ring-1 focus:ring-custom-merah-terang dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || saving}
              className="flex items-center gap-2 rounded-lg bg-custom-merah-terang px-5 py-2.5 text-sm font-medium text-white transition hover:bg-custom-merah disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdSave size={18} />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditWorkItem;
