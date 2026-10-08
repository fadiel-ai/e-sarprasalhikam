import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Download,
  Edit2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { AdminUser, PengaturanSekolah, RoleUser } from '../types/inventory';

interface AdminViewProps {
  users: AdminUser[];
  activeUser: AdminUser;
  pengaturan?: PengaturanSekolah;
  isSyncingUsers?: boolean;
  onSyncUsers?: () => Promise<void> | void;
  onPullUsersFromSheet?: () => Promise<void> | void;
  onSaveUser: (user: AdminUser) => void;
  onDeleteUser: (id: string) => void;
  onSelectActiveUser: (user: AdminUser) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  users,
  activeUser,
  pengaturan,
  isSyncingUsers = false,
  onSyncUsers,
  onPullUsersFromSheet,
  onSaveUser,
  onDeleteUser,
  onSelectActiveUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminUser> & { password?: string }>({
    username: '',
    password: '',
    namaLengkap: '',
    email: '',
    role: 'Petugas Inventaris',
    status: 'Aktif',
    nomorTelepon: '',
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      username: '',
      password: '',
      namaLengkap: '',
      email: '',
      role: 'Petugas Inventaris',
      status: 'Aktif',
      nomorTelepon: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      ...user,
      password: user.password || 'admin123',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.namaLengkap) {
      alert('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    const saved: AdminUser = {
      id: editingUser ? editingUser.id : `USR-${Date.now().toString().slice(-4)}`,
      username: formData.username.toLowerCase().trim(),
      password: formData.password ? formData.password.trim() : (editingUser?.password || 'admin123'),
      namaLengkap: formData.namaLengkap.trim(),
      email: formData.email || `${formData.username}@smkalhikam.sch.id`,
      role: (formData.role as RoleUser) || 'Petugas Inventaris',
      status: formData.status || 'Aktif',
      nomorTelepon: formData.nomorTelepon || '-',
      terakhirLogin: editingUser ? editingUser.terakhirLogin : 'Baru Dibuat',
    };

    onSaveUser(saved);
    setIsModalOpen(false);
  };

  const isConnectedToGas = Boolean(pengaturan?.gasWebAppUrl && pengaturan.gasWebAppUrl.startsWith('http'));

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Manajemen Pengguna & Hak Akses Akun</span>
            </h2>
            {isConnectedToGas ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Tersinkron Spreadsheet (Sheet: Pengguna)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                Lokal Browser
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun, kata sandi, dan peran pengelola sarana prasarana {pengaturan?.namaSekolah || 'SMK AL-HIKAM SENDANG AGUNG'}. Setiap perubahan otomatis tersimpan dua arah ke Google Spreadsheet.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {onPullUsersFromSheet && isConnectedToGas && (
            <button
              onClick={() => onPullUsersFromSheet()}
              disabled={isSyncingUsers}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              title="Ambil data pengguna terbaru dari Google Spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Tarik dari Sheet</span>
            </button>
          )}

          {onSyncUsers && isConnectedToGas && (
            <button
              onClick={() => onSyncUsers()}
              disabled={isSyncingUsers}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              title="Kirim dan sinkronkan semua akun pengguna ke sheet Pengguna di Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingUsers ? 'animate-spin' : ''}`} />
              <span>{isSyncingUsers ? 'Menyinkronkan...' : 'Sinkronkan ke Spreadsheet'}</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Real-Time Sync Status Banner */}
      <div className="bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800">
              Sinkronisasi Akun & Sandi Pengguna ke Database Spreadsheet
            </p>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Setiap kali Anda menambah, mengedit profil/kata sandi, atau menghapus pengguna, data akan <b className="text-indigo-700">langsung tersimpan real-time</b> ke sheet <b>"Pengguna"</b> di Google Spreadsheet.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Total: <b>{users.length} Akun Terdaftar</b>
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3">Pengguna & Username</th>
                <th className="p-3">Kontak & Email</th>
                <th className="p-3">Peran / Hak Akses</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Sandi / Password</th>
                <th className="p-3">Aktivitas Terakhir</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === activeUser.id;
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {u.namaLengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{u.namaLengkap}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded">
                                Anda
                              </span>
                            )}
                          </p>
                          <span className="text-[11px] font-mono text-slate-500">@{u.username}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <p className="text-slate-700 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </p>
                      <p className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{u.nomorTelepon}</span>
                      </p>
                    </td>

                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.role === 'Super Admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'Admin Sarpras'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : u.role === 'Kepala Sekolah'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono text-[11px] border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{u.password ? '••••••••' : 'admin123'}</span>
                      </span>
                    </td>

                    <td className="p-3 text-slate-500 text-[11px]">{u.terakhirLogin}</td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {!isCurrent && (
                          <button
                            onClick={() => onSelectActiveUser(u)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold cursor-pointer"
                            title="Gunakan akun ini"
                          >
                            Pilih
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          title="Edit Pengguna & Sandi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {users.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pengguna ${u.namaLengkap} (@${u.username}) dari inventaris dan Google Spreadsheet?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Matriks Hak Akses Peran Pengguna</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[11px] inline-block">
              Super Admin
            </span>
            <p className="text-slate-600 text-[11px]">
              Akses penuh seluruh modul, konfigurasi Google Apps Script, reset database, dan manajemen user.
            </p>
            <ul className="text-[11px] text-slate-700 space-y-1">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> CRUD Semua Data
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Setup & Sync Google Sheet
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Cetak Barcode & Unduh Dokumen
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[11px] inline-block">
              Admin Sarpras
            </span>
            <p className="text-slate-600 text-[11px]">
              Pengelola operasional sarana dan prasarana sekolah harian (Waka Sarpras / Koordinator).
            </p>
            <ul className="text-[11px] text-slate-700 space-y-1">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> CRUD Barang & Ruangan
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Unduh Dokumen KIR
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Ekspor Laporan
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded text-[11px] inline-block">
              Petugas Inventaris
            </span>
            <p className="text-slate-600 text-[11px]">
              Staf TU / penanggung jawab lab & perpustakaan yang melakukan input dan scan barang.
            </p>
            <ul className="text-[11px] text-slate-700 space-y-1">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Input & Edit Barang
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Scan Cek Barcode
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Cetak Label Barang
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] inline-block">
              Kepala Sekolah
            </span>
            <p className="text-slate-600 text-[11px]">
              Pimpinan sekolah yang memantau rekapitulasi aset dan menandatangani Kartu Inventaris Ruangan.
            </p>
            <ul className="text-[11px] text-slate-700 space-y-1">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Monitoring Dashboard
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Pengesahan KIR Ruangan
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Laporan Audit Sarpras
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                <span>{editingUser ? 'Edit Data Pengguna & Sandi' : 'Tambah Pengguna Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bambang Supriyadi, S.Pd."
                  value={formData.namaLengkap || ''}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kata Sandi (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="admin123"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2.5 pr-8 font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="sarpras@smkalhikam.sch.id"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / WA</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={formData.nomorTelepon || ''}
                  onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peran (Role)</label>
                  <select
                    value={formData.role || 'Petugas Inventaris'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleUser })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin Sarpras">Admin Sarpras</option>
                    <option value="Petugas Inventaris">Petugas Inventaris</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Akun</label>
                  <select
                    value={formData.status || 'Aktif'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                Data akun dan kata sandi ini akan langsung disinkronkan ke sheet <b>"Pengguna"</b> di Google Spreadsheet dan dapat langsung digunakan untuk login aplikasi.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Simpan & Sinkronkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
