import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MdSearch,
  MdCircle,
  MdClose,
  MdInfoOutline,
  MdLocationOn,
  MdTimer,
  MdChevronLeft,
  MdChevronRight,
  MdErrorOutline,
  MdVisibility,
  MdRefresh,
} from "react-icons/md";
import Api from "../../utils/Api";
import { toTitleCase } from "../../utils/Helpers";

// =====================================================
// KONSTANTA (mengacu LOG_ABSENSI_ENDPOINT.md)
// =====================================================
const AKSI_OPTIONS = [
  { value: "CHECK_IN", label: "Check In" },
  { value: "ISTIRAHAT_MULAI", label: "Istirahat Mulai" },
  { value: "ISTIRAHAT_SELESAI", label: "Istirahat Selesai" },
  { value: "CHECK_OUT", label: "Check Out" },
];

const BULAN_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const NOW = new Date();
const TAHUN_OPTIONS = Array.from(
  { length: 5 },
  (_, i) => NOW.getFullYear() - i,
);

const pad = (n) => String(n).padStart(2, "0");

// Rentang tanggal 1 bulan penuh (tidak melewati hari ini)
const periodeBulan = (bulan, tahun) => {
  const b = Number(bulan);
  const t = Number(tahun);
  const lastDay = new Date(t, b, 0).getDate();
  const today = new Date().toLocaleDateString("en-CA");
  let selesai = `${t}-${pad(b)}-${pad(lastDay)}`;
  if (selesai > today) selesai = today;
  return { tanggal_mulai: `${t}-${pad(b)}-01`, tanggal_selesai: selesai };
};

const aksiLabel = (aksi) =>
  AKSI_OPTIONS.find((a) => a.value === aksi)?.label || aksi || "-";

// Kelompok penyebab berdasarkan http_status
const statusStyle = (status) => {
  if (status >= 500)
    return "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
  if (status === 422)
    return "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
  if (status === 409)
    return "bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20";
  if (status === 403 || status === 404)
    return "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
  return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
};

const statusHint = (status) => {
  if (status >= 500) return "Bug backend — cek detail teknis";
  if (status === 422) return "Verifikasi gagal (wajah / lokasi / jam)";
  if (status === 409) return "Urutan aksi salah / aplikasi tidak sinkron";
  if (status === 403 || status === 404)
    return "Konfigurasi pegawai / shift / lokasi di admin";
  return "Input tidak lengkap";
};

const formatWaktu = (iso) => {
  if (!iso) return { tgl: "-", jam: "-" };
  const [d, t] = iso.split("T");
  const date = new Date(`${d}T00:00:00`);
  return {
    tgl: date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    jam: (t || "").slice(0, 8),
  };
};

const getInitial = (nama) => {
  const words = (nama || "").trim().split(/\s+/);
  if (words.length > 1) return `${words[0].charAt(0)}${words[1].charAt(0)}`;
  return words[0]?.charAt(0) || "?";
};

const inputClass =
  "w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-2 rounded-lg text-[10px] outline-none dark:text-white";

// =====================================================
// KOMPONEN
// =====================================================
const LogAbsensi = () => {
  const [loading, setLoading] = useState(false);
  const [dataLog, setDataLog] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, total_page: 1 });
  const [masterPegawai, setMasterPegawai] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [filter, setFilter] = useState({
    bulan: NOW.getMonth() + 1,
    tahun: NOW.getFullYear(),
    id_pegawai: "",
    aksi: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    Api.get("/pegawai/basic")
      .then((res) => setMasterPegawai(res.data.data || []))
      .catch((err) => console.error("Gagal load pegawai", err));
  }, []);

  const buildParams = () => {
    const { bulan, tahun, ...rest } = filter;
    const params = periodeBulan(bulan, tahun);
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== "" && v !== null) params[k] = v;
    });
    return params;
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = buildParams();
      const resList = await Api.get("/absensi/log", {
        params: { ...params, page, limit },
      });
      setDataLog(resList.data.data || []);
      setMeta(resList.data.meta || { page: 1, total: 0, total_page: 1 });
    } catch (err) {
      console.error("Gagal load log absensi:", err);
      setDataLog([]);
      setErrorMsg(
        err.response?.data?.message || "Gagal memuat log error absensi",
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [
    filter.bulan,
    filter.tahun,
    filter.id_pegawai,
    filter.aksi,
    filter.search,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), filter.search ? 500 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    filter.bulan,
    filter.tahun,
    filter.id_pegawai,
    filter.aksi,
    filter.search,
  ]);

  const openDetail = async (item) => {
    setDetail({ ...item, _loading: true });
    setLoadingDetail(true);
    try {
      const res = await Api.get(`/absensi/log/${item.id_log}`);
      setDetail({ ...item, ...res.data.data });
    } catch (err) {
      console.error("Gagal load detail log:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const setF = (key) => (e) => setFilter({ ...filter, [key]: e.target.value });

  const periodeLabel = `${BULAN_OPTIONS[filter.bulan - 1]} ${filter.tahun}`;

  return (
    <div className="space-y-3 animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
              Log Error Absensi
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-custom-cerah/10 rounded-full border border-custom-cerah/20">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  loading
                    ? "bg-orange-500 animate-pulse"
                    : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                }`}
              ></div>
              <span className="text-[8px] font-black text-custom-cerah uppercase tracking-widest">
                {loading ? "Syncing..." : "Live"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-4 bg-custom-merah-terang"></div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-tight">
              Periode {periodeLabel} · hanya aksi yang gagal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={fetchData}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-custom-gelap border border-gray-200 dark:border-white/10 text-custom-gelap dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm active:scale-95"
          >
            <MdRefresh
              size={18}
              className={`text-custom-merah-terang ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-custom-gelap p-3 rounded-[20px] shadow-sm border border-gray-100 dark:border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Bulan
            </label>
            <select
              value={filter.bulan}
              onChange={setF("bulan")}
              className={inputClass}
            >
              {BULAN_OPTIONS.map((nama, i) => (
                <option key={nama} value={i + 1}>
                  {nama}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Tahun
            </label>
            <select
              value={filter.tahun}
              onChange={setF("tahun")}
              className={inputClass}
            >
              {TAHUN_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Pegawai
            </label>
            <select
              value={filter.id_pegawai}
              onChange={setF("id_pegawai")}
              className={inputClass}
            >
              <option value="">Semua Pegawai</option>
              {masterPegawai.map((p) => (
                <option key={p.id_pegawai} value={p.id_pegawai}>
                  {p.nama_lengkap}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Aksi
            </label>
            <select
              value={filter.aksi}
              onChange={setF("aksi")}
              className={inputClass}
            >
              <option value="">Semua Aksi</option>
              {AKSI_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-1">
              Pencarian
            </label>
            <div className="relative">
              <MdSearch
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Nama / NIP / pesan..."
                value={filter.search}
                onChange={setF("search")}
                className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[10px] outline-none dark:text-white focus:border-custom-cerah"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white dark:bg-custom-gelap rounded-[25px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[420px] custom-scrollbar">
          <table className="w-full text-left border-collapse relative">
            <thead>
              <tr className="sticky top-0 z-20 bg-gray-50 dark:bg-[#1a1a1a] text-[8px] uppercase tracking-[1px] text-gray-400 border-b border-gray-100 dark:border-white/5 shadow-sm">
                <th className="px-4 py-3 font-black">Waktu</th>
                <th className="px-4 py-3 font-black">Identitas Pegawai</th>
                <th className="px-4 py-3 font-black text-center">Aksi</th>
                <th className="px-4 py-3 font-black">Error</th>
                <th className="px-4 py-3 font-black">Pesan</th>
                <th className="px-4 py-3 font-black text-center">Durasi</th>
                <th className="px-4 py-3 font-black text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 relative">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[8px] font-black uppercase tracking-[2px] text-custom-cerah animate-pulse">
                        Memuat Data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : dataLog.length > 0 ? (
                dataLog.map((item) => {
                  const w = formatWaktu(item.waktu);
                  const p = item.pegawai || {};
                  return (
                    <tr
                      key={item.id_log}
                      className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-all group"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <p className="text-[10px] font-black dark:text-white">
                          {w.jam}
                        </p>
                        <p className="text-[8px] font-bold text-gray-400">
                          {w.tgl}
                        </p>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-custom-merah-terang text-white flex items-center justify-center font-black text-[9px] uppercase shrink-0">
                            {getInitial(p.nama_lengkap)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black dark:text-white tracking-tighter">
                              {toTitleCase(
                                p.nama_panggilan || p.nama_lengkap || "-",
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400 mt-0.5">
                              <span className="font-mono tracking-tighter">
                                {p.nip || "-"}
                              </span>
                              <MdCircle size={3} className="text-gray-300" />
                              <span className="text-custom-cerah uppercase tracking-tight truncate max-w-[80px]">
                                {p.departemen || "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase bg-gray-50 dark:bg-white/5 dark:text-gray-200 whitespace-nowrap">
                          {aksiLabel(item.aksi)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[7px] font-black px-1.5 py-0.5 rounded-md border ${statusStyle(item.http_status)}`}
                          >
                            {item.http_status}
                          </span>
                          <span className="text-[8px] font-black dark:text-gray-200 uppercase tracking-tight whitespace-nowrap">
                            {item.error_code}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 max-w-[280px]">
                        <p
                          className="text-[9px] font-medium text-gray-600 dark:text-gray-300 line-clamp-2"
                          title={item.message}
                        >
                          {item.message}
                        </p>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`text-[9px] font-black ${
                            item.durasi_ms > 5000
                              ? "text-red-500"
                              : "dark:text-white"
                          }`}
                        >
                          {item.durasi_ms != null
                            ? `${(item.durasi_ms / 1000).toFixed(1)}s`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => openDetail(item)}
                          className="relative p-1.5 text-custom-cerah hover:bg-custom-cerah/10 rounded-lg transition-all"
                          title="Lihat Detail"
                        >
                          <MdVisibility size={16} />
                          {item.ada_detail_teknis && (
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-10 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {errorMsg || "Tidak ada kegagalan absensi tercatat"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/5">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            {meta.total || 0} log · Hal {meta.page || page} /{" "}
            {Math.max(meta.total_page || 1, 1)}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 dark:text-white disabled:opacity-30 hover:bg-custom-cerah/10 transition-all"
            >
              <MdChevronLeft size={16} />
            </button>
            <button
              disabled={page >= (meta.total_page || 1) || loading}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 dark:text-white disabled:opacity-30 hover:bg-custom-cerah/10 transition-all"
            >
              <MdChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {detail &&
        createPortal(
          <div
            onClick={() => setDetail(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-custom-gelap w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col my-auto"
            >
              {/* Header */}
              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-custom-merah-terang text-white flex items-center justify-center text-xl font-black shadow-lg shadow-red-500/20">
                    {getInitial(detail.pegawai?.nama_lengkap)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-custom-gelap dark:text-white uppercase leading-tight">
                      {toTitleCase(
                        detail.pegawai?.nama_panggilan ||
                          detail.pegawai?.nama_lengkap ||
                          "-",
                      )}
                    </h3>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">
                      {detail.pegawai?.nip} • {detail.pegawai?.departemen} • Log
                      #{detail.id_log}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-400 hover:text-custom-merah-terang transition-all"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 pt-4 space-y-4">
                <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-[25px] border border-gray-100 dark:border-white/10">
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MdErrorOutline
                      size={14}
                      className="text-custom-merah-terang"
                    />
                    {detail.error_code}
                    <span
                      className={`text-[7px] font-black px-1.5 py-0.5 rounded-md border ${statusStyle(detail.http_status)}`}
                    >
                      {detail.http_status}
                    </span>
                  </h4>
                  <p className="text-[13px] text-custom-gelap dark:text-gray-200 italic leading-relaxed font-medium">
                    "{detail.message}"
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 mt-3">
                    {statusHint(detail.http_status)}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Waktu (WITA)",
                      value: `${formatWaktu(detail.waktu || detail.created_at).tgl} ${formatWaktu(detail.waktu || detail.created_at).jam}`,
                    },
                    { label: "Aksi", value: aksiLabel(detail.aksi) },
                    {
                      label: "Durasi",
                      value:
                        detail.durasi_ms != null
                          ? `${detail.durasi_ms} ms`
                          : "-",
                      icon: <MdTimer className="text-custom-cerah" />,
                    },
                    {
                      label: "ID Absensi / Shift",
                      value: `${detail.id_absensi ?? "-"} / ${detail.id_jam_kerja ?? "-"}`,
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="bg-gray-50/50 dark:bg-white/5 p-3 rounded-2xl"
                    >
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-1 tracking-tighter">
                        {c.label}
                      </p>
                      <p className="text-[10px] font-bold dark:text-white flex items-center gap-1">
                        {c.icon}
                        {c.value}
                      </p>
                    </div>
                  ))}
                </div>

                {detail.latitude != null && detail.longitude != null && (
                  <a
                    href={`https://www.google.com/maps?q=${detail.latitude},${detail.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-50/50 dark:bg-white/5 p-3 rounded-2xl text-[10px] font-bold text-custom-cerah hover:underline"
                  >
                    <MdLocationOn size={16} />
                    {detail.latitude}, {detail.longitude} — buka di Maps
                  </a>
                )}

                {detail.errors && (
                  <div className="bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-2 tracking-tighter flex items-center gap-1">
                      <MdInfoOutline size={12} /> Detail Error
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(detail.errors).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between gap-2 text-[10px]"
                        >
                          <span className="text-gray-400 font-bold">
                            {k.replace(/_/g, " ")}
                          </span>
                          <span className="font-black dark:text-white text-right">
                            {Array.isArray(v) ? v.join(", ") : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loadingDetail ? (
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-custom-cerah">
                    <div className="w-4 h-4 border-2 border-custom-cerah border-t-transparent rounded-full animate-spin"></div>
                    Memuat detail teknis...
                  </div>
                ) : (
                  detail.detail_teknis && (
                    <div>
                      <p className="text-[8px] font-black text-red-500 uppercase mb-2 tracking-widest">
                        Detail Teknis (internal — jangan dibagikan ke pegawai)
                      </p>
                      <pre className="bg-black/90 text-green-300 text-[9px] p-4 rounded-2xl overflow-auto max-h-[240px] custom-scrollbar whitespace-pre-wrap">
                        {detail.detail_teknis}
                      </pre>
                    </div>
                  )
                )}
              </div>

              <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => setDetail(null)}
                  className="w-full py-3.5 bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default LogAbsensi;
