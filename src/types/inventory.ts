export type KondisiBarang = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';

export type SumberDana = 'BOS Reguler' | 'BOS Kinerja' | 'DAK Fisik' | 'Komite Sekolah' | 'Hibah / Yayasan' | 'APBD';

export type SatuanBarang = 'Unit' | 'Pcs' | 'Set' | 'Buah' | 'Paket' | 'Rim';

export type RoleUser = 'Super Admin' | 'Admin Sarpras' | 'Petugas Inventaris' | 'Kepala Sekolah';

export interface Barang {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  idKategori: string;
  kategoriNama: string;
  idRuangan: string;
  ruanganNama: string;
  merk: string;
  nomorSeri?: string;
  tahunPengadaan: number;
  sumberDana: SumberDana;
  kondisi: KondisiBarang;
  jumlah: number;
  satuan: SatuanBarang;
  hargaSatuan: number;
  totalNilai: number;
  penanggungJawab: string;
  keterangan?: string;
  tanggalInput: string;
  tanggalUpdate?: string;
}

export interface Kategori {
  id: string;
  kodeKategori: string;
  namaKategori: string;
  deskripsi: string;
  warna: string;
  iconName?: string;
  jumlahBarang?: number;
}

export interface Ruangan {
  id: string;
  kodeRuangan: string;
  namaRuangan: string;
  gedung: string;
  lantai: string;
  penanggungJawab: string;
  kapasitas: number;
  deskripsi: string;
  jumlahBarang?: number;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  namaLengkap: string;
  email: string;
  role: RoleUser;
  status: 'Aktif' | 'Nonaktif';
  nomorTelepon: string;
  terakhirLogin: string;
}

export interface PengaturanSekolah {
  namaSekolah: string;
  npsn: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  wakaSarpras: string;
  nipWakaSarpras: string;
  kontakSekolah: string;
  emailSekolah: string;
  logoUrl?: string;
  kopSuratUrl?: string;
  tipeKopSurat?: 'gambar' | 'teks_otomatis';
  subKopText?: string;
  gasWebAppUrl: string;
  autoSync?: boolean;
  scriptDeploymentId?: string;
  formatKodeBarang: string; // e.g. "INV-[KAT]-[RUANG]-[NO]"
  lastSynced?: string;
}

export interface LogAktivitas {
  id: string;
  timestamp: string;
  user: string;
  aksi: 'TAMBAH' | 'EDIT' | 'HAPUS' | 'SYNC' | 'CETAK';
  tipe: 'BARANG' | 'KATEGORI' | 'RUANGAN' | 'USER' | 'SISTEM';
  detail: string;
}

export interface BarcodePrintConfig {
  layout: '3x10' | '2x5' | '1x3' | 'custom';
  format: 'barcode_only' | 'qr_only' | 'both';
  labelWidthMm: number;
  labelHeightMm: number;
  columns: number;
  showSchoolName: boolean;
  showRoomName: boolean;
  showYear: boolean;
  showCategory: boolean;
  selectedIds: string[];
}
