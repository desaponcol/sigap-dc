import React from 'react';
import { AttendanceRecord } from '../types/index.ts';

interface AttendanceDetailModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  record,
  onClose,
}) => {
  if (!record) return null;

  const isHadir = record.status === 'HADIR';
  const isDinas = record.status === 'DINAS';
  const isIzin = record.status === 'IZIN';
  const isSakit = record.status === 'SAKIT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1c1c17]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl z-10 border border-[#d0c5af]/25 space-y-5">
        <div className="flex justify-between items-center pb-2 border-b border-[#d0c5af]/20">
          <h3 className="font-headline font-bold text-base text-[#1c1c17]">
            Detail Presensi
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup detail presensi"
            className="p-1 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] transition-all"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
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
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
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
              {isDinas ? 'PERJALANAN DINAS' : record.status}
            </span>
            <h4 className="font-headline font-bold text-lg text-[#1c1c17] mt-1">
              {record.formattedDate}
            </h4>
          </div>
        </div>

        <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/20 space-y-2.5 text-xs">
          {record.checkInTime && (
            <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
              <span className="text-[#7f7663]">Jam Masuk</span>
              <span className="text-[#1c1c17] font-bold">{record.checkInTime} WIB</span>
            </div>
          )}
          {record.checkOutTime && (
            <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
              <span className="text-[#7f7663]">Jam Pulang</span>
              <span className="text-[#1c1c17] font-bold">{record.checkOutTime} WIB</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
            <span className="text-[#7f7663]">Lokasi</span>
            <span className="text-[#1c1c17] font-semibold text-right max-w-[200px]">{record.locationName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
            <span className="text-[#7f7663]">Radius Geofence</span>
            <span className="text-[#1c1c17] font-semibold">
              {isDinas ? 'Dispensasi Perjalanan Dinas' : `${record.distanceMeters}m dari Titik`}
            </span>
          </div>
          {record.note && (
            <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
              <span className="text-[#7f7663]">Keterangan</span>
              <span className="text-[#805533] font-medium text-right max-w-[200px]">{record.note}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-[#7f7663]">Verifikasi</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified</span>
              {isDinas ? 'Tervalidasi Tugas Luar Resmi' : 'Tervalidasi Sistem'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#735c00] text-white font-headline font-bold rounded-xl shadow-md active:scale-95 transition-all text-sm"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
