import { AttendanceRecord, DesaLicense, UserProfile, WorkReport } from '../types/index.ts';
import { getCurrentMonthName, getCurrentYear, INDONESIAN_DAYS } from '../utils/presence.ts';


// Master Developer Key for Arunika Kreatif Media
export const MASTER_DEVELOPER_KEY = 'SIGAP-DEV-MASTER-2025';

// Pre-seeded production licenses for diverse Indonesian villages
export const BASE_PRODUCTION_LICENSES: DesaLicense[] = [
  // 1. DESA PONCOL
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    kodeDesa: '35.20.04.2001',
    namaDesa: 'Desa Poncol',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    licenseKey: 'SIGAP-PCL3520-2025-8841',
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-01',
    validUntil: '2027-12-31',
    contactPerson: 'Siti Rahayu, S.IP (Sekdes / Admin)',
    contactPhone: '085150617732',
    adminEmail: 'admin@poncol.desa.go.id',
    officeLat: -7.712345,
    officeLng: 111.234567,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-10',
    validUntil: '2027-12-31',
    contactPerson: 'Agus Widodo, S.Sos (Sekdes)',
    contactPhone: '085150617732',
    adminEmail: 'admin@gonggang.desa.go.id',
    officeLat: -7.726512,
    officeLng: 111.248231,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-12',
    validUntil: '2027-12-31',
    contactPerson: 'Purnomo Hadi, S.AP (Sekdes)',
    contactPhone: '085150617732',
    adminEmail: 'admin@genilangit.desa.go.id',
    officeLat: -7.701245,
    officeLng: 111.218542,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-15',
    validUntil: '2027-12-31',
    contactPerson: 'Joko Prasetyo, S.IP (Sekdes)',
    contactPhone: '085150617732',
    adminEmail: 'admin@janggan.desa.go.id',
    officeLat: -7.695420,
    officeLng: 111.239108,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-18',
    validUntil: '2027-12-31',
    contactPerson: 'Sri Mulyani, S.Pd (Sekdes)',
    contactPhone: '085150617732',
    adminEmail: 'admin@cileng.desa.go.id',
    officeLat: -7.734110,
    officeLng: 111.226840,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-20',
    validUntil: '2027-12-31',
    contactPerson: 'Bambang Suparno, S.Sos (Sekdes)',
    contactPhone: '085150617732',
    adminEmail: 'admin@sombo.desa.go.id',
    officeLat: -7.741520,
    officeLng: 111.251430,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-22',
    validUntil: '2027-12-31',
    contactPerson: 'Hendra Gunawan, S.AP (Sekdes)',
    contactPhone: '085150617732',
    adminEmail: 'admin@sukorejo.desa.go.id',
    officeLat: -7.683510,
    officeLng: 111.261240,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-25',
    validUntil: '2027-12-31',
    contactPerson: 'Wahyu Hidayat, S.IP (Sekdes)',
    contactPhone: '085150617732',
    adminEmail: 'admin@plangkrongan.desa.go.id',
    officeLat: -7.718840,
    officeLng: 111.272150,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-15',
    validUntil: '2027-12-31',
    contactPerson: 'Bambang Supriyanto, S.Sos',
    contactPhone: '085150617732',
    adminEmail: 'admin@kedungprahu.desa.go.id',
    officeLat: -7.41285,
    officeLng: 111.51239,
    allowedRadiusMeters: 50,
    jamMasuk: '07:30',
    jamPulang: '15:30',
    toleransiMenit: 15,
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
    licenseType: 'PRODUCTION_DESA',
    status: 'ACTIVE',
    issuedBy: 'Arunika Kreatif Media',
    issuedDate: '2025-01-10',
    validUntil: '2027-12-31',
    contactPerson: 'Hendra Wijaya, S.STP',
    contactPhone: '085150617732',
    adminEmail: 'admin@sukamaju.desa.go.id',
    officeLat: -6.175392,
    officeLng: 106.827153,
    allowedRadiusMeters: 50,
    jamMasuk: '08:00',
    jamPulang: '16:00',
    toleransiMenit: 15,
  },
];

// Read from LocalStorage merged with base licenses
export function getRegisteredDesaLicenses(): DesaLicense[] {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sigap_production_licenses');
      if (saved) {
        const parsed: DesaLicense[] = JSON.parse(saved);
        // Merge without duplicates by licenseKey
        const map = new Map<string, DesaLicense>();
        BASE_PRODUCTION_LICENSES.forEach((l) => map.set(l.licenseKey, l));
        parsed.forEach((l) => map.set(l.licenseKey, l));
        return Array.from(map.values());
      }
    }
  } catch (e) {
    console.warn('Failed to parse local licenses:', e);
  }
  return BASE_PRODUCTION_LICENSES;
}

export function saveDesaLicense(license: DesaLicense): void {
  try {
    if (typeof window !== 'undefined') {
      const all = getRegisteredDesaLicenses();
      const updated = [license, ...all.filter((l) => l.licenseKey !== license.licenseKey)];
      localStorage.setItem('sigap_production_licenses', JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save license locally:', e);
  }
}

// Generate new unique official license key
export function generateDesaLicenseKey(kodeDesa: string, namaDesa: string): string {
  const cleanName = namaDesa.replace(/desa|nagari|gampong/gi, '').trim();
  const prefix = cleanName.slice(0, 3).toUpperCase() || 'DES';
  const cleanCode = kodeDesa.replace(/[^0-9]/g, '').slice(0, 4) || '3500';
  const year = new Date().getFullYear();
  const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
  return `SIGAP-${prefix}${cleanCode}-${year}-${randomHex}`;
}

// Generate official dispatch text for WhatsApp notification to Kades/Admin
export function generateOfficialWhatsAppDispatch(license: DesaLicense): string {
  return `*SURAT ELEKTRONIK PENERBITAN LISENSI RESMI SIGAP DESA*
Nomor Registrasi: ${license.licenseKey}
Penerbit: *PT/CV Arunika Kreatif Media*
Tanggal Aktivasi: ${license.issuedDate}

Yth. Kepala Desa & Administrator Sistem
*${license.namaDesa.toUpperCase()}*
Kec. ${license.kecamatan}, Kab. ${license.kabupaten}, ${license.provinsi}

Dengan ini diterbitkan Hak Akses Produksi Sistem Informasi Gaji & Presensi (SIGAP) untuk aparatur desa Anda:

🔑 *KODE LISENSI RESMI DESA:*
\`\`\`${license.licenseKey}\`\`\`

🏢 *Data Balai Desa Terdaftar:*
- Lokasi Kantor: Lat ${license.officeLat}, Lng ${license.officeLng}
- Radius Toleransi: ${license.allowedRadiusMeters} Meter
- Jam Kerja Kantor: ${license.jamMasuk} - ${license.jamPulang} WIB
- Masa Berlaku: s.d ${license.validUntil}

👤 *Akun Administrator Utama:*
- Email: ${license.adminEmail}
- Password Bawaan: admin123 (Harap diganti berkala)

Silakan masukkan *Kode Lisensi Resmi* di atas pada portal login Admin Desa untuk mengelola aparatur dan jadwal kerja.

Bantuan Teknis & Perpanjangan Lisensi:
WhatsApp Resmi: 085150617732
Email: arunikakreatifm@gmail.com
Pengembang: Arunika Kreatif Media`;
}

// Multi-village Demo Official Users
export const DEMO_USERS: (UserProfile & { password: string })[] = [
  // 1. DESA PONCOL
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    name: 'Siti Rahayu, S.IP',
    email: 'admin@poncol.desa.go.id',
    password: 'admin123',
    nip: '19850614 200901 2 003',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Poncol',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000003',
    desaLicenseKey: 'SIGAP-PCL3520-2025-8841',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    name: 'Budi Santoso, S.AP',
    email: 'budi@poncol.desa.go.id',
    password: 'poncol123',
    nip: '19920315 201903 1 004',
    jabatan: 'Kaur Keuangan / Bendahara Desa',
    instansi: 'Kantor Balai Desa Poncol',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000003',
    desaLicenseKey: 'SIGAP-PCL3520-2025-8841',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    name: 'Rina Kusuma Dewi',
    email: 'rina@poncol.desa.go.id',
    password: 'password123',
    nip: '19951120 202203 2 005',
    jabatan: 'Kasi Pelayanan & Kesejahteraan',
    instansi: 'Kantor Balai Desa Poncol',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000003',
    desaLicenseKey: 'SIGAP-PCL3520-2025-8841',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },

  // 2. DESA GONGGANG
  {
    id: 'd0000000-0000-0000-0000-000000000020',
    name: 'Agus Widodo, S.Sos',
    email: 'admin@gonggang.desa.go.id',
    password: 'admin123',
    nip: '19820412 200801 1 005',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Gonggang',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000007',
    desaLicenseKey: 'SIGAP-GGG3520-2025-1102',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000021',
    name: 'Tri Wahyuni',
    email: 'tri@gonggang.desa.go.id',
    password: 'gonggang123',
    nip: '19930715 201902 2 004',
    jabatan: 'Kaur Keuangan / Bendahara',
    instansi: 'Kantor Balai Desa Gonggang',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000007',
    desaLicenseKey: 'SIGAP-GGG3520-2025-1102',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },

  // 3. DESA GENILANGIT
  {
    id: 'd0000000-0000-0000-0000-000000000022',
    name: 'Purnomo Hadi, S.AP',
    email: 'admin@genilangit.desa.go.id',
    password: 'admin123',
    nip: '19800619 200701 1 002',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Genilangit',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000008',
    desaLicenseKey: 'SIGAP-GNL3520-2025-3304',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000023',
    name: 'Dwi Kartika',
    email: 'dwi@genilangit.desa.go.id',
    password: 'genilangit123',
    nip: '19950312 202102 2 006',
    jabatan: 'Kasi Pemerintahan',
    instansi: 'Kantor Balai Desa Genilangit',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000008',
    desaLicenseKey: 'SIGAP-GNL3520-2025-3304',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },

  // 4. DESA JANGGAN
  {
    id: 'd0000000-0000-0000-0000-000000000024',
    name: 'Joko Prasetyo, S.IP',
    email: 'admin@janggan.desa.go.id',
    password: 'admin123',
    nip: '19830510 200901 1 003',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Janggan',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000009',
    desaLicenseKey: 'SIGAP-JGG3520-2025-4421',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000025',
    name: 'Slamet Riyadi',
    email: 'slamet@janggan.desa.go.id',
    password: 'janggan123',
    nip: '19910820 201802 1 004',
    jabatan: 'Kaur Perencanaan',
    instansi: 'Kantor Balai Desa Janggan',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000009',
    desaLicenseKey: 'SIGAP-JGG3520-2025-4421',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },

  // 5. DESA CILENG
  {
    id: 'd0000000-0000-0000-0000-000000000026',
    name: 'Sri Mulyani, S.Pd',
    email: 'admin@cileng.desa.go.id',
    password: 'admin123',
    nip: '19840215 200801 2 004',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Cileng',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000010',
    desaLicenseKey: 'SIGAP-CLG3520-2025-5532',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000027',
    name: 'Eko Susanto',
    email: 'eko@cileng.desa.go.id',
    password: 'cileng123',
    nip: '19941105 202001 1 005',
    jabatan: 'Kaur Tata Usaha & Umum',
    instansi: 'Kantor Balai Desa Cileng',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000010',
    desaLicenseKey: 'SIGAP-CLG3520-2025-5532',
    avatarUrl:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  },

  // 6. DESA SOMBO
  {
    id: 'd0000000-0000-0000-0000-000000000028',
    name: 'Bambang Suparno, S.Sos',
    email: 'admin@sombo.desa.go.id',
    password: 'admin123',
    nip: '19780918 200601 1 003',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Sombo',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000011',
    desaLicenseKey: 'SIGAP-SMB3520-2025-6675',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000029',
    name: 'Siti Nurhaliza',
    email: 'siti@sombo.desa.go.id',
    password: 'sombo123',
    nip: '19960514 202203 2 007',
    jabatan: 'Kasi Kesejahteraan Rakyat',
    instansi: 'Kantor Balai Desa Sombo',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000011',
    desaLicenseKey: 'SIGAP-SMB3520-2025-6675',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },

  // 7. DESA SUKOREJO
  {
    id: 'd0000000-0000-0000-0000-000000000030',
    name: 'Hendra Gunawan, S.AP',
    email: 'admin@sukorejo.desa.go.id',
    password: 'admin123',
    nip: '19810814 200701 1 004',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Sukorejo',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000012',
    desaLicenseKey: 'SIGAP-SKR3520-2025-7789',
    avatarUrl:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000031',
    name: 'Anisa Rahmawati',
    email: 'anisa@sukorejo.desa.go.id',
    password: 'sukorejo123',
    nip: '19951210 202102 2 005',
    jabatan: 'Kasi Pelayanan',
    instansi: 'Kantor Balai Desa Sukorejo',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000012',
    desaLicenseKey: 'SIGAP-SKR3520-2025-7789',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },

  // 8. DESA PLANGKRONGAN
  {
    id: 'd0000000-0000-0000-0000-000000000032',
    name: 'Wahyu Hidayat, S.IP',
    email: 'admin@plangkrongan.desa.go.id',
    password: 'admin123',
    nip: '19830722 200801 1 003',
    jabatan: 'Sekretaris Desa / Admin Sistem',
    instansi: 'Kantor Balai Desa Plangkrongan',
    role: 'admin_desa',
    tenantId: 'c0000000-0000-0000-0000-000000000013',
    desaLicenseKey: 'SIGAP-PLG3520-2025-8890',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000033',
    name: 'Rudi Hartono',
    email: 'rudi@plangkrongan.desa.go.id',
    password: 'plangkrongan123',
    nip: '19920911 201903 1 005',
    jabatan: 'Kaur Tata Usaha & Umum',
    instansi: 'Kantor Balai Desa Plangkrongan',
    role: 'pegawai',
    tenantId: 'c0000000-0000-0000-0000-000000000013',
    desaLicenseKey: 'SIGAP-PLG3520-2025-8890',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  },
];

// Retrieve registered employees merged from base DEMO_USERS and localStorage
export function getRegisteredEmployees(tenantId?: string): (UserProfile & { password: string })[] {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sigap_registered_employees');
      let customEmployees: (UserProfile & { password: string })[] = [];
      if (saved) {
        customEmployees = JSON.parse(saved);
      }
      const combined = [...DEMO_USERS, ...customEmployees];
      const map = new Map<string, UserProfile & { password: string }>();
      combined.forEach((u) => map.set(u.email.toLowerCase(), u));
      const all = Array.from(map.values());
      if (tenantId) {
        return all.filter((u) => u.tenantId === tenantId);
      }
      return all;
    }
  } catch (e) {
    console.warn('Failed to parse local employees:', e);
  }
  if (tenantId) {
    return DEMO_USERS.filter((u) => u.tenantId === tenantId);
  }
  return DEMO_USERS;
}

export function saveRegisteredEmployee(employee: UserProfile & { password: string }): void {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sigap_registered_employees');
      const existing: (UserProfile & { password: string })[] = saved ? JSON.parse(saved) : [];
      const updated = [
        employee,
        ...existing.filter((e) => e.email.toLowerCase() !== employee.email.toLowerCase()),
      ];
      localStorage.setItem('sigap_registered_employees', JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save employee locally:', e);
  }
}

// Verification helper for Admin Desa login
export function verifyProductionLicense(
  inputCode: string,
  tenantId?: string
): { valid: boolean; license?: DesaLicense; isMaster?: boolean; message: string } {
  const clean = inputCode.trim().toUpperCase();
  if (!clean) {
    return { valid: false, message: 'Kode lisensi desa tidak boleh kosong.' };
  }

  // Master Developer Access
  if (clean === MASTER_DEVELOPER_KEY || clean === 'SIGAP-DEV-MASTER') {
    return {
      valid: true,
      isMaster: true,
      message: 'Otorisasi Master Pengembang Arunika Kreatif Media Aktif!',
    };
  }

  const licenses = getRegisteredDesaLicenses();

  // Search by exact licenseKey
  let found = licenses.find((l) => l.licenseKey.toUpperCase() === clean);

  // Fallback match by short code
  if (!found) {
    found = licenses.find((l) => {
      const parts = l.licenseKey.toUpperCase().split('-');
      return parts.some((p) => p === clean);
    });
  }

  if (found) {
    if (found.status !== 'ACTIVE') {
      return {
        valid: false,
        license: found,
        message: `Lisensi Desa ${found.namaDesa} berstatus ${found.status}. Silakan hubungi Arunika Kreatif Media.`,
      };
    }
    return {
      valid: true,
      license: found,
      message: `Lisensi Resmi Terverifikasi: ${found.namaDesa} (${found.kabupaten})`,
    };
  }

  return {
    valid: false,
    message:
      'Kode Lisensi tidak ditemukan di database Arunika Kreatif Media. Pastikan Anda telah menerima kode lisensi resmi via WhatsApp 085150617732.',
  };
}

// Backward compatibility helper
export const DEVELOPER_VILLAGE_CODES: Record<string, { code: string; villageName: string }> = {
  'c0000000-0000-0000-0000-000000000003': {
    code: 'SIGAP-PCL3520-2025-8841',
    villageName: 'Desa Poncol',
  },
  'c0000000-0000-0000-0000-000000000004': {
    code: 'SIGAP-KDP3521-2025-4299',
    villageName: 'Desa Kedungprahu',
  },
  'a0000000-0000-0000-0000-000000000001': {
    code: 'SIGAP-SKM3201-2025-1024',
    villageName: 'Desa Sukamaju',
  },
};

export function verifyDeveloperCode(inputCode: string, tenantId?: string): boolean {
  return verifyProductionLicense(inputCode, tenantId).valid;
}

export const CURRENT_USER: UserProfile = DEMO_USERS[0];



// Generate dynamic records relative to current year and month
function generateDynamicAttendance(): AttendanceRecord[] {
  const currentYear = getCurrentYear();
  const currentMonthName = getCurrentMonthName();
  const now = new Date();

  const entries: {
    dayOffset: number;
    status: 'HADIR' | 'IZIN' | 'SAKIT' | 'DINAS';
    checkIn?: string;
    checkOut?: string;
    note?: string;
    locationName?: string;
  }[] = [
    { dayOffset: 0, status: 'HADIR', checkIn: '08:02', checkOut: '17:05' },
    {
      dayOffset: 1,
      status: 'DINAS',
      checkIn: '08:15',
      checkOut: '16:30',
      note: '[Perjalanan Dinas] Tujuan: Rapat Koordinasi APBDes di Kantor Camat Poncol',
      locationName: 'Kantor Kecamatan Poncol (Perjalanan Dinas)',
    },
    { dayOffset: 3, status: 'IZIN', note: 'Keperluan Keluarga' },
    { dayOffset: 4, status: 'HADIR', checkIn: '07:55', checkOut: '17:15' },
    { dayOffset: 5, status: 'SAKIT', note: 'Surat Dokter Terlampir' },
    { dayOffset: 6, status: 'HADIR', checkIn: '07:58', checkOut: '17:02' },
    { dayOffset: 7, status: 'HADIR', checkIn: '08:00', checkOut: '17:10' },
  ];

  const records: AttendanceRecord[] = entries.map((entry, idx) => {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - entry.dayOffset);

    const dayName = INDONESIAN_DAYS[targetDate.getDay()];
    const dateNum = targetDate.getDate();
    const formattedDate = `${dayName}, ${dateNum} ${currentMonthName}`;
    const isoDate = targetDate.toISOString().split('T')[0];

    return {
      id: `att-dyn-${idx + 1}`,
      date: isoDate,
      dayName,
      formattedDate,
      status: entry.status,
      checkInTime: entry.checkIn,
      checkOutTime: entry.checkOut,
      note: entry.note,
      locationName:
        entry.locationName ||
        (entry.status === 'HADIR'
          ? 'Kantor Balai Desa'
          : entry.status === 'DINAS'
          ? 'Lokasi Perjalanan Dinas'
          : 'Luar Radius Kantor'),
      distanceMeters: entry.status === 'HADIR' ? 10 + idx * 2 : entry.status === 'DINAS' ? 0 : 3500,
      latitude:
        entry.status === 'HADIR'
          ? -7.712345 + idx * 0.000015
          : entry.status === 'DINAS'
          ? -7.698421
          : undefined,
      longitude:
        entry.status === 'HADIR'
          ? 111.234567 + idx * 0.000012
          : entry.status === 'DINAS'
          ? 111.248102
          : undefined,
      verified: true,
    };
  });

  // Historical filler days to total 22 Hadir
  for (let i = 1; i <= 18; i++) {
    const histDate = new Date(now);
    histDate.setDate(now.getDate() - (8 + i));
    const dayName = INDONESIAN_DAYS[histDate.getDay()];
    const dateNum = histDate.getDate();
    const formattedDate = `${dateNum} ${currentMonthName} ${currentYear}`;
    const isoDate = histDate.toISOString().split('T')[0];

    records.push({
      id: `att-hist-${i}`,
      date: isoDate,
      dayName,
      formattedDate,
      status: 'HADIR',
      checkInTime: '08:00',
      checkOutTime: '17:00',
      locationName: 'Kantor Balai Desa',
      distanceMeters: 10 + (i % 5),
      latitude: -7.712345 + (i % 4) * 0.00001,
      longitude: 111.234567 + (i % 3) * 0.00001,
      verified: true,
    });
  }

  return records;
}

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = generateDynamicAttendance();

export const INITIAL_WORK_REPORTS: WorkReport[] = [
  {
    id: 'rep-1',
    date: new Date().toISOString().split('T')[0],
    detail: 'Pendataan verifikasi berkas administrasi kependudukan dan surat pengantar nikah warga RT 03/RW 02.',
    output: 'Tervalidasi 14 berkas pemohon dan 3 surat keterangan selesai diterbitkan.',
    timestamp: `${new Date().toISOString().split('T')[0]} 16:30 WIB`,
    location: 'Kantor Balai Desa',
    status: 'TERVERIFIKASI',
  },
  {
    id: 'rep-2',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    detail: 'Penyusunan draft laporan realisasi APBDes dan koordinasi dengan Badan Permusyawaratan Desa (BPD).',
    output: 'Draft tabel realisasi selesai 100% dan siap ditandatangani Kepala Desa.',
    timestamp: `${new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]} 16:45 WIB`,
    location: 'Ruang Rapat Balai Desa',
    status: 'TERVERIFIKASI',
  },
];

export const MAP_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAlKwoo4WRpi9AKhda5nIoVNRRPBXTIal0CcH8brp9GaXo5kI2AVGED23TUFhYc1LYtmgHal7wguHbFUrmkAPgColzgzdye-xrxmi5f12MgDtR0wgd2ehYOaBlcj8g2Zi5o-i4XboO_GbwLUkgOqWjCtv8_ELlKedG7tTN0pTASn1qiMO154OFq5LBOCBYwM4UmlsF8VneJSHQxarWc_KSxXYo3IYjYPTFmXIn2iQyTNsFlHmuPu5tuhHJGf9DnRHz7ALDYyjkYQjDY';

export const RADAR_MAP_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAN_NLm4oK3ctUCiE6hs6sYNVs-c5_wXzK4MakdjRPdpa0OPlyrYJtQxp1x_-iJvF9RqslQGSIq82EyVNoY9P0Yy7mggZlDxL3uY8vBKncwrr9aKNSi1OyCuUN8qIuaNzra5VnxvavGQWK1sk7zH_4khFzNk4uV9otQmsrvT0Cf-Tw4I22GZ2LfYSHETkwb8C2mf9F7fWDHnP9AvYVd8iU3nmj8QmT0bwsxlhn7OwDw-Og_WhKWZ03EzdSAdZQJu9ArCh4tsogdkqj1';
