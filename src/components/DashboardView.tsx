import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Barcode,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FolderTree,
  Package,
  Plus,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Barang, Kategori, LogAktivitas, PengaturanSekolah, Ruangan } from '../types/inventory';
import { formatRupiah } from '../utils/helpers';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  barangList: Barang[];
  kategoriList: Kategori[];
  ruanganList: Ruangan[];
  logs: LogAktivitas[];
  pengaturan: PengaturanSekolah;
  onNavigate: (tab: NavTab) => void;
  onOpenAddBarang: () => void;
  onSelectBarangDetail: (barang: Barang) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  barangList,
  kategoriList,
  ruanganList,
  logs,
  pengaturan,
  onNavigate,
  onOpenAddBarang,
  onSelectBarangDetail,
}) => {
  // Statistics calculations
  const totalJenisBarang = barangList.length;
  const totalUnitBarang = barangList.reduce((acc, curr) => acc + (Number(curr.jumlah) || 1), 0);
  const totalNilaiAset = barangList.reduce((acc, curr) => acc + (Number(curr.totalNilai) || 0), 0);

  const barangBaik = barangList.filter((b) => b.kondisi === 'Baik');
  const totalUnitBaik = barangBaik.reduce((acc, curr) => acc + (Number(curr.jumlah) || 1), 0);

  const barangRusakRingan = barangList.filter((b) => b.kondisi === 'Rusak Ringan');
  const totalUnitRusakRingan = barangRusakRingan.reduce((acc, curr) => acc + (Number(curr.jumlah) || 1), 0);

  const barangRusakBerat = barangList.filter((b) => b.kondisi === 'Rusak Berat');
  const totalUnitRusakBerat = barangRusakBerat.reduce((acc, curr) => acc + (Number(curr.jumlah) || 1), 0);

  const totalRusak = barangRusakRingan.length + barangRusakBerat.length;
  const percentBaik = totalUnitBarang > 0 ? Math.round((totalUnitBaik / totalUnitBarang) * 100) : 0;

  // Items needing attention
  const urgentItems = [...barangRusakBerat, ...barangRusakRingan];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-indigo-700/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 rounded-full text-indigo-200 text-xs font-semibold mb-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Manajemen Sarana & Prasarana Sekolah</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {pengaturan.namaSekolah || 'Inventaris Sarpras Sekolah'}
            </h2>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Pengelolaan inventaris berbasis barcode/QR code yang terhubung otomatis ke Google Spreadsheet via Google Apps Script.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddBarang}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Barang</span>
            </button>
            <button
              onClick={() => onNavigate('laporan')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/50 hover:bg-indigo-500/70 active:scale-95 text-white text-sm font-semibold rounded-xl backdrop-blur-xs transition-all border border-indigo-400/40 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-200" />
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={() => onNavigate('barcode')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-semibold rounded-xl backdrop-blur-xs transition-all border border-white/15 cursor-pointer"
            >
              <Barcode className="w-4 h-4 text-amber-300" />
              <span>Cetak Barcode</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Aset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Barang
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {totalUnitBarang} <span className="text-sm font-normal text-slate-500">Unit</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dari <b>{totalJenisBarang}</b> jenis item terdaftar
            </p>
          </div>
        </div>

        {/* Nilai Total Investasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nilai Perolehan Aset
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 truncate" title={formatRupiah(totalNilaiAset)}>
              {formatRupiah(totalNilaiAset)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kompilasi dana BOS, DAK, & Komite
            </p>
          </div>
        </div>

        {/* Kondisi Baik */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kondisi Baik
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-teal-700">
              {totalUnitBaik} <span className="text-sm font-normal text-slate-500">Unit ({percentBaik}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="bg-teal-500 h-1.5 rounded-full"
                style={{ width: `${percentBaik}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Rusak / Butuh Perbaikan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Perlu Perbaikan / Rusak
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalRusak > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-extrabold ${totalRusak > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {totalUnitRusakRingan + totalUnitRusakBerat} <span className="text-sm font-normal text-slate-500">Unit</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-amber-600 font-medium">Ringan: {totalUnitRusakRingan}</span>
              <span>•</span>
              <span className="text-rose-600 font-medium">Berat: {totalUnitRusakBerat}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2 Column Section: Condition Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Kondisi & Sumber Dana */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Status Kelaikan Sarana & Prasarana</span>
            </h3>
            <button
              onClick={() => onNavigate('barang')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>Lihat Detail Semua Barang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress bar visual */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Kondisi Baik (Layak Pakai Penuh)
                </span>
                <span className="text-slate-700">{totalUnitBaik} Unit ({percentBaik}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentBaik}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Rusak Ringan (Bisa Digunakan / Butuh Servis)
                </span>
                <span className="text-slate-700">
                  {totalUnitRusakRingan} Unit ({totalUnitBarang > 0 ? Math.round((totalUnitRusakRingan / totalUnitBarang) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalUnitBarang > 0 ? (totalUnitRusakRingan / totalUnitBarang) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Rusak Berat (Tidak Berfungsi / Usul Hapus)
                </span>
                <span className="text-slate-700">
                  {totalUnitRusakBerat} Unit ({totalUnitBarang > 0 ? Math.round((totalUnitRusakBerat / totalUnitBarang) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalUnitBarang > 0 ? (totalUnitRusakBerat / totalUnitBarang) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick stats distribution by category & rooms */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Total Ruangan</span>
              <span className="text-lg font-bold text-slate-800">{ruanganList.length} Ruang</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Kategori Inventaris</span>
              <span className="text-lg font-bold text-slate-800">{kategoriList.length} Kategori</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 font-medium block">Integrasi Spreadsheet</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${pengaturan.gasWebAppUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                {pengaturan.gasWebAppUrl ? 'Terkoneksi' : 'Siap Terhubung'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Hub */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Aksi Cepat Inventaris</h3>
            <p className="text-xs text-slate-500 mb-4">
              Jalan pintas operasional sarana dan prasarana sekolah
            </p>

            <div className="space-y-2.5">
              <button
                onClick={onOpenAddBarang}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Input Data Barang Baru</h4>
                    <p className="text-[11px] text-slate-500">Auto generate nomor kode inventaris</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('barcode')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Barcode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Cetak Label Stiker Barcode</h4>
                    <p className="text-[11px] text-slate-500">Format A4 & stiker siap tempel</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('kategori_ruangan')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Cetak Kartu Ruangan (KIR)</h4>
                    <p className="text-[11px] text-slate-500">Format standar Kartu Inventaris Ruangan</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('codegs')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Script Code.gs (Google Sheets)</h4>
                    <p className="text-[11px] text-slate-500">Auto setup 6 sheet database</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('petunjuk')}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              📖 Baca Petunjuk Langkah Demi Langkah
            </button>
          </div>
        </div>
      </div>

      {/* Barang Perlu Tindak Lanjut (Urgent Maintenance Alert) */}
      {urgentItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50/80 border-b border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-rose-900">
                Peringatan Kerusakan Sarpras ({urgentItems.length} Barang Perlu Tindakan)
              </h3>
            </div>
            <span className="text-xs text-rose-700 font-medium">
              Segera jadwalkan perbaikan atau pengajuan penghapusan aset
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {urgentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectBarangDetail(item)}
                className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      item.kondisi === 'Rusak Berat' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.namaBarang}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.kodeBarang} • {item.ruanganNama} • Penanggung Jawab: {item.penanggungJawab}
                    </p>
                    {item.keterangan && (
                      <p className="text-[11px] text-rose-600 italic truncate mt-0.5">
                        Catatan: "{item.keterangan}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      item.kondisi === 'Rusak Berat'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.kondisi}
                  </span>
                  <button className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold p-1">
                    <Wrench className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom: Recent Logs / Riwayat Aktivitas */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Log Aktivitas Inventaris Terkini</span>
          </h3>
          <span className="text-xs text-slate-400">Sinkron otomatis</span>
        </div>

        <div className="space-y-3">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start justify-between text-xs py-2 border-b border-slate-100 last:border-none">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                  {log.aksi}
                </span>
                <div>
                  <p className="text-slate-800 font-medium">{log.detail}</p>
                  <p className="text-[11px] text-slate-400">Oleh: {log.user}</p>
                </div>
              </div>
              <span className="text-slate-400 text-[11px] whitespace-nowrap ml-4">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
