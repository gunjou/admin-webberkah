import React, { useEffect } from "react";
import { MdClose, MdOpenInNew, MdInsertDriveFile } from "react-icons/md";

const ModalAttachment = ({ attachment, onClose }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!attachment) return null;

  const fileUrl = attachment.path;
  const fileName = attachment.name || "Lampiran";

  const extension =
    fileName.split(".").pop()?.toLowerCase() ||
    fileUrl.split(".").pop()?.split("?")[0].toLowerCase();

  const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
  const documentExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ];

  const isImage = imageExtensions.includes(extension);
  const isPdf = extension === "pdf";
  const isDocument = documentExtensions.includes(extension);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-custom-gelap">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-custom-gelap dark:text-white">
              Attachment
            </p>
            <p className="mt-1 truncate text-[10px] text-gray-400">
              {fileName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isImage && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center gap-2 rounded-lg bg-custom-merah-terang px-3 text-[9px] font-black uppercase tracking-wider text-white transition-all hover:bg-custom-merah"
              >
                <MdOpenInNew size={16} />
                Buka
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <MdClose size={19} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-gray-100 p-5 dark:bg-black/20">
          {isImage && (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-lg"
            />
          )}

          {isPdf && (
            <iframe
              src={fileUrl}
              title={fileName}
              className="h-[75vh] w-full rounded-lg border-0 bg-white shadow-lg"
            />
          )}

          {isDocument && !isPdf && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-8 py-12 text-center shadow-lg dark:bg-custom-gelap">
              <MdInsertDriveFile
                size={56}
                className="text-custom-merah-terang"
              />

              <p className="mt-4 text-sm font-black text-custom-gelap dark:text-white">
                {fileName}
              </p>

              <p className="mt-2 max-w-md text-xs text-gray-500 dark:text-gray-400">
                Format file ini tidak dapat ditampilkan langsung di browser.
              </p>

              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-custom-merah"
              >
                <MdOpenInNew size={17} />
                Buka File
              </a>
            </div>
          )}

          {!isImage && !isPdf && !isDocument && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-8 py-12 text-center shadow-lg dark:bg-custom-gelap">
              <MdInsertDriveFile size={56} className="text-gray-400" />

              <p className="mt-4 text-sm font-black text-custom-gelap dark:text-white">
                {fileName}
              </p>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Format file belum didukung untuk preview.
              </p>

              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center gap-2 rounded-xl bg-custom-merah-terang px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-custom-merah"
              >
                <MdOpenInNew size={17} />
                Buka File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAttachment;
