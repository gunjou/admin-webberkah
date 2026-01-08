import React, { useState } from "react";
import {
  MdSearch,
  MdAdd,
  MdAccountBalance,
  MdSchool,
  MdPerson,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdBadge,
  MdLocationOn,
  MdRemoveRedEye,
  MdDeleteOutline,
  MdEdit,
} from "react-icons/md";

const Pegawai = () => {
  const [mainTab, setMainTab] = useState("core"); // core, rekening, pendidikan
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  const monthNames = [
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

  // DATA DUMMY GABUNGAN
  const dataPegawai = [
    {
      id_pegawai: 1,
      nip: "PEG-2024001",
      nama_lengkap: "Gugun Ichijo",
      nama_panggilan: "Gugun",
      jenis_kelamin: "L",
      tanggal_masuk: "2024-01-10",
      departemen: "Operational",
      jabatan: "Manager",
      status_pegawai: "Tetap",
      pribadi: {
        nik: "3271234567890001",
        alamat: "Mataram, NTB",
        no_telepon: "081234567890",
        email: "gugun@berkah.com",
        agama: "Islam",
        status_nikah: "Menikah",
      },
      rekening: { bank: "BCA", nomor: "8890123456", an: "Gugun Ichijo" },
      pendidikan: {
        jenjang: "S1",
        institusi: "Universitas Mataram",
        jurusan: "Manajemen",
        lulus: 2017,
      },
    },
    {
      id_pegawai: 2,
      nip: "PEG-2024002",
      nama_lengkap: "Andi Saputra",
      nama_panggilan: "Andi",
      jenis_kelamin: "L",
      tanggal_masuk: "2024-02-15",
      departemen: "Finance",
      jabatan: "Staff",
      status_pegawai: "Tidak Tetap",
      pribadi: {
        nik: "3271234567890002",
        alamat: "Ampenan, Mataram",
        no_telepon: "081987654321",
        email: "andi@berkah.com",
        agama: "Islam",
        status_nikah: "Lajang",
      },
      rekening: { bank: "Mandiri", nomor: "16100012345", an: "Andi Saputra" },
      pendidikan: {
        jenjang: "SMA",
        institusi: "SMA 1 Mataram",
        jurusan: "IPS",
        lulus: 2016,
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* HEADER & INTEGRATED TOOLBAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-custom-gelap dark:text-white tracking-tight">
            Database Pegawai
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Manajemen Induk & Berkas Karyawan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:flex-none md:w-56">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari Pegawai..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-custom-gelap border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-medium outline-none shadow-sm dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="bg-white dark:bg-custom-gelap px-3 py-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
            <select className="bg-transparent border-none text-[10px] font-black uppercase tracking-tight outline-none dark:text-white cursor-pointer">
              <option>Semua Status</option>
              <option>Tetap</option>
              <option>Tidak Tetap</option>
              <option>Magang</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-custom-merah-terang text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-custom-merah-terang/20 hover:scale-105 transition-all">
            <MdAdd size={18} /> Tambah
          </button>
        </div>
      </div>

      {/* CATEGORY TABS (Sesuai Permintaan Anda) */}
      <div className="flex bg-white dark:bg-custom-gelap p-1.5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm w-full md:w-fit">
        {[
          { id: "core", label: "Data Pegawai", icon: <MdPerson /> },
          {
            id: "rekening",
            label: "Rekening Bank",
            icon: <MdAccountBalance />,
          },
          { id: "pendidikan", label: "Pendidikan", icon: <MdSchool /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              mainTab === tab.id
                ? "bg-custom-merah-terang text-white shadow-lg shadow-custom-merah-terang/20"
                : "text-gray-400 hover:text-custom-merah-terang"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TABLE DATA LIST */}
      <div className="bg-white dark:bg-custom-gelap rounded-[40px] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col max-h-[380px]">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-[10px] border-collapse min-w-[400px] table-fixed">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#3d2e39] font-black uppercase tracking-widest text-gray-400">
                <th className="p-4 text-left sticky left-0 top-0 bg-gray-50 dark:bg-[#3d2e39] z-40 border-b border-gray-100 dark:border-white/10 w-[250px]">
                  Pegawai
                </th>

                {/* Kolom Berubah Sesuai Tab */}
                {mainTab === "core" && (
                  <>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Jabatan / Dept
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Kontak
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Alamat Pribadi
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[120px]">
                      Tgl Masuk
                    </th>
                  </>
                )}

                {mainTab === "rekening" && (
                  <>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[150px]">
                      Nama Bank
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Nomor Rekening
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Atas Nama
                    </th>
                  </>
                )}

                {mainTab === "pendidikan" && (
                  <>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[100px]">
                      Jenjang
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[250px]">
                      Institusi
                    </th>
                    <th className="p-3 text-left sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[200px]">
                      Jurusan
                    </th>
                    <th className="p-3 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[100px]">
                      Tahun Lulus
                    </th>
                  </>
                )}

                <th className="p-4 text-center sticky top-0 bg-gray-50 dark:bg-[#3d2e39] z-30 border-b border-gray-100 dark:border-white/10 w-[120px]">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {dataPegawai.map((p) => (
                <tr
                  key={p.id_pegawai}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                >
                  <td className="p-3 sticky left-0 bg-white dark:bg-custom-gelap z-20 border-r border-gray-100 dark:border-white/10 shadow-[4px_0_8px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3 pl-2">
                      <div className="w-8 h-8 rounded-lg bg-custom-gelap text-custom-cerah flex items-center justify-center font-black text-[9px] uppercase">
                        {p.nama_lengkap.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-custom-gelap dark:text-white leading-none truncate">
                          {p.nama_lengkap}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`text-[7px] font-black px-1 rounded-sm uppercase ${
                              p.status_pegawai === "Tetap"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {p.status_pegawai}
                          </span>
                          <span className="text-[7px] text-gray-400 font-medium">
                            | {p.nip}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* DATA DINAMIS BERDASARKAN TAB */}
                  {mainTab === "core" && (
                    <>
                      <td className="p-3 text-gray-600 dark:text-gray-300">
                        <p className="font-bold leading-none">{p.jabatan}</p>
                        <p className="text-[8px] text-gray-400 mt-1 uppercase">
                          {p.departemen}
                        </p>
                      </td>
                      <td className="p-3 text-gray-500">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <MdEmail className="text-custom-cerah" />{" "}
                            {p.pribadi.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MdPhone className="text-custom-cerah" />{" "}
                            {p.pribadi.no_telepon}
                          </span>
                        </div>
                      </td>
                      <td
                        className="p-3 text-gray-500 italic truncate"
                        title={p.pribadi.alamat}
                      >
                        <MdLocationOn className="inline mr-1" />{" "}
                        {p.pribadi.alamat}
                      </td>
                      <td className="p-3 text-center text-gray-500 font-bold">
                        {p.tanggal_masuk}
                      </td>
                    </>
                  )}

                  {mainTab === "rekening" && (
                    <>
                      <td className="p-3 text-center">
                        <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 px-3 py-1 rounded-lg font-black">
                          {p.rekening.bank}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-sm font-bold text-custom-merah-terang tracking-tighter">
                        {p.rekening.nomor}
                      </td>
                      <td className="p-3 text-gray-500 font-bold uppercase">
                        {p.rekening.an}
                      </td>
                    </>
                  )}

                  {mainTab === "pendidikan" && (
                    <>
                      <td className="p-3 text-center font-black text-custom-merah-terang">
                        {p.pendidikan.jenjang}
                      </td>
                      <td className="p-3 font-bold text-custom-gelap dark:text-white uppercase">
                        {p.pendidikan.institusi}
                      </td>
                      <td className="p-3 text-gray-500">
                        {p.pendidikan.jurusan}
                      </td>
                      <td className="p-3 text-center font-bold text-gray-400">
                        {p.pendidikan.lulus}
                      </td>
                    </>
                  )}

                  {/* AKSI */}
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button className="p-2 bg-gray-50 dark:bg-white/5 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                        <MdEdit size={14} />
                      </button>
                      <button className="p-2 bg-gray-50 dark:bg-white/5 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                        <MdDeleteOutline size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER TOTAL */}
      <div className="p-4 bg-white dark:bg-custom-gelap rounded-[25px] border border-gray-100 dark:border-white/5 flex justify-between items-center shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Total Karyawan Terdaftar:{" "}
          <span className="text-custom-merah-terang">
            {dataPegawai.length} Orang
          </span>
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[9px] font-bold text-blue-600 uppercase">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Tetap
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-orange-600 uppercase">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Tidak
            Tetap
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pegawai;
