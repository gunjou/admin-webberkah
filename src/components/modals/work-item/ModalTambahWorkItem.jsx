import React, { useEffect, useState } from "react";
import { MdClose, MdSave, MdRefresh } from "react-icons/md";
import Api from "../../../utils/Api";
import SwalHelper from "../../../utils/Swal";

const initialForm = {
  work_no: "",
  description: "",
  id_client: "",
  id_client_pic: "",
  internal_pic: "",
  work_type: "MAINTENANCE",
  start_date: "",
  expected_contract_date: "",
  expected_completion_date: "",
  current_reason: "",
  next_action: "",
  document_url: "",
  initial_stage: "",
  initial_progress_percent: "0",
  initial_health_override: "",
  initial_note: "",
};

const stageOptions = [
  { value: "PENAWARAN", label: "Penawaran" },
  { value: "KONTRAK", label: "Kontrak" },
  { value: "PELAKSANAAN", label: "Pelaksanaan" },
  { value: "PEKERJAAN_SELESAI", label: "Pekerjaan Selesai" },
  { value: "BA", label: "BA" },
  { value: "INVOICE", label: "Invoice" },
  { value: "PEMBAYARAN", label: "Pembayaran" },
  { value: "CLOSED", label: "Closed" },
];

const healthOptions = [
  { value: "ON_TRACK", label: "On Track" },
  { value: "AT_RISK", label: "At Risk" },
  { value: "WARNING", label: "Warning" },
  { value: "DELAYED", label: "Delayed" },
];

const getInputClass = (hasError = false) =>
  `w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-custom-gelap outline-none transition placeholder:text-gray-400 focus:border-custom-merah-terang focus:ring-2 focus:ring-custom-merah-terang/10 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${
    hasError ? "border-red-500" : "border-gray-200 dark:border-gray-700"
  }`;

const getLabelClass =
  "mb-1.5 block text-sm font-semibold text-custom-gelap dark:text-gray-200";

const ModalTambahWorkItem = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [clients, setClients] = useState([]);
  const [clientPics, setClientPics] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingClientPics, setLoadingClientPics] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchClients = async () => {
    try {
      setLoadingClients(true);

      const response = await Api.get("/work-item/master/clients/options");

      if (response.data?.success) {
        setClients(response.data.data || []);
      } else {
        setClients([]);
        setError(response.data?.message || "Gagal mengambil daftar client.");
      }
    } catch (err) {
      setClients([]);
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat mengambil daftar client.",
      );
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchClientPics = async (clientId) => {
    if (!clientId) {
      setClientPics([]);
      return;
    }

    try {
      setLoadingClientPics(true);

      const response = await Api.get(
        `/work-item/master/clients/${clientId}/pics`,
      );

      if (response.data?.success) {
        setClientPics(response.data.data || []);
      } else {
        setClientPics([]);
        setError(
          response.data?.message || "Gagal mengambil daftar client PIC.",
        );
      }
    } catch (err) {
      setClientPics([]);
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat mengambil client PIC.",
      );
    } finally {
      setLoadingClientPics(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const response = await Api.get("/pegawai/basic");

      if (response.data?.success) {
        setEmployees(response.data.data || []);
      } else {
        setEmployees([]);
        setError(response.data?.message || "Gagal mengambil daftar pegawai.");
      }
    } catch (err) {
      setEmployees([]);
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat mengambil daftar pegawai.",
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(initialForm);
    setClientPics([]);
    setError("");
    setFieldErrors({});

    fetchClients();
    fetchEmployees();
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    if (name === "id_client") {
      setForm((previous) => ({
        ...previous,
        id_client: value,
        id_client_pic: "",
      }));

      setClientPics([]);
      fetchClientPics(value);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.work_no.trim()) {
      errors.work_no = "Work Number wajib diisi.";
    }

    if (!form.description.trim()) {
      errors.description = "Deskripsi pekerjaan wajib diisi.";
    }

    if (!form.id_client) {
      errors.id_client = "Client wajib dipilih.";
    }

    if (!form.work_type) {
      errors.work_type = "Work Type wajib dipilih.";
    }

    if (form.initial_progress_percent !== "") {
      const progress = Number(form.initial_progress_percent);

      if (Number.isNaN(progress) || progress < 0 || progress > 100) {
        errors.initial_progress_percent =
          "Progress harus berada pada rentang 0 sampai 100.";
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      work_no: form.work_no.trim(),
      description: form.description.trim(),
      id_client: Number(form.id_client),
      work_type: form.work_type,
    };

    if (form.id_client_pic) {
      payload.id_client_pic = Number(form.id_client_pic);
    }

    if (form.internal_pic.trim()) {
      payload.internal_pic = form.internal_pic.trim();
    }

    if (form.start_date) {
      payload.start_date = form.start_date;
    }

    if (form.expected_contract_date) {
      payload.expected_contract_date = form.expected_contract_date;
    }

    if (form.expected_completion_date) {
      payload.expected_completion_date = form.expected_completion_date;
    }

    if (form.current_reason.trim()) {
      payload.current_reason = form.current_reason.trim();
    }

    if (form.next_action.trim()) {
      payload.next_action = form.next_action.trim();
    }

    if (form.document_url.trim()) {
      payload.document_url = form.document_url.trim();
    }

    if (form.initial_stage) {
      payload.initial_stage = form.initial_stage;
    }

    if (form.initial_progress_percent !== "") {
      payload.initial_progress_percent = Number(form.initial_progress_percent);
    }

    if (form.initial_health_override) {
      payload.initial_health_override = form.initial_health_override;
    }

    if (form.initial_note.trim()) {
      payload.initial_note = form.initial_note.trim();
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = buildPayload();

      const response = await Api.post("/work-item/work", payload);

      if (response.data?.success) {
        await SwalHelper.success("Work Item berhasil ditambahkan.");

        if (onSuccess) {
          onSuccess(response.data.data);
        } else {
          onClose();
        }
      } else {
        setError(response.data?.message || "Gagal menambahkan Work Item.");
      }
    } catch (err) {
      const responseData = err.response?.data;

      setError(
        responseData?.message ||
          "Terjadi kesalahan saat menambahkan Work Item.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setClientPics([]);
    setError("");
    setFieldErrors({});
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800 md:px-6">
          <div>
            <h2 className="text-lg font-bold text-custom-gelap dark:text-white md:text-xl">
              Tambah Work Item
            </h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 md:text-sm">
              Masukkan informasi pekerjaan baru.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-custom-merah-terang disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
          >
            <MdClose size={22} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-5 py-5 md:px-6"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={getLabelClass}>
                Work Number <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="work_no"
                value={form.work_no}
                onChange={handleChange}
                placeholder="Contoh: WO-2026-003"
                className={getInputClass(fieldErrors.work_no)}
                disabled={submitting}
              />

              {fieldErrors.work_no && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.work_no}
                </p>
              )}
            </div>

            <div>
              <label className={getLabelClass}>
                Work Type <span className="text-red-500">*</span>
              </label>

              <select
                name="work_type"
                value={form.work_type}
                onChange={handleChange}
                className={getInputClass(fieldErrors.work_type)}
                disabled={submitting}
              >
                <option value="MAINTENANCE">Maintenance</option>
                <option value="TENDER">Tender</option>
              </select>

              {fieldErrors.work_type && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.work_type}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={getLabelClass}>
                Deskripsi Pekerjaan <span className="text-red-500">*</span>
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Masukkan deskripsi pekerjaan..."
                className={getInputClass(fieldErrors.description)}
                disabled={submitting}
              />

              {fieldErrors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            <div>
              <label className={getLabelClass}>
                Client <span className="text-red-500">*</span>
              </label>

              <select
                name="id_client"
                value={form.id_client}
                onChange={handleChange}
                className={getInputClass(fieldErrors.id_client)}
                disabled={submitting || loadingClients}
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

              {fieldErrors.id_client && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.id_client}
                </p>
              )}
            </div>

            <div>
              <label className={getLabelClass}>Client PIC</label>

              <select
                name="id_client_pic"
                value={form.id_client_pic}
                onChange={handleChange}
                className={getInputClass()}
                disabled={submitting || !form.id_client || loadingClientPics}
              >
                <option value="">
                  {!form.id_client
                    ? "Pilih client terlebih dahulu"
                    : loadingClientPics
                      ? "Memuat client PIC..."
                      : clientPics.length === 0
                        ? "Tidak ada client PIC"
                        : "Pilih client PIC"}
                </option>

                {clientPics.map((pic) => (
                  <option key={pic.id_client_pic} value={pic.id_client_pic}>
                    {pic.name}
                    {pic.position ? ` - ${pic.position}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={getLabelClass}>Internal PIC</label>

              <select
                name="internal_pic"
                value={form.internal_pic}
                onChange={handleChange}
                className={getInputClass()}
                disabled={submitting || loadingEmployees}
              >
                <option value="">
                  {loadingEmployees
                    ? "Memuat pegawai..."
                    : "Pilih internal PIC"}
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id_pegawai}
                    value={employee.nama_panggilan}
                  >
                    {employee.nama_lengkap}
                    {employee.nama_panggilan
                      ? ` (${employee.nama_panggilan})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={getLabelClass}>Start Date</label>

              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className={getInputClass()}
                disabled={submitting}
              />
            </div>

            <div>
              <label className={getLabelClass}>Expected Contract Date</label>

              <input
                type="date"
                name="expected_contract_date"
                value={form.expected_contract_date}
                onChange={handleChange}
                className={getInputClass()}
                disabled={submitting}
              />
            </div>

            <div>
              <label className={getLabelClass}>Expected Completion Date</label>

              <input
                type="date"
                name="expected_completion_date"
                value={form.expected_completion_date}
                onChange={handleChange}
                className={getInputClass()}
                disabled={submitting}
              />
            </div>

            <div>
              <label className={getLabelClass}>Initial Stage</label>

              <select
                name="initial_stage"
                value={form.initial_stage}
                onChange={handleChange}
                className={getInputClass()}
                disabled={submitting}
              >
                <option value="">Gunakan default</option>

                {stageOptions.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={getLabelClass}>Initial Progress (%)</label>

              <input
                type="number"
                name="initial_progress_percent"
                value={form.initial_progress_percent}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className={getInputClass(fieldErrors.initial_progress_percent)}
                disabled={submitting}
              />

              {fieldErrors.initial_progress_percent && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.initial_progress_percent}
                </p>
              )}
            </div>

            <div>
              <label className={getLabelClass}>Initial Health Override</label>

              <select
                name="initial_health_override"
                value={form.initial_health_override}
                onChange={handleChange}
                className={getInputClass()}
                disabled={submitting}
              >
                <option value="">Gunakan default</option>

                {healthOptions.map((health) => (
                  <option key={health.value} value={health.value}>
                    {health.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={getLabelClass}>Current Reason</label>

              <textarea
                name="current_reason"
                value={form.current_reason}
                onChange={handleChange}
                rows={2}
                placeholder="Alasan atau kondisi pekerjaan saat ini..."
                className={getInputClass()}
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className={getLabelClass}>Next Action</label>

              <textarea
                name="next_action"
                value={form.next_action}
                onChange={handleChange}
                rows={2}
                placeholder="Tindakan selanjutnya yang perlu dilakukan..."
                className={getInputClass()}
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className={getLabelClass}>Document URL</label>

              <input
                type="url"
                name="document_url"
                value={form.document_url}
                onChange={handleChange}
                placeholder="https://..."
                className={getInputClass()}
                disabled={submitting}
              />
            </div>

            <div className="md:col-span-2">
              <label className={getLabelClass}>Initial Monitoring Note</label>

              <textarea
                name="initial_note"
                value={form.initial_note}
                onChange={handleChange}
                rows={3}
                placeholder="Catatan monitoring awal..."
                className={getInputClass()}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <MdRefresh size={18} />
              Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-custom-merah disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdSave size={18} />
              {submitting ? "Menyimpan..." : "Simpan Work Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTambahWorkItem;
