import React, { useEffect, useMemo, useState } from "react";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdBusiness,
  MdBlock,
  MdInfoOutline,
  MdRefresh,
  MdPhone,
  MdEmail,
  MdPerson,
} from "react-icons/md";

import ModalDetailClient from "../../components/modals/master-client/ModalDetailClient";
import ModalTambahClient from "../../components/modals/master-client/ModalTambahClient";
import ModalEditClient from "../../components/modals/master-client/ModalEditClient";

import ModalTambahPICClient from "../../components/modals/master-client/ModalTambahPICClient";
import ModalDetailPICClient from "../../components/modals/master-client/ModalDetailPICClient";
import ModalEditPICClient from "../../components/modals/master-client/ModalEditPICClient";

import Api from "../../utils/Api";
import SwalHelper from "../../utils/Swal";

const Client = () => {
  const [activeTab, setActiveTab] = useState("client");

  // =========================================================
  // CLIENT
  // =========================================================

  const [listClient, setListClient] = useState([]);

  // =========================================================
  // PIC
  // =========================================================

  const [listPIC, setListPIC] = useState([]);

  // =========================================================
  // GENERAL
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // CLIENT MODAL
  // =========================================================

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showTambahModal, setShowTambahModal] = useState(false);

  const [selectedEditClientId, setSelectedEditClientId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // =========================================================
  // PIC MODAL
  // =========================================================

  const [showTambahPICModal, setShowTambahPICModal] = useState(false);

  const [selectedPICId, setSelectedPICId] = useState(null);
  const [showDetailPICModal, setShowDetailPICModal] = useState(false);

  const [selectedEditPICId, setSelectedEditPICId] = useState(null);
  const [showEditPICModal, setShowEditPICModal] = useState(false);

  // =========================================================
  // GET CLIENT
  // =========================================================

  const fetchClients = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await Api.get("/work-item/master/clients");

      if (response.data?.success) {
        setListClient(response.data.data || []);
      } else {
        setListClient([]);

        setErrorMessage(
          response.data?.message || "Gagal mengambil data client.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data client:", error);

      setListClient([]);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat mengambil data client.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // GET PIC
  // =========================================================

  const fetchPIC = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await Api.get("/work-item/master/client-pics");

      if (response.data?.success) {
        setListPIC(response.data.data || []);
      } else {
        setListPIC([]);

        setErrorMessage(
          response.data?.message || "Gagal mengambil data Client PIC.",
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data Client PIC:", error);

      setListPIC([]);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat mengambil data Client PIC.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchClients();
  }, []);

  // =========================================================
  // SEARCH CLIENT
  // =========================================================

  const filteredClient = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return listClient;
    }

    return listClient.filter(
      (client) =>
        client.code?.toLowerCase().includes(keyword) ||
        client.name?.toLowerCase().includes(keyword) ||
        client.email?.toLowerCase().includes(keyword) ||
        client.phone?.toLowerCase().includes(keyword) ||
        client.address?.toLowerCase().includes(keyword),
    );
  }, [listClient, searchTerm]);

  // =========================================================
  // SEARCH PIC
  // =========================================================

  const filteredPIC = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return listPIC;
    }

    return listPIC.filter(
      (pic) =>
        pic.name?.toLowerCase().includes(keyword) ||
        pic.position?.toLowerCase().includes(keyword) ||
        pic.phone?.toLowerCase().includes(keyword) ||
        pic.email?.toLowerCase().includes(keyword) ||
        pic.client_name?.toLowerCase().includes(keyword) ||
        pic.client?.name?.toLowerCase().includes(keyword),
    );
  }, [listPIC, searchTerm]);

  // =========================================================
  // TAB
  // =========================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setErrorMessage("");

    if (tab === "pic") {
      fetchPIC();
    } else {
      fetchClients();
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    if (activeTab === "client") {
      fetchClients();
    } else {
      fetchPIC();
    }
  };

  // =========================================================
  // DETAIL CLIENT
  // =========================================================

  const handleOpenDetail = (client) => {
    setSelectedClientId(client.id_client);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedClientId(null);
  };

  // =========================================================
  // DETAIL PIC
  // =========================================================

  const handleOpenDetailPIC = (pic) => {
    setSelectedPICId(pic.id_pic || pic.id_client_pic);
    setShowDetailPICModal(true);
  };

  const handleCloseDetailPIC = () => {
    setShowDetailPICModal(false);
    setSelectedPICId(null);
  };

  // =========================================================
  // EDIT CLIENT
  // =========================================================

  const handleOpenEdit = (client) => {
    setSelectedEditClientId(client.id_client);
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setSelectedEditClientId(null);
  };

  // =========================================================
  // EDIT PIC
  // =========================================================

  const handleOpenEditPIC = (pic) => {
    setSelectedEditPICId(pic.id_pic || pic.id_client_pic);
    setShowEditPICModal(true);
  };

  const handleCloseEditPIC = () => {
    setShowEditPICModal(false);
    setSelectedEditPICId(null);
  };

  // =========================================================
  // DELETE CLIENT
  // =========================================================

  const handleDeleteClient = async (client) => {
    const result = await SwalHelper.confirm({
      title: "Hapus Client?",
      message: `Client "${client.name}" akan dinonaktifkan dari sistem.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await Api.delete(`/work-item/master/clients/${client.id_client}`);

      await SwalHelper.success("Client berhasil dihapus.");

      fetchClients();
    } catch (error) {
      console.error("Gagal menghapus client:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat menghapus client.";

      await SwalHelper.error(message);
    }
  };

  // =========================================================
  // DELETE PIC
  // =========================================================

  const handleDeletePIC = async (pic) => {
    const picName = pic.name || "PIC";

    const result = await SwalHelper.confirm({
      title: "Hapus PIC?",
      message: `PIC "${picName}" akan dinonaktifkan dari sistem.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    });

    if (!result.isConfirmed) return;

    const picId = pic.id_pic || pic.id_client_pic;

    if (!picId) {
      await SwalHelper.error("ID PIC tidak ditemukan.");
      return;
    }

    try {
      await Api.delete(`/work-item/master/client-pics/${picId}`);

      await SwalHelper.success("PIC berhasil dihapus.");

      fetchPIC();
    } catch (error) {
      console.error("Gagal menghapus PIC:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.status ||
        "Terjadi kesalahan saat menghapus PIC.";

      await SwalHelper.error(message);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
              Master Client
            </h1>

            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
              Client & Person In Charge
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* SEARCH */}

            <div className="relative w-full sm:w-72">
              <MdSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                placeholder={
                  activeTab === "client" ? "Cari client..." : "Cari PIC..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang/50 shadow-sm"
              />
            </div>

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-3 bg-white dark:bg-custom-gelap text-custom-cerah rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
              title="Refresh"
            >
              <MdRefresh
                size={20}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>

            {/* ADD */}

            <button
              onClick={() => {
                if (activeTab === "client") {
                  setShowTambahModal(true);
                } else {
                  setShowTambahPICModal(true);
                }
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all whitespace-nowrap"
            >
              <MdAdd size={20} />

              {activeTab === "client" ? "Tambah Client" : "Tambah PIC"}
            </button>
          </div>
        </div>

        {/* =====================================================
            TAB
        ====================================================== */}

        <div className="bg-white dark:bg-custom-gelap p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex w-fit">
          <button
            onClick={() => handleTabChange("client")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "client"
                ? "bg-custom-merah-terang text-white shadow-md"
                : "text-gray-400 hover:text-custom-gelap dark:hover:text-white"
            }`}
          >
            Client
          </button>

          <button
            onClick={() => handleTabChange("pic")}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "pic"
                ? "bg-custom-merah-terang text-white shadow-md"
                : "text-gray-400 hover:text-custom-gelap dark:hover:text-white"
            }`}
          >
            Client PIC
          </button>
        </div>

        {/* =====================================================
            CLIENT TAB
        ====================================================== */}

        {activeTab === "client" && (
          <>
            {/* ERROR */}

            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MdBlock className="text-red-500" size={20} />

                  <div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Gagal mengambil data client
                    </p>

                    <p className="text-[10px] text-red-500/80 mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* TABLE CLIENT */}

            <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="p-6 w-32">Kode</th>
                      <th className="p-6">Client</th>
                      <th className="p-6">Kontak</th>
                      <th className="p-6">Alamat</th>
                      <th className="p-6 text-center w-32">Opsi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[11px]">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-custom-merah-terang/20 border-t-custom-merah-terang rounded-full animate-spin" />

                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">
                              Memuat Data...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredClient.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 rounded-2xl flex items-center justify-center mb-3">
                              <MdBusiness size={28} />
                            </div>

                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                              Client Tidak Ditemukan
                            </p>

                            <p className="text-[10px] text-gray-400 mt-1">
                              {searchTerm
                                ? "Tidak ada data yang sesuai dengan pencarian."
                                : "Belum terdapat data client."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredClient.map((client) => (
                        <tr
                          key={client.id_client}
                          onClick={() => handleOpenDetail(client)}
                          className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <td className="p-5">
                            <span className="inline-flex px-3 py-1.5 rounded-lg bg-custom-merah-terang/10 text-custom-merah-terang text-[9px] font-black tracking-wider">
                              {client.code}
                            </span>
                          </td>

                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-custom-gelap dark:bg-[#3d2e39] text-custom-cerah rounded-xl flex items-center justify-center flex-shrink-0">
                                <MdBusiness size={19} />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-bold text-custom-gelap dark:text-white uppercase tracking-tight">
                                  {client.name}
                                </p>

                                <p className="text-[9px] text-gray-400 font-medium mt-1">
                                  Klik untuk melihat detail client
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-5">
                            <div className="space-y-1.5">
                              {client.phone && (
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                  <MdPhone size={13} />

                                  <span className="text-[10px]">
                                    {client.phone}
                                  </span>
                                </div>
                              )}

                              {client.email && (
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                  <MdEmail size={13} />

                                  <span className="text-[10px] truncate max-w-[220px]">
                                    {client.email}
                                  </span>
                                </div>
                              )}

                              {!client.phone && !client.email && (
                                <span className="text-[10px] text-gray-400 italic">
                                  Tidak ada kontak
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-5">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                              {client.address || "-"}
                            </span>
                          </td>

                          <td className="p-5 text-center">
                            <div
                              className="flex justify-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleOpenEdit(client)}
                                className="p-2.5 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Edit Client"
                              >
                                <MdEdit size={16} />
                              </button>

                              <button
                                onClick={() => handleDeleteClient(client)}
                                className="p-2.5 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Hapus Client"
                              >
                                <MdDeleteOutline size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INFORMATION */}

            <div className="p-3 bg-white dark:bg-custom-gelap rounded-[35px] border border-gray-100 dark:border-white/5 flex items-center gap-4 shadow-sm">
              <div className="w-8 h-8 bg-custom-merah-terang/10 text-custom-merah-terang rounded-2xl flex items-center justify-center flex-shrink-0">
                <MdInfoOutline size={24} />
              </div>

              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed tracking-widest">
                Data client digunakan bersama oleh{" "}
                <span className="text-custom-merah-terang font-black">
                  Admin Contract
                </span>{" "}
                dan{" "}
                <span className="text-custom-merah-terang font-black">
                  Admin Invoice
                </span>{" "}
                dalam pengelolaan pekerjaan dan invoice.
              </p>
            </div>
          </>
        )}

        {/* =====================================================
            CLIENT PIC TAB
        ====================================================== */}

        {activeTab === "pic" && (
          <>
            {/* ERROR */}

            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MdBlock className="text-red-500" size={20} />

                  <div>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                      Gagal mengambil data Client PIC
                    </p>

                    <p className="text-[10px] text-red-500/80 mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* TABLE PIC */}

            <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="p-6">PIC</th>
                      <th className="p-6">Client</th>
                      <th className="p-6">Jabatan</th>
                      <th className="p-6">Kontak</th>
                      <th className="p-6 text-center w-32">Opsi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[11px]">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-custom-merah-terang/20 border-t-custom-merah-terang rounded-full animate-spin" />

                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">
                              Memuat Data...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredPIC.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 rounded-2xl flex items-center justify-center mb-3">
                              <MdPerson size={28} />
                            </div>

                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                              Client PIC Tidak Ditemukan
                            </p>

                            <p className="text-[10px] text-gray-400 mt-1">
                              {searchTerm
                                ? "Tidak ada data yang sesuai dengan pencarian."
                                : "Belum terdapat data Client PIC."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPIC.map((pic) => {
                        const clientName =
                          pic.client_name ||
                          pic.client?.name ||
                          pic.client?.client_name ||
                          "-";

                        const picId = pic.id_pic || pic.id_client_pic;

                        return (
                          <tr
                            key={picId}
                            onClick={() => handleOpenDetailPIC(pic)}
                            className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            {/* PIC */}

                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-custom-gelap dark:bg-[#3d2e39] text-custom-cerah rounded-xl flex items-center justify-center flex-shrink-0">
                                  <MdPerson size={19} />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-custom-gelap dark:text-white uppercase tracking-tight">
                                    {pic.name}
                                  </p>

                                  <p className="text-[9px] text-gray-400 font-medium mt-1">
                                    Person In Charge
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CLIENT */}

                            <td className="p-5">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-custom-merah-terang/10 text-custom-merah-terang rounded-lg flex items-center justify-center">
                                  <MdBusiness size={16} />
                                </div>

                                <span className="text-[11px] font-bold text-custom-gelap dark:text-white">
                                  {clientName}
                                </span>
                              </div>
                            </td>

                            {/* POSITION */}

                            <td className="p-5">
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {pic.position || "-"}
                              </span>
                            </td>

                            {/* CONTACT */}

                            <td className="p-5">
                              <div className="space-y-1.5">
                                {pic.phone && (
                                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <MdPhone size={13} />

                                    <span className="text-[10px]">
                                      {pic.phone}
                                    </span>
                                  </div>
                                )}

                                {pic.email && (
                                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <MdEmail size={13} />

                                    <span className="text-[10px] truncate max-w-[220px]">
                                      {pic.email}
                                    </span>
                                  </div>
                                )}

                                {!pic.phone && !pic.email && (
                                  <span className="text-[10px] text-gray-400 italic">
                                    Tidak ada kontak
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* OPTIONS */}

                            <td className="p-5 text-center">
                              <div
                                className="flex justify-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* EDIT */}

                                <button
                                  onClick={() => handleOpenEditPIC(pic)}
                                  className="p-2.5 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  title="Edit PIC"
                                >
                                  <MdEdit size={16} />
                                </button>

                                {/* DELETE */}

                                <button
                                  onClick={() => handleDeletePIC(pic)}
                                  className="p-2.5 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                  title="Hapus PIC"
                                >
                                  <MdDeleteOutline size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          DETAIL CLIENT
      ====================================================== */}

      <ModalDetailClient
        clientId={selectedClientId}
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
      />

      {/* =====================================================
          DETAIL PIC
      ====================================================== */}

      <ModalDetailPICClient
        picId={selectedPICId}
        isOpen={showDetailPICModal}
        onClose={handleCloseDetailPIC}
      />

      {/* =====================================================
          TAMBAH CLIENT
      ====================================================== */}

      <ModalTambahClient
        isOpen={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        onSuccess={fetchClients}
      />

      {/* =====================================================
          TAMBAH PIC
      ====================================================== */}

      <ModalTambahPICClient
        isOpen={showTambahPICModal}
        onClose={() => setShowTambahPICModal(false)}
        onSuccess={fetchPIC}
      />

      {/* =====================================================
          EDIT CLIENT
      ====================================================== */}

      <ModalEditClient
        clientId={selectedEditClientId}
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        onSuccess={fetchClients}
      />

      {/* =====================================================
          EDIT PIC
      ====================================================== */}

      <ModalEditPICClient
        picId={selectedEditPICId}
        isOpen={showEditPICModal}
        onClose={handleCloseEditPIC}
        onSuccess={fetchPIC}
      />
    </>
  );
};

export default Client;
