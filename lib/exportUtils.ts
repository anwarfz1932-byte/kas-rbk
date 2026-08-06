import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah, formatDateIndonesian } from './formatters';

export interface TransactionData {
  id?: string;
  tanggal: string;
  jenis: 'Pemasukan' | 'Pengeluaran';
  nominal: number;
  keterangan: string;
  anggota?: string;
  anggotaNama?: string;
}

export function exportTransactionsToExcel(
  transactions: TransactionData[],
  filename: string = 'Laporan_Kas_Remaja'
) {
  const excelData = transactions.map((t, idx) => ({
    'No': idx + 1,
    'Tanggal': formatDateIndonesian(t.tanggal),
    'Jenis Transaksi': t.jenis,
    'Nominal (Rp)': t.nominal,
    'Keterangan': t.keterangan,
    'Nama Anggota': t.anggotaNama || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Transaksi');

  // Adjust column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 18 }, // Tanggal
    { wch: 18 }, // Jenis
    { wch: 18 }, // Nominal
    { wch: 30 }, // Keterangan
    { wch: 22 }, // Anggota
  ];

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportReportToPDF(
  transactions: TransactionData[],
  summary: { totalPemasukan: number; totalPengeluaran: number; saldoAkhir: number },
  periodeLabel: string = 'Semua Periode'
) {
  const doc = new jsPDF();

  // Header banner / title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // Red 700 (Merah Putih theme)
  doc.text('PENGELOLA UANG KAS REMAJA', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text('Laporan Pertanggungjawaban Keuangan Kas Organisasi', 14, 24);
  doc.text(`Periode Laporan : ${periodeLabel}`, 14, 30);
  doc.text(`Tanggal Cetak     : ${formatDateIndonesian(new Date().toISOString().slice(0, 10))}`, 14, 36);

  // Decorative Accent Bar (Red)
  doc.setFillColor(220, 38, 38); // Red 600
  doc.rect(14, 40, 182, 1.5, 'F');

  // Summary Table in PDF
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RINGKASAN REKAPITULASI KAS', 14, 48);

  autoTable(doc, {
    startY: 52,
    head: [['Total Pemasukan', 'Total Pengeluaran', 'Saldo Akhir Kas']],
    body: [
      [
        formatRupiah(summary.totalPemasukan),
        formatRupiah(summary.totalPengeluaran),
        formatRupiah(summary.saldoAkhir),
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [185, 28, 28], // Red 700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 10,
      fontStyle: 'bold',
      textColor: [15, 23, 42],
    },
  });

  // Position for Transactions Table
  const lastTableY = (doc as any).lastAutoTable?.finalY ?? 70;
  const startTxY = lastTableY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RINCIAN TRANSAKSI KAS', 14, startTxY);

  const tableBody = transactions.map((t, idx) => [
    idx + 1,
    formatDateIndonesian(t.tanggal),
    t.jenis,
    formatRupiah(t.nominal),
    t.keterangan || '-',
    t.anggotaNama || '-',
  ]);

  autoTable(doc, {
    startY: startTxY + 4,
    head: [['No', 'Tanggal', 'Jenis', 'Nominal', 'Keterangan', 'Anggota']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [220, 38, 38], // Red 600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 26 },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 50 },
      5: { cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'Pemasukan') {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // Tanda Tangan / Signature Block at the end
  const finalTableY = (doc as any).lastAutoTable?.finalY ?? 150;
  let signatureY = finalTableY + 15;

  // Check page overflow for signature
  if (signatureY > 230) {
    doc.addPage();
    signatureY = 25;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const todayStr = formatDateIndonesian(new Date().toISOString().slice(0, 10));
  doc.text(`Mengetahui, ${todayStr}`, 140, signatureY);

  doc.setFont('helvetica', 'bold');
  doc.text('Ketua Karang Taruna / Remaja', 20, signatureY + 6);
  doc.text('Bendahara Kas Remaja', 140, signatureY + 6);

  doc.setFont('helvetica', 'normal');
  doc.text('( ..................................... )', 20, signatureY + 28);
  doc.text('( ..................................... )', 140, signatureY + 28);

  // Footer page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Halaman ${i} dari ${pageCount} — Dokumen Resmi Pengelola Uang Kas Remaja`,
      105,
      288,
      { align: 'center' }
    );
  }

  doc.save(`Laporan_Kas_Remaja_${new Date().toISOString().slice(0, 10)}.pdf`);
}
