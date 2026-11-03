import React, { useState } from 'react';
import { AttendanceRecord, UserProfile, WorkReport } from '../types/index.ts';
import { calculateAttendanceStats, formatDynamicIndonesianDate } from '../utils/presence.ts';

interface RekapScreenProps {
  user: UserProfile;
  attendanceRecords: AttendanceRecord[];
  workReports: WorkReport[];
  onSelectRecord: (record: AttendanceRecord) => void;
  onOpenPdfModal: () => void;
  onUpdateReport?: (report: WorkReport) => void;
  onDeleteReport?: (reportId: string) => void;
}

export const RekapScreen: React.FC<RekapScreenProps> = ({
  user,
  attendanceRecords,
  workReports,
  onSelectRecord,
  onOpenPdfModal,
  onUpdateReport,
  onDeleteReport,
}) => {
  const [activeTab, setActiveTab] = useState<'presensi' | 'laporan'>('presensi');
  const [selectedPeriod, setSelectedPeriod] = useState(
    () => formatDynamicIndonesianDate().periodLabel
  );

  // Edit Report Modal State
  const [editingReport, setEditingReport] = useState<WorkReport | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editDetail, setEditDetail] = useState('');
  const [editOutput, setEditOutput] = useState('');
  const [editStatus, setEditStatus] = useState<'TERVERIFIKASI' | 'MENUNGGU' | 'DRAFT'>('TERVERIFIKASI');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const stats = calculateAttendanceStats(attendanceRecords);

  const handleOpenEdit = (report: WorkReport) => {
    setEditingReport(report);
    setEditDate(report.date);
    setEditDetail(report.detail);
    setEditOutput(report.output);
    setEditStatus(report.status);
    setDeleteConfirmId(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    if (!editDetail.trim() || !editOutput.trim() || !editDate.trim()) return;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const updated: WorkReport = {
      ...editingReport,
      date: editDate.trim(),
      detail: editDetail.trim(),
      output: editOutput.trim(),
      status: editStatus,
      timestamp: `${editDate.trim()} ${hours}:${minutes} WIB (Diedit)`,
    };

    if (onUpdateReport) {
      onUpdateReport(updated);
    }

    setEditingReport(null);
  };

  const handleDelete = (reportId: string) => {
    if (onDeleteReport) {
      onDeleteReport(reportId);
    }
    setEditingReport(null);
    setDeleteConfirmId(null);
  };

  return (
    <main
      className="pt-20 sm:pt-24 px-3 sm:px-6 max-w-5xl mx-auto animate-fadeIn relative w-full overflow-hidden"
      style={{ paddingBottom: 'calc(5rem + 32px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#1c1c17] tracking-tight mb-1 leading-[1.2]">
            Rekap Presensi &amp; Laporan
          </h2>
          <p className="text-[#5E4B32] text-xs sm:text-[15px] font-medium leading-relaxed">
            Tinjau aktivitas, performa, dan edit laporan kerja harian
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPdfModal}
          aria-label="Unduh PDF Laporan"
          className="self-start sm:self-auto px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          <span>Unduh PDF</span>
        </button>
      </div>

      {/* Asymmetric Bento Grid / Tab Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Tabs Selection (Bento Style) */}
        <div className="md:col-span-2 flex bg-[#f6f3ea] p-1 sm:p-1.5 rounded-2xl border border-[#d0c5af]/25">
          <button
            type="button"
            onClick={() => setActiveTab('presensi')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'presensi'
                ? 'bg-white text-[#5C4300] shadow-sm font-bold'
                : 'text-[#6B4F1D] font-semibold hover:bg-[#ebe8df]'
            }`}
          >
            Riwayat Presensi ({attendanceRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('laporan')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              activeTab === 'laporan'
                ? 'bg-white text-[#5C4300] shadow-sm font-bold'
                : 'text-[#6B4F1D] font-semibold hover:bg-[#ebe8df]'
            }`}
          >
            Daftar Laporan ({workReports.length})
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
          {activeTab === 'presensi' ? 'Aktivitas Presensi Terakhir' : 'Daftar Laporan Kinerja'}
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

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectRecord(item)}
                  className="bg-white p-3.5 sm:p-5 rounded-2xl flex items-center justify-between group hover:bg-[#fcf9f0] transition-all duration-150 active:scale-[0.98] shadow-sm border border-[#d0c5af]/15 cursor-pointer"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-2">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${
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
                        className="material-symbols-outlined text-2xl sm:text-[28px]"
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                        <span className="text-xs sm:text-base font-bold font-headline text-[#1c1c17] truncate">
                          {item.formattedDate}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            isHadir
                              ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                              : isDinas
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : isIzin
                              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                              : 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]'
                          }`}
                        >
                          {isDinas ? 'Dinas' : item.status}
                        </span>
                      </div>

                      {item.checkInTime ? (
                        <p className="text-[11px] sm:text-xs text-[#5E4B32] font-medium flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-xs sm:text-sm shrink-0">
                            schedule
                          </span>{' '}
                          <span>{item.checkInTime} - {item.checkOutTime || '17:00'}</span>
                          {item.note && (
                            <span className="text-[#5E4B32] truncate max-w-[120px] xs:max-w-xs ml-1">
                              • {item.note}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-[11px] sm:text-xs text-[#5E4B32] font-medium truncate">
                          {item.note || 'Keterangan tercatat'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="material-symbols-outlined text-base sm:text-xl text-[#d0c5af] group-hover:text-[#735c00] transition-colors">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content: Daftar Laporan (Bisa diedit oleh Perangkat Desa) */}
      {activeTab === 'laporan' && (
        <div className="space-y-4">
          {workReports.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-[#7f7663] text-sm">
              Belum ada laporan kerja harian. Silakan buat laporan baru melalui menu <strong>Laporan</strong>.
            </div>
          ) : (
            workReports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_8px_24px_rgba(28,28,23,0.02)] border border-[#d0c5af]/20 space-y-3 transition-all hover:border-[#d4af37]/50"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#735c00] text-xl">
                      assignment
                    </span>
                    <span className="font-headline font-bold text-sm text-[#1c1c17]">
                      {report.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        report.status === 'TERVERIFIKASI'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : report.status === 'MENUNGGU'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {report.status}
                    </span>
                    {/* Action button: Edit Laporan */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(report)}
                      title="Edit Laporan Kinerja"
                      className="px-2.5 py-1 rounded-lg bg-[#f6f3ea] hover:bg-[#d4af37]/20 text-[#5C4300] text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer border border-[#d0c5af]/30"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#fcf9f0] p-3.5 sm:p-4 rounded-xl border border-[#d0c5af]/15 space-y-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#6B4F1D] block">
                      Detail Kegiatan
                    </span>
                    <p className="text-xs sm:text-sm text-[#1c1c17] mt-0.5 leading-relaxed font-body whitespace-pre-line">
                      {report.detail}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#d0c5af]/15">
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#6B4F1D] block">
                      Hasil / Output Kegiatan
                    </span>
                    <p className="text-xs text-[#5E4B32] mt-0.5 font-medium leading-relaxed whitespace-pre-line">
                      {report.output}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-[#7f7663] px-1 flex-wrap gap-2">
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

      {/* MODAL EDIT LAPORAN KINERJA */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-[#1c1c17]/50 backdrop-blur-sm"
            onClick={() => setEditingReport(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-[2rem] p-5 sm:p-7 shadow-2xl z-10 border border-[#d0c5af]/30 flex flex-col max-h-[92vh] overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#d0c5af]/20 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#735c00]">edit_note</span>
                <h3 className="font-headline font-bold text-base sm:text-lg text-[#1c1c17]">
                  Edit Laporan Kinerja
                </h3>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                aria-label="Tutup edit"
                className="p-1 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="overflow-y-auto py-3 space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                  Tanggal Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-semibold text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                  Detail Kegiatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={editDetail}
                  onChange={(e) => setEditDetail(e.target.value)}
                  placeholder="Deskripsikan pekerjaan yang dilaksanakan..."
                  className="w-full px-3.5 py-2.5 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-body text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                  Hasil / Output Pekerjaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editOutput}
                  onChange={(e) => setEditOutput(e.target.value)}
                  placeholder="Output atau hasil dari kegiatan ini..."
                  className="w-full px-3.5 py-2.5 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-body text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                  Status Verifikasi Laporan
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-semibold text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00]"
                >
                  <option value="TERVERIFIKASI">TERVERIFIKASI (Disetujui)</option>
                  <option value="MENUNGGU">MENUNGGU (Proses Review)</option>
                  <option value="DRAFT">DRAFT (Catatan Awal)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#d0c5af]/20">
                {deleteConfirmId === editingReport.id ? (
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <span className="text-[11px] text-red-600 font-bold">Hapus laporan ini?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(editingReport.id)}
                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(editingReport.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span className="material-symbols-outlined text-base">delete_outline</span>
                    <span>Hapus Laporan</span>
                  </button>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingReport(null)}
                    className="px-4 py-2.5 bg-[#f6f3ea] hover:bg-[#ebe8df] text-[#4d4635] font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#735c00] hover:bg-[#5e4b00] text-white font-headline font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
