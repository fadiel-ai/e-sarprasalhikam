import {
  DEFAULT_BARANG,
  DEFAULT_KATEGORI,
  DEFAULT_LOGS,
  DEFAULT_PENGATURAN,
  DEFAULT_RUANGAN,
  DEFAULT_USERS,
} from '../data/defaultData';
import {
  AdminUser,
  Barang,
  Kategori,
  LogAktivitas,
  PengaturanSekolah,
  Ruangan,
} from '../types/inventory';

const STORAGE_KEYS = {
  BARANG: 'sis_inventaris_barang',
  KATEGORI: 'sis_inventaris_kategori',
  RUANGAN: 'sis_inventaris_ruangan',
  USERS: 'sis_inventaris_users',
  PENGATURAN: 'sis_inventaris_pengaturan',
  LOGS: 'sis_inventaris_logs',
  ACTIVE_USER: 'sis_inventaris_active_user',
};

export const getStoredPengaturan = (): PengaturanSekolah => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENGATURAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(DEFAULT_PENGATURAN));
      return DEFAULT_PENGATURAN;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.namaSekolah || parsed.namaSekolah.includes('Cendekia') || parsed.namaSekolah === 'SMP Negeri 1 Cendekia Mandiri') {
      parsed.namaSekolah = DEFAULT_PENGATURAN.namaSekolah;
      parsed.alamat = DEFAULT_PENGATURAN.alamat;
      parsed.kelurahan = DEFAULT_PENGATURAN.kelurahan;
      parsed.kecamatan = DEFAULT_PENGATURAN.kecamatan;
      parsed.kabupatenKota = DEFAULT_PENGATURAN.kabupatenKota;
      parsed.provinsi = DEFAULT_PENGATURAN.provinsi;
      parsed.npsn = DEFAULT_PENGATURAN.npsn;
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(parsed));
    }
    if (!parsed.gasWebAppUrl || parsed.gasWebAppUrl.trim() === '') {
      parsed.gasWebAppUrl = DEFAULT_PENGATURAN.gasWebAppUrl;
      parsed.autoSync = true;
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    return DEFAULT_PENGATURAN;
  }
};

export const saveStoredPengaturan = (data: PengaturanSekolah) => {
  localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(data));
};

export const getStoredKategori = (): Kategori[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KATEGORI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(DEFAULT_KATEGORI));
      return DEFAULT_KATEGORI;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_KATEGORI;
  }
};

export const saveStoredKategori = (data: Kategori[]) => {
  localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(data));
};

export const getStoredRuangan = (): Ruangan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RUANGAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(DEFAULT_RUANGAN));
      return DEFAULT_RUANGAN;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_RUANGAN;
  }
};

export const saveStoredRuangan = (data: Ruangan[]) => {
  localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(data));
};

export const getStoredBarang = (): Barang[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BARANG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(DEFAULT_BARANG));
      return DEFAULT_BARANG;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_BARANG;
  }
};

export const saveStoredBarang = (data: Barang[]) => {
  localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(data));
};

export const getStoredUsers = (): AdminUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USERS;
  }
};

export const saveStoredUsers = (data: AdminUser[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data));
};

export const getStoredLogs = (): LogAktivitas[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
      return DEFAULT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_LOGS;
  }
};

export const addStoredLog = (
  user: string,
  aksi: LogAktivitas['aksi'],
  tipe: LogAktivitas['tipe'],
  detail: string
) => {
  const current = getStoredLogs();
  const newLog: LogAktivitas = {
    id: 'LOG-' + Date.now(),
    timestamp: new Date().toLocaleString('id-ID'),
    user,
    aksi,
    tipe,
    detail,
  };
  const updated = [newLog, ...current].slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  return updated;
};

export const resetAllToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(DEFAULT_PENGATURAN));
  localStorage.setItem(STORAGE_KEYS.KATEGORI, JSON.stringify(DEFAULT_KATEGORI));
  localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(DEFAULT_RUANGAN));
  localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(DEFAULT_BARANG));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(DEFAULT_LOGS));
};

// ==========================================
// Integrasi Google Apps Script (GAS) API
// ==========================================

/**
 * Otomatisasi Normalisasi URL:
 * Menerima Deployment ID murni (AKfycb...), link tanpa /exec, atau URL penuh,
 * dan memformatnya menjadi URL publish Web App yang valid.
 */
export function normalizeGasUrl(input: string): string {
  if (!input) return '';
  let clean = input.trim().replace(/['"]+/g, '');

  // Jika user hanya memasukkan Deployment ID (contoh: AKfycbx...)
  if (/^AKfycb[a-zA-Z0-9_-]{20,}$/.test(clean)) {
    return `https://script.google.com/macros/s/${clean}/exec`;
  }

  // Jika URL script.google.com/macros/s/... tapi tanpa /exec di belakang
  if (clean.includes('script.google.com/macros/s/')) {
    // Hilangkan parameter query sementara
    const [base, query] = clean.split('?');
    let normalizedBase = base;
    if (!normalizedBase.endsWith('/exec') && !normalizedBase.endsWith('/dev')) {
      normalizedBase = normalizedBase.replace(/\/+$/, '') + '/exec';
    }
    return query ? `${normalizedBase}?${query}` : normalizedBase;
  }

  return clean;
}

export async function testGasConnection(url: string): Promise<{ success: boolean; message: string; details?: any }> {
  const normalized = normalizeGasUrl(url);
  if (!normalized || !normalized.startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script tidak valid. Masukkan URL Web App (https://script.google.com/macros/s/.../exec) atau Deployment ID Anda.' };
  }

  const cleanUrl = normalized.trim();
  const testUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=ping` : `${cleanUrl}?action=ping`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        message: `Server merespon dengan status ${res.status}. Pastikan hak akses Web App diset "Who has access: Anyone".`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message || 'Koneksi ke Google Apps Script & Spreadsheet berhasil terverifikasi!',
      details: data,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, message: 'Waktu koneksi habis (Timeout 12 detik). Periksa deployment Web App Anda.' };
    }
    return {
      success: false,
      message: `Gagal menghubungi Google Apps Script: ${err.message || 'Network error'}. Pastikan akses publik "Anyone" diatur saat Deploy.`,
    };
  }
}

export async function syncAllToGoogleSheet(
  url: string,
  data: {
    barang: Barang[];
    kategori: Kategori[];
    ruangan: Ruangan[];
    pengguna: AdminUser[];
    pengaturan: PengaturanSekolah;
  },
  activeUser: string
): Promise<{ success: boolean; message: string }> {
  const normalized = normalizeGasUrl(url);
  if (!normalized || !normalized.startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum valid di Pengaturan.' };
  }

  try {
    const payload = {
      action: 'syncAll',
      user: activeUser,
      data,
    };

    // Menggunakan fetch POST dengan mode no-cors fallback jika dibutuhkan
    const res = await fetch(normalized.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const resData = await res.json().catch(() => ({ success: true, message: 'Terkirim ke Apps Script' }));
    return {
      success: true,
      message: resData.message || 'Seluruh data berhasil disinkronkan ke Google Spreadsheet!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Terjadi kendala saat sinkronisasi: ${err.message}`,
    };
  }
}

export async function pullDataFromGoogleSheet(url: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    barang?: Barang[];
    kategori?: Kategori[];
    ruangan?: Ruangan[];
    pengguna?: AdminUser[];
    pengaturan?: Partial<PengaturanSekolah>;
  };
}> {
  const normalized = normalizeGasUrl(url);
  if (!normalized || !normalized.startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script belum valid.' };
  }

  const cleanUrl = normalized.trim();
  const fetchUrl = cleanUrl.includes('?') ? `${cleanUrl}&action=getAll` : `${cleanUrl}?action=getAll`;

  try {
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Respon API tidak memuat data yang valid');
    }

    return {
      success: true,
      message: 'Berhasil mengunduh data terbaru dari Google Spreadsheet!',
      data: json.data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menarik data dari Google Spreadsheet: ${err.message}`,
    };
  }
}
