import React, { useState } from 'react';
import { AttendanceRecord, UserProfile, WorkReport } from '../types/index.ts';
import { calculateAttendanceStats, formatDynamicIndonesianDate } from '../utils/presence.ts';

interface RekapScreenProps {
  user: UserProfile;
  attendanceRecords: AttendanceRecord[];
  workReports: WorkReport[];
  onSelectRecord: (record: AttendanceRecord) => void;
  onOpenPdfModal: () => void;
}

export const RekapScreen: React.FC<RekapScreenProps> = ({
  user,
  attendanceRecords,
  workReports,
  onSelectRecord,
  onOpenPdfModal,
}) => {
  const [activeTab, setActiveTab] = useState<'presensi' | 'laporan'>('presensi');
  const [selectedPeriod, setSelectedPeriod] = useState(
    () => formatDynamicIndonesianDate().periodLabel
  );

  const stats = calculateAttendanceStats(attendanceRecords);

  return (
    <main
      className="pt-24 px-6 max-w-5xl mx-auto animate-fadeIn relative"
      style={{ paddingBottom: 'calc(5rem + 32px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-[#1c1c17] tracking-tight mb-1 leading-[1.2]">
            Rekap Presensi &amp; Laporan
          </h2>
          <p className="text-[#5E4B32] text-[15px] font-medium leading-relaxed">
            Tinjau aktivitas dan performa kerja Anda
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPdfModal}
          aria-label="Unduh PDF Laporan"
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          <span>Unduh PDF</span>
        </button>
      </div>

      {/* Asymmetric Bento Grid / Tab Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tabs Selection (Bento Style) */}
        <div className="md:col-span-2 flex bg-[#f6f3ea] p-1.5 rounded-2xl border border-[#d0c5af]/25">
          <button
            type="button"
            onClick={() => setActiveTab('presensi')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'presensi'
                ? 'bg-white text-[#5C4300] shadow-sm font-bold'
                : 'text-[#6B4F1D] font-semibold hover:bg-[#ebe8df]'
            }`}
          >
            Riwayat Presensi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('laporan')}
            className={`flex-1 py-3 px-6 rounded-xl text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'laporan'
                ? 'bg-white text-[#5C4300] shadow-sm font-bold'
                : 'text-[#6B4F1D] font-semibold hover:bg-[#ebe8df]'
            }`}
          >
            Daftar Laporan
          </button>
        </div>

        {/* Summary Card (Editorial Style) */}
        <div className="bg-[#d4af37]/15 p-5 rounded-2xl border border-[#d4af37]/30 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D]">
              Tingkat Kehadiran
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black font-headline text-[#5C4300]">
                {stats.attendanceRatePercentage}%
              </span>
              <span className="text-xs text-[#6B4F1D] font-bold">
                Bulan Ini
              </span>
            </div>
          </div>
          {/* Progress bar tipis */}
          <div
            className="w-full bg-[#d4af37]/30 h-1.5 rounded-full overflow-hidden mt-3"
            role="progressbar"
            aria-valuenow={stats.attendanceRatePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Persentase Kehadiran"
          >
            <div
              className="bg-[#735c00] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, stats.attendanceRatePercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] font-label">
          Aktivitas Terakhir
        </h3>
        <span className="text-xs font-bold text-[#6B4F1D]">
          {selectedPeriod}
        </span>
      </div>

      {/* Tab Content: Riwayat Presensi */}
      {activeTab === 'presensi' && (
        <div className="space-y-4">
          {attendanceRecords.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-[#7f7663] text-sm">
              Belum ada data presensi yang terekam.
            </div>
          ) : (
            attendanceRecords.map((item) => {
              const isHadir = item.status === 'HADIR';
              const isDinas = item.status === 'DINAS';
              const isIzin = item.status === 'IZIN';
              const isSakit = item.status === 'SAKIT';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectRecord(item)}
                  className="bg-white p-5 rounded-2xl flex items-center justify-between group hover:bg-[#fcf9f0] transition-all duration-150 active:scale-[0.98] shadow-[0_8px_24px_rgba(28,28,23,0.02)] border border-[#d0c5af]/15 cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isHadir
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : isDinas
                          ? 'bg-blue-100 text-blue-700'
                          : isIzin
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#FFE4E6] text-[#BE123C]'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[28px]"
                        style={{
                          fontVariationSettings: isHadir || isDinas ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        {isHadir
                          ? 'location_on'
                          : isDinas
                          ? 'business_center'
                          : isIzin
                          ? 'event_note'
                          : 'medical_services'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold font-headline text-[#1c1c17]">
                          {item.formattedDate}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isHadir
                              ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                              : isDinas
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : isIzin
                              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                              : 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]'
                          }`}
                        >
                          {isDinas ? 'Perjalanan Dinas' : item.status}
                        </span>
                      </div>

                      {item.checkInTime ? (
                        <p className="text-xs text-[#5E4B32] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>{' '}
                          {item.checkInTime} - {item.checkOutTime || '17:00'}
                          {item.note && (
                            <span className="text-[#5E4B32] truncate max-w-xs ml-1">
                              • {item.note}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-xs text-[#5E4B32] font-medium">
                          {item.note || 'Keterangan tercatat'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="material-symbols-outlined text-[#d0c5af] group-hover:text-[#735c00] transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Daftar Laporan */}
      {activeTab === 'laporan' && (
        <div className="space-y-4">
          {workReports.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-[#7f7663] text-sm">
              Belum ada laporan kerja harian.
            </div>
          ) : (
            workReports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-6 rounded-2xl shadow-[0_8px_24px_rgba(28,28,23,0.02)] border border-[#d0c5af]/15 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#735c00] text-xl">
                      assignment
                    </span>
                    <span className="font-headline font-bold text-sm text-[#1c1c17]">
                      {report.date}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    {report.status}
                  </span>
                </div>

                <div className="bg-[#fcf9f0] p-4 rounded-xl border border-[#d0c5af]/15 space-y-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] block">
                      Detail Kegiatan
                    </span>
                    <p className="text-sm text-[#1c1c17] mt-0.5 leading-relaxed font-body">
                      {report.detail}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-[#d0c5af]/15">
                    <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] block">
                      Hasil / Output
                    </span>
                    <p className="text-xs text-[#5E4B32] mt-0.5 font-medium leading-relaxed">
                      {report.output}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#7f7663] px-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">pin_drop</span>
                    {report.location}
                  </span>
                  <span>{report.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </main>
  );
};
