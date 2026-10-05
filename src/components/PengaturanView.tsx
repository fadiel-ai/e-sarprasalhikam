import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  CloudCheck,
  Download,
  ExternalLink,
  FileCode2,
  HardDrive,
  HelpCircle,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  School,
  Settings,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react';
import { AdminUser, Barang, Kategori, PengaturanSekolah, Ruangan } from '../types/inventory';
import { pullDataFromGoogleSheet, syncAllToGoogleSheet, testGasConnection } from '../services/storageService';
import { NavTab } from './Sidebar';

interface PengaturanViewProps {
  pengaturan: PengaturanSekolah;
  onSavePengaturan: (pengaturan: PengaturanSekolah) => void;
  barangList: Barang[];
  kategoriList: Kategori[];
  ruanganList: Ruangan[];
  users: AdminUser[];
  onDataPulledFromGas: (data: any) => void;
  onResetAllData: () => void;
  onNavigate: (tab: NavTab) => void;
  activeUser: AdminUser;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  pengaturan,
  onSavePengaturan,
  barangList,
  kategoriList,
  ruanganList,
  users,
  onDataPulledFromGas,
  onResetAllData,
  onNavigate,
  activeUser,
}) => {
  const [form, setForm] = useState<PengaturanSekolah>({ ...pengaturan });
  const [isSaved, setIsSaved] = useState(false);

  // GAS actions state
  const [testingStatus, setTestingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [syncingStatus, setSyncingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [pullingStatus, setPullingStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePengaturan(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!form.gasWebAppUrl) {
      setTestingStatus({
        loading: false,
        success: false,
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setTestingStatus({ loading: true, message: 'Menguji koneksi ke Google Apps Script...' });
    const res = await testGasConnection(form.gasWebAppUrl);
    setTestingStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  const handlePushAllToSheet = async () => {
    if (!form.gasWebAppUrl) {
      alert('Masukkan URL Google Apps Script di form di atas terlebih dahulu.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menyinkronkan seluruh data inventaris ke Google Spreadsheet? Data di spreadsheet akan diperbarui.')) {
      return;
    }

    setSyncingStatus({ loading: true, message: 'Mengunggah seluruh data ke Google Spreadsheet...' });
    const res = await syncAllToGoogleSheet(
      form.gasWebAppUrl,
      {
        barang: barangList,
        kategori: kategoriList,
        ruangan: ruanganList,
        pengguna: users,
        pengaturan: form,
      },
      activeUser.namaLengkap
    );

    setSyncingStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });

    if (res.success) {
      const now = new Date().toLocaleString('id-ID');
      const updated = { ...form, lastSynced: now };
      setForm(updated);
      onSavePengaturan(updated);
    }
  };

  const handlePullFromSheet = async () => {
    if (!form.gasWebAppUrl) {
      alert('Masukkan URL Google Apps Script terlebih dahulu.');
      return;
    }

    if (!confirm('Tarik data dari Google Spreadsheet? Perubahan lokal yang belum disinkronkan akan ditimpa dengan data terbaru dari spreadsheet.')) {
      return;
    }

    setPullingStatus({ loading: true, message: 'Mengunduh data terbaru dari Google Spreadsheet...' });
    const res = await pullDataFromGoogleSheet(form.gasWebAppUrl);
    setPullingStatus({
      loading: false,
      success: res.success,
      message: res.message,
    });

    if (res.success && res.data) {
      onDataPulledFromGas(res.data);
      const now = new Date().toLocaleString('id-ID');
      const updated = { ...form, lastSynced: now };
      setForm(updated);
      onSavePengaturan(updated);
    }
  };

  // Backup & Restore
  const handleDownloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      pengaturan: form,
      barang: barangList,
      kategori: kategoriList,
      ruangan: ruanganList,
      pengguna: users,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement('a');
    a.href = jsonStr;
    a.download = `Backup_Inventaris_${form.npsn || 'Sekolah'}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRestoreFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.barang && parsed.kategori && parsed.ruangan) {
          onDataPulledFromGas(parsed);
          if (parsed.pengaturan) {
            setForm(parsed.pengaturan);
            onSavePengaturan(parsed.pengaturan);
          }
          alert('Berhasil memulihkan database dari file backup!');
        } else {
          alert('Format file backup JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err);
      }
    };
    reader.readAsText(file);
  };

  const isGasConnected = Boolean(form.gasWebAppUrl && form.gasWebAppUrl.trim().startsWith('http'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>Pengaturan Sistem & Integrasi Google Spreadsheet</span>
          </h2>
          <p className="text-xs text-slate-500">
            Konfigurasi identitas sekolah, koneksi Google Apps Script Web App, dan manajemen cadangan data
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* INTEGRASI GOOGLE APPS SCRIPT & SPREADSHEET */}
      {/* ==================================================== */}
      <div className="bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
              <CloudCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Koneksi Google Spreadsheet & Apps Script</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isGasConnected ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                  }`}
                >
                  {isGasConnected ? 'Terhubung Live' : 'Mode Offline'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Semua data barang, kategori, ruangan, pengguna, dan log disimpan aman di Google Sheet milik sekolah Anda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('codegs')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-semibold backdrop-blur-xs border border-white/15 transition-all"
            >
              <FileCode2 className="w-4 h-4 text-amber-300" />
              <span>Lihat Script Code.gs</span>
            </button>
            <button
              onClick={() => onNavigate('petunjuk')}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Petunjuk Setup</span>
            </button>
          </div>
        </div>

        {/* Input Web App URL & Smart Auto-Connect */}
        <div className="space-y-4">
          <div className="bg-indigo-950/70 border border-indigo-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cara 1: Koneksi Otomatis Lewat Menu Google Spreadsheet (Rekomendasi)
                </h4>
              </div>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                1-Klik Otomatis
              </span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Setelah paste <b>Code.gs</b> dan deploy Web App di Google Sheets, Anda cukup membuka spreadsheet Anda lalu klik menu atas:{' '}
              <b className="text-white">"🏫 INVENTARIS SEKOLAH"</b> &rarr; pilih{' '}
              <b className="text-amber-300">"🔗 Buka Web App (Terkoneksi Otomatis)"</b>. Aplikasi ini akan otomatis terbuka dengan URL yang sudah terhubung tanpa perlu copy-paste!
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
                <span>Cara 2: Masukkan URL Web App atau Deployment ID (Format Otomatis)</span>
              </label>
              <span className="text-[11px] text-indigo-300">
                Mendukung Deployment ID: <code>AKfycb...</code>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Tempel URL (https://script.google.com/macros/s/.../exec) atau Deployment ID (AKfycb...)"
                value={form.gasWebAppUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, gasWebAppUrl: val });
                }}
                className="flex-1 text-xs p-3 font-mono bg-white/10 border border-indigo-400/30 rounded-xl focus:bg-white/20 focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-white placeholder-indigo-300"
              />
              <button
                type="button"
                onClick={async () => {
                  import('../services/storageService').then(async ({ normalizeGasUrl }) => {
                    const clean = normalizeGasUrl(form.gasWebAppUrl);
                    const updated = { ...form, gasWebAppUrl: clean, autoSync: true };
                    setForm(updated);
                    onSavePengaturan(updated);
                    await handleTestConnection();
                  });
                }}
                disabled={testingStatus.loading || !form.gasWebAppUrl}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 shrink-0"
              >
                {testingStatus.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>⚡ Sambungkan Otomatis</span>
              </button>
            </div>
            <p className="text-[11px] text-indigo-300 mt-1.5">
              Sistem akan otomatis membersihkan spasi, menambahkan akhiran <code>/exec</code>, dan memverifikasi koneksi.
            </p>
          </div>

          {/* Toggle Auto-Sync */}
          <div className="pt-2 border-t border-indigo-800/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sinkronisasi Otomatis Real-time (Auto-Sync)</span>
              </p>
              <p className="text-[11px] text-indigo-300">
                Otomatis kirim perubahan barang, kategori, dan ruangan ke Google Sheet setiap ada penambahan atau pengeditan
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoSync !== false}
                onChange={(e) => {
                  const updated = { ...form, autoSync: e.target.checked };
                  setForm(updated);
                  onSavePengaturan(updated);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Test Status feedback */}
          {testingStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                testingStatus.success
                  ? 'bg-emerald-950/80 border border-emerald-600/80 text-emerald-200'
                  : 'bg-rose-950/80 border border-rose-600/80 text-rose-200'
              }`}
            >
              {testingStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{testingStatus.message}</p>
                {testingStatus.success && (
                  <p className="text-[11px] text-emerald-300 mt-0.5">
                    Google Spreadsheet siap melakukan pertukaran data dua arah.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sync & Pull Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handlePushAllToSheet}
              disabled={syncingStatus.loading || !form.gasWebAppUrl}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40"
            >
              {syncingStatus.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Unggah Seluruh Data ke Google Sheet</span>
            </button>

            <button
              type="button"
              onClick={handlePullFromSheet}
              disabled={pullingStatus.loading || !form.gasWebAppUrl}
              className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {pullingStatus.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Tarik Data Terbaru dari Google Sheet</span>
            </button>
          </div>

          {(syncingStatus.message || pullingStatus.message) && (
            <p className="text-xs text-indigo-200 italic">
              {syncingStatus.message || pullingStatus.message}
            </p>
          )}

          <div className="text-[11px] text-indigo-300/80 pt-1 flex items-center justify-between">
            <span>Terakhir disinkronkan: {form.lastSynced || 'Belum pernah'}</span>
            <span>Total Record Siap: {barangList.length} Barang</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* FORM IDENTITAS & PROFIL RESMI SEKOLAH */}
      {/* ==================================================== */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Identitas Sekolah & Penanggung Jawab</h3>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Profil</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">
              Nama Resmi Sekolah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.namaSekolah}
              onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nomor Pokok Sekolah Nasional (NPSN) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.npsn}
              onChange={(e) => setForm({ ...form, npsn: e.target.value })}
              className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Kecamatan</label>
            <input
              type="text"
              value={form.kecamatan}
              onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Kabupaten / Kota</label>
            <input
              type="text"
              value={form.kabupatenKota}
              onChange={(e) => setForm({ ...form, kabupatenKota: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Provinsi</label>
            <input
              type="text"
              value={form.provinsi}
              onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nama Kepala Sekolah</label>
            <input
              type="text"
              value={form.kepalaSekolah}
              onChange={(e) => setForm({ ...form, kepalaSekolah: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">NIP Kepala Sekolah</label>
            <input
              type="text"
              value={form.nipKepalaSekolah}
              onChange={(e) => setForm({ ...form, nipKepalaSekolah: e.target.value })}
              className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Telepon / WhatsApp</label>
            <input
              type="text"
              value={form.kontakSekolah}
              onChange={(e) => setForm({ ...form, kontakSekolah: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Waka Urusan Sarana & Prasarana</label>
            <input
              type="text"
              value={form.wakaSarpras}
              onChange={(e) => setForm({ ...form, wakaSarpras: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">NIP Waka Sarpras</label>
            <input
              type="text"
              value={form.nipWakaSarpras}
              onChange={(e) => setForm({ ...form, nipWakaSarpras: e.target.value })}
              className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Sekolah</label>
            <input
              type="email"
              value={form.emailSekolah}
              onChange={(e) => setForm({ ...form, emailSekolah: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </form>

      {/* ==================================================== */}
      {/* CADANGAN & PEMULIHAN DATA (BACKUP & RESTORE) */}
      {/* ==================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          <span>Cadangan & Pemulihan Database (Backup & Restore)</span>
        </h3>
        <p className="text-slate-500">
          Amankan basis data inventaris sekolah Anda secara berkala dalam format JSON terenkripsi
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-800">Unduh Backup Data (JSON)</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Simpan seluruh data barang, kategori, ruangan, dan user ke komputer Anda.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File Backup</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-slate-800">Pulihkan dari File Backup</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Muat ulang data dari file backup JSON yang pernah Anda simpan sebelumnya.
              </p>
            </div>
            <label className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFromFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-rose-800">Reset ke Data Default Pabrik</h4>
              <p className="text-[11px] text-rose-600 mt-1">
                Mengembalikan seluruh data simulasi sekolah (Data lab, mebel, dan profil awal).
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data inventaris ke data awal bawaan sekolah?')) {
                  onResetAllData();
                  alert('Database telah direset ke data default.');
                }
              }}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Inventaris</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
