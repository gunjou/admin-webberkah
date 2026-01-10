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
