import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4';
  marginMm?: number;
  quality?: number;
  showPageNumbers?: boolean;
}

// Canvas helper untuk konversi warna browser asli (CSS Color 4 -> sRGB)
let colorHelperCanvas: HTMLCanvasElement | null = null;
let colorHelperCtx: CanvasRenderingContext2D | null = null;

/**
 * Konversi rumus matematis OKLCH ke sRGB jika Canvas 2D browser gagal
 */
function parseOklchToRgbFallback(str: string): string {
  const match = str.match(
    /oklch\(\s*([\d.]+%?|none)\s+([\d.]+%?|none)\s+([\d.]+(?:deg|rad|turn)?|none)(?:\s*(?:\/|,)\s*([\d.]+%?|none))?\s*\)/i
  );
  if (!match) return '#1e293b';

  const LStr = match[1];
  const CStr = match[2];
  const HStr = match[3];
  const AStr = match[4];

  const L = LStr === 'none' ? 0 : LStr.endsWith('%') ? parseFloat(LStr) / 100 : parseFloat(LStr);
  const C =
    CStr === 'none' ? 0 : CStr.endsWith('%') ? (parseFloat(CStr) / 100) * 0.4 : parseFloat(CStr);

  let H = 0;
  if (HStr !== 'none') {
    if (HStr.endsWith('deg')) H = parseFloat(HStr);
    else if (HStr.endsWith('rad')) H = (parseFloat(HStr) * 180) / Math.PI;
    else if (HStr.endsWith('turn')) H = parseFloat(HStr) * 360;
    else H = parseFloat(HStr);
  }

  let alpha = 1;
  if (AStr && AStr !== 'none') {
    alpha = AStr.endsWith('%') ? parseFloat(AStr) / 100 : parseFloat(AStr);
  }

  // OKLCH -> OKLab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab -> linear sRGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLinear = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c));
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSrgb(rLinear) * 255);
  const g = Math.round(toSrgb(gLinear) * 255);
  const bVal = Math.round(toSrgb(bLinear) * 255);

  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
}

/**
 * Konversi satu nilai warna OKLCH/CSS Color 4 menjadi format rgb/rgba/hex
 */
function convertSingleColorToRgb(color: string): string {
  if (!color || typeof color !== 'string') return color;
  const trimmed = color.trim();
  if (
    !trimmed.toLowerCase().includes('oklch') &&
    !trimmed.toLowerCase().includes('oklab') &&
    !trimmed.toLowerCase().includes('color(srgb')
  ) {
    return trimmed;
  }

  try {
    if (!colorHelperCanvas) {
      colorHelperCanvas = document.createElement('canvas');
      colorHelperCanvas.width = 1;
      colorHelperCanvas.height = 1;
      colorHelperCtx = colorHelperCanvas.getContext('2d');
    }
    if (colorHelperCtx) {
      colorHelperCtx.fillStyle = '#000000';
      colorHelperCtx.fillStyle = trimmed;
      const res = colorHelperCtx.fillStyle;
      if (
        res &&
        !res.toLowerCase().includes('oklch') &&
        !res.toLowerCase().includes('oklab') &&
        !res.toLowerCase().includes('color(')
      ) {
        return res;
      }
    }
  } catch {
    // Canvas tidak dapat memproses, lanjut ke fallback
  }

  return parseOklchToRgbFallback(trimmed);
}

/**
 * Mengganti semua kemunculan oklch/CSS Color 4 di dalam string CSS apa pun
 */
export function sanitizeOklchInString(val: string): string {
  if (!val || typeof val !== 'string') return val;
  if (
    !val.includes('oklch') &&
    !val.includes('oklab') &&
    !val.includes('color(srgb')
  ) {
    return val;
  }

  return val.replace(
    /(?:oklch|oklab|color\(srgb[^)]+\)|lab|lch)\([^)]+\)/gi,
    (matched) => convertSingleColorToRgb(matched)
  );
}

/**
 * Membungkus objek CSSStyleDeclaration agar semua warna yang dibaca html2canvas
 * selalu bersih dari fungsi warna modern (oklch) yang belum didukung html2canvas.
 */
function createStyleDeclarationProxy(declaration: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(declaration, {
    get(target, prop) {
      if (prop === 'getPropertyValue') {
        return (propertyName: string) => {
          const val = target.getPropertyValue(propertyName);
          return sanitizeOklchInString(val);
        };
      }
      if (prop === 'item') {
        return (index: number) => target.item(index);
      }

      // Akses langsung pada target agar WebIDL native getter (seperti .length) tidak memicu Illegal invocation
      const val = (target as any)[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      if (typeof val === 'string') {
        return sanitizeOklchInString(val);
      }
      return val;
    },
  });
}

/**
 * Memasang hook pada window.getComputedStyle untuk mengonversi oklch -> sRGB
 */
function installComputedStyleHook(targetWindow: Window): () => void {
  const origGetComputedStyle = targetWindow.getComputedStyle;
  targetWindow.getComputedStyle = function (
    elt: Element,
    pseudoElt?: string | null
  ): CSSStyleDeclaration {
    const decl = origGetComputedStyle.call(targetWindow, elt, pseudoElt);
    return createStyleDeclarationProxy(decl);
  };

  return () => {
    targetWindow.getComputedStyle = origGetComputedStyle;
  };
}

/**
 * Mengonversi elemen HTML target menjadi file PDF A4 resmi yang rapi, tajam,
 * dan teratur tanpa terpotong di tengah halaman.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const {
    fileName = `Dokumen_Laporan_${new Date().toISOString().slice(0, 10)}.pdf`,
    orientation = 'portrait',
    format = 'a4',
    marginMm = 8,
    quality = 2,
    showPageNumbers = true,
  } = options;

  // Pastikan semua gambar dalam elemen telah selesai dimuat sebelum kloning
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

  // Lebar target dokumen cetak A4 dalam piksel
  const targetWidthPx = orientation === 'landscape' ? 1120 : 800;

  // Buat klon dokumen
  const clone = element.cloneNode(true) as HTMLElement;

  // Buat staging container off-screen yang stabil
  const stagingContainer = document.createElement('div');
  stagingContainer.setAttribute('data-pdf-staging', 'true');
  stagingContainer.style.position = 'absolute';
  stagingContainer.style.left = '0';
  stagingContainer.style.top = '0';
  stagingContainer.style.width = `${targetWidthPx}px`;
  stagingContainer.style.minWidth = `${targetWidthPx}px`;
  stagingContainer.style.maxWidth = `${targetWidthPx}px`;
  stagingContainer.style.overflow = 'visible';
  stagingContainer.style.opacity = '0.01';
  stagingContainer.style.pointerEvents = 'none';
  stagingContainer.style.zIndex = '-9999';

  // Format klon agar rapi seperti kertas dokumen putih A4
  clone.style.width = `${targetWidthPx}px`;
  clone.style.maxWidth = `${targetWidthPx}px`;
  clone.style.minWidth = `${targetWidthPx}px`;
  clone.style.height = 'auto';
  clone.style.minHeight = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.boxSizing = 'border-box';
  clone.style.padding = '12px 14px';
  clone.style.margin = '0';
  clone.style.border = 'none';
  clone.style.borderRadius = '0';
  clone.style.boxShadow = 'none';

  // =========================================================================
  // NORMALISASI LAYOUT (SOLUSI UTAMA: TRANSFORMASI CSS GRID KE FLEXBOX)
  // html2canvas TIDAK mendukung CSS Grid track (grid-template-columns),
  // sehingga card/label barcode menumpuk dan acak-acakan jika tidak dikonversi.
  // =========================================================================
  const allClonedElements = Array.from(clone.querySelectorAll<HTMLElement>('*'));
  allClonedElements.forEach((el) => {
    // Normalisasi container yang memiliki class grid atau display grid
    const hasGridClass = el.classList.contains('grid');
    const compDisplay = window.getComputedStyle(el).display;
    const isGrid = hasGridClass || compDisplay === 'grid';

    if (isGrid) {
      let cols = 1;
      if (el.classList.contains('grid-cols-2')) cols = 2;
      else if (el.classList.contains('grid-cols-3')) cols = 3;
      else if (el.classList.contains('grid-cols-4')) cols = 4;
      else if (el.classList.contains('grid-cols-5')) cols = 5;
      else if (el.classList.contains('grid-cols-6')) cols = 6;
      else if (el.children.length === 2) cols = 2;
      else if (el.children.length === 3) cols = 3;

      el.style.display = 'flex';
      el.style.flexWrap = 'wrap';
      el.style.boxSizing = 'border-box';
      el.style.gap = cols === 3 ? '10px' : '14px';
      el.style.justifyContent = cols === 2 ? 'space-between' : 'flex-start';
      el.style.width = '100%';

      const pctWidth =
        cols === 1
          ? '100%'
          : cols === 2
          ? 'calc(50% - 8px)'
          : cols === 3
          ? 'calc(33.333% - 8px)'
          : `calc(${100 / cols}% - 8px)`;

      Array.from(el.children).forEach((child) => {
        const childEl = child as HTMLElement;
        childEl.style.width = pctWidth;
        childEl.style.maxWidth = pctWidth;
        childEl.style.boxSizing = 'border-box';
        childEl.style.flexShrink = '0';
        childEl.style.marginBottom = '10px';
      });
    }

    // Hilangkan overflow tersembunyi yang dapat memotong tabel atau card
    if (
      el.classList.contains('overflow-x-auto') ||
      el.classList.contains('overflow-y-auto') ||
      el.classList.contains('overflow-auto')
    ) {
      el.style.overflow = 'visible';
    }
    el.style.maxHeight = 'none';

    // Hapus bayangan agar teks dan garis barcode sangat tajam
    if (
      el.classList.contains('shadow-xs') ||
      el.classList.contains('shadow-sm') ||
      el.classList.contains('shadow-md') ||
      el.classList.contains('shadow-lg') ||
      el.classList.contains('shadow-2xs')
    ) {
      el.style.boxShadow = 'none';
    }
  });

  // Pastikan tabel memenuhi lebar dokumen dengan rapi
  clone.querySelectorAll('table').forEach((t) => {
    const tableEl = t as HTMLElement;
    tableEl.style.width = '100%';
    tableEl.style.borderCollapse = 'collapse';
    tableEl.style.tableLayout = 'auto';
  });

  // Sembunyikan elemen berkategori no-print pada klon
  clone.querySelectorAll('.no-print').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  // =========================================================================
  // GANTIKAN SEMUA <canvas> DENGAN TAG <img> PNG BERESOLUSI TINGGI
  // QR Code & Barcode Canvas dikonversi ke gambar bitmap langsung
  // =========================================================================
  const origCanvases = Array.from(element.querySelectorAll('canvas'));
  const cloneCanvases = Array.from(clone.querySelectorAll('canvas'));
  origCanvases.forEach((orig, idx) => {
    const dest = cloneCanvases[idx];
    if (dest && orig.width > 0 && orig.height > 0) {
      try {
        const dataUrl = orig.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = dataUrl;
        img.className = orig.className;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.objectFit = 'contain';
        img.style.margin = '0 auto';
        dest.parentNode?.replaceChild(img, dest);
      } catch {
        dest.width = orig.width;
        dest.height = orig.height;
        const ctx = dest.getContext('2d');
        if (ctx) ctx.drawImage(orig, 0, 0);
      }
    }
  });

  // =========================================================================
  // GANTIKAN SEMUA <svg> BARCODE/IKON DENGAN <img> SUPAYA TIDAK CACAT
  // =========================================================================
  const origSvgs = Array.from(element.querySelectorAll('svg'));
  const cloneSvgs = Array.from(clone.querySelectorAll('svg'));
  origSvgs.forEach((orig, idx) => {
    const dest = cloneSvgs[idx];
    if (dest) {
      try {
        const rect = orig.getBoundingClientRect();
        const w = Math.round(rect.width) || parseInt(orig.getAttribute('width') || '140', 10) || 140;
        const h = Math.round(rect.height) || parseInt(orig.getAttribute('height') || '40', 10) || 40;

        if (!orig.getAttribute('xmlns')) {
          orig.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        const xml = new XMLSerializer().serializeToString(orig);
        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
        const img = document.createElement('img');
        img.src = dataUrl;
        img.width = w;
        img.height = h;
        img.style.width = `${w}px`;
        img.style.height = `${h}px`;
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        img.style.margin = '0 auto';
        dest.parentNode?.replaceChild(img, dest);
      } catch {
        const rect = orig.getBoundingClientRect();
        const w = Math.round(rect.width) || 120;
        const h = Math.round(rect.height) || 40;
        dest.setAttribute('width', `${w}`);
        dest.setAttribute('height', `${h}`);
        dest.style.width = `${w}px`;
        dest.style.height = `${h}px`;
        dest.style.maxWidth = '100%';
        dest.style.display = 'block';
      }
    }
  });

  // Masukkan klon ke dalam staging container dan pasang ke DOM
  stagingContainer.appendChild(clone);
  document.body.appendChild(stagingContainer);

  // Pasang hook getComputedStyle pada window utama sebelum html2canvas dipanggil
  const restoreMainHook = installComputedStyleHook(window);

  try {
    const canvas = await html2canvas(clone, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: targetWidthPx,
      imageTimeout: 15000,
      onclone: (clonedDoc: Document) => {
        if (clonedDoc.defaultView) {
          installComputedStyleHook(clonedDoc.defaultView);
        }

        if (clonedDoc.documentElement) {
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.documentElement.style.color = '#000000';
        }
        if (clonedDoc.body) {
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.color = '#000000';
        }

        const clonedStaging = clonedDoc.querySelector('[data-pdf-staging]') as HTMLElement;
        if (clonedStaging) {
          clonedStaging.style.opacity = '1';
        }

        // Injeksi style perbaikan font dan print agar teks tidak terpotong atau bergeser di html2canvas
        const printFixStyle = clonedDoc.createElement('style');
        printFixStyle.textContent = `
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          p, span, div, h1, h2, h3, th, td {
            text-rendering: geometricPrecision !important;
            overflow: visible !important;
          }
          .line-clamp-1, .line-clamp-2, .truncate {
            overflow: visible !important;
            white-space: normal !important;
            text-overflow: clip !important;
          }
        `;
        clonedDoc.head.appendChild(printFixStyle);

        // Pastikan semua gambar dan canvas pada klon tidak meluap dari batas kartu
        clonedDoc.querySelectorAll('img, canvas').forEach((node) => {
          const el = node as HTMLElement;
          el.style.maxWidth = '100%';
          el.style.height = 'auto';
          el.style.boxSizing = 'border-box';
        });

        // Bersihkan style tag dari oklch
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((tag) => {
          if (tag.textContent && tag.textContent.includes('oklch')) {
            tag.textContent = sanitizeOklchInString(tag.textContent);
          }
        });

        // Bersihkan inline style dari oklch
        const allNodes = clonedDoc.querySelectorAll('*');
        allNodes.forEach((node) => {
          const el = node as HTMLElement;
          if (el.style) {
            for (let i = 0; i < el.style.length; i++) {
              const prop = el.style[i];
              const val = el.style.getPropertyValue(prop);
              if (val && val.includes('oklch')) {
                el.style.setProperty(prop, sanitizeOklchInString(val));
              }
            }
          }
        });
      },
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
    const pageRatio = contentHeight / contentWidth;

    // Tinggi maksimum konten yang muat pada 1 lembar A4 (dalam piksel klon)
    const maxPageHeightPx = Math.floor(targetWidthPx * pageRatio);

    // =========================================================================
    // SMART PAGE SLICING MENGGUNAKAN GEOMETRI OFFSET DOM YANG AKURAT
    // Menghindari pemotongan di tengah baris tabel, barcode card, atau ttd
    // =========================================================================
    const getOffsetTopRelativeToClone = (el: HTMLElement): number => {
      let top = 0;
      let curr: HTMLElement | null = el;
      while (curr && curr !== clone) {
        top += curr.offsetTop;
        curr = curr.offsetParent as HTMLElement | null;
      }
      return top;
    };

    interface AvoidBox {
      top: number;
      bottom: number;
    }
    const avoidBoxes: AvoidBox[] = [];

    clone
      .querySelectorAll<HTMLElement>(
        'tr, .print-break-inside-avoid, .print-card, [data-break-avoid], .break-inside-avoid'
      )
      .forEach((el) => {
        const top = getOffsetTopRelativeToClone(el);
        const height = el.offsetHeight;
        if (height > 0) {
          avoidBoxes.push({ top, bottom: top + height });
        }
      });

    avoidBoxes.sort((a, b) => a.top - b.top);

    const totalHeight = clone.offsetHeight;
    let currentY = 0;
    const pageSlices: { startY: number; endY: number }[] = [];

    while (currentY < totalHeight - 10) {
      const targetEndY = currentY + maxPageHeightPx;

      if (targetEndY >= totalHeight) {
        pageSlices.push({ startY: currentY, endY: totalHeight });
        break;
      }

      // Deteksi jika target batas memotong elemen
      let splitY = targetEndY;
      for (const box of avoidBoxes) {
        if (box.top < targetEndY && box.bottom > targetEndY) {
          // Potong rapi persis di atas elemen ini
          if (box.top > currentY + 80) {
            splitY = box.top - 4;
            break;
          }
        }
      }

      if (splitY <= currentY) {
        splitY = targetEndY;
      }

      pageSlices.push({ startY: currentY, endY: splitY });
      currentY = splitY;
    }

    if (pageSlices.length === 0) {
      pageSlices.push({ startY: 0, endY: totalHeight });
    }

    // Skala piksel klon -> piksel canvas hasil html2canvas
    const scaleFactor = canvas.width / targetWidthPx;

    // Render setiap irisan halaman ke sub-canvas terpisah dan masukkan ke jsPDF
    for (let i = 0; i < pageSlices.length; i++) {
      const { startY, endY } = pageSlices[i];
      const startPx = Math.round(startY * scaleFactor);
      const endPx = Math.min(canvas.height, Math.round(endY * scaleFactor));
      const sliceHeightPx = endPx - startPx;
      if (sliceHeightPx <= 0) continue;

      if (i > 0) {
        pdf.addPage();
      }

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const pCtx = pageCanvas.getContext('2d');
      if (pCtx) {
        pCtx.fillStyle = '#ffffff';
        pCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pCtx.drawImage(
          canvas,
          0,
          startPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      const sliceHeightMm = (sliceHeightPx / canvas.width) * contentWidth;

      pdf.addImage(
        pageImgData,
        'JPEG',
        marginMm,
        marginMm,
        contentWidth,
        sliceHeightMm,
        undefined,
        'FAST'
      );

      // Tambahkan nomor halaman jika dokumen memiliki lebih dari 1 halaman
      if (showPageNumbers && pageSlices.length > 1) {
        pdf.setFontSize(8);
        pdf.setTextColor(130, 130, 130);
        pdf.text(
          `Halaman ${i + 1} dari ${pageSlices.length}`,
          pdfWidth / 2,
          pdfHeight - 4,
          { align: 'center' }
        );
      }
    }

    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    // Download file PDF
    try {
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = finalFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      pdf.save(finalFileName);
    }
  } finally {
    restoreMainHook();
    if (document.body.contains(stagingContainer)) {
      document.body.removeChild(stagingContainer);
    }
  }
}
