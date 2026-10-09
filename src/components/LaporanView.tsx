import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  DollarSign,
  Download,
  Edit2,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FileUp,
  Filter,
  Image as ImageIcon,
  Layers,
  Loader2,
  Printer,
  RotateCcw,
  School,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import {
  Barang,
  Kategori,
  KondisiBarang,
  PengaturanSekolah,
  Ruangan,
  SumberDana,
} from '../types/inventory';
import { processImageFile } from '../utils/imageUtils';
import { exportElementToPdf } from '../utils/pdfExport';

interface LaporanViewProps {
  barangList: Barang[];
  kategoriList: Kategori[];
  ruanganList: Ruangan[];
  pengaturan: PengaturanSekolah;
  onUpdatePengaturan?: (pengaturan: PengaturanSekolah) => void;
}

type JenisLaporan = 'buku_induk' | 'per_ruangan' | 'kondisi_aset' | 'sumber_dana';

export const LaporanView: React.FC<LaporanViewProps> = ({
  barangList,
  kategoriList,
  ruanganList,
  pengaturan,
  onUpdatePengaturan,
}) => {
  const [jenisLaporan, setJenisLaporan] = useState<JenisLaporan>('buku_induk');

  // Kop Surat Modal States
  const [isKopModalOpen, setIsKopModalOpen] = useState(false);
  const [isUploadingKop, setIsUploadingKop] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [tempKopUrl, setTempKopUrl] = useState<string>(pengaturan.kopSuratUrl || '');
  const [urlKopInput, setUrlKopInput] = useState<string>('');
  const [subKopInput, setSubKopInput] = useState(
    pengaturan.subKopText || 'PEMERINTAH PROVINSI LAMPUNG / YAYASAN PONDOK PESANTREN AL-HIKAM'
  );
  // State Orientation PDF & Exporting
  const [pdfOrientation, setPdfOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter States
  const [filterRuangan, setFilterRuangan] = useState<string>('');
  const [filterKategori, setFilterKategori] = useState<string>('');
  const [filterKondisi, setFilterKondisi] = useState<string>('');
  const [filterSumberDana, setFilterSumberDana] = useState<string>('');
  const [filterTahun, setFilterTahun] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tahun List
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    barangList.forEach((b) => {
      if (b.tahunPengadaan) years.add(Number(b.tahunPengadaan));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [barangList]);

  // Filtered Items
  const filteredBarang = useMemo(() => {
    return barangList.filter((item) => {
      // Filter by tab specifics
      if (jenisLaporan === 'per_ruangan' && filterRuangan && item.idRuangan !== filterRuangan) {
        return false;
      }
      if (jenisLaporan === 'kondisi_aset' && filterKondisi && item.kondisi !== filterKondisi) {
        return false;
      }
      if (jenisLaporan === 'sumber_dana' && filterSumberDana && item.sumberDana !== filterSumberDana) {
        return false;
      }

      // General filters
      if (filterRuangan && item.idRuangan !== filterRuangan) return false;
      if (filterKategori && item.idKategori !== filterKategori) return false;
      if (filterKondisi && item.kondisi !== filterKondisi) return false;
      if (filterSumberDana && item.sumberDana !== filterSumberDana) return false;
      if (filterTahun && String(item.tahunPengadaan) !== filterTahun) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.namaBarang.toLowerCase().includes(q);
        const matchCode = item.kodeBarang.toLowerCase().includes(q);
        const matchMerk = (item.merk || '').toLowerCase().includes(q);
        return matchName || matchCode || matchMerk;
      }

      return true;
    });
  }, [
    barangList,
    jenisLaporan,
    filterRuangan,
    filterKategori,
    filterKondisi,
    filterSumberDana,
    filterTahun,
    searchQuery,
  ]);

  // Calculations
  const stats = useMemo(() => {
    let totalUnit = 0;
    let totalNilai = 0;
    let baik = 0;
    let rusakRingan = 0;
    let rusakBerat = 0;

    filteredBarang.forEach((item) => {
      const qty = Number(item.jumlah) || 1;
      const harga = Number(item.hargaSatuan) || 0;
      const val = Number(item.totalNilai) || qty * harga;

      totalUnit += qty;
      totalNilai += val;

      if (item.kondisi === 'Baik') baik += qty;
      else if (item.kondisi === 'Rusak Ringan') rusakRingan += qty;
      else if (item.kondisi === 'Rusak Berat') rusakBerat += qty;
    });

    return { totalUnit, totalNilai, baik, rusakRingan, rusakBerat };
  }, [filteredBarang]);

  const handleUploadKopFile = async (file: File) => {
    try {
      setIsUploadingKop(true);
      setUploadError(null);
      const dataUrl = await processImageFile(file, 1200, 280, 0.85);
      setTempKopUrl(dataUrl);
      if (onUpdatePengaturan) {
        onUpdatePengaturan({
          ...pengaturan,
          kopSuratUrl: dataUrl,
          tipeKopSurat: 'gambar',
          subKopText: subKopInput,
        });
      }
      setIsUploadingKop(false);
    } catch (err: any) {
      setIsUploadingKop(false);
      setUploadError(err.message || 'Gagal memproses gambar kop surat.');
    }
  };

  const handleApplyUrlKop = () => {
    const trimmed = urlKopInput.trim();
    if (!trimmed) return;
    setTempKopUrl(trimmed);
    if (onUpdatePengaturan) {
      onUpdatePengaturan({
        ...pengaturan,
        kopSuratUrl: trimmed,
        tipeKopSurat: 'gambar',
        subKopText: subKopInput,
      });
    }
    setUrlKopInput('');
  };

  const handleRemoveKopImage = () => {
    if (confirm('Hapus gambar kop surat dan kembali ke kop teks resmi standar?')) {
      setTempKopUrl('');
      if (onUpdatePengaturan) {
        onUpdatePengaturan({
          ...pengaturan,
          kopSuratUrl: '',
          tipeKopSurat: 'teks_otomatis',
          subKopText: subKopInput,
        });
      }
    }
  };

  const handleSaveKopSettings = (tipe: 'gambar' | 'teks_otomatis') => {
    const finalUrl = tempKopUrl || pengaturan.kopSuratUrl || '';
    if (onUpdatePengaturan) {
      onUpdatePengaturan({
        ...pengaturan,
        kopSuratUrl: finalUrl,
        tipeKopSurat: finalUrl && tipe === 'gambar' ? 'gambar' : 'teks_otomatis',
        subKopText: subKopInput,
      });
    }
    setIsKopModalOpen(false);
  };

  const handleDownloadDokumen = () => {
    const printEl = document.getElementById('printable-area');
    if (!printEl) {
      alert('Dokumen belum siap untuk diunduh.');
      return;
    }

    const titleMap: Record<JenisLaporan, string> = {
      buku_induk: 'Buku_Induk_Inventaris',
      per_ruangan: 'Laporan_KIR_Ruangan',
      kondisi_aset: 'Laporan_Rekapitulasi_Kondisi',
      sumber_dana: 'Laporan_Sumber_Dana',
    };

    const cleanSchool = (pengaturan.namaSekolah || 'SMK_AL_HIKAM').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Dokumen_${titleMap[jenisLaporan]}_${cleanSchool}_${dateStr}.html`;

    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleMap[jenisLaporan].replace(/_/g, ' ')} - ${pengaturan.namaSekolah}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap">
  <style>
    * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    body { margin: 0; padding: 20px; background: #f8fafc; color: #000; }
    .no-print { display: none !important; }
    .action-bar { position: sticky; top: 0; z-index: 100; background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
    .action-bar button { background: #4f46e5; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }
    .action-bar button:hover { background: #4338ca; }
    .doc-sheet { max-width: 960px; margin: 0 auto; background: white; padding: 35px 45px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 6px 8px; }
    th { background-color: #f1f5f9; font-weight: 800; text-align: center; }
    tr { page-break-inside: avoid; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-extrabold { font-weight: 800; }
    .uppercase { text-transform: uppercase; }
    .underline { text-decoration: underline; }
    img { max-width: 100%; height: auto; }
    @media print {
      .no-print, .action-bar { display: none !important; }
      body { padding: 0 !important; background: white !important; }
      .doc-sheet { max-width: 100% !important; padding: 0 !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; }
      @page { size: A4 portrait; margin: 8mm 6mm; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <span style="font-weight: 700; font-size: 14px;">📄 Dokumen Laporan Resmi: ${pengaturan.namaSekolah}</span>
    <div>
      <button onclick="window.print()">🖨️ Cetak / Simpan PDF Sekarang</button>
    </div>
  </div>
  <div class="doc-sheet">
    ${printEl.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    const printEl = document.getElementById('printable-area');
    if (!printEl) {
      alert('Dokumen laporan belum siap.');
      return;
    }

    const titleMap: Record<JenisLaporan, string> = {
      buku_induk: 'Buku_Induk_Inventaris',
      per_ruangan: 'Laporan_KIR_Ruangan',
      kondisi_aset: 'Laporan_Rekapitulasi_Kondisi',
      sumber_dana: 'Laporan_Sumber_Dana',
    };

    const cleanSchool = (pengaturan.namaSekolah || 'SMK_AL_HIKAM').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const pdfFileName = `${titleMap[jenisLaporan]}_${cleanSchool}_${dateStr}.pdf`;

    try {
      setIsExportingPdf(true);
      await exportElementToPdf(printEl, {
        fileName: pdfFileName,
        orientation: pdfOrientation,
        format: 'a4',
        marginMm: 8,
        quality: 2,
        showPageNumbers: true,
      });
    } catch (err) {
      console.error('Gagal membuat file PDF:', err);
      alert('Terjadi kendala saat menyusun PDF laporan: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    const printEl = document.getElementById('printable-area');
    if (!printEl) {
      window.print();
      return;
    }

    // Buat iframe khusus cetak untuk memastikan dialog cetak muncul seketika di semua browser
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    const titleMap: Record<JenisLaporan, string> = {
      buku_induk: 'Buku Induk Inventaris',
      per_ruangan: 'Laporan Kartu Inventaris Ruangan',
      kondisi_aset: 'Laporan Rekapitulasi Kondisi Sarpras',
      sumber_dana: 'Laporan Sumber Dana Aset',
    };

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>${titleMap[jenisLaporan]} - ${pengaturan.namaSekolah}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap">
          <style>
            * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
            body { margin: 0; padding: 12mm 10mm; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 5px 6px; }
            th { background-color: #f1f5f9 !important; font-weight: 800; text-align: center; }
            tr { page-break-inside: avoid; }
            .font-mono { font-family: 'JetBrains Mono', monospace; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-extrabold { font-weight: 800; }
            .uppercase { text-transform: uppercase; }
            .underline { text-decoration: underline; }
            .no-print { display: none !important; }
            img { max-width: 100%; height: auto; }
            @page { size: A4 portrait; margin: 8mm 6mm; }
          </style>
        </head>
        <body>
          ${printEl.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    const iframeImages = Array.from(doc.querySelectorAll('img'));
    const waitForImages = Promise.all(
      iframeImages.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    waitForImages.then(() => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 250);
    });
  };

  const handleExportCSV = () => {
    if (!filteredBarang.length) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'Kode Barang',
      'Nama Barang',
      'Merk / Spesifikasi',
      'Nomor Seri',
      'Kategori',
      'Ruangan / Lokasi',
      'Tahun Pengadaan',
      'Sumber Dana',
      'Kondisi',
      'Jumlah',
      'Satuan',
      'Harga Satuan (Rp)',
      'Total Nilai (Rp)',
      'Penanggung Jawab',
      'Keterangan',
    ];

    const rows = filteredBarang.map((item, idx) => [
      idx + 1,
      item.kodeBarang,
      item.namaBarang,
      item.merk || '-',
      item.nomorSeri || '-',
      item.kategoriNama || '-',
      item.ruanganNama || '-',
      item.tahunPengadaan || '-',
      item.sumberDana || 'BOS',
      item.kondisi,
      item.jumlah,
      item.satuan,
      item.hargaSatuan,
      item.totalNilai || item.jumlah * item.hargaSatuan,
      item.penanggungJawab || '-',
      item.keterangan || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))].join(
        '\n'
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `Laporan_Inventaris_${pengaturan.namaSekolah.replace(/\s+/g, '_')}_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilter = () => {
    setFilterRuangan('');
    setFilterKategori('');
    setFilterKondisi('');
    setFilterSumberDana('');
    setFilterTahun('');
    setSearchQuery('');
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const selectedRuangObj = useMemo(() => {
    return ruanganList.find((r) => r.id === filterRuangan);
  }, [ruanganList, filterRuangan]);

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Laporan Sarana & Prasarana (Sarpras)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cetak format resmi Buku Induk Inventaris, Laporan per Ruangan (KIR), Rekap Kondisi, dan Sumber Dana untuk {pengaturan.namaSekolah}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onUpdatePengaturan && (
            <button
              onClick={() => {
                setSubKopInput(pengaturan.subKopText || 'PEMERINTAH PROVINSI LAMPUNG / YAYASAN PONDOK PESANTREN AL-HIKAM');
                setIsKopModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Unggah dan atur gambar Kop Surat untuk kop laporan"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Kop Surat Laporan</span>
              {pengaturan.kopSuratUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              )}
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Download Spreadsheet Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh</span> Excel (CSV)
          </button>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setPdfOrientation('landscape')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                pdfOrientation === 'landscape'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Format melebar (direkomendasikan untuk 10 kolom tabel)"
            >
              Landscape
            </button>
            <button
              type="button"
              onClick={() => setPdfOrientation('portrait')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                pdfOrientation === 'portrait'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Format memanjang tegak"
            >
              Portrait
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            title={`Unduh dokumen langsung dalam format PDF resmi A4 (${pdfOrientation})`}
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingPdf ? 'Membuat PDF...' : `Unduh PDF (${pdfOrientation === 'landscape' ? 'Landscape' : 'Portrait'})`}</span>
          </button>
          <button
            onClick={handleDownloadDokumen}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-medium shadow-xs transition-all cursor-pointer"
            title="Unduh file dokumen web resmi A4 offline"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Unduh</span> HTML
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-all cursor-pointer"
            title="Buka dialog cetak langsung printer atau simpan PDF lewat browser"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Langsung</span>
          </button>
        </div>
      </div>

      {/* Tabs Pilihan Jenis Laporan */}
      <div className="no-print flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl overflow-x-auto gap-2">
        <button
          onClick={() => setJenisLaporan('buku_induk')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            jenisLaporan === 'buku_induk'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Buku Induk Inventaris</span>
        </button>

        <button
          onClick={() => setJenisLaporan('per_ruangan')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            jenisLaporan === 'per_ruangan'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>2. Laporan per Ruangan (KIR)</span>
        </button>

        <button
          onClick={() => setJenisLaporan('kondisi_aset')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            jenisLaporan === 'kondisi_aset'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>3. Rekap Kondisi & Usulan Perbaikan</span>
        </button>

        <button
          onClick={() => setJenisLaporan('sumber_dana')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            jenisLaporan === 'sumber_dana'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>4. Laporan Sumber Dana (BOS/DAK)</span>
        </button>
      </div>

      {/* Filter Bar (No Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filter Kustom Laporan:</span>
          </span>
          <button
            onClick={handleResetFilter}
            className="text-[11px] text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang, merk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
            />
          </div>

          {/* Filter Ruangan */}
          <div>
            <select
              aria-label="Filter Ruangan"
              value={filterRuangan}
              onChange={(e) => setFilterRuangan(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-medium"
            >
              <option value="">Semua Ruangan</option>
              {ruanganList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.namaRuangan}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              aria-label="Filter Kategori"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-medium"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKategori}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kondisi */}
          <div>
            <select
              aria-label="Filter Kondisi"
              value={filterKondisi}
              onChange={(e) => setFilterKondisi(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-medium"
            >
              <option value="">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          {/* Filter Sumber Dana */}
          <div>
            <select
              aria-label="Filter Sumber Dana"
              value={filterSumberDana}
              onChange={(e) => setFilterSumberDana(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden text-xs font-medium"
            >
              <option value="">Semua Sumber Dana</option>
              <option value="BOS Reguler">BOS Reguler</option>
              <option value="BOS Kinerja">BOS Kinerja</option>
              <option value="DAK Fisik">DAK Fisik</option>
              <option value="Komite Sekolah">Komite Sekolah</option>
              <option value="Hibah / Yayasan">Hibah / Yayasan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ringkasan Angka Rekapitulasi (No Print) */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Total Item Terpilih</span>
          <span className="text-lg font-bold text-slate-900 block mt-0.5">
            {filteredBarang.length} <span className="text-xs font-normal text-slate-500">Jenis Barang</span>
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold block">
            {stats.totalUnit.toLocaleString('id-ID')} Unit Fisik
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Total Nilai Aset</span>
          <span className="text-lg font-bold text-slate-900 block mt-0.5 text-indigo-600">
            Rp {stats.totalNilai.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-500 block">Nilai Tercatat</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Kondisi Baik</span>
          <span className="text-lg font-bold text-emerald-600 block mt-0.5">
            {stats.baik.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Unit</span>
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {stats.totalUnit > 0 ? Math.round((stats.baik / stats.totalUnit) * 100) : 0}% Siap Pakai
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Kondisi Rusak</span>
          <span className="text-lg font-bold text-rose-600 block mt-0.5">
            {(stats.rusakRingan + stats.rusakBerat).toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-slate-500">Unit</span>
          </span>
          <span className="text-[10px] text-amber-600 font-semibold block">
            {stats.rusakRingan} RR / {stats.rusakBerat} RB
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* AREA DOKUMEN RESMI SIAP CETAK (PRINT & DISPLAY)           */}
      {/* ========================================================= */}
      <div id="printable-area" className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 text-slate-900 space-y-6">
        {/* KOP SURAT RESMI */}
        {(tempKopUrl || pengaturan.kopSuratUrl) && pengaturan.tipeKopSurat !== 'teks_otomatis' ? (
          <div className="relative group text-center pb-2 border-b-2 border-slate-900 print-break-inside-avoid">
            <img
              src={tempKopUrl || pengaturan.kopSuratUrl}
              alt={`Kop Surat ${pengaturan.namaSekolah}`}
              className="w-full max-h-36 sm:max-h-40 object-contain mx-auto"
            />
            {onUpdatePengaturan && (
              <button
                type="button"
                onClick={() => {
                  setTempKopUrl(pengaturan.kopSuratUrl || '');
                  setSubKopInput(pengaturan.subKopText || 'PEMERINTAH PROVINSI LAMPUNG / YAYASAN PONDOK PESANTREN AL-HIKAM');
                  setIsKopModalOpen(true);
                }}
                className="no-print absolute top-1 right-1 px-2.5 py-1 bg-white/95 hover:bg-white text-slate-800 rounded-lg text-[10px] font-bold shadow-xs border border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                title="Ganti atau sesuaikan kop surat"
              >
                <Edit2 className="w-3 h-3 text-indigo-600" />
                <span>Ganti Kop Surat</span>
              </button>
            )}
          </div>
        ) : (
          <div className="relative group border-b-4 border-double border-slate-900 pb-3 text-center print-break-inside-avoid">
            {onUpdatePengaturan && (
              <button
                type="button"
                onClick={() => {
                  setTempKopUrl(pengaturan.kopSuratUrl || '');
                  setSubKopInput(pengaturan.subKopText || 'PEMERINTAH PROVINSI LAMPUNG / YAYASAN PONDOK PESANTREN AL-HIKAM');
                  setIsKopModalOpen(true);
                }}
                className="no-print absolute top-0 right-0 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold shadow-2xs border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
                title="Unggah file gambar kop surat resmi"
              >
                <Upload className="w-3 h-3" />
                <span>Unggah Kop Gambar</span>
              </button>
            )}
            <div className="flex items-center justify-center gap-4 mb-1">
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold print:border print:border-black shrink-0">
                {pengaturan.logoUrl ? (
                  <img src={pengaturan.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  '🏫'
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-600">
                  {pengaturan.subKopText || 'PEMERINTAH PROVINSI LAMPUNG / YAYASAN PENDIDIKAN'}
                </p>
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-slate-900">
                  {pengaturan.namaSekolah || 'SMK AL-HIKAM SENDANG AGUNG'}
                </h1>
                <p className="text-xs text-slate-700 font-medium">
                  NPSN: {pengaturan.npsn || '70058018'} &bull; {pengaturan.alamat || 'Sendang Mulyo, Kec. Sendang Agung, Kab. Lampung Tengah'}
                </p>
                <p className="text-[11px] text-slate-600">
                  Kontak: {pengaturan.kontakSekolah || '-'} &bull; Email: {pengaturan.emailSekolah || '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* JUDUL DOKUMEN LAPORAN */}
        <div className="text-center space-y-1 print-break-inside-avoid">
          <h2 className="text-base sm:text-lg font-extrabold uppercase underline tracking-wider">
            {jenisLaporan === 'buku_induk' && 'BUKU INDUK INVENTARIS SARANA DAN PRASARANA'}
            {jenisLaporan === 'per_ruangan' &&
              `LAPORAN KARTU INVENTARIS RUANGAN (KIR) - ${
                selectedRuangObj ? selectedRuangObj.namaRuangan.toUpperCase() : 'SEMUA RUANGAN'
              }`}
            {jenisLaporan === 'kondisi_aset' &&
              'LAPORAN REKAPITULASI KONDISI ASET & REKOMENDASI PEMELIHARAAN'}
            {jenisLaporan === 'sumber_dana' &&
              'LAPORAN REKAPITULASI ASET BERDASARKAN SUMBER ANGGARAN'}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Tahun Ajaran 2026/2027 &bull; Dicetak pada tanggal: {todayStr}
          </p>
        </div>

        {/* Informasi Detail jika Laporan per Ruangan */}
        {jenisLaporan === 'per_ruangan' && selectedRuangObj && (
          <div
            className="text-xs border border-slate-300 p-3 rounded-lg bg-slate-50 print:bg-transparent print-break-inside-avoid"
            style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', width: '100%', boxSizing: 'border-box' }}
          >
            <div className="space-y-1" style={{ width: '48%', boxSizing: 'border-box' }}>
              <p>
                <b>Nama Ruangan:</b> {selectedRuangObj.namaRuangan}
              </p>
              <p>
                <b>Kode Ruangan:</b> {selectedRuangObj.kodeRuangan}
              </p>
              <p>
                <b>Gedung / Lokasi:</b> {selectedRuangObj.gedung || '-'}
              </p>
            </div>
            <div className="space-y-1 sm:pl-8 text-right sm:text-left" style={{ width: '48%', boxSizing: 'border-box' }}>
              <p>
                <b>Penanggung Jawab:</b> {selectedRuangObj.penanggungJawab || '-'}
              </p>
              <p>
                <b>Kapasitas Ruang:</b> {selectedRuangObj.kapasitas} Orang
              </p>
              <p>
                <b>Deskripsi:</b> {selectedRuangObj.deskripsi || '-'}
              </p>
            </div>
          </div>
        )}

        {/* TABEL DATA LAPORAN RESMI */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-900">
            <thead className="bg-slate-100 print:bg-slate-200 text-slate-900 font-bold text-center">
              <tr>
                <th className="border border-slate-900 p-2 w-10">No</th>
                <th className="border border-slate-900 p-2 w-32">Kode Barang</th>
                <th className="border border-slate-900 p-2">Nama Barang & Spesifikasi</th>
                <th className="border border-slate-900 p-2 w-28">Ruangan</th>
                <th className="border border-slate-900 p-2 w-20">Tahun</th>
                <th className="border border-slate-900 p-2 w-16">Jumlah</th>
                <th className="border border-slate-900 p-2 w-20">Kondisi</th>
                <th className="border border-slate-900 p-2 w-28 text-right">Harga Satuan</th>
                <th className="border border-slate-900 p-2 w-32 text-right">Total Nilai</th>
                <th className="border border-slate-900 p-2 w-24">Sumber Dana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBarang.length === 0 ? (
                <tr>
                  <td colSpan={10} className="border border-slate-900 p-6 text-center text-slate-500 italic">
                    Tidak ada data inventaris yang sesuai dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredBarang.map((item, idx) => {
                  const qty = Number(item.jumlah) || 1;
                  const harga = Number(item.hargaSatuan) || 0;
                  const total = Number(item.totalNilai) || qty * harga;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 print:hover:bg-transparent print-break-inside-avoid">
                      <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-mono font-bold text-indigo-900 print:text-black">
                        {item.kodeBarang}
                      </td>
                      <td className="border border-slate-900 p-2 font-medium">
                        <div className="font-bold">{item.namaBarang}</div>
                        <div className="text-[10px] text-slate-600 print:text-black">
                          {item.merk && item.merk !== '-' ? `Merk: ${item.merk}` : ''}
                          {item.nomorSeri && item.nomorSeri !== '-' ? ` • S/N: ${item.nomorSeri}` : ''}
                        </div>
                      </td>
                      <td className="border border-slate-900 p-2">{item.ruanganNama || '-'}</td>
                      <td className="border border-slate-900 p-2 text-center">{item.tahunPengadaan || '-'}</td>
                      <td className="border border-slate-900 p-2 text-center font-bold">
                        {qty} {item.satuan || 'Unit'}
                      </td>
                      <td className="border border-slate-900 p-2 text-center font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            item.kondisi === 'Baik'
                              ? 'bg-emerald-100 text-emerald-800 print:bg-transparent print:text-black'
                              : item.kondisi === 'Rusak Ringan'
                              ? 'bg-amber-100 text-amber-800 print:bg-transparent print:text-black'
                              : 'bg-rose-100 text-rose-800 print:bg-transparent print:text-black'
                          }`}
                        >
                          {item.kondisi}
                        </span>
                      </td>
                      <td className="border border-slate-900 p-2 text-right">
                        Rp {harga.toLocaleString('id-ID')}
                      </td>
                      <td className="border border-slate-900 p-2 text-right font-bold">
                        Rp {total.toLocaleString('id-ID')}
                      </td>
                      <td className="border border-slate-900 p-2 text-center text-[10px] font-semibold">
                        {item.sumberDana || 'BOS'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* TOTAL FOOTER TABEL */}
            <tfoot>
              <tr className="bg-slate-100 print:bg-slate-200 font-extrabold text-slate-900">
                <td colSpan={5} className="border border-slate-900 p-2.5 text-center uppercase tracking-wider">
                  TOTAL KESELURUHAN ASET
                </td>
                <td className="border border-slate-900 p-2.5 text-center text-sm font-bold">
                  {stats.totalUnit.toLocaleString('id-ID')}
                </td>
                <td className="border border-slate-900 p-2.5 text-center text-[10px]">
                  B: {stats.baik} | RR: {stats.rusakRingan} | RB: {stats.rusakBerat}
                </td>
                <td className="border border-slate-900 p-2.5 text-right">-</td>
                <td className="border border-slate-900 p-2.5 text-right text-sm text-indigo-900 print:text-black font-extrabold">
                  Rp {stats.totalNilai.toLocaleString('id-ID')}
                </td>
                <td className="border border-slate-900 p-2.5 text-center">-</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* KOLOM TANDA TANGAN RESMI KEMENDIKBUD / SURAT DINAS */}
        <div
          className="pt-8 text-xs text-center print:pt-10 print-break-inside-avoid"
          style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', width: '100%', boxSizing: 'border-box' }}
        >
          <div style={{ width: '46%', boxSizing: 'border-box' }}>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah {pengaturan.namaSekolah}</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase">{pengaturan.kepalaSekolah || 'Kepala Sekolah'}</p>
            <p className="font-mono text-[11px]">
              {pengaturan.nipKepalaSekolah && pengaturan.nipKepalaSekolah !== '-'
                ? `NIP. ${pengaturan.nipKepalaSekolah}`
                : 'NIP. -'}
            </p>
          </div>

          <div style={{ width: '46%', boxSizing: 'border-box' }}>
            <p>Sendang Agung, {todayStr}</p>
            <p className="font-bold">Wakil Kepala Urusan Sarana & Prasarana</p>
            <div className="h-20"></div>
            <p className="font-bold underline uppercase">
              {pengaturan.wakaSarpras || 'Bambang Supriyadi, S.Pd.'}
            </p>
            <p className="font-mono text-[11px]">
              {pengaturan.nipWakaSarpras && pengaturan.nipWakaSarpras !== '-'
                ? `NIP. ${pengaturan.nipWakaSarpras}`
                : 'NIP. 19820412 200604 1 015'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL UPLOAD & PENGATURAN KOP SURAT LAPORAN                */}
      {/* ========================================================= */}
      {isKopModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-indigo-700 to-indigo-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Kop Surat Dokumen & Laporan</h3>
                  <p className="text-[11px] text-indigo-200">
                    Atur kop surat resmi untuk Buku Induk, KIR, dan Rekap Sarpras
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKopModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Mode Pilihan Kop */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Pilih Format Kop Surat:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdatePengaturan) {
                        onUpdatePengaturan({
                          ...pengaturan,
                          tipeKopSurat: 'gambar',
                        });
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                      pengaturan.tipeKopSurat !== 'teks_otomatis' && pengaturan.kopSuratUrl
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        <span>Kop Gambar Kustom</span>
                      </span>
                      {pengaturan.tipeKopSurat !== 'teks_otomatis' && pengaturan.kopSuratUrl && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Gunakan file gambar kop surat resmi (banner) yang sudah mencakup logo dan alamat sekolah.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdatePengaturan) {
                        onUpdatePengaturan({
                          ...pengaturan,
                          tipeKopSurat: 'teks_otomatis',
                        });
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                      pengaturan.tipeKopSurat === 'teks_otomatis' || !pengaturan.kopSuratUrl
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Kop Teks Resmi</span>
                      </span>
                      {(pengaturan.tipeKopSurat === 'teks_otomatis' || !pengaturan.kopSuratUrl) && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Format standar tipografi resmi dengan garis ganda tebal, nama sekolah, NPSN, dan alamat.
                    </p>
                  </button>
                </div>
              </div>

              {/* Area Upload File Kop Surat Gambar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    File Gambar Kop Surat:
                  </label>
                  {(tempKopUrl || pengaturan.kopSuratUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveKopImage}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Gambar</span>
                    </button>
                  )}
                </div>

                {/* Hidden input file */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadKopFile(file);
                    e.target.value = '';
                  }}
                />

                {/* Dropzone / Upload Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUploadKopFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-indigo-600 bg-indigo-50/70'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70 bg-slate-50/40'
                  }`}
                >
                  {isUploadingKop ? (
                    <div className="py-4 space-y-2">
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="font-bold text-indigo-700">Mengoptimalkan & mengunggah gambar kop surat...</p>
                    </div>
                  ) : (tempKopUrl || pengaturan.kopSuratUrl) ? (
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs max-h-36 overflow-hidden flex items-center justify-center">
                        <img
                          src={tempKopUrl || pengaturan.kopSuratUrl}
                          alt="Pratinjau Kop Surat"
                          className="max-h-28 max-w-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Klik untuk mengganti gambar kop surat</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-3 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                        <FileUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          Klik untuk memilih file atau seret gambar ke sini
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Mendukung PNG, JPG, JPEG, WebP (Otomatis dioptimalkan agar proporsional dan tidak hilang)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alternatif: Input URL Gambar Online */}
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={urlKopInput}
                    onChange={(e) => setUrlKopInput(e.target.value)}
                    placeholder="Atau tempel link URL gambar online (https://...)"
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrlKop}
                    disabled={!urlKopInput.trim()}
                    className="px-3 py-2 bg-indigo-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer hover:bg-indigo-700"
                  >
                    Gunakan URL
                  </button>
                </div>

                {uploadError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    {uploadError}
                  </div>
                )}

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    💡 Petunjuk Kop Surat Gambar:
                  </p>
                  <p>
                    Unggah gambar kop surat utuh (termasuk logo provinsi/yayasan, nama sekolah, dan garis ganda). Sistem akan otomatis menyesuaikan ukuran agar proporsional di kertas A4 saat diunduh atau dicetak serta aman tersimpan permanen.
                  </p>
                </div>
              </div>

              {/* Pengaturan Teks Kop Tambahan */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-700 block">
                  Teks Baris Atas / Lembaga Naungan:
                </label>
                <input
                  type="text"
                  value={subKopInput}
                  onChange={(e) => setSubKopInput(e.target.value)}
                  placeholder="Contoh: PEMERINTAH PROVINSI LAMPUNG / YAYASAN PONDOK PESANTREN AL-HIKAM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Teks ini ditampilkan di baris paling atas jika menggunakan mode <b>Kop Teks Resmi</b>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Tersimpan otomatis ke database profil sekolah
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKopModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveKopSettings((tempKopUrl || pengaturan.kopSuratUrl) ? 'gambar' : 'teks_otomatis')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Terapkan ke Laporan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
