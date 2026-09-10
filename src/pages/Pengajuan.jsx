import React, { useCallback, useEffect, useState } from "react";
import Api from "../utils/Api";
import Swal from "sweetalert2";
import { MdAdd, MdDownload, MdHistory, MdListAlt } from "react-icons/md";
import PengajuanFilter from "../components/pengajuan/PengajuanFilter";
import PengajuanTable from "../components/pengajuan/PengajuanTable";
import ModalDetailPengajuan from "../components/pengajuan/ModalDetailPengajuan";
import ModalAttachment from "../components/pengajuan/ModalAttachment";
import ModalEditPengajuan from "../components/pengajuan/ModalEditPengajuan";
import SwalHelper from "../utils/Swal";
import ModalCreatePengajuan from "../components/pengajuan/ModalCreatePengajuan";
import { exportPengajuanPDF } from "./export/exportPengajuan";

const Pengajuan = () => {
  const [viewMode, setViewMode] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [dataPengajuan, setDataPengajuan] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  });
  const [departemen, setDepartemen] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageInfo, setHistoryPageInfo] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 1,
  });

  const [filter, setFilter] = useState({
    status: "ACTIVE",
    id_departemen: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  const fetchDepartemen = useCallback(async () => {
    try {
      const res = await Api.get("/master/departemen");
      if (res.data.success) setDepartemen(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil departemen:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.response?.data?.message || "Gagal mengambil data departemen.",
      });
    }
  }, []);

  useEffect(() => {
    fetchDepartemen();
  }, [fetchDepartemen]);

  const fetchActiveData = useCallback(async () => {
    if (viewMode !== "ACTIVE") return;

    setLoading(true);

    try {
      const params = { status: filter.status };

      if (filter.id_departemen) params.id_departemen = filter.id_departemen;
      if (filter.tanggal_mulai) params.tanggal_mulai = filter.tanggal_mulai;
      if (filter.tanggal_selesai)
        params.tanggal_selesai = filter.tanggal_selesai;

      const res = await Api.get("/purchase-requests", { params });

      if (res.data.success) setDataPengajuan(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil pengajuan:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat mengambil data pengajuan.",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, viewMode]);

  const fetchHistoryData = useCallback(async () => {
    if (viewMode !== "HISTORY") return;

    setLoading(true);

    try {
      const params = {
        status: filter.status,
        page: historyPage,
        per_page: 10,
      };

      if (filter.id_departemen) params.id_departemen = filter.id_departemen;
      if (filter.tanggal_mulai) params.tanggal_mulai = filter.tanggal_mulai;
      if (filter.tanggal_selesai)
        params.tanggal_selesai = filter.tanggal_selesai;

      const res = await Api.get("/purchase-requests/history", { params });

      if (res.data.success) {
        setDataPengajuan(res.data.data?.data || []);
        setHistoryPageInfo(
          res.data.data?.page_info || {
            page: 1,
            per_page: 10,
            total: 0,
            total_pages: 1,
          },
        );
      }
    } catch (err) {
      console.error("Gagal mengambil history:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat History",
        text:
          err.response?.data?.message ||
          "Terjadi kesalahan saat mengambil history pengajuan.",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, historyPage, viewMode]);

  useEffect(() => {
    fetchActiveData();
  }, [fetchActiveData]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const refreshPengajuan = useCallback(async () => {
    if (viewMode === "ACTIVE") {
      await fetchActiveData();
    } else {
      await fetchHistoryData();
    }
  }, [viewMode, fetchActiveData, fetchHistoryData]);

  const fetchDetail = async (id) => {
    try {
      setDetailLoading(true);
      const response = await Api.get(`/purchase-requests/${id}`);
      setDetailData(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error("Gagal mengambil detail pengajuan:", error);
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const displayedData = [...dataPengajuan].sort((a, b) => {
    if (sortConfig.key === "priority") {
      const priorityOrder = { NORMAL: 1, URGENT: 2, TOP_URGENT: 3 };
      const result =
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);

      return sortConfig.direction === "desc" ? result : -result;
    }

    if (sortConfig.key === "date") {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });

  const handleDetail = async (id) => {
    const detail = await fetchDetail(id);
    if (detail) setShowDetail(true);
  };

  const handleEdit = async (id) => {
    const detail = await fetchDetail(id);
    if (detail) setShowEdit(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await SwalHelper.confirm({
      title: "Hapus Pengajuan?",
      message: "Pengajuan yang dihapus tidak dapat ditampilkan kembali.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    });

    if (!confirmed) return;

    try {
      await Api.delete(`/purchase-requests/${id}`);
      await SwalHelper.success("Pengajuan berhasil dihapus.");
      await refreshPengajuan();
    } catch (error) {
      console.error("Gagal menghapus pengajuan:", error);
      await SwalHelper.error(
        error?.response?.data?.message || "Gagal menghapus pengajuan.",
      );
    }
  };

  const handleExportPDF = async () => {
    if (!displayedData.length) {
      SwalHelper.warning("Tidak ada data pengajuan yang dapat diexport.");
      return;
    }

    const selectedDepartemen = departemen.find(
      (item) => String(item.id_departemen) === String(filter.id_departemen),
    );

    try {
      setExportLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 50));

      exportPengajuanPDF(displayedData, {
        status: filter.status,
        departemen: selectedDepartemen?.nama_departemen || "",
        tanggal_mulai: filter.tanggal_mulai,
        tanggal_selesai: filter.tanggal_selesai,
        viewMode,
      });
    } catch (error) {
      console.error("Gagal export PDF:", error);

      await SwalHelper.error(error?.message || "Gagal melakukan export PDF.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleResetFilter = () => {
    setHistoryPage(1);
    setFilter(
      viewMode === "ACTIVE"
        ? {
            status: "ACTIVE",
            id_departemen: "",
            tanggal_mulai: "",
            tanggal_selesai: "",
          }
        : {
            status: "PAID",
            id_departemen: "",
            tanggal_mulai: "",
            tanggal_selesai: "",
          },
    );
  };

  const handleViewMode = () => {
    const nextMode = viewMode === "ACTIVE" ? "HISTORY" : "ACTIVE";

    setViewMode(nextMode);
    setHistoryPage(1);
    setDataPengajuan([]);

    setFilter(
      nextMode === "ACTIVE"
        ? {
            status: "ACTIVE",
            id_departemen: "",
            tanggal_mulai: "",
            tanggal_selesai: "",
          }
        : {
            status: "PAID",
            id_departemen: "",
            tanggal_mulai: "",
            tanggal_selesai: "",
          },
    );
  };

  return (
    <>
      <div className="space-y-5 pb-10 font-poppins">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
          <div>
            <h1 className="text-xl font-black text-custom-gelap dark:text-white uppercase tracking-tighter">
              {viewMode === "ACTIVE" ? "Pengajuan" : "History Pengajuan"}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
              {viewMode === "ACTIVE"
                ? "Purchase Request Management"
                : "Purchase Request History"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={exportLoading || loading || !displayedData.length}
              className="flex items-center gap-2 px-5 py-2.5 bg-custom-merah-terang text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {exportLoading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <MdDownload size={16} />
                  Export PDF
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-custom-merah-terang text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <MdAdd size={16} />
              Pengajuan Baru
            </button>

            <button
              type="button"
              onClick={handleViewMode}
              className="flex items-center gap-2 px-5 py-2.5 bg-custom-gelap dark:bg-custom-cerah text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {viewMode === "ACTIVE" ? (
                <>
                  <MdHistory size={16} /> History
                </>
              ) : (
                <>
                  <MdListAlt size={16} /> Pengajuan Aktif
                </>
              )}
            </button>
          </div>
        </div>

        <PengajuanFilter
          filter={filter}
          setFilter={setFilter}
          departemen={departemen}
          onReset={handleResetFilter}
          viewMode={viewMode}
        />

        <PengajuanTable
          data={displayedData}
          loading={loading}
          sortConfig={sortConfig}
          onSort={(key) =>
            setSortConfig((current) => ({
              key,
              direction:
                current.key === key && current.direction === "desc"
                  ? "asc"
                  : "desc",
            }))
          }
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          viewMode={viewMode}
        />

        {viewMode === "HISTORY" && historyPageInfo.total_pages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase">
              Halaman {historyPageInfo.page} dari {historyPageInfo.total_pages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={historyPage <= 1}
                onClick={() => setHistoryPage((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-gray-100 dark:bg-white/5 text-custom-gelap dark:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={historyPage >= historyPageInfo.total_pages}
                onClick={() => setHistoryPage((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-custom-gelap dark:bg-custom-cerah text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetail && (
        <ModalDetailPengajuan
          data={detailData}
          loading={detailLoading}
          onClose={() => {
            setShowDetail(false);
            setDetailData(null);
          }}
          onAttachment={setAttachment}
          onRefresh={() => fetchDetail(detailData?.id_request)}
          onRefreshList={refreshPengajuan}
        />
      )}

      {showCreate && (
        <ModalCreatePengajuan
          onClose={() => setShowCreate(false)}
          onSuccess={refreshPengajuan}
        />
      )}

      {showEdit && (
        <ModalEditPengajuan
          data={detailData}
          departemen={departemen}
          onClose={() => {
            setShowEdit(false);
            setDetailData(null);
          }}
          onRefresh={() => fetchDetail(detailData?.id_request)}
          onRefreshList={refreshPengajuan}
        />
      )}

      {attachment && (
        <ModalAttachment
          attachment={attachment}
          onClose={() => setAttachment(null)}
        />
      )}
    </>
  );
};

export default Pengajuan;
