import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // --- 2. FOOTER STICKY UNTUK SEMUA HALAMAN ---
  const renderEveryPageFooter = (data) => {
    const footerY = pageHeight - 10;
    doc.setFont("helvetica", "italic").setFontSize(7).setTextColor(150);
    doc.text(
      `*Laporan ini dicetak otomatis melalui sistem PT. Berkah Angsana Teknika pada: ${new Date().toLocaleString("id-ID")}`,
      margin,
      footerY,
    );
    doc.text(`Halaman ${data.pageNumber}`, pageWidth - margin, footerY, {
      align: "right",
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
    didDrawPage: (data) => renderEveryPageFooter(data),
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
    `Perampuan, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
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

  doc.save(`Rekapan_Gaji_${periodeFormal.replace(" ", "_")}.pdf`);
};
