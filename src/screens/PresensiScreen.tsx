import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, UserProfile } from '../types/index.ts';
import { RADAR_MAP_URL } from '../data/mockData.ts';
import { formatTimeWIB } from '../utils/presence.ts';
import { TenantInfo } from '../services/supabase.ts';

interface PresensiScreenProps {
  user: UserProfile;
  selectedTenant?: TenantInfo;
  attendanceRecords?: AttendanceRecord[];
  isInsideRadius: boolean;
  distanceMeters: number;
  onPresensiSuccess: (record: AttendanceRecord) => void;
  onNavigateRekap: () => void;
}

export const PresensiScreen: React.FC<PresensiScreenProps> = ({
  user,
  selectedTenant,
  attendanceRecords = [],
  isInsideRadius,
  distanceMeters,
  onPresensiSuccess,
  onNavigateRekap,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const existingTodayRecord = attendanceRecords.find(
    (r) => r.date === todayIso && (!r.employeeId || r.employeeId === user.id)
  );
  const isAlreadyPresensiToday = Boolean(existingTodayRecord);

  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(
    existingTodayRecord?.status || 'HADIR'
  );
  const [note, setNote] = useState('');
  const [tujuanDinas, setTujuanDinas] = useState('');
  const [serverTime, setServerTime] = useState(formatTimeWIB(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<AttendanceRecord | null>(null);

  // Live ticking server clock
  useEffect(() => {
    const timer = setInterval(() => {
      setServerTime(formatTimeWIB(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // STRICT RULE: Maksimal 1 kali presensi per hari
    if (isAlreadyPresensiToday) return;

    setIsSubmitting(true);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const formattedDate = `${dayName}, ${now.getDate()} ${monthName}`;
    const isoDate = now.toISOString().split('T')[0];

    const isDinas = selectedStatus === 'DINAS';
    const isHadir = selectedStatus === 'HADIR';

    let calculatedLocation = isInsideRadius
      ? selectedTenant?.namaDesa
        ? `Kantor Balai ${selectedTenant.namaDesa}`
        : user.instansi || 'Kantor Balai Desa'
      : 'Luar Radius Kantor Balai Desa';

    if (isDinas) {
      calculatedLocation = tujuanDinas.trim()
        ? `Perjalanan Dinas: ${tujuanDinas.trim()}`
        : 'Lokasi Perjalanan Dinas Luar';
    }

    let calculatedNote = note.trim() || undefined;
    if (isDinas) {
      calculatedNote = `[Perjalanan Dinas] ${
        tujuanDinas.trim() ? `Tujuan: ${tujuanDinas.trim()}` : 'Tugas Luar Kantor'
      }`;
    } else if (selectedStatus === 'IZIN' && !calculatedNote) {
      calculatedNote = 'Keperluan Keluarga';
    } else if (selectedStatus === 'SAKIT' && !calculatedNote) {
      calculatedNote = 'Surat Dokter Terlampir';
    }

    const officialLat = selectedTenant?.officeLat ?? -7.712345;
    const officialLng = selectedTenant?.officeLng ?? 111.234567;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: isoDate,
      dayName,
      formattedDate,
      status: selectedStatus,
      checkInTime: isHadir || isDinas ? timeStr : undefined,
      checkOutTime: isHadir || isDinas ? '17:00' : undefined,
      note: calculatedNote,
      locationName: calculatedLocation,
      distanceMeters: isDinas ? 0 : distanceMeters,
      latitude: isHadir ? officialLat : isDinas ? officialLat + 0.012 : undefined,
      longitude: isHadir ? officialLng : isDinas ? officialLng + 0.015 : undefined,
      verified: true,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRecord(newRecord);
      onPresensiSuccess(newRecord);
    }, 450);
  };

  return (
    <main
      className="pt-20 sm:pt-24 px-3 sm:px-6 max-w-lg mx-auto min-h-screen flex flex-col gap-5 sm:gap-6 animate-fadeIn w-full overflow-hidden"
      style={{ paddingBottom: 'calc(5rem + 32px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Welcome Section */}
      <section className="flex flex-col gap-1">
        <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#1c1c17] tracking-tight leading-[1.2]">
          Input Presensi Aparatur
        </h2>
        <p className="text-[#5E4B32] font-medium text-xs sm:text-sm leading-relaxed">
          Pilih status kehadiran atau tugas kedinasan Anda hari ini.
        </p>
      </section>

      {/* NOTIFIKASI: PRESENSI 1 KALI SEHARI TELAH TERPENUHI */}
      {isAlreadyPresensiToday && existingTodayRecord && (
        <section className="p-4 sm:p-5 rounded-2xl bg-[#fcf9f0] border-2 border-[#d4af37] shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-sm sm:text-base text-[#1c1c17]">
                Presensi Hari Ini Telah Terekam
              </h4>
              <p className="text-[11px] font-semibold text-[#735c00] uppercase tracking-wider">
                Aturan Sistem: Maksimal 1 Kali Presensi Per Hari
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#d0c5af]/30 text-xs space-y-2 text-[#4d4635]">
            <div className="flex justify-between items-center">
              <span className="text-[#7f7663]">Status Tercatat:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  existingTodayRecord.status === 'HADIR'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : existingTodayRecord.status === 'DINAS'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {existingTodayRecord.status === 'DINAS' ? 'PERJALANAN DINAS' : existingTodayRecord.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7f7663]">Waktu Presensi:</span>
              <span className="font-mono font-bold text-[#1c1c17]">
                {existingTodayRecord.checkInTime ? `${existingTodayRecord.checkInTime} WIB` : 'Tercatat'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7f7663]">Titik Lokasi:</span>
              <span className="font-semibold text-[#1c1c17] truncate max-w-[220px] text-right">
                {existingTodayRecord.locationName}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-[#805533] italic">
              🔒 Data absensi Anda hari ini telah terkunci otomatis demi keabsahan data.
            </span>
            <button
              type="button"
              onClick={onNavigateRekap}
              className="px-3 py-1.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-xs">history</span>
              <span>Buka Rekap</span>
            </button>
          </div>
        </section>
      )}

      {/* Attendance Status Toggles (4 Options) */}
      <section className="grid grid-cols-1 gap-2.5 sm:gap-3">
        {/* 1. HADIR DI BALAI DESA */}
        <button
          type="button"
          onClick={() => setSelectedStatus('HADIR')}
          aria-label="Pilih Status Hadir"
          className={`flex items-center justify-between px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-2xl transition-all duration-150 active:scale-[0.98] cursor-pointer border ${
            selectedStatus === 'HADIR'
              ? 'bg-[#DCFCE7] text-[#15803D] border-2 border-[#15803D] shadow-md shadow-[#15803D]/15'
              : 'bg-white border-[#d0c5af]/30 text-[#5E4B32] hover:bg-[#f6f3ea]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                selectedStatus === 'HADIR' ? 'bg-[#15803D] text-white' : 'bg-[#DCFCE7] text-[#15803D]'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{
                  fontVariationSettings: selectedStatus === 'HADIR' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                check_circle
              </span>
            </div>
            <div className="text-left min-w-0 flex-1">
              <span className={`font-headline font-bold text-sm sm:text-base tracking-wide uppercase block ${
                selectedStatus === 'HADIR' ? 'text-[#15803D]' : 'text-[#1c1c17]'
              }`}>
                Hadir
              </span>
              <span className={`text-[11px] sm:text-xs block font-medium leading-snug ${
                selectedStatus === 'HADIR' ? 'text-[#15803D]/90' : 'text-[#5E4B32]'
              }`}>
                Presensi langsung di Kantor Balai Desa (Geofence ≤50m)
              </span>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedStatus === 'HADIR' ? 'border-[#15803D]' : 'border-[#d0c5af]/60'
            }`}
          >
            {selectedStatus === 'HADIR' && <div className="w-2.5 h-2.5 bg-[#15803D] rounded-full"></div>}
          </div>
        </button>

        {/* 2. PERJALANAN DINAS (NEW) */}
        <button
          type="button"
          onClick={() => setSelectedStatus('DINAS')}
          aria-label="Pilih Status Perjalanan Dinas"
          className={`flex items-center justify-between px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-2xl transition-all duration-150 active:scale-[0.98] cursor-pointer border ${
            selectedStatus === 'DINAS'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border-blue-700'
              : 'bg-white border-[#d0c5af]/30 text-[#5E4B32] hover:bg-blue-50/50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                selectedStatus === 'DINAS' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{
                  fontVariationSettings: selectedStatus === 'DINAS' ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                business_center
              </span>
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-headline font-bold text-sm sm:text-base tracking-wide uppercase">
                  Perjalanan Dinas
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    selectedStatus === 'DINAS'
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Tugas Luar
                </span>
              </div>
              <span className={`text-[11px] sm:text-xs block font-medium leading-snug ${selectedStatus === 'DINAS' ? 'text-blue-100' : 'text-[#5E4B32]'}`}>
                Bebas Geofence
              </span>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedStatus === 'DINAS' ? 'border-white' : 'border-[#d0c5af]/60'
            }`}
          >
            {selectedStatus === 'DINAS' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
          </div>
        </button>

        {/* 3. IZIN */}
        <button
          type="button"
          onClick={() => setSelectedStatus('IZIN')}
          aria-label="Pilih Status Izin"
          className={`flex items-center justify-between px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-2xl transition-all duration-150 active:scale-[0.98] cursor-pointer border ${
            selectedStatus === 'IZIN'
              ? 'bg-[#FEF3C7] text-[#B45309] border-2 border-[#B45309] shadow-md shadow-[#B45309]/15'
              : 'bg-white border-[#d0c5af]/30 text-[#5E4B32] hover:bg-[#f6f3ea]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                selectedStatus === 'IZIN' ? 'bg-[#B45309] text-white' : 'bg-[#FEF3C7] text-[#B45309]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">description</span>
            </div>
            <div className="text-left min-w-0 flex-1">
              <span className={`font-headline font-bold text-sm sm:text-base tracking-wide uppercase block ${
                selectedStatus === 'IZIN' ? 'text-[#B45309]' : 'text-[#1c1c17]'
              }`}>
                Izin
              </span>
              <span className={`text-[11px] sm:text-xs block font-medium leading-snug ${
                selectedStatus === 'IZIN' ? 'text-[#B45309]/90' : 'text-[#5E4B32]'
              }`}>
                Keperluan keluarga, cuti dinas, atau halangan pribadi
              </span>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedStatus === 'IZIN' ? 'border-[#B45309]' : 'border-[#d0c5af]/60'
            }`}
          >
            {selectedStatus === 'IZIN' && <div className="w-2.5 h-2.5 bg-[#B45309] rounded-full"></div>}
          </div>
        </button>

        {/* 4. SAKIT */}
        <button
          type="button"
          onClick={() => setSelectedStatus('SAKIT')}
          aria-label="Pilih Status Sakit"
          className={`flex items-center justify-between px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-2xl transition-all duration-150 active:scale-[0.98] cursor-pointer border ${
            selectedStatus === 'SAKIT'
              ? 'bg-[#FFE4E6] text-[#BE123C] border-2 border-[#BE123C] shadow-md shadow-[#BE123C]/15'
              : 'bg-white border-[#d0c5af]/30 text-[#5E4B32] hover:bg-[#f6f3ea]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                selectedStatus === 'SAKIT' ? 'bg-[#BE123C] text-white' : 'bg-[#FFE4E6] text-[#BE123C]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">medical_services</span>
            </div>
            <div className="text-left min-w-0 flex-1">
              <span className={`font-headline font-bold text-sm sm:text-base tracking-wide uppercase block ${
                selectedStatus === 'SAKIT' ? 'text-[#BE123C]' : 'text-[#1c1c17]'
              }`}>
                Sakit
              </span>
              <span className={`text-[11px] sm:text-xs block font-medium leading-snug ${
                selectedStatus === 'SAKIT' ? 'text-[#BE123C]/90' : 'text-[#5E4B32]'
              }`}>
                Keterangan sakit / melampirkan surat dokter
              </span>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
              selectedStatus === 'SAKIT' ? 'border-[#BE123C]' : 'border-[#d0c5af]/60'
            }`}
          >
            {selectedStatus === 'SAKIT' && <div className="w-2.5 h-2.5 bg-[#BE123C] rounded-full"></div>}
          </div>
        </button>
      </section>

      {/* FORM KHUSUS PERJALANAN DINAS */}
      {selectedStatus === 'DINAS' && (
        <section className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-5 border-2 border-blue-200/80 space-y-3.5 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-lg text-blue-700">commute</span>
            <span>Tujuan Perjalanan Dinas</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.06em] text-blue-900 mb-1.5">
                Tujuan / Instansi / Tempat Penugasan Dinas
              </label>
              <input
                type="text"
                value={tujuanDinas}
                onChange={(e) => setTujuanDinas(e.target.value)}
                placeholder="Contoh: Rapat di Kantor Camat Poncol / Bapemasda Kab. Magetan"
                className="w-full bg-white border border-[#E5D9C3] rounded-xl p-3 text-xs text-[#1c1c17] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] focus:outline-none font-medium placeholder-[#8A7A66] transition-all"
                required
              />
            </div>

            <div className="p-3 bg-blue-100/70 rounded-xl border border-blue-200/80 text-xs text-blue-950 flex items-start gap-2 leading-relaxed">
              <span className="material-symbols-outlined text-base text-blue-700 shrink-0 mt-0.5">
                verified
              </span>
              <span>
                <strong>Dispensasi Radius Geofence Aktif:</strong> Aparatur yang sedang bertugas ke luar balai desa tidak dikenakan pembatasan radius kantor balai. Cukup isi tujuan dinas Anda, presensi otomatis diverifikasi sebagai kehadiran aktif resmi.
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Note Input if Izin or Sakit */}
      {(selectedStatus === 'IZIN' || selectedStatus === 'SAKIT') && (
        <section className="bg-white rounded-2xl p-4 border border-[#d0c5af]/30 space-y-2 animate-fadeIn">
          <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D]">
            {selectedStatus === 'IZIN'
              ? 'Alasan Izin Keperluan Pribadi / Keluarga'
              : 'Keterangan Sakit / Rumah Sakit'}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              selectedStatus === 'IZIN'
                ? 'Masukkan alasan izin keperluan pribadi...'
                : 'Surat dokter terlampir...'
            }
            className="w-full bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl p-3 text-xs text-[#1c1c17] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] focus:outline-none placeholder-[#8A7A66] transition-all"
          />
        </section>
      )}

      {/* Location Card */}
      <section className="bg-[#f6f3ea] rounded-2xl p-5 flex flex-col gap-4 border border-[#d0c5af]/20 shadow-sm">
        {/* Panel GPS: 2 baris terpisah dengan jarak jelas */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="relative flex h-3 w-3 mt-1 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  selectedStatus === 'DINAS' ? 'bg-blue-600' : 'bg-[#15803D]'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  selectedStatus === 'DINAS' ? 'bg-blue-600' : 'bg-[#15803D]'
                }`}
              ></span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-headline text-sm font-bold text-[#1c1c17]">
                {selectedStatus === 'DINAS' ? 'GPS Penugasan Dinas' : 'GPS Aktif'}
              </span>
              <span className="font-body text-xs text-[#5E4B32] font-medium">
                {selectedStatus === 'DINAS'
                  ? 'Dispensasi Radius Kantor • Bebas Geofence'
                  : `Akurasi ±2.4 m • ${distanceMeters} m dari titik`}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 text-[#6B4F1D] border border-[#d0c5af]/30 shrink-0">
            {selectedStatus === 'DINAS' ? 'Tugas Luar' : 'Geofence Balai'}
          </span>
        </div>

        <div className="relative h-36 w-full rounded-xl overflow-hidden grayscale-[0.2] contrast-[1.1] border border-[#d0c5af]/20">
          <img alt="Peta radar lokasi" className="w-full h-full object-cover" src={RADAR_MAP_URL} />
          <div className="absolute inset-0 bg-[#735c00]/10 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 ${
                selectedStatus === 'DINAS'
                  ? 'bg-blue-600 text-white border-white'
                  : 'bg-white text-[#735c00] border-[#d4af37]'
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {selectedStatus === 'DINAS' ? 'business_center' : 'person_pin_circle'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span
            className="material-symbols-outlined text-[#d4af37]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            location_on
          </span>
          <div className="flex flex-col">
            <p className="font-body text-xs font-bold text-[#1c1c17] flex items-center gap-1.5">
              <span>{selectedStatus === 'DINAS' ? 'Lokasi Penugasan Dinas Luar' : 'Lokasi Terdaftar (Google Maps)'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
            <p className="font-body text-[11px] text-[#4d4635] leading-tight">
              {selectedStatus === 'DINAS'
                ? tujuanDinas.trim() || 'Titik penugasan perjalanan dinas di luar balai desa'
                : selectedTenant
                ? `Kantor Balai ${selectedTenant.namaDesa}, Kec. ${selectedTenant.kecamatan || 'Poncol'}, Kab. ${selectedTenant.kabupaten || 'Magetan'}`
                : user.instansi}
            </p>
            {selectedStatus !== 'DINAS' && (
              <p className="text-[10px] text-[#735c00] font-mono mt-0.5">
                GPS: {selectedTenant?.officeLat ?? -7.712345}, {selectedTenant?.officeLng ?? 111.234567} (Radius &le;{selectedTenant?.allowedRadiusMeters ?? 50}m)
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Action Button */}
      <footer className="mt-auto pt-2 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isAlreadyPresensiToday}
          aria-label={
            isAlreadyPresensiToday
              ? 'Presensi Hari Ini Telah Selesai'
              : selectedStatus === 'DINAS'
              ? 'Kirim Presensi Perjalanan Dinas'
              : 'Kirim Presensi Kehadiran'
          }
          className={`w-full h-14 rounded-xl font-headline font-extrabold text-base transition-all duration-150 flex items-center justify-center gap-3 ${
            isAlreadyPresensiToday
              ? 'bg-[#f6f3ea] text-[#7f7663] border border-[#d0c5af]/50 cursor-not-allowed shadow-none'
              : selectedStatus === 'DINAS'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] cursor-pointer shadow-lg'
              : 'bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white shadow-[#735c00]/30 hover:shadow-[#735c00]/40 active:scale-[0.98] cursor-pointer shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
          ) : isAlreadyPresensiToday ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5C4300] font-bold">
              <span className="material-symbols-outlined text-emerald-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span>Sudah Presensi Hari Ini (1 Kali / Hari)</span>
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined">
                {selectedStatus === 'DINAS' ? 'commute' : 'send'}
              </span>
              <span>
                {selectedStatus === 'DINAS'
                  ? 'Kirim Presensi Perjalanan Dinas'
                  : 'Kirim Presensi Kehadiran'}
              </span>
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-[#805533] font-label uppercase tracking-tighter opacity-80">
          Waktu Server: {serverTime} {isAlreadyPresensiToday && '• Status: Selesai'}
        </p>
      </footer>

      {/* Floating Toast Notification on Success */}
      {submittedRecord && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2 bg-[#15803D] text-white rounded-full shadow-lg text-xs font-semibold animate-fadeIn"
        >
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Presensi berhasil dikirim</span>
        </div>
      )}

      {/* Presensi Success Confirmation Modal */}
      {submittedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#1c1c17]/50 backdrop-blur-sm"
            onClick={() => setSubmittedRecord(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl z-10 border border-[#d0c5af]/25 text-center space-y-4 animate-scaleUp">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
                submittedRecord.status === 'DINAS'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {submittedRecord.status === 'DINAS' ? 'business_center' : 'check_circle'}
              </span>
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-xl text-[#1c1c17]">
                {submittedRecord.status === 'DINAS'
                  ? 'Presensi Dinas Berhasil!'
                  : 'Presensi Berhasil Dikirim!'}
              </h3>
              <p className="text-xs text-[#4d4635] mt-1">
                {submittedRecord.status === 'DINAS'
                  ? 'Kehadiran perjalanan dinas luar terverifikasi dengan dispensasi geofence.'
                  : 'Data kehadiran aparatur desa telah terverifikasi di server desa.'}
              </p>
            </div>

            <div className="bg-[#fcf9f0] p-4 rounded-2xl text-xs space-y-2 text-left border border-[#d0c5af]/20">
              <div className="flex justify-between items-center">
                <span className="text-[#7f7663]">Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    submittedRecord.status === 'DINAS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {submittedRecord.status === 'DINAS' ? 'PERJALANAN DINAS' : submittedRecord.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7f7663]">Tanggal</span>
                <span className="font-semibold text-[#1c1c17]">
                  {submittedRecord.formattedDate}
                </span>
              </div>
              {submittedRecord.checkInTime && (
                <div className="flex justify-between">
                  <span className="text-[#7f7663]">Waktu Catat</span>
                  <span className="font-semibold text-[#1c1c17]">
                    {submittedRecord.checkInTime} WIB
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#7f7663]">Keterangan</span>
                <span className="font-semibold text-[#1c1c17] truncate max-w-[180px] text-right">
                  {submittedRecord.note || submittedRecord.locationName}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSubmittedRecord(null)}
                className="flex-1 py-3 bg-[#f6f3ea] text-[#1c1c17] rounded-xl text-xs font-bold hover:bg-[#ebe8df] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Selesai
              </button>
              <button
                onClick={() => {
                  setSubmittedRecord(null);
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
