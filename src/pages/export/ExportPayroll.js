import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Footer di SEMUA halaman (dipanggil sebelum doc.save, termasuk halaman tanda tangan)
const renderFooterAllPages = (doc, text, margin) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = doc.internal.pageSize.getHeight() - 10;
  const total = doc.getNumberOfPages();
  const printedAt = new Date().toLocaleString("id-ID");
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic").setFontSize(7).setTextColor(150);
    doc.text(`${text} ${printedAt}`, margin, footerY);
    doc.text(`Halaman ${i} dari ${total}`, pageWidth - margin, footerY, {
      align: "right",
    });
  }
  doc.setTextColor(0);
};

export const exportPayrollToPDF = (
  payrollData,
  summary,
  monthNames,
  selectedMonth,
  selectedYear,
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const logoPath = "/images/logo.png";
  const periodeFormal = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

  // --- 1. HEADER KHUSUS HALAMAN PERTAMA ---
  const renderHeaderHalamanUtama = () => {
    try {
      doc.addImage(logoPath, "PNG", margin, 10, 20, 20);
    } catch (e) {}

    const textStartX = margin + 25;
    doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(0);
    doc.text("PT. BERKAH ANGSANA TEKNIKA", textStartX, 15);

    doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(80);
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

    doc.setLineWidth(0.5).line(margin, 32, pageWidth - margin, 32);
    doc.setLineWidth(0.1).line(margin, 33, pageWidth - margin, 33);

    doc.setTextColor(0).setFontSize(12).setFont("helvetica", "bold");
    doc.text("LAPORAN REKAPITULASI PENGGAJIAN KARYAWAN", pageWidth / 2, 42, {
      align: "center",
    });
    doc
      .setFontSize(10)
      .text(`PERIODE: ${periodeFormal.toUpperCase()}`, pageWidth / 2, 47, {
        align: "center",
      });
  };

  renderHeaderHalamanUtama();

  // --- 3. DATA PREPARATION ---
  const tableColumn = [
    "No",
    "Nama Pegawai",
    "Sts",
    "HK",
    "S",
    "I",
    "C",
    "A",
    "Gapok",
    "T.Jab",
    "T.Mkn",
    "T.Trp",
    "T.Khs",
    "Gaji Bruto", // Tambahan kolom baru
    "Pot.Abs",
    "Pot.Hut",
    "Subtotal",
    "Lembur",
    "TOTAL NET",
  ];

  const tableRows = payrollData.map((row, index) => {
    let statusSingkat =
      row.nama_status === "Pegawai Tetap"
        ? "PT"
        : row.nama_status === "Pegawai Tidak Tetap"
          ? "PTT"
          : "M";

    // Hitung Bruto: Gapok + Semua Tunjangan
    const bruto =
      (row.gapok || 0) +
      (row.t_jab || 0) +
      (row.t_mkn || 0) +
      (row.t_trp || 0) +
      (row.t_khs || 0);

    return [
      index + 1,
      row.nama_lengkap,
      statusSingkat,
      row.total_hari_kerja,
      row.total_sakit || 0,
      row.total_izin || 0,
      row.total_cuti || 0,
      row.total_alpha || 0,
      Math.floor(row.gapok).toLocaleString(),
      Math.floor(row.t_jab).toLocaleString(),
      Math.floor(row.t_mkn).toLocaleString(),
      Math.floor(row.t_trp).toLocaleString(),
      Math.floor(row.t_khs || 0).toLocaleString(),
      Math.floor(bruto).toLocaleString(), // Data Gaji Bruto
      row.total_potongan > 0
        ? `-${Math.floor(row.total_potongan).toLocaleString()}`
        : "0",
      row.potongan_hutang > 0
        ? `-${Math.floor(row.potongan_hutang).toLocaleString()}`
        : "0",
      Math.floor(
        row.total_diterima - (row.potongan_hutang || 0),
      ).toLocaleString(),
      Math.floor(row.lembur || 0).toLocaleString(),
      Math.floor(
        row.total_diterima - (row.potongan_hutang || 0) + (row.lembur || 0),
      ).toLocaleString(),
    ];
  });

  // --- 4. GENERATE TABLE DENGAN BARIS AKUMULASI ---
  autoTable(doc, {
    startY: 52,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 6, cellPadding: 1.2 }, // Sedikit dikecilkan agar muat tambahan kolom
    headStyles: {
      fillColor: [239, 68, 68],
      halign: "center",
      fontStyle: "bold",
    },
    margin: { top: 15, bottom: 20 },
    columnStyles: {
      0: { cellWidth: 6, halign: "center" },
      1: { cellWidth: 30 },
      13: { halign: "right", fontStyle: "bold" }, // Gaji Bruto
      14: { halign: "right" }, // Pot.Abs
      15: { halign: "right" }, // Pot.Hut
      18: { halign: "right", fontStyle: "bold", textColor: [22, 101, 52] }, // Total Net
    },
    didParseCell: (data) => {
      // Warna merah untuk potongan di Body (Index kolom bergeser karena ada Bruto)
      if (data.section === "body") {
        if (data.column.index === 14 || data.column.index === 15) {
          if (data.cell.text[0] && data.cell.text[0].includes("-")) {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      }
      // Warna merah untuk potongan di Footer
      if (data.section === "foot") {
        if (data.cell.text[0] && data.cell.text[0].includes("-")) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
    foot: [
      [
        {
          content: "TOTAL AKUMULASI PER KOLOM",
          colSpan: 8, // Tetap 8 (No sampai A)
          styles: { halign: "center", fontStyle: "bold" },
        },
        "",
        "",
        "",
        "",
        "", // Gapok sampai T.Khs
        "", // Kolom Gaji Bruto (Kosong sesuai permintaan frontend)
        `-${Math.floor(summary.total_potongan || 0).toLocaleString()}`, // Total Pot.Absen
        `-${Math.floor(summary.total_pot_hutang || 0).toLocaleString()}`,
        Math.floor(summary.total_basic || 0).toLocaleString(),
        Math.floor(summary.total_lembur || 0).toLocaleString(),
        Math.floor(summary.grand_total || 0).toLocaleString(),
      ],
    ],
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "right",
    },
  });

  // --- 5. PROFESSIONAL SUMMARY BLOCK ---
  let finalY = doc.lastAutoTable.finalY + 5;

  if (finalY > pageHeight - 75) {
    doc.addPage();
    finalY = 25;
  }

  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, finalY, pageWidth - margin * 2, 35, 3, 3, "F");
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, finalY, pageWidth - margin * 2, 35, 3, 3, "S");

  doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(50);
  doc.text("RINGKASAN PEMBAYARAN PENGGAJIAN", margin + 5, finalY + 7);

  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
  doc.text(
    "Total Gaji Bersih (Pokok + Tunjangan - Potongan):",
    margin + 5,
    finalY + 15,
  );
  doc.setFont("helvetica", "bold").setTextColor(0);
  doc.text(
    `Rp ${Math.floor(summary.total_basic).toLocaleString()}`,
    pageWidth - margin - 5,
    finalY + 15,
    { align: "right" },
  );

  doc.setFont("helvetica", "normal").setTextColor(100);
  doc.text("Total Akumulasi Upah Lembur Karyawan:", margin + 5, finalY + 21);
  doc.setFont("helvetica", "bold").setTextColor(245, 158, 11);
  doc.text(
    `+ Rp ${Math.floor(summary.total_lembur).toLocaleString()}`,
    pageWidth - margin - 5,
    finalY + 21,
    { align: "right" },
  );

  doc
    .setDrawColor(220)
    .line(margin + 5, finalY + 24, pageWidth - margin - 5, finalY + 24);

  doc.setFontSize(11).setFont("helvetica", "bold").setTextColor(0);
  doc.text(
    "TOTAL DANA YANG DIKELUARKAN (GRAND TOTAL):",
    margin + 5,
    finalY + 30,
  );
  doc.setFontSize(13).setTextColor(22, 101, 52);
  doc.text(
    `Rp ${Math.floor(summary.grand_total).toLocaleString()}`,
    pageWidth - margin - 5,
    finalY + 30,
    { align: "right" },
  );

  // --- 6. TANDA TANGAN DIREKTUR ---
  finalY += 43;
  const signatureX = pageWidth - margin - 60;
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(0);
  doc.text(
    `Labuapi, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    signatureX + 30,
    finalY,
    { align: "center" },
  );
  doc.text(
    "Direktur PT. Berkah Angsana Teknika,",
    signatureX + 30,
    finalY + 5,
    {
      align: "center",
    },
  );
  doc.setFont("helvetica", "bold").setFontSize(10);
  doc.text("JAYADI", signatureX + 30, finalY + 25, { align: "center" });
  doc
    .setLineWidth(0.3)
    .line(signatureX + 10, finalY + 26, signatureX + 50, finalY + 26);

  renderFooterAllPages(
    doc,
    "*Laporan ini dicetak otomatis melalui sistem PT. Berkah Angsana Teknika pada:",
    margin,
  );
  doc.save(`Rekapan_Gaji_${periodeFormal.replace(" ", "_")}.pdf`);
};

// ============ EXPORT PAYROLL UNTUK PENGAJUAN KE BANK ============

// Seragamkan nama bank: uppercase + alias umum
const BANK_ALIASES = {
  "BANK SYARIAH INDONESIA": "BSI",
  "BANK RAKYAT INDONESIA": "BRI",
  "BANK NEGARA INDONESIA": "BNI",
  "BANK CENTRAL ASIA": "BCA",
  "BANK MANDIRI": "MANDIRI",
  "BANK NTB SYARIAH": "NTB SYARIAH",
};
export const normalizeBankName = (name) => {
  if (!name) return "";
  const up = String(name).trim().replace(/\s+/g, " ").toUpperCase();
  if (BANK_ALIASES[up]) return BANK_ALIASES[up];
  return up.replace(/^BANK\s+/, "").replace(/^PT\.?\s+/, "");
};
export const exportPayrollBankPDF = (
  payrollData,
  rekeningMap,
  monthNames,
  selectedMonth,
  selectedYear,
  rekeningSumber = "",
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const periodeFormal = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
  const fmt = (n) => Math.floor(n || 0).toLocaleString("id-ID");

  // Header
  try {
    doc.addImage("/images/logo.png", "PNG", margin, 10, 20, 20);
  } catch (e) {}
  const textStartX = margin + 25;
  doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(0);
  doc.text("PT. BERKAH ANGSANA TEKNIKA", textStartX, 15);
  doc.setFontSize(8).setFont("helvetica", "normal").setTextColor(80);
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
  doc.setLineWidth(0.5).line(margin, 32, pageWidth - margin, 32);
  doc.setLineWidth(0.1).line(margin, 33, pageWidth - margin, 33);

  doc.setTextColor(0).setFontSize(10).setFont("helvetica", "bold");
  doc.text(
    "DATA PENGGAJIAN KARYAWAN PT. BERKAH ANGSANA TEKNIKA",
    pageWidth / 2,
    42,
    { align: "center" },
  );
  doc
    .setFontSize(10)
    .setFont("helvetica", "normal")
    .text(
      "Mohon dibayarkan melalui Bank Mandiri sesuai data terlampir",
      pageWidth / 2,
      47,
      { align: "center" },
    );
  doc.text(`Periode: ${periodeFormal}`, pageWidth / 2, 52, {
    align: "center",
  });

  let totalDebet = 0;
  const rows = payrollData.map((row, i) => {
    const net = Math.floor(
      (row.total_diterima || 0) -
        (row.potongan_hutang || 0) +
        (row.lembur || 0),
    );
    totalDebet += net;
    const rek = rekeningMap[row.id_pegawai] || {};
    return [
      i + 1,
      row.nama_lengkap,
      normalizeBankName(rek.nama_bank) || "-",
      rek.no_rekening || "-",
      fmt(net),
    ];
  });

  autoTable(doc, {
    startY: 57,
    head: [["No", "Nama Pegawai", "Bank", "No. Rekening", "Gaji Bersih (Rp)"]],
    body: rows,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: { top: 1, bottom: 1, left: 2, right: 2 },
    },
    headStyles: {
      fillColor: [239, 68, 68],
      halign: "center",
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: 40, fontStyle: "bold" },
      4: { cellWidth: 38, halign: "right", fontStyle: "bold" },
    },
    foot: [
      [
        { content: "TOTAL DEBET", colSpan: 4, styles: { halign: "center" } },
        fmt(totalDebet),
      ],
    ],
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "right",
    },
    margin: { bottom: 20 },
  });

  let y = doc.lastAutoTable.finalY + 8;
  if (y > pageHeight - 80) {
    doc.addPage();
    y = 25;
  }

  // Ringkasan debet
  doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(0);
  doc.text("Total Debet yang Dibutuhkan", margin, y);
  doc.text(":", margin + 55, y);
  // Highlight ala stabilo
  doc.setFont("helvetica", "bold").setFontSize(11);
  const debetText = `Rp ${fmt(totalDebet)}`;
  doc.setFillColor(255, 241, 54);
  doc.rect(margin + 57, y - 4.2, doc.getTextWidth(debetText) + 2, 5.8, "F");
  doc.text(debetText, margin + 58, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal").text("Rekening Sumber", margin, y + 6);
  doc.text(":", margin + 55, y + 6);
  doc
    .setFont("helvetica", "bold")
    .text(rekeningSumber || "-", margin + 58, y + 6);
  doc.setFont("helvetica", "normal").text("Jumlah Penerima", margin, y + 12);
  doc.text(":", margin + 55, y + 12);
  doc.text(`${payrollData.length} Orang`, margin + 58, y + 12);

  // Tanda tangan
  y += 26;
  const leftX = margin + 35;
  const rightX = pageWidth - margin - 35;
  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text(
    `Labuapi, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    rightX,
    y,
    { align: "center" },
  );
  y += 6;
  doc.text("Disetujui oleh,", leftX, y, { align: "center" });
  doc.text("Diajukan oleh,", rightX, y, { align: "center" });

  y += 25;
  doc.setFont("helvetica", "bold");
  doc.text("JAYADI", leftX, y, { align: "center" });
  doc.text("FITHRAH AINI", rightX, y, { align: "center" });
  doc.setLineWidth(0.3);
  doc.line(leftX - 25, y + 1.5, leftX + 25, y + 1.5);
  doc.line(rightX - 25, y + 1.5, rightX + 25, y + 1.5);
  doc.setFont("helvetica", "normal");
  doc.text("Direktur", leftX, y + 6, { align: "center" });
  doc.text("Bendahara", rightX, y + 6, { align: "center" });

  renderFooterAllPages(
    doc,
    "*Dokumen ini digenerate otomatis melalui sistem PT. Berkah Angsana Teknika pada:",
    margin,
  );
  doc.save(`Payroll_Bank_${periodeFormal.replace(" ", "_")}.pdf`);
};

// ============ EXPORT PAYROLL BANK KE EXCEL (.xlsx) ============
export const exportPayrollBankExcel = async (
  payrollData,
  rekeningMap,
  monthNames,
  selectedMonth,
  selectedYear,
  rekeningSumber = "",
) => {
  const ExcelJS = (await import("exceljs")).default;
  const periodeFormal = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Payroll Bank");

  ws.columns = [
    { key: "no", width: 6 },
    { key: "nama", width: 34 },
    { key: "bank", width: 16 },
    { key: "rek", width: 22 },
    { key: "net", width: 20 },
  ];

  const border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  const numFmt = "#,##0";

  // Kop surat (logo + identitas perusahaan)
  try {
    const resp = await fetch("/images/logo.png");
    const imgBuf = await resp.arrayBuffer();
    const imgId = wb.addImage({ buffer: imgBuf, extension: "png" });
    ws.addImage(imgId, { tl: { col: 0.15, row: 0.2 }, ext: { width: 70, height: 70 } });
  } catch (e) {}
  const kop = [
    ["PT. BERKAH ANGSANA TEKNIKA", { bold: true, size: 14 }],
    ["Perumahan Bukit Citra Kencana, Block B no. 35, Jl. Pengsong Raya,", { size: 9, color: { argb: "FF505050" } }],
    ["Desa Perampuan, Kecamatan Labuapi, Lombok Barat, NTB.", { size: 9, color: { argb: "FF505050" } }],
    ["Phone : 0370 785 3692, Email : admin@berkahangsana.com", { size: 9, color: { argb: "FF505050" } }],
  ];
  kop.forEach(([text, font], i) => {
    const r = i + 1;
    ws.mergeCells(`B${r}:E${r}`);
    ws.getCell(`B${r}`).value = text;
    ws.getCell(`B${r}`).font = font;
    ws.getCell(`B${r}`).alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(r).height = i === 0 ? 22 : 15;
  });
  // Garis ganda bawah kop
  ["A", "B", "C", "D", "E"].forEach((col) => {
    ws.getCell(`${col}5`).border = { bottom: { style: "double" } };
  });
  ws.getRow(5).height = 6;

  const titles = [
    ["DATA PENGGAJIAN KARYAWAN PT. BERKAH ANGSANA TEKNIKA", { bold: true, size: 11 }],
    ["Mohon dibayarkan melalui Bank Mandiri sesuai data terlampir", { size: 10 }],
    [`Periode: ${periodeFormal}`, { size: 10 }],
  ];
  titles.forEach(([text, font], i) => {
    const r = 7 + i;
    ws.mergeCells(`A${r}:E${r}`);
    ws.getCell(`A${r}`).value = text;
    ws.getCell(`A${r}`).font = font;
    ws.getCell(`A${r}`).alignment = { horizontal: "center" };
  });

  const header = ws.getRow(11);
  header.values = ["No", "Nama Pegawai", "Bank", "No. Rekening", "Gaji Bersih (Rp)"];
  header.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEF4444" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = border;
  });

  let totalDebet = 0;
  payrollData.forEach((row, i) => {
    const net = Math.floor(
      (row.total_diterima || 0) - (row.potongan_hutang || 0) + (row.lembur || 0),
    );
    totalDebet += net;
    const rek = rekeningMap[row.id_pegawai] || {};
    const r = ws.addRow([
      i + 1,
      row.nama_lengkap,
      normalizeBankName(rek.nama_bank) || "-",
      rek.no_rekening ? String(rek.no_rekening) : "-", // teks agar nol depan tidak hilang
      net,
    ]);
    r.eachCell((c) => (c.border = border));
    r.getCell(1).alignment = { horizontal: "center" };
    r.getCell(3).alignment = { horizontal: "center" };
    r.getCell(4).numFmt = "@";
    r.getCell(5).numFmt = numFmt;
  });

  const totalRow = ws.addRow(["TOTAL DEBET", "", "", "", totalDebet]);
  ws.mergeCells(`A${totalRow.number}:D${totalRow.number}`);
  totalRow.eachCell((c) => {
    c.font = { bold: true };
    c.border = border;
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
  });
  totalRow.getCell(1).alignment = { horizontal: "center" };
  totalRow.getCell(5).numFmt = numFmt;

  ws.addRow([]);
  const info = [
    ["Total Debet yang Dibutuhkan", totalDebet],
    ["Rekening Sumber", rekeningSumber || "-"],
    ["Jumlah Penerima", `${payrollData.length} Orang`],
  ];
  info.forEach(([label, val]) => {
    const r = ws.addRow(["", label, ":", val]);
    r.getCell(2).font = { bold: true };
    if (typeof val === "number") {
      r.getCell(4).numFmt = `"Rp "${numFmt}`;
      r.getCell(4).font = { bold: true };
      r.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF136" } };
      r.getCell(4).alignment = { horizontal: "left" };
    }
  });

  // Tanda tangan
  ws.addRow([]);
  const tgl = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const sign = (vals, font) => {
    const r = ws.addRow(["", vals[0], "", vals[1], ""]);
    ws.mergeCells(`D${r.number}:E${r.number}`);
    [2, 4].forEach((c) => {
      r.getCell(c).alignment = { horizontal: "center" };
      if (font) r.getCell(c).font = font;
    });
    return r;
  };
  sign(["", `Labuapi, ${tgl}`]);
  sign(["Disetujui oleh,", "Diajukan oleh,"]);
  for (let i = 0; i < 4; i++) ws.addRow([]);
  const nameRow = sign(["JAYADI", "FITHRAH AINI"], { bold: true, underline: true });
  nameRow.height = 18;
  sign(["Direktur", "Bendahara"]);

  ws.addRow([]);
  const foot = ws.addRow([
    `*Dokumen ini digenerate otomatis melalui sistem PT. Berkah Angsana Teknika pada: ${new Date().toLocaleString("id-ID")}`,
  ]);
  ws.mergeCells(`A${foot.number}:E${foot.number}`);
  foot.getCell(1).font = { italic: true, size: 8, color: { argb: "FF808080" } };

  // Pengaturan cetak A4
  ws.pageSetup = {
    paperSize: 9,
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Payroll_Bank_${periodeFormal.replace(" ", "_")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
