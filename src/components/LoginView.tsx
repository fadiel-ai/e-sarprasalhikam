import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  School,
  ShieldCheck,
  User,
} from 'lucide-react';
import { AdminUser, PengaturanSekolah } from '../types/inventory';

interface LoginViewProps {
  pengaturan: PengaturanSekolah;
  users: AdminUser[];
  onLoginSuccess: (user: AdminUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  pengaturan,
  users,
  onLoginSuccess,
}) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const trimmedUser = usernameInput.trim().toLowerCase();
      const matchedUser = users.find(
        (u) =>
          u.username.toLowerCase() === trimmedUser ||
          u.email.toLowerCase() === trimmedUser
      );

      if (!matchedUser) {
        setErrorMessage('Username atau Email tidak ditemukan dalam sistem.');
        setIsLoading(false);
        return;
      }

      if (matchedUser.status === 'Nonaktif') {
        setErrorMessage('Akun ini sedang dinonaktifkan oleh administrator.');
        setIsLoading(false);
        return;
      }

      // Check password (default fallback password is admin123 if undefined)
      const expectedPassword = matchedUser.password || 'admin123';
      if (passwordInput !== expectedPassword) {
        setErrorMessage('Kata sandi salah. Silakan periksa kembali!');
        setIsLoading(false);
        return;
      }

      // Success
      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 350);
  };

  const handleQuickLogin = (user: AdminUser) => {
    setUsernameInput(user.username);
    setPasswordInput(user.password || 'admin123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand & School Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-700 to-blue-600 items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-1">
            <School className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {pengaturan.namaSekolah || 'SMK AL-HIKAM SENDANG AGUNG'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sistem Inventaris Sarana & Prasarana Sekolah Terpadu
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[11px] font-semibold text-indigo-700 shadow-2xs border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NPSN {pengaturan.npsn || '70058018'} • Database Live Google Spreadsheet</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-7 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Masuk ke Akun Anda</span>
            </h2>
            <p className="text-xs text-slate-500">
              Gunakan kredensial akun staf sarpras atau administrator
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Input Username */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs transition-all font-medium"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-98 text-white rounded-xl font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            </button>
          </form>

          {/* Akses Demo / Akun Cepat */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Pilihan Akun Cepat (Klik untuk Isi):</span>
              <span className="text-indigo-600 font-bold">1-Klik</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group cursor-pointer"
                >
                  <span className="font-bold text-slate-800 block truncate group-hover:text-indigo-700">
                    {u.namaLengkap}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Role: {u.role}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 font-semibold">
                    {u.username} / {u.password || 'admin123'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-[11px] text-slate-500">
          <p>
            {pengaturan.alamat || 'Sendang Mulyo, Kec. Sendang Agung, Kab. Lampung Tengah'}
          </p>
          <p className="mt-0.5 text-slate-400">
            Terhubung ke Google Spreadsheet Database &bull; Real-Time Live Sync
          </p>
        </div>
      </div>
    </div>
  );
};
