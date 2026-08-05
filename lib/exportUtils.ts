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
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text('PENGELOLA UANG KAS REMAJA', 14, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Laporan Keuangan Kas Organisasi`, 14, 25);
  doc.text(`Periode: ${periodeLabel}`, 14, 31);
  doc.text(`Tanggal Cetak: ${formatDateIndonesian(new Date().toISOString().slice(0, 10))}`, 14, 37);

  // Divider line
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // Summary Cards Table in PDF
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RINGKASAN KAS', 14, 50);

  autoTable(doc, {
    startY: 53,
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
      fillColor: [5, 150, 105], // Emerald 600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 10,
      fontStyle: 'bold',
    },
  });

  // Table header for transactions
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RINCIAN TRANSAKSI KAS', 14, finalY);

  const tableBody = transactions.map((t, idx) => [
    idx + 1,
    formatDateIndonesian(t.tanggal),
    t.jenis,
    formatRupiah(t.nominal),
    t.keterangan,
    t.anggotaNama || '-',
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['No', 'Tanggal', 'Jenis', 'Nominal', 'Keterangan', 'Anggota']],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [4, 120, 87],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 28 },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 54 },
      5: { cellWidth: 28 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        if (data.cell.raw === 'Pemasukan') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [225, 29, 72];
        }
      }
    },
  });

  // Footer page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Halaman ${i} dari ${pageCount} - Kas Remaja System`,
      105,
      288,
      { align: 'center' }
    );
  }

  doc.save(`Laporan_Kas_Remaja_${new Date().toISOString().slice(0, 10)}.pdf`);
}
