import React from 'react';
import { AppScreen, UserProfile } from '../types/index.ts';
import { TenantInfo } from '../services/supabase.ts';

interface TopAppBarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  user: UserProfile;
  selectedTenant?: TenantInfo;
  onOpenDrawer: () => void;
  onOpenProfile: () => void;
  onOpenAdminModal?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentScreen,
  onNavigate,
  user,
  selectedTenant,
  onOpenDrawer,
  onOpenProfile,
  onOpenAdminModal,
}) => {
  const villageName = selectedTenant?.namaDesa || user.instansi.replace('Kantor Balai ', '');

  return (
    <header className="fixed top-0 left-0 right-0 w-full max-w-full z-50 bg-[#fcf9f0]/95 backdrop-blur-md shadow-[0_4px_16px_rgba(28,28,23,0.04)] border-b border-[#d0c5af]/20">
      <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 sm:py-3 w-full max-w-5xl mx-auto gap-2">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenDrawer}
            aria-label="Buka menu navigasi"
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl text-[#735c00] hover:bg-[#735c00]/10 active:scale-[0.98] transition-all duration-150 focus:outline-none cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div
            onClick={() => onNavigate('dashboard')}
            className="cursor-pointer flex items-center gap-2 select-none shrink-0"
          >
            <h1 className="text-xl font-black text-[#735c00] font-headline tracking-tight">
              SIGAP
            </h1>
          </div>

          {/* Active Village Badge: Clickable only for Admin Desa, Read-Only for Pegawai */}
          {user.role === 'admin_desa' ? (
            <button
              type="button"
              onClick={onOpenAdminModal}
              aria-label={`Kelola Lisensi & Konfigurasi Desa ${villageName}`}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-amber-50/90 hover:bg-amber-100/90 border border-[#d4af37]/40 rounded-full text-xs font-bold text-[#735c00] transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] min-w-0 max-w-[95px] xs:max-w-[130px] sm:max-w-none"
              title="Kelola Lisensi & Konfigurasi Desa (Khusus Admin Desa)"
            >
              <span className="material-symbols-outlined text-xs sm:text-sm text-[#735c00] shrink-0">holiday_village</span>
              <span className="truncate">{villageName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            </button>
          ) : (
            <div
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-full text-xs font-semibold text-[#4d4635] shadow-xs select-none min-w-0 max-w-[95px] xs:max-w-[130px] sm:max-w-none"
              title={`Instansi Tugas: Kantor Balai ${villageName}`}
            >
              <span className="material-symbols-outlined text-xs sm:text-sm text-[#735c00] shrink-0">holiday_village</span>
              <span className="truncate">{villageName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            </div>
          )}
        </div>


        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`font-headline text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
              currentScreen === 'dashboard'
                ? 'text-[#5C4300] font-bold border-b-2 border-[#5C4300] pb-1'
                : 'text-[#6B4F1D] hover:text-[#5C4300]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('presensi')}
            className={`font-headline text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
              currentScreen === 'presensi'
                ? 'text-[#5C4300] font-bold border-b-2 border-[#5C4300] pb-1'
                : 'text-[#6B4F1D] hover:text-[#5C4300]'
            }`}
          >
            Presensi
          </button>
          <button
            onClick={() => onNavigate('laporan')}
            className={`font-headline text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
              currentScreen === 'laporan'
                ? 'text-[#5C4300] font-bold border-b-2 border-[#5C4300] pb-1'
                : 'text-[#6B4F1D] hover:text-[#5C4300]'
            }`}
          >
            Laporan
          </button>
          <button
            onClick={() => onNavigate('rekap')}
            className={`font-headline text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
              currentScreen === 'rekap'
                ? 'text-[#5C4300] font-bold border-b-2 border-[#5C4300] pb-1'
                : 'text-[#6B4F1D] hover:text-[#5C4300]'
            }`}
          >
            Rekap
          </button>
          <button
            onClick={() => onNavigate('tentang')}
            className={`font-headline text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
              currentScreen === 'tentang'
                ? 'text-[#5C4300] font-bold border-b-2 border-[#5C4300] pb-1'
                : 'text-[#6B4F1D] hover:text-[#5C4300]'
            }`}
          >
            Tentang
          </button>
        </div>

        {/* Database & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user.role === 'admin_desa' ? (
            <button
              onClick={onOpenAdminModal}
              aria-label="Pengaturan Balai Desa"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#fff9ea] text-[#5C4300] border border-[#d4af37]/40 hover:bg-[#fbf4de] active:scale-[0.98] transition-all duration-150 cursor-pointer shadow-xs"
              title="Klik untuk membuka Pengaturan Balai Desa & Aparatur"
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              <span className="hidden sm:inline font-headline">Kelola Balai</span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
              Aparatur Desa
            </span>
          )}

          <button
            onClick={onOpenProfile}
            aria-label={`Profil ${user.name}`}
            className="w-10 h-10 rounded-full border-2 border-[#d4af37] overflow-hidden hover:ring-2 hover:ring-[#735c00]/30 transition-all duration-150 active:scale-[0.98] shadow-sm cursor-pointer shrink-0"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
