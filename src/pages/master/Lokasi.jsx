import React, { useState, useEffect } from "react";
import Api from "../../utils/Api";
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdLocationOn,
  MdClose,
  MdCheckCircle,
  MdRefresh,
} from "react-icons/md";

const Lokasi = () => {
  const [showModal, setShowModal] = useState(false);
  const [listLokasi, setListLokasi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    nama: "",
    lat: "",
    lng: "",
    radius: "",
  });

  // 1. Fetch Data dari API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await Api.get("/master/lokasi-absensi");
      if (response.data.success) {
        setListLokasi(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat lokasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({
        id: data.id_lokasi,
        nama: data.nama_lokasi,
        lat: data.latitude,
        lng: data.longitude,
        radius: data.radius_meter,
      });
    } else {
      setFormData({ id: null, nama: "", lat: "", lng: "", radius: "" });
    }
    setShowModal(true);
  };

  // 2. Simpan Data (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      nama_lokasi: formData.nama,
      latitude: parseFloat(formData.lat),
      longitude: parseFloat(formData.lng),
      radius_meter: parseInt(formData.radius),
    };

    try {
      if (formData.id) {
        await Api.put(`/master/lokasi-absensi/${formData.id}`, payload);
      } else {
        await Api.post("/master/lokasi-absensi", payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Hapus Data
  const handleDelete = async (id, nama) => {
    if (window.confirm(`Hapus lokasi "${nama}"?`)) {
      setIsLoading(true);
      try {
        await Api.delete(`/master/lokasi-absensi/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || "Gagal menghapus data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter Search
  const filteredData = listLokasi.filter((item) =>
    item.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight text-poppins">
            Lokasi Absensi
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[3px] mt-1">
            Pengaturan Geofencing & Koordinat Kantor
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-3 bg-white dark:bg-custom-gelap text-custom-cerah rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm transition-all"
          >
            <MdRefresh size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all"
          >
            <MdAdd size={20} /> Tambah Lokasi
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-custom-gelap p-4 rounded-[30px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center">
        <div className="relative flex-1 max-w-md">
          <MdSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari lokasi kantor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-xs outline-none dark:text-white focus:border-custom-merah-terang/50"
          />
        </div>
      </div>

      {/* Table with MAX-HEIGHT & STICKY HEADER */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-gray-50 dark:bg-[#3d2e39] text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="p-6 w-20">ID</th>
                <th className="p-6">Nama Lokasi</th>
                <th className="p-6">Koordinat (Lat, Lng)</th>
                <th className="p-6 text-center">Radius</th>
                <th className="p-6 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {isLoading && listLokasi.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-gray-400 font-bold text-[10px] uppercase tracking-widest"
                  >
                    Memuat Data Lokasi...
                  </td>
                </tr>
              ) : (
                filteredData.map((loc) => (
                  <tr
                    key={loc.id_lokasi}
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-5 font-black text-custom-merah-terang italic">
                      #{loc.id_lokasi}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-custom-gelap text-custom-cerah rounded-xl">
                          <MdLocationOn size={18} />
                        </div>
                        <span className="text-sm font-bold text-custom-gelap dark:text-white">
                          {loc.nama_lokasi}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <code className="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-blue-500 font-bold">
                          {loc.latitude}
                        </code>
                        <code className="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-green-500 font-bold">
                          {loc.longitude}
                        </code>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 px-3 py-1 rounded-lg font-black text-[10px]">
                        {loc.radius_meter} METER
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(loc)}
                          className="p-2 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(loc.id_lokasi, loc.nama_lokasi)
                          }
                          className="p-2 bg-gray-50 dark:bg-white/5 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
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

      {/* MODAL FORM LOKASI */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-8 pb-4 flex justify-between items-center text-poppins">
              <h2 className="text-xl font-bold dark:text-white">
                {formData.id ? "Edit Lokasi" : "Tambah Lokasi Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="p-8 pt-4 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                  Nama Lokasi
                </label>
                <input
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  placeholder="Contoh: Kantor Mataram"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                    Latitude
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.lat}
                    onChange={(e) =>
                      setFormData({ ...formData, lat: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="-8.639..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                    Longitude
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.lng}
                    onChange={(e) =>
                      setFormData({ ...formData, lng: e.target.value })
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                    placeholder="116.087..."
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                  Radius Absensi (Meter)
                </label>
                <input
                  required
                  type="number"
                  value={formData.radius}
                  onChange={(e) =>
                    setFormData({ ...formData, radius: e.target.value })
                  }
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-sm outline-none dark:text-white focus:border-custom-merah-terang"
                  placeholder="50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 bg-custom-merah-terang text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  <MdCheckCircle size={18} />{" "}
                  {isLoading ? "Memproses..." : "Simpan Lokasi"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Lokasi;
