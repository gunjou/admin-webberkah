import React from "react";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-br from-custom-merah to-custom-gelap font-poppins px-4">
      <div className="flex items-center justify-center h-screen font-poppins">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-200">404</h1>
          <p className="text-gray-200">Halaman Tidak Ditemukan</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
