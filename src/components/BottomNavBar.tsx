import React from 'react';
import { AppScreen } from '../types/index.ts';

interface BottomNavBarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const navItems: {
    screen: AppScreen;
    label: string;
    icon: string;
    fillIcon?: boolean;
  }[] = [
    { screen: 'dashboard', label: 'Dashboard', icon: 'dashboard', fillIcon: true },
    { screen: 'presensi', label: 'Presensi', icon: 'location_on', fillIcon: true },
    { screen: 'laporan', label: 'Laporan', icon: 'assignment', fillIcon: false },
    { screen: 'rekap', label: 'Rekap', icon: 'history', fillIcon: false },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full max-w-full z-40 flex justify-center items-center px-3 pb-4 pointer-events-none md:hidden overflow-hidden"
      style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="pointer-events-auto bg-white/95 backdrop-blur-xl shadow-[0_8px_28px_rgba(28,28,23,0.12)] border border-[#d0c5af]/25 rounded-full px-1.5 py-1 flex justify-around items-center w-[94%] max-w-sm">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;

          if (isActive) {
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                aria-label={item.label}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white -translate-y-2.5 shadow-md shadow-[#735c00]/30 transition-all duration-250 ease-out active:scale-[0.98] cursor-pointer"
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
                <span className="font-['Inter'] text-[11px] font-semibold leading-none mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              aria-label={item.label}
              className="min-w-[44px] min-h-[44px] flex flex-col items-center justify-center p-1 text-[#6B4F1D] hover:text-[#735c00] transition-all duration-250 ease-out active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span className="font-['Inter'] text-[11px] font-semibold text-[#6B4F1D] leading-none mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
