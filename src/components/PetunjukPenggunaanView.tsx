import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudCheck,
  Copy,
  ExternalLink,
  FileCode2,
  FileSpreadsheet,
  Globe,
  Key,
  Layers,
  Play,
  Printer,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface PetunjukPenggunaanViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const PetunjukPenggunaanView: React.FC<PetunjukPenggunaanViewProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      step: '1',
      title: 'Buat Google Spreadsheet Baru',
      desc: 'Buka Google Drive Anda (drive.google.com), klik tombol "+ Baru" -> "Google Spreadsheet" kosong. Beri nama file, misalnya "Database Inventaris Sarpras Sekolah".',
      badge: 'Google Drive',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      step: '2',
      title: 'Buka Editor Apps Script',
      desc: 'Pada Google Spreadsheet yang baru dibuat, klik menu atas: "Ekstensi" (Extensions) -> lalu pilih "Apps Script". Sebuah tab editor baru akan terbuka.',
      badge: 'Ekstensi',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      step: '3',
      title: 'Salin & Tempel Kode Code.gs',
      desc: 'Hapus semua teks yang ada di file Code.gs bawaan editor Google, lalu salin seluruh kode dari menu "Script Code.gs" di aplikasi ini dan tempelkan (Paste). Jangan lupa klik ikon Simpan (Ctrl+S / Cmd+S).',
      badge: 'Code.gs',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: {
        label: 'Salin Script Code.gs Sekarang',
        onClick: () => onNavigate('codegs'),
      },
    },
    {
      step: '4',
      title: 'Jalankan Fungsi setupDatabase()',
      desc: 'Di bilah alat atas Apps Script editor, pada dropdown pilihan fungsi, pilih "setupDatabase", lalu klik tombol "▷ Jalankan" (Run). Klik "Tinjau Izin" (Review Permissions) -> Pilih Akun Google Anda -> Klik "Lanjutan" (Advanced) -> "Buka (tidak aman)" -> Klik "Izinkan" (Allow). Tunggu beberapa detik sampai muncul notifikasi selesai di spreadsheet!',
      badge: 'Otomatisasi 1-Klik',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      step: '5',
      title: 'Deploy sebagai Web App (Akses: Anyone)',
      desc: 'Klik tombol biru "Deploy" di pojok kanan atas Apps Script -> pilih "New deployment". Klik ikon roda gigi -> pilih "Web app". Atur: Execute as: "Me (email Anda)" dan Who has access: "Anyone (Siapa saja)". Lalu klik tombol "Deploy". Salin "Web app URL" yang muncul.',
      badge: 'Deploy Web App',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      step: '6',
      title: 'Terkoneksi Otomatis (2 Cara Mudah)',
      desc: 'CARA PALING CEPAT: Di Google Sheets Anda, cukup klik menu atas: "🏫 INVENTARIS SEKOLAH" -> pilih "🔗 Buka Web App (Terkoneksi Otomatis)". Aplikasi web ini akan langsung terbuka dan tersambung otomatis! Atau tempelkan URL / Deployment ID di menu Pengaturan lalu klik tombol "⚡ Sambungkan Otomatis".',
      badge: '1-Klik Otomatis',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: {
        label: 'Buka Menu Pengaturan Sekarang',
        onClick: () => onNavigate('pengaturan'),
      },
    },
  ];

  const faqs = [
    {
      q: 'Apakah semua data sheet terbuat otomatis tanpa saya harus membuat tabel manual?',
      a: 'Ya, 100% otomatis! Fungsi setupDatabase() di Code.gs akan membuat 6 lembar kerja (Sheet) sekaligus: Barang, Kategori, Ruangan, Pengguna, Pengaturan, dan LogAktivitas dengan kolom lengkap, warna header resmi, format freeze baris pertama, dan data awal.',
    },
    {
      q: 'Mengapa muncul pesan peringatan Google "Aplikasi Belum Diverifikasi" saat pertama kali menjalankan script?',
      a: 'Ini adalah mekanisme standar Google untuk script pribadi buatan sendiri. Cukup klik tulisan "Lanjutan" (Advanced) di bagian bawah jendela popup, lalu klik "Buka (tidak aman)" dan pilih "Izinkan". Akun Anda aman karena script berjalan di Drive Anda sendiri.',
    },
    {
      q: 'Bagaimana cara mencetak stiker label barcode untuk ditempel pada meja, komputer, atau lemari?',
      a: 'Masuk ke menu "Label Barcode & QR", pilih barang yang ingin dicetak (atau pilih per ruangan misalnya Lab Komputer), atur format ukuran stiker, lalu klik tombol "Cetak Label Sekarang". Format print sudah disesuaikan agar pas dengan kertas stiker A4 standar.',
    },
    {
      q: 'Bagaimana cara membuat Kartu Inventaris Ruangan (KIR)?',
      a: 'Buka menu "Kategori & Ruangan", pilih tab "Ruangan", lalu klik tombol "KIR" pada ruangan yang diinginkan. Anda akan melihat dokumen Kartu Inventaris Ruangan resmi standar Kemendikbudristek lengkap dengan kop sekolah, daftar aset ruangan, dan kolom tanda tangan Kepala Sekolah serta Penanggung Jawab Ruangan siap dicetak.',
    },
    {
      q: 'Apakah aplikasi tetap bisa dipakai jika koneksi internet sedang lambat atau offline?',
      a: 'Bisa! Sistem dilengkapi Mode Offline / Local Storage otomatis. Anda tetap dapat menginput data, mencetak label, dan mengedit sarpras tanpa internet. Saat online kembali, cukup tekan tombol "Sync Sheet" untuk memperbarui Google Spreadsheet Anda.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-700/50 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <BookOpenCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Panduan Penggunaan & Penerbitan Google Apps Script</h2>
            <p className="text-xs text-indigo-200">
              Langkah mudah mengintegrasikan Google Spreadsheet sebagai database inventaris sekolah
            </p>
          </div>
        </div>
      </div>

      {/* Step by Step Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Alur Setup Terpadu (6 Langkah Mudah)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Estimasi waktu: 3-5 menit</span>
        </div>

        <div className="space-y-6">
          {steps.map((item, index) => (
            <div key={item.step} className="flex items-start gap-4 relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-slate-200 -z-0"></div>
              )}

              {/* Step number bubble */}
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs z-10">
                {item.step}
              </div>

              {/* Step content card */}
              <div className="flex-1 bg-slate-50/80 border border-slate-200/80 p-4 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                {item.action && (
                  <div className="pt-1">
                    <button
                      onClick={item.action.onClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
                    >
                      <span>{item.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panduan Publikasi & Akses Bersama */}
      <div className="bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-700/50 shadow-md space-y-4">
        <div className="flex items-center gap-3 border-b border-indigo-800/80 pb-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
            <Globe className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold">Cara Mempublikasikan & Membagikan Aplikasi ke Guru & Staf</h3>
            <p className="text-xs text-indigo-200">
              Aplikasi ini adalah web app multi-device yang dapat diakses dari laptop, tablet, dan smartphone
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Card 1: Link Publik */}
          <div className="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-sm">1. Link Siap Pakai untuk Pengguna</span>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Online 24 Jam
              </span>
            </div>
            <p className="text-indigo-100 text-[11px] leading-relaxed">
              Bagikan link aplikasi ini kepada staf TU, guru, atau penanggung jawab lab:
            </p>
            <div className="p-2 bg-black/40 rounded-lg font-mono text-[11px] text-emerald-300 break-all select-all border border-white/10">
              https://ais-dev-3m5oyezq6fqgghn2ht7tf7-499736201091.asia-southeast1.run.app
            </div>
            <p className="text-[10px] text-indigo-200">
              💡 Link di atas aktif dan dapat langsung dibuka. Untuk mengaktifkan link rilis (pre-release), klik tombol <b>Deploy / Publish</b> di pojok kanan atas AI Studio.
            </p>
          </div>

          {/* Card 2: Pasang di Layar Utama HP (Shortcut) */}
          <div className="bg-white/10 border border-white/15 rounded-xl p-4 space-y-2">
            <span className="font-bold text-amber-300 text-sm block">2. Pasang di HP (Seperti Aplikasi Android/iOS)</span>
            <p className="text-indigo-100 text-[11px] leading-relaxed">
              Untuk memudahkan staf sarpras saat berkeliling mengecek barang dengan barcode:
            </p>
            <ul className="text-[11px] text-indigo-200 space-y-1 list-disc list-inside">
              <li>Buka link aplikasi di browser Chrome pada smartphone.</li>
              <li>Ketuk ikon titik tiga (⋮) di pojok kanan atas browser.</li>
              <li>Pilih <b>"Tambahkan ke Layar Utama" (Add to Home screen)</b>.</li>
              <li>Ikon inventaris sekolah akan muncul di menu HP seperti aplikasi asli!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Spreadsheet Structure Visualizer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Struktur Sheet yang Dibuat Otomatis di Google Spreadsheet</span>
        </h3>
        <p className="text-xs text-slate-500">
          Saat fungsi <code>setupDatabase()</code> dijalankan di Apps Script, 6 lembar kerja ini akan dibuat otomatis lengkap dengan data awal:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <span className="font-bold text-blue-900 block">1. Sheet 'Barang'</span>
            <p className="text-blue-700 text-[11px]">
              Menyimpan Kode Barang, Nama, Kategori, Ruangan, Merk, Nomor Seri, Tahun, Sumber Dana, Kondisi, Jumlah, Satuan, Harga Satuan, Total Nilai, dan Penanggung Jawab.
            </p>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
            <span className="font-bold text-indigo-900 block">2. Sheet 'Kategori'</span>
            <p className="text-indigo-700 text-[11px]">
              Daftar klasifikasi: Elektronik/TIK, Mebel, Alat Lab IPA, Buku Perpustakaan, Olahraga, dan Sarana Umum.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
            <span className="font-bold text-emerald-900 block">3. Sheet 'Ruangan'</span>
            <p className="text-emerald-700 text-[11px]">
              Daftar lokasi: Lab Komputer, Lab IPA, Perpustakaan, Ruang Guru, Ruang TU, Kelas, dan Aula.
            </p>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
            <span className="font-bold text-purple-900 block">4. Sheet 'Pengguna'</span>
            <p className="text-purple-700 text-[11px]">
              Daftar akun admin sarpras, petugas inventaris, dan kepala sekolah beserta hak aksesnya.
            </p>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
            <span className="font-bold text-amber-900 block">5. Sheet 'Pengaturan'</span>
            <p className="text-amber-700 text-[11px]">
              Data profil sekolah: Nama Sekolah, NPSN, Kepala Sekolah, NIP, Alamat, dan format kode barang.
            </p>
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
            <span className="font-bold text-teal-900 block">6. Sheet 'LogAktivitas'</span>
            <p className="text-teal-700 text-[11px]">
              Catatan audit trail riwayat penambahan, perbaikan kondisi barang, cetak label, dan sinkronisasi.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpenCheck className="w-4 h-4 text-indigo-600" />
          <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
        </h3>

        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden text-xs transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-800 gap-2"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-3.5 bg-white text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
