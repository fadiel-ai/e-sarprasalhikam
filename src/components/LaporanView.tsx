import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  DollarSign,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Printer,
  RotateCcw,
  School,
  Search,
  Sparkles,
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

interface LaporanViewProps {
  barangList: Barang[];
  kategoriList: Kategori[];
  ruanganList: Ruangan[];
  pengaturan: PengaturanSekolah;
}

type JenisLaporan = 'buku_induk' | 'per_ruangan' | 'kondisi_aset' | 'sumber_dana';

export const LaporanView: React.FC<LaporanViewProps> = ({
  barangList,
  kategoriList,
  ruanganList,
  pengaturan,
}) => {
  const [jenisLaporan, setJenisLaporan] = useState<JenisLaporan>('buku_induk');

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
            @page { size: A4 portrait; margin: 8mm 6mm; }
          </style>
        </head>
        <body>
          ${printEl.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 300);
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Download Spreadsheet Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel/CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Cetak format cetak A4 / PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (A4)</span>
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
        <div className="border-b-4 border-double border-slate-900 pb-3 text-center">
          <div className="flex items-center justify-center gap-4 mb-1">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold print:border print:border-black shrink-0">
              🏫
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-slate-600">
                PEMERINTAH PROVINSI LAMPUNG / YAYASAN PENDIDIKAN
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

        {/* JUDUL DOKUMEN LAPORAN */}
        <div className="text-center space-y-1">
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
          <div className="grid grid-cols-2 text-xs border border-slate-300 p-3 rounded-lg bg-slate-50 print:bg-transparent">
            <div className="space-y-1">
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
            <div className="space-y-1 text-right sm:text-left sm:pl-8">
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
                    <tr key={item.id} className="hover:bg-slate-50 print:hover:bg-transparent">
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
        <div className="pt-8 text-xs grid grid-cols-2 gap-8 text-center print:pt-10">
          <div>
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

          <div>
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
    </div>
  );
};
