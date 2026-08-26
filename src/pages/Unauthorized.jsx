import React from "react";
import { useNavigate } from "react-router-dom";
import { MdBlock, MdArrowBack, MdDashboard } from "react-icons/md";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* ICON */}

        <div className="mx-auto w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-500/10 text-custom-merah-terang flex items-center justify-center">
          <MdBlock size={40} />
        </div>

        {/* CODE */}

        <p className="text-6xl font-black text-custom-gelap dark:text-white mt-6">
          403
        </p>

        {/* TITLE */}

        <h1 className="text-xl font-black text-custom-gelap dark:text-white mt-3">
          Akses Ditolak
        </h1>

        <p className="text-sm text-gray-400 mt-3 leading-relaxed">
          Anda tidak memiliki hak akses untuk membuka halaman ini.
        </p>

        {/* ACTION */}

        <div className="flex items-center justify-center gap-3 mt-7">
          <button
            onClick={() => navigate(-1)}
            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-white dark:bg-custom-gelap border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs font-bold hover:border-custom-merah-terang hover:text-custom-merah-terang transition-all"
          >
            <MdArrowBack size={16} />
            Kembali
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-custom-merah-terang text-white text-xs font-bold shadow-md hover:bg-custom-merah transition-all"
          >
            <MdDashboard size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
