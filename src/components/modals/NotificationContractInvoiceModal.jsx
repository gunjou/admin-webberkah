import React from "react";
import { MdClose, MdNotificationsNone } from "react-icons/md";

const NotificationContractInvoiceModal = ({ role, isOpen, onClose }) => {
  if (!isOpen) return null;

  const roleLabel =
    role === "CONTRACT" ? "Contract & Invoice" : "Contract & Invoice";

  // =======================================================
  // DUMMY DATA
  // TODO:
  // Ganti dengan response API Contract & Invoice
  // =======================================================

  const notifications = [
    // {
    //   id: 1,
    //   type: "WORK_ITEM",
    //   title: "Pekerjaan membutuhkan perhatian",
    //   description: "Terdapat pekerjaan yang memasuki batas risiko.",
    //   time: "15 menit yang lalu",
    //   icon: <MdBusinessCenter />,
    // },
    // {
    //   id: 2,
    //   type: "CONTRACT",
    //   title: "Kontrak mendekati masa berakhir",
    //   description: "Terdapat kontrak yang perlu segera ditindaklanjuti.",
    //   time: "1 jam yang lalu",
    //   icon: <MdDescription />,
    // },
    // {
    //   id: 3,
    //   type: "INVOICE",
    //   title: "Invoice membutuhkan tindak lanjut",
    //   description: "Terdapat invoice yang belum terselesaikan.",
    //   time: "2 jam yang lalu",
    //   icon: <MdReceiptLong />,
    // },
  ];

  return (
    <div className="absolute right-0 mt-3 w-[320px] md:w-[380px] bg-white dark:bg-[#2d1f29] rounded-[30px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-4 duration-200">
      {/* =================================================
          HEADER
      ================================================== */}

      <div className="p-5 bg-custom-gelap text-white flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-tighter italic">
            Monitoring Contract & Invoice
          </h3>

          <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-1">
            {roleLabel} Notification
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <MdClose size={20} />
        </button>
      </div>

      {/* =================================================
          CONTENT
      ================================================== */}

      {notifications.length === 0 ? (
        <div className="min-h-[180px] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 flex items-center justify-center">
            <MdNotificationsNone size={26} />
          </div>

          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-4">
            Belum ada notifikasi
          </p>

          <p className="text-[9px] text-gray-400 mt-1">
            Notifikasi Contract & Invoice akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5"
            >
              <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-custom-merah-terang/10 dark:bg-white/5 text-custom-merah-terang dark:text-custom-cerah flex items-center justify-center text-lg">
                {item.icon}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-custom-gelap dark:text-white">
                  {item.title}
                </p>

                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {item.description}
                </p>

                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-2">
                  {item.time}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationContractInvoiceModal;
