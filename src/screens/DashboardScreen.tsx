import React from 'react';
import { AppScreen, AttendanceRecord, UserProfile, WorkReport } from '../types/index.ts';
import { MAP_IMAGE_URL } from '../data/mockData.ts';

interface DashboardScreenProps {
  user: UserProfile;
  attendanceRecords: AttendanceRecord[];
  workReports: WorkReport[];
  isInsideRadius: boolean;
  distanceMeters: number;
  onNavigate: (screen: AppScreen) => void;
  onSelectRecord: (record: AttendanceRecord) => void;
  onOpenAdminModal?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  attendanceRecords,
  workReports,
  isInsideRadius,
  distanceMeters,
  onNavigate,
  onSelectRecord,
  onOpenAdminModal,
}) => {
  const hadirCount = attendanceRecords.filter((r) => r.status === 'HADIR').length;
  const dinasCount = attendanceRecords.filter((r) => r.status === 'DINAS').length;
  const izinCount = attendanceRecords.filter((r) => r.status === 'IZIN').length;
  const sakitCount = attendanceRecords.filter((r) => r.status === 'SAKIT').length;

  const sliderPercent = isInsideRadius
    ? Math.max(10, Math.min(92, 100 - (distanceMeters / 50) * 15))
    : 20;

  return (
    <main
      className="pt-24 px-6 max-w-2xl mx-auto space-y-8 animate-fadeIn"
      style={{ paddingBottom: 'calc(5rem + 32px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Greeting Section with Role & Village Badge */}
      <section className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[#6B4F1D] font-bold tracking-[0.06em] uppercase text-xs">
            {user.instansi}
          </p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              user.role === 'admin_desa'
                ? 'bg-[#5C4300] text-white shadow-sm'
                : 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
            }`}
          >
            {user.role === 'admin_desa' ? '👑 Admin Desa' : '👤 Aparatur'}
          </span>
          {user.role === 'admin_desa' && user.desaLicenseKey ? (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#f6f3ea] text-[#5C4300] border border-[#d4af37]/40 shadow-xs">
              🔑 {user.desaLicenseKey}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f6f3ea] text-[#6B4F1D] border border-[#d0c5af]/40">
              ✓ Aparatur Terverifikasi
            </span>
          )}
        </div>

        <h2 className="text-3xl font-extrabold text-[#1c1c17] tracking-tight font-headline leading-[1.2]">
          Halo, {user.name}
        </h2>
      </section>

      {/* Admin Quick Action Banner if user is Admin Desa */}
      {user.role === 'admin_desa' && onOpenAdminModal && (
        <div className="bg-gradient-to-r from-[#5C4300] to-[#A67C00] text-white p-5 rounded-[2rem] shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#FFE9A8] block">
              HAK AKSES ADMINISTRATOR DESA
            </span>
            <h4 className="font-headline font-bold text-base text-white">
              Kelola Balai Desa &amp; Akun Aparatur
            </h4>
            <p className="text-xs text-white leading-relaxed">
              Atur koordinat GPS balai, radius presensi, dan buatkan kata sandi login untuk aparatur desa Anda.
            </p>
          </div>
          <button
            onClick={onOpenAdminModal}
            aria-label="Kelola Balai Desa"
            className="px-4 py-2.5 bg-white text-[#5C4300] font-headline font-bold text-xs rounded-xl shadow-md active:scale-[0.98] transition-all duration-150 cursor-pointer whitespace-nowrap ml-3"
          >
            Kelola Balai
          </button>
        </div>
      )}

      {/* GPS Location Status Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_24px_rgba(28,28,23,0.04)] border border-[#d0c5af]/15 relative overflow-hidden transition-all">
        <div className="flex justify-between items-start mb-6 gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#1c1c17] font-headline leading-[1.2]">
              Status Lokasi
            </h3>
            <p className="text-sm text-[#5E4B32] flex items-center gap-1.5 mt-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#6B4F1D]">
                my_location
              </span>
              {isInsideRadius
                ? 'Sudah berada di dalam area balai'
                : 'Berada di luar radius kantor'}
            </p>
          </div>

          {isInsideRadius ? (
            <div className="bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0">
              <span className="material-symbols-outlined text-sm text-[#15803D]">check_circle</span>
              <span>Dalam Radius</span>
            </div>
          ) : (
            <div className="bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] px-3.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0">
              <span className="material-symbols-outlined text-sm text-[#BE123C]">cancel</span>
              <span>Di Luar Radius</span>
            </div>
          )}
        </div>

        {/* GPS Radius Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold text-[#6B4F1D] uppercase tracking-[0.06em] font-label">
            <span>Posisi Anda</span>
            <span>Pusat Kantor</span>
          </div>

          <div className="relative h-2.5 w-full bg-[#f1eee5] rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${
                isInsideRadius
                  ? 'bg-gradient-to-r from-[#735c00] to-[#d4af37]'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${sliderPercent}%` }}
            ></div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-[#735c00] transition-all duration-700"
              style={{ left: `calc(${sliderPercent}% - 8px)` }}
            ></div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-medium text-[#4d4635]">
              Akurasi: ±5 meter
            </span>
            <span className="text-xs font-bold text-[#735c00]">
              {distanceMeters}m dari Titik
            </span>
          </div>
        </div>
      </div>

      {/* Fast Action Buttons (Bento Grid Style) */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('presensi')}
          aria-label="Mulai Presensi"
          className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white rounded-[2rem] shadow-lg shadow-[#735c00]/20 active:scale-[0.98] hover:shadow-xl transition-all duration-150 cursor-pointer group"
        >
          <span
            className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            login
          </span>
          <span className="font-headline font-bold tracking-tight text-base">
            Mulai Presensi
          </span>
        </button>

        <button
          onClick={() => onNavigate('laporan')}
          aria-label="Buat Laporan"
          className="flex flex-col items-center justify-center gap-3 p-6 bg-white text-[#735c00] rounded-[2rem] shadow-sm border border-[#d0c5af]/25 active:scale-[0.98] hover:bg-[#fcf9f0] transition-all duration-150 cursor-pointer group"
        >
          <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
            edit_document
          </span>
          <span className="font-headline font-bold tracking-tight text-base">
            Buat Laporan
          </span>
        </button>
      </div>

      {/* Attendance Summary Card */}
      <div className="bg-[#f6f3ea] rounded-[2.5rem] p-8 space-y-6 border border-[#d0c5af]/20 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-headline font-bold text-[#4d4635] text-base">
            Ringkasan Bulan Ini
          </h3>
          <button
            onClick={() => onNavigate('rekap')}
            className="text-xs font-bold text-[#805533] underline hover:text-[#735c00] transition-colors cursor-pointer"
          >
            Lihat Detail
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Hadir */}
          <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm border border-[#86EFAC]/60">
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <span className="text-xl font-black text-[#1c1c17] font-headline">
              {hadirCount.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-[#6B4F1D] tracking-[0.06em] uppercase font-label">
              Hadir
            </span>
          </div>

          {/* Perjalanan Dinas */}
          <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm border border-blue-200">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                business_center
              </span>
            </div>
            <span className="text-xl font-black text-blue-900 font-headline">
              {dinasCount.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-blue-700 tracking-[0.06em] uppercase font-label">
              Dinas
            </span>
          </div>

          {/* Izin */}
          <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm border border-[#FDE68A]/80">
            <div className="w-9 h-9 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
              <span className="material-symbols-outlined text-lg">
                event_busy
              </span>
            </div>
            <span className="text-xl font-black text-[#1c1c17] font-headline">
              {izinCount.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-[#6B4F1D] tracking-[0.06em] uppercase font-label">
              Izin
            </span>
          </div>

          {/* Sakit */}
          <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm border border-[#FECDD3]">
            <div className="w-9 h-9 rounded-full bg-[#FFE4E6] flex items-center justify-center text-[#BE123C]">
              <span className="material-symbols-outlined text-lg">
                medical_services
              </span>
            </div>
            <span className="text-xl font-black text-[#1c1c17] font-headline">
              {sakitCount.toString().padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-[#6B4F1D] tracking-[0.06em] uppercase font-label">
              Sakit
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Header */}
      <div className="pt-2 flex justify-between items-center">
        <h3 className="text-xl font-bold tracking-tight font-headline text-[#1c1c17] leading-[1.2]">
          Aktivitas Terkini
        </h3>
        <button
          onClick={() => onNavigate('rekap')}
          className="p-1 rounded-lg text-[#6B4F1D] hover:text-[#5C4300] hover:bg-white"
          title="Buka Rekapitulasi Lengkap"
        >
          <span className="material-symbols-outlined">tune</span>
        </button>
      </div>

      {/* Decorative Map Section */}
      <div className="rounded-[2rem] h-48 w-full overflow-hidden relative shadow-sm border border-[#d0c5af]/20 group cursor-pointer"
        onClick={() => onNavigate('presensi')}>
        <img
          alt="Peta Lokasi"
          className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-500"
          src={MAP_IMAGE_URL}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcf9f0]/90 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-[#d0c5af]/20">
            <span
              className="material-symbols-outlined text-[#735c00] text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B4F1D] uppercase tracking-[0.06em] font-label">
              Lokasi Terdaftar
            </p>
            <p className="text-sm font-bold text-[#1c1c17] font-headline">
              Gedung Pusat SIGAP
            </p>
          </div>
        </div>
      </div>

      {/* Quick Recent Log Cards */}
      <div className="space-y-3">
        {attendanceRecords.slice(0, 3).map((rec) => (
          <div
            key={rec.id}
            onClick={() => onSelectRecord(rec)}
            className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-[0_4px_16px_rgba(28,28,23,0.02)] border border-[#d0c5af]/15 hover:border-[#735c00]/30 transition-all duration-150 active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  rec.status === 'HADIR'
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : rec.status === 'DINAS'
                    ? 'bg-blue-100 text-blue-700'
                    : rec.status === 'IZIN'
                    ? 'bg-[#FEF3C7] text-[#B45309]'
                    : 'bg-[#FFE4E6] text-[#BE123C]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{
                    fontVariationSettings:
                      rec.status === 'HADIR' || rec.status === 'DINAS' ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {rec.status === 'HADIR'
                    ? 'location_on'
                    : rec.status === 'DINAS'
                    ? 'business_center'
                    : rec.status === 'IZIN'
                    ? 'event_note'
                    : 'medical_services'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-sm text-[#1c1c17]">
                    {rec.formattedDate}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rec.status === 'HADIR'
                        ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                        : rec.status === 'DINAS'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : rec.status === 'IZIN'
                        ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                        : 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]'
                    }`}
                  >
                    {rec.status === 'DINAS' ? 'DINAS' : rec.status}
                  </span>
                </div>
                <p className="text-xs text-[#5E4B32] mt-0.5 font-medium">
                  {rec.checkInTime ? `${rec.checkInTime} - ${rec.checkOutTime}` : rec.note}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#d0c5af] text-xl">
              chevron_right
            </span>
          </div>
        ))}
      </div>
    </main>
  );
};
