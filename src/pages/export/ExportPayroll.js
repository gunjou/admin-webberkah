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

  const periode = `${monthNames[selectedMonth - 1]} ${selectedYear}`;

  // 1. Header Laporan
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PENGGAJIAN PT. BERKAH ANGSANA TEKNIKA", 14, 15);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode: ${periode}`, 14, 21);
  // penyesuaian format tanggal dengan locale Indonesia
  const now = new Date();
  const tgl = String(now.getDate()).padStart(2, "0");
  const bln = String(now.getMonth() + 1).padStart(2, "0");
  const thn = now.getFullYear();
  const jam = String(now.getHours()).padStart(2, "0");
  const mnt = String(now.getMinutes()).padStart(2, "0");
  const dtk = String(now.getSeconds()).padStart(2, "0");

  doc.text(`Dicetak: ${tgl}/${bln}/${thn} ${jam}:${mnt}:${dtk}`, 14, 26);

  // 2. Data Preparation
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
    "Pot.Abs",
    "Pot.Hut",
    "Subtotal",
    "Lembur",
    "TOTAL NET",
  ];

  const tableRows = payrollData.map((row, index) => {
    let statusSingkat = row.nama_status;
    if (row.nama_status === "Pegawai Tetap") statusSingkat = "PT";
    else if (row.nama_status === "Pegawai Tidak Tetap") statusSingkat = "PTT";
    else if (row.nama_status?.toLowerCase().includes("magang"))
      statusSingkat = "M";

    const potAbsen = Math.floor(row.total_potongan || 0);
    const potHutang = Math.floor(row.potongan_hutang || 0);

    return [
      index + 1,
      row.nama_lengkap,
      statusSingkat,
      row.total_hari_kerja,
      row.total_sakit || 0, // Index 4
      row.total_izin || 0, // Index 5
      row.total_cuti || 0, // Index 6
      row.total_alpha || 0, // Index 7
      Math.floor(row.gapok).toLocaleString(),
      Math.floor(row.t_jab).toLocaleString(),
      Math.floor(row.t_mkn).toLocaleString(),
      Math.floor(row.t_trp).toLocaleString(),
      Math.floor(row.t_khs || 0).toLocaleString(),
      // Tambahkan simbol minus jika nilai > 0
      potAbsen > 0 ? `-${potAbsen.toLocaleString()}` : "0", // Index 13
      potHutang > 0 ? `-${potHutang.toLocaleString()}` : "0", // Index 14
      Math.floor(row.total_diterima - potHutang).toLocaleString(),
      Math.floor(row.lembur || 0).toLocaleString(),
      Math.floor(
        row.total_diterima - potHutang + (row.lembur || 0),
      ).toLocaleString(),
    ];
  });

  // 3. Generate Table
  autoTable(doc, {
    startY: 32,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 6, cellPadding: 1.5, font: "helvetica" },
    headStyles: {
      fillColor: [239, 68, 68],
      halign: "center",
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 28 },
      2: { cellWidth: 8, halign: "center" },
      3: { cellWidth: 7, halign: "center" },
      4: { cellWidth: 5, halign: "center" },
      5: { cellWidth: 5, halign: "center" },
      6: { cellWidth: 5, halign: "center" },
      7: { cellWidth: 5, halign: "center" },
    },
    didParseCell: (data) => {
      // --- LOGIKA BODY (Tetap Sama) ---
      if (data.section === "body" && data.column.index >= 8) {
        data.cell.styles.halign = "right";
      }

      // Logika Warna SICA & Potongan di Body
      if (data.section === "body") {
        const numVal = parseInt(data.cell.raw);
        if (numVal > 0) {
          if (data.column.index === 4) {
            data.cell.styles.textColor = [34, 197, 94];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.column.index === 5) {
            data.cell.styles.textColor = [234, 179, 8];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.column.index === 6) {
            data.cell.styles.textColor = [0, 0, 0];
            data.cell.styles.fontStyle = "bold";
          }
          if (data.column.index === 7) {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = "bold";
          }
        }
        // Warna merah untuk potongan di baris pegawai
        if (
          (data.column.index === 13 || data.column.index === 14) &&
          data.cell.raw.toString().startsWith("-")
        ) {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }

      // --- LOGIKA FOOTER (Penyesuaian Baru) ---
      if (data.section === "foot") {
        // Index 13 = Pot.Abs, Index 14 = Pot.Hut
        if (data.column.index === 13 || data.column.index === 14) {
          // Cek jika nilainya bukan "0" atau mengandung tanda minus
          if (data.cell.text[0] !== "0") {
            data.cell.styles.textColor = [239, 68, 68]; // Set warna merah
          }
        }
      }
    },
    foot: [
      [
        {
          content: "TOTAL PER KOLOM",
          colSpan: 8,
          styles: { halign: "center", fontStyle: "bold" },
        },
        "",
        "",
        "",
        "",
        "",
        // Pastikan index kolom ini pas dengan index 13 dan 14
        `-${Math.floor(summary.total_potongan || 0).toLocaleString()}`,
        `-${Math.floor(summary.total_pot_hutang || 0).toLocaleString()}`,
        Math.floor(summary.total_basic).toLocaleString(),
        Math.floor(summary.total_lembur).toLocaleString(),
        Math.floor(summary.grand_total).toLocaleString(),
      ],
    ],
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "right",
    },
  });

  // 4. SUMMARY BLOCK (Tetap sama)
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, finalY - 5, 283, finalY - 5);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("REKAPITULASI PEMBAYARAN:", 14, finalY);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Total Gaji (Pokok + Tunjangan - Potongan):", 14, finalY + 8);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Rp ${Math.floor(summary.total_basic).toLocaleString()}`,
    283,
    finalY + 8,
    { align: "right" },
  );

  doc.setFont("helvetica", "normal");
  doc.text("Total Upah Lembur Karyawan:", 14, finalY + 15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 140, 0);
  doc.text(
    `+ Rp ${Math.floor(summary.total_lembur).toLocaleString()}`,
    283,
    finalY + 15,
    { align: "right" },
  );

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("TOTAL DANA YANG DIKELUARKAN:", 14, finalY + 26);
  doc.setFontSize(16);
  doc.setTextColor(34, 197, 94);
  doc.text(
    `Rp ${Math.floor(summary.grand_total).toLocaleString()}`,
    283,
    finalY + 26,
    { align: "right" },
  );

  doc.save(`Rekapan_Gaji_${periode.replace(" ", "_")}.pdf`);
};
