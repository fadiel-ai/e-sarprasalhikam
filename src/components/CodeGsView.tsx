import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileSpreadsheet,
  HelpCircle,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { CODE_GS_SCRIPT, INDEX_HTML_STANDALONE } from '../utils/gasCodeGenerator';

export const CodeGsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'codegs' | 'indexhtml'>('codegs');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleCopyCodeGs = () => {
    navigator.clipboard.writeText(CODE_GS_SCRIPT);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 2500);
  };

  const handleCopyIndexHtml = () => {
    navigator.clipboard.writeText(INDEX_HTML_STANDALONE);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadCodeGs = () => {
    const blob = new Blob([CODE_GS_SCRIPT], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadIndexHtml = () => {
    const blob = new Blob([INDEX_HTML_STANDALONE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600" />
            <span>Script Google Apps Script (Code.gs) & Template index.html</span>
          </h2>
          <p className="text-xs text-slate-500">
            Salin kode ini ke Apps Script editor pada Google Spreadsheet Anda untuk mengaktifkan database otomatis & Web App API
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'codegs' ? (
            <>
              <button
                onClick={handleCopyCodeGs}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                {copiedGs ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedGs ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Code.gs'}</span>
              </button>
              <button
                onClick={handleDownloadCodeGs}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                title="Download file Code.gs"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCopyIndexHtml}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                {copiedHtml ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedHtml ? 'Tersalin!' : 'Salin index.html'}</span>
              </button>
              <button
                onClick={handleDownloadIndexHtml}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards: Fitur Otomatis Code.gs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-indigo-700 font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>setupDatabase()</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Membuat 6 sheet otomatis: <b>Barang, Kategori, Ruangan, Pengguna, Pengaturan, LogAktivitas</b> lengkap dengan format warna & freeze header.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Menu Spreadsheet Kustom</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Menambahkan menu <b>"🏫 INVENTARIS SEKOLAH"</b> di Google Sheets untuk reset database dan rekapitulasi sarpras 1-klik.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <Terminal className="w-4 h-4" />
            <span>REST API (doGet & doPost)</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Menyediakan endpoint Web App JSON dengan dukungan CORS untuk sinkronisasi dua arah dari web browser.
          </p>
        </div>
      </div>

      {/* Tab Switcher: Code.gs vs index.html */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('codegs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'codegs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCode2 className="w-4 h-4 text-amber-400" />
          <span>Code.gs (Backend Script & Setup Database)</span>
        </button>
        <button
          onClick={() => setActiveTab('indexhtml')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'indexhtml'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCode2 className="w-4 h-4 text-blue-400" />
          <span>index.html (Template Frontend Standalone)</span>
        </button>
      </div>

      {/* Code Editor Preview */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        {/* Editor Top Bar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-slate-300 font-semibold">
              {activeTab === 'codegs' ? 'Code.gs' : 'index.html'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-mono">
              {activeTab === 'codegs' ? `${CODE_GS_SCRIPT.split('\n').length} baris` : `${INDEX_HTML_STANDALONE.split('\n').length} baris`}
            </span>
            <button
              onClick={activeTab === 'codegs' ? handleCopyCodeGs : handleCopyIndexHtml}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[550px] leading-relaxed selection:bg-indigo-600 selection:text-white">
          <code>{activeTab === 'codegs' ? CODE_GS_SCRIPT : INDEX_HTML_STANDALONE}</code>
        </pre>
      </div>
    </div>
  );
};
