import React from 'react';
import {
  Barcode,
  BookOpenCheck,
  FileCode2,
  FileSpreadsheet,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'barang'
  | 'kategori_ruangan'
  | 'barcode'
  | 'laporan'
  | 'admin'
  | 'pengaturan'
  | 'codegs'
  | 'petunjuk';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  totalBarang: number;
  totalRusak: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  totalBarang,
  totalRusak,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'barang' as NavTab,
      label: 'Data Barang',
      icon: Package,
      badge: totalBarang > 0 ? totalBarang : null,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'kategori_ruangan' as NavTab,
      label: 'Kategori & Ruangan',
      icon: FolderTree,
      badge: null,
    },
    {
      id: 'barcode' as NavTab,
      label: 'Label Barcode & QR',
      icon: Barcode,
      badge: 'Cetak',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'laporan' as NavTab,
      label: 'Laporan Sarpras',
      icon: FileSpreadsheet,
      badge: 'A4',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'admin' as NavTab,
      label: 'Admin & Petugas',
      icon: Users,
      badge: null,
    },
    {
      id: 'pengaturan' as NavTab,
      label: 'Pengaturan & Sync',
      icon: Settings,
      badge: null,
    },
    {
      id: 'codegs' as NavTab,
      label: 'Script Code.gs',
      icon: FileCode2,
      badge: 'GAS',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'petunjuk' as NavTab,
      label: 'Petunjuk Penggunaan',
      icon: BookOpenCheck,
      badge: 'Panduan',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 shrink-0 flex flex-col justify-between hidden md:flex border-r border-slate-800">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Menu Utama
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-500/80 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Warning notification if there is damaged equipment */}
        {totalRusak > 0 && (
          <div
            onClick={() => onSelectTab('barang')}
            className="cursor-pointer p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs space-y-1 hover:bg-rose-900/60 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Perhatian Sarpras</span>
            </div>
            <p className="text-rose-200">
              Ada <b className="text-white">{totalRusak} barang</b> berstatus rusak (ringan/berat) yang membutuhkan tindak lanjut.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="truncate">Sistem Terintegrasi Google Sheets</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          v2.4 • Otomatisasi Apps Script
        </p>
      </div>
    </aside>
  );
};
