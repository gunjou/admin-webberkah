const IMAGE_UPLOAD_URL = process.env.REACT_APP_CDN_IMAGE_UPLOAD_URL;
const IMAGE_API_KEY = process.env.REACT_APP_CDN_IMAGE_API_KEY;

const DOCUMENT_UPLOAD_URL = process.env.REACT_APP_CDN_DOCUMENT_UPLOAD_URL;
const DOCUMENT_API_KEY = process.env.REACT_APP_CDN_DOCUMENT_API_KEY;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const isSupportedAttachment = (file) =>
  [...IMAGE_TYPES, ...DOCUMENT_TYPES].includes(file?.type);

export const uploadAttachment = async (file) => {
  if (!file) return null;

  if (!isSupportedAttachment(file)) {
    throw new Error("Format attachment tidak didukung.");
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const uploadUrl = isImage ? IMAGE_UPLOAD_URL : DOCUMENT_UPLOAD_URL;
  const apiKey = isImage ? IMAGE_API_KEY : DOCUMENT_API_KEY;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-API-KEY": apiKey,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.status || !result.url) {
    throw new Error(result.message || "Gagal mengupload attachment.");
  }

  return {
    name: file.name?.trim() || "lampiran-pengajuan",
    url: result.url,
  };
};
