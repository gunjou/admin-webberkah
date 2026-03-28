import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportHutangToPDF = (filteredData, viewStatus) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const logoPath = "/images/logo.png";
  const statusLabel = viewStatus === "aktif" ? "BELUM LUNAS" : "SUDAH LUNAS";

  // --- 1. HEADER (HANYA HALAMAN 1) ---
  const renderHeader = () => {
    try {
      doc.addImage(logoPath, "PNG", margin, 10, 18, 18);
    } catch (e) {}

    const textStartX = margin + 22;
    doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(0);
    doc.text("PT. BERKAH ANGSANA TEKNIKA", textStartX, 15);

    doc.setFontSize(7.5).setFont("helvetica", "normal").setTextColor(80);
    doc.text(
      "Ruko Bukit Citra Kencana No.6, Jl. Pengsong Raya, Desa Perampuan,",
      textStartX,
      19,
    );
    doc.text("Kecamatan Labuapi, Lombok Barat, NTB.", textStartX, 22);
    doc.text("Phone : 0370 785 3692 | admin@berkahangsana.com", textStartX, 25);

    doc.setLineWidth(0.5).line(margin, 30, pageWidth - margin, 30);

    doc.setTextColor(0).setFontSize(10).setFont("helvetica", "bold");
    doc.text("LAPORAN DAFTAR PIUTANG PEGAWAI", pageWidth / 2, 38, {
      align: "center",
    });
    doc
      .setFontSize(8)
      .text(`STATUS: ${statusLabel}`, pageWidth / 2, 42, { align: "center" });
  };

  // --- 2. FOOTER (SEMUA HALAMAN) ---
  const renderFooter = (data) => {
    const footerY = pageHeight - 8;
    doc.setFont("helvetica", "italic").setFontSize(6.5).setTextColor(150);
    doc.text(
      `*Laporan ini dicetak otomatis melalui sistem PT. Berkah Angsana Teknika pada: ${new Date().toLocaleString("id-ID")}`,
      margin,
      footerY,
    );
    doc.text(`Halaman ${data.pageNumber}`, pageWidth - margin, footerY, {
      align: "right",
    });
  };

  renderHeader();

  // --- 3. DATA PREPARATION ---
  const tableColumn = [
    "No",
    "Nama Pegawai",
    "Trx",
    "Pinjaman",
    "Dibayar",
    "Sisa",
    "Update",
    "Keterangan",
  ];

  const tableRows = filteredData.map((item, index) => [
    index + 1,
    item.nama.toUpperCase(),
    item.total_hutang,
    Math.floor(item.total_pinjaman).toLocaleString("id-ID"),
    Math.floor(item.total_dibayar).toLocaleString("id-ID"),
    Math.floor(item.sisa_hutang).toLocaleString("id-ID"),
    item.last_update.split("T")[0], // Kolom Update
    item.keterangan || "-",
  ]);

  // --- 4. GENERATE TABLE (PORTRAIT TUNING) ---
  autoTable(doc, {
    startY: 48,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 6.5, cellPadding: 1.5 }, // Font sedikit dikecilkan agar muat 8 kolom
    headStyles: {
      fillColor: [239, 68, 68],
      halign: "center",
      fontStyle: "bold",
    },
    margin: { left: margin, right: margin, bottom: 20 },
    didDrawPage: (data) => renderFooter(data),
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 32 }, // Nama
      2: { cellWidth: 8, halign: "center" }, // Trx
      3: { cellWidth: 22, halign: "right" }, // Pinjaman
      4: { cellWidth: 22, halign: "right" }, // Dibayar
      5: {
        cellWidth: 22,
        halign: "right",
        fontStyle: "bold",
        textColor: [200, 0, 0],
      }, // Sisa
      6: { cellWidth: 18, halign: "center", fontSize: 6 }, // Update Terakhir
      7: { fontSize: 6, fontStyle: "italic" }, // Keterangan (Sisa Ruang)
    },
    foot: [
      [
        {
          content: "TOTAL AKUMULASI",
          colSpan: 3,
          styles: { halign: "center" },
        },
        Math.floor(
          filteredData.reduce((a, b) => a + b.total_pinjaman, 0),
        ).toLocaleString("id-ID"),
        Math.floor(
          filteredData.reduce((a, b) => a + b.total_dibayar, 0),
        ).toLocaleString("id-ID"),
        Math.floor(
          filteredData.reduce((a, b) => a + b.sisa_hutang, 0),
        ).toLocaleString("id-ID"),
        "",
        "",
      ],
    ],
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "right",
    },
  });

  // --- 5. SUMMARY & TANDA TANGAN ---
  let finalY = doc.lastAutoTable.finalY + 10;
  if (finalY > pageHeight - 55) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, finalY, 80, 22, 2, 2, "F");
  doc
    .setFontSize(9)
    .setFont("helvetica", "bold")
    .text("RINGKASAN PIUTANG", margin + 4, finalY + 6);

  const totalSisa = filteredData
    .reduce((a, b) => a + b.sisa_hutang, 0)
    .toLocaleString("id-ID");
  doc
    .setFontSize(9)
    .setFont("helvetica", "normal")
    .text(`Total Pegawai: ${filteredData.length}`, margin + 4, finalY + 12);
  doc
    .setFontSize(11)
    .setFont("helvetica", "bold")
    .setTextColor(239, 68, 68)
    .text(`SISA: Rp ${totalSisa}`, margin + 4, finalY + 18);

  doc.setTextColor(0);
  const signatureX = pageWidth - margin - 40;
  doc.setFontSize(8.5).setFont("helvetica", "normal");
  doc.text(
    `Perampuan, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
    signatureX + 15,
    finalY + 5,
    { align: "center" },
  );
  doc.text(
    "Direktur PT. Berkah Angsana Teknika,",
    signatureX + 15,
    finalY + 10,
    {
      align: "center",
    },
  );
  doc
    .setFont("helvetica", "bold")
    .text("JAYADI", signatureX + 15, finalY + 30, { align: "center" });
  doc
    .setLineWidth(0.3)
    .line(signatureX + 0, finalY + 31, signatureX + 30, finalY + 31);

  doc.save(`Laporan_Hutang_Portrait_${statusLabel.replace(" ", "_")}.pdf`);
};
