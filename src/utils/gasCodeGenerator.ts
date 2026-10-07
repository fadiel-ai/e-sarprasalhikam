/**
 * =========================================================================
 * PAKET DEPLOYMENT GOOGLE APPS SCRIPT LENGKAP (4 KODE POKOK)
 * Sistem Inventaris Sekolah Terpadu
 * =========================================================================
 */

/**
 * FILE 1: Code.gs (Backend Server & Database Service)
 */
export const CODE_GS_SCRIPT = `/**
 * =========================================================================
 * 1. Code.gs - SISTEM INVENTARIS SEKOLAH TERPADU
 * Backend Server, Manajemen Database Google Sheets & REST API
 * =========================================================================
 */

const SHEETS = {
  BARANG: 'Barang',
  KATEGORI: 'Kategori',
  RUANGAN: 'Ruangan',
  PENGGUNA: 'Pengguna',
  PENGATURAN: 'Pengaturan',
  LOG: 'LogAktivitas'
};

/**
 * Helper untuk menyertakan file HTML lain (Stylesheet & JavaScript)
 * Aman dari error jika salah satu file belum dibuat
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (err1) {
    try {
      return HtmlService.createHtmlOutputFromFile(filename.toLowerCase()).getContent();
    } catch (err2) {
      return '<!-- ' + filename + ' belum dibuat -->';
    }
  }
}

/**
 * Menu Kustom di Google Spreadsheet saat file dibuka
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏫 INVENTARIS SEKOLAH')
    .addItem('⚡ Inisialisasi Database Otomatis', 'setupDatabase')
    .addItem('📊 Rekap Kondisi Sarpras', 'rekapKondisiBarang')
    .addSeparator()
    .addItem('🔗 Buka Web App Inventaris', 'bukaAplikasi')
    .addToUi();
}

/**
 * Melayani Antarmuka Web App saat URL Web App diakses
 * Dilengkapi proteksi otomatis agar tidak error jika file Index belum dibuat
 */
function doGet(e) {
  const params = e ? e.parameter : {};
  
  // Jika dipanggil via REST API (action=getAll / getBarang dsb)
  if (params.action) {
    return handleApiGet(params);
  }

  // 1. Coba muat file 'Index' (nama persis standar)
  try {
    const template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
      .setTitle('Sistem Inventaris Sarana & Prasarana Sekolah')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err1) {
    // 2. Coba muat file 'index' (huruf kecil)
    try {
      const templateLower = HtmlService.createTemplateFromFile('index');
      return templateLower.evaluate()
        .setTitle('Sistem Inventaris Sarana & Prasarana Sekolah')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (err2) {
      // 3. JIKA FILE Index.html BELUM DIBUAT DI APPS SCRIPT:
      // Tampilkan panduan interaktif cara menambahkannya dalam 3 langkah mudah!
      return HtmlService.createHtmlOutput(getPemberitahuanFileIndexKurang())
        .setTitle('Petunjuk: Tambahkan File Index.html di Apps Script')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  }
}

/**
 * Halaman panduan otomatis jika file Index.html belum dibuat di editor Apps Script
 */
function getPemberitahuanFileIndexKurang() {
  return [
    '<!DOCTYPE html>',
    '<html lang="id">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>Petunjuk: Tambahkan File Index di Apps Script</title>',
    '<style>',
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 30px 15px; margin: 0; line-height: 1.6; }',
    '.card { max-width: 600px; margin: auto; background: #fff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }',
    '.badge { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }',
    '.step { background: #f1f5f9; border-radius: 10px; padding: 12px 16px; margin: 10px 0; font-size: 13px; border-left: 4px solid #4f46e5; }',
    'code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; font-weight: bold; color: #312e81; }',
    '</style>',
    '</head>',
    '<body>',
    '<div class="card">',
    '<div class="badge">Langkah Terakhir Deployment</div>',
    '<h2 style="color: #0f172a; margin: 12px 0 6px 0;">Tinggal 1 Langkah: Tambahkan File "Index" di Apps Script</h2>',
    '<p style="font-size: 13px; color: #64748b; margin-top: 0;">Pesan ini muncul karena Anda baru menyimpan <b>Code.gs</b> dan belum menambahkan file HTML di Apps Script editor.</p>',
    '<div class="step">',
    '<b>Langkah 1:</b> Di Apps Script editor (sebelah kiri tulisan <i>Files</i>), klik tombol <b>+ (Plus)</b> lalu pilih <b>HTML</b>.',
    '</div>',
    '<div class="step">',
    '<b>Langkah 2:</b> Beri nama file persis: <code>Index</code> <i>(cukup ketik Index tanpa .html)</i>.',
    '</div>',
    '<div class="step">',
    '<b>Langkah 3:</b> Tempelkan kode dari tab <b>2. Index.html</b> pada aplikasi inventaris, lalu ulangi untuk membuat <code>Stylesheet</code> dan <code>JavaScript</code>.',
    '</div>',
    '<p style="font-size: 12px; color: #475569; margin-top: 20px;">Setelah ke-4 file dibuat, muat ulang (refresh) halaman ini dan aplikasi inventaris akan langsung tampil secara penuh!</p>',
    '</div>',
    '</body>',
    '</html>'
  ].join('');
}

/**
 * Handle API GET Request (Mendukung read & write real-time tanpa kendala CORS)
 */
function handleApiGet(params) {
  const action = params.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let result = {};

  try {
    if (action === 'getAll') {
      result = {
        success: true,
        data: getInitialData()
      };
    } else if (action === 'getBarang') {
      result = { success: true, data: getSheetDataAsObjects(ss, SHEETS.BARANG) };
    } else if (action === 'saveBarang' || action === 'simpanBarang') {
      const item = typeof params.data === 'string' ? JSON.parse(params.data) : (params.data || {});
      result = simpanBarang(item);
    } else if (action === 'deleteBarang' || action === 'hapusBarang') {
      result = hapusBarang(params.id);
    } else if (action === 'savePengaturan') {
      const item = typeof params.data === 'string' ? JSON.parse(params.data) : (params.data || {});
      result = simpanPengaturan(item);
    } else if (action === 'syncAll') {
      const payload = typeof params.data === 'string' ? JSON.parse(params.data) : (params.data || {});
      result = syncAllData(payload);
    } else {
      result = { success: true, message: 'Status endpoint aktif', action: action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle API POST Request
 */
function doPost(e) {
  let result = {};
  try {
    const postData = JSON.parse(e.postData.contents || '{}');
    const action = postData.action;
    const payload = postData.data;

    if (action === 'saveBarang' || action === 'simpanBarang') {
      result = simpanBarang(payload);
    } else if (action === 'deleteBarang' || action === 'hapusBarang') {
      result = hapusBarang(payload.id || payload);
    } else if (action === 'savePengaturan') {
      result = simpanPengaturan(payload);
    } else if (action === 'syncAll') {
      result = syncAllData(payload);
    } else {
      result = { success: true, message: 'Data diterima' };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sinkronisasi Penuh Seluruh Data
 */
function syncAllData(data) {
  if (!data) return { success: false, message: 'Data kosong' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.barang && Array.isArray(data.barang)) {
    const sBarang = ss.getSheetByName(SHEETS.BARANG) || ss.insertSheet(SHEETS.BARANG);
    formatHeader(sBarang, [
      'ID', 'Kode_Barang', 'Nama_Barang', 'ID_Kategori', 'Kategori_Nama',
      'ID_Ruangan', 'Ruangan_Nama', 'Merk', 'Nomor_Seri', 'Tahun_Pengadaan',
      'Sumber_Dana', 'Kondisi', 'Jumlah', 'Satuan', 'Harga_Satuan',
      'Total_Nilai', 'Penanggung_Jawab', 'Keterangan', 'Tanggal_Input', 'Tanggal_Update'
    ], '#4F46E5');
    
    if (sBarang.getLastRow() > 1) {
      sBarang.deleteRows(2, sBarang.getLastRow() - 1);
    }
    
    if (data.barang.length > 0) {
      const rows = data.barang.map(function(item) {
        return [
          item.id || ('BRG-' + Date.now()),
          item.kodeBarang || '',
          item.namaBarang || '',
          item.idKategori || '',
          item.kategoriNama || '',
          item.idRuangan || '',
          item.ruanganNama || '',
          item.merk || '-',
          item.nomorSeri || '-',
          item.tahunPengadaan || new Date().getFullYear(),
          item.sumberDana || 'BOS Reguler',
          item.kondisi || 'Baik',
          Number(item.jumlah || 1),
          item.satuan || 'Unit',
          Number(item.hargaSatuan || 0),
          Number(item.totalNilai || ((item.jumlah || 1) * (item.hargaSatuan || 0))),
          item.penanggungJawab || 'Staf Sarpras',
          item.keterangan || '',
          item.tanggalInput || new Date().toISOString().slice(0, 10),
          new Date().toISOString().slice(0, 10)
        ];
      });
      sBarang.getRange(2, 1, rows.length, 20).setValues(rows);
    }
  }

  if (data.kategori && Array.isArray(data.kategori) && data.kategori.length > 0) {
    const sKat = ss.getSheetByName(SHEETS.KATEGORI) || ss.insertSheet(SHEETS.KATEGORI);
    formatHeader(sKat, ['ID', 'Kode_Kategori', 'Nama_Kategori', 'Deskripsi', 'Warna'], '#2563EB');
    if (sKat.getLastRow() > 1) sKat.deleteRows(2, sKat.getLastRow() - 1);
    const rows = data.kategori.map(function(k) {
      return [k.id, k.kodeKategori, k.namaKategori, k.deskripsi || '', k.warna || '#3B82F6'];
    });
    sKat.getRange(2, 1, rows.length, 5).setValues(rows);
  }

  if (data.ruangan && Array.isArray(data.ruangan) && data.ruangan.length > 0) {
    const sRng = ss.getSheetByName(SHEETS.RUANGAN) || ss.insertSheet(SHEETS.RUANGAN);
    formatHeader(sRng, ['ID', 'Kode_Ruangan', 'Nama_Ruangan', 'Gedung', 'Penanggung_Jawab', 'NIP_Penanggung_Jawab', 'Kapasitas', 'Luas'], '#059669');
    if (sRng.getLastRow() > 1) sRng.deleteRows(2, sRng.getLastRow() - 1);
    const rows = data.ruangan.map(function(r) {
      return [r.id, r.kodeRuangan, r.namaRuangan, r.gedung || '', r.penanggungJawab || '', r.nipPenanggungJawab || '', r.kapasitas || 30, r.luas || '48 m2'];
    });
    sRng.getRange(2, 1, rows.length, 8).setValues(rows);
  }

  catatLog('SYNC_ALL', 'Sinkronisasi penuh seluruh data dari Vercel');
  return { success: true, message: 'Semua data berhasil disinkronkan ke Google Spreadsheet!' };
}

/**
 * Mengambil semua data awal untuk frontend
 */
function getInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    barang: getSheetDataAsObjects(ss, SHEETS.BARANG),
    kategori: getSheetDataAsObjects(ss, SHEETS.KATEGORI),
    ruangan: getSheetDataAsObjects(ss, SHEETS.RUANGAN),
    pengaturan: getPengaturanAsObject(ss),
    logs: getSheetDataAsObjects(ss, SHEETS.LOG).slice(-30)
  };
}

/**
 * Simpan / Perbarui Barang
 */
function simpanBarang(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BARANG);
  if (!sheet) return { success: false, error: 'Sheet Barang belum dibuat. Jalankan setupDatabase() dulu.' };

  const lastRow = sheet.getLastRow();
  const rowData = [
    item.id || ('BRG-' + Date.now()),
    item.kodeBarang || '',
    item.namaBarang || '',
    item.idKategori || '',
    item.kategoriNama || '',
    item.idRuangan || '',
    item.ruanganNama || '',
    item.merk || '-',
    item.nomorSeri || '-',
    item.tahunPengadaan || new Date().getFullYear(),
    item.sumberDana || 'BOS Reguler',
    item.kondisi || 'Baik',
    Number(item.jumlah || 1),
    item.satuan || 'Unit',
    Number(item.hargaSatuan || 0),
    Number(item.totalNilai || ((item.jumlah || 1) * (item.hargaSatuan || 0))),
    item.penanggungJawab || 'Staf Sarpras',
    item.keterangan || '',
    item.tanggalInput || new Date().toISOString().slice(0, 10),
    new Date().toISOString().slice(0, 10)
  ];

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(item.id)) {
        sheet.getRange(i + 2, 1, 1, rowData.length).setValues([rowData]);
        catatLog('UPDATE_BARANG', 'Memperbarui barang: ' + item.namaBarang);
        return { success: true, message: 'Barang berhasil diperbarui', item: item };
      }
    }
  }

  sheet.appendRow(rowData);
  catatLog('TAMBAH_BARANG', 'Menambahkan barang: ' + item.namaBarang);
  return { success: true, message: 'Barang berhasil disimpan', item: item };
}

/**
 * Hapus Barang berdasarkan ID
 */
function hapusBarang(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BARANG);
  if (!sheet) return { success: false };

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      catatLog('HAPUS_BARANG', 'Menghapus barang ID: ' + id);
      return { success: true, message: 'Barang berhasil dihapus' };
    }
  }
  return { success: false, message: 'Barang tidak ditemukan' };
}

/**
 * Simpan Kategori
 */
function simpanKategori(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.KATEGORI);
  if (!sheet) return { success: false };
  const lastRow = sheet.getLastRow();
  const rowData = [
    item.id || ('KAT-' + Date.now()),
    item.kodeKategori || '',
    item.namaKategori || '',
    item.deskripsi || '',
    item.warna || '#3B82F6'
  ];

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(item.id)) {
        sheet.getRange(i + 2, 1, 1, rowData.length).setValues([rowData]);
        return { success: true };
      }
    }
  }
  sheet.appendRow(rowData);
  return { success: true };
}

/**
 * Hapus Kategori
 */
function hapusKategori(id) {
  return deleteRowById(SHEETS.KATEGORI, id);
}

/**
 * Simpan Ruangan
 */
function simpanRuangan(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.RUANGAN);
  if (!sheet) return { success: false };
  const lastRow = sheet.getLastRow();
  const rowData = [
    item.id || ('RNG-' + Date.now()),
    item.kodeRuangan || '',
    item.namaRuangan || '',
    item.gedung || 'Gedung Utama',
    item.penanggungJawab || '',
    item.nipPenanggungJawab || '',
    item.kapasitas || 30,
    item.luas || '48 m2'
  ];

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(item.id)) {
        sheet.getRange(i + 2, 1, 1, rowData.length).setValues([rowData]);
        return { success: true };
      }
    }
  }
  sheet.appendRow(rowData);
  return { success: true };
}

/**
 * Hapus Ruangan
 */
function hapusRuangan(id) {
  return deleteRowById(SHEETS.RUANGAN, id);
}

/**
 * Simpan Profil Pengaturan Sekolah Real-Time
 */
function simpanPengaturan(item) {
  if (!item) return { success: false, message: 'Item pengaturan kosong' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.PENGATURAN);
    formatHeader(sheet, ['Kunci_Pengaturan', 'Nilai_Pengaturan', 'Keterangan'], '#1E293B');
  }

  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  const entries = Object.keys(item).map(function(key) {
    return [key, String(item[key] || ''), ''];
  });

  if (entries.length > 0) {
    sheet.getRange(2, 1, entries.length, 3).setValues(entries);
  }
  catatLog('UPDATE_PENGATURAN', 'Memperbarui identitas sekolah & pengaturan real-time');
  return { success: true, message: 'Pengaturan sekolah berhasil diperbarui di Google Spreadsheet' };
}

/**
 * Setup Database Otomatis: Membuat 6 Sheet Lengkap
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Pengaturan
  let sPengaturan = ss.getSheetByName(SHEETS.PENGATURAN) || ss.insertSheet(SHEETS.PENGATURAN);
  formatHeader(sPengaturan, ['Kunci_Pengaturan', 'Nilai_Pengaturan', 'Keterangan'], '#1E293B');
  if (sPengaturan.getLastRow() <= 1) {
    sPengaturan.getRange(2, 1, 9, 3).setValues([
      ['namaSekolah', 'SMK AL-HIKAM SENDANG AGUNG', 'Nama Resmi Sekolah'],
      ['npsn', '69900123', 'Nomor Pokok Sekolah Nasional'],
      ['alamat', 'Jl. Ponpes Al-Hikam, Sendang Agung', 'Alamat Lengkap'],
      ['kepalaSekolah', 'Kepala Sekolah SMK Al-Hikam', 'Nama Kepala Sekolah'],
      ['nipKepalaSekolah', '-', 'NIP Kepala Sekolah'],
      ['wakaSarpras', 'Waka Sarpras SMK Al-Hikam', 'Wakil Kepala Urusan Sarpras'],
      ['nipWakaSarpras', '-', 'NIP Waka Sarpras'],
      ['kontakSekolah', '0812-7890-1234', 'Telepon / Kontak'],
      ['emailSekolah', 'smkalhikam.sendangagung@gmail.com', 'Email Resmi']
    ]);
  }

  // 2. Sheet Kategori
  let sKategori = ss.getSheetByName(SHEETS.KATEGORI) || ss.insertSheet(SHEETS.KATEGORI);
  formatHeader(sKategori, ['ID', 'Kode_Kategori', 'Nama_Kategori', 'Deskripsi', 'Warna'], '#2563EB');
  if (sKategori.getLastRow() <= 1) {
    sKategori.getRange(2, 1, 5, 5).setValues([
      ['KAT-01', 'KOMP', 'Elektronik & TIK', 'Komputer, proyektor, printer, UPS', '#3B82F6'],
      ['KAT-02', 'MEBEL', 'Mebel & Perabot', 'Meja, kursi siswa, lemari besi, rak buku', '#8B5CF6'],
      ['KAT-03', 'LAB', 'Alat Praktikum Lab', 'Mikroskop, alat peraga sains, tabung reaksi', '#10B981'],
      ['KAT-04', 'BUKU', 'Koleksi Perpustakaan', 'Buku teks utama, ensiklopedia, referensi', '#F59E0B'],
      ['KAT-05', 'OR', 'Alat Olahraga', 'Matras senam, bola basket, meja tenis', '#EC4899']
    ]);
  }

  // 3. Sheet Ruangan
  let sRuangan = ss.getSheetByName(SHEETS.RUANGAN) || ss.insertSheet(SHEETS.RUANGAN);
  formatHeader(sRuangan, ['ID', 'Kode_Ruangan', 'Nama_Ruangan', 'Gedung', 'Penanggung_Jawab', 'NIP_Penanggung_Jawab', 'Kapasitas', 'Luas'], '#059669');
  if (sRuangan.getLastRow() <= 1) {
    sRuangan.getRange(2, 1, 5, 8).setValues([
      ['RNG-01', 'LAB-KOMP', 'Laboratorium Komputer 1', 'Gedung B Lantai 2', 'Budi Santoso, S.Kom.', '19870514 201101 1 004', 36, '72 m2'],
      ['RNG-02', 'LAB-IPA', 'Laboratorium IPA Terpadu', 'Gedung B Lantai 1', 'Sri Wahyuni, M.Pd.', '19830219 200801 2 006', 40, '84 m2'],
      ['RNG-03', 'PERPUS', 'Perpustakaan Ki Hajar Dewantara', 'Gedung A Lantai 1', 'Dewi Lestari, S.I.Pust.', '19891102 201502 2 003', 60, '120 m2'],
      ['RNG-04', 'R-GURU', 'Ruang Majelis Guru', 'Gedung A Lantai 2', 'Drs. Supriyono', '19680315 199412 1 001', 45, '96 m2'],
      ['RNG-05', 'R-TU', 'Ruang Tata Usaha (TU)', 'Gedung A Lantai 1', 'Siti Rahmawati, S.AP.', '19850720 201001 2 008', 12, '48 m2']
    ]);
  }

  // 4. Sheet Barang
  let sBarang = ss.getSheetByName(SHEETS.BARANG) || ss.insertSheet(SHEETS.BARANG);
  formatHeader(sBarang, [
    'ID', 'Kode_Barang', 'Nama_Barang', 'ID_Kategori', 'Kategori_Nama',
    'ID_Ruangan', 'Ruangan_Nama', 'Merk', 'Nomor_Seri', 'Tahun_Pengadaan',
    'Sumber_Dana', 'Kondisi', 'Jumlah', 'Satuan', 'Harga_Satuan',
    'Total_Nilai', 'Penanggung_Jawab', 'Keterangan', 'Tanggal_Input', 'Tanggal_Update'
  ], '#4F46E5');
  if (sBarang.getLastRow() <= 1) {
    sBarang.getRange(2, 1, 3, 20).setValues([
      ['BRG-01', 'INV-KOMP-LAB-001', 'PC All-in-One Core i5 16GB', 'KAT-01', 'Elektronik & TIK', 'RNG-01', 'Laboratorium Komputer 1', 'Lenovo IdeaCentre', 'LNV-AIO-2023-881', 2023, 'DAK Fisik', 'Baik', 20, 'Unit', 9500000, 190000000, 'Budi Santoso, S.Kom.', 'Paket komputer lab', '2023-08-15', '2023-08-15'],
      ['BRG-02', 'INV-KOMP-LAB-002', 'Proyektor Laser Full HD 4000 Lumens', 'KAT-01', 'Elektronik & TIK', 'RNG-01', 'Laboratorium Komputer 1', 'Epson EB-L200F', 'EPS-PRJ-2023-412', 2023, 'BOS Kinerja', 'Baik', 1, 'Unit', 14500000, 14500000, 'Budi Santoso, S.Kom.', 'Terpasang di plafon lab', '2023-08-15', '2023-08-15'],
      ['BRG-03', 'INV-MEBEL-RNG-001', 'Meja Komputer Siswa Moduler', 'KAT-02', 'Mebel & Perabot', 'RNG-01', 'Laboratorium Komputer 1', 'Informa Workstation', 'INF-DSK-2023-01', 2023, 'BOS Reguler', 'Baik', 20, 'Unit', 850000, 17000000, 'Budi Santoso, S.Kom.', 'Bahan multiplex lapis HPL', '2023-08-15', '2023-08-15']
    ]);
  }

  // 5. Sheet Log
  let sLog = ss.getSheetByName(SHEETS.LOG) || ss.insertSheet(SHEETS.LOG);
  formatHeader(sLog, ['ID', 'Waktu', 'Aksi', 'Keterangan', 'Pengguna'], '#475569');

  catatLog('SETUP_DATABASE', 'Inisialisasi tabel database inventaris sekolah berhasil');
  SpreadsheetApp.getUi().alert('✅ Database Inventaris Sekolah Berhasil Diinisialisasi!\\n\\nSemua tabel (Barang, Kategori, Ruangan, Pengaturan, Log) siap digunakan.');
}

/**
 * Format Header Kolom Sheet
 */
function formatHeader(sheet, headers, bgColor) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  const range = sheet.getRange(1, 1, 1, headers.length);
  range.setBackground(bgColor);
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  range.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Catat Log Aktivitas
 */
function catatLog(aksi, ket, user) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let s = ss.getSheetByName(SHEETS.LOG);
    if (!s) return;
    s.appendRow(['LOG-' + Date.now(), new Date().toLocaleString('id-ID'), aksi, ket, user || 'Admin Sarpras']);
  } catch (e) {}
}

/**
 * Helper: Hapus Baris Berdasarkan Kolom ID Pertama
 */
function deleteRowById(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false };
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false };
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return { success: true };
    }
  }
  return { success: false };
}

/**
 * Helper: Ambil Baris Sheet sebagai Array of Objects
 */
function getSheetDataAsObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, idx) => {
      const key = String(header).toLowerCase().replace(/[_\\s]+(.)/g, (_, c) => c.toUpperCase());
      obj[key] = row[idx];
    });
    return obj;
  });
}

/**
 * Helper: Ambil Pengaturan sebagai Objek Key-Value
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
 * Dialog Rekapitulasi Kondisi Sarpras
 */
function rekapKondisiBarang() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.BARANG);
  if (!sheet || sheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('Belum ada data barang di database.');
    return;
  }
  const data = sheet.getRange(2, 12, sheet.getLastRow() - 1, 2).getValues();
  let baik = 0, rusakRingan = 0, rusakBerat = 0;
  data.forEach(r => {
    const k = String(r[0]);
    const qty = Number(r[1]) || 1;
    if (k === 'Baik') baik += qty;
    else if (k === 'Rusak Ringan') rusakRingan += qty;
    else if (k === 'Rusak Berat') rusakBerat += qty;
  });
  SpreadsheetApp.getUi().alert(
    '📊 Rekapitulasi Sarpras:\\n\\n' +
    '🟢 Baik: ' + baik + ' item\\n' +
    '🟡 Rusak Ringan: ' + rusakRingan + ' item\\n' +
    '🔴 Rusak Berat: ' + rusakBerat + ' item\\n\\n' +
    'Total Aset: ' + (baik + rusakRingan + rusakBerat) + ' item'
  );
}

/**
 * Buka Web App dari Spreadsheet
 */
function bukaAplikasi() {
  const url = ScriptApp.getService().getUrl();
  if (!url) {
    SpreadsheetApp.getUi().alert('Aplikasi belum dideploy! Klik Deploy -> New deployment -> Web app.');
    return;
  }
  const html = '<div style="font-family:sans-serif;padding:20px;text-align:center;">' +
    '<h3 style="color:#4338CA;">🚀 Aplikasi Inventaris Siap Dibuka</h3>' +
    '<p style="font-size:12px;color:#475569;">Klik tombol di bawah untuk membuka antarmuka web:</p>' +
    '<a href="' + url + '" target="_blank" style="display:inline-block;background:#4F46E5;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:10px;">Buka Web App</a>' +
    '</div>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(400).setHeight(180), 'Inventaris Sekolah');
}
`;

/**
 * FILE 2: Index.html (Struktur Utama Antarmuka & Semua Menu)
 */
export const INDEX_HTML_SCRIPT = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Inventaris Sarana & Prasarana Sekolah</title>
  <?!= include('Stylesheet'); ?>
</head>
<body class="bg-slate-50 text-slate-800 antialiased font-sans">
  <!-- Toast Notification -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform transition-all duration-300 translate-y-[-150%] opacity-0 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold">
    <span id="toastIcon">ℹ️</span>
    <span id="toastMsg">Pesan</span>
  </div>

  <div class="min-h-screen flex flex-col md:flex-row">
    <!-- SIDEBAR NAVIGASI -->
    <aside class="no-print w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl shadow-md">
            🏫
          </div>
          <div>
            <h1 class="text-sm font-bold text-white leading-tight" id="sidebarSchoolName">SMK AL-HIKAM SENDANG AGUNG</h1>
            <span class="text-[10px] text-indigo-400 font-semibold" id="sidebarNpsn">NPSN 69900123</span>
          </div>
        </div>
      </div>

      <!-- Menu Navigation -->
      <nav class="p-4 space-y-1.5 flex-1 text-xs">
        <button onclick="switchTab('dashboard')" id="nav-dashboard" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all bg-indigo-600 text-white">
          <span>📊</span><span>Dashboard Sarpras</span>
        </button>
        <button onclick="switchTab('barang')" id="nav-barang" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all hover:bg-slate-800 text-slate-300">
          <span>📦</span><span>Data Barang & Aset</span>
        </button>
        <button onclick="switchTab('barcode')" id="nav-barcode" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all hover:bg-slate-800 text-slate-300">
          <span>🏷️</span><span>Label Barcode & QR</span>
        </button>
        <button onclick="switchTab('kir')" id="nav-kir" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all hover:bg-slate-800 text-slate-300">
          <span>📋</span><span>Kartu Inventaris (KIR)</span>
        </button>
        <button onclick="switchTab('ruangan')" id="nav-ruangan" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all hover:bg-slate-800 text-slate-300">
          <span>🏢</span><span>Kategori & Ruangan</span>
        </button>
        <button onclick="switchTab('pengaturan')" id="nav-pengaturan" class="nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all hover:bg-slate-800 text-slate-300">
          <span>⚙️</span><span>Profil & Pengaturan</span>
        </button>
      </nav>

      <!-- Status Footer -->
      <div class="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Google Sheet Live</span>
        </span>
        <button onclick="loadAllData()" class="p-1 hover:text-white" title="Muat ulang data">🔄</button>
      </div>
    </aside>

    <!-- KONTEN UTAMA -->
    <main class="flex-1 overflow-y-auto">
      <!-- Top Navbar Mobile / Header -->
      <header class="no-print bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 id="pageTitle" class="text-base font-bold text-slate-900">Dashboard Sarpras</h2>
          <p class="text-xs text-slate-500">Sistem Inventaris Terintegrasi Google Spreadsheet</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="bukaModalBarang()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2">
            <span>+</span><span>Tambah Barang</span>
          </button>
        </div>
      </header>

      <div class="p-6 max-w-7xl mx-auto space-y-6">

        <!-- TAB 1: DASHBOARD -->
        <section id="tab-dashboard" class="tab-content space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">📦</div>
              <div>
                <p class="text-xs text-slate-500 font-medium">Total Jenis Barang</p>
                <h3 id="statTotalJenis" class="text-2xl font-extrabold text-slate-900">0</h3>
                <span id="statTotalItem" class="text-[11px] text-blue-600 font-bold">0 Unit Fisik</span>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">💰</div>
              <div>
                <p class="text-xs text-slate-500 font-medium">Total Nilai Investasi</p>
                <h3 id="statTotalNilai" class="text-lg font-extrabold text-slate-900">Rp 0</h3>
                <span class="text-[11px] text-indigo-600 font-bold">Aset Tercatat</span>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">🟢</div>
              <div>
                <p class="text-xs text-slate-500 font-medium">Kondisi Baik</p>
                <h3 id="statBaik" class="text-2xl font-extrabold text-slate-900">0</h3>
                <span id="statBaikPct" class="text-[11px] text-emerald-600 font-bold">0% Siap Pakai</span>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">⚠️</div>
              <div>
                <p class="text-xs text-slate-500 font-medium">Rusak (Perlu Perbaikan)</p>
                <h3 id="statRusak" class="text-2xl font-extrabold text-slate-900">0</h3>
                <span id="statRusakRingan" class="text-[11px] text-amber-600 font-bold">0 RR / 0 RB</span>
              </div>
            </div>
          </div>

          <!-- Quick Preview Barang Terbaru -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900">Aset Sarana & Prasarana Terbaru</h3>
              <button onclick="switchTab('barang')" class="text-xs text-indigo-600 hover:underline font-semibold">Lihat Semua Data &rarr;</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th class="p-3">Kode</th>
                    <th class="p-3">Nama Barang</th>
                    <th class="p-3">Ruangan</th>
                    <th class="p-3">Kondisi</th>
                    <th class="p-3 text-right">Jumlah</th>
                    <th class="p-3 text-right">Nilai Total</th>
                  </tr>
                </thead>
                <tbody id="tableDashboardLatest" class="divide-y divide-slate-100">
                  <tr><td colspan="6" class="p-4 text-center text-slate-400">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- TAB 2: DATA BARANG -->
        <section id="tab-barang" class="tab-content hidden space-y-4">
          <!-- Filter & Search Bar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div class="w-full md:w-1/3">
              <input type="text" id="searchBarang" oninput="filterDataBarang()" placeholder="🔍 Cari nama barang, kode, atau merk..." class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500">
            </div>
            <div class="flex flex-wrap gap-2 w-full md:w-auto">
              <select id="filterRuangan" onchange="filterDataBarang()" class="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500">
                <option value="">Semua Ruangan</option>
              </select>
              <select id="filterKondisi" onchange="filterDataBarang()" class="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500">
                <option value="">Semua Kondisi</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
              <button onclick="exportToCSV()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <span>📥</span><span>Export CSV</span>
              </button>
            </div>
          </div>

          <!-- Tabel Barang -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th class="p-3.5">Kode Barang</th>
                    <th class="p-3.5">Nama & Merk</th>
                    <th class="p-3.5">Kategori</th>
                    <th class="p-3.5">Ruangan</th>
                    <th class="p-3.5">Kondisi</th>
                    <th class="p-3.5 text-right">Jumlah</th>
                    <th class="p-3.5 text-right">Total Nilai</th>
                    <th class="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody id="tableBarangBody" class="divide-y divide-slate-100">
                  <tr><td colspan="8" class="p-6 text-center text-slate-400">Memuat data barang...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- TAB 3: LABEL BARCODE & QR -->
        <section id="tab-barcode" class="tab-content hidden space-y-4">
          <div class="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Cetak Label Barcode & QR Code Standar Kemendikbud</h3>
              <p class="text-xs text-slate-500">Pilih ruangan untuk mencetak seluruh stiker label inventaris secara massal</p>
            </div>
            <div class="flex items-center gap-2">
              <select id="selectRuanganBarcode" onchange="renderBarcodeLabels()" class="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="">Semua Ruangan</option>
              </select>
              <button onclick="window.print()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span>🖨️</span><span>Cetak Lembar Stiker A4</span>
              </button>
            </div>
          </div>

          <!-- Container Grid Stiker Label -->
          <div id="barcodeContainer" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <!-- Label cards generated by JS -->
          </div>
        </section>

        <!-- TAB 4: KARTU INVENTARIS RUANGAN (KIR) -->
        <section id="tab-kir" class="tab-content hidden space-y-4">
          <div class="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Format Resmi Kartu Inventaris Ruangan (KIR)</h3>
              <p class="text-xs text-slate-500">Format dokumen resmi siap cetak dan tanda tangan Kepala Sekolah & PJ Ruangan</p>
            </div>
            <div class="flex items-center gap-2">
              <select id="selectRuanganKIR" onchange="renderDokumenKIR()" class="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700">
                <!-- Ruangan options -->
              </select>
              <button onclick="window.print()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span>🖨️</span><span>Cetak Dokumen KIR (A4)</span>
              </button>
            </div>
          </div>

          <!-- Preview Lembar Dokumen KIR Resmi -->
          <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-slate-900 kir-document space-y-6">
            <!-- Kop Dokumen -->
            <div class="text-center border-b-2 border-slate-900 pb-3">
              <h2 class="text-lg font-extrabold uppercase tracking-wide" id="kirNamaSekolah">SMK AL-HIKAM SENDANG AGUNG</h2>
              <h3 class="text-sm font-bold uppercase tracking-wider text-slate-700">KARTU INVENTARIS RUANGAN (KIR)</h3>
              <p class="text-xs text-slate-600 mt-1" id="kirAlamatSekolah">Jl. Ponpes Al-Hikam, Sendang Agung - NPSN: 69900123</p>
            </div>

            <!-- Identitas Ruangan -->
            <div class="grid grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <p><b>RUANGAN:</b> <span id="kirNamaRuangan">-</span></p>
                <p><b>KODE RUANGAN:</b> <span id="kirKodeRuangan">-</span></p>
                <p><b>GEDUNG / LOKASI:</b> <span id="kirGedungRuangan">-</span></p>
              </div>
              <div class="text-right">
                <p><b>PENANGGUNG JAWAB:</b> <span id="kirPjRuangan">-</span></p>
                <p><b>NIP:</b> <span id="kirNipPjRuangan">-</span></p>
                <p><b>TAHUN AJARAN:</b> <span id="kirTahunAjaran">2026/2027</span></p>
              </div>
            </div>

            <!-- Tabel Barang Ruangan -->
            <table class="w-full text-xs text-left border-collapse border border-slate-800">
              <thead class="bg-slate-100 text-center font-bold">
                <tr>
                  <th class="border border-slate-800 p-2 w-10">No</th>
                  <th class="border border-slate-800 p-2">Kode Barang</th>
                  <th class="border border-slate-800 p-2">Nama Barang & Merk</th>
                  <th class="border border-slate-800 p-2">Tahun</th>
                  <th class="border border-slate-800 p-2 w-16">Jumlah</th>
                  <th class="border border-slate-800 p-2 w-20">Kondisi</th>
                  <th class="border border-slate-800 p-2">Sumber Dana</th>
                </tr>
              </thead>
              <tbody id="tableKirBody">
                <!-- Baris barang KIR -->
              </tbody>
            </table>

            <!-- Kolom Tanda Tangan -->
            <div class="grid grid-cols-2 text-center text-xs pt-8">
              <div>
                <p>Mengetahui,</p>
                <p class="font-bold">Kepala Sekolah</p>
                <div class="h-16"></div>
                <p class="font-bold underline" id="kirTtdKepsek">Dr. H. Ahmad Fauzi, M.Pd.</p>
                <p id="kirTtdNipKepsek">NIP. 19750815 199903 1 002</p>
              </div>
              <div>
                <p id="kirTglTtd">Bandung, 10 Oktober 2026</p>
                <p class="font-bold">Penanggung Jawab Ruangan</p>
                <div class="h-16"></div>
                <p class="font-bold underline" id="kirTtdPj">Budi Santoso, S.Kom.</p>
                <p id="kirTtdNipPj">NIP. 19870514 201101 1 004</p>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 5: KATEGORI & RUANGAN -->
        <section id="tab-ruangan" class="tab-content hidden space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Daftar Kategori -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 class="text-sm font-bold text-slate-900">Daftar Kategori Inventaris</h3>
              <div id="listKategori" class="space-y-2"></div>
            </div>

            <!-- Daftar Ruangan -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 class="text-sm font-bold text-slate-900">Daftar Ruangan & Lokasi</h3>
              <div id="listRuangan" class="space-y-2"></div>
            </div>
          </div>
        </section>

        <!-- TAB 6: PENGATURAN -->
        <section id="tab-pengaturan" class="tab-content hidden space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-2xl">
            <h3 class="text-sm font-bold text-slate-900">Profil Identitas Sekolah</h3>
            <p class="text-xs text-slate-500">Data ini akan dicetak pada kop Kartu Inventaris Ruangan (KIR) dan dokumen berita acara sarpras</p>
            
            <form id="formPengaturan" onsubmit="handleSavePengaturan(event)" class="space-y-3 text-xs">
              <div>
                <label class="font-bold text-slate-700 block mb-1">Nama Sekolah</label>
                <input type="text" id="setNamaSekolah" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-slate-700 block mb-1">NPSN</label>
                  <input type="text" id="setNpsn" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
                <div>
                  <label class="font-bold text-slate-700 block mb-1">Telepon / Kontak</label>
                  <input type="text" id="setKontak" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
              </div>
              <div>
                <label class="font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
                <input type="text" id="setAlamat" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-slate-700 block mb-1">Kepala Sekolah</label>
                  <input type="text" id="setKepsek" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
                <div>
                  <label class="font-bold text-slate-700 block mb-1">NIP Kepala Sekolah</label>
                  <input type="text" id="setNipKepsek" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-slate-700 block mb-1">Wakil Kepala Urusan Sarpras</label>
                  <input type="text" id="setWaka" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
                <div>
                  <label class="font-bold text-slate-700 block mb-1">NIP Waka Sarpras</label>
                  <input type="text" id="setNipWaka" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                </div>
              </div>
              <div class="pt-3">
                <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs">
                  Simpan Profil Sekolah
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </main>
  </div>

  <!-- MODAL TAMBAH / EDIT BARANG -->
  <div id="modalBarang" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
      <div class="bg-indigo-600 text-white p-4 flex items-center justify-between">
        <h3 id="modalBarangTitle" class="font-bold text-sm">Tambah Data Barang</h3>
        <button onclick="tutupModalBarang()" class="text-white hover:bg-white/20 p-1 rounded-lg">✕</button>
      </div>
      <form id="formBarang" onsubmit="handleSaveBarang(event)" class="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
        <input type="hidden" id="barangId">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Kode Barang</label>
            <input type="text" id="inputKodeBarang" placeholder="Contoh: INV-KOMP-001" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Nama Barang</label>
            <input type="text" id="inputNamaBarang" placeholder="Nama barang" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Kategori</label>
            <select id="inputKategori" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"></select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Ruangan / Lokasi</label>
            <select id="inputRuangan" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"></select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Merk / Tipe</label>
            <input type="text" id="inputMerk" placeholder="Merk atau tipe" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Nomor Seri (Opsional)</label>
            <input type="text" id="inputNomorSeri" placeholder="S/N pabrik" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Kondisi</label>
            <select id="inputKondisi" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Jumlah</label>
            <input type="number" id="inputJumlah" min="1" value="1" required class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Satuan</label>
            <input type="text" id="inputSatuan" value="Unit" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Harga Satuan (Rp)</label>
            <input type="number" id="inputHarga" min="0" value="0" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          </div>
          <div>
            <label class="font-bold text-slate-700 block mb-1">Sumber Dana</label>
            <select id="inputSumberDana" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="BOS Reguler">BOS Reguler</option>
              <option value="BOS Kinerja">BOS Kinerja</option>
              <option value="DAK Fisik">DAK Fisik</option>
              <option value="Hibah / Sumbangan">Hibah / Sumbangan</option>
            </select>
          </div>
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">Keterangan / Spesifikasi</label>
          <textarea id="inputKeterangan" rows="2" placeholder="Catatan tambahan..." class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
        </div>

        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onclick="tutupModalBarang()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold">Batal</button>
          <button type="submit" id="btnSubmitBarang" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs">Simpan ke Spreadsheet</button>
        </div>
      </form>
    </div>
  </div>

  <?!= include('JavaScript'); ?>
</body>
</html>
`;

/**
 * FILE 3: Stylesheet.html (Styling Tailwind + Aturan Khusus Cetak A4 & Stiker)
 */
export const STYLESHEET_HTML_SCRIPT = `<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }

  /* KARTU STIKER BARCODE */
  .label-card {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 10px 14px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* MEDIA QUERY PRINT */
  @media print {
    body {
      background: #ffffff !important;
      color: #000000 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .no-print, aside, header, nav, button, #toast, .tab-content:not(.active-print) {
      display: none !important;
    }

    main {
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }

    /* Cetak Lembar Stiker Barcode */
    #tab-barcode.active-print {
      display: block !important;
    }

    #barcodeContainer {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 8px !important;
      padding: 10mm 5mm !important;
    }

    .label-card {
      border: 1px solid #000000 !important;
      box-shadow: none !important;
      padding: 8px !important;
    }

    /* Cetak Kartu Inventaris Ruangan (KIR) */
    #tab-kir.active-print {
      display: block !important;
    }

    .kir-document {
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      width: 100% !important;
    }

    table {
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
  }
</style>
`;

/**
 * FILE 4: JavaScript.html (Logika Frontend, Barcode/QR Engine, & google.script.run)
 */
export const JAVASCRIPT_HTML_SCRIPT = `<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>

<script>
  // State Global Aplikasi
  let appData = {
    barang: [],
    kategori: [],
    ruangan: [],
    pengaturan: {},
    logs: []
  };

  let activeTabName = 'dashboard';

  // Inisialisasi saat halaman dimuat
  window.addEventListener('DOMContentLoaded', () => {
    loadAllData();
  });

  /**
   * Mengambil data dari backend Google Apps Script via google.script.run
   */
  function loadAllData() {
    showToast('🔄', 'Menyinkronkan data dari Google Spreadsheet...');
    
    // Periksa apakah berjalan di Google Apps Script environment
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(onDataLoaded)
        .withFailureHandler(onDataError)
        .getInitialData();
    } else {
      // Fallback demo data jika diuji di luar Apps Script
      setTimeout(() => {
        onDataLoaded({
          barang: [
            { id: 'BRG-01', kodeBarang: 'INV-KOMP-LAB-001', namaBarang: 'PC All-in-One Core i5 16GB', idKategori: 'KAT-01', kategoriNama: 'Elektronik & TIK', idRuangan: 'RNG-01', ruanganNama: 'Lab Komputer 1', merk: 'Lenovo', kondisi: 'Baik', jumlah: 20, satuan: 'Unit', totalNilai: 190000000, sumberDana: 'DAK Fisik' },
            { id: 'BRG-02', kodeBarang: 'INV-KOMP-LAB-002', namaBarang: 'Proyektor Laser Full HD', idKategori: 'KAT-01', kategoriNama: 'Elektronik & TIK', idRuangan: 'RNG-01', ruanganNama: 'Lab Komputer 1', merk: 'Epson', kondisi: 'Baik', jumlah: 1, satuan: 'Unit', totalNilai: 14500000, sumberDana: 'BOS Kinerja' },
            { id: 'BRG-03', kodeBarang: 'INV-MEBEL-RNG-001', namaBarang: 'Meja Komputer Siswa', idKategori: 'KAT-02', kategoriNama: 'Mebel & Perabot', idRuangan: 'RNG-01', ruanganNama: 'Lab Komputer 1', merk: 'Informa', kondisi: 'Baik', jumlah: 20, satuan: 'Unit', totalNilai: 17000000, sumberDana: 'BOS Reguler' }
          ],
          kategori: [
            { id: 'KAT-01', kodeKategori: 'KOMP', namaKategori: 'Elektronik & TIK', warna: '#3B82F6' },
            { id: 'KAT-02', kodeKategori: 'MEBEL', namaKategori: 'Mebel & Perabot', warna: '#8B5CF6' }
          ],
          ruangan: [
            { id: 'RNG-01', kodeRuangan: 'LAB-KOMP', namaRuangan: 'Lab Komputer 1', gedung: 'Gedung B', penanggungJawab: 'Budi Santoso, S.Kom.', nipPenanggungJawab: '19870514 201101 1 004' }
          ],
          pengaturan: {
            namaSekolah: 'SMK AL-HIKAM SENDANG AGUNG',
            npsn: '69900123',
            alamat: 'Jl. Ponpes Al-Hikam, Sendang Agung',
            kepalaSekolah: 'Kepala Sekolah SMK Al-Hikam',
            nipKepalaSekolah: '-'
          }
        });
      }, 500);
    }
  }

  function onDataLoaded(data) {
    if (!data) return;
    appData = data;
    renderAll();
    showToast('✅', 'Data Google Spreadsheet berhasil dimuat!');
  }

  function onDataError(err) {
    showToast('⚠️', 'Gagal memuat data: ' + err);
  }

  /**
   * Render seluruh tampilan
   */
  function renderAll() {
    renderSidebarProfile();
    renderDashboard();
    renderTableBarang(appData.barang);
    populateSelectOptions();
    renderKategoriList();
    renderRuanganList();
    populatePengaturanForm();
    if (activeTabName === 'barcode') renderBarcodeLabels();
    if (activeTabName === 'kir') renderDokumenKIR();
  }

  function renderSidebarProfile() {
    const p = appData.pengaturan || {};
    if (p.namaSekolah) document.getElementById('sidebarSchoolName').innerText = p.namaSekolah;
    if (p.npsn) document.getElementById('sidebarNpsn').innerText = 'NPSN ' + p.npsn;
  }

  /**
   * Ganti Tab Navigasi
   */
  function switchTab(tabId) {
    activeTabName = tabId;
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.add('hidden');
      el.classList.remove('active-print');
    });
    const target = document.getElementById('tab-' + tabId);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active-print');
    }

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white');
      btn.classList.add('text-slate-300');
    });
    const activeBtn = document.getElementById('nav-' + tabId);
    if (activeBtn) {
      activeBtn.classList.add('bg-indigo-600', 'text-white');
      activeBtn.classList.remove('text-slate-300');
    }

    const titles = {
      dashboard: 'Dashboard Sarpras',
      barang: 'Data Barang & Aset Sekolah',
      barcode: 'Cetak Label Barcode & QR Code',
      kir: 'Kartu Inventaris Ruangan (KIR)',
      ruangan: 'Manajemen Kategori & Ruangan',
      pengaturan: 'Profil Identitas Sekolah'
    };
    document.getElementById('pageTitle').innerText = titles[tabId] || 'Inventaris Sekolah';

    if (tabId === 'barcode') renderBarcodeLabels();
    if (tabId === 'kir') renderDokumenKIR();
  }

  /**
   * Render Dashboard Statistics
   */
  function renderDashboard() {
    const items = appData.barang || [];
    let totalQty = 0;
    let totalNilai = 0;
    let baik = 0, rusakRingan = 0, rusakBerat = 0;

    items.forEach(item => {
      const q = Number(item.jumlah) || 1;
      totalQty += q;
      totalNilai += Number(item.totalNilai) || (q * (Number(item.hargaSatuan) || 0));

      if (item.kondisi === 'Baik') baik += q;
      else if (item.kondisi === 'Rusak Ringan') rusakRingan += q;
      else if (item.kondisi === 'Rusak Berat') rusakBerat += q;
    });

    document.getElementById('statTotalJenis').innerText = items.length;
    document.getElementById('statTotalItem').innerText = totalQty.toLocaleString('id-ID') + ' Unit Fisik';
    document.getElementById('statTotalNilai').innerText = 'Rp ' + totalNilai.toLocaleString('id-ID');
    document.getElementById('statBaik').innerText = baik.toLocaleString('id-ID');
    document.getElementById('statBaikPct').innerText = totalQty > 0 ? Math.round((baik / totalQty) * 100) + '% Siap Pakai' : '0%';
    document.getElementById('statRusak').innerText = (rusakRingan + rusakBerat).toLocaleString('id-ID');
    document.getElementById('statRusakRingan').innerText = rusakRingan + ' Rusak Ringan / ' + rusakBerat + ' Rusak Berat';

    // Tabel Dashboard Terbaru
    const latest = items.slice(-5).reverse();
    const tb = document.getElementById('tableDashboardLatest');
    if (!latest.length) {
      tb.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Belum ada barang tercatat.</td></tr>';
      return;
    }
    tb.innerHTML = latest.map(i => \`
      <tr class="hover:bg-slate-50">
        <td class="p-3 font-mono font-bold text-indigo-600">\${i.kodeBarang || '-'}</td>
        <td class="p-3 font-semibold text-slate-900">\${i.namaBarang}</td>
        <td class="p-3 text-slate-600">\${i.ruanganNama || '-'}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${getKondisiBadge(i.kondisi)}">\${i.kondisi}</span></td>
        <td class="p-3 text-right font-bold">\${i.jumlah} \${i.satuan || 'Unit'}</td>
        <td class="p-3 text-right font-bold text-slate-900">Rp \${Number(i.totalNilai || 0).toLocaleString('id-ID')}</td>
      </tr>
    \`).join('');
  }

  function getKondisiBadge(kondisi) {
    if (kondisi === 'Baik') return 'bg-emerald-100 text-emerald-800';
    if (kondisi === 'Rusak Ringan') return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  }

  /**
   * Render Tabel Barang
   */
  function renderTableBarang(items) {
    const tbody = document.getElementById('tableBarangBody');
    if (!items || !items.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-slate-400">Tidak ada barang yang sesuai filter.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(i => \`
      <tr class="hover:bg-slate-50">
        <td class="p-3.5 font-mono font-bold text-indigo-600">\${i.kodeBarang || '-'}</td>
        <td class="p-3.5 font-semibold text-slate-900">
          <div>\${i.namaBarang}</div>
          <div class="text-[10px] text-slate-400">\${i.merk || '-'} \${i.nomorSeri && i.nomorSeri !== '-' ? '• S/N: ' + i.nomorSeri : ''}</div>
        </td>
        <td class="p-3.5"><span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700">\${i.kategoriNama || '-'}</span></td>
        <td class="p-3.5 text-slate-600">\${i.ruanganNama || '-'}</td>
        <td class="p-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${getKondisiBadge(i.kondisi)}">\${i.kondisi}</span></td>
        <td class="p-3.5 text-right font-bold">\${i.jumlah} \${i.satuan || 'Unit'}</td>
        <td class="p-3.5 text-right font-bold text-slate-900">Rp \${Number(i.totalNilai || 0).toLocaleString('id-ID')}</td>
        <td class="p-3.5 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button onclick="editBarang('\${i.id}')" class="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700" title="Edit">✏️</button>
            <button onclick="deleteBarang('\${i.id}')" class="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600" title="Hapus">🗑️</button>
          </div>
        </td>
      </tr>
    \`).join('');
  }

  function filterDataBarang() {
    const q = document.getElementById('searchBarang').value.toLowerCase();
    const ruang = document.getElementById('filterRuangan').value;
    const kondisi = document.getElementById('filterKondisi').value;

    const filtered = (appData.barang || []).filter(item => {
      const matchQ = !q || (item.namaBarang && item.namaBarang.toLowerCase().includes(q)) ||
        (item.kodeBarang && item.kodeBarang.toLowerCase().includes(q)) ||
        (item.merk && item.merk.toLowerCase().includes(q));
      const matchR = !ruang || item.idRuangan === ruang;
      const matchK = !kondisi || item.kondisi === kondisi;
      return matchQ && matchR && matchK;
    });

    renderTableBarang(filtered);
  }

  /**
   * Populate Dropdown Options
   */
  function populateSelectOptions() {
    const fRuang = document.getElementById('filterRuangan');
    const sRuangBar = document.getElementById('selectRuanganBarcode');
    const sRuangKir = document.getElementById('selectRuanganKIR');
    const inRuang = document.getElementById('inputRuangan');
    const inKat = document.getElementById('inputKategori');

    const rHtml = '<option value="">Semua Ruangan</option>' + (appData.ruangan || []).map(r => \`<option value="\${r.id}">\${r.namaRuangan}</option>\`).join('');
    fRuang.innerHTML = rHtml;
    sRuangBar.innerHTML = rHtml;
    sRuangKir.innerHTML = (appData.ruangan || []).map(r => \`<option value="\${r.id}">\${r.namaRuangan}</option>\`).join('');
    inRuang.innerHTML = (appData.ruangan || []).map(r => \`<option value="\${r.id}">\${r.namaRuangan}</option>\`).join('');
    inKat.innerHTML = (appData.kategori || []).map(k => \`<option value="\${k.id}">\${k.namaKategori}</option>\`).join('');
  }

  /**
   * Render Label Barcode & QR Code
   */
  function renderBarcodeLabels() {
    const selectedRuangan = document.getElementById('selectRuanganBarcode').value;
    const container = document.getElementById('barcodeContainer');
    const items = (appData.barang || []).filter(i => !selectedRuangan || i.idRuangan === selectedRuangan);

    if (!items.length) {
      container.innerHTML = '<div class="col-span-3 p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Tidak ada barang untuk dicetak di ruangan ini.</div>';
      return;
    }

    container.innerHTML = items.map((i, idx) => \`
      <div class="label-card shadow-xs">
        <div class="text-[10px] font-extrabold uppercase text-indigo-700 tracking-wider mb-1">\${appData.pengaturan.namaSekolah || 'INVENTARIS SEKOLAH'}</div>
        <div class="text-xs font-bold text-slate-900 truncate w-full">\${i.namaBarang}</div>
        <div class="text-[10px] text-slate-500 mb-1">\${i.ruanganNama || '-'} • Thn \${i.tahunPengadaan || '-'}</div>
        <svg id="barcode-\${idx}" class="my-1 max-w-full"></svg>
        <div class="flex items-center gap-2 mt-1">
          <canvas id="qr-\${idx}" class="w-12 h-12"></canvas>
          <div class="text-left">
            <span class="font-mono text-[10px] font-bold block text-slate-800">\${i.kodeBarang}</span>
            <span class="text-[9px] text-slate-500 block">Kondisi: \${i.kondisi}</span>
          </div>
        </div>
      </div>
    \`).join('');

    // Generate Barcode & QR Code via Canvas
    setTimeout(() => {
      items.forEach((i, idx) => {
        try {
          JsBarcode('#barcode-' + idx, i.kodeBarang || 'INV-000', {
            format: 'CODE128',
            width: 1.2,
            height: 28,
            displayValue: false,
            margin: 0
          });
        } catch (e) {}

        const qrCanvas = document.getElementById('qr-' + idx);
        if (qrCanvas) {
          QRCode.toCanvas(qrCanvas, i.kodeBarang || '', { width: 50, margin: 0 });
        }
      });
    }, 50);
  }

  /**
   * Render Kartu Inventaris Ruangan (KIR)
   */
  function renderDokumenKIR() {
    const rId = document.getElementById('selectRuanganKIR').value;
    const room = (appData.ruangan || []).find(r => r.id === rId) || (appData.ruangan || [])[0] || {};
    const items = (appData.barang || []).filter(i => i.idRuangan === room.id);
    const p = appData.pengaturan || {};

    document.getElementById('kirNamaSekolah').innerText = (p.namaSekolah || 'SEKOLAH').toUpperCase();
    document.getElementById('kirAlamatSekolah').innerText = (p.alamat || '') + ' - NPSN: ' + (p.npsn || '-');
    document.getElementById('kirNamaRuangan').innerText = room.namaRuangan || '-';
    document.getElementById('kirKodeRuangan').innerText = room.kodeRuangan || '-';
    document.getElementById('kirGedungRuangan').innerText = room.gedung || '-';
    document.getElementById('kirPjRuangan').innerText = room.penanggungJawab || '-';
    document.getElementById('kirNipPjRuangan').innerText = room.nipPenanggungJawab || '-';

    document.getElementById('kirTtdKepsek').innerText = p.kepalaSekolah || '-';
    document.getElementById('kirTtdNipKepsek').innerText = 'NIP. ' + (p.nipKepalaSekolah || '-');
    document.getElementById('kirTtdPj').innerText = room.penanggungJawab || '-';
    document.getElementById('kirTtdNipPj').innerText = 'NIP. ' + (room.nipPenanggungJawab || '-');

    const today = new Date();
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    document.getElementById('kirTglTtd').innerText = 'Ditetapkan pada: ' + today.getDate() + ' ' + months[today.getMonth()] + ' ' + today.getFullYear();

    const tb = document.getElementById('tableKirBody');
    if (!items.length) {
      tb.innerHTML = '<tr><td colspan="7" class="border border-slate-800 p-4 text-center text-slate-400">Belum ada barang tercatat di ruangan ini.</td></tr>';
      return;
    }

    tb.innerHTML = items.map((i, idx) => \`
      <tr>
        <td class="border border-slate-800 p-2 text-center">\${idx + 1}</td>
        <td class="border border-slate-800 p-2 font-mono font-bold">\${i.kodeBarang}</td>
        <td class="border border-slate-800 p-2 font-semibold">\${i.namaBarang} \${i.merk ? '(' + i.merk + ')' : ''}</td>
        <td class="border border-slate-800 p-2 text-center">\${i.tahunPengadaan || '-'}</td>
        <td class="border border-slate-800 p-2 text-center font-bold">\${i.jumlah} \${i.satuan || 'Unit'}</td>
        <td class="border border-slate-800 p-2 text-center">\${i.kondisi}</td>
        <td class="border border-slate-800 p-2 text-center">\${i.sumberDana || 'BOS'}</td>
      </tr>
    \`).join('');
  }

  /**
   * Modal Tambah & Edit Barang
   */
  function bukaModalBarang(item = null) {
    document.getElementById('formBarang').reset();
    document.getElementById('barangId').value = '';
    document.getElementById('modalBarangTitle').innerText = 'Tambah Data Barang Baru';
    
    if (item) {
      document.getElementById('modalBarangTitle').innerText = 'Edit Data Barang';
      document.getElementById('barangId').value = item.id;
      document.getElementById('inputKodeBarang').value = item.kodeBarang || '';
      document.getElementById('inputNamaBarang').value = item.namaBarang || '';
      document.getElementById('inputKategori').value = item.idKategori || '';
      document.getElementById('inputRuangan').value = item.idRuangan || '';
      document.getElementById('inputMerk').value = item.merk || '';
      document.getElementById('inputNomorSeri').value = item.nomorSeri || '';
      document.getElementById('inputKondisi').value = item.kondisi || 'Baik';
      document.getElementById('inputJumlah').value = item.jumlah || 1;
      document.getElementById('inputSatuan').value = item.satuan || 'Unit';
      document.getElementById('inputHarga').value = item.hargaSatuan || 0;
      document.getElementById('inputSumberDana').value = item.sumberDana || 'BOS Reguler';
      document.getElementById('inputKeterangan').value = item.keterangan || '';
    }
    
    document.getElementById('modalBarang').classList.remove('hidden');
  }

  function tutupModalBarang() {
    document.getElementById('modalBarang').classList.add('hidden');
  }

  function handleSaveBarang(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitBarang');
    btn.disabled = true;
    btn.innerText = 'Menyimpan ke Google Sheets...';

    const katSelect = document.getElementById('inputKategori');
    const ruangSelect = document.getElementById('inputRuangan');
    const id = document.getElementById('barangId').value;
    const qty = Number(document.getElementById('inputJumlah').value) || 1;
    const harga = Number(document.getElementById('inputHarga').value) || 0;

    const payload = {
      id: id || ('BRG-' + Date.now()),
      kodeBarang: document.getElementById('inputKodeBarang').value,
      namaBarang: document.getElementById('inputNamaBarang').value,
      idKategori: katSelect.value,
      kategoriNama: katSelect.options[katSelect.selectedIndex] ? katSelect.options[katSelect.selectedIndex].text : '',
      idRuangan: ruangSelect.value,
      ruanganNama: ruangSelect.options[ruangSelect.selectedIndex] ? ruangSelect.options[ruangSelect.selectedIndex].text : '',
      merk: document.getElementById('inputMerk').value,
      nomorSeri: document.getElementById('inputNomorSeri').value,
      kondisi: document.getElementById('inputKondisi').value,
      jumlah: qty,
      satuan: document.getElementById('inputSatuan').value,
      hargaSatuan: harga,
      totalNilai: qty * harga,
      sumberDana: document.getElementById('inputSumberDana').value,
      keterangan: document.getElementById('inputKeterangan').value,
      penanggungJawab: 'Staf Sarpras',
      tahunPengadaan: new Date().getFullYear(),
      tanggalInput: new Date().toISOString().slice(0, 10)
    };

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(res => {
          btn.disabled = false;
          btn.innerText = 'Simpan ke Spreadsheet';
          tutupModalBarang();
          showToast('✅', 'Barang berhasil disimpan ke Google Sheets!');
          loadAllData();
        })
        .withFailureHandler(err => {
          btn.disabled = false;
          btn.innerText = 'Simpan ke Spreadsheet';
          showToast('❌', 'Gagal simpan: ' + err);
        })
        .simpanBarang(payload);
    } else {
      // Offline fallback simulator
      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = 'Simpan ke Spreadsheet';
        tutupModalBarang();
        const existingIdx = appData.barang.findIndex(b => b.id === payload.id);
        if (existingIdx >= 0) appData.barang[existingIdx] = payload;
        else appData.barang.push(payload);
        renderAll();
        showToast('✅', 'Data tersimpan!');
      }, 300);
    }
  }

  function editBarang(id) {
    const item = (appData.barang || []).find(b => b.id === id);
    if (item) bukaModalBarang(item);
  }

  function deleteBarang(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data barang ini dari Google Spreadsheet?')) return;
    showToast('⏳', 'Menghapus barang...');

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(res => {
          showToast('🗑️', 'Barang berhasil dihapus dari Google Sheets.');
          loadAllData();
        })
        .withFailureHandler(err => {
          showToast('❌', 'Gagal menghapus: ' + err);
        })
        .hapusBarang(id);
    } else {
      appData.barang = appData.barang.filter(b => b.id !== id);
      renderAll();
      showToast('🗑️', 'Barang dihapus.');
    }
  }

  /**
   * Render List Kategori & Ruangan
   */
  function renderKategoriList() {
    const c = document.getElementById('listKategori');
    c.innerHTML = (appData.kategori || []).map(k => \`
      <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full" style="background:\${k.warna || '#4F46E5'}"></span>
          <div>
            <span class="font-bold text-slate-800 block">\${k.namaKategori}</span>
            <span class="font-mono text-[10px] text-slate-500">Kode: \${k.kodeKategori}</span>
          </div>
        </div>
      </div>
    \`).join('');
  }

  function renderRuanganList() {
    const c = document.getElementById('listRuangan');
    c.innerHTML = (appData.ruangan || []).map(r => \`
      <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <span class="font-bold text-slate-800 block">\${r.namaRuangan}</span>
          <span class="text-[11px] text-slate-500">\${r.gedung || '-'} • PJ: \${r.penanggungJawab || '-'}</span>
        </div>
        <span class="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">\${r.kodeRuangan}</span>
      </div>
    \`).join('');
  }

  /**
   * Profil Pengaturan
   */
  function populatePengaturanForm() {
    const p = appData.pengaturan || {};
    if (p.namaSekolah) document.getElementById('setNamaSekolah').value = p.namaSekolah;
    if (p.npsn) document.getElementById('setNpsn').value = p.npsn;
    if (p.kontakSekolah) document.getElementById('setKontak').value = p.kontakSekolah;
    if (p.alamat) document.getElementById('setAlamat').value = p.alamat;
    if (p.kepalaSekolah) document.getElementById('setKepsek').value = p.kepalaSekolah;
    if (p.nipKepalaSekolah) document.getElementById('setNipKepsek').value = p.nipKepalaSekolah;
    if (p.wakaSarpras) document.getElementById('setWaka').value = p.wakaSarpras;
    if (p.nipWakaSarpras) document.getElementById('setNipWaka').value = p.nipWakaSarpras;
  }

  function handleSavePengaturan(e) {
    e.preventDefault();
    const payload = {
      namaSekolah: document.getElementById('setNamaSekolah').value,
      npsn: document.getElementById('setNpsn').value,
      kontakSekolah: document.getElementById('setKontak').value,
      alamat: document.getElementById('setAlamat').value,
      kepalaSekolah: document.getElementById('setKepsek').value,
      nipKepalaSekolah: document.getElementById('setNipKepsek').value,
      wakaSarpras: document.getElementById('setWaka').value,
      nipWakaSarpras: document.getElementById('setNipWaka').value
    };

    showToast('⏳', 'Menyimpan profil sekolah ke Spreadsheet...');

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(res => {
          showToast('✅', 'Profil sekolah berhasil disimpan!');
          appData.pengaturan = payload;
          renderSidebarProfile();
        })
        .withFailureHandler(err => {
          showToast('❌', 'Gagal simpan: ' + err);
        })
        .simpanPengaturan(payload);
    } else {
      appData.pengaturan = payload;
      renderSidebarProfile();
      showToast('✅', 'Profil sekolah diperbarui.');
    }
  }

  /**
   * Export to CSV
   */
  function exportToCSV() {
    const items = appData.barang || [];
    if (!items.length) {
      alert('Tidak ada data barang untuk diekspor.');
      return;
    }
    const headers = ['Kode Barang', 'Nama Barang', 'Kategori', 'Ruangan', 'Merk', 'Kondisi', 'Jumlah', 'Satuan', 'Harga Satuan', 'Total Nilai', 'Sumber Dana'];
    const rows = items.map(i => [
      i.kodeBarang,
      i.namaBarang,
      i.kategoriNama,
      i.ruanganNama,
      i.merk,
      i.kondisi,
      i.jumlah,
      i.satuan,
      i.hargaSatuan,
      i.totalNilai,
      i.sumberDana
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(f => '"' + (f || '') + '"').join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Inventaris_Sekolah_' + new Date().toISOString().slice(0, 10) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Toast Helper
   */
  let toastTimer;
  function showToast(icon, msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastIcon').innerText = icon;
    document.getElementById('toastMsg').innerText = msg;
    t.classList.remove('translate-y-[-150%]', 'opacity-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.add('translate-y-[-150%]', 'opacity-0');
    }, 3000);
  }
</script>
`;
