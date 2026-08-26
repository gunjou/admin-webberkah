import React, { useMemo, useState } from "react";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdBusiness,
  MdClose,
  MdCheckCircle,
  MdBlock,
  MdInfoOutline,
  MdRefresh,
  MdPhone,
  MdEmail,
  MdLocationOn,
} from "react-icons/md";

const Client = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    telepon: "",
    email: "",
    npwp: "",
    status: 1,
  });

  // =========================================================
  // DUMMY DATA
  // =========================================================
  const [listClient, setListClient] = useState([
    {
      id_client: 1,
      nama_client: "PT. Energi Nusantara",
      alamat: "Jl. Sudirman No. 21, Mataram",
      telepon: "081234567890",
      email: "procurement@energinu.com",
      npwp: "01.234.567.8-901.000",
      jumlah_pekerjaan: 6,
      status: 1,
    },
    {
      id_client: 2,
      nama_client: "PT. Lombok Engineering",
      alamat: "Jl. Pejanggik No. 88, Mataram",
      telepon: "081298765432",
      email: "project@lombokeng.co.id",
      npwp: "02.345.678.9-012.000",
      jumlah_pekerjaan: 4,
      status: 1,
    },
    {
      id_client: 3,
      nama_client: "CV. Sinar Teknik",
      alamat: "Jl. Bung Karno No. 15, Mataram",
      telepon: "082112223333",
      email: "admin@sinarteknik.co.id",
      npwp: "03.456.789.0-123.000",
      jumlah_pekerjaan: 2,
      status: 1,
    },
    {
      id_client: 4,
      nama_client: "PT. Mitra Infrastruktur",
      alamat: "Jl. Langko No. 42, Mataram",
      telepon: "081377788899",
      email: "info@mitrainfra.co.id",
      npwp: "04.567.890.1-234.000",
      jumlah_pekerjaan: 0,
      status: 0,
    },
    {
      id_client: 5,
      nama_client: "PT. Berkah Power System",
      alamat: "Jl. Airlangga No. 10, Mataram",
      telepon: "085933445566",
      email: "engineering@bps.co.id",
      npwp: "05.678.901.2-345.000",
      jumlah_pekerjaan: 8,
      status: 1,
    },
  ]);

  // =========================================================
  // FILTER
  // =========================================================
  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return listClient.filter(
      (client) =>
        client.nama_client.toLowerCase().includes(keyword) ||
        client.email.toLowerCase().includes(keyword) ||
        client.telepon.toLowerCase().includes(keyword),
    );
  }, [listClient, searchTerm]);

  // =========================================================
  // MODAL
  // =========================================================
  const handleOpenModal = (client = null) => {
    if (client) {
      setSelectedClient(client);

      setFormData({
        nama: client.nama_client,
        alamat: client.alamat,
        telepon: client.telepon,
        email: client.email,
        npwp: client.npwp,
        status: client.status,
      });
    } else {
      setSelectedClient(null);

      setFormData({
        nama: "",
        alamat: "",
        telepon: "",
        email: "",
        npwp: "",
        status: 1,
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (isLoading) return;

    setShowModal(false);
    setSelectedClient(null);
  };

  // =========================================================
  // DUMMY SAVE
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    // Simulasi proses request API
    setTimeout(() => {
      if (selectedClient) {
        setListClient((prev) =>
          prev.map((item) =>
            item.id_client === selectedClient.id_client
              ? {
                  ...item,
                  nama_client: formData.nama,
                  alamat: formData.alamat,
                  telepon: formData.telepon,
                  email: formData.email,
                  npwp: formData.npwp,
                  status: formData.status,
                }
              : item,
          ),
        );
      } else {
        setListClient((prev) => [
          ...prev,
          {
            id_client: Date.now(),
            nama_client: formData.nama,
            alamat: formData.alamat,
            telepon: formData.telepon,
            email: formData.email,
            npwp: formData.npwp,
            jumlah_pekerjaan: 0,
            status: formData.status,
          },
        ]);
      }

      setIsLoading(false);
      setShowModal(false);
      setSelectedClient(null);
    }, 500);
  };

  // =========================================================
  // DUMMY DELETE
  // =========================================================
  const handleDelete = (client) => {
    const confirmed = window.confirm(`Hapus client "${client.nama_client}"?`);

    if (!confirmed) return;

    setListClient((prev) =>
      prev.filter((item) => item.id_client !== client.id_client),
    );
  };

  // =========================================================
  // DUMMY REFRESH
  // =========================================================
  const handleRefresh = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Master Client
          </h1>

          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Data Client & Perusahaan
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-3 bg-white dark:bg-custom-gelap text-custom-cerah rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
          >
            <MdAdd size={20} />
            Tambah Client
          </button>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}
      <div className="bg-white dark:bg-custom-gelap p-3 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center">
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Cari nama client, email, atau telepon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang/50"
          />
        </div>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="p-6 w-20">ID</th>

                <th className="p-6">Client</th>

                <th className="p-6">Kontak</th>

                <th className="p-6 text-center">Pekerjaan</th>

                <th className="p-6 text-center">Status</th>

                <th className="p-6 text-center">Opsi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-[11px]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest"
                  >
                    Memuat Data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 rounded-2xl flex items-center justify-center mb-3">
                        <MdBusiness size={28} />
                      </div>

                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Client Tidak Ditemukan
                      </p>

                      <p className="text-[10px] text-gray-400 mt-1">
                        Tidak ada data yang sesuai dengan pencarian.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((client) => (
                  <tr
                    key={client.id_client}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* ID */}
                    <td className="p-5 font-black text-custom-merah-terang italic">
                      #{client.id_client}
                    </td>

                    {/* CLIENT */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-custom-gelap dark:bg-[#3d2e39] text-custom-cerah rounded-xl flex items-center justify-center flex-shrink-0">
                          <MdBusiness size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-custom-gelap dark:text-white uppercase tracking-tight">
                            {client.nama_client}
                          </p>

                          <p className="text-[9px] text-gray-400 font-medium mt-1 truncate max-w-[280px]">
                            {client.alamat}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* KONTAK */}
                    <td className="p-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <MdPhone size={13} />
                          <span className="text-[10px]">{client.telepon}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <MdEmail size={13} />
                          <span className="text-[10px] truncate max-w-[200px]">
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* PEKERJAAN */}
                    <td className="p-5 text-center">
                      <span className="inline-flex items-center justify-center min-w-10 px-3 py-1.5 rounded-full bg-custom-merah-terang/10 text-custom-merah-terang text-[9px] font-black">
                        {client.jumlah_pekerjaan}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="p-5 text-center">
                      {client.status === 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-100 dark:border-green-500/20">
                          <MdCheckCircle size={14} />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-100 dark:border-red-500/20">
                          <MdBlock size={14} />
                          Non-Aktif
                        </span>
                      )}
                    </td>

                    {/* OPSI */}
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(client)}
                          className="p-2.5 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Edit Client"
                        >
                          <MdEdit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(client)}
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

      {/* =====================================================
          INFORMATION
      ====================================================== */}
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

      {/* =====================================================
          MODAL
      ====================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20 p-8"
          >
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-custom-gelap dark:text-white tracking-tight">
                  {selectedClient ? "Edit Client" : "Tambah Client"}
                </h2>

                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">
                  Informasi Client
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <MdClose size={24} className="text-gray-400" />
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-5">
              {/* Nama */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  Nama Client
                </label>

                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nama: e.target.value,
                    })
                  }
                  placeholder="Contoh: PT. Berkah Engineering"
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  Alamat
                </label>

                <textarea
                  rows="3"
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alamat: e.target.value,
                    })
                  }
                  placeholder="Alamat lengkap client..."
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang resize-none"
                />
              </div>

              {/* Telepon + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Nomor Telepon
                  </label>

                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        telepon: e.target.value,
                      })
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    Email
                  </label>

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="email@client.co.id"
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  />
                </div>
              </div>

              {/* NPWP */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                  NPWP
                </label>

                <input
                  type="text"
                  value={formData.npwp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      npwp: e.target.value,
                    })
                  }
                  placeholder="XX.XXX.XXX.X-XXX.XXX"
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                />
              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <div>
                  <p className="text-xs font-bold text-custom-gelap dark:text-white">
                    Client Aktif
                  </p>

                  <p className="text-[9px] text-gray-400 uppercase font-black mt-1">
                    Client dapat digunakan untuk transaksi
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={formData.status === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-6 h-6 accent-custom-merah-terang cursor-pointer"
                />
              </div>

              {/* SUBMIT */}
              <button
                disabled={isLoading}
                className="w-full py-4 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 mt-2 disabled:opacity-50 transition-all"
              >
                {isLoading
                  ? "Memproses..."
                  : selectedClient
                    ? "Simpan Perubahan"
                    : "Simpan Client"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Client;
