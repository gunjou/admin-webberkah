import React from "react";
import { MdClose, MdNotificationsNone } from "react-icons/md";

const NotificationContractModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-3 w-[320px] md:w-[380px] bg-white dark:bg-[#2d1f29] rounded-[30px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="p-5 bg-custom-gelap text-white flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tighter italic">
            Monitoring Kontrak
          </h3>
          <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-1">
            Contract Notification
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <MdClose size={20} />
        </button>
      </div>

      <div className="min-h-[180px] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
          <MdNotificationsNone size={26} />
        </div>

        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4">
          Belum ada notifikasi
        </p>
        <p className="text-[9px] text-gray-400 mt-1">
          Notifikasi kontrak akan muncul di sini.
        </p>
      </div>
    </div>
  );
};

export default NotificationContractModal;
