import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AttendanceRecord, DesaLicense, WorkReport } from '../types/index.ts';


// Configured Supabase project credentials for sigap-desa
export const DEFAULT_SUPABASE_URL = 'https://auycogwypzcikxfyrrau.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eWNvZ3d5cHpjaWt4ZnlycmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NTAzNzEsImV4cCI6MjEwODMyNjM3MX0.WIjnshro4hRhZQU7Eyx_wQFMcNoa7EPgjXH6Mo43z-A';

export const DEFAULT_EMPLOYEE_UUID = 'b0000000-0000-0000-0000-000000000001';

export function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getSupabaseCredentials(): { url: string; key: string } {
  let localUrl = '';
  let localKey = '';
  try {
    if (typeof window !== 'undefined') {
      localUrl = localStorage.getItem('sigap_supabase_url') || '';
      localKey = localStorage.getItem('sigap_supabase_anon_key') || '';
    }
  } catch {
    // ignore
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const rawUrl = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const key = (localKey || envKey || DEFAULT_SUPABASE_ANON_KEY).trim();
  const url = normalizeSupabaseUrl(rawUrl);

  return { url, key };
}

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    !url.includes('YOUR_PROJECT_ID')
  );
};

// Singleton Client instance to avoid multiple GoTrueClient warnings
let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!isSupabaseConfigured()) return null;

  if (cachedClient && cachedUrl === url && cachedKey === key) {
    return cachedClient;
  }

  try {
    cachedUrl = url;
    cachedKey = key;
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedClient;
  } catch (e) {
    console.warn('Failed to create Supabase client:', e);
    return null;
  }
}

export const supabase: SupabaseClient | null = getSupabaseClient();

export interface TenantInfo {

  id: string;
  kodeDesa: string;
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi?: string;
  licenseKey?: string;
  officeLat: number;
  officeLng: number;
  allowedRadiusMeters: number;
  jamMasuk?: string;
  jamPulang?: string;
  toleransiMenit?: number;
  contactPhone?: string;
  contactPerson?: string;
  adminEmail?: string;
  logoUrl?: string;
}

// Pre-configured Production Tenants for Multi-Desa Testing
export const SAMPLE_TENANTS: TenantInfo[] = [
  // 1. DESA PONCOL
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    kodeDesa: '35.20.04.2001',
    namaDesa: 'Desa Poncol',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-PCL3520-2025-8841',
    officeLat: -7.712345,
    officeLng: 111.234567,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@poncol.desa.go.id',
  },
  // 2. DESA GONGGANG
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    kodeDesa: '35.20.04.2002',
    namaDesa: 'Desa Gonggang',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-GGG3520-2025-1102',
    officeLat: -7.726512,
    officeLng: 111.248231,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@gonggang.desa.go.id',
  },
  // 3. DESA GENILANGIT
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    kodeDesa: '35.20.04.2003',
    namaDesa: 'Desa Genilangit',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-GNL3520-2025-3304',
    officeLat: -7.701245,
    officeLng: 111.218542,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@genilangit.desa.go.id',
  },
  // 4. DESA JANGGAN
  {
    id: 'c0000000-0000-0000-0000-000000000009',
    kodeDesa: '35.20.04.2004',
    namaDesa: 'Desa Janggan',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-JGG3520-2025-4421',
    officeLat: -7.695420,
    officeLng: 111.239108,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@janggan.desa.go.id',
  },
  // 5. DESA CILENG
  {
    id: 'c0000000-0000-0000-0000-000000000010',
    kodeDesa: '35.20.04.2005',
    namaDesa: 'Desa Cileng',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-CLG3520-2025-5532',
    officeLat: -7.734110,
    officeLng: 111.226840,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@cileng.desa.go.id',
  },
  // 6. DESA SOMBO
  {
    id: 'c0000000-0000-0000-0000-000000000011',
    kodeDesa: '35.20.04.2006',
    namaDesa: 'Desa Sombo',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-SMB3520-2025-6675',
    officeLat: -7.741520,
    officeLng: 111.251430,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@sombo.desa.go.id',
  },
  // 7. DESA SUKOREJO
  {
    id: 'c0000000-0000-0000-0000-000000000012',
    kodeDesa: '35.20.04.2007',
    namaDesa: 'Desa Sukorejo',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-SKR3520-2025-7789',
    officeLat: -7.683510,
    officeLng: 111.261240,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@sukorejo.desa.go.id',
  },
  // 8. DESA PLANGKRONGAN
  {
    id: 'c0000000-0000-0000-0000-000000000013',
    kodeDesa: '35.20.04.2008',
    namaDesa: 'Desa Plangkrongan',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-PLG3520-2025-8890',
    officeLat: -7.718840,
    officeLng: 111.272150,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@plangkrongan.desa.go.id',
  },
  // 9. DESA KEDUNGPRAHU (NGAWI)
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    kodeDesa: '35.21.03.2002',
    namaDesa: 'Desa Kedungprahu',
    kecamatan: 'Padas',
    kabupaten: 'Ngawi',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-KDP3521-2025-4299',
    officeLat: -7.41285,
    officeLng: 111.51239,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@kedungprahu.desa.go.id',
  },
  // 10. DESA SUKAMAJU (BOGOR)
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    kodeDesa: '32.01.01.2001',
    namaDesa: 'Desa Sukamaju',
    kecamatan: 'Cilodong',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    licenseKey: 'SIGAP-SKM3201-2025-1024',
    officeLat: -6.175392,
    officeLng: 106.827153,
    allowedRadiusMeters: 50,
    jamMasuk: '08:00',
    jamPulang: '16:00',
    toleransiMenit: 15,
    contactPhone: '085150617732',
    adminEmail: 'admin@sukamaju.desa.go.id',
  },
];

/**
 * Ensures a valid UUID format for PostgreSQL UUID column
 */
function toValidUUID(id?: string, fallback: string = DEFAULT_EMPLOYEE_UUID): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return fallback;
}

/**
 * Fetch live tenants & licenses from Supabase
 */
export async function fetchLiveTenants(): Promise<TenantInfo[]> {
  const client = getSupabaseClient();
  if (!client) return SAMPLE_TENANTS;

  try {
    // 1. Try to fetch from desa_licenses first
    const { data: licenseData, error: licErr } = await client
      .from('desa_licenses')
      .select('*')
      .order('nama_desa', { ascending: true });

    if (!licErr && licenseData && licenseData.length > 0) {
      return licenseData.map((d: any) => ({
        id: d.id,
        kodeDesa: d.kode_desa,
        namaDesa: d.nama_desa,
        kecamatan: d.kecamatan,
        kabupaten: d.kabupaten,
        provinsi: d.provinsi,
        licenseKey: d.license_key,
        officeLat: Number(d.office_lat) || -7.712345,
        officeLng: Number(d.office_lng) || 111.234567,
        allowedRadiusMeters: Number(d.allowed_radius_meters) || 50,
        jamMasuk: d.jam_masuk || '07:30',
        jamPulang: d.jam_pulang || '15:30',
        toleransiMenit: Number(d.toleransi_menit) || 15,
        contactPhone: d.contact_phone || '085150617732',
        adminEmail: d.admin_email,
      }));
    }

    // 2. Fallback to tenants table
    const { data, error } = await client
      .from('tenants')
      .select('*')
      .order('nama_desa', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        kodeDesa: d.kode_desa,
        namaDesa: d.nama_desa,
        kecamatan: d.kecamatan,
        kabupaten: d.kabupaten,
        provinsi: d.provinsi || 'Indonesia',
        licenseKey: d.license_key || `SIGAP-${(d.kode_desa || 'DESA').replace(/[^0-9]/g, '')}-2025`,
        officeLat: Number(d.office_lat) || -7.712345,
        officeLng: Number(d.office_lng) || 111.234567,
        allowedRadiusMeters: Number(d.allowed_radius_meters) || 50,
        jamMasuk: d.jam_masuk || '07:30',
        jamPulang: d.jam_pulang || '15:30',
        toleransiMenit: Number(d.toleransi_menit) || 15,
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch live tenants:', err);
  }

  return SAMPLE_TENANTS;
}

/**
 * Save or update a village license directly to Supabase
 */
export async function saveDesaLicenseToSupabase(license: DesaLicense): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error: licError } = await client.from('desa_licenses').upsert([
      {
        id: license.id,
        kode_desa: license.kodeDesa,
        nama_desa: license.namaDesa,
        kecamatan: license.kecamatan,
        kabupaten: license.kabupaten,
        provinsi: license.provinsi,
        license_key: license.licenseKey,
        license_type: license.licenseType,
        status: license.status,
        issued_by: license.issuedBy,
        issued_date: license.issuedDate,
        valid_until: license.validUntil,
        contact_person: license.contactPerson,
        contact_phone: license.contactPhone,
        admin_email: license.adminEmail,
        office_lat: license.officeLat,
        office_lng: license.officeLng,
        allowed_radius_meters: license.allowedRadiusMeters,
        jam_masuk: license.jamMasuk,
        jam_pulang: license.jamPulang,
        toleransi_menit: license.toleransiMenit,
      },
    ]);

    // Also mirror to tenants table
    await client.from('tenants').upsert([
      {
        id: license.id,
        kode_desa: license.kodeDesa,
        nama_desa: license.namaDesa,
        kecamatan: license.kecamatan,
        kabupaten: license.kabupaten,
        office_name: `Kantor Balai ${license.namaDesa}`,
        office_lat: license.officeLat,
        office_lng: license.officeLng,
        allowed_radius_meters: license.allowedRadiusMeters,
      },
    ]);

    return !licError;
  } catch (e) {
    console.warn('Error saving license to Supabase:', e);
    return false;
  }
}


/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const creds = getSupabaseCredentials();
    const rawUrl = customUrl || creds.url;
    const url = normalizeSupabaseUrl(rawUrl);
    const key = customKey || creds.key;

    if (!url || !key) {
      return { success: false, message: 'URL atau API Key masih kosong.' };
    }

    const testClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    const { data, error } = await testClient
      .from('tenants')
      .select('id, nama_desa')
      .limit(5);

    if (error) {
      return { success: false, message: `Error Supabase: ${error.message}` };
    }

    const desaNames = data?.map((d: any) => d.nama_desa).join(', ');
    return {
      success: true,
      message: `Berhasil terhubung! Database online. (${data?.length || 0} Desa: ${desaNames})`,
    };
  } catch (err: any) {
    return { success: false, message: `Gagal terhubung: ${err.message || 'Cek URL dan Anon Key'}` };
  }
}

/**
 * Fetch attendance records for a specific tenant
 */
export async function fetchAttendanceFromSupabase(
  tenantId: string
): Promise<AttendanceRecord[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const validTenantId = toValidUUID(tenantId, SAMPLE_TENANTS[0].id);
    const { data, error } = await client
      .from('attendance_records')
      .select('*')
      .eq('tenant_id', validTenantId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, using fallback:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        date: item.date,
        dayName: item.day_name || 'Hari Kerja',
        formattedDate: item.formatted_date || item.date,
        status: item.status,
        checkInTime: item.check_in_time,
        checkOutTime: item.check_out_time,
        note: item.note,
        locationName: item.location_name || 'Gedung Pusat SIGAP',
        distanceMeters: item.distance_meters || 10,
        latitude: item.latitude,
        longitude: item.longitude,
        verified: item.verified ?? true,
      }));
    }
  } catch (err) {
    console.warn('Network error reaching Supabase:', err);
  }

  return null;
}

/**
 * Insert new attendance record to Supabase
 */
export async function insertAttendanceToSupabase(
  record: AttendanceRecord,
  tenantId: string,
  employeeId?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const validTenantId = toValidUUID(tenantId, SAMPLE_TENANTS[0].id);
    const validEmployeeId = toValidUUID(employeeId, DEFAULT_EMPLOYEE_UUID);

    const { error } = await client.from('attendance_records').insert([
      {
        tenant_id: validTenantId,
        employee_id: validEmployeeId,
        date: record.date,
        day_name: record.dayName,
        formatted_date: record.formattedDate,
        status: record.status,
        check_in_time: record.checkInTime,
        check_out_time: record.checkOutTime,
        note: record.note,
        location_name: record.locationName,
        distance_meters: record.distanceMeters,
        latitude: record.latitude,
        longitude: record.longitude,
        verified: record.verified,
      },
    ]);

    if (error) {
      console.warn('Error saving attendance to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception saving to Supabase:', err);
    return false;
  }
}

/**
 * Fetch daily work reports for a specific tenant
 */
export async function fetchWorkReportsFromSupabase(
  tenantId: string
): Promise<WorkReport[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const validTenantId = toValidUUID(tenantId, SAMPLE_TENANTS[0].id);
    const { data, error } = await client
      .from('work_reports')
      .select('*')
      .eq('tenant_id', validTenantId)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch reports error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        date: item.date,
        detail: item.detail,
        output: item.output,
        timestamp: item.timestamp,
        location: item.location,
        status: item.status,
      }));
    }
  } catch (err) {
    console.warn('Network error reaching Supabase:', err);
  }

  return null;
}

/**
 * Insert new work report to Supabase
 */
export async function insertWorkReportToSupabase(
  report: WorkReport,
  tenantId: string,
  employeeId?: string
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const validTenantId = toValidUUID(tenantId, SAMPLE_TENANTS[0].id);
    const validEmployeeId = toValidUUID(employeeId, DEFAULT_EMPLOYEE_UUID);

    const { error } = await client.from('work_reports').insert([
      {
        tenant_id: validTenantId,
        employee_id: validEmployeeId,
        date: report.date,
        detail: report.detail,
        output: report.output,
        timestamp: report.timestamp,
        location: report.location,
        status: report.status,
      },
    ]);

    if (error) {
      console.warn('Error saving report to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception saving report to Supabase:', err);
    return false;
  }
}
