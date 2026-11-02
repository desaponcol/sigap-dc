import React, { useState } from 'react';
import { UserProfile, WorkReport } from '../types/index.ts';
import { validateWorkReport } from '../utils/presence.ts';

interface LaporanScreenProps {
  user: UserProfile;
  onLaporanSuccess: (report: WorkReport) => void;
  onNavigateRekap: () => void;
}

export const LaporanScreen: React.FC<LaporanScreenProps> = ({
  user,
  onLaporanSuccess,
  onNavigateRekap,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [detail, setDetail] = useState('');
  const [output, setOutput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateWorkReport({ date, detail, output });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timestampStr = `${date} ${hours}:${minutes} WIB`;

    const newReport: WorkReport = {
      id: `rep-${Date.now()}`,
      date,
      detail: detail.trim(),
      output: output.trim(),
      timestamp: timestampStr,
      location: 'Kantor Balai Desa Sukamaju',
      status: 'TERVERIFIKASI',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onLaporanSuccess(newReport);
      setShowSuccessModal(true);
      setDetail('');
      setOutput('');
    }, 450);
  };

  const formatIndonesianLongDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <main
      className="pt-24 px-6 max-w-2xl mx-auto animate-fadeIn"
      style={{ paddingBottom: 'calc(5rem + 32px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Editorial Header Section */}
      <div className="mb-10 mt-2">
        <p className="font-headline font-bold text-[#6B4F1D] text-xs tracking-[0.06em] uppercase mb-2">
          LAPORAN INTERNAL
        </p>
        <h2 className="font-headline font-extrabold text-4xl text-[#1c1c17] tracking-tight leading-[1.2]">
          Laporan Kerja Harian
        </h2>
        <p className="text-[#5E4B32] font-body mt-2 text-[15px] leading-relaxed">
          Catat kegiatan dan hasil kerja Anda hari ini.
        </p>
      </div>

      {/* Form Canvas */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_24px_rgba(28,28,23,0.04)] border border-[#d0c5af]/15">
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Date Picker Field */}
          <div className="group">
            <label
              htmlFor="report-date"
              className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-2 px-1"
            >
              Tanggal Kegiatan
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#7f7663]">
                calendar_today
              </span>
              <input
                id="report-date"
                type="date"
                lang="id"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] focus:outline-none text-[#1c1c17] font-medium transition-all"
              />
            </div>
            {date && (
              <p className="text-xs text-[#6B4F1D] font-semibold mt-1.5 pl-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">event</span>
                <span>{formatIndonesianLongDate(date)}</span>
              </p>
            )}
            {errors.date && (
              <p className="text-xs text-red-600 mt-1 pl-1">{errors.date}</p>
            )}
          </div>

          {/* Textarea: Detail Kegiatan */}
          <div className="group">
            <label
              htmlFor="detail-kegiatan"
              className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-2 px-1"
            >
              Detail Kegiatan
            </label>
            <div className="relative">
              <textarea
                id="detail-kegiatan"
                rows={4}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Apa yang Anda kerjakan hari ini?"
                className="w-full bg-[#f6f3ea] border border-[#E5D9C3] rounded-2xl p-5 focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] focus:outline-none text-[#1c1c17] font-body resize-none placeholder-[#8A7A66] transition-all"
              ></textarea>
            </div>
            {errors.detail && (
              <p className="text-xs text-red-600 mt-1 pl-1">{errors.detail}</p>
            )}
          </div>

          {/* Textarea: Hasil/Output */}
          <div className="group">
            <label
              htmlFor="hasil-output"
              className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-2 px-1"
            >
              Hasil / Output
            </label>
            <div className="relative">
              <textarea
                id="hasil-output"
                rows={4}
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Sebutkan pencapaian atau hasil kerja..."
                className="w-full bg-[#f6f3ea] border border-[#E5D9C3] rounded-2xl p-5 focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] focus:outline-none text-[#1c1c17] font-body resize-none placeholder-[#8A7A66] transition-all"
              ></textarea>
            </div>
            {errors.output && (
              <p className="text-xs text-red-600 mt-1 pl-1">{errors.output}</p>
            )}
          </div>

          {/* Spacer & Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Simpan Laporan Harian"
              className="w-full h-[56px] bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white font-headline font-bold text-lg rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  <span>Simpan Laporan</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-[#7f7663] mt-4 font-label">
              Data akan otomatis diberi stempel waktu dan penanda lokasi saat disimpan.
            </p>
          </div>
        </form>
      </div>

      {/* Support Info Bento */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#f6f3ea] p-6 rounded-2xl flex flex-col justify-between border border-[#d0c5af]/20 shadow-sm">
          <span className="material-symbols-outlined text-[#735c00] text-3xl mb-4">
            verified_user
          </span>
          <div>
            <h4 className="font-headline font-bold text-[#1c1c17] text-base">
              Data Aman &amp; Terverifikasi
            </h4>
            <p className="text-xs text-[#4d4635] mt-1 leading-relaxed">
              Laporan terenkripsi dan tersimpan di server aman SIGAP.
            </p>
          </div>
        </div>

        <div className="bg-[#ffdcc5]/40 p-6 rounded-2xl flex flex-col justify-between border border-[#fdc39a]/40 shadow-sm">
          <span className="material-symbols-outlined text-[#805533] text-3xl mb-4">
            lightbulb
          </span>
          <div>
            <h4 className="font-headline font-bold text-[#805533] text-base">
              Tips Kerja
            </h4>
            <p className="text-xs text-[#653d1e] mt-1 leading-relaxed">
              Pastikan output bersifat kuantitatif untuk mempermudah evaluasi kinerja.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification on Success */}
      {showSuccessModal && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 bg-[#15803D] text-white rounded-full shadow-lg text-xs font-semibold animate-fadeIn"
        >
          <span className="material-symbols-outlined text-base">task_alt</span>
          <span>Laporan berhasil disimpan</span>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1c1c17]/50 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl z-10 border border-[#d0c5af]/25 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-4xl">
                task_alt
              </span>
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-xl text-[#1c1c17]">
                Laporan Tersimpan!
              </h3>
              <p className="text-xs text-[#4d4635] mt-1">
                Laporan kerja harian Anda telah tersimpan dan terekam dalam rekapitulasi.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-3 bg-[#f6f3ea] text-[#1c1c17] rounded-xl text-xs font-bold hover:bg-[#ebe8df] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Buat Lagi
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateRekap();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Lihat Rekap
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
