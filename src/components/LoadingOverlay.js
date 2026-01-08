import React from "react";

const LoadingOverlay = ({ message = "Mohon Tunggu..." }) => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Ring Luar */}
        <div className="w-16 h-16 border-4 border-t-custom-merah border-r-transparent border-b-custom-cerah border-l-transparent rounded-full animate-spin"></div>

        {/* Ring Dalam (Berlawanan arah) */}
        <div className="absolute w-10 h-10 border-4 border-t-transparent border-r-custom-merah border-b-transparent border-l-custom-cerah rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
      </div>

      <p className="mt-4 text-white font-medium tracking-widest text-sm animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingOverlay;
