import React, { useEffect, useState } from 'react';
import {
  Barcode,
  BookOpenCheck,
  FileCode2,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from 'lucide-react';
import { AdminView } from './components/AdminView';
import { BarcodeView } from './components/BarcodeView';
import { BarangView } from './components/BarangView';
import { CodeGsView } from './components/CodeGsView';
import { DashboardView } from './components/DashboardView';
import { KategoriRuanganView } from './components/KategoriRuanganView';
import { LaporanView } from './components/LaporanView';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { PengaturanView } from './components/PengaturanView';
import { PetunjukPenggunaanView } from './components/PetunjukPenggunaanView';
import { NavTab, Sidebar } from './components/Sidebar';
import {
  addStoredLog,
  getAuthSession,
  getStoredBarang,
  getStoredKategori,
  getStoredLogs,
  getStoredPengaturan,
  getStoredRuangan,
  getStoredUsers,
  resetAllToDefault,
  saveStoredBarang,
  saveStoredKategori,
  saveStoredPengaturan,
  saveStoredRuangan,
  saveStoredUsers,
  setAuthSession,
  syncAllToGoogleSheet,
} from './services/storageService';
import { AdminUser, Barang, Kategori, LogAktivitas, PengaturanSekolah, Ruangan } from './types/inventory';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => getAuthSession());

  // State Collections
  const [pengaturan, setPengaturan] = useState<PengaturanSekolah>(getStoredPengaturan);
  const [barangList, setBarangList] = useState<Barang[]>(getStoredBarang);
  const [kategoriList, setKategoriList] = useState<Kategori[]>(getStoredKategori);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>(getStoredRuangan);
  const [users, setUsers] = useState<AdminUser[]>(getStoredUsers);
  const [logs, setLogs] = useState<LogAktivitas[]>(getStoredLogs);

  // Active User
  const [activeUser, setActiveUser] = useState<AdminUser>(() => {
    const session = getAuthSession();
    if (session) return session;
    const list = getStoredUsers();
    return list[0] || {
      id: 'USR-01',
      username: 'admin',
      namaLengkap: 'Bambang Supriyadi, S.Pd.',
      email: 'sarpras@smkalhikam.sch.id',
      role: 'Super Admin',
      status: 'Aktif',
      nomorTelepon: '0812-3456-7890',
      terakhirLogin: 'Hari Ini',
    };
  });

  // Active View Tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modal & Selection States
  const [isAddBarangModalOpen, setIsAddBarangModalOpen] = useState(false);
  const [selectedBarangDetail, setSelectedBarangDetail] = useState<Barang | null>(null);
  const [barcodePreselectedIds, setBarcodePreselectedIds] = useState<string[]>([]);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // DETEKSI KONEKSI OTOMATIS DARI URL PARAMETER (?gas_url=... atau ?scriptId=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const autoGasUrl = searchParams.get('gas_url') || searchParams.get('gasUrl') || searchParams.get('script_url') || searchParams.get('deployment_id');
      if (autoGasUrl) {
        // Import or use normalizeGasUrl
        import('./services/storageService').then(async ({ normalizeGasUrl, testGasConnection, pullDataFromGoogleSheet }) => {
          const cleanUrl = normalizeGasUrl(autoGasUrl);
          if (cleanUrl.startsWith('http')) {
            const updatedPengaturan: PengaturanSekolah = {
              ...pengaturan,
              gasWebAppUrl: cleanUrl,
              autoSync: true,
            };
            setPengaturan(updatedPengaturan);
            saveStoredPengaturan(updatedPengaturan);

            showToast('⚡ Mendeteksi URL Google Apps Script! Sedang menghubungkan otomatis...', 'info');

            const testResult = await testGasConnection(cleanUrl);
            if (testResult.success) {
              showToast('🎉 Berhasil Terkoneksi Otomatis ke Google Apps Script & Spreadsheet!', 'success');
              // Bersihkan query param dari URL browser agar bersih
              const cleanPath = window.location.pathname;
              window.history.replaceState({}, document.title, cleanPath);

              // Tarik data terbaru jika ada
              const pullResult = await pullDataFromGoogleSheet(cleanUrl);
              if (pullResult.success && pullResult.data && pullResult.data.barang && pullResult.data.barang.length > 0) {
                handleDataPulled(pullResult.data);
              }
            } else {
              showToast(`Koneksi terdeteksi tapi ada kendala: ${testResult.message}`, 'error');
            }
          }
        });
      }
    } catch (e) {
      console.error('Error auto-detecting gas_url', e);
    }
  }, []);

  // SINKRONISASI DATA TERBARU OTOMATIS DARI GOOGLE SPREADSHEET SAAT APLIKASI DIBUKA
  useEffect(() => {
    if (pengaturan.gasWebAppUrl && pengaturan.gasWebAppUrl.startsWith('http')) {
      import('./services/storageService').then(async ({ pullDataFromGoogleSheet }) => {
        try {
          const res = await pullDataFromGoogleSheet(pengaturan.gasWebAppUrl);
          if (res.success && res.data) {
            handleDataPulled(res.data, true);
          }
        } catch (err) {
          console.warn('Initial sync warning:', err);
        }
      });
    }
  }, []);

  // SINKRONISASI REAL-TIME LATAR BELAKANG (POLLING SETIAP 10 DETIK & SAAT TAB AKTIF)
  useEffect(() => {
    if (!pengaturan.gasWebAppUrl || !pengaturan.gasWebAppUrl.startsWith('http')) return;

    const syncLive = () => {
      import('./services/storageService').then(async ({ pullDataFromGoogleSheet }) => {
        try {
          const res = await pullDataFromGoogleSheet(pengaturan.gasWebAppUrl);
          if (res.success && res.data) {
            handleDataPulled(res.data, true);
          }
        } catch (e) {
          // silent in background
        }
      });
    };

    const intervalId = setInterval(syncLive, 10000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncLive();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pengaturan.gasWebAppUrl]);

  // Sync handlers
  const handleQuickSync = async () => {
    if (!pengaturan.gasWebAppUrl) {
      setActiveTab('pengaturan');
      showToast('Masukkan URL Web App Google Apps Script di menu Pengaturan terlebih dahulu.', 'info');
      return;
    }

    setIsSyncing(true);
    const res = await syncAllToGoogleSheet(
      pengaturan.gasWebAppUrl,
      {
        barang: barangList,
        kategori: kategoriList,
        ruangan: ruanganList,
        pengguna: users,
        pengaturan,
      },
      activeUser.namaLengkap
    );
    setIsSyncing(false);

    if (res.success) {
      showToast(res.message, 'success');
      const updatedLogs = addStoredLog(activeUser.namaLengkap, 'SYNC', 'SISTEM', 'Sinkronisasi cepat dengan Google Spreadsheet');
      setLogs(updatedLogs);
    } else {
      showToast(res.message, 'error');
    }
  };

  // Helper Background Auto-Sync ke Google Sheets
  const triggerAutoSync = (
    updatedBarang?: Barang[],
    updatedKat?: Kategori[],
    updatedRng?: Ruangan[],
    updatedUsers?: AdminUser[]
  ) => {
    if (pengaturan.gasWebAppUrl && pengaturan.autoSync !== false) {
      syncAllToGoogleSheet(
        pengaturan.gasWebAppUrl,
        {
          barang: updatedBarang || barangList,
          kategori: updatedKat || kategoriList,
          ruangan: updatedRng || ruanganList,
          pengguna: updatedUsers || users,
          pengaturan,
        },
        activeUser.namaLengkap
      ).catch((err) => console.log('Background auto-sync note:', err));
    }
  };

  // CRUD Barang
  const handleSaveBarang = (item: Barang) => {
    const isEdit = barangList.some((b) => b.id === item.id);
    let updated: Barang[];
    if (isEdit) {
      updated = barangList.map((b) => (b.id === item.id ? item : b));
    } else {
      updated = [item, ...barangList];
    }
    setBarangList(updated);
    saveStoredBarang(updated);
    if (pengaturan.gasWebAppUrl) {
      import('./services/storageService').then(({ saveSingleBarangToSheet }) => {
        saveSingleBarangToSheet(pengaturan.gasWebAppUrl, item);
      });
    }
    triggerAutoSync(updated, undefined, undefined);

    const logAction = isEdit ? 'EDIT' : 'TAMBAH';
    const updatedLogs = addStoredLog(
      activeUser.namaLengkap,
      logAction,
      'BARANG',
      `${isEdit ? 'Memperbarui' : 'Menambahkan'} barang: ${item.namaBarang} (${item.kodeBarang})`
    );
    setLogs(updatedLogs);
    showToast(`Barang ${item.namaBarang} berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}!`);
  };

  const handleDeleteBarang = (id: string) => {
    const target = barangList.find((b) => b.id === id);
    const updated = barangList.filter((b) => b.id !== id);
    setBarangList(updated);
    saveStoredBarang(updated);
    if (pengaturan.gasWebAppUrl) {
      import('./services/storageService').then(({ deleteSingleBarangFromSheet }) => {
        deleteSingleBarangFromSheet(pengaturan.gasWebAppUrl, id);
      });
    }
    triggerAutoSync(updated, undefined, undefined);

    const updatedLogs = addStoredLog(
      activeUser.namaLengkap,
      'HAPUS',
      'BARANG',
      `Menghapus barang: ${target ? target.namaBarang : id}`
    );
    setLogs(updatedLogs);
    showToast('Barang berhasil dihapus dari inventaris.', 'info');
  };

  // CRUD Kategori
  const handleSaveKategori = (kat: Kategori) => {
    const isEdit = kategoriList.some((k) => k.id === kat.id);
    let updated: Kategori[];
    if (isEdit) {
      updated = kategoriList.map((k) => (k.id === kat.id ? kat : k));
    } else {
      updated = [...kategoriList, kat];
    }
    setKategoriList(updated);
    saveStoredKategori(updated);
    triggerAutoSync(undefined, updated, undefined);
    addStoredLog(
      activeUser.namaLengkap,
      isEdit ? 'EDIT' : 'TAMBAH',
      'KATEGORI',
      `${isEdit ? 'Memperbarui' : 'Menambahkan'} kategori: ${kat.namaKategori}`
    );
    showToast(`Kategori ${kat.namaKategori} berhasil disimpan.`);
  };

  const handleDeleteKategori = (id: string) => {
    const updated = kategoriList.filter((k) => k.id !== id);
    setKategoriList(updated);
    saveStoredKategori(updated);
    triggerAutoSync(undefined, updated, undefined);
    showToast('Kategori berhasil dihapus.');
  };

  // CRUD Ruangan
  const handleSaveRuangan = (ruang: Ruangan) => {
    const isEdit = ruanganList.some((r) => r.id === ruang.id);
    let updated: Ruangan[];
    if (isEdit) {
      updated = ruanganList.map((r) => (r.id === ruang.id ? ruang : r));
    } else {
      updated = [...ruanganList, ruang];
    }
    setRuanganList(updated);
    saveStoredRuangan(updated);
    triggerAutoSync(undefined, undefined, updated);
    addStoredLog(
      activeUser.namaLengkap,
      isEdit ? 'EDIT' : 'TAMBAH',
      'RUANGAN',
      `${isEdit ? 'Memperbarui' : 'Menambahkan'} ruangan: ${ruang.namaRuangan}`
    );
    showToast(`Ruangan ${ruang.namaRuangan} berhasil disimpan.`);
  };

  const handleDeleteRuangan = (id: string) => {
    const updated = ruanganList.filter((r) => r.id !== id);
    setRuanganList(updated);
    saveStoredRuangan(updated);
    triggerAutoSync(undefined, undefined, updated);
    showToast('Ruangan berhasil dihapus.');
  };

  // CRUD User
  const handleSaveUser = (user: AdminUser) => {
    const isEdit = users.some((u) => u.id === user.id);
    let updated: AdminUser[];
    if (isEdit) {
      updated = users.map((u) => (u.id === user.id ? user : u));
    } else {
      updated = [...users, user];
    }
    setUsers(updated);
    saveStoredUsers(updated);
    showToast(`Data pengguna ${user.namaLengkap} berhasil disimpan.`);
  };

  const handleDeleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    saveStoredUsers(updated);
    showToast('Pengguna berhasil dihapus.');
  };

  // Save Pengaturan Real-Time ke Google Spreadsheet
  const handleSavePengaturan = (newPengaturan: PengaturanSekolah) => {
    setPengaturan(newPengaturan);
    saveStoredPengaturan(newPengaturan);
    if (newPengaturan.gasWebAppUrl && newPengaturan.gasWebAppUrl.startsWith('http')) {
      import('./services/storageService').then(({ savePengaturanToSheet }) => {
        savePengaturanToSheet(newPengaturan.gasWebAppUrl, newPengaturan).then((ok) => {
          if (ok) {
            showToast('✅ Pengaturan berhasil disinkronkan langsung ke Google Spreadsheet!', 'success');
          }
        });
      });
    }
    addStoredLog(activeUser.namaLengkap, 'EDIT', 'SISTEM', 'Memperbarui pengaturan identitas sekolah & sinkronisasi Google Spreadsheet');
    showToast('Pengaturan profil sekolah berhasil disimpan!', 'success');
  };

  // Pull data from GAS
  const handleDataPulled = (data: any, isSilent: boolean = false) => {
    if (data.pengaturan && Object.keys(data.pengaturan).length > 0) {
      setPengaturan((prev) => {
        const merged: PengaturanSekolah = {
          ...prev,
          ...data.pengaturan,
          namaSekolah: data.pengaturan.namaSekolah || prev.namaSekolah,
          npsn: String(data.pengaturan.npsn || prev.npsn),
          alamat: data.pengaturan.alamat || prev.alamat,
          wakaSarpras: data.pengaturan.wakaSarpras || prev.wakaSarpras,
          kepalaSekolah: data.pengaturan.kepalaSekolah || prev.kepalaSekolah,
        };
        saveStoredPengaturan(merged);
        return merged;
      });
    }
    if (data.barang && Array.isArray(data.barang) && data.barang.length > 0) {
      setBarangList(data.barang);
      saveStoredBarang(data.barang);
    }
    if (data.kategori && Array.isArray(data.kategori) && data.kategori.length > 0) {
      setKategoriList(data.kategori);
      saveStoredKategori(data.kategori);
    }
    if (data.ruangan && Array.isArray(data.ruangan) && data.ruangan.length > 0) {
      setRuanganList(data.ruangan);
      saveStoredRuangan(data.ruangan);
    }
    if (data.pengguna && Array.isArray(data.pengguna) && data.pengguna.length > 0) {
      setUsers(data.pengguna);
      saveStoredUsers(data.pengguna);
    }
    if (!isSilent) {
      showToast('Data berhasil diperbarui dari Google Spreadsheet!', 'success');
    }
  };

  // Reset to default
  const handleResetAll = () => {
    resetAllToDefault();
    setPengaturan(getStoredPengaturan());
    setBarangList(getStoredBarang());
    setKategoriList(getStoredKategori());
    setRuanganList(getStoredRuangan());
    setUsers(getStoredUsers());
    setLogs(getStoredLogs());
    showToast('Database berhasil direset ke data awal bawaan sekolah.', 'info');
  };

  // Print Barcode Router
  const handlePrintSelectedBarcode = (ids: string[]) => {
    setBarcodePreselectedIds(ids);
    setActiveTab('barcode');
  };

  const totalRusak = barangList.filter((b) => b.kondisi !== 'Baik').length;

  // Authentication Handlers
  const handleLoginSuccess = (user: AdminUser) => {
    setCurrentUser(user);
    setActiveUser(user);
    setAuthSession(user);
    showToast(`Selamat datang kembali, ${user.namaLengkap}!`, 'success');
  };

  const handleLogout = () => {
    setAuthSession(null);
    setCurrentUser(null);
    showToast('Anda telah keluar dari sistem inventaris.', 'info');
  };

  // Render Login View if not authenticated
  if (!currentUser) {
    return (
      <LoginView
        pengaturan={pengaturan}
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`no-print fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2 animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Top Header Navbar */}
      <Navbar
        pengaturan={pengaturan}
        activeUser={activeUser}
        users={users}
        onSelectUser={setActiveUser}
        isSyncing={isSyncing}
        onQuickSync={handleQuickSync}
        onOpenSettings={() => setActiveTab('pengaturan')}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          totalBarang={barangList.length}
          totalRusak={totalRusak}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              barangList={barangList}
              kategoriList={kategoriList}
              ruanganList={ruanganList}
              logs={logs}
              pengaturan={pengaturan}
              onNavigate={setActiveTab}
              onOpenAddBarang={() => setIsAddBarangModalOpen(true)}
              onSelectBarangDetail={(item) => setSelectedBarangDetail(item)}
            />
          )}

          {activeTab === 'barang' && (
            <BarangView
              barangList={barangList}
              kategoriList={kategoriList}
              ruanganList={ruanganList}
              onSaveBarang={handleSaveBarang}
              onDeleteBarang={handleDeleteBarang}
              onPrintSelectedBarcode={handlePrintSelectedBarcode}
              selectedBarangDetail={selectedBarangDetail}
              onCloseDetailModal={() => setSelectedBarangDetail(null)}
              isAddModalOpen={isAddBarangModalOpen}
              onOpenAddModal={() => setIsAddBarangModalOpen(true)}
              onCloseAddModal={() => setIsAddBarangModalOpen(false)}
            />
          )}

          {activeTab === 'kategori_ruangan' && (
            <KategoriRuanganView
              kategoriList={kategoriList}
              ruanganList={ruanganList}
              barangList={barangList}
              pengaturan={pengaturan}
              onSaveKategori={handleSaveKategori}
              onDeleteKategori={handleDeleteKategori}
              onSaveRuangan={handleSaveRuangan}
              onDeleteRuangan={handleDeleteRuangan}
            />
          )}

          {activeTab === 'barcode' && (
            <BarcodeView
              barangList={barangList}
              kategoriList={kategoriList}
              ruanganList={ruanganList}
              pengaturan={pengaturan}
              preselectedIds={barcodePreselectedIds}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanView
              barangList={barangList}
              kategoriList={kategoriList}
              ruanganList={ruanganList}
              pengaturan={pengaturan}
            />
          )}

          {activeTab === 'admin' && (
            <AdminView
              users={users}
              activeUser={activeUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              onSelectActiveUser={setActiveUser}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanView
              pengaturan={pengaturan}
              onSavePengaturan={handleSavePengaturan}
              barangList={barangList}
              kategoriList={kategoriList}
              ruanganList={ruanganList}
              users={users}
              onDataPulledFromGas={handleDataPulled}
              onResetAllData={handleResetAll}
              onNavigate={setActiveTab}
              activeUser={activeUser}
            />
          )}

          {activeTab === 'codegs' && <CodeGsView />}

          {activeTab === 'petunjuk' && <PetunjukPenggunaanView onNavigate={setActiveTab} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center z-40 shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('barang')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            activeTab === 'barang' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Barang</span>
        </button>

        <button
          onClick={() => setActiveTab('kategori_ruangan')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            activeTab === 'kategori_ruangan' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Ruang/KIR</span>
        </button>

        <button
          onClick={() => setActiveTab('barcode')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            activeTab === 'barcode' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Barcode</span>
        </button>

        <button
          onClick={() => setActiveTab('pengaturan')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold ${
            activeTab === 'pengaturan' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Setting</span>
        </button>
      </nav>
    </div>
  );
}
