export type AppScreen = 'login' | 'dashboard' | 'presensi' | 'laporan' | 'rekap' | 'tentang';

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA' | 'DINAS';

export interface DesaLicense {
  id: string;
  kodeDesa: string;
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  licenseKey: string;
  licenseType: 'PRODUCTION_DESA' | 'ENTERPRISE_KABUPATEN' | 'TRIAL_EVALUASI';
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  issuedBy: string; // Arunika Kreatif Media
  issuedDate: string;
  validUntil: string;
  contactPerson: string;
  contactPhone: string;
  adminEmail: string;
  officeLat: number;
  officeLng: number;
  allowedRadiusMeters: number;
  jamMasuk: string;
  jamPulang: string;
  toleransiMenit: number;
  logoUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  nip: string;
  jabatan: string;
  instansi: string;
  avatarUrl: string;
  role: 'admin_desa' | 'pegawai';
  tenantId: string;
  phone?: string;
  desaLicenseKey?: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId?: string;
  employeeId?: string;
  date: string; // YYYY-MM-DD
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

