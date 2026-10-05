/**
 * Generator dan Template Kode Google Apps Script (Code.gs)
 * Siap dicopy-paste ke Google Apps Script Editor dan dideploy sebagai Web App.
 */

export const CODE_GS_SCRIPT = `/**
 * =========================================================================
 * SISTEM INVENTARIS SEKOLAH TERPADU - GOOGLE APPS SCRIPT (Code.gs)
 * Terhubung langsung dengan Google Spreadsheet sebagai Database
 * =========================================================================
 * 
 * FITUR UTAMA:
 * 1. setupDatabase(): Membuat 6 sheet otomatis dengan header berwarna & data awal
 * 2. Menu Kustom di Google Sheets: "🏫 INVENTARIS SEKOLAH"
 * 3. REST API Web App (doGet & doPost) dengan CORS & output JSON
 * 4. Sinkronisasi Data Barang, Kategori, Ruangan, Pengguna, Pengaturan & Log
 */

// Nama-nama Sheet di Spreadsheet
const SHEETS = {
  BARANG: 'Barang',
  KATEGORI: 'Kategori',
  RUANGAN: 'Ruangan',
  PENGGUNA: 'Pengguna',
  PENGATURAN: 'Pengaturan',
  LOG: 'LogAktivitas'
};

/**
 * Event saat Google Spreadsheet dibuka.
 * Menambahkan Menu kustom ke toolbar Google Sheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏫 INVENTARIS SEKOLAH')
    .addItem('⚡ Setup / Inisialisasi Database Otomatis', 'setupDatabase')
    .addItem('🔗 Buka Web App (Terkoneksi Otomatis)', 'bukaWebAppTerkoneksi')
    .addItem('📋 Salin URL Web App Publish', 'salinUrlWebApp')
    .addSeparator()
    .addItem('📊 Update Rekapitulasi Kondisi Barang', 'rekapKondisiBarang')
    .addItem('ℹ️ Petunjuk & Status Web App', 'showInfoModal')
    .addToUi();
}

/**
 * FUNGSI UTAMA: Setup Database Otomatis
 * Jalankan fungsi ini pertama kali di Apps Script Editor!
 * Fungsi ini akan membuat semua sheet, kolom, warna, dan data default jika sheet belum ada.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. SETUP SHEET PENGATURAN
  let sheetPengaturan = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheetPengaturan) {
    sheetPengaturan = ss.insertSheet(SHEETS.PENGATURAN);
  }
  formatHeader(sheetPengaturan, ['Kunci_Pengaturan', 'Nilai_Pengaturan', 'Keterangan'], '#1E293B');
  if (sheetPengaturan.getLastRow() <= 1) {
    const dataPengaturan = [
      ['namaSekolah', 'SMP Negeri 1 Cendekia Mandiri', 'Nama resmi sekolah'],
      ['npsn', '20234567', 'Nomor Pokok Sekolah Nasional'],
      ['alamat', 'Jl. Pendidikan No. 45, Kompleks Pendidikan', 'Alamat lengkap'],
      ['kepalaSekolah', 'Dr. H. Ahmad Fauzi, M.Pd.', 'Nama Kepala Sekolah'],
      ['nipKepalaSekolah', '19750815 199903 1 002', 'NIP Kepala Sekolah'],
      ['wakaSarpras', 'Bambang Supriyadi, S.Pd.', 'Wakil Kepala Urusan Sarpras'],
      ['nipWakaSarpras', '19820412 200604 1 015', 'NIP Waka Sarpras'],
      ['kontakSekolah', '(022) 7564321', 'Telepon / WhatsApp'],
      ['emailSekolah', 'info@smpn1cendekia.sch.id', 'Email resmi sekolah'],
      ['formatKodeBarang', 'INV-[KAT]-[RUANG]-[NO]', 'Format generate kode barang otomatis']
    ];
    sheetPengaturan.getRange(2, 1, dataPengaturan.length, 3).setValues(dataPengaturan);
  }

  // 2. SETUP SHEET KATEGORI
  let sheetKategori = ss.getSheetByName(SHEETS.KATEGORI);
  if (!sheetKategori) {
    sheetKategori = ss.insertSheet(SHEETS.KATEGORI);
  }
  formatHeader(sheetKategori, ['ID', 'Kode_Kategori', 'Nama_Kategori', 'Deskripsi', 'Warna_Tag'], '#3B82F6');
  if (sheetKategori.getLastRow() <= 1) {
    const dataKategori = [
      ['KAT-01', 'KOMP', 'Elektronik & TIK', 'Komputer, laptop, printer, proyektor, dan jaringan', '#3B82F6'],
      ['KAT-02', 'MEBL', 'Mebel & Perabot', 'Meja, kursi siswa/guru, lemari, rak buku, dan loker', '#F59E0B'],
      ['KAT-03', 'LAB', 'Alat Laboratorium & Praktikum', 'Mikroskop, alat peraga sains, tabung reaksi, kit IPA', '#10B981'],
      ['KAT-04', 'PUST', 'Pustaka & Referensi', 'Buku teks pelajaran, ensiklopedia, kamus besar perpustakaan', '#8B5CF6'],
      ['KAT-05', 'ORGS', 'Olahraga & Kesenian', 'Bola, matras senam, alat musik karawitan/gamelan, keyboard', '#EC4899'],
      ['KAT-06', 'SARU', 'Sarana Umum & Kebersihan', 'AC, genset darurat, sound system, mesin pemotong rumput', '#64748B']
    ];
    sheetKategori.getRange(2, 1, dataKategori.length, 5).setValues(dataKategori);
  }

  // 3. SETUP SHEET RUANGAN
  let sheetRuangan = ss.getSheetByName(SHEETS.RUANGAN);
  if (!sheetRuangan) {
    sheetRuangan = ss.insertSheet(SHEETS.RUANGAN);
  }
  formatHeader(sheetRuangan, ['ID', 'Kode_Ruangan', 'Nama_Ruangan', 'Gedung', 'Lantai', 'Penanggung_Jawab', 'Kapasitas', 'Deskripsi'], '#059669');
  if (sheetRuangan.getLastRow() <= 1) {
    const dataRuangan = [
      ['RNG-01', 'LAB-KOM', 'Laboratorium Komputer 1', 'Gedung B (Sains & TIK)', 'Lantai 2', 'Rudi Hartono, S.Kom.', 40, 'Ruang praktikum TIK dan ANBK'],
      ['RNG-02', 'LAB-IPA', 'Laboratorium IPA Terpadu', 'Gedung B (Sains & TIK)', 'Lantai 1', 'Dra. Sri Wahyuni', 36, 'Ruang praktikum sains terpadu'],
      ['RNG-03', 'PERPUS', 'Perpustakaan Graha Literasi', 'Gedung Utama', 'Lantai 1', 'Nurul Hidayati, S.I.Pust.', 60, 'Pusat sumber belajar dan pojok digital'],
      ['RNG-04', 'R-GURU', 'Ruang Guru & Staf Pengajar', 'Gedung Utama', 'Lantai 2', 'Bambang Supriyadi, S.Pd.', 50, 'Ruang kerja dewan guru'],
      ['RNG-05', 'R-TU', 'Ruang Tata Usaha (TU)', 'Gedung Utama', 'Lantai 1', 'Dewi Lestari, S.AP.', 12, 'Pelayanan administrasi sekolah'],
      ['RNG-06', 'KLS-7A', 'Ruang Kelas VII-A', 'Gedung A (Akademik)', 'Lantai 1', 'Wali Kelas VII-A', 32, 'Ruang kegiatan belajar kelas 7-A'],
      ['RNG-07', 'AULA', 'Aula Serbaguna & Pertemuan', 'Gedung C (Serbaguna)', 'Lantai 1', 'Hendra Setiawan', 250, 'Upacara indoor dan pentas seni']
    ];
    sheetRuangan.getRange(2, 1, dataRuangan.length, 8).setValues(dataRuangan);
  }

  // 4. SETUP SHEET BARANG
  let sheetBarang = ss.getSheetByName(SHEETS.BARANG);
  if (!sheetBarang) {
    sheetBarang = ss.insertSheet(SHEETS.BARANG);
  }
  const headersBarang = [
    'ID', 'Kode_Barang', 'Nama_Barang', 'ID_Kategori', 'Nama_Kategori',
    'ID_Ruangan', 'Nama_Ruangan', 'Merk', 'Nomor_Seri', 'Tahun_Pengadaan',
    'Sumber_Dana', 'Kondisi', 'Jumlah', 'Satuan', 'Harga_Satuan',
    'Total_Nilai', 'Penanggung_Jawab', 'Keterangan', 'Tanggal_Input', 'Tanggal_Update'
  ];
  formatHeader(sheetBarang, headersBarang, '#4338CA');
  if (sheetBarang.getLastRow() <= 1) {
    const dataBarang = [
      ['BRG-001', 'INV-KOMP-LABKOM-001', 'PC Desktop Client All-in-One Core i5', 'KAT-01', 'Elektronik & TIK', 'RNG-01', 'Laboratorium Komputer 1', 'Lenovo IdeaCentre', 'LNV-82X100234', 2024, 'BOS Kinerja', 'Baik', 32, 'Unit', 8500000, 272000000, 'Rudi Hartono, S.Kom.', 'Perangkat ANBK dan praktikum TIK', '2024-03-15', ''],
      ['BRG-002', 'INV-KOMP-LABKOM-002', 'Server CBT & UNBK Dual Xeon 64GB', 'KAT-01', 'Elektronik & TIK', 'RNG-01', 'Laboratorium Komputer 1', 'Dell PowerEdge R440', 'DELL-SRV-99812', 2023, 'DAK Fisik', 'Baik', 2, 'Unit', 28000000, 56000000, 'Rudi Hartono, S.Kom.', 'Server utama CBT sekolah', '2023-06-20', ''],
      ['BRG-003', 'INV-KOMP-RGURU-003', 'Proyektor LCD HDMI 4000 Lumens', 'KAT-01', 'Elektronik & TIK', 'RNG-04', 'Ruang Guru & Staf Pengajar', 'Epson EB-X51', 'EP-EBX51-4431', 2023, 'BOS Reguler', 'Baik', 5, 'Unit', 6200000, 31000000, 'Bambang Supriyadi, S.Pd.', 'Dipinjam untuk presentasi KBM kelas', '2023-08-10', ''],
      ['BRG-004', 'INV-LAB-LABIPA-004', 'Mikroskop Binokuler LED 1000x', 'KAT-03', 'Alat Laboratorium & Praktikum', 'RNG-02', 'Laboratorium IPA Terpadu', 'Olympus CX23', 'OLY-CX23-1120', 2022, 'DAK Fisik', 'Baik', 12, 'Unit', 9500000, 114000000, 'Dra. Sri Wahyuni', 'Praktikum biologi sel dan jaringan', '2022-09-01', ''],
      ['BRG-005', 'INV-LAB-LABIPA-005', 'Kit Praktikum Optik dan Cahaya Lengkap', 'KAT-03', 'Alat Laboratorium & Praktikum', 'RNG-02', 'Laboratorium IPA Terpadu', 'Pudak Scientific', 'PDK-OPT-2022', 2022, 'BOS Reguler', 'Rusak Ringan', 8, 'Set', 2400000, 19200000, 'Dra. Sri Wahyuni', '2 prisma retak, perlu penggantian lensa', '2022-10-12', ''],
      ['BRG-006', 'INV-MEBL-KLS7A-006', 'Set Meja Kursi Siswa Single Rangka Besi', 'KAT-02', 'Mebel & Perabot', 'RNG-06', 'Ruang Kelas VII-A', 'Futura School', '-', 2024, 'BOS Reguler', 'Baik', 32, 'Set', 650000, 20800000, 'Wali Kelas VII-A', 'Meja kursi ergonomis siswa', '2024-01-10', ''],
      ['BRG-007', 'INV-MEBL-RTU-007', 'Lemari Arsip Besi 4 Pintu Filling Cabinet', 'KAT-02', 'Mebel & Perabot', 'RNG-05', 'Ruang Tata Usaha (TU)', 'Lion Metal System', 'LMS-FC-091', 2021, 'BOS Reguler', 'Baik', 3, 'Unit', 3200000, 9600000, 'Dewi Lestari, S.AP.', 'Penyimpanan berkas ijazah dan raport', '2021-04-18', ''],
      ['BRG-008', 'INV-PUST-PERPUS-008', 'Rak Buku Dua Sisi Kayu Jati Belanda', 'KAT-04', 'Pustaka & Referensi', 'RNG-03', 'Perpustakaan Graha Literasi', 'Custom Kayu', '-', 2023, 'Komite Sekolah', 'Baik', 8, 'Unit', 2800000, 22400000, 'Nurul Hidayati, S.I.Pust.', 'Koleksi buku fiksi dan nonfiksi', '2023-05-14', ''],
      ['BRG-009', 'INV-ORGS-AULA-009', 'Perangkat Gamelan Pelog Slendro Kuningan', 'KAT-05', 'Olahraga & Kesenian', 'RNG-07', 'Aula Serbaguna & Pertemuan', 'Pengrajin Solo', '-', 2020, 'DAK Fisik', 'Baik', 1, 'Paket', 45000000, 45000000, 'Hendra Setiawan', 'Ekstrakurikuler seni karawitan', '2020-11-20', ''],
      ['BRG-010', 'INV-SARU-AULA-010', 'Genset Silent Diesel 15 KVA Otomatis', 'KAT-06', 'Sarana Umum & Kebersihan', 'RNG-07', 'Aula Serbaguna & Pertemuan', 'Yanmar Silent', 'YMR-GEN-88124', 2021, 'DAK Fisik', 'Baik', 1, 'Unit', 65000000, 65000000, 'Bambang Supriyadi, S.Pd.', 'Daya listrik darurat ANBK/Ujian', '2021-08-22', ''],
      ['BRG-011', 'INV-KOMP-LABKOM-011', 'Printer Multifungsi Laserjet Network', 'KAT-01', 'Elektronik & TIK', 'RNG-05', 'Ruang Tata Usaha (TU)', 'HP LaserJet', 'HP-MFP-428-11', 2023, 'BOS Reguler', 'Rusak Berat', 1, 'Unit', 8200000, 8200000, 'Dewi Lestari, S.AP.', 'Mati total akibat sambaran petir', '2023-02-11', ''],
      ['BRG-012', 'INV-SARU-AULA-012', 'Air Conditioner (AC) Split 2 PK Inverter', 'KAT-06', 'Sarana Umum & Kebersihan', 'RNG-01', 'Laboratorium Komputer 1', 'Daikin Inverter', 'DKN-AC-2023-01', 2023, 'BOS Reguler', 'Baik', 3, 'Unit', 7800000, 23400000, 'Rudi Hartono, S.Kom.', 'Pendingin server & lab komputer', '2023-04-05', '']
    ];
    sheetBarang.getRange(2, 1, dataBarang.length, headersBarang.length).setValues(dataBarang);
    // Format mata uang di kolom O dan P
    sheetBarang.getRange(2, 15, dataBarang.length, 2).setNumberFormat('"Rp"#,##0');
  }

  // 5. SETUP SHEET PENGGUNA
  let sheetPengguna = ss.getSheetByName(SHEETS.PENGGUNA);
  if (!sheetPengguna) {
    sheetPengguna = ss.insertSheet(SHEETS.PENGGUNA);
  }
  formatHeader(sheetPengguna, ['ID', 'Username', 'Nama_Lengkap', 'Email', 'Role', 'Status', 'Nomor_Telepon', 'Terakhir_Login'], '#7C3AED');
  if (sheetPengguna.getLastRow() <= 1) {
    const dataUsers = [
      ['USR-01', 'admin', 'Bambang Supriyadi, S.Pd.', 'bambang.sarpras@smpn1cendekia.sch.id', 'Super Admin', 'Aktif', '0812-3456-7890', '2026-09-29 07:15'],
      ['USR-02', 'sarpras', 'Rudi Hartono, S.Kom.', 'rudi.tik@smpn1cendekia.sch.id', 'Admin Sarpras', 'Aktif', '0813-8899-1234', '2026-09-28 14:30'],
      ['USR-03', 'petugas_perpus', 'Nurul Hidayati, S.I.Pust.', 'nurul.perpus@smpn1cendekia.sch.id', 'Petugas Inventaris', 'Aktif', '0857-9912-3344', '2026-09-27 10:20'],
      ['USR-04', 'kepsek', 'Dr. H. Ahmad Fauzi, M.Pd.', 'kepala.sekolah@smpn1cendekia.sch.id', 'Kepala Sekolah', 'Aktif', '0811-2233-4455', '2026-09-25 09:00']
    ];
    sheetPengguna.getRange(2, 1, dataUsers.length, 8).setValues(dataUsers);
  }

  // 6. SETUP SHEET LOG AKTIVITAS
  let sheetLog = ss.getSheetByName(SHEETS.LOG);
  if (!sheetLog) {
    sheetLog = ss.insertSheet(SHEETS.LOG);
  }
  formatHeader(sheetLog, ['ID', 'Timestamp', 'User', 'Aksi', 'Tipe', 'Detail'], '#0D9488');
  if (sheetLog.getLastRow() <= 1) {
    const dataLogs = [
      ['LOG-001', '2026-09-29 07:20:11', 'Bambang Supriyadi, S.Pd.', 'SYNC', 'SISTEM', 'Inisialisasi database inventaris sekolah berhasil']
    ];
    sheetLog.getRange(2, 1, dataLogs.length, 6).setValues(dataLogs);
  }

  // Hapus Sheet1 bawaan kosong jika ada
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Database Inventaris Sekolah Berhasil Disetup!', 'Sukses', 5);
}

/**
 * Format Header dengan warna latar belakang, teks putih tebal, dan auto freeze
 */
function formatHeader(sheet, headers, bgColor) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  range.setBackground(bgColor);
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  range.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Endpoint GET: Melayani permintaan data dari aplikasi web
 */
function doGet(e) {
  const params = e ? e.parameter : {};
  const action = params.action || 'getAll';

  // Jika diakses langsung via browser tanpa action, arahkan atau sediakan tombol buka aplikasi
  if (!params.action) {
    const frontendUrl = "https://ais-dev-3m5oyezq6fqgghn2ht7tf7-499736201091.asia-southeast1.run.app";
    try {
      const htmlContent = [
        '<!DOCTYPE html>',
        '<html lang="id">',
        '<head>',
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '<title>Backend API Inventaris Sekolah</title>',
        '</head>',
        '<body style="font-family:sans-serif; background:#f8fafc; color:#1e293b; padding:40px 20px; text-align:center; margin:0;">',
        '<div style="max-width:550px; margin:auto; background:#ffffff; border-radius:20px; padding:35px 30px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">',
        '<div style="width:60px; height:60px; background:#4338ca; border-radius:16px; display:inline-flex; align-items:center; justify-content:center; color:#ffffff; font-size:28px; margin-bottom:15px;">🏫</div>',
        '<h2 style="color:#0f172a; margin:0 0 8px 0; font-size:22px; font-weight:bold;">Backend Google Apps Script Aktif!</h2>',
        '<p style="color:#64748b; font-size:13px; line-height:1.6; margin:0 0 20px 0;">URL ini adalah <b>mesin penghubung database Google Spreadsheet</b>. Untuk menggunakan aplikasi lengkap (Dashboard, Data Barang, Barcode & Cetak KIR), silakan buka aplikasi inventaris melalui tombol di bawah ini:</p>',
        '<a href="' + frontendUrl + '" target="_top" style="display:inline-block; width:100%; box-sizing:border-box; background:#4f46e5; color:#ffffff; text-decoration:none; padding:14px 20px; border-radius:12px; font-weight:bold; font-size:14px;">🚀 Buka Sistem Inventaris Sekolah</a>',
        '<div style="margin-top:20px; padding-top:15px; border-top:1px solid #f1f5f9; font-size:11px; color:#94a3b8;">Status: 🟢 <b>Database Online & Terhubung</b></div>',
        '</div>',
        '<script>',
        'setTimeout(function() { window.location.href = "' + frontendUrl + '"; }, 2500);',
        '</script>',
        '</body>',
        '</html>'
      ].join('');
      return HtmlService.createHtmlOutput(htmlContent).setTitle('Inventaris Sekolah - Backend Terhubung');
    } catch (err) {}
  }

  let result = {};

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping' || action === 'testConnection') {
      result = {
        success: true,
        message: 'Koneksi ke Google Apps Script dan Spreadsheet berhasil!',
        timestamp: new Date().toISOString(),
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId()
      };
    } else if (action === 'getAll') {
      result = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          barang: getSheetDataAsObjects(ss, SHEETS.BARANG),
          kategori: getSheetDataAsObjects(ss, SHEETS.KATEGORI),
          ruangan: getSheetDataAsObjects(ss, SHEETS.RUANGAN),
          pengguna: getSheetDataAsObjects(ss, SHEETS.PENGGUNA),
          pengaturan: getPengaturanAsObject(ss),
          logs: getSheetDataAsObjects(ss, SHEETS.LOG).slice(-50)
        }
      };
    } else if (action === 'getBarang') {
      result = { success: true, data: getSheetDataAsObjects(ss, SHEETS.BARANG) };
    } else if (action === 'getKategori') {
      result = { success: true, data: getSheetDataAsObjects(ss, SHEETS.KATEGORI) };
    } else if (action === 'getRuangan') {
      result = { success: true, data: getSheetDataAsObjects(ss, SHEETS.RUANGAN) };
    } else {
      result = { success: false, error: 'Aksi tidak dikenali: ' + action };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Endpoint POST: Melayani pembuatan, pengeditan, penghapusan, dan sinkronisasi massal
 */
function doPost(e) {
  let result = {};

  try {
    const contents = e.postData ? e.postData.contents : null;
    if (!contents) {
      throw new Error('Payload POST kosong');
    }

    const payload = JSON.parse(contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'syncAll') {
      // Sinkronisasi penuh dari Frontend ke Spreadsheet
      const data = payload.data;
      if (data.barang) syncCollectionToSheet(ss, SHEETS.BARANG, data.barang);
      if (data.kategori) syncCollectionToSheet(ss, SHEETS.KATEGORI, data.kategori);
      if (data.ruangan) syncCollectionToSheet(ss, SHEETS.RUANGAN, data.ruangan);
      if (data.pengguna) syncCollectionToSheet(ss, SHEETS.PENGGUNA, data.pengguna);
      if (data.pengaturan) syncPengaturanToSheet(ss, data.pengaturan);

      catatLog(ss, payload.user || 'Admin', 'SYNC', 'SISTEM', 'Sinkronisasi penuh data dengan Google Spreadsheet');

      result = {
        success: true,
        message: 'Semua data berhasil disinkronkan ke Google Spreadsheet!',
        timestamp: new Date().toISOString()
      };
    } else if (action === 'saveBarang') {
      const item = payload.item;
      upsertBarang(ss, item);
      catatLog(ss, payload.user || 'Admin', item.id ? 'EDIT' : 'TAMBAH', 'BARANG', 'Menyimpan barang: ' + item.namaBarang);
      result = { success: true, message: 'Barang berhasil disimpan', item: item };
    } else if (action === 'deleteBarang') {
      deleteRecordById(ss, SHEETS.BARANG, payload.id);
      catatLog(ss, payload.user || 'Admin', 'HAPUS', 'BARANG', 'Menghapus barang dengan ID: ' + payload.id);
      result = { success: true, message: 'Barang berhasil dihapus' };
    } else {
      result = { success: false, error: 'Aksi POST tidak didukung: ' + action };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Utility: Mengambil data dari sheet sebagai array of object
 */
function getSheetDataAsObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      // Ubah camelCase header
      const camelKey = toCamelCase(header);
      obj[camelKey] = row[index];
    });
    return obj;
  });
}

/**
 * Utility: Mengambil pengaturan key-value
 */
function getPengaturanAsObject(ss) {
  const sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) return {};
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};

  const rows = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const res = {};
  rows.forEach(r => {
    if (r[0]) res[r[0]] = r[1];
  });
  return res;
}

/**
 * Utility: Ubah Header snake_case atau Title_Case ke camelCase
 */
function toCamelCase(str) {
  return str.toLowerCase().replace(/[_\\s]+(.)/g, (_, c) => c.toUpperCase());
}

/**
 * Utility: Menghapus baris berdasarkan ID di kolom pertama
 */
function deleteRecordById(ss, sheetName, id) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

/**
 * Utility: Menambah atau Memperbarui Barang
 */
function upsertBarang(ss, item) {
  const sheet = ss.getSheetByName(SHEETS.BARANG);
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  const rowData = [
    item.id, item.kodeBarang, item.namaBarang, item.idKategori, item.kategoriNama,
    item.idRuangan, item.ruanganNama, item.merk, item.nomorSeri || '-', item.tahunPengadaan,
    item.sumberDana, item.kondisi, item.jumlah, item.satuan, item.hargaSatuan,
    item.totalNilai, item.penanggungJawab, item.keterangan || '', item.tanggalInput, new Date().toISOString().slice(0, 10)
  ];

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(item.id)) {
        sheet.getRange(i + 2, 1, 1, rowData.length).setValues([rowData]);
        return;
      }
    }
  }

  // Jika belum ada, append baris baru
  sheet.appendRow(rowData);
}

/**
 * Utility: Sinkronisasi seluruh koleksi dari frontend ke sheet
 */
function syncCollectionToSheet(ss, sheetName, items) {
  if (!items || !items.length) return;
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Bersihkan data lama mulai baris 2
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }

  const newRows = items.map(item => {
    return headers.map(header => {
      const camelKey = toCamelCase(header);
      return item[camelKey] !== undefined ? item[camelKey] : '';
    });
  });

  if (newRows.length > 0) {
    sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
  }
}

/**
 * Utility: Sinkronisasi pengaturan ke sheet
 */
function syncPengaturanToSheet(ss, pengaturan) {
  const sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) return;
  const keys = Object.keys(pengaturan);
  const rows = keys.map(k => [k, pengaturan[k], 'Diperbarui otomatis']);
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
  }
  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
}

/**
 * Utility: Mencatat riwayat ke Sheet LogAktivitas
 */
function catatLog(ss, user, aksi, tipe, detail) {
  try {
    const sheet = ss.getSheetByName(SHEETS.LOG);
    if (!sheet) return;
    const logId = 'LOG-' + new Date().getTime();
    const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([logId, now, user, aksi, tipe, detail]);
  } catch (e) {}
}

/**
 * Modal Rekapitulasi Kondisi Barang
 */
function rekapKondisiBarang() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BARANG);
  if (!sheet || sheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('Data barang masih kosong!');
    return;
  }
  const data = sheet.getRange(2, 12, sheet.getLastRow() - 1, 2).getValues(); // Kolom Kondisi & Jumlah
  let baik = 0, rusakRingan = 0, rusakBerat = 0;
  data.forEach(r => {
    const kondisi = String(r[0]).trim();
    const qty = Number(r[1]) || 1;
    if (kondisi === 'Baik') baik += qty;
    else if (kondisi === 'Rusak Ringan') rusakRingan += qty;
    else if (kondisi === 'Rusak Berat') rusakBerat += qty;
  });

  SpreadsheetApp.getUi().alert(
    '📊 Rekapitulasi Kondisi Sarana & Prasarana:\\n\\n' +
    '🟢 Kondisi Baik: ' + baik + ' item\\n' +
    '🟡 Rusak Ringan: ' + rusakRingan + ' item\\n' +
    '🔴 Rusak Berat: ' + rusakBerat + ' item\\n\\n' +
    'Total Aset Tercatat: ' + (baik + rusakRingan + rusakBerat) + ' item'
  );
}

/**
 * Modal Info Petunjuk
 */
function showInfoModal() {
  SpreadsheetApp.getUi().alert(
    '🏫 PETUNJUK GOOGLE APPS SCRIPT INVENTARIS SEKOLAH\\n\\n' +
    '1. Pastikan Anda telah menekan menu "Setup / Inisialisasi Database Otomatis".\\n' +
    '2. Klik menu "Deploy" -> "New deployment" -> pilih type "Web app".\\n' +
    '3. Berikan akses: "Execute as: Me" dan "Who has access: Anyone".\\n' +
    '4. Salin URL Web App yang muncul, atau gunakan menu "🔗 Buka Web App (Terkoneksi Otomatis)".'
  );
}

/**
 * FUNGSI KONEKSI OTOMATIS:
 * Mengambil URL Web App yang telah dipublish dan langsung membuka aplikasi web
 * dengan parameter ?gas_url=... sehingga langsung terhubung 100% otomatis!
 */
function bukaWebAppTerkoneksi() {
  let webAppUrl = '';
  try {
    webAppUrl = ScriptApp.getService().getUrl();
  } catch (err) {}

  if (!webAppUrl) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Web App belum dipublish / dideploy!\\n\\n' +
      'Silakan lakukan langkah berikut terlebih dahulu:\\n' +
      '1. Di menu editor atas, klik "Deploy" -> "New deployment"\\n' +
      '2. Pilih type: Web app\\n' +
      '3. Atur Execute as: Me dan Who has access: Anyone\\n' +
      '4. Klik Deploy dan berikan izin.'
    );
    return;
  }

  const appFrontendUrl = "https://ais-dev-3m5oyezq6fqgghn2ht7tf7-499736201091.asia-southeast1.run.app";
  const connectUrl = appFrontendUrl + "?gas_url=" + encodeURIComponent(webAppUrl);

  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;padding:20px;line-height:1.5;">' +
    '<h3 style="color:#4338CA;margin-top:0;">⚡ Koneksi Otomatis Siap!</h3>' +
    '<p style="font-size:12px;color:#475569;">URL Web App publish Anda terdeteksi:<br>' +
    '<input readonly style="width:100%;padding:8px;font-family:monospace;font-size:11px;border:1px solid #cbd5e1;border-radius:6px;margin-top:4px;" value="' + webAppUrl + '"></p>' +
    '<div style="margin-top:16px;">' +
    '<a href="' + connectUrl + '" target="_blank" style="background:#4F46E5;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:13px;display:inline-block;">🚀 Buka Aplikasi & Hubungkan Otomatis</a>' +
    '</div>' +
    '<p style="font-size:11px;color:#64748b;margin-top:12px;">Aplikasi akan terbuka di tab baru dan otomatis menyimpan URL ini tanpa perlu copy-paste manual.</p>' +
    '</div>'
  ).setWidth(500).setHeight(240);

  SpreadsheetApp.getUi().showModalDialog(html, '🔗 Sambungkan Otomatis ke Sistem Inventaris');
}

/**
 * Salin URL Web App Publish
 */
function salinUrlWebApp() {
  let webAppUrl = '';
  try {
    webAppUrl = ScriptApp.getService().getUrl();
  } catch (err) {}

  if (!webAppUrl) {
    SpreadsheetApp.getUi().alert('Web App belum dideploy. Silakan Deploy -> New deployment -> Web app terlebih dahulu.');
    return;
  }

  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;padding:15px;">' +
    '<p style="font-size:12px;margin-top:0;">Salin URL Web App Google Apps Script berikut:</p>' +
    '<input readonly id="gasUrlInput" style="width:100%;padding:8px;font-family:monospace;font-size:11px;border:1px solid #94a3b8;border-radius:6px;" value="' + webAppUrl + '">' +
    '<p style="font-size:11px;color:#64748b;margin-top:8px;">URL ini dapat ditempelkan di menu Pengaturan aplikasi inventaris.</p>' +
    '</div>'
  ).setWidth(480).setHeight(150);

  SpreadsheetApp.getUi().showModalDialog(html, '📋 URL Web App Publish');
}
`;

export const INDEX_HTML_STANDALONE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Inventaris Sekolah Terpadu</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800">
  <div class="min-h-screen flex flex-col">
    <!-- Header Standalone -->
    <header class="bg-indigo-700 text-white p-4 shadow-md flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-white/20 rounded-lg">🏫</div>
        <div>
          <h1 class="font-bold text-lg">Sistem Inventaris Sekolah Terpadu</h1>
          <p class="text-xs text-indigo-100">Integrasi Google Spreadsheet & Apps Script</p>
        </div>
      </div>
      <div id="connStatus" class="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-medium">
        ● Google Sheet Terhubung
      </div>
    </header>

    <main class="p-6 max-w-7xl mx-auto w-full flex-1">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 class="text-xl font-bold mb-4 text-slate-800">Sistem Inventaris Terintegrasi</h2>
        <p class="text-slate-600 mb-6 leading-relaxed">
          File ini adalah template HTML standalone yang dapat diletakkan langsung di dalam Google Apps Script editor
          (menu <b>File -> New -> HTML file</b> dengan nama <code>index.html</code>) jika Anda ingin menjalankan antarmuka
          langsung melalui Google Apps Script Web App.
        </p>
        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p class="text-sm text-indigo-800 font-medium">
            💡 Untuk pengalaman terbaik, fitur lengkap (Dashboard analitik, Multi-filter, Cetak Label Barcode & QR Code massal, Manajemen Ruangan & Kategori, serta Kartu Inventaris Ruangan), gunakan aplikasi web interaktif yang sedang Anda buka saat ini!
          </p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
`;
