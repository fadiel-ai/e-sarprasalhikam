import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import {
  AlertCircle,
  Barcode,
  Check,
  Copy,
  Download,
  Edit2,
  Eye,
  Filter,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  Barang,
  Kategori,
  KondisiBarang,
  Ruangan,
  SatuanBarang,
  SumberDana,
} from '../types/inventory';
import { exportToCSV, formatDateIndo, formatRupiah } from '../utils/helpers';

interface BarangViewProps {
  barangList: Barang[];
  kategoriList: Kategori[];
  ruanganList: Ruangan[];
  onSaveBarang: (barang: Barang) => void;
  onDeleteBarang: (id: string) => void;
  onPrintSelectedBarcode: (ids: string[]) => void;
  selectedBarangDetail?: Barang | null;
  onCloseDetailModal: () => void;
  isAddModalOpen: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
}

export const BarangView: React.FC<BarangViewProps> = ({
  barangList,
  kategoriList,
  ruanganList,
  onSaveBarang,
  onDeleteBarang,
  onPrintSelectedBarcode,
  selectedBarangDetail,
  onCloseDetailModal,
  isAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterRuangan, setFilterRuangan] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('');
  const [filterSumberDana, setFilterSumberDana] = useState('');

  // Selected for batch action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Editing state
  const [editingBarang, setEditingBarang] = useState<Barang | null>(null);

  // Active detail modal
  const [activeDetail, setActiveDetail] = useState<Barang | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<Barang>>({
    namaBarang: '',
    idKategori: '',
    idRuangan: '',
    kodeBarang: '',
    merk: '',
    nomorSeri: '',
    tahunPengadaan: new Date().getFullYear(),
    sumberDana: 'BOS Reguler',
    kondisi: 'Baik',
    jumlah: 1,
    satuan: 'Unit',
    hargaSatuan: 0,
    penanggungJawab: '',
    keterangan: '',
  });

  const [copiedCode, setCopiedCode] = useState(false);

  // Barcode & QR code refs for detail modal
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (selectedBarangDetail) {
      setActiveDetail(selectedBarangDetail);
    }
  }, [selectedBarangDetail]);

  // Render Barcode & QR Code in detail modal
  useEffect(() => {
    if (activeDetail) {
      if (barcodeSvgRef.current) {
        try {
          JsBarcode(barcodeSvgRef.current, activeDetail.kodeBarang, {
            format: 'CODE128',
            lineColor: '#0f172a',
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 13,
            font: 'monospace',
          });
        } catch (e) {
          console.error('Barcode error', e);
        }
      }
      if (qrCanvasRef.current) {
        try {
          QRCode.toCanvas(
            qrCanvasRef.current,
            JSON.stringify({
              kode: activeDetail.kodeBarang,
              nama: activeDetail.namaBarang,
              ruang: activeDetail.ruanganNama,
              kondisi: activeDetail.kondisi,
            }),
            {
              width: 140,
              margin: 1,
              color: {
                dark: '#0f172a',
                light: '#ffffff',
              },
            }
          );
        } catch (e) {
          console.error('QR code error', e);
        }
      }
    }
  }, [activeDetail]);

  // Filtered barang list
  const filteredBarang = barangList.filter((b) => {
    const matchSearch =
      b.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKategori = !filterKategori || b.idKategori === filterKategori;
    const matchRuangan = !filterRuangan || b.idRuangan === filterRuangan;
    const matchKondisi = !filterKondisi || b.kondisi === filterKondisi;
    const matchSumberDana = !filterSumberDana || b.sumberDana === filterSumberDana;

    return matchSearch && matchKategori && matchRuangan && matchKondisi && matchSumberDana;
  });

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBarang.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBarang.map((b) => b.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Generate kode barang otomatis
  const generateKode = (katId: string, ruangId: string) => {
    const kat = kategoriList.find((k) => k.id === katId);
    const katCode = kat ? kat.kodeKategori : 'BRG';
    const rng = ruanganList.find((r) => r.id === ruangId);
    const rngCode = rng ? rng.kodeRuangan : 'UMUM';
    const count = barangList.length + 1;
    const padded = String(count).padStart(3, '0');
    return `INV-${katCode}-${rngCode}-${padded}`;
  };

  const handleOpenAdd = () => {
    const initialKat = kategoriList[0]?.id || '';
    const initialRuang = ruanganList[0]?.id || '';
    const initialKode = generateKode(initialKat, initialRuang);

    setEditingBarang(null);
    setFormState({
      namaBarang: '',
      idKategori: initialKat,
      idRuangan: initialRuang,
      kodeBarang: initialKode,
      merk: '',
      nomorSeri: '',
      tahunPengadaan: new Date().getFullYear(),
      sumberDana: 'BOS Reguler',
      kondisi: 'Baik',
      jumlah: 1,
      satuan: 'Unit',
      hargaSatuan: 0,
      penanggungJawab: ruanganList[0]?.penanggungJawab || '',
      keterangan: '',
    });
    onOpenAddModal();
  };

  const handleOpenEdit = (barang: Barang) => {
    setEditingBarang(barang);
    setFormState({ ...barang });
    onOpenAddModal();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.namaBarang || !formState.idKategori || !formState.idRuangan) {
      alert('Mohon lengkapi Nama Barang, Kategori, dan Ruangan.');
      return;
    }

    const kat = kategoriList.find((k) => k.id === formState.idKategori);
    const rng = ruanganList.find((r) => r.id === formState.idRuangan);

    const qty = Number(formState.jumlah) || 1;
    const harga = Number(formState.hargaSatuan) || 0;

    const savedItem: Barang = {
      id: editingBarang ? editingBarang.id : `BRG-${Date.now().toString().slice(-6)}`,
      kodeBarang: formState.kodeBarang || generateKode(formState.idKategori!, formState.idRuangan!),
      namaBarang: formState.namaBarang || '',
      idKategori: formState.idKategori || '',
      kategoriNama: kat ? kat.namaKategori : 'Umum',
      idRuangan: formState.idRuangan || '',
      ruanganNama: rng ? rng.namaRuangan : 'Umum',
      merk: formState.merk || '-',
      nomorSeri: formState.nomorSeri || '-',
      tahunPengadaan: Number(formState.tahunPengadaan) || new Date().getFullYear(),
      sumberDana: (formState.sumberDana as SumberDana) || 'BOS Reguler',
      kondisi: (formState.kondisi as KondisiBarang) || 'Baik',
      jumlah: qty,
      satuan: (formState.satuan as SatuanBarang) || 'Unit',
      hargaSatuan: harga,
      totalNilai: qty * harga,
      penanggungJawab: formState.penanggungJawab || rng?.penanggungJawab || 'Staf Sarpras',
      keterangan: formState.keterangan || '',
      tanggalInput: editingBarang ? editingBarang.tanggalInput : new Date().toISOString().slice(0, 10),
      tanggalUpdate: new Date().toISOString().slice(0, 10),
    };

    onSaveBarang(savedItem);
    onCloseAddModal();
  };

  const handleExportCSV = () => {
    const headers = [
      { key: 'kodeBarang', label: 'Kode Barang' },
      { key: 'namaBarang', label: 'Nama Barang' },
      { key: 'kategoriNama', label: 'Kategori' },
      { key: 'ruanganNama', label: 'Ruangan' },
      { key: 'merk', label: 'Merk / Model' },
      { key: 'nomorSeri', label: 'Nomor Seri' },
      { key: 'tahunPengadaan', label: 'Tahun' },
      { key: 'sumberDana', label: 'Sumber Dana' },
      { key: 'kondisi', label: 'Kondisi' },
      { key: 'jumlah', label: 'Jumlah' },
      { key: 'satuan', label: 'Satuan' },
      { key: 'hargaSatuan', label: 'Harga Satuan (Rp)' },
      { key: 'totalNilai', label: 'Total Nilai (Rp)' },
      { key: 'penanggungJawab', label: 'Penanggung Jawab' },
      { key: 'keterangan', label: 'Keterangan' },
    ];
    exportToCSV(`Inventaris_Sekolah_${new Date().toISOString().slice(0, 10)}`, filteredBarang, headers);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Action & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Daftar Data Barang Inventaris</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredBarang.length} Item
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan sarana sekolah terintegrasi dengan kode unik & label barcode
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => onPrintSelectedBarcode(selectedIds)}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Barcode className="w-4 h-4" />
              <span>Cetak Barcode ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95"
            title="Download Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama barang, kode inventaris, merk, atau penanggung jawab..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Reset */}
          {(filterKategori || filterRuangan || filterKondisi || filterSumberDana || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterKategori('');
                setFilterRuangan('');
                setFilterKondisi('');
                setFilterSumberDana('');
              }}
              className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-medium flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Multi-dropdown Filter row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Kategori
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKategori}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ruangan
            </label>
            <select
              value={filterRuangan}
              onChange={(e) => setFilterRuangan(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Semua Ruangan</option>
              {ruanganList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.namaRuangan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Kondisi
            </label>
            <select
              value={filterKondisi}
              onChange={(e) => setFilterKondisi(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Semua Kondisi</option>
              <option value="Baik">Kondisi Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sumber Dana
            </label>
            <select
              value={filterSumberDana}
              onChange={(e) => setFilterSumberDana(e.target.value)}
              className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
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

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredBarang.length > 0 && selectedIds.length === filteredBarang.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-3 min-w-[170px]">Kode & Barcode</th>
                <th className="p-3 min-w-[200px]">Nama Barang & Merk</th>
                <th className="p-3 min-w-[150px]">Ruangan & Kategori</th>
                <th className="p-3 text-center">Kondisi</th>
                <th className="p-3 text-center">Jumlah</th>
                <th className="p-3 text-right min-w-[120px]">Nilai Aset</th>
                <th className="p-3 min-w-[130px]">Sumber Dana / Th</th>
                <th className="p-3 text-center min-w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBarang.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada barang yang sesuai filter</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau reset filter</p>
                  </td>
                </tr>
              ) : (
                filteredBarang.map((b) => {
                  const isChecked = selectedIds.includes(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(b.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="p-3">
                        <div className="font-mono font-semibold text-slate-900 flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{b.kodeBarang}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          SN: {b.nomorSeri || '-'}
                        </span>
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-slate-800 leading-snug">{b.namaBarang}</p>
                        <p className="text-[11px] text-slate-500">
                          {b.merk} • PJ: <span className="font-medium text-slate-600">{b.penanggungJawab}</span>
                        </p>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-slate-700 block truncate">
                          {b.ruanganNama}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {b.kategoriNama}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            b.kondisi === 'Baik'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.kondisi === 'Rusak Ringan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {b.kondisi}
                        </span>
                      </td>

                      <td className="p-3 text-center font-bold text-slate-800">
                        {b.jumlah}{' '}
                        <span className="text-[11px] font-normal text-slate-500">{b.satuan}</span>
                      </td>

                      <td className="p-3 text-right">
                        <p className="font-extrabold text-slate-900">{formatRupiah(b.totalNilai)}</p>
                        <p className="text-[10px] text-slate-400">@{formatRupiah(b.hargaSatuan)}</p>
                      </td>

                      <td className="p-3">
                        <p className="font-medium text-slate-700">{b.sumberDana}</p>
                        <p className="text-[11px] text-slate-400">Tahun {b.tahunPengadaan}</p>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setActiveDetail(b)}
                            title="Lihat Detail & Barcode"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintSelectedBarcode([b.id])}
                            title="Cetak Label Barcode"
                            className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(b)}
                            title="Edit Data Barang"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus ${b.namaBarang} (${b.kodeBarang})?`)) {
                                onDeleteBarang(b.id);
                              }
                            }}
                            title="Hapus Barang"
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Menampilkan <b>{filteredBarang.length}</b> dari total <b>{barangList.length}</b> jenis barang
          </span>
          <div className="flex items-center gap-3">
            <span>
              Total Nilai Terpilih:{' '}
              <b className="text-slate-800">
                {formatRupiah(
                  filteredBarang.reduce((sum, item) => sum + (Number(item.totalNilai) || 0), 0)
                )}
              </b>
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL DETAIL BARANG (DENGAN BARCODE & QR CODE RESMI) */}
      {/* ==================================================== */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                  Kartu Inventaris Aset Fisik
                </span>
                <h3 className="text-base font-bold truncate max-w-md">{activeDetail.namaBarang}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveDetail(null);
                  onCloseDetailModal();
                }}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Barcode & QR Code Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center justify-center flex-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Barcode Standar (Code 128)
                  </span>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <svg ref={barcodeSvgRef} className="max-w-full"></svg>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs font-mono font-bold text-slate-800">
                      {activeDetail.kodeBarang}
                    </code>
                    <button
                      onClick={() => handleCopyCode(activeDetail.kodeBarang)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                      title="Salin Kode"
                    >
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    QR Code Pintar
                  </span>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <canvas ref={qrCanvasRef}></canvas>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Scan via Smartphone</span>
                </div>
              </div>

              {/* Detail Data Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Kategori Inventaris</span>
                  <span className="font-semibold text-slate-800">{activeDetail.kategoriNama}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lokasi Ruangan</span>
                  <span className="font-semibold text-slate-800">{activeDetail.ruanganNama}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Merk / Tipe</span>
                  <span className="font-semibold text-slate-800">{activeDetail.merk || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nomor Seri Pabrik</span>
                  <span className="font-mono text-slate-800">{activeDetail.nomorSeri || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kondisi Barang</span>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      activeDetail.kondisi === 'Baik'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeDetail.kondisi === 'Rusak Ringan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeDetail.kondisi}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kuantitas Fisik</span>
                  <span className="font-bold text-slate-800">
                    {activeDetail.jumlah} {activeDetail.satuan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Harga Satuan Perolehan</span>
                  <span className="font-semibold text-slate-800">
                    {formatRupiah(activeDetail.hargaSatuan)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Nilai Buku</span>
                  <span className="font-bold text-emerald-700">
                    {formatRupiah(activeDetail.totalNilai)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sumber Dana Anggaran</span>
                  <span className="font-semibold text-slate-800">{activeDetail.sumberDana}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tahun Pengadaan</span>
                  <span className="font-semibold text-slate-800">Tahun {activeDetail.tahunPengadaan}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Penanggung Jawab Sarpras</span>
                  <span className="font-semibold text-slate-800">{activeDetail.penanggungJawab}</span>
                </div>
                {activeDetail.keterangan && (
                  <div className="col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Catatan / Keterangan</span>
                    <p className="text-slate-700 italic mt-0.5">{activeDetail.keterangan}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Terdaftar: {formatDateIndo(activeDetail.tanggalInput)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetId = activeDetail.id;
                    setActiveDetail(null);
                    onPrintSelectedBarcode([targetId]);
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Label Ini</span>
                </button>
                <button
                  onClick={() => {
                    setActiveDetail(null);
                    onCloseDetailModal();
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL INPUT / EDIT DATA BARANG */}
      {/* ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-linear-to-r from-indigo-700 to-blue-700 text-white p-4 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingBarang ? 'Edit Data Barang Inventaris' : 'Tambah Barang Inventaris Baru'}
              </h3>
              <button
                onClick={onCloseAddModal}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Barang */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Barang / Sarana <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Laptop Core i7 Siswa / Meja Belajar Tunggal"
                    value={formState.namaBarang || ''}
                    onChange={(e) => setFormState({ ...formState, namaBarang: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kategori Inventaris <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formState.idKategori || ''}
                    onChange={(e) => {
                      const newKat = e.target.value;
                      setFormState({
                        ...formState,
                        idKategori: newKat,
                        kodeBarang: generateKode(newKat, formState.idRuangan || ''),
                      });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKategori} ({k.kodeKategori})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ruangan */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Penempatan Ruangan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formState.idRuangan || ''}
                    onChange={(e) => {
                      const newRngId = e.target.value;
                      const targetRng = ruanganList.find((r) => r.id === newRngId);
                      setFormState({
                        ...formState,
                        idRuangan: newRngId,
                        penanggungJawab: targetRng?.penanggungJawab || formState.penanggungJawab,
                        kodeBarang: generateKode(formState.idKategori || '', newRngId),
                      });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    {ruanganList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.namaRuangan} ({r.kodeRuangan})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kode Barang */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Kode Inventaris / Barcode <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          kodeBarang: generateKode(
                            formState.idKategori || '',
                            formState.idRuangan || ''
                          ),
                        })
                      }
                      className="text-[10px] text-indigo-600 hover:underline font-semibold"
                    >
                      Generate Ulang
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formState.kodeBarang || ''}
                    onChange={(e) => setFormState({ ...formState, kodeBarang: e.target.value })}
                    className="w-full p-2.5 font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Format standar: INV-[KODE KATEGORI]-[KODE RUANGAN]-[NOMOR URUT]
                  </p>
                </div>

                {/* Merk & Nomor Seri */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Merk / Tipe Pabrik</label>
                  <input
                    type="text"
                    placeholder="Contoh: Asus / Epson / Informa"
                    value={formState.merk || ''}
                    onChange={(e) => setFormState({ ...formState, merk: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Seri (Serial No.)</label>
                  <input
                    type="text"
                    placeholder="Contoh: SN-882914 (opsional)"
                    value={formState.nomorSeri || ''}
                    onChange={(e) => setFormState({ ...formState, nomorSeri: e.target.value })}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Kondisi & Sumber Dana */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kondisi Kelaikan</label>
                  <select
                    value={formState.kondisi || 'Baik'}
                    onChange={(e) =>
                      setFormState({ ...formState, kondisi: e.target.value as KondisiBarang })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                  >
                    <option value="Baik">🟢 Baik (Siap Digunakan)</option>
                    <option value="Rusak Ringan">🟡 Rusak Ringan (Butuh Servis)</option>
                    <option value="Rusak Berat">🔴 Rusak Berat (Usul Hapus)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sumber Dana Pengadaan</label>
                  <select
                    value={formState.sumberDana || 'BOS Reguler'}
                    onChange={(e) =>
                      setFormState({ ...formState, sumberDana: e.target.value as SumberDana })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    <option value="BOS Reguler">BOS Reguler</option>
                    <option value="BOS Kinerja">BOS Kinerja</option>
                    <option value="DAK Fisik">DAK Fisik</option>
                    <option value="Komite Sekolah">Komite Sekolah</option>
                    <option value="Hibah / Yayasan">Hibah / Yayasan</option>
                    <option value="APBD">APBD</option>
                  </select>
                </div>

                {/* Jumlah & Satuan */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah (Kuantitas)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formState.jumlah || 1}
                    onChange={(e) =>
                      setFormState({ ...formState, jumlah: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <select
                    value={formState.satuan || 'Unit'}
                    onChange={(e) =>
                      setFormState({ ...formState, satuan: e.target.value as SatuanBarang })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Set">Set</option>
                    <option value="Buah">Buah</option>
                    <option value="Paket">Paket</option>
                    <option value="Rim">Rim</option>
                  </select>
                </div>

                {/* Harga Satuan & Tahun */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Harga Satuan Perolehan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formState.hargaSatuan || ''}
                    onChange={(e) =>
                      setFormState({ ...formState, hargaSatuan: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                  <span className="text-[10px] text-slate-400">
                    Total: {formatRupiah((formState.jumlah || 1) * (formState.hargaSatuan || 0))}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahun Pengadaan</label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formState.tahunPengadaan || new Date().getFullYear()}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        tahunPengadaan: parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Penanggung Jawab */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Penanggung Jawab Ruangan / Barang
                  </label>
                  <input
                    type="text"
                    placeholder="Nama guru/staf penanggung jawab"
                    value={formState.penanggungJawab || ''}
                    onChange={(e) =>
                      setFormState({ ...formState, penanggungJawab: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Catatan / Keterangan */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Catatan Khusus / Deskripsi Kerusakan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Catatan spesifikasi tambahan atau detail kerusakan jika ada"
                    value={formState.keterangan || ''}
                    onChange={(e) => setFormState({ ...formState, keterangan: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                  ></textarea>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseAddModal}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {editingBarang ? 'Simpan Perubahan' : 'Tambahkan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
