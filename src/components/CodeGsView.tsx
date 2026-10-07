import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  FileSpreadsheet,
  Globe,
  HelpCircle,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  CODE_GS_SCRIPT,
  INDEX_HTML_SCRIPT,
  JAVASCRIPT_HTML_SCRIPT,
  STYLESHEET_HTML_SCRIPT,
} from '../utils/gasCodeGenerator';

type TabKey = 'codegs' | 'indexhtml' | 'stylesheet' | 'javascript';

export const CodeGsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('codegs');
  const [copiedStatus, setCopiedStatus] = useState<Record<TabKey, boolean>>({
    codegs: false,
    indexhtml: false,
    stylesheet: false,
    javascript: false,
  });

  const filesConfig: Record<TabKey, { name: string; type: string; ext: string; content: string; desc: string }> = {
    codegs: {
      name: 'Code.gs',
      type: 'Script (.gs)',
      ext: '.gs',
      content: CODE_GS_SCRIPT,
      desc: 'Backend server: penanganan database Google Spreadsheet, CRUD barang/kategori/ruangan, REST API, dan menu kustom.',
    },
    indexhtml: {
      name: 'Index.html',
      type: 'HTML (.html)',
      ext: '.html',
      content: INDEX_HTML_SCRIPT,
      desc: 'Struktur antarmuka lengkap: Dashboard, Data Barang, Label Barcode/QR, Kartu Inventaris Ruangan (KIR), dan Pengaturan.',
    },
    stylesheet: {
      name: 'Stylesheet.html',
      type: 'HTML (.html)',
      ext: '.html',
      content: STYLESHEET_HTML_SCRIPT,
      desc: 'Desain visual Tailwind CSS, font Plus Jakarta Sans, dan layout cetak presisi A4 untuk stiker label & dokumen KIR.',
    },
    javascript: {
      name: 'JavaScript.html',
      type: 'HTML (.html)',
      ext: '.html',
      content: JAVASCRIPT_HTML_SCRIPT,
      desc: 'Logika frontend interaktif: generator Barcode & QR Code instan, sinkronisasi real-time via google.script.run, dan cetak.',
    },
  };

  const handleCopyCurrent = () => {
    const file = filesConfig[activeTab];
    navigator.clipboard.writeText(file.content);
    setCopiedStatus((prev) => ({ ...prev, [activeTab]: true }));
    setTimeout(() => {
      setCopiedStatus((prev) => ({ ...prev, [activeTab]: false }));
    }, 2500);
  };

  const handleDownloadCurrent = () => {
    const file = filesConfig[activeTab];
    const mime = file.ext === '.gs' ? 'text/javascript;charset=utf-8' : 'text/html;charset=utf-8';
    const blob = new Blob([file.content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600" />
            <span>Paket Deployment Google Apps Script (4 File Pokok)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat 4 file ini di Google Apps Script editor Anda agar seluruh sistem inventaris berjalan 100% mandiri di Google Workspace sekolah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCurrent}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {copiedStatus[activeTab] ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin {filesConfig[activeTab].name}</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadCurrent}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title={`Download ${filesConfig[activeTab].name}`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download File</span>
          </button>
        </div>
      </div>

      {/* Panduan Pembuatan File di Google Apps Script */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-700/50 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Cara Membuat 4 File Ini di Google Apps Script (Hanya 2 Menit):</span>
          </span>
          <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-indigo-200">
            Akses: Anyone (Siapa saja)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 border border-white/15 p-3 rounded-xl space-y-1">
            <span className="font-bold text-indigo-200 block text-[11px]">File 1 (Script):</span>
            <p className="font-mono font-bold text-white">Code.gs</p>
            <p className="text-[10px] text-indigo-300">File default utama saat membuka Apps Script editor.</p>
          </div>
          <div className="bg-white/10 border border-white/15 p-3 rounded-xl space-y-1">
            <span className="font-bold text-indigo-200 block text-[11px]">File 2 (HTML):</span>
            <p className="font-mono font-bold text-white">Index.html</p>
            <p className="text-[10px] text-indigo-300">Klik tanda (+) &rarr; pilih <b>HTML</b> &rarr; beri nama <code>Index</code>.</p>
          </div>
          <div className="bg-white/10 border border-white/15 p-3 rounded-xl space-y-1">
            <span className="font-bold text-indigo-200 block text-[11px]">File 3 (HTML):</span>
            <p className="font-mono font-bold text-white">Stylesheet.html</p>
            <p className="text-[10px] text-indigo-300">Klik tanda (+) &rarr; pilih <b>HTML</b> &rarr; beri nama <code>Stylesheet</code>.</p>
          </div>
          <div className="bg-white/10 border border-white/15 p-3 rounded-xl space-y-1">
            <span className="font-bold text-indigo-200 block text-[11px]">File 4 (HTML):</span>
            <p className="font-mono font-bold text-white">JavaScript.html</p>
            <p className="text-[10px] text-indigo-300">Klik tanda (+) &rarr; pilih <b>HTML</b> &rarr; beri nama <code>JavaScript</code>.</p>
          </div>
        </div>
      </div>

      {/* Tabs Pilihan File */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('codegs')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'codegs'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">1</span>
          <span>Code.gs</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">Backend</span>
        </button>

        <button
          onClick={() => setActiveTab('indexhtml')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'indexhtml'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">2</span>
          <span>Index.html</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">Tampilan</span>
        </button>

        <button
          onClick={() => setActiveTab('stylesheet')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'stylesheet'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-bold">3</span>
          <span>Stylesheet.html</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono">CSS / Cetak</span>
        </button>

        <button
          onClick={() => setActiveTab('javascript')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'javascript'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] flex items-center justify-center font-bold">4</span>
          <span>JavaScript.html</span>
          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono">Logika / Barcode</span>
        </button>
      </div>

      {/* Deskripsi File Aktif */}
      <div className="bg-slate-100 px-4 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
        <p>
          <b>{filesConfig[activeTab].name}:</b> {filesConfig[activeTab].desc}
        </p>
        <button
          onClick={handleCopyCurrent}
          className="text-indigo-600 hover:underline font-bold text-xs shrink-0 pl-3"
        >
          {copiedStatus[activeTab] ? '✓ Tersalin' : 'Salin Kode Ini'}
        </button>
      </div>

      {/* Editor Tampilan Kode */}
      <div className="relative bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="ml-2 text-slate-400 font-bold">{filesConfig[activeTab].name}</span>
          </div>
          <span className="text-slate-500 text-[11px]">
            {filesConfig[activeTab].content.split('\n').length} baris kode
          </span>
        </div>

        <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-slate-300 max-h-[550px] select-all">
          <code>{filesConfig[activeTab].content}</code>
        </pre>
      </div>

      {/* Langkah Deploy Web App */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          <span>Langkah Deploy Menjadi Web App Resmi (Sekali Saja):</span>
        </h3>
        <ol className="text-xs text-slate-700 space-y-2.5 list-decimal list-inside leading-relaxed">
          <li>
            Pastikan ke-4 file di atas (<code>Code.gs</code>, <code>Index.html</code>, <code>Stylesheet.html</code>, <code>JavaScript.html</code>) sudah dibuat dan kodenya ditempelkan di Google Apps Script.
          </li>
          <li>
            Pada bilah alat atas Apps Script, pilih fungsi <b>setupDatabase</b> lalu klik tombol <b>▷ Jalankan (Run)</b> untuk membuat tabel Google Spreadsheet secara otomatis.
          </li>
          <li>
            Klik tombol biru <b>Deploy</b> di pojok kanan atas Apps Script &rarr; pilih <b>New deployment</b>.
          </li>
          <li>
            Klik ikon roda gigi di samping <em>Select type</em> &rarr; pilih <b>Web app</b>.
          </li>
          <li>
            Atur konfigurasi deployment:
            <ul className="list-disc list-inside ml-5 mt-1 space-y-0.5 text-slate-600">
              <li><b>Description:</b> Sistem Inventaris Sekolah</li>
              <li><b>Execute as:</b> <code>Me (email Anda)</code></li>
              <li><b>Who has access:</b> <code>Anyone (Siapa saja)</code> <em>(Wajib agar guru & staf bisa membuka tanpa error akses)</em></li>
            </ul>
          </li>
          <li>
            Klik <b>Deploy</b> dan salin <b>Web app URL</b> yang muncul. URL tersebut adalah website aplikasi inventaris sekolah permanen Anda yang siap dipakai selamanya!
          </li>
        </ol>
      </div>
    </div>
  );
};
