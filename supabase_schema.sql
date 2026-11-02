-- =========================================================================
-- SIGAP DIGITAL CONCIERGE - SUPABASE MULTI-TENANT DATABASE SCHEMA
-- =========================================================================
-- Jalankan skrip ini langsung di Supabase SQL Editor (Dashboard > SQL Editor)
-- Skrip ini akan membuat tabel, relasi, Row Level Security (RLS), dan data awal.
-- =========================================================================

-- 1. Enable Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL TENANTS (Daftar Desa / Kelurahan / Instansi)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode_desa VARCHAR(30) UNIQUE NOT NULL,
    nama_desa VARCHAR(150) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kabupaten VARCHAR(100) NOT NULL,
    provinsi VARCHAR(100) DEFAULT 'Jawa Barat',
    office_name VARCHAR(150) DEFAULT 'Kantor Balai Desa',
    office_address TEXT,
    office_lat DOUBLE PRECISION NOT NULL DEFAULT -6.175392,
    office_lng DOUBLE PRECISION NOT NULL DEFAULT 106.827153,
    allowed_radius_meters INT NOT NULL DEFAULT 50, -- Ambang batas geofence
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL EMPLOYEES (Aparatur / Staf Desa)
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    auth_user_id UUID, -- Terhubung dengan auth.users Supabase jika login via Supabase Auth
    nip VARCHAR(40),
    nama_lengkap VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telepon VARCHAR(30),
    jabatan VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'pegawai', -- 'admin_desa', 'kepala_desa', 'pegawai'
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL ATTENDANCE_RECORDS (Riwayat Presensi Biometrik & Geofence)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_name VARCHAR(20),
    formatted_date VARCHAR(60),
    status VARCHAR(20) NOT NULL CHECK (status IN ('HADIR', 'IZIN', 'SAKIT', 'ALPA')),
    check_in_time VARCHAR(10),
    check_out_time VARCHAR(10),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_meters INT,
    location_name VARCHAR(150),
    photo_url TEXT,
    note TEXT,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL WORK_REPORTS (Laporan Kerja Harian Pegawai)
CREATE TABLE IF NOT EXISTS public.work_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    detail TEXT NOT NULL,
    output TEXT NOT NULL,
    timestamp VARCHAR(50),
    location VARCHAR(150),
    attachment_url TEXT,
    status VARCHAR(30) DEFAULT 'TERVERIFIKASI' CHECK (status IN ('TERVERIFIKASI', 'MENUNGGU', 'DRAFT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 6. ROW LEVEL SECURITY (RLS) - KEAMANAN ISOLASI MULTI-TENANT
-- =========================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_reports ENABLE ROW LEVEL SECURITY;

-- Policy untuk read publik / anonim untuk demonstrasi dan aplikasi client
CREATE POLICY "Allow public read on tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Allow public read on employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow public read on attendance_records" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert on attendance_records" ON public.attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on work_reports" ON public.work_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on work_reports" ON public.work_reports FOR INSERT WITH CHECK (true);

-- =========================================================================
-- 7. DATA AWAL (SEED DATA DESA & PEGAWAI)
-- =========================================================================

-- Tambah Tenant Contoh: Desa Sukamaju & Desa Mekarsari
INSERT INTO public.tenants (id, kode_desa, nama_desa, kecamatan, kabupaten, office_name, office_address, office_lat, office_lng, allowed_radius_meters)
VALUES
('a0000000-0000-0000-0000-000000000001', '32.01.01.2001', 'Desa Sukamaju', 'Cilodong', 'Bogor', 'Gedung Pusat SIGAP', 'Gedung Pusat Pemerintahan, Lantai 4, Jakarta Pusat', -6.175392, 106.827153, 50),
('a0000000-0000-0000-0000-000000000002', '32.01.01.2002', 'Desa Mekarsari', 'Cilodong', 'Bogor', 'Kantor Balai Desa Mekarsari', 'Jl. Raya Mekarsari No. 12', -6.182100, 106.834500, 50)
ON CONFLICT (id) DO NOTHING;

-- Tambah Pegawai Contoh: Ahmad Dani
INSERT INTO public.employees (id, tenant_id, nip, nama_lengkap, email, jabatan, role)
VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '19880412 201101 1 003', 'Ahmad Dani', 'ahmad.dani@desa.go.id', 'Aparatur Desa / Staf Tata Usaha', 'pegawai')
ON CONFLICT (id) DO NOTHING;

-- Tambah Data Riwayat Presensi Awal
INSERT INTO public.attendance_records (tenant_id, employee_id, date, day_name, formatted_date, status, check_in_time, check_out_time, location_name, distance_meters, verified)
VALUES
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2024-05-20', 'Senin', 'Senin, 20 Mei', 'HADIR', '08:02', '17:05', 'Gedung Pusat SIGAP', 12, true),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2024-05-17', 'Jumat', 'Jumat, 17 Mei', 'IZIN', NULL, NULL, 'Luar Radius Kantor', 4500, true),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2024-05-16', 'Kamis', 'Kamis, 16 Mei', 'HADIR', '07:55', '17:15', 'Gedung Pusat SIGAP', 8, true),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2024-05-15', 'Rabu', 'Rabu, 15 Mei', 'SAKIT', NULL, NULL, 'Klinik Pratama Sehat', 3200, true);
