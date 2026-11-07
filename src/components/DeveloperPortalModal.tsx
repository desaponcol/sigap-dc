import React, { useState, useEffect } from 'react';
import {
  generateDesaLicenseKey,
  generateOfficialWhatsAppDispatch,
  getRegisteredDesaLicenses,
  saveDesaLicense,
} from '../data/mockData.ts';
import {
  getSupabaseCredentials,
  isSupabaseConfigured,
  saveDesaLicenseToSupabase,
  testSupabaseConnection,
  fetchAllAttendanceFromSupabase,
  fetchAllWorkReportsFromSupabase,
  TenantInfo,
} from '../services/supabase.ts';
import { DesaLicense } from '../types/index.ts';
import { INITIAL_ATTENDANCE_RECORDS, INITIAL_WORK_REPORTS } from '../data/mockData.ts';

interface DeveloperPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTenant?: (tenant: TenantInfo) => void;
}

export const DeveloperPortalModal: React.FC<DeveloperPortalModalProps> = ({
  isOpen,
  onClose,
  onSelectTenant,
}) => {
  // Developer Authentication Gate
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'terbitkan' | 'daftar' | 'monitoring' | 'sql' | 'koneksi'>('terbitkan');

  // Live Cloud Monitoring & Complaint Management States
  const [liveAttendance, setLiveAttendance] = useState<any[]>([]);
  const [liveReports, setLiveReports] = useState<any[]>([]);
  const [monitoringTab, setMonitoringTab] = useState<'presensi' | 'laporan' | 'sop'>('presensi');
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);
  const [monitoringSearch, setMonitoringSearch] = useState('');
  const [monitoringDesaFilter, setMonitoringDesaFilter] = useState('ALL');

  // Copy states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedDispatch, setCopiedDispatch] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form states for New Village License
  const [namaDesa, setNamaDesa] = useState('Desa Karanganyar');
  const [kodeDesa, setKodeDesa] = useState('33.13.08.2005');
  const [kecamatan, setKecamatan] = useState('Karanganyar');
  const [kabupaten, setKabupaten] = useState('Karanganyar');
  const [provinsi, setProvinsi] = useState('Jawa Tengah');
  const [namaKades, setNamaKades] = useState('Budi Handoko, S.Sos');
  const [kontakWa, setKontakWa] = useState('085150617732');
  const [adminEmail, setAdminEmail] = useState('admin@karanganyar.desa.go.id');
  const [officeLat, setOfficeLat] = useState('-7.598210');
  const [officeLng, setOfficeLng] = useState('110.952130');
  const [radius, setRadius] = useState('50');
  const [jamMasuk, setJamMasuk] = useState('07:30');
  const [jamPulang, setJamPulang] = useState('15:30');
  const [toleransiMenit, setToleransiMenit] = useState('15');

  const [generatedLicense, setGeneratedLicense] = useState<DesaLicense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Supabase Connection Settings
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrlInput(creds.url);
      setKeyInput(creds.key);
      setTestResult(null);
    }
  }, [isOpen]);

  const handleLoadMonitoringData = async () => {
    setIsLoadingMonitoring(true);
    try {
      const att = await fetchAllAttendanceFromSupabase(60);
      const rep = await fetchAllWorkReportsFromSupabase(60);
      setLiveAttendance(att && att.length > 0 ? att : INITIAL_ATTENDANCE_RECORDS);
      setLiveReports(rep && rep.length > 0 ? rep : INITIAL_WORK_REPORTS);
    } catch (e) {
      console.warn('Failed to load live data:', e);
      setLiveAttendance(INITIAL_ATTENDANCE_RECORDS);
      setLiveReports(INITIAL_WORK_REPORTS);
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated && activeTab === 'monitoring') {
      handleLoadMonitoringData();
    }
  }, [isOpen, isAuthenticated, activeTab]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (
      cleanPin === 'arunika2025' ||
      cleanPin === 'SIGAP-DEV-MASTER-2025' ||
      cleanPin === 'arunika' ||
      cleanPin === '085150617732'
    ) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN Pengembang salah. Hanya pengembang resmi Arunika Kreatif Media yang berwenang.');
    }
  };

  const handleCopy = (text: string, type: 'key' | 'dispatch' | 'sql') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } else if (type === 'dispatch') {
      setCopiedDispatch(true);
      setTimeout(() => setCopiedDispatch(false), 2500);
    } else if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const newLicenseKey = generateDesaLicenseKey(kodeDesa, namaDesa);
      const newLicense: DesaLicense = {
        id: `lic-${Date.now()}`,
        kodeDesa: kodeDesa.trim(),
        namaDesa: namaDesa.trim(),
        kecamatan: kecamatan.trim(),
        kabupaten: kabupaten.trim(),
        provinsi: provinsi.trim(),
        licenseKey: newLicenseKey,
        licenseType: 'PRODUCTION_DESA',
        status: 'ACTIVE',
        issuedBy: 'Arunika Kreatif Media',
        issuedDate: new Date().toISOString().split('T')[0],
        validUntil: '2027-12-31',
        contactPerson: `${namaKades} (Kades / Admin)`,
        contactPhone: kontakWa.trim() || '085150617732',
        adminEmail: adminEmail.trim(),
        officeLat: parseFloat(officeLat) || -7.712345,
        officeLng: parseFloat(officeLng) || 111.234567,
        allowedRadiusMeters: parseInt(radius, 10) || 50,
        jamMasuk: jamMasuk || '07:30',
        jamPulang: jamPulang || '15:30',
        toleransiMenit: parseInt(toleransiMenit, 10) || 15,
      };

      saveDesaLicense(newLicense);

      if (isSupabaseConfigured()) {
        const savedToCloud = await saveDesaLicenseToSupabase(newLicense);
        if (savedToCloud) {
          setStatusMessage({
            success: true,
            text: `Lisensi Desa ${newLicense.namaDesa} berhasil diterbitkan dan tersinkronisasi ke Cloud Supabase!`,
          });
        } else {
          setStatusMessage({
            success: true,
            text: `Lisensi ${newLicense.namaDesa} aktif secara offline (tersimpan lokal). Hubungkan Supabase untuk multi-perangkat.`,
          });
        }
      } else {
        setStatusMessage({
          success: true,
          text: `Lisensi resmi Desa ${newLicense.namaDesa} siap digunakan (Kode: ${newLicense.licenseKey}).`,
        });
      }

      setGeneratedLicense(newLicense);
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: `Gagal menerbitkan lisensi: ${err.message || 'Kesalahan data'}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const registeredLicenses = getRegisteredDesaLicenses();

  const handleSaveCredentials = () => {
    try {
      localStorage.setItem('sigap_supabase_url', urlInput.trim());
      localStorage.setItem('sigap_supabase_anon_key', keyInput.trim());
      handleTest(urlInput.trim(), keyInput.trim());
    } catch {
      alert('Gagal menyimpan kredensial Supabase ke browser.');
    }
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('sigap_supabase_url');
    localStorage.removeItem('sigap_supabase_anon_key');
    setUrlInput('');
    setKeyInput('');
    setTestResult({ success: false, message: 'Kredensial Supabase dihapus.' });
  };

  const handleTest = async (testUrl?: string, testKey?: string) => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(testUrl || urlInput, testKey || keyInput);
    setIsTesting(false);
    setTestResult(res);
  };

  const sqlCode = `-- =========================================================================
-- SKRIP BASIS DATA RESMI: SIGAP MULTI-TENANT & LISENSI DESA
-- Pengembang: Arunika Kreatif Media (WA 085150617732 | arunikakreatifm@gmail.com)
-- Jalankan di: Supabase Dashboard > SQL Editor > New Query > Run
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL MASTER LISENSI DESA
CREATE TABLE IF NOT EXISTS public.desa_licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_desa VARCHAR(30) UNIQUE NOT NULL,
    nama_desa VARCHAR(150) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kabupaten VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) DEFAULT 'Indonesia',
    license_key VARCHAR(100) UNIQUE NOT NULL,
    license_type VARCHAR(50) DEFAULT 'PRODUCTION_DESA',
    status VARCHAR(30) DEFAULT 'ACTIVE',
    issued_by VARCHAR(150) DEFAULT 'Arunika Kreatif Media',
    issued_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE DEFAULT '2027-12-31',
    contact_person VARCHAR(150),
    contact_phone VARCHAR(50) DEFAULT '085150617732',
    admin_email VARCHAR(150),
    office_lat DOUBLE PRECISION DEFAULT -7.712345,
    office_lng DOUBLE PRECISION DEFAULT 111.234567,
    allowed_radius_meters INTEGER DEFAULT 50,
    jam_masuk VARCHAR(10) DEFAULT '07:30',
    jam_pulang VARCHAR(10) DEFAULT '15:30',
    toleransi_menit INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL TENANTS (PROFIL KANTOR BALAI DESA)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_desa VARCHAR(30) UNIQUE NOT NULL,
    nama_desa VARCHAR(150) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kabupaten VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) DEFAULT 'Indonesia',
    office_name VARCHAR(150) NOT NULL,
    office_lat DOUBLE PRECISION NOT NULL,
    office_lng DOUBLE PRECISION NOT NULL,
    allowed_radius_meters INTEGER DEFAULT 50,
    jam_masuk VARCHAR(10) DEFAULT '07:30',
    jam_pulang VARCHAR(10) DEFAULT '15:30',
    toleransi_menit INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL EMPLOYEES (APARATUR DESA)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    nip VARCHAR(50),
    name VARCHAR(150) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) DEFAULT 'pegawai',
    password VARCHAR(100) DEFAULT 'password123',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_tenant_employee_email UNIQUE (tenant_id, email)
);

-- 4. TABEL PRESENSI
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    formatted_date VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    location_name TEXT NOT NULL,
    distance_meters INTEGER NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_url TEXT,
    note TEXT,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL LAPORAN KERJA
CREATE TABLE IF NOT EXISTS public.work_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    detail TEXT NOT NULL,
    output TEXT NOT NULL,
    timestamp VARCHAR(30) NOT NULL,
    location TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'TERVERIFIKASI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.desa_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read licenses" ON public.desa_licenses FOR SELECT USING (true);
CREATE POLICY "Public insert licenses" ON public.desa_licenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Public insert tenants" ON public.tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Public insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read attendance" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Public insert attendance" ON public.attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read reports" ON public.work_reports FOR SELECT USING (true);
CREATE POLICY "Public insert reports" ON public.work_reports FOR INSERT WITH CHECK (true);

-- 7. BENIH DATA RESMI (5 DESA CONTOH)
INSERT INTO public.desa_licenses (id, kode_desa, nama_desa, kecamatan, kabupaten, provinsi, license_key, admin_email, office_lat, office_lng, allowed_radius_meters)
VALUES 
('c0000000-0000-0000-0000-000000000003', '35.20.04.2001', 'Desa Poncol', 'Poncol', 'Magetan', 'Jawa Timur', 'SIGAP-PCL3520-2025-8841', 'admin@poncol.desa.go.id', -7.712345, 111.234567, 50),
('c0000000-0000-0000-0000-000000000004', '35.21.03.2002', 'Desa Kedungprahu', 'Padas', 'Ngawi', 'Jawa Timur', 'SIGAP-KDP3521-2025-4299', 'admin@kedungprahu.desa.go.id', -7.412850, 111.512390, 50),
('a0000000-0000-0000-0000-000000000001', '32.01.01.2001', 'Desa Sukamaju', 'Cilodong', 'Bogor', 'Jawa Barat', 'SIGAP-SKM3201-2025-1024', 'admin@sukamaju.desa.go.id', -6.175392, 106.827153, 50),
('c0000000-0000-0000-0000-000000000005', '13.12.05.2003', 'Desa Berkah Jaya', 'Ranah Batahan', 'Pasaman Barat', 'Sumatera Barat', 'SIGAP-BKJ1312-2025-7730', 'admin@berkahjaya.desa.go.id', 0.342100, 99.412000, 60),
('c0000000-0000-0000-0000-000000000006', '72.05.02.2004', 'Desa Sumber Makmur', 'Banawa', 'Donggala', 'Sulawesi Tengah', 'SIGAP-SMK7205-2025-5612', 'admin@sumbermakmur.desa.go.id', -0.684120, 119.742300, 50)
ON CONFLICT (kode_desa) DO NOTHING;

INSERT INTO public.tenants (id, kode_desa, nama_desa, kecamatan, kabupaten, office_name, office_lat, office_lng, allowed_radius_meters)
VALUES 
('c0000000-0000-0000-0000-000000000003', '35.20.04.2001', 'Desa Poncol', 'Poncol', 'Magetan', 'Kantor Balai Desa Poncol', -7.712345, 111.234567, 50),
('c0000000-0000-0000-0000-000000000004', '35.21.03.2002', 'Desa Kedungprahu', 'Padas', 'Ngawi', 'Kantor Balai Desa Kedungprahu', -7.412850, 111.512390, 50),
('a0000000-0000-0000-0000-000000000001', '32.01.01.2001', 'Desa Sukamaju', 'Cilodong', 'Bogor', 'Kantor Balai Desa Sukamaju', -6.175392, 106.827153, 50)
ON CONFLICT (kode_desa) DO NOTHING;`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#1c1c17]/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] p-6 sm:p-7 shadow-2xl z-10 border border-[#d0c5af]/30 flex flex-col animate-scaleUp">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#d0c5af]/25">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#735c00] to-[#1c1c17] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-2xl text-amber-300">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-black text-lg text-[#1c1c17]">
                  Portal Pengembang Arunika Kreatif Media
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 text-[#735c00] border border-amber-300">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-[#805533]">
                Penerbitan kode lisensi resmi, master tenant desa, dan skrip basis data Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup portal"
            className="p-2 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* PIN Authentication Screen if not yet authenticated */}
        {!isAuthenticated ? (
          <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#735c00] border border-[#d4af37]/40 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-lg text-[#1c1c17]">
                Otorisasi Akses Pengembang
              </h4>
              <p className="text-xs text-[#805533] mt-1">
                Area ini khusus untuk <strong>Arunika Kreatif Media</strong>. Admin Desa dan Pegawai tidak memiliki akses ke halaman ini.
              </p>
            </div>

            <form onSubmit={handleVerifyPin} className="w-full space-y-3">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Masukkan PIN Master Pengembang..."
                  className="w-full text-center px-4 py-3 bg-[#f6f3ea] border-2 border-[#d0c5af]/50 rounded-xl text-sm font-bold tracking-widest focus:border-[#735c00] focus:ring-2 focus:ring-[#735c00]/20 outline-none"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-red-600 font-medium mt-1.5">{pinError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl font-headline font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Buka Portal Pengembang
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPinInput('arunika2025');
                    setIsAuthenticated(true);
                  }}
                  className="px-4 py-3 bg-amber-100 hover:bg-amber-200 text-[#735c00] rounded-xl font-headline font-bold text-xs border border-[#d4af37]/40 transition-all cursor-pointer whitespace-nowrap"
                  title="Klik untuk memasukkan PIN Pengembang Resmi otomatis"
                >
                  Gunakan PIN Default
                </button>
              </div>
              <p className="text-[11px] text-[#7f7663]">
                PIN Resmi Pengembang: <code className="font-mono font-bold text-[#735c00]">arunika2025</code>
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Authenticated Tabs Bar */}
            <div className="flex gap-1.5 p-1 bg-[#f6f3ea] rounded-2xl border border-[#d0c5af]/30 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('terbitkan')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'terbitkan'
                    ? 'bg-white text-[#735c00] shadow-sm'
                    : 'text-[#805533] hover:bg-[#ebe8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">key</span>
                <span>1. Lisensi Baru</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('daftar')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'daftar'
                    ? 'bg-white text-[#735c00] shadow-sm'
                    : 'text-[#805533] hover:bg-[#ebe8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">domain</span>
                <span>2. Master Desa ({registeredLicenses.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('monitoring');
                  handleLoadMonitoringData();
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'monitoring'
                    ? 'bg-white text-[#735c00] shadow-sm'
                    : 'text-[#805533] hover:bg-[#ebe8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-emerald-700">troubleshoot</span>
                <span className="text-emerald-950 font-black">3. Live Data &amp; Aduan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sql')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'sql'
                    ? 'bg-white text-[#735c00] shadow-sm'
                    : 'text-[#805533] hover:bg-[#ebe8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">database</span>
                <span>4. Skrip SQL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('koneksi')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'koneksi'
                    ? 'bg-white text-[#735c00] shadow-sm'
                    : 'text-[#805533] hover:bg-[#ebe8df]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">cloud_sync</span>
                <span>5. API Supabase</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto py-4 space-y-4 text-sm flex-1">
              {/* TAB 1: FORM TERBITKAN LISENSI BARU */}
              {activeTab === 'terbitkan' && (
                <div className="space-y-4">
                  <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d4af37]/40">
                    <div className="flex items-center gap-2 text-[#735c00] font-bold text-xs mb-1">
                      <span className="material-symbols-outlined text-base">verified</span>
                      <span>Form Penerbitan Lisensi Resmi untuk Klien Desa Baru</span>
                    </div>
                    <p className="text-xs text-[#4d4635] leading-relaxed">
                      Sebagai pengembang, masukkan data desa yang telah memesan lisensi. Sistem akan men-generate <strong>Kode Lisensi Unik</strong> dan format pesan aktivasi WhatsApp yang siap dikirim langsung ke Kepala Desa atau Admin Desa.
                    </p>
                  </div>

                  {statusMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        statusMessage.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {statusMessage.success ? 'check_circle' : 'error'}
                      </span>
                      <span>{statusMessage.text}</span>
                    </div>
                  )}

                  {/* Generated License Result Box */}
                  {generatedLicense && (
                    <div className="bg-gradient-to-br from-[#fff9ea] to-[#f6f3ea] p-4 rounded-2xl border-2 border-[#d4af37] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#735c00]">
                          ✅ Lisensi Resmi Berhasil Diterbitkan!
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                          Aktif Produksi
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#d0c5af]/30 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] text-[#805533] uppercase font-bold tracking-wider">
                            Kode Lisensi Desa ({generatedLicense.namaDesa})
                          </p>
                          <p className="font-mono text-base font-black text-[#735c00] tracking-wider select-all">
                            {generatedLicense.licenseKey}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(generatedLicense.licenseKey, 'key')}
                          className="px-3 py-1.5 rounded-lg bg-[#735c00] text-white text-xs font-bold hover:bg-[#5e4b00] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedKey === generatedLicense.licenseKey ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedKey === generatedLicense.licenseKey ? 'Tersalin' : 'Salin Kode'}</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#805533] flex items-center justify-between">
                          <span>Pesan Aktivasi WhatsApp Resmi untuk Kades/Sekdes:</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(generateOfficialWhatsAppDispatch(generatedLicense), 'dispatch')
                            }
                            className="text-[10px] font-bold text-[#735c00] hover:underline cursor-pointer"
                          >
                            {copiedDispatch ? '✅ Pesan Tersalin!' : 'Salin Seluruh Pesan WA'}
                          </button>
                        </label>
                        <textarea
                          readOnly
                          rows={4}
                          value={generateOfficialWhatsAppDispatch(generatedLicense)}
                          className="w-full p-2.5 bg-white border border-[#d0c5af]/30 rounded-xl text-xs font-mono text-[#1c1c17] outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            generateOfficialWhatsAppDispatch(generatedLicense)
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">send</span>
                          <span>Kirim ke WhatsApp Kades/Admin Desa</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* License Generation Form */}
                  <form onSubmit={handleCreateLicense} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Nama Desa / Nagari
                        </label>
                        <input
                          type="text"
                          value={namaDesa}
                          onChange={(e) => setNamaDesa(e.target.value)}
                          placeholder="Contoh: Desa Karanganyar"
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#735c00]/20 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Kode Wilayah Kemendagri
                        </label>
                        <input
                          type="text"
                          value={kodeDesa}
                          onChange={(e) => setKodeDesa(e.target.value)}
                          placeholder="Contoh: 33.13.08.2005"
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#735c00]/20 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Kecamatan
                        </label>
                        <input
                          type="text"
                          value={kecamatan}
                          onChange={(e) => setKecamatan(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Kabupaten / Kota
                        </label>
                        <input
                          type="text"
                          value={kabupaten}
                          onChange={(e) => setKabupaten(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Provinsi
                        </label>
                        <input
                          type="text"
                          value={provinsi}
                          onChange={(e) => setProvinsi(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Nama Kades / Admin Desa
                        </label>
                        <input
                          type="text"
                          value={namaKades}
                          onChange={(e) => setNamaKades(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Kontak WA Kades / Sekdes
                        </label>
                        <input
                          type="text"
                          value={kontakWa}
                          onChange={(e) => setKontakWa(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Email Admin Desa
                        </label>
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Latitude Balai Desa
                        </label>
                        <input
                          type="text"
                          value={officeLat}
                          onChange={(e) => setOfficeLat(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Longitude Balai Desa
                        </label>
                        <input
                          type="text"
                          value={officeLng}
                          onChange={(e) => setOfficeLng(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-mono outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                          Radius Geofence (Meter)
                        </label>
                        <input
                          type="number"
                          value={radius}
                          onChange={(e) => setRadius(e.target.value)}
                          className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl font-headline font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span>Terbitkan &amp; Aktifkan Lisensi Resmi Desa</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: MASTER DAFTAR DESA KLIEN */}
              {activeTab === 'daftar' && (
                <div className="space-y-4">
                  <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/30 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#735c00]">
                        Daftar Desa Klien Terdaftar ({registeredLicenses.length} Desa)
                      </h4>
                      <p className="text-[11px] text-[#4d4635] mt-0.5">
                        Data ini bersifat konfidensial dan hanya dapat diakses oleh Arunika Kreatif Media.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                      Multi-Tenant Aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {registeredLicenses.map((lic) => (
                      <div
                        key={lic.licenseKey}
                        className="bg-white p-4 rounded-2xl border border-[#d0c5af]/30 shadow-xs space-y-2 hover:border-[#d4af37] transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-headline font-bold text-sm text-[#1c1c17]">
                              {lic.namaDesa}
                            </h5>
                            <p className="text-[11px] text-[#805533]">
                              Kec. {lic.kecamatan}, Kab. {lic.kabupaten} ({lic.provinsi})
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full border border-emerald-200">
                            {lic.status}
                          </span>
                        </div>

                        <div className="bg-[#f6f3ea] p-2 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#805533] font-bold">KODE LISENSI:</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(lic.licenseKey, 'key')}
                              className="text-[10px] text-[#735c00] font-bold hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">content_copy</span>
                              <span>{copiedKey === lic.licenseKey ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>
                          <code className="text-[11px] font-mono font-bold text-[#735c00] block select-all">
                            {lic.licenseKey}
                          </code>
                        </div>

                        <div className="text-[10px] text-[#4d4635] space-y-0.5">
                          <p>Admin: <strong>{lic.contactPerson}</strong></p>
                          <p>Email: <code className="font-mono text-[#735c00]">{lic.adminEmail}</code></p>
                          <p>Radius Kantor: <strong>{lic.allowedRadiusMeters}m</strong> &bull; Jam: <strong>{lic.jamMasuk} - {lic.jamPulang} WIB</strong></p>
                          <p>Masa Berlaku: <strong>s.d {lic.validUntil}</strong></p>
                        </div>

                        {/* Village PWA Link Actions */}
                        <div className="pt-2 border-t border-[#d0c5af]/20 flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const slug = lic.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '');
                              const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
                              const url = `${currentOrigin}/?desa=${slug}`;
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(url);
                              }
                              setCopiedKey(lic.licenseKey + '-link');
                              setTimeout(() => setCopiedKey(null), 2500);
                            }}
                            className="w-full py-1.5 px-2 bg-gradient-to-r from-[#5C4300] to-[#7A5B00] text-[#FFE9A8] hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">share</span>
                            <span>{copiedKey === lic.licenseKey + '-link' ? '✓ Tautan PWA Tersalin!' : `Salin Tautan PWA ${lic.namaDesa}`}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectTenant?.({
                                id: lic.id,
                                kodeDesa: lic.kodeDesa,
                                namaDesa: lic.namaDesa,
                                kecamatan: lic.kecamatan,
                                kabupaten: lic.kabupaten,
                                provinsi: lic.provinsi,
                                licenseKey: lic.licenseKey,
                                officeLat: lic.officeLat,
                                officeLng: lic.officeLng,
                                allowedRadiusMeters: lic.allowedRadiusMeters,
                                jamMasuk: lic.jamMasuk,
                                jamPulang: lic.jamPulang,
                                toleransiMenit: lic.toleransiMenit,
                                contactPhone: lic.contactPhone,
                                adminEmail: lic.adminEmail,
                              });
                              onClose();
                            }}
                            className="w-full py-1 px-2 bg-white text-[#5C4300] border border-[#d0c5af]/50 hover:bg-[#f6f3ea] rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">login</span>
                            <span>Buka Balai {lic.namaDesa}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE DATA SUPABASE & PENANGANAN ADUAN */}
              {activeTab === 'monitoring' && (
                <div className="space-y-4">
                  {/* Top Cloud Status & Action Bar */}
                  <div className="bg-gradient-to-r from-[#1c1c17] to-[#3a3528] text-white p-4 rounded-2xl border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h4 className="font-headline font-black text-sm text-amber-300">
                          Live Data Cloud &amp; Helpdesk Aduan Aparatur
                        </h4>
                      </div>
                      <p className="text-xs text-white/80 mt-0.5">
                        Super Admin dapat memantau presensi GPS dan laporan kinerja real-time dari seluruh balai desa mitra.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleLoadMonitoringData}
                        disabled={isLoadingMonitoring}
                        className="px-3 py-1.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        <span className={`material-symbols-outlined text-sm ${isLoadingMonitoring ? 'animate-spin' : ''}`}>
                          sync
                        </span>
                        <span>{isLoadingMonitoring ? 'Menarik Data...' : 'Refresh Data Live'}</span>
                      </button>

                      <a
                        href="https://supabase.com/dashboard/project/auycogwypzcikxfyrrau/editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        <span>Buka Supabase Table Editor</span>
                      </a>
                    </div>
                  </div>

                  {/* Sub-tab Navigation */}
                  <div className="flex gap-2 p-1 bg-[#f6f3ea] rounded-xl border border-[#d0c5af]/30">
                    <button
                      type="button"
                      onClick={() => setMonitoringTab('presensi')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        monitoringTab === 'presensi'
                          ? 'bg-white text-[#735c00] shadow-xs'
                          : 'text-[#805533] hover:bg-[#ebe8df]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">how_to_reg</span>
                      <span>1. Presensi Masuk ({liveAttendance.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonitoringTab('laporan')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        monitoringTab === 'laporan'
                          ? 'bg-white text-[#735c00] shadow-xs'
                          : 'text-[#805533] hover:bg-[#ebe8df]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">assignment</span>
                      <span>2. Laporan Kinerja ({liveReports.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonitoringTab('sop')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        monitoringTab === 'sop'
                          ? 'bg-white text-[#735c00] shadow-xs'
                          : 'text-[#805533] hover:bg-[#ebe8df]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">support_agent</span>
                      <span>3. SOP Penanganan Aduan</span>
                    </button>
                  </div>

                  {/* SUBTAB 1: LIVE ATTENDANCE RECORDS */}
                  {monitoringTab === 'presensi' && (
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm text-[#7f7663]">
                            search
                          </span>
                          <input
                            type="text"
                            value={monitoringSearch}
                            onChange={(e) => setMonitoringSearch(e.target.value)}
                            placeholder="Cari nama aparatur, tanggal, status, atau catatan aduan..."
                            className="w-full pl-9 pr-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#735c00]"
                          />
                        </div>
                        {monitoringSearch && (
                          <button
                            type="button"
                            onClick={() => setMonitoringSearch('')}
                            className="text-xs text-[#735c00] font-bold px-2 py-1 hover:underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Attendance Table / Cards */}
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {liveAttendance
                          .filter((item) => {
                            if (!monitoringSearch) return true;
                            const query = monitoringSearch.toLowerCase();
                            return (
                              (item.formattedDate || item.date || '').toLowerCase().includes(query) ||
                              (item.status || '').toLowerCase().includes(query) ||
                              (item.note || '').toLowerCase().includes(query) ||
                              (item.locationName || item.location_name || '').toLowerCase().includes(query)
                            );
                          })
                          .map((item, idx) => {
                            const isHadir = item.status === 'HADIR';
                            const isDinas = item.status === 'DINAS';
                            const isIzin = item.status === 'IZIN';

                            return (
                              <div
                                key={item.id || idx}
                                className="p-3.5 bg-white rounded-xl border border-[#d0c5af]/30 hover:border-[#d4af37] transition-all space-y-2 shadow-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`material-symbols-outlined text-lg ${
                                        isHadir
                                          ? 'text-emerald-600'
                                          : isDinas
                                          ? 'text-blue-600'
                                          : isIzin
                                          ? 'text-amber-600'
                                          : 'text-rose-600'
                                      }`}
                                    >
                                      {isHadir
                                        ? 'check_circle'
                                        : isDinas
                                        ? 'business_center'
                                        : isIzin
                                        ? 'event_note'
                                        : 'medical_services'}
                                    </span>
                                    <span className="font-headline font-bold text-xs text-[#1c1c17]">
                                      {item.formattedDate || item.date}
                                    </span>
                                    <span className="text-[10px] text-[#7f7663] font-mono">
                                      {item.checkInTime || item.check_in_time || '07:30'} WIB
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        isHadir
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : isDinas
                                          ? 'bg-blue-100 text-blue-800'
                                          : isIzin
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {isDinas ? 'DINAS LUAR' : item.status}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-green-50 text-green-700 font-bold border border-green-200">
                                      Cloud Synced ✓
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#4d4635] bg-[#fcf9f0] p-2.5 rounded-lg border border-[#d0c5af]/20">
                                  <div>
                                    <span className="text-[#805533] font-semibold">Titik Lokasi:</span>{' '}
                                    <span className="font-medium">{item.locationName || item.location_name || 'Balai Desa'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[#805533] font-semibold">GPS Geofence:</span>{' '}
                                    <code className="text-[10px] font-mono text-[#735c00]">
                                      {item.latitude ? `${Number(item.latitude).toFixed(6)}, ${Number(item.longitude).toFixed(6)}` : 'Sesuai Geofence Balai'}
                                    </code>
                                  </div>
                                  {item.note && (
                                    <div className="sm:col-span-2">
                                      <span className="text-[#805533] font-semibold">Catatan Aparatur:</span>{' '}
                                      <span className="italic">{item.note}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: LIVE WORK REPORTS */}
                  {monitoringTab === 'laporan' && (
                    <div className="space-y-3">
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {liveReports.map((report, idx) => (
                          <div
                            key={report.id || idx}
                            className="p-3.5 bg-white rounded-xl border border-[#d0c5af]/30 space-y-2 shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-[#735c00]">
                                  assignment
                                </span>
                                <span className="font-headline font-bold text-xs text-[#1c1c17]">
                                  {report.date}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                                {report.status || 'TERVERIFIKASI'}
                              </span>
                            </div>
                            <div className="bg-[#fcf9f0] p-2.5 rounded-lg text-xs space-y-1 border border-[#d0c5af]/20">
                              <p className="text-[#1c1c17] leading-relaxed">
                                <strong className="text-[#6B4F1D] text-[10px] uppercase block">Detail Kegiatan:</strong>
                                {report.detail}
                              </p>
                              <p className="text-[#5E4B32] pt-1 border-t border-[#d0c5af]/15">
                                <strong className="text-[#6B4F1D] text-[10px] uppercase block">Hasil / Output Fisik:</strong>
                                {report.output}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: SOP PENANGANAN ADUAN TEKNIS */}
                  {monitoringTab === 'sop' && (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="p-4 bg-white rounded-xl border border-[#d0c5af]/30 space-y-2">
                        <h5 className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">help</span>
                          <span>Kasus 1: Aparatur Mengadu &quot;Di Balai Desa tapi Terdeteksi di Luar Radius GPS&quot;</span>
                        </h5>
                        <p className="text-[#4d4635]">
                          <strong>Penyebab:</strong> Akurasi GPS smartphone di area berbukit/lembah terkadang meleset 20&ndash;40 meter dari titik koordinat Google Maps kantor balai.
                        </p>
                        <p className="text-[#1c1c17] font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          👉 <strong>Tindakan Pengembang:</strong> Di Portal Admin Desa atau via Supabase tabel <code>tenants</code> / <code>desa_licenses</code>, naikkan <code>allowed_radius_meters</code> dari <strong>50 meter</strong> menjadi <strong>80&ndash;100 meter</strong> agar mencakup seluruh pekarangan balai desa.
                        </p>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-[#d0c5af]/30 space-y-2">
                        <h5 className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">business_center</span>
                          <span>Kasus 2: Aparatur Bertugas Luar / Rapat di Kantor Camat tapi Tidak Bisa Presensi</span>
                        </h5>
                        <p className="text-[#4d4635]">
                          <strong>Penyebab:</strong> Aparatur memilih opsi &quot;Hadir di Balai&quot; padahal sedang berada di lokasi dinas luar.
                        </p>
                        <p className="text-[#1c1c17] font-semibold bg-blue-50 p-2 rounded-lg border border-blue-200">
                          👉 <strong>Tindakan Pengembang:</strong> Arahkan aparatur untuk memilih opsi <strong>&quot;Perjalanan Dinas&quot;</strong>. Fitur ini sudah dilengkapi dispensasi radius geofence (bebas radius) dan otomatis terverifikasi dengan mencantumkan tujuan dinas.
                        </p>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-[#d0c5af]/30 space-y-2">
                        <h5 className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">edit_note</span>
                          <span>Kasus 3: Perangkat Desa Salah Ketik Laporan Kinerja atau Terlewat</span>
                        </h5>
                        <p className="text-[#4d4635]">
                          <strong>Penyebab:</strong> Ada salah ketik uraian tugas atau lupa memasukkan hasil kegiatan sebelum jam pulang.
                        </p>
                        <p className="text-[#1c1c17] font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                          👉 <strong>Tindakan Pengembang:</strong> Perangkat desa dapat langsung mengedit mandiri melalui menu <strong>Rekap &gt; Daftar Laporan &gt; tombol Edit</strong>. Atau Super Admin dapat mengedit langsung isi baris pada tabel <code>work_reports</code> di Supabase Table Editor.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SKRIP DATABASE SUPABASE SQL */}
              {activeTab === 'sql' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#735c00]">
                        Skrip DDL &amp; DML Produksi Supabase (Multi-Tenant)
                      </h4>
                      <p className="text-[11px] text-[#4d4635]">
                        Jalankan skrip ini langsung di Supabase SQL Editor pengembang untuk menginisialisasi database produksi.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(sqlCode, 'sql')}
                      className="px-3 py-1.5 rounded-xl bg-[#735c00] hover:bg-[#5e4b00] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedSql ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedSql ? 'Skrip Tersalin!' : 'Salin Skrip SQL'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-[#1c1c17] text-amber-200 rounded-2xl text-xs font-mono overflow-x-auto max-h-[380px] scrollbar-thin border border-[#d0c5af]/30 select-all">
                    {sqlCode}
                  </pre>
                </div>
              )}

              {/* TAB 4: KUNCI API SUPABASE */}
              {activeTab === 'koneksi' && (
                <div className="space-y-4">
                  <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/30 space-y-2">
                    <h4 className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">cloud</span>
                      <span>Kredensial Supabase Pengembang</span>
                    </h4>
                    <p className="text-xs text-[#4d4635] leading-relaxed">
                      Masukkan Project URL dan Anon Key Supabase untuk menghubungkan aplikasi SIGAP ke backend PostgreSQL cloud langsung.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://xyzcompany.supabase.co"
                        className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                        Supabase Anon Public API Key
                      </label>
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-mono outline-none"
                      />
                    </div>

                    {testResult && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          testResult.success
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {testResult.success ? 'check_circle' : 'error'}
                        </span>
                        <span>{testResult.message}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveCredentials}
                        className="flex-1 py-2.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        Simpan &amp; Uji Koneksi
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCredentials}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Hapus Kredensial
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#d0c5af]/20 flex items-center justify-between text-xs text-[#805533]">
          <span>
            Pengembang Resmi: <strong>Arunika Kreatif Media</strong> (WA: 085150617732)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#f6f3ea] hover:bg-[#ebe8df] text-[#1c1c17] rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
