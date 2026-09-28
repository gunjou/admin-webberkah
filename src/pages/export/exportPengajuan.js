import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (date) =>
  !date
    ? "-"
    : new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

const getPriorityLabel = (priority) =>
  ({
    NORMAL: "Normal",
    URGENT: "Urgent",
    TOP_URGENT: "Top Urgent",
  })[priority] ||
  priority ||
  "-";

const getStatusLabel = (status) =>
  ({
    ACTIVE: "Aktif",
    REQUESTED: "Requested",
    REVIEWED: "Reviewed",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    PAID: "Paid",
  })[status] ||
  status ||
  "-";

const STATUS_STYLE = {
  REQUESTED: {
    label: "Requested",
    light: "#CA8A04",
    dark: "#FACC15",
  },

  REVIEWED: {
    label: "Reviewed",
    light: "#059669",
    dark: "#12a878",
  },

  APPROVED: {
    label: "Approved",
    light: "#16A34A",
    dark: "#7CE9A4",
  },

  REJECTED: {
    label: "Rejected",
    light: "#B91C1C",
    dark: "#FCA5A5",
  },

  PAID: {
    label: "Paid",
    light: "#0284C7",
    dark: "#7DD3FC",
  },

  ACTIVE: {
    label: "Aktif",
    light: "#A91D24",
    dark: "#B77171",
  },
};

const PRIORITY_STYLE = {
  NORMAL: {
    label: "Normal",
    light: "#52525B",
    dark: "#A1A1AA",
  },

  URGENT: {
    label: "Urgent",
    light: "#B45309",
    dark: "#FCD34D",
  },

  TOP_URGENT: {
    label: "Top Urgent",
    light: "#B91C1C",
    dark: "#FCA5A5",
  },
};

const WORK_LINE_HEIGHT = {
  job: 4.2,
  note: 4.1,
  item: 3.6,
  "item-detail": 3.6,
  spacer: 1.2,
};

const hexToRgb = (hex) => {
  const value = parseInt(hex.replace("#", ""), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

// =========================
// FORMAT ITEM
// =========================

const formatItems = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.flatMap((item, index) => {
    const itemNo = item.item_no || index + 1;
    const keterangan = item.keterangan || "-";
    const jumlah = item.jumlah ?? 0;
    const unit = item.unit || "";
    const hargaSatuan = formatCurrency(item.harga_satuan);

    const totalValue =
      item.total ??
      (Number(item.harga_satuan) || 0) * (Number(item.jumlah) || 0);

    const total = formatCurrency(totalValue);

    const quantityLabel = unit
      ? /^\d/.test(String(unit))
        ? unit
        : `${jumlah} ${unit}`
      : `${jumlah}`;

    return [
      {
        type: "item",
        text: `${itemNo}. ${keterangan}`,
      },
      {
        type: "item-detail",
        text: `   ${quantityLabel} × ${hargaSatuan} = ${total}`,
      },
    ];
  });
};

// =========================
// BUILD PEKERJAAN CONTENT
// =========================

const buildWorkContent = (rowData) => {
  const pekerjaan = rowData?.nama_pekerjaan || "-";
  const note = rowData?.note || "";
  const items = formatItems(rowData?.items);

  const content = [
    {
      type: "job",
      text: pekerjaan,
    },
  ];

  if (note.trim()) {
    content.push({
      type: "spacer",
      text: "",
    });

    const noteLines = String(note).split(/\r?\n/);

    noteLines.forEach((line) => {
      content.push({
        type: "note",
        text: line || " ",
      });
    });
  }

  if (items.length > 0) {
    content.push({
      type: "spacer",
      text: "",
    });

    content.push(...items);
  }

  return content;
};

// =========================
// EXPORT PDF
// =========================

export const exportPengajuanPDF = (
  data = [],
  {
    filters = {},
    sortField = "",
    sortDirection = "",
    departmentName = "",
  } = {},
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // =========================
  // MARGIN HEADER & TABLE
  // =========================

  const margin = 12;
  // const contentWidth = pageWidth - margin * 2;
  const logoPath = "/images/logo.png";

  // =========================
  // HEADER PERUSAHAAN
  // =========================

  try {
    doc.addImage(logoPath, "PNG", margin, 8, 18, 18);
  } catch (error) {
    console.warn("Logo tidak ditemukan, melanjutkan tanpa logo.");
  }

  const textStartX = margin + 23;

  doc.setTextColor(44, 33, 41);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  doc.text("PT. BERKAH ANGSANA TEKNIKA", textStartX, 13);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  doc.text(
    "Perumahan Bukit Citra Kencana, Block B no. 35, Jl. Pengsong Raya,",
    textStartX,
    18,
  );

  doc.text(
    "Desa Perampuan, Kecamatan Labuapi, Lombok Barat, NTB.",
    textStartX,
    22,
  );

  doc.text(
    "Phone : 0370 785 3692, Email : admin@berkahangsana.com",
    textStartX,
    26,
  );

  // =========================
  // DOUBLE LINE
  // =========================

  doc.setDrawColor(44, 33, 41);
  doc.setLineWidth(0.5);

  doc.line(margin, 30, pageWidth - margin, 30);

  doc.setLineWidth(0.1);

  doc.line(margin, 31, pageWidth - margin, 31);

  // =========================
  // TITLE
  // =========================

  doc.setTextColor(44, 33, 41);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  doc.text("LIST APPROVAL REQUEST", pageWidth / 2, 41, {
    align: "center",
  });

  // =========================
  // FILTER INFO
  // =========================

  const infoY = 50;

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  let filterX = margin;

  if (filters.departemen) {
    doc.setFont("helvetica", "bold");

    doc.text("DEPARTEMEN", filterX, infoY);

    doc.setFont("helvetica", "normal");

    doc.text(`: ${filters.departemen}`, filterX + 27, infoY);

    filterX += 85;
  }

  if (filters.tanggal_mulai || filters.tanggal_selesai) {
    doc.setFont("helvetica", "bold");

    doc.text("PERIODE", filterX, infoY);

    let periode = "-";

    if (filters.tanggal_mulai && filters.tanggal_selesai) {
      periode = `${formatDate(filters.tanggal_mulai)} - ${formatDate(
        filters.tanggal_selesai,
      )}`;
    } else if (filters.tanggal_mulai) {
      periode = `Mulai ${formatDate(filters.tanggal_mulai)}`;
    } else if (filters.tanggal_selesai) {
      periode = `Sampai ${formatDate(filters.tanggal_selesai)}`;
    }

    doc.setFont("helvetica", "normal");

    doc.text(`: ${periode}`, filterX + 19, infoY);
  }

  // =========================
  // TABLE
  // =========================

  autoTable(doc, {
    startY:
      filters.departemen || filters.tanggal_mulai || filters.tanggal_selesai
        ? 57
        : 50,

    pageBreak: "auto",
    rowPageBreak: "avoid",

    head: [
      [
        "NO",
        "NO. PENGAJUAN",
        "TANGGAL",
        "PEMOHON",
        "PEKERJAAN & ITEM",
        "PRIORITY",
        "TOTAL",
        "STATUS",
      ],
    ],

    body: data.map((item, index) => {
      return [
        String(index + 1).padStart(2, "0"),

        item.request_number || "-",

        formatDate(item.tanggal_request),

        item.nama_pegawai ||
          item.nama_panggilan ||
          item.pegawai?.nama_panggilan ||
          "-",

        {
          type: "work",
          nama_pekerjaan: item.nama_pekerjaan,
          note: item.note,
          items: item.items || [],
        },

        getPriorityLabel(item.priority),

        formatCurrency(item.total_amount),

        getStatusLabel(item.status),
      ];
    }),

    theme: "striped",

    styles: {
      font: "helvetica",
      fontSize: 7,
      textColor: [55, 55, 55],

      cellPadding: {
        top: 3,
        right: 2.5,
        bottom: 3,
        left: 2.5,
      },

      lineColor: [220, 220, 220],
      lineWidth: 0.1,

      valign: "middle",
      overflow: "linebreak",
    },

    // =========================
    // HEADER MERAH
    // =========================

    headStyles: {
      fillColor: [185, 28, 28],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",

      cellPadding: {
        top: 3.5,
        bottom: 3.5,
        left: 2,
        right: 2,
      },
    },

    bodyStyles: {
      fontSize: 7,
      valign: "middle",
      minCellHeight: 12,
    },

    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },

    // =========================
    // COLUMN WIDTH
    // TOTAL = 273 MM
    // SESUAI MARGIN 12 MM
    // =========================

    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
      },

      1: {
        cellWidth: 29,
      },

      2: {
        cellWidth: 24,
        halign: "center",
      },

      // PEMOHON DIKURANGI
      3: {
        cellWidth: 29,
      },

      // PEKERJAAN DIPERLUAS
      4: {
        cellWidth: 89,
        halign: "left",
        valign: "top",
      },

      5: {
        cellWidth: 27,
        halign: "center",
      },

      // TOTAL
      6: {
        cellWidth: 37,
        halign: "right",
        fontStyle: "bold",
        fontSize: 9,
      },

      7: {
        cellWidth: 28,
        halign: "center",
      },
    },

    margin: {
      top: 10,
      left: margin,
      right: margin,
      bottom: 20,
    },

    // =========================
    // PARSE CELL
    // =========================

    didParseCell: (hookData) => {
      if (hookData.section !== "body") return;

      const rowData = hookData.row.raw;

      // =========================
      // PEKERJAAN & ITEM
      // =========================

      if (hookData.column.index === 4) {
        const workData = hookData.cell.raw;

        const workContent = buildWorkContent(workData);

        const cellWidth = Number(hookData.cell.width) || 89;
        const textWidth = cellWidth - 5;

        const wrappedLines = [];

        workContent.forEach((line) => {
          let fontStyle = "normal";
          let fontSize = 7;

          if (line.type === "job") {
            fontStyle = "bold";
            fontSize = 7.5;
          }

          if (line.type === "note") {
            fontStyle = "italic";
            fontSize = 7.5;
          }

          if (line.type === "item-detail") {
            fontStyle = "normal";
            fontSize = 6.5;
          }

          if (line.type === "spacer") {
            wrappedLines.push({
              type: "spacer",
              text: "",
              fontSize: 7,
              fontStyle: "normal",
            });

            return;
          }

          doc.setFont("helvetica", fontStyle);
          doc.setFontSize(fontSize);

          const splitLines = doc.splitTextToSize(
            String(line.text || ""),
            textWidth,
          );

          splitLines.forEach((text) => {
            wrappedLines.push({
              type: line.type,
              text,
              fontSize,
              fontStyle,
            });
          });
        });

        hookData.cell._workLines = wrappedLines;

        // Dipakai AutoTable untuk menghitung tinggi row.
        // Teks asli akan disembunyikan di willDrawCell
        // dan digambar manual di didDrawCell.
        hookData.cell.text = wrappedLines.map((line) => line.text);

        hookData.cell.styles.fontSize = 7;

        hookData.cell.styles.cellPadding = {
          top: 4,
          right: 2.5,
          bottom: 4,
          left: 2.5,
        };

        hookData.cell.styles.valign = "top";
        hookData.cell.styles.halign = "left";
        hookData.cell.styles.overflow = "linebreak";

        // const estimatedHeight = wrappedLines.reduce((height, line) => {
        //   if (line.type === "spacer") {
        //     return height + 1.2;
        //   }

        //   if (line.type === "job") {
        //     return height + 3.6;
        //   }

        //   if (line.type === "note") {
        //     return height + 2.9;
        //   }

        //   if (line.type === "item") {
        //     return height + 3.2;
        //   }

        //   if (line.type === "item-detail") {
        //     return height + 3.0;
        //   }

        //   return height + 3.2;
        // }, 8);

        const estimatedHeight = wrappedLines.reduce((height, line) => {
          return height + (WORK_LINE_HEIGHT[line.type] || 3.6);
        }, 8);

        hookData.cell.styles.minCellHeight = Math.max(
          hookData.cell.styles.minCellHeight || 0,
          estimatedHeight,
        );
      }

      // =========================
      // TOTAL
      // =========================

      if (hookData.column.index === 6) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fontSize = 9;
        hookData.cell.styles.halign = "right";
        hookData.cell.styles.valign = "middle";

        hookData.cell.styles.cellPadding = {
          top: 3,
          right: 2.5,
          bottom: 3,
          left: 2,
        };
      }

      // =========================
      // PRIORITY
      // STYLE TIDAK DIUBAH
      // =========================

      if (hookData.column.index === 5) {
        const style =
          PRIORITY_STYLE[
            rowData[5] === undefined ? "" : data[hookData.row.index]?.priority
          ];

        if (style) {
          const bg = hexToRgb(style.light);

          hookData.cell.styles.fillColor = [bg.r, bg.g, bg.b];

          hookData.cell.styles.textColor = [255, 255, 255];

          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.halign = "center";
          hookData.cell.styles.valign = "middle";
        }
      }

      // =========================
      // STATUS
      // STYLE TIDAK DIUBAH
      // =========================

      if (hookData.column.index === 7) {
        const style = STATUS_STYLE[data[hookData.row.index]?.status];

        if (style) {
          const bg = hexToRgb(style.light);

          hookData.cell.styles.fillColor = [bg.r, bg.g, bg.b];

          hookData.cell.styles.textColor = [255, 255, 255];

          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.halign = "center";
          hookData.cell.styles.valign = "middle";
        }
      }
    },

    // =========================
    // HILANGKAN TEXT DEFAULT
    // PADA PEKERJAAN & ITEM
    // =========================

    willDrawCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 4) {
        hookData.cell.text = [];
      }
    },

    // =========================
    // DRAW PEKERJAAN & ITEM
    // =========================

    didDrawCell: (hookData) => {
      if (hookData.section !== "body" || hookData.column.index !== 4) {
        return;
      }

      const lines = hookData.cell._workLines || [];

      if (lines.length === 0) return;

      const leftPadding = 2.5;
      const topPadding = 6; // top padding item di dalam kolom

      const textX = hookData.cell.x + leftPadding;
      let textY = hookData.cell.y + topPadding;

      lines.forEach((line) => {
        if (line.type === "spacer") {
          textY += 1.2;

          return;
        }

        let fontStyle = "normal";
        let fontSize = 7;
        let textColor = [55, 55, 55];

        let lineHeight = WORK_LINE_HEIGHT[line.type] || 3.6;

        if (line.type === "job") {
          fontStyle = "bold";
          fontSize = 7.5;
          textColor = [35, 35, 35];
        }

        if (line.type === "note") {
          fontStyle = "italic";
          fontSize = 7.5;
          textColor = [35, 35, 35];
        }

        if (line.type === "item") {
          fontStyle = "normal";
          fontSize = 7;
          textColor = [55, 55, 55];
        }

        if (line.type === "item-detail") {
          fontStyle = "normal";
          fontSize = 6.5;
          textColor = [90, 90, 90];
        }

        doc.setFont("helvetica", fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);

        doc.text(line.text, textX, textY);

        textY += lineHeight;
      });

      // Reset style agar tidak memengaruhi cell berikutnya.
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(55, 55, 55);
    },
  });

  // =========================
  // TOTAL NILAI PENGAJUAN
  // =========================

  const totalAmount = data.reduce(
    (total, item) => total + (Number(item.total_amount) || 0),
    0,
  );

  const finalY = doc.lastAutoTable?.finalY || 50;

  const boxWidth = 73;
  const boxHeight = 13;

  const boxX = pageWidth - margin - boxWidth;
  const boxY = finalY + 6;

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.2);

  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "FD");

  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  doc.text("TOTAL NILAI PENGAJUAN:", boxX + 4, boxY + 8);

  doc.setTextColor(185, 28, 28);
  doc.setFontSize(10);

  doc.text(formatCurrency(totalAmount), boxX + boxWidth - 4, boxY + 8, {
    align: "right",
  });

  // =========================
  // FOOTER
  // =========================

  const totalPages = doc.internal.getNumberOfPages();
  const generatedAt = new Date().toLocaleString("id-ID");

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    const footerY = pageHeight - 8;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);

    doc.text(
      `*Dokumen ini dicetak otomatis melalui sistem PT. Berkah Angsana Teknika pada: ${generatedAt}`,
      margin,
      footerY,
    );

    doc.text(`Halaman ${page}/${totalPages}`, pageWidth - margin, footerY, {
      align: "right",
    });
  }

  // =========================
  // SAVE
  // =========================

  const date = new Date().toISOString().split("T")[0];

  doc.save(`Daftar_Pengajuan_${date}.pdf`);
};
