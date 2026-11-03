/**
 * Presence & Location Utilities for SIGAP Digital Concierge
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Office Coordinate Default (Kantor Balai Desa, Magetan)
export const OFFICE_COORDINATES: Coordinates = {
  latitude: -7.712345,
  longitude: 111.234567, // Titik Balai Desa (Jawa Timur)
};

export const OFFICE_NAME = 'Kantor Balai Desa';
export const OFFICE_ADDRESS = 'Kantor Balai Desa, Jawa Timur';
export const DEFAULT_ALLOWED_RADIUS_METERS = 50;

/**
 * Calculates Haversine distance in meters between two coordinates
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const phi1 = coord1.latitude * rad;
  const phi2 = coord2.latitude * rad;
  const deltaPhi = (coord2.latitude - coord1.latitude) * rad;
  const deltaLambda = (coord2.longitude - coord1.longitude) * rad;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Checks whether user is within allowed radius
 */
export function isWithinRadius(
  distanceMeters: number,
  maxRadiusMeters: number = DEFAULT_ALLOWED_RADIUS_METERS
): boolean {
  return distanceMeters <= maxRadiusMeters;
}

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA' | 'DINAS';

export interface AttendanceRecord {
  id: string;
  tenantId?: string;
  employeeId?: string;
  date: string; // ISO YYYY-MM-DD
  dayName: string;
  formattedDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  note?: string;
  locationName: string;
  distanceMeters: number;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  doctorLetterUrl?: string;
  verified: boolean;
}

export interface WorkReport {
  id: string;
  tenantId?: string;
  employeeId?: string;
  date: string;
  detail: string;
  output: string;
  timestamp: string;
  location: string;
  status: 'TERVERIFIKASI' | 'MENUNGGU' | 'DRAFT';
}

/**
 * Calculate attendance rate and summary
 */
export function calculateAttendanceStats(records: AttendanceRecord[]) {
  const hadir = records.filter((r) => r.status === 'HADIR').length;
  const dinas = records.filter((r) => r.status === 'DINAS').length;
  const izin = records.filter((r) => r.status === 'IZIN').length;
  const sakit = records.filter((r) => r.status === 'SAKIT').length;
  const alpa = records.filter((r) => r.status === 'ALPA').length;
  const total = records.length;

  // Rate considers hadir & dinas as full active presence. If total > 0, percentage = round(((hadir + dinas) / total) * 100)
  const attendanceRatePercentage =
    total > 0 ? Math.round(((hadir + dinas) / total) * 100) : 100;

  return {
    total,
    hadir,
    dinas,
    izin,
    sakit,
    alpa,
    attendanceRatePercentage,
  };
}

/**
 * Format WIB time string
 */
export function formatTimeWIB(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${hours}:${minutes}:${seconds} WIB`;
}

/**
 * Validate daily work report
 */
export function validateWorkReport(data: {
  date?: string;
  detail?: string;
  output?: string;
}): { isValid: boolean; errors: { [key: string]: string } } {
  const errors: { [key: string]: string } = {};

  if (!data.date || data.date.trim() === '') {
    errors.date = 'Tanggal kegiatan harus dipilih';
  }

  if (!data.detail || data.detail.trim().length < 5) {
    errors.detail = 'Detail kegiatan minimal 5 karakter';
  }

  if (!data.output || data.output.trim().length < 3) {
    errors.output = 'Hasil/output minimal 3 karakter';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const INDONESIAN_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonthName(): string {
  return INDONESIAN_MONTHS[new Date().getMonth()];
}

export function getDynamicYearsList(): number[] {
  const current = getCurrentYear();
  return [current - 2, current - 1, current, current + 1];
}

export function formatDynamicIndonesianDate(dateObj: Date = new Date()): {
  isoDate: string;
  dayName: string;
  monthName: string;
  dateNumber: number;
  year: number;
  formattedDate: string;
  fullIndonesianDate: string;
  periodLabel: string;
} {
  const dayName = INDONESIAN_DAYS[dateObj.getDay()];
  const monthName = INDONESIAN_MONTHS[dateObj.getMonth()];
  const dateNumber = dateObj.getDate();
  const year = dateObj.getFullYear();
  const isoDate = dateObj.toISOString().split('T')[0];

  return {
    isoDate,
    dayName,
    monthName,
    dateNumber,
    year,
    formattedDate: `${dayName}, ${dateNumber} ${monthName}`,
    fullIndonesianDate: `${dateNumber} ${monthName} ${year}`,
    periodLabel: `${monthName} ${year}`,
  };
}

/**
 * Sorts Work Reports strictly by date
 * @param ascending If true, oldest to newest (e.g. for PDF monthly chronological report); If false, newest on top (e.g. for app history feed)
 */
export function sortWorkReportsByDate(
  reports: WorkReport[],
  ascending: boolean = false
): WorkReport[] {
  return [...reports].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    if (timeA !== timeB) {
      return ascending ? timeA - timeB : timeB - timeA;
    }
    // Secondary fallback: by timestamp or id
    return ascending
      ? (a.timestamp || '').localeCompare(b.timestamp || '')
      : (b.timestamp || '').localeCompare(a.timestamp || '');
  });
}

/**
 * Sorts Attendance Records strictly by date
 * @param ascending If true, oldest to newest; If false, newest on top
 */
export function sortAttendanceRecordsByDate(
  records: AttendanceRecord[],
  ascending: boolean = false
): AttendanceRecord[] {
  return [...records].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    if (timeA !== timeB) {
      return ascending ? timeA - timeB : timeB - timeA;
    }
    return ascending
      ? (a.checkInTime || '').localeCompare(b.checkInTime || '')
      : (b.checkInTime || '').localeCompare(a.checkInTime || '');
  });
}

/**
 * Check whether a user has already checked in on a specific date (enforcing 1 presensi / hari)
 */
export function hasUserCheckedInToday(
  records: AttendanceRecord[],
  userId?: string,
  targetIsoDate: string = new Date().toISOString().split('T')[0]
): { checkedIn: boolean; record?: AttendanceRecord } {
  const match = records.find(
    (r) =>
      r.date === targetIsoDate &&
      (!userId || !r.employeeId || r.employeeId === userId)
  );
  return {
    checkedIn: Boolean(match),
    record: match,
  };
}

