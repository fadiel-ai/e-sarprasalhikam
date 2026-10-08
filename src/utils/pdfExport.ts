import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4';
  marginMm?: number;
  quality?: number;
}

/**
 * Mengonversi elemen HTML target menjadi file PDF A4 resmi beresolusi tinggi (300 DPI)
 * Mendukung dokumen multi-halaman jika tabel atau konten sangat panjang.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const {
    fileName = `Dokumen_Laporan_${new Date().toISOString().slice(0, 10)}.pdf`,
    orientation = 'portrait',
    format = 'a4',
    marginMm = 10,
    quality = 2,
  } = options;

  // Pastikan semua gambar dalam elemen telah selesai dimuat
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );

  // Buat klon sementara untuk rendering bersih
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = orientation === 'landscape' ? '1120px' : '820px';
  clone.style.maxWidth = 'none';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.zIndex = '-1000';
  clone.style.boxSizing = 'border-box';
  clone.style.padding = '24px 30px';

  // Sembunyikan elemen berkategori no-print pada klon
  const noPrintEls = clone.querySelectorAll('.no-print');
  noPrintEls.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: orientation === 'landscape' ? 1200 : 900,
      imageTimeout: 15000,
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pdfWidth = orientation === 'landscape' ? 297 : 210;
    const pdfHeight = orientation === 'landscape' ? 210 : 297;
    const contentWidth = pdfWidth - marginMm * 2;
    const contentHeight = pdfHeight - marginMm * 2;

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let heightLeft = imgHeight;
    let position = marginMm;

    // Tambahkan halaman pertama
    pdf.addImage(
      imgData,
      'JPEG',
      marginMm,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    );
    heightLeft -= contentHeight;

    // Jika konten lebih panjang dari 1 halaman A4, buat halaman baru
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + marginMm;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'JPEG',
        marginMm,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
      heightLeft -= contentHeight;
    }

    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(finalFileName);
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
}
