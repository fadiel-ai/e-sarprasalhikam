import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  Barcode,
  Building,
  Calendar,
  CheckSquare,
  Columns,
  Filter,
  Layers,
  Printer,
  QrCode,
  Scan,
  School,
  Search,
  Sparkles,
  Square,
} from 'lucide-react';
import {
  Barang,
  BarcodePrintConfig,
  Kategori,
  PengaturanSekolah,
  Ruangan,
} from '../types/inventory';

interface BarcodeViewProps {
  barangList: Barang[];
  kategoriList: Kategori[];
  ruanganList: Ruangan[];
  pengaturan: PengaturanSekolah;
  preselectedIds?: string[];
}

export const BarcodeView: React.FC<BarcodeViewProps> = ({
  barangList,
  kategoriList,
  ruanganList,
  pengaturan,
  preselectedIds = [],
}) => {
  // Configuration
  const [config, setConfig] = useState<BarcodePrintConfig>({
    layout: '2x5',
    format: 'both',
    labelWidthMm: 60,
    labelHeightMm: 35,
    columns: 2,
    showSchoolName: true,
    showRoomName: true,
    showYear: true,
    showCategory: true,
    selectedIds: preselectedIds.length > 0 ? preselectedIds : barangList.map((b) => b.id),
  });

  // Filter Target Items
  const [targetScope, setTargetScope] = useState<'all' | 'ruangan' | 'kategori' | 'custom'>('all');
  const [selectedRuanganId, setSelectedRuanganId] = useState<string>(ruanganList[0]?.id || '');
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>(kategoriList[0]?.id || '');

  // Scanner Simulator / Test Code
  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState<Barang | null>(null);

  // Sync selected items when scope changes
  useEffect(() => {
    if (targetScope === 'all') {
      setConfig((prev) => ({ ...prev, selectedIds: barangList.map((b) => b.id) }));
    } else if (targetScope === 'ruangan') {
      const ids = barangList.filter((b) => b.idRuangan === selectedRuanganId).map((b) => b.id);
      setConfig((prev) => ({ ...prev, selectedIds: ids }));
    } else if (targetScope === 'kategori') {
      const ids = barangList.filter((b) => b.idKategori === selectedKategoriId).map((b) => b.id);
      setConfig((prev) => ({ ...prev, selectedIds: ids }));
    }
  }, [targetScope, selectedRuanganId, selectedKategoriId, barangList]);

  // Selected items to print
  const itemsToPrint = barangList.filter((b) => config.selectedIds.includes(b.id));

  // Handle barcode test scan
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const clean = scanInput.trim().toLowerCase();
    const found = barangList.find(
      (b) =>
        b.kodeBarang.toLowerCase() === clean ||
        b.kodeBarang.toLowerCase().includes(clean) ||
        b.nomorSeri?.toLowerCase() === clean
    );
    setScannedResult(found || null);
    if (!found) {
      alert(`Barang dengan kode atau scan "${scanInput}" tidak ditemukan dalam database.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Hidden in print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Barcode className="w-5 h-5 text-indigo-600" />
            <span>Generator & Pencetakan Label Barcode Inventaris</span>
          </h2>
          <p className="text-xs text-slate-500">
            Cetak stiker identitas aset sekolah dengan Barcode Code 128 dan QR Code standar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={itemsToPrint.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak {itemsToPrint.length} Label Sekarang (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Control & Scanner Hub (Hidden in print) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Filter & Layout Options */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>1. Tentukan Barang yang Ingin Dicetak</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Target Barang</label>
              <select
                value={targetScope}
                onChange={(e) => setTargetScope(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="all">Semua Barang Sekolah ({barangList.length} Item)</option>
                <option value="ruangan">Filter Berdasarkan Ruangan</option>
                <option value="kategori">Filter Berdasarkan Kategori</option>
                <option value="custom">Pilih Manual Centang Sendiri</option>
              </select>
            </div>

            {targetScope === 'ruangan' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Ruangan</label>
                <select
                  value={selectedRuanganId}
                  onChange={(e) => setSelectedRuanganId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {ruanganList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.namaRuangan} ({r.kodeRuangan})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === 'kategori' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Kategori</label>
                <select
                  value={selectedKategoriId}
                  onChange={(e) => setSelectedKategoriId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKategori} ({k.kodeKategori})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetScope === 'custom' && (
              <div className="sm:col-span-2 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                {barangList.map((b) => {
                  const checked = config.selectedIds.includes(b.id);
                  return (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setConfig((prev) => ({
                            ...prev,
                            selectedIds: checked
                              ? prev.selectedIds.filter((id) => id !== b.id)
                              : [...prev.selectedIds, b.id],
                          }));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-mono text-slate-600">{b.kodeBarang}</span>
                      <span className="text-slate-800 font-medium truncate">{b.namaBarang}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Columns className="w-4 h-4 text-indigo-600" />
              <span>2. Format Desain & Ukuran Label</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Format Kode</label>
                <select
                  value={config.format}
                  onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="both">Kombinasi (Barcode + QR Code)</option>
                  <option value="barcode_only">Hanya Barcode (Code 128)</option>
                  <option value="qr_only">Hanya QR Code</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ukuran Stiker / Kolom</label>
                <select
                  value={config.columns}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      columns: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={2}>2 Kolom per Lembar (Stiker Sedang ~60x35 mm)</option>
                  <option value={3}>3 Kolom per Lembar (Stiker Kecil ~45x25 mm)</option>
                  <option value={1}>1 Kolom per Lembar (Label Besar ~100x50 mm)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Elemen Informasi</label>
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showSchoolName}
                      onChange={(e) => setConfig({ ...config, showSchoolName: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Nama Sekolah (Kop)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showRoomName}
                      onChange={(e) => setConfig({ ...config, showRoomName: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Lokasi Ruangan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showYear}
                      onChange={(e) => setConfig({ ...config, showYear: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Tahun Pengadaan</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Barcode Scanner Tool */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Scan className="w-4 h-4 text-emerald-600" />
              <span>Cek Cepat / Scan Barcode</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Ketik atau gunakan Barcode Scanner USB untuk mencari data barang seketika
            </p>

            <form onSubmit={handleScanSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik atau scan kode..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  className="w-full text-xs p-2.5 font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Cari Data Barang
              </button>
            </form>

            {scannedResult && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <p className="font-mono font-bold text-emerald-900">{scannedResult.kodeBarang}</p>
                <p className="font-bold text-slate-800">{scannedResult.namaBarang}</p>
                <p className="text-slate-600">
                  Ruangan: <b>{scannedResult.ruanganNama}</b>
                </p>
                <p className="text-slate-600">
                  Kondisi:{' '}
                  <b
                    className={
                      scannedResult.kondisi === 'Baik'
                        ? 'text-emerald-700'
                        : scannedResult.kondisi === 'Rusak Ringan'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }
                  >
                    {scannedResult.kondisi}
                  </b>
                </p>
                <p className="text-slate-500 text-[11px]">PJ: {scannedResult.penanggungJawab}</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
            <p className="font-semibold mb-1">💡 Tips Cetak Stiker:</p>
            <p>
              Gunakan kertas stiker A4 (Label Tom & Jerry No. 108 atau Continuous Stiker) dan set margin
              pencetakan browser ke "None / Minimal" agar posisi stiker presisi.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* PRINTABLE LABEL CANVAS / PREVIEW */}
      {/* ==================================================== */}
      <div className="bg-slate-100 p-6 rounded-2xl border border-slate-300">
        <div className="no-print flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Preview Lembar Cetak ({itemsToPrint.length} Label Terpilih)
          </span>
          <span className="text-xs text-slate-500">
            Layout: {config.columns} Kolom per Halaman
          </span>
        </div>

        {itemsToPrint.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Barcode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">Tidak ada label yang dipilih</p>
            <p className="text-xs">Pilih barang terlebih dahulu di panel pengaturan di atas.</p>
          </div>
        ) : (
          <div
            id="printArea"
            className={`grid gap-3.5 ${
              config.columns === 1
                ? 'grid-cols-1'
                : config.columns === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-3'
            }`}
          >
            {itemsToPrint.map((b) => (
              <BarcodeLabelCard
                key={b.id}
                barang={b}
                pengaturan={pengaturan}
                config={config}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface BarcodeLabelCardProps {
  barang: Barang;
  pengaturan: PengaturanSekolah;
  config: BarcodePrintConfig;
}

const BarcodeLabelCard: React.FC<BarcodeLabelCardProps> = ({ barang, pengaturan, config }) => {
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (config.format !== 'qr_only' && barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, barang.kodeBarang, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 1.5,
          height: 38,
          displayValue: true,
          fontSize: 10,
          font: 'monospace',
          margin: 0,
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (config.format !== 'barcode_only' && qrCanvasRef.current) {
      try {
        QRCode.toCanvas(
          qrCanvasRef.current,
          JSON.stringify({
            k: barang.kodeBarang,
            n: barang.namaBarang,
            r: barang.ruanganNama,
            y: barang.tahunPengadaan,
          }),
          {
            width: config.format === 'qr_only' ? 80 : 54,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          }
        );
      } catch (err) {
        console.error(err);
      }
    }
  }, [barang.kodeBarang, config.format]);

  return (
    <div className="bg-white border-2 border-slate-900 rounded-lg p-2.5 shadow-xs flex flex-col justify-between print-break-inside-avoid text-black font-sans">
      {/* Header Label (Kop Sekolah) */}
      {config.showSchoolName && (
        <div className="border-b border-black pb-1 mb-1.5 text-center flex items-center justify-between gap-1">
          <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center shrink-0">
            <School className="w-3 h-3 text-black" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase truncate tracking-tight">
              {pengaturan.namaSekolah || 'INVENTARIS SEKOLAH'}
            </p>
            <p className="text-[8px] text-slate-600 truncate">
              NPSN: {pengaturan.npsn || '20234567'} • LABEL ASET RESMI
            </p>
          </div>
          <div className="text-[8px] font-mono font-bold bg-black text-white px-1 py-0.5 rounded shrink-0">
            KIR
          </div>
        </div>
      )}

      {/* Item Title */}
      <div className="mb-1.5">
        <p className="text-[11px] font-bold leading-tight line-clamp-1">{barang.namaBarang}</p>
        <p className="text-[9px] text-slate-600 truncate">
          Merk: {barang.merk || '-'} {barang.nomorSeri && `• SN: ${barang.nomorSeri}`}
        </p>
      </div>

      {/* Visual Codes (Barcode / QR) */}
      <div className="flex items-center justify-center gap-2 py-1 my-auto">
        {config.format !== 'qr_only' && (
          <div className="flex flex-col items-center overflow-hidden">
            <svg ref={barcodeSvgRef} className="max-w-full h-auto"></svg>
          </div>
        )}

        {config.format !== 'barcode_only' && (
          <div className="shrink-0 flex flex-col items-center">
            <canvas ref={qrCanvasRef}></canvas>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-black/40 pt-1 mt-1 flex items-center justify-between text-[9px] font-medium text-slate-700">
        {config.showRoomName && <span className="truncate max-w-[140px]">{barang.ruanganNama}</span>}
        {config.showYear && <span>Th. {barang.tahunPengadaan}</span>}
      </div>
    </div>
  );
};
