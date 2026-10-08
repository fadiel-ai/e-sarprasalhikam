import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  DollarSign,
  Download,
  Edit2,
  FileText,
  FolderPlus,
  Layers,
  MapPin,
  Package,
  Plus,
  Printer,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { Barang, Kategori, PengaturanSekolah, Ruangan } from '../types/inventory';
import { formatDateIndo, formatRupiah } from '../utils/helpers';

interface KategoriRuanganViewProps {
  kategoriList: Kategori[];
  ruanganList: Ruangan[];
  barangList: Barang[];
  pengaturan: PengaturanSekolah;
  onSaveKategori: (kategori: Kategori) => void;
  onDeleteKategori: (id: string) => void;
  onSaveRuangan: (ruangan: Ruangan) => void;
  onDeleteRuangan: (id: string) => void;
}

export const KategoriRuanganView: React.FC<KategoriRuanganViewProps> = ({
  kategoriList,
  ruanganList,
  barangList,
  pengaturan,
  onSaveKategori,
  onDeleteKategori,
  onSaveRuangan,
  onDeleteRuangan,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kategori' | 'ruangan'>('kategori');

  // Modal States
  const [isKatModalOpen, setIsKatModalOpen] = useState(false);
  const [editingKat, setEditingKat] = useState<Kategori | null>(null);
  const [katForm, setKatForm] = useState<Partial<Kategori>>({
    kodeKategori: '',
    namaKategori: '',
    deskripsi: '',
    warna: '#3B82F6',
  });

  const [isRuangModalOpen, setIsRuangModalOpen] = useState(false);
  const [editingRuang, setEditingRuang] = useState<Ruangan | null>(null);
  const [ruangForm, setRuangForm] = useState<Partial<Ruangan>>({
    kodeRuangan: '',
    namaRuangan: '',
    gedung: 'Gedung Utama',
    lantai: 'Lantai 1',
    penanggungJawab: '',
    kapasitas: 32,
    deskripsi: '',
  });

  // KIR (Kartu Inventaris Ruangan) Print View State
  const [kirRuangan, setKirRuangan] = useState<Ruangan | null>(null);

  // Helper counts
  const getBarangByKat = (katId: string) => barangList.filter((b) => b.idKategori === katId);
  const getBarangByRuang = (ruangId: string) => barangList.filter((b) => b.idRuangan === ruangId);

  // Kategori handlers
  const handleOpenAddKat = () => {
    setEditingKat(null);
    setKatForm({
      kodeKategori: '',
      namaKategori: '',
      deskripsi: '',
      warna: '#3B82F6',
    });
    setIsKatModalOpen(true);
  };

  const handleOpenEditKat = (kat: Kategori) => {
    setEditingKat(kat);
    setKatForm({ ...kat });
    setIsKatModalOpen(true);
  };

  const handleSubmitKat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!katForm.namaKategori || !katForm.kodeKategori) {
      alert('Nama kategori dan kode kategori wajib diisi.');
      return;
    }

    const saved: Kategori = {
      id: editingKat ? editingKat.id : `KAT-${Date.now().toString().slice(-4)}`,
      kodeKategori: katForm.kodeKategori.toUpperCase().trim(),
      namaKategori: katForm.namaKategori.trim(),
      deskripsi: katForm.deskripsi || '',
      warna: katForm.warna || '#3B82F6',
    };

    onSaveKategori(saved);
    setIsKatModalOpen(false);
  };

  // Ruangan handlers
  const handleOpenAddRuang = () => {
    setEditingRuang(null);
    setRuangForm({
      kodeRuangan: '',
      namaRuangan: '',
      gedung: 'Gedung Utama',
      lantai: 'Lantai 1',
      penanggungJawab: '',
      kapasitas: 32,
      deskripsi: '',
    });
    setIsRuangModalOpen(true);
  };

  const handleOpenEditRuang = (ruang: Ruangan) => {
    setEditingRuang(ruang);
    setRuangForm({ ...ruang });
    setIsRuangModalOpen(true);
  };

  const handleSubmitRuang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruangForm.namaRuangan || !ruangForm.kodeRuangan) {
      alert('Nama ruangan dan kode ruangan wajib diisi.');
      return;
    }

    const saved: Ruangan = {
      id: editingRuang ? editingRuang.id : `RNG-${Date.now().toString().slice(-4)}`,
      kodeRuangan: ruangForm.kodeRuangan.toUpperCase().trim(),
      namaRuangan: ruangForm.namaRuangan.trim(),
      gedung: ruangForm.gedung || 'Gedung Utama',
      lantai: ruangForm.lantai || 'Lantai 1',
      penanggungJawab: ruangForm.penanggungJawab || 'Staf Sarpras',
      kapasitas: Number(ruangForm.kapasitas) || 30,
      deskripsi: ruangForm.deskripsi || '',
    };

    onSaveRuangan(saved);
    setIsRuangModalOpen(false);
  };

  // Trigger Print & Download for KIR
  const handlePrintKIR = () => {
    window.print();
  };

  const handleDownloadKIR = () => {
    const printEl = document.getElementById('printableKir');
    if (!printEl || !kirRuangan) return;

    const fileName = `Dokumen_KIR_${kirRuangan.namaRuangan.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>KIR - ${kirRuangan.namaRuangan} - ${pengaturan.namaSekolah}</title>
  <style>
    body { font-family: sans-serif; padding: 25px; background: white; color: black; }
    .bar { background: #0f172a; color: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .bar button { background: #4f46e5; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
    th, td { border: 1px solid black; padding: 6px; }
    th { background: #f1f5f9; }
    @media print { .bar { display: none; } body { padding: 0; } @page { size: A4; margin: 8mm; } }
  </style>
</head>
<body>
  <div class="bar">
    <span>📄 Kartu Inventaris Ruangan: ${kirRuangan.namaRuangan}</span>
    <button onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
  </div>
  ${printEl.innerHTML}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Subtab Switcher */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manajemen Kategori & Ruangan Sekolah</h2>
          <p className="text-xs text-slate-500">
            Klasifikasi aset sarana dan penempatan ruangan lengkap dengan Kartu Inventaris Ruangan (KIR)
          </p>
        </div>

        {/* Subtabs Button Group */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('kategori')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'kategori'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kategori Barang ({kategoriList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ruangan')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'ruangan'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Ruangan & KIR ({ruanganList.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: KATEGORI INVENTARIS */}
      {/* ==================================================== */}
      {activeSubTab === 'kategori' && (
        <div className="no-print space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Kategori membagi sarana sekolah ke dalam kelompok standar Dapodik & Kemendikbudristek
            </p>
            <button
              onClick={handleOpenAddKat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kategoriList.map((kat) => {
              const items = getBarangByKat(kat.id);
              const totalItems = items.reduce((acc, curr) => acc + (Number(curr.jumlah) || 1), 0);
              const totalNilai = items.reduce((acc, curr) => acc + (Number(curr.totalNilai) || 0), 0);

              return (
                <div
                  key={kat.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: kat.warna || '#3B82F6' }}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: kat.warna || '#3B82F6' }}
                        />
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {kat.kodeKategori}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditKat(kat)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (items.length > 0) {
                              alert(
                                `Kategori ini masih memiliki ${items.length} barang terkait. Pindahkan barang terlebih dahulu.`
                              );
                              return;
                            }
                            if (confirm(`Hapus kategori ${kat.namaKategori}?`)) {
                              onDeleteKategori(kat.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{kat.namaKategori}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{kat.deskripsi}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Populasi Barang</span>
                      <span className="font-bold text-slate-800">
                        {items.length} jenis ({totalItems} unit)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Total Nilai</span>
                      <span className="font-bold text-emerald-700">{formatRupiah(totalNilai)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: RUANGAN & KARTU INVENTARIS RUANGAN (KIR) */}
      {/* ==================================================== */}
      {activeSubTab === 'ruangan' && (
        <div className="no-print space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Kelola ruangan sekolah dan cetak Kartu Inventaris Ruangan (KIR) untuk ditempel di setiap ruangan
            </p>
            <button
              onClick={handleOpenAddRuang}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ruangan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ruanganList.map((ruang) => {
              const items = getBarangByRuang(ruang.id);
              const totalItems = items.reduce((acc, curr) => acc + (Number(curr.jumlah) || 1), 0);
              const totalNilai = items.reduce((acc, curr) => acc + (Number(curr.totalNilai) || 0), 0);

              return (
                <div
                  key={ruang.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {ruang.kodeRuangan}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setKirRuangan(ruang)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold flex items-center gap-1 border border-emerald-200"
                          title="Lihat & Cetak KIR"
                        >
                          <FileText className="w-3 h-3" />
                          <span>KIR</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditRuang(ruang)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Edit Ruangan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (items.length > 0) {
                              alert(
                                `Ruangan ini masih memiliki ${items.length} barang. Pindahkan barang ke ruangan lain terlebih dahulu.`
                              );
                              return;
                            }
                            if (confirm(`Hapus ruangan ${ruang.namaRuangan}?`)) {
                              onDeleteRuangan(ruang.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Hapus Ruangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{ruang.namaRuangan}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {ruang.gedung} • {ruang.lantai}
                      </span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>PJ: {ruang.penanggungJawab}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Barang Tersimpan</span>
                      <span className="font-bold text-slate-800">
                        {items.length} jenis ({totalItems} unit)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Nilai Sarpras</span>
                      <span className="font-bold text-emerald-700">{formatRupiah(totalNilai)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL KARTU INVENTARIS RUANGAN (KIR) SIAP CETAK */}
      {/* ==================================================== */}
      {kirRuangan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-6">
            {/* Modal Top Bar */}
            <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Preview Kartu Inventaris Ruangan (KIR)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Format resmi dokumen inventaris ruangan sekolah standar Kemendikbudristek
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadKIR}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  title="Unduh file dokumen KIR siap cetak"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Dokumen KIR</span>
                </button>
                <button
                  onClick={handlePrintKIR}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Langsung</span>
                </button>
                <button
                  onClick={() => setKirRuangan(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet (A4 format) */}
            <div id="printableKir" className="p-8 max-h-[80vh] overflow-y-auto bg-white text-black font-sans text-xs">
              {/* Kop Sekolah */}
              <div className="border-b-2 border-black pb-3 mb-4 text-center">
                <h2 className="text-base font-extrabold uppercase tracking-wide">
                  {pengaturan.namaSekolah}
                </h2>
                <p className="text-[11px] font-medium">
                  {pengaturan.alamat}, {pengaturan.kelurahan}, {pengaturan.kecamatan},{' '}
                  {pengaturan.kabupatenKota} - NPSN: {pengaturan.npsn}
                </p>
                <p className="text-[10px] text-slate-700">
                  Telp: {pengaturan.kontakSekolah} • Email: {pengaturan.emailSekolah}
                </p>
              </div>

              {/* Title Document */}
              <div className="text-center mb-5">
                <h3 className="text-sm font-bold uppercase underline tracking-wider">
                  KARTU INVENTARIS RUANGAN (KIR)
                </h3>
                <p className="text-[11px] font-semibold mt-0.5">
                  RUANGAN: {kirRuangan.namaRuangan.toUpperCase()} ({kirRuangan.kodeRuangan})
                </p>
              </div>

              {/* Metadata Ruangan */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-[11px] border border-slate-300 p-3 rounded bg-slate-50/50">
                <div>
                  <p>
                    <span className="font-semibold inline-block w-36">Gedung / Lokasi:</span>{' '}
                    {kirRuangan.gedung} ({kirRuangan.lantai})
                  </p>
                  <p>
                    <span className="font-semibold inline-block w-36">Kapasitas:</span>{' '}
                    {kirRuangan.kapasitas} Orang
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold inline-block w-36">Penanggung Jawab:</span>{' '}
                    {kirRuangan.penanggungJawab}
                  </p>
                  <p>
                    <span className="font-semibold inline-block w-36">Tanggal Cetak:</span>{' '}
                    {formatDateIndo(new Date().toISOString().slice(0, 10))}
                  </p>
                </div>
              </div>

              {/* Tabel Barang Ruangan */}
              <table className="w-full border-collapse border border-black text-[11px] mb-8">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-1.5 w-8">No</th>
                    <th className="border border-black p-1.5 w-32">Kode Barang</th>
                    <th className="border border-black p-1.5">Nama Barang / Spesifikasi</th>
                    <th className="border border-black p-1.5 w-24">Merk / Model</th>
                    <th className="border border-black p-1.5 w-16">Tahun</th>
                    <th className="border border-black p-1.5 w-14">Jumlah</th>
                    <th className="border border-black p-1.5 w-24">Kondisi</th>
                    <th className="border border-black p-1.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {getBarangByRuang(kirRuangan.id).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-black p-4 text-center text-slate-500">
                        Belum ada barang yang ditempatkan di ruangan ini.
                      </td>
                    </tr>
                  ) : (
                    getBarangByRuang(kirRuangan.id).map((b, idx) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 font-mono font-semibold">
                          {b.kodeBarang}
                        </td>
                        <td className="border border-black p-1.5 font-medium">{b.namaBarang}</td>
                        <td className="border border-black p-1.5">{b.merk || '-'}</td>
                        <td className="border border-black p-1.5 text-center">{b.tahunPengadaan}</td>
                        <td className="border border-black p-1.5 text-center font-bold">
                          {b.jumlah} {b.satuan}
                        </td>
                        <td className="border border-black p-1.5 text-center font-semibold">
                          {b.kondisi}
                        </td>
                        <td className="border border-black p-1.5 text-[10px]">
                          {b.keterangan || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Tanda Tangan Pengesahan Standar */}
              <div className="grid grid-cols-2 text-center text-[11px] pt-4 print-break-inside-avoid">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala Sekolah</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{pengaturan.kepalaSekolah}</p>
                  <p>NIP. {pengaturan.nipKepalaSekolah}</p>
                </div>
                <div>
                  <p>{pengaturan.kabupatenKota}, {formatDateIndo(new Date().toISOString().slice(0, 10))}</p>
                  <p className="font-semibold">Penanggung Jawab Ruangan</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{kirRuangan.penanggungJawab}</p>
                  <p>NIP/NUPTK: -</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Kategori */}
      {isKatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingKat ? 'Edit Kategori Inventaris' : 'Tambah Kategori Inventaris'}
              </h3>
              <button
                onClick={() => setIsKatModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitKat} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Elektronik & TIK"
                  value={katForm.namaKategori || ''}
                  onChange={(e) => setKatForm({ ...katForm, namaKategori: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kode Singkatan (Maks 4 huruf) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={5}
                  required
                  placeholder="Contoh: KOMP"
                  value={katForm.kodeKategori || ''}
                  onChange={(e) =>
                    setKatForm({ ...katForm, kodeKategori: e.target.value.toUpperCase() })
                  }
                  className="w-full p-2.5 font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Warna Label</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={katForm.warna || '#3B82F6'}
                    onChange={(e) => setKatForm({ ...katForm, warna: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <span className="font-mono text-slate-600">{katForm.warna || '#3B82F6'}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan jenis sarana yang termasuk dalam kategori ini"
                  value={katForm.deskripsi || ''}
                  onChange={(e) => setKatForm({ ...katForm, deskripsi: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKatModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Ruangan */}
      {isRuangModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingRuang ? 'Edit Ruangan' : 'Tambah Ruangan Baru'}
              </h3>
              <button
                onClick={() => setIsRuangModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitRuang} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laboratorium Komputer 2"
                  value={ruangForm.namaRuangan || ''}
                  onChange={(e) => setRuangForm({ ...ruangForm, namaRuangan: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Kode Singkatan Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: LAB-KOM2"
                  value={ruangForm.kodeRuangan || ''}
                  onChange={(e) =>
                    setRuangForm({ ...ruangForm, kodeRuangan: e.target.value.toUpperCase() })
                  }
                  className="w-full p-2.5 font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gedung</label>
                  <input
                    type="text"
                    placeholder="Gedung B"
                    value={ruangForm.gedung || ''}
                    onChange={(e) => setRuangForm({ ...ruangForm, gedung: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lantai</label>
                  <input
                    type="text"
                    placeholder="Lantai 2"
                    value={ruangForm.lantai || ''}
                    onChange={(e) => setRuangForm({ ...ruangForm, lantai: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Penanggung Jawab Ruangan
                </label>
                <input
                  type="text"
                  placeholder="Nama guru / kepala lab"
                  value={ruangForm.penanggungJawab || ''}
                  onChange={(e) => setRuangForm({ ...ruangForm, penanggungJawab: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kapasitas (Orang)</label>
                <input
                  type="number"
                  min="1"
                  value={ruangForm.kapasitas || 30}
                  onChange={(e) =>
                    setRuangForm({ ...ruangForm, kapasitas: parseInt(e.target.value) || 30 })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRuangModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
