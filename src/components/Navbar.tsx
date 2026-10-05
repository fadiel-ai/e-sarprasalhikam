import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  CloudCheck,
  Copy,
  ExternalLink,
  Globe,
  HardDrive,
  QrCode,
  RefreshCw,
  School,
  Share2,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { AdminUser, PengaturanSekolah } from '../types/inventory';

interface NavbarProps {
  pengaturan: PengaturanSekolah;
  activeUser: AdminUser;
  users: AdminUser[];
  onSelectUser: (user: AdminUser) => void;
  isSyncing: boolean;
  onQuickSync: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pengaturan,
  activeUser,
  users,
  onSelectUser,
  isSyncing,
  onQuickSync,
  onOpenSettings,
}) => {
  const isGasConnected = Boolean(pengaturan.gasWebAppUrl && pengaturan.gasWebAppUrl.trim().startsWith('http'));
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Link aktif aplikasi yang sedang berjalan
  const [sharedUrl, setSharedUrl] = useState<string>(
    typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-3m5oyezq6fqgghn2ht7tf7-499736201091.asia-southeast1.run.app'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      setSharedUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (showShareModal && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, sharedUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff',
        },
      }).catch(console.error);
    }
  }, [showShareModal, sharedUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedUrl);
    setCopiedAppUrl(true);
    setTimeout(() => setCopiedAppUrl(false), 2500);
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & School Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-900 truncate leading-tight flex items-center gap-2">
              <span>{pengaturan.namaSekolah || 'Sistem Inventaris Sekolah'}</span>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                NPSN {pengaturan.npsn || '20234567'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 truncate">
              Sistem Sarana & Prasarana Terintegrasi Google Spreadsheet
            </p>
          </div>
        </div>

        {/* Center / Right Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tombol Publish / Bagikan Aplikasi */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Bagikan atau publikasikan aplikasi ke staf & guru"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-200" />
            <span className="font-bold">Publish & Bagikan</span>
          </button>

          {/* Connection Status Indicator */}
          <button
            onClick={onOpenSettings}
            title={isGasConnected ? 'Terhubung ke Google Spreadsheet' : 'Klik untuk hubungkan Google Spreadsheet'}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isGasConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isGasConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <CloudCheck className="w-4 h-4 text-emerald-600" />
                <span>Google Sheet Live</span>
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4 text-amber-600" />
                <span>Mode Offline (Local)</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          {isGasConnected && (
            <button
              onClick={onQuickSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
              title="Sinkronkan data dengan Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Sinkronisasi...' : 'Sync Sheet'}</span>
            </button>
          )}

          {/* Active User Switcher / Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left">
              <select
                aria-label="Pilih Pengguna Aktif"
                value={activeUser.id}
                onChange={(e) => {
                  const target = users.find((u) => u.id === e.target.value);
                  if (target) onSelectUser(target);
                }}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none cursor-pointer focus:ring-0 p-0 block"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.namaLengkap} ({u.role})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {activeUser.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Publish & Bagikan Aplikasi */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="bg-linear-to-r from-indigo-700 to-blue-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/15 rounded-xl">
                  <Globe className="w-5 h-5 text-indigo-100" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Publikasikan & Bagikan Aplikasi</h3>
                  <p className="text-xs text-indigo-100">Siap diakses oleh seluruh dewan guru & staf sarpras</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-5 text-xs">
              {/* URL Aplikasi Publik */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  Link Aplikasi Inventaris Sekolah (Siap Pakai):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sharedUrl}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold shadow-xs transition-all shrink-0"
                  >
                    {copiedAppUrl ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Link ini dapat langsung dibuka di laptop guru, HP Android/iPhone untuk scan barcode, maupun komputer TU.
                </p>
              </div>

              {/* QR Code Scan Langsung di HP */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0">
                  <canvas ref={qrCanvasRef}></canvas>
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="font-bold text-slate-900 block text-sm">
                    Scan untuk Buka di Smartphone
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Arahkan kamera HP Anda ke QR code ini untuk membuka aplikasi secara instan dan menggunakan scanner barcode langsung dari kamera HP.
                  </p>
                  <a
                    href={sharedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold text-xs pt-1"
                  >
                    <span>Buka di Tab Baru</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Panduan 2 Komponen Publish */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  2 Bagian yang Dipublikasikan:
                </span>
                <div className="space-y-2">
                  <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-indigo-950">Aplikasi Web Utama (Frontend)</p>
                      <p className="text-[11px] text-indigo-800">
                        Sudah otomatis online di alamat di atas. Guru dan staf dapat langsung menggunakannya tanpa instalasi software.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-emerald-950">Database Google Spreadsheet (Backend)</p>
                      <p className="text-[11px] text-emerald-800">
                        Sudah dideploy melalui Google Apps Script Web App (Akses: <em>Anyone</em>). Data yang diinput di aplikasi web akan otomatis tersimpan di Google Sheet sekolah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

