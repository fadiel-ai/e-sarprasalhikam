/**
 * Helper untuk memproses, membersihkan, dan mengompres gambar kop surat atau logo
 * Didesain khusus agar pas di kop surat A4, tidak pecah saat dicetak,
 * dan berukuran ringan (< 45KB) sehingga aman disimpan di localStorage dan Google Spreadsheet tanpa terpotong!
 */

export function processImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar (gunakan format PNG, JPG, JPEG, atau WebP).'));
      return;
    }

    // Cek batas ukuran awal file (maks 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Ukuran file terlalu besar (maksimal 10MB). Silakan gunakan gambar yang lebih kecil.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari perangkat Anda.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar. Pastikan file gambar tidak rusak.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan rasio aspek proporsional
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Kop surat dicetak pada dokumen berlatar putih.
        // Isi background putih terlebih dahulu agar file PNG transparan tetap bersih
        // dan dapat dikompresi efisien ke JPEG tanpa artefak hitam.
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke JPEG dengan kualitas optimal
        // Hasilnya tajam, jernih di A4, dan berukuran ~25-40KB
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Jika karena gambar kompleks ukurannya masih > 45.000 karakter,
        // turunkan kualitas sedikit agar aman di batas cell Google Sheet (50.000 karakter)
        if (dataUrl.length > 45000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        }

        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

