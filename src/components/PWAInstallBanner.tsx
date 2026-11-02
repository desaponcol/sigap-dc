import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall.ts';
import { TenantInfo, SAMPLE_TENANTS } from '../services/supabase.ts';

interface PWAInstallBannerProps {
  selectedTenant?: TenantInfo;
  onCopyVillageLink?: () => void;
  onSelectTenant?: (tenant: TenantInfo) => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  selectedTenant,
  onCopyVillageLink,
  onSelectTenant,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running as an installed PWA or manually dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  // Get current village slug for sharing
  const villageSlug = selectedTenant?.namaDesa
    ? selectedTenant.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '')
    : 'poncol';

  return (
    <>
      {/* Subtle PWA Install Banner */}
      <div className="mx-2.5 sm:mx-4 mt-2 mb-3 bg-gradient-to-r from-[#5C4300] via-[#7A5B00] to-[#5C4300] text-white p-3 sm:p-3.5 rounded-2xl shadow-lg border border-[#FFE9A8]/30 flex flex-col gap-2.5 transition-all duration-200 max-w-[calc(100vw-1.25rem)] overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1E1A14] flex items-center justify-center shrink-0 border border-[#FFE9A8]/40 shadow-inner">
              <span className="material-symbols-outlined text-[#FFE082] text-lg sm:text-xl">
                install_mobile
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] sm:text-xs font-bold tracking-wide uppercase text-[#FFE9A8] truncate">
                  Mode PWA Siap Pasang
                </span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">
                  Online / Offline
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/90 truncate mt-0.5">
                Jadikan aplikasi di layar HP {selectedTenant?.namaDesa || 'Desa'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 flex-wrap">
              {isInstallable && (
                <button
                  onClick={install}
                  className="bg-[#FFE9A8] text-[#5C4300] hover:bg-white text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Pasang di HP</span>
                </button>
              )}

              {isIOS && (
                <button
                  onClick={() => setShowIOSGuide(true)}
                  className="bg-[#FFE9A8] text-[#5C4300] hover:bg-white text-xs font-bold px-3 py-2 rounded-xl shadow transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">ios_share</span>
                  <span>Pasang di iPhone</span>
                </button>
              )}

              {onCopyVillageLink && (
                <button
                  onClick={onCopyVillageLink}
                  title={`Salin Link Khusus ${selectedTenant?.namaDesa || 'Desa'}`}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] flex items-center gap-1 border border-white/20"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                  <span className="hidden sm:inline">Bagikan Link</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Tutup Banner PWA"
              className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guided Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#FCF9F0] p-6 shadow-2xl border border-[#D0C5AF]/40 text-[#1C1C17]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#5C4300] text-[#FFE9A8] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">phone_iphone</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1C1C17]">Pasang di iPhone / iPad</h3>
                  <p className="text-[11px] text-[#5E4B32]">Tanpa lewat App Store</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-[#6B4F1D] hover:text-[#1C1C17] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E5D9C3] text-xs text-[#5E4B32]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#5C4300] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Buka link ini di browser <strong>Safari</strong> iPhone Anda.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#5C4300] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak dengan panah ke atas di bagian bawah Safari).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#5C4300] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Gulir ke bawah lalu pilih menu <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full bg-[#5C4300] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#735C00] transition-all duration-150 active:scale-[0.98]"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
