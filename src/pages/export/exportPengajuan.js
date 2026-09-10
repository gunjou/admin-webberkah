import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date) =>
  !date
    ? "-"
    : new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

const getPriorityLabel = (priority) =>
  ({ NORMAL: "Normal", URGENT: "Urgent", TOP_URGENT: "Top Urgent" })[
    priority
  ] ||
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
  REQUESTED: { label: "Requested", light: "#CA8A04", dark: "#FACC15" },
  REVIEWED: { label: "Reviewed", light: "#059669", dark: "#12a878" },
  APPROVED: { label: "Approved", light: "#16A34A", dark: "#7CE9A4" },
  REJECTED: { label: "Rejected", light: "#B91C1C", dark: "#FCA5A5" },
  PAID: { label: "Paid", light: "#0284C7", dark: "#7DD3FC" },
  ACTIVE: { label: "Aktif", light: "#A91D24", dark: "#B77171" },
};

const PRIORITY_STYLE = {
  NORMAL: { label: "Normal", light: "#52525B", dark: "#A1A1AA" },
  URGENT: { label: "Urgent", light: "#B45309", dark: "#FCD34D" },
  TOP_URGENT: { label: "Top Urgent", light: "#B91C1C", dark: "#FCA5A5" },
};

const hexToRgb = (hex) => {
  const value = parseInt(hex.replace("#", ""), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

export const exportPengajuanPDF = (data = [], filters = {}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
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
  // Tidak menampilkan STATUS Active
  // jika filters.status tidak dipilih
  // =========================
  const infoY = 50;

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  let filterX = margin;

  //   if (filters.status) {
  //     doc.setFont("helvetica", "bold");
  //     doc.text("STATUS", filterX, infoY);

  //     doc.setFont("helvetica", "normal");
  //     doc.text(`: ${getStatusLabel(filters.status)}`, filterX + 18, infoY);

  //     filterX += 65;
  //   }

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

    head: [
      [
        "NO",
        "NO. PENGAJUAN",
        "TANGGAL",
        "PEMOHON",
        "PEKERJAAN",
        "PRIORITY",
        "TOTAL",
        "STATUS",
      ],
    ],

    body: data.map((item, index) => [
      String(index + 1).padStart(2, "0"),
      item.request_number || "-",
      formatDate(item.tanggal_request),
      item.nama_pegawai || item.nama_panggilan || "-",
      item.nama_pekerjaan || "-",
      getPriorityLabel(item.priority),
      formatCurrency(item.total_amount),
      getStatusLabel(item.status),
    ]),

    theme: "striped",

    styles: {
      font: "helvetica",
      fontSize: 7,
      textColor: [55, 55, 55],
      cellPadding: {
        top: 2.5,
        right: 2,
        bottom: 2.5,
        left: 2,
      },
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
      valign: "middle",
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
        top: 3,
        bottom: 3,
        left: 2,
        right: 2,
      },
    },

    bodyStyles: {
      fontSize: 7,
      valign: "middle",
    },

    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },

    // =========================
    // COLUMN WIDTH
    // =========================
    columnStyles: {
      0: {
        cellWidth: 10,
        halign: "center",
      },
      1: {
        cellWidth: 31,
      },
      2: {
        cellWidth: 25,
        halign: "center",
      },
      3: {
        cellWidth: 39,
      },
      4: {
        cellWidth: 72,
      },
      5: {
        cellWidth: 29,
        halign: "center",
      },
      6: {
        cellWidth: 39,
        halign: "right",
      },
      7: {
        cellWidth: 28,
        halign: "center",
      },
    },

    margin: {
      left: margin,
      right: margin,
      bottom: 15,
    },

    // =========================
    // HIGHLIGHT PRIORITY & STATUS
    // =========================
    didParseCell: (hookData) => {
      if (hookData.section !== "body") return;

      const rowData = data[hookData.row.index];

      // PRIORITY
      if (hookData.column.index === 5) {
        const style = PRIORITY_STYLE[rowData.priority];

        if (style) {
          const bg = hexToRgb(style.light);

          hookData.cell.styles.fillColor = [bg.r, bg.g, bg.b];

          hookData.cell.styles.textColor = [255, 255, 255];
          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.halign = "center";
          hookData.cell.styles.valign = "middle";
        }
      }

      // STATUS
      if (hookData.column.index === 7) {
        const style = STATUS_STYLE[rowData.status];

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
  });

  // =========================
  // TOTAL NILAI PENGAJUAN
  // =========================
  const totalAmount = data.reduce(
    (total, item) => total + (Number(item.total_amount) || 0),
    0,
  );

  const finalY = doc.lastAutoTable?.finalY || 57;

  const boxX = pageWidth - 85;
  const boxY = finalY + 5;
  const boxWidth = 73;
  const boxHeight = 13;

  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(215, 215, 215);
  doc.setLineWidth(0.2);

  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "FD");

  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);

  doc.text("TOTAL NILAI PENGAJUAN", boxX + 4, boxY + 8);

  doc.setTextColor(185, 28, 28);
  doc.setFontSize(8.5);

  doc.text(formatCurrency(totalAmount), boxX + boxWidth - 4, boxY + 8, {
    align: "right",
  });

  // =========================
  // FOOTER
  // =========================
  const footerY = pageHeight - 8;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);

  doc.text(
    `*Dokumen ini dicetak otomatis melalui sistem PT. Berkah Angsana Teknika pada: ${new Date().toLocaleString("id-ID")}`,
    margin,
    footerY,
  );

  doc.text(
    `Halaman 1/${doc.internal.getNumberOfPages()}`,
    pageWidth - margin,
    footerY,
    {
      align: "right",
    },
  );

  doc.save(`Daftar_Pengajuan_${new Date().toISOString().split("T")[0]}.pdf`);
};
