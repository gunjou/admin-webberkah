import React from "react";
import { MdClose, MdOpenInNew, MdDownload } from "react-icons/md";

const getFileExtension = (url = "") => {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split(".").pop()?.toLowerCase() || "";
  } catch {
    return "";
  }
};

const getFileType = (url = "") => {
  const extension = getFileExtension(url);

  if (extension === "pdf") {
    return "pdf";
  }

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return "image";
  }

  return "other";
};

const DocumentPreviewModal = ({
  show,
  url,
  title = "Preview Dokumen",
  onClose,
}) => {
  if (!show || !url) {
    return null;
  }

  const fileType = getFileType(url);

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-custom-gelap">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-white/5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-tight text-custom-gelap dark:text-white">
              {title}
            </h2>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Document Preview
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gray-100 px-3 text-[9px] font-black uppercase tracking-widest text-gray-600 transition hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <MdOpenInNew size={15} />
              Buka
            </a>

            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-custom-merah-terang px-3 text-[9px] font-black uppercase tracking-widest text-white transition hover:opacity-90"
            >
              <MdDownload size={15} />
              Download
            </a>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              title="Tutup"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="min-h-0 flex-1 bg-gray-100 p-3 dark:bg-black/20">
          {fileType === "pdf" && (
            <iframe
              src={url}
              title={title}
              className="h-full w-full rounded-xl border-0 bg-white"
            />
          )}

          {fileType === "image" && (
            <div className="flex h-full w-full items-center justify-center overflow-auto rounded-xl bg-white p-4 dark:bg-black/10">
              <img
                src={url}
                alt={title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {fileType === "other" && (
            <div className="flex h-full flex-col items-center justify-center rounded-xl bg-white dark:bg-white/5">
              <p className="text-sm font-black text-custom-gelap dark:text-white">
                Preview tidak tersedia
              </p>

              <p className="mt-1 text-[10px] font-bold text-gray-400">
                Silakan buka atau download dokumen.
              </p>

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-custom-merah-terang px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white"
              >
                <MdOpenInNew size={15} />
                Buka Dokumen
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
