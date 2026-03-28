import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportSlipGajiPDF = (data) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // --- HELPER UNTUK NAMA BULAN ---
  const getFullMonthName = (periodeStr) => {
    // periodeStr format: "03-2026"
    const [mm, yyyy] = periodeStr.split("-");
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${monthNames[parseInt(mm) - 1]} ${yyyy}`;
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const logoPath = "/images/logo.png";
  const periodeFormatted = getFullMonthName(data.periode);

  // --- HEADER DENGAN LOGO ---
  // 1. Tambahkan Logo (Koordinat x: 15, y: 10, lebar: 20mm)
  try {
    doc.addImage(logoPath, "PNG", margin, 10, 20, 20);
  } catch (e) {
    console.warn("Logo tidak ditemukan, melanjutkan tanpa logo.");
  }

  // 2. Detail Perusahaan (Geser ke kanan setelah Logo)
  const textStartX = margin + 25; // Jarak setelah logo (15 + 20 + padding)

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PT. BERKAH ANGSANA TEKNIKA", textStartX, 15);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80); // Warna abu-abu tua agar elegan
  doc.text(
    "Perumahan Bukit Citra Kencana, Block B no. 35, Jl. Pengsong Raya,",
    textStartX,
    20,
  );
  doc.text(
    "Desa Perampuan, Kecamatan Labuapi, Lombok Barat, NTB.",
    textStartX,
    24,
  );
  doc.text(
    "Phone : 0370 785 3692, Email : admin@berkahangsana.com",
    textStartX,
    28,
  );

  // 3. Garis Pembatas (Double Line agar Mewah)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, 32, pageWidth - margin, 32);
  doc.setLineWidth(0.1);
  doc.line(margin, 33, pageWidth - margin, 33);

  // --- JUDUL DOKUMEN ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SLIP GAJI PEGAWAI", pageWidth / 2, 42, { align: "center" });

  // --- INFO PEGAWAI ---
  doc.setFontSize(9);
  doc.text(`NAMA PEGAWAI`, margin, 52);
  doc.text(`: ${data.pegawai.nama_lengkap.toUpperCase()}`, margin + 35, 52);

  //   doc.text(`ID / NIP`, margin, 57);
  //   doc.text(`: ${data.pegawai.nip || "-"}`, margin + 35, 57);

  doc.text(`STATUS`, margin, 57);
  doc.text(`: ${data.pegawai.nama_status.toUpperCase()}`, margin + 35, 57);

  doc.text(`PERIODE`, pageWidth - 70, 52);
  doc.text(`: ${periodeFormatted.toUpperCase()}`, pageWidth - 50, 52);

  let currentY = 65;

  // --- 1. KOMPONEN PENDAPATAN ---
  autoTable(doc, {
    startY: currentY,
    head: [["DESKRIPSI PENDAPATAN", "JUMLAH"]],
    body: data.pendapatan.map((item) => [
      item.nama,
      `Rp ${item.nilai.toLocaleString()}`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [40, 40, 40], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 1: { halign: "right" } },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // --- 2. POTONGAN ABSENSI (Hanya tampil jika ada) ---
  if (data.potongan.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [["POTONGAN (ABSENSI / TERLAMBAT)", "KODE", "NOMINAL"]],
      body: data.potongan.map((p) => [
        p.tanggal,
        p.kode,
        `-Rp ${p.nilai.toLocaleString()}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [200, 0, 0], fontSize: 8 },
      styles: { fontSize: 7 },
      columnStyles: { 2: { halign: "right", textColor: [200, 0, 0] } },
      margin: { left: margin, right: margin },
    });
    currentY = doc.lastAutoTable.finalY + 5;
  }

  // --- 3. POTONGAN HUTANG ---
  if (data.potongan_hutang > 0) {
    autoTable(doc, {
      startY: currentY,
      body: [
        [
          "POTONGAN HUTANG / KASBON (CICILAN)",
          `-Rp ${data.potongan_hutang.toLocaleString()}`,
        ],
      ],
      theme: "plain",
      styles: { fontSize: 8, fontStyle: "bold", textColor: [180, 80, 0] },
      columnStyles: { 1: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
    currentY = doc.lastAutoTable.finalY + 3;
  }

  // --- 4. RINCIAN LEMBUR ---
  if (data.detail_lembur && data.detail_lembur.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [["RINCIAN LEMBUR", "JAM", "PENGALI", "UPAH"]],
      body: data.detail_lembur.map((l) => [
        l.tanggal,
        `${(l.menit_lembur / 60).toFixed(1)}`,
        `x${l.pengali}`,
        `Rp ${l.upah_lembur.toLocaleString()}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [0, 100, 200], fontSize: 8 },
      styles: { fontSize: 7 },
      columnStyles: { 3: { halign: "right" } },
      margin: { left: margin, right: margin },
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // --- FINAL SUMMARY ---
  const finalNet =
    (data.ringkasan.total_diterima || 0) -
    (data.potongan_hutang || 0) +
    (data.lembur || 0);

  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, currentY, pageWidth - margin * 2, 12, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL TAKE HOME PAY (NETTO)", margin + 5, currentY + 7.5);
  doc.setFontSize(12);
  doc.setTextColor(34, 150, 34);
  doc.text(
    `Rp ${Math.floor(finalNet).toLocaleString()}`,
    pageWidth - margin - 5,
    currentY + 7.5,
    { align: "right" },
  );

  // --- TANDA TANGAN DINAMIS (Updated) ---
  doc.setTextColor(0);
  currentY += 25;
  doc.setFontSize(9).setFont("helvetica", "normal");

  // Tentukan Poros Tengah untuk masing-masing kolom tanda tangan
  const colPenerimaX = margin + 30; // Tengah area kiri
  const colManajemenX = pageWidth - margin - 30; // Tengah area kanan

  doc.text("Penerima,", colPenerimaX, currentY, { align: "center" });
  doc.text("Manajemen PT. Berkah Angsana Teknika,", colManajemenX, currentY, {
    align: "center",
  });

  currentY += 22; // Ruang tanda tangan

  // Nama Pegawai Dinamis (Selalu di tengah poros colPenerimaX)
  doc.setFont("helvetica", "bold");
  doc.text(
    `( ${data.pegawai.nama_lengkap.toUpperCase()} )`,
    colPenerimaX,
    currentY,
    { align: "center" },
  );

  // Manajemen
  doc.text("( ____________________ )", colManajemenX, currentY, {
    align: "center",
  });

  // --- STICKY FOOTER (Posisi Absolut di Bawah Kertas) ---
  const pageHeight = doc.internal.pageSize.getHeight(); // Ambil tinggi kertas A4 (297mm)
  const footerY = pageHeight - 10; // Letakkan 10mm dari ujung bawah kertas

  doc.setFont("helvetica", "italic").setFontSize(7).setTextColor(150); // Warna abu-abu halus
  doc.text(
    `*Dokumen ini dicetak otomatis melalui sistem PT. Berkah Angsana Teknika pada: ${new Date().toLocaleString("id-ID")}`,
    margin,
    footerY,
  );

  // Tambahkan nomor halaman jika perlu (Opsional)
  doc.text(`Halaman 1/1`, pageWidth - margin, footerY, { align: "right" });

  doc.save(
    `Slip_Gaji_${data.pegawai.nama_lengkap.replace(/ /g, "_")}_${data.periode}.pdf`,
  );
};
