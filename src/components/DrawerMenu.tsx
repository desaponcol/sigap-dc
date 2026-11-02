import React from 'react';
import { AppScreen, UserProfile } from '../types/index.ts';

import { TenantInfo, SAMPLE_TENANTS } from '../services/supabase.ts';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  user: UserProfile;
  selectedTenant?: TenantInfo;
  isInsideRadius: boolean;
  onToggleRadius: (inside: boolean) => void;
  onLogout: () => void;
  onOpenAdminModal: () => void;
  onCopyVillageLink?: () => void;
  onSelectTenant?: (tenant: TenantInfo) => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  user,
  selectedTenant,
  isInsideRadius,
  onToggleRadius,
  onLogout,
  onOpenAdminModal,
  onCopyVillageLink,
  onSelectTenant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1c1c17]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-xs bg-[#fcf9f0] h-full shadow-2xl flex flex-col justify-between p-6 z-10 border-r border-[#d0c5af]/20 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#d0c5af]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#735c00] to-[#d4af37] flex items-center justify-center text-white shadow-md">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  fingerprint
                </span>
              </div>
              <div>
                <h3 className="font-headline font-black text-lg text-[#735c00] leading-tight">
                  SIGAP
                </h3>
                <p className="font-label text-[9px] uppercase tracking-widest text-[#805533]">
                  Digital Concierge
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup menu"
              className="p-1.5 rounded-lg text-[#7f7663] hover:text-[#1c1c17] hover:bg-[#d0c5af]/20 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* User Profile Snippet */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d0c5af]/20 flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#d4af37]"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-headline font-bold text-sm text-[#1c1c17] truncate">
                {user.name}
              </h4>
              <p className="text-[11px] text-[#805533] truncate">{user.jabatan}</p>
              <span
                className={`inline-block px-2 py-0.5 mt-1 text-[9px] font-bold rounded-full uppercase tracking-wider ${
                  user.role === 'admin_desa'
                    ? 'bg-[#735c00] text-white shadow-sm'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {user.role === 'admin_desa' ? '👑 Admin Desa' : '👤 Aparatur Desa'}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#805533] px-3 mb-2">
              Menu Utama
            </p>
            {[
              { screen: 'dashboard' as AppScreen, label: 'Dashboard', icon: 'dashboard' },
              { screen: 'presensi' as AppScreen, label: 'Input Presensi', icon: 'location_on' },
              { screen: 'laporan' as AppScreen, label: 'Laporan Kerja Harian', icon: 'assignment' },
              { screen: 'rekap' as AppScreen, label: 'Rekap Presensi & Laporan', icon: 'history' },
              { screen: 'tentang' as AppScreen, label: 'Tentang SIGAP & Pengembang', icon: 'info' },
            ].map((item) => (
              <button
                key={item.screen}
                onClick={() => {
                  onNavigate(item.screen);
                  onClose();
                }}
                aria-label={item.label}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-headline text-sm font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  currentScreen === item.screen
                    ? 'bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white shadow-md'
                    : 'text-[#1c1c17] hover:bg-white/80'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{
                    fontVariationSettings:
                      currentScreen === item.screen ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}

            {/* Admin Desa ONLY Menus */}
            {user.role === 'admin_desa' ? (
              <div className="pt-2 space-y-1 border-t border-[#d0c5af]/20 mt-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#735c00] px-3 mb-1">
                  Fitur Administrator Desa
                </p>

                {/* Admin Desa: Kelola Balai Desa & Aparatur */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminModal();
                  }}
                  aria-label="Kelola Balai dan Aparatur Desa"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-headline text-xs font-semibold text-[#735c00] bg-[#f6f3ea] hover:bg-[#ebe8df] transition-all duration-150 active:scale-[0.98] border border-[#d0c5af]/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-[#5C4300]">
                      holiday_village
                    </span>
                    <span>Kelola Balai &amp; Aparatur Desa</span>
                  </div>
                  <span className="text-xs bg-[#5C4300] text-white px-2.5 py-0.5 rounded-full font-bold">
                    Admin
                  </span>
                </button>
              </div>
            ) : (
              /* Pegawai Specific Notice Card */
              <div className="bg-[#f6f3ea] p-3.5 rounded-2xl border border-[#d0c5af]/30 space-y-2 mt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B4F1D]">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Hak Akses Aparatur</span>
                </div>
                <p className="text-xs text-[#5E4B32] leading-relaxed">
                  Anda memiliki akses untuk <strong>Presensi</strong>, <strong>Laporan Harian</strong>, dan <strong>Unduh PDF</strong>.
                </p>
                <div className="text-[11px] text-[#6B4F1D] bg-white/90 p-2 rounded-lg border border-[#d0c5af]/30">
                  🔒 Pengaturan basis data desa dan penambahan pegawai dikelola eksklusif oleh Admin Desa.
                </div>
              </div>
            )}

            {/* Village Link & PWA Quick Share */}
            {onCopyVillageLink && (
              <div className="bg-[#f6f3ea] p-3 rounded-2xl border border-[#d0c5af]/30 mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#735c00] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">link</span>
                    Tautan Resmi PWA
                  </span>
                  <span className="text-[9px] bg-[#5C4300] text-white px-2 py-0.5 rounded-full font-bold">
                    {selectedTenant?.namaDesa || 'Desa'}
                  </span>
                </div>
                <p className="text-[11px] text-[#5E4B32] leading-tight">
                  Bagikan tautan khusus ini agar aparatur {selectedTenant?.namaDesa || 'desa'} langsung membuka balai desanya.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onCopyVillageLink();
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-gradient-to-r from-[#5C4300] to-[#7A5B00] text-[#FFE9A8] hover:text-white rounded-xl text-xs font-bold shadow-xs transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                  <span>Salin Link WhatsApp Desa</span>
                </button>
              </div>
            )}
            {/* 8 Desa Poncol Cluster Simulator & Link Switcher */}
            <div className="bg-[#f6f3ea] p-3 rounded-2xl border border-[#d0c5af]/30 mt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#735c00] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">location_city</span>
                  Simulasi 8 Desa Poncol
                </span>
                <span className="text-[9px] bg-amber-100 text-[#735c00] px-2 py-0.5 rounded-full font-bold">
                  Magetan
                </span>
              </div>
              <p className="text-[11px] text-[#5E4B32] leading-tight">
                Pilih balai desa untuk menguji peralihan profil, titik GPS, dan tautan khusus aparatur:
              </p>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {SAMPLE_TENANTS.slice(0, 8).map((tenant) => {
                  const isCurrent = selectedTenant?.id === tenant.id || selectedTenant?.namaDesa === tenant.namaDesa;
                  const shortName = tenant.namaDesa.replace(/desa\s+/gi, '');
                  const slug = shortName.toLowerCase();
                  return (
                    <button
                      key={tenant.id}
                      type="button"
                      onClick={() => {
                        if (onSelectTenant) {
                          onSelectTenant(tenant);
                        }
                        onClose();
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                        isCurrent
                          ? 'bg-[#5C4300] text-white shadow-xs'
                          : 'bg-white text-[#5C4300] hover:bg-[#fff7d9] border border-[#d0c5af]/30'
                      }`}
                    >
                      <span className="truncate">{shortName}</span>
                      {isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                      ) : (
                        <span className="text-[9px] opacity-60 font-mono">?desa={slug}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location Simulator Control */}
          <div className="bg-[#f6f3ea] p-4 rounded-2xl border border-[#d0c5af]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">tune</span>
                Simulasi GPS Geofence
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isInsideRadius
                    ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                    : 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]'
                }`}
              >
                {isInsideRadius ? '12m (Dalam)' : '450m (Luar)'}
              </span>
            </div>
            <p className="text-xs text-[#5E4B32] leading-relaxed">
              Uji coba perubahan perilaku aplikasi saat berada di dalam radius kantor (≤50m) vs di luar kantor.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onToggleRadius(true)}
                aria-label="Set Lokasi Dalam Radius"
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  isInsideRadius
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : 'bg-white text-[#5E4B32] border border-[#d0c5af]/40'
                }`}
              >
                Dalam Radius
              </button>
              <button
                type="button"
                onClick={() => onToggleRadius(false)}
                aria-label="Set Lokasi Luar Radius"
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                  !isInsideRadius
                    ? 'bg-[#BE123C] text-white shadow-sm'
                    : 'bg-white text-[#5E4B32] border border-[#d0c5af]/40'
                }`}
              >
                Luar Radius
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#d0c5af]/20 space-y-3">
          <button
            onClick={() => {
              onNavigate('tentang');
              onClose();
            }}
            aria-label="Lihat Informasi Pengembang Arunika Kreatif Media"
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-white/70 hover:bg-white border border-[#d0c5af]/30 transition-all duration-150 active:scale-[0.98] text-left cursor-pointer"
          >
            <img
              src="https://res.cloudinary.com/maswardi/image/upload/v1792760931/akm1_u3kzra.png"
              alt="Arunika Kreatif Media"
              className="w-6 h-6 object-contain"
            />
            <div className="text-[10px] text-[#4d4635] leading-tight">
              <span className="block text-[8px] uppercase tracking-wider text-[#805533]">Pengembang Resmi</span>
              <strong>Arunika Kreatif Media</strong>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            aria-label="Keluar dari Akun"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-all duration-150 active:scale-[0.98] font-headline font-bold text-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  );
};
