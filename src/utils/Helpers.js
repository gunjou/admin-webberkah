/**
 * Mengubah string menjadi Title Case (Contoh: "gunjo aniki" -> "Gunjo Aniki")
 * @param {string} str
 * @returns {string}
 */
export const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Mengubah string menjadi Username format (Lowercase & hapus spasi)
 * @param {string} str
 * @returns {string}
 */
export const toSafeUsername = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\s+/g, "");
};

/**
 * Memformat angka ke Rupiah (Bisa Anda gunakan nanti di modul Gaji)
 */
export const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

/**
 * Memformat menit terlambat 70 menit --> 1 Jam 10 Menit
 */
export const formatTerlambat = (totalMenit) => {
  if (!totalMenit || totalMenit <= 0) return null;
  const jam = Math.floor(totalMenit / 60);
  const menit = totalMenit % 60;
  return jam > 0 ? `${jam} Jam ${menit} Menit` : `${menit} Menit`;
};

/**
 * Format tanggal: 2026-01-16
 * → Jum'at, 16 Januari 2026
 */
export const formatTanggalIndoLengkap = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};
