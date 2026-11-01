import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MdClose,
  MdFileDownload,
  MdDescription,
  MdAccountBalance,
  MdCheckCircle,
} from "react-icons/md";
import Api from "../../utils/Api";

const OptionCard = ({ active, icon: Icon, title, desc, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative w-full text-left p-4 rounded-2xl border-2 transition-all ${
      active
        ? "border-custom-merah-terang bg-red-50 dark:bg-custom-merah/20"
        : "border-gray-100 dark:border-white/10 hover:border-custom-cerah"
    }`}
  >
    {active && (
      <MdCheckCircle
        size={18}
        className="absolute top-3 right-3 text-custom-merah-terang"
      />
    )}
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
        active
          ? "bg-custom-merah-terang text-white"
          : "bg-gray-100 dark:bg-white/10 text-gray-500"
      }`}
    >
      <Icon size={20} />
    </div>
    <p className="font-bold text-sm text-custom-gelap dark:text-white">
      {title}
    </p>
    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
  </button>
);

/**
 * Modal pilihan export payroll.
 * - internal: langsung export laporan rekap lengkap
 * - bank: pilih rekening sumber (dari /cashbook/accounts) di modal yang sama
 */
const ModalExportPayroll = ({
  isOpen,
  onClose,
  onExportInternal,
  onExportBank,
  periode,
  jumlahPegawai,
}) => {
  const [jenis, setJenis] = useState("internal");
  const [accounts, setAccounts] = useState([]);
  const [loadingAcc, setLoadingAcc] = useState(false);
  const [errorAcc, setErrorAcc] = useState("");
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setJenis("internal");
      setSelectedAcc(null);
    }
  }, [isOpen]);

  // Ambil rekening sumber saat memilih bank (sekali saja)
  useEffect(() => {
    if (jenis !== "bank" || accounts.length > 0) return;
    setLoadingAcc(true);
    setErrorAcc("");
    Api.get("/cashbook/accounts")
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setAccounts(
          (Array.isArray(data) ? data : []).filter((a) => a.account_number),
        );
      })
      .catch(() => setErrorAcc("Gagal memuat rekening sumber."))
      .finally(() => setLoadingAcc(false));
  }, [jenis, accounts.length]);

  if (!isOpen) return null;

  const canSubmit =
    !submitting && (jenis === "internal" || (jenis === "bank" && selectedAcc));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      if (jenis === "internal") await onExportInternal();
      else await onExportBank(selectedAcc);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-custom-gelap w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300 font-poppins"
      >
        {/* Header */}
        <div className="p-6 pb-3 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-custom-gelap dark:text-white uppercase tracking-tight flex items-center gap-2">
              <MdFileDownload className="text-custom-merah-terang" /> Export
              Payroll
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {periode} • {jumlahPegawai} Pegawai
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-custom-merah-terang rounded-full transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <OptionCard
              active={jenis === "internal"}
              icon={MdDescription}
              title="Laporan Internal"
              desc="Rekap lengkap absensi, tunjangan & potongan."
              onClick={() => setJenis("internal")}
            />
            <OptionCard
              active={jenis === "bank"}
              icon={MdAccountBalance}
              title="Payroll ke Bank"
              desc="Nama, rekening & gaji bersih untuk transfer."
              onClick={() => setJenis("bank")}
            />
          </div>

          {jenis === "bank" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Rekening Sumber
              </p>
              {loadingAcc ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Memuat rekening...
                </p>
              ) : errorAcc ? (
                <p className="text-xs text-custom-merah-terang py-4 text-center">
                  {errorAcc}
                </p>
              ) : accounts.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Tidak ada rekening dengan nomor rekening terdaftar.
                </p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {accounts.map((a) => {
                    const active = selectedAcc?.id_account === a.id_account;
                    return (
                      <button
                        key={a.id_account}
                        type="button"
                        onClick={() => setSelectedAcc(a)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                          active
                            ? "border-custom-merah-terang bg-red-50 dark:bg-custom-merah/20"
                            : "border-gray-100 dark:border-white/10 hover:border-custom-cerah"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-custom-gelap dark:text-white">
                            {a.account_name}
                          </p>
                          <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                            {a.account_number}
                          </p>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                            active
                              ? "border-custom-merah-terang bg-custom-merah-terang"
                              : "border-gray-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-custom-merah-terang text-white shadow-lg shadow-custom-merah-terang/20 hover:bg-custom-merah transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MdFileDownload size={16} />
            {submitting ? "Memproses..." : "Export PDF"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalExportPayroll;
