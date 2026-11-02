import React, { useState } from 'react';
import { AppScreen, UserProfile } from '../types/index.ts';

interface TentangScreenProps {
  user: UserProfile;
  onNavigate: (screen: AppScreen) => void;
  onOpenDeveloperPortal?: () => void;
}

export const TentangScreen: React.FC<TentangScreenProps> = ({
  user,
  onNavigate,
  onOpenDeveloperPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'aplikasi' | 'fitur' | 'pengembang' | 'lisensi'>('aplikasi');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const featureList = [
    {
      id: 1,
      title: 'Presensi Swafoto & Kamera Langsung',
      icon: 'photo_camera',
      badge: 'Verifikasi Visual',
      description:
        'Pengambilan swafoto (selfie) langsung via kamera perangkat saat mencatat kehadiran di balai desa. Menjadi bukti visual otentik kehadiran fisik aparatur secara real-time tanpa rekayasa foto galeri.',
      highlights: ['Swafoto kamera langsung', 'Bukti visual otentik', 'Waktu & tanggal otomatis'],
    },
    {
      id: 2,
      title: 'Geofencing Balai Desa Presisi Tinggi',
      icon: 'fmd_good',
      badge: 'Radius Terkunci',
      description:
        'Pembatasan presensi fisik dengan batas geofence kantor desa (radius ≤50 meter). Sistem memvalidasi koordinat GPS nyata dan memblokir upaya penggunaan fake GPS / mock location.',
      highlights: ['Radius kantor otomatis', 'Penghitungan jarak meter', 'Validasi lokasi aman'],
    },
    {
      id: 3,
      title: 'Arsitektur Multi-Tenant Desa Mandiri',
      icon: 'apartment',
      badge: 'Isolasi Data',
      description:
        'Pemisahan basis data antar desa secara ketat. Data aparatur, presensi, dan laporan Desa A tidak akan pernah tercampur atau dapat diakses oleh aparatur dari Desa B.',
      highlights: ['Partisi data per desa', 'Kode lisensi unik pengembang', 'Skalabilitas tanpa batas'],
    },
    {
      id: 4,
      title: 'E-Kinerja & Laporan Kerja Harian',
      icon: 'assignment',
      badge: 'Akuntabilitas',
      description:
        'Aparatur desa wajib menginput uraian tugas, volume capaian, waktu pelaksanaan, serta dokumentasi foto bukti luaran kerja yang dapat diverifikasi langsung oleh atasan.',
      highlights: ['Logbook kerja harian', 'Lampiran bukti foto tugas', 'Status verifikasi pimpinan'],
    },
    {
      id: 5,
      title: 'Ekspor Berkas PDF Rekapitulasi Resmi',
      icon: 'picture_as_pdf',
      badge: 'Format Dinas',
      description:
        'Generator berkas PDF berstandar kedinasan pemerintah lengkap dengan kop surat desa resmi, tanggal dinamis, titi mangsa, persentase kehadiran, dan ruang tanda tangan Kepala Desa.',
      highlights: ['Kop surat kustom otomatis', 'Rekap bulanan terperinci', 'Siap cetak & tanda tangan'],
    },
    {
      id: 6,
      title: 'Sinkronisasi Supabase Cloud & RLS',
      icon: 'cloud_sync',
      badge: 'PostgreSQL Enterprise',
      description:
        'Didukung basis data relasional PostgreSQL Supabase dengan Row Level Security (RLS). Mendukung sinkronisasi real-time dan mekanisme ketahanan luring saat koneksi lemah.',
      highlights: ['PostgreSQL tingkat industri', 'Row-Level Security (RLS)', 'Ketahanan data offline'],
    },
  ];

  return (
    <main
      className="pt-20 sm:pt-24 px-3 sm:px-6 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn w-full overflow-hidden"
      style={{ paddingBottom: 'calc(5rem + 32px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Top Header & Breadcrumb */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B4F1D] hover:text-[#5C4300] transition-colors py-1 px-2.5 rounded-lg hover:bg-[#735c00]/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Kembali ke Dashboard</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f6f3ea] text-[#5C4300] border border-[#d0c5af]/40 shadow-xs">
            <span className="material-symbols-outlined text-sm">verified</span>
            Versi 1.0.0 Prestige
          </span>
        </div>

        {/* Hero Banner Card */}
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#1c1c17] via-[#2a271e] to-[#735c00] text-white p-5 sm:p-9 shadow-xl border border-[#d4af37]/30">
          {/* Ambient Glow Elements */}
          <div className="absolute top-0 right-0 w-64 sm:w-72 h-64 sm:h-72 bg-[#d4af37]/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-40 sm:w-48 h-40 sm:h-48 bg-[#ffe088]/15 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 space-y-3 sm:space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#ffe088] text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">fingerprint</span>
              <span>Sistem Presensi &amp; E-Kinerja Aparatur Desa</span>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold font-headline tracking-tight leading-[1.2] text-white">
                SIGAP <span className="text-[#ffe088] font-normal">Aparatur Desa</span>
              </h1>
              <p className="text-xs sm:text-base text-stone-300 leading-relaxed font-body font-light">
                Platform digital presensi berbasis geofencing dan laporan kinerja harian terintegrasi. Dirancang untuk menegakkan disiplin, transparansi, dan modernisasi birokrasi pemerintahan desa di seluruh Indonesia.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
              <span className="text-[10px] sm:text-[11px] font-semibold bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-stone-200 border border-white/10 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#ffe088]">check_circle</span>
                Multi-Tenant Terisolasi
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-stone-200 border border-white/10 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#ffe088]">check_circle</span>
                Geofence Balai Desa (≤50m)
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-stone-200 border border-white/10 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#ffe088]">check_circle</span>
                Kemitraan Arunika Media
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs (Mobile-first responsive 2x2 grid) */}
      <nav aria-label="Tab Menu Tentang" className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#d0c5af]/30 shadow-xs">
        <button
          onClick={() => setActiveTab('aplikasi')}
          className={`w-full py-2.5 px-2 rounded-xl font-headline text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
            activeTab === 'aplikasi'
              ? 'bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white shadow-md'
              : 'text-[#805533] hover:bg-[#f6f3ea]'
          }`}
        >
          <span className="material-symbols-outlined text-base shrink-0">info</span>
          <span className="truncate">Tentang SIGAP</span>
        </button>

        <button
          onClick={() => setActiveTab('fitur')}
          className={`w-full py-2.5 px-2 rounded-xl font-headline text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
            activeTab === 'fitur'
              ? 'bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white shadow-md'
              : 'text-[#805533] hover:bg-[#f6f3ea]'
          }`}
        >
          <span className="material-symbols-outlined text-base shrink-0">stars</span>
          <span className="truncate">Fitur Unggulan</span>
        </button>

        <button
          onClick={() => setActiveTab('pengembang')}
          className={`w-full py-2.5 px-2 rounded-xl font-headline text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
            activeTab === 'pengembang'
              ? 'bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white shadow-md'
              : 'text-[#805533] hover:bg-[#f6f3ea]'
          }`}
        >
          <span className="material-symbols-outlined text-base shrink-0">business</span>
          <span className="truncate">Pengembang</span>
        </button>

        <button
          onClick={() => setActiveTab('lisensi')}
          className={`w-full py-2.5 px-2 rounded-xl font-headline text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
            activeTab === 'lisensi'
              ? 'bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white shadow-md'
              : 'text-[#805533] hover:bg-[#f6f3ea]'
          }`}
        >
          <span className="material-symbols-outlined text-base shrink-0">
            {user.role === 'admin_desa' ? 'verified_user' : 'badge'}
          </span>
          <span className="truncate">{user.role === 'admin_desa' ? 'Peran & Lisensi' : 'Hak Akses Aparatur'}</span>
        </button>
      </nav>

      {/* TAB 1: TENTANG APLIKASI */}
      {activeTab === 'aplikasi' && (
        <section className="space-y-6">
          {/* Card: Latar Belakang & Visi */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d0c5af]/25 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#735c00]/10 text-[#735c00] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <div>
                <h2 className="text-xl font-bold font-headline text-[#1c1c17]">
                  Deskripsi &amp; Visi Transformasi
                </h2>
                <p className="text-xs text-[#805533]">
                  Modernisasi tata kelola aparatur pemerintah desa berbasis teknologi terpercaya
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#4d4635] leading-relaxed">
              <p>
                <strong>SIGAP</strong> merupakan akronim dari <em>Sistem Informasi &amp; Geofencing Presensi Aparatur Desa</em>. Aplikasi ini lahir sebagai jawaban atas kebutuhan mendesak pemerintah desa akan sistem pencatatan kehadiran yang akurat, berintegritas tinggi, dan bebas dari praktik titip absen atau manipulasi data kehadiran konvensional.
              </p>
              <p>
                Birokrasi pemerintahan desa merupakan garda terdepan pelayanan publik masyarakat. Melalui SIGAP, setiap aparatur desa mulai dari Kepala Urusan (Kaur), Kepala Seksi (Kasi), Kepala Dusun (Kasun), hingga Staf Desa dapat merekam kedatangan dan kepulangan kerja secara mandiri hanya apabila mereka telah berada di dalam lingkungan kantor balai desa.
              </p>
            </div>

            {/* Quote Card */}
            <div className="bg-[#fcf9f0] p-5 rounded-2xl border-l-4 border-[#735c00] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#735c00] uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">lightbulb</span>
                <span>Visi Pokok SIGAP</span>
              </div>
              <p className="text-sm font-headline italic text-[#1c1c17] leading-relaxed">
                &ldquo;Mewujudkan tata kelola birokrasi desa yang disiplin, akuntabel, transparan, dan berdaya saing tinggi melalui integrasi presensi digital, geofencing lokasi presisi, dan pelaporan e-kinerja.&rdquo;
              </p>
            </div>

            {/* 4 Pilar Keunggulan */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold font-headline text-[#1c1c17] uppercase tracking-wider">
                4 Pilar Utama SIGAP
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#f6f3ea]/60 border border-[#d0c5af]/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#735c00] font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span>1. Ketepatan Waktu</span>
                  </div>
                  <p className="text-xs text-[#4d4635] leading-normal">
                    Pencatatan jam masuk dan pulang real-time dengan toleransi dinamis dan perhitungan keterlambatan transparan.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f6f3ea]/60 border border-[#d0c5af]/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#735c00] font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">pin_drop</span>
                    <span>2. Kehadiran Fisik Riil</span>
                  </div>
                  <p className="text-xs text-[#4d4635] leading-normal">
                    Validasi jarak geofencing radius balai desa memastikan pegawai benar-benar hadir di kantor, bukan dari rumah.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f6f3ea]/60 border border-[#d0c5af]/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#735c00] font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">task_alt</span>
                    <span>3. Akuntabilitas E-Kinerja</span>
                  </div>
                  <p className="text-xs text-[#4d4635] leading-normal">
                    Bukan sekadar hadir, aparatur mencatat lembar kerja harian beserta bukti fisik luaran tugas untuk evaluasi kinerja.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f6f3ea]/60 border border-[#d0c5af]/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#735c00] font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">security</span>
                    <span>4. Tata Kelola Multi-Tenant</span>
                  </div>
                  <p className="text-xs text-[#4d4635] leading-normal">
                    Setiap desa berdaulat mengelola anggotanya sendiri tanpa risiko kebocoran data antar entitas pemerintah desa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: FITUR UNGGULAN */}
      {activeTab === 'fitur' && (
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold font-headline text-[#1c1c17]">
              Fitur Unggulan SIGAP
            </h2>
            <p className="text-xs sm:text-sm text-[#805533]">
              Enam kapabilitas kunci yang dirancang untuk keandalan dan kepatuhan regulasi pemerintahan desa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featureList.map((feat) => (
              <div
                key={feat.id}
                className="bg-white rounded-3xl p-6 border border-[#d0c5af]/25 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl">
                        {feat.icon}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#f6f3ea] text-[#735c00] border border-[#d0c5af]/30 uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-headline text-[#1c1c17] group-hover:text-[#735c00] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#4d4635] mt-1.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#d0c5af]/15 flex flex-wrap gap-1.5">
                  {feat.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-[#fcf9f0] text-[#735c00] px-2.5 py-0.5 rounded-md border border-[#d0c5af]/20"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA to test features */}
          <div className="bg-gradient-to-r from-[#f6f3ea] to-[#fcf9f0] p-6 rounded-3xl border border-[#d0c5af]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold font-headline text-[#1c1c17]">
                Ingin Menguji Coba Presensi atau Ekspor PDF?
              </h4>
              <p className="text-xs text-[#805533]">
                Navigasi langsung ke menu Presensi untuk uji coba kamera &amp; geofence, atau Rekap untuk unduh laporan PDF resmi.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('presensi')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white text-xs font-bold hover:shadow-md transition-all text-center"
              >
                Coba Presensi
              </button>
              <button
                onClick={() => onNavigate('rekap')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-[#735c00] border border-[#d0c5af]/40 text-xs font-bold hover:bg-stone-50 transition-all text-center"
              >
                Lihat Rekap
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: PROFIL PENGEMBANG - ARUNIKA KREATIF MEDIA */}
      {activeTab === 'pengembang' && (
        <section className="space-y-6">
          {/* Main Developer Spotlight Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d0c5af]/25 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#d0c5af]/20">
              {/* Logo Arunika Kreatif Media */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-3 border-2 border-[#d4af37]/40 shadow-lg flex items-center justify-center shrink-0">
                <img
                  src="https://res.cloudinary.com/maswardi/image/upload/v1792760931/akm1_u3kzra.png"
                  alt="Logo Arunika Kreatif Media"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Developer Intro Text */}
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#735c00] text-white uppercase tracking-wider">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Official Software &amp; Technology Partner
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-headline text-[#1c1c17] tracking-tight">
                  ARUNIKA KREATIF MEDIA
                </h2>
                <p className="text-xs sm:text-sm text-[#735c00] font-semibold italic">
                  &ldquo;Mitra Inovasi Teknologi &amp; Solusi Digital Pemerintahan Desa Indonesia&rdquo;
                </p>
                <p className="text-xs text-[#4d4635] leading-relaxed pt-1">
                  Arunika Kreatif Media adalah studio pengembang piranti lunak, arsitektur data cloud, dan media kreatif digital yang berfokus menghadirkan inovasi untuk percepatan transformasi digital desa, BUMDes, lembaga pendidikan, dan instansi publik di Indonesia.
                </p>
              </div>
            </div>

            {/* Role & Responsibility in SIGAP */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold font-headline text-[#1c1c17] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[#735c00] text-base">engineering</span>
                Peran Pengembang dalam Ekosistem SIGAP
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#fcf9f0] border border-[#d0c5af]/25 space-y-1.5">
                  <div className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                    Otorisasi &amp; Penerbit Lisensi Kode Desa
                  </div>
                  <p className="text-xs text-[#4d4635] leading-relaxed">
                    Menerbitkan dan mengelola <em>Developer License Key</em> resmi untuk setiap desa, memastikan hanya pemerintah desa terdaftar yang dapat mengaktivasi portal admin.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fcf9f0] border border-[#d0c5af]/25 space-y-1.5">
                  <div className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">dns</span>
                    Infrastruktur &amp; Keamanan Multi-Tenant
                  </div>
                  <p className="text-xs text-[#4d4635] leading-relaxed">
                    Merancang skema isolasi data desa di Supabase PostgreSQL, pembaruan keamanan enkripsi, dan keandalan sistem agar tetap cepat diakses di daerah jaringan terbatas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fcf9f0] border border-[#d0c5af]/25 space-y-1.5">
                  <div className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">support_agent</span>
                    Dukungan Teknis &amp; Pendampingan Lapangan
                  </div>
                  <p className="text-xs text-[#4d4635] leading-relaxed">
                    Memberikan pendampingan bimbingan teknis (Bimtek) bagi Sekretaris Desa dan Operator Desa dalam pengaturan awal koordinat balai desa serta input pegawai.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#fcf9f0] border border-[#d0c5af]/25 space-y-1.5">
                  <div className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">update</span>
                    Pembaruan Berkelanjutan &amp; Kustomisasi
                  </div>
                  <p className="text-xs text-[#4d4635] leading-relaxed">
                    Menyediakan pembaruan fitur berkala, penyesuaian format regulasi kedinasan setempat, dan integrasi modul lanjutan (misal payroll tunjangan kinerja aparatur).
                  </p>
                </div>
              </div>
            </div>

            {/* Layanan & Portofolio Arunika */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold font-headline text-[#1c1c17] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[#735c00] text-base">apps</span>
                Layanan &amp; Keahlian Arunika Kreatif Media
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#f6f3ea] rounded-xl text-center space-y-1">
                  <span className="material-symbols-outlined text-2xl text-[#735c00]">laptop_mac</span>
                  <div className="text-xs font-bold text-[#1c1c17]">Web &amp; Mobile App</div>
                  <div className="text-[10px] text-[#805533]">Aplikasi Kustom</div>
                </div>
                <div className="p-3 bg-[#f6f3ea] rounded-xl text-center space-y-1">
                  <span className="material-symbols-outlined text-2xl text-[#735c00]">location_city</span>
                  <div className="text-xs font-bold text-[#1c1c17]">Smart Village</div>
                  <div className="text-[10px] text-[#805533]">Sistem Desa Digital</div>
                </div>
                <div className="p-3 bg-[#f6f3ea] rounded-xl text-center space-y-1">
                  <span className="material-symbols-outlined text-2xl text-[#735c00]">database</span>
                  <div className="text-xs font-bold text-[#1c1c17]">Cloud &amp; Database</div>
                  <div className="text-[10px] text-[#805533]">Supabase &amp; Postgre</div>
                </div>
                <div className="p-3 bg-[#f6f3ea] rounded-xl text-center space-y-1">
                  <span className="material-symbols-outlined text-2xl text-[#735c00]">palette</span>
                  <div className="text-xs font-bold text-[#1c1c17]">Creative Branding</div>
                  <div className="text-[10px] text-[#805533]">Desain &amp; Multimedia</div>
                </div>
              </div>
            </div>

            {/* Contact & Consultation Box */}
            <div className="bg-gradient-to-br from-[#1c1c17] to-[#2a271e] text-white p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold font-headline text-[#ffe088]">
                    Hubungi Arunika Kreatif Media
                  </h4>
                  <p className="text-xs text-stone-300">
                    Layanan permohonan Lisensi Desa Baru, integrasi Supabase, dan konsultasi teknis
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#ffe088] text-2xl">
                  contact_support
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs">
                  <div className="text-stone-400 text-[10px] uppercase font-bold">Lembaga</div>
                  <div className="font-bold text-white mt-0.5">Arunika Kreatif Media</div>
                  <div className="text-[10px] text-stone-300 mt-1">Pengembang Resmi SIGAP</div>
                </div>

                <a
                  href="https://wa.me/6285150617732"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-emerald-500/20 p-3 rounded-xl border border-white/10 hover:border-emerald-400/40 transition-all text-xs group block"
                >
                  <div className="text-stone-400 text-[10px] uppercase font-bold flex items-center justify-between">
                    <span>WhatsApp / Hotline</span>
                    <span className="material-symbols-outlined text-xs text-emerald-400 group-hover:translate-x-0.5 transition-transform">open_in_new</span>
                  </div>
                  <div className="font-bold text-[#ffe088] group-hover:text-emerald-300 mt-0.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-emerald-400">chat</span>
                    <span>085150617732</span>
                  </div>
                  <div className="text-[10px] text-stone-300 mt-1">Konsultasi &amp; Lisensi Desa</div>
                </a>

                <a
                  href="mailto:arunikakreatifm@gmail.com"
                  className="bg-white/10 hover:bg-[#ffe088]/20 p-3 rounded-xl border border-white/10 hover:border-[#ffe088]/40 transition-all text-xs group block"
                >
                  <div className="text-stone-400 text-[10px] uppercase font-bold flex items-center justify-between">
                    <span>Email Resmi</span>
                    <span className="material-symbols-outlined text-xs text-[#ffe088] group-hover:translate-x-0.5 transition-transform">send</span>
                  </div>
                  <div className="font-bold text-white group-hover:text-[#ffe088] mt-0.5 truncate flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#ffe088]">mail</span>
                    <span>arunikakreatifm@gmail.com</span>
                  </div>
                  <div className="text-[10px] text-stone-300 mt-1">Kerjasama &amp; Korespondensi</div>
                </a>
              </div>
            </div>

            {/* Developer Portal Access Gate */}
            {onOpenDeveloperPortal && (
              <div className="p-4 rounded-2xl bg-white border border-[#d0c5af]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-xs text-[#1c1c17] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#735c00]">admin_panel_settings</span>
                    <span>Portal Penerbitan Lisensi &amp; Supabase Cloud</span>
                  </h4>
                  <p className="text-[11px] text-[#805533] mt-0.5">
                    Khusus manajemen pengembang Arunika Kreatif Media untuk aktivasi desa klien baru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenDeveloperPortal}
                  className="px-4 py-2 bg-[#1c1c17] hover:bg-[#333129] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-sm text-amber-300">vpn_key</span>
                  <span>Buka Portal Pengembang</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 4: HAK AKSES APARATUR / PERAN & LISENSI */}
      {activeTab === 'lisensi' && (
        <section className="space-y-6">
          {user.role === 'pegawai' ? (
            /* KHUSUS APARATUR DESA (PEGAWAI) */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d0c5af]/25 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-headline text-[#1c1c17]">
                    Hak Akses &amp; Wewenang Aparatur Desa
                  </h2>
                  <p className="text-xs text-[#805533]">
                    Penetapan wewenang akun aparatur guna menjamin integritas data dan transparansi kedinasan
                  </p>
                </div>
              </div>

              {/* Status Akun Pengguna Aktif */}
              <div className="p-4 rounded-2xl bg-[#fcf9f0] border border-[#d0c5af]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1c1c17]">{user.name}</h4>
                    <p className="text-[11px] text-[#805533]">
                      {user.jabatan} &bull; {user.instansi}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold self-start sm:self-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Aparatur Desa Terverifikasi</span>
                </div>
              </div>

              {/* 2 Kolom: Fasilitas yang Dimiliki vs Batasan Keamanan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Akses yang Diberikan */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base text-emerald-700">task_alt</span>
                    <span>Wewenang Anda (Diizinkan)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-emerald-950">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-600 mt-0.5">photo_camera</span>
                      <div>
                        <strong>Input Presensi Mandiri:</strong>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Merekam absensi Datang &amp; Pulang dengan swafoto kamera langsung saat berada dalam radius balai desa (≤50m).
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-600 mt-0.5">edit_note</span>
                      <div>
                        <strong>Laporan Kerja Harian (E-Kinerja):</strong>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Mengisi logbook tugas kedinasan harian, volume capaian kerja, dan mengunggah foto dokumentasi kegiatan.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-600 mt-0.5">picture_as_pdf</span>
                      <div>
                        <strong>Cetak Rekapitulasi PDF Resmi:</strong>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Mengunduh dan mencetak rekap presensi serta lembar kerja pribadi berformat dinas untuk keperluan pelaporan.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Batasan Keamanan */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-[#805533] font-bold text-xs uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base text-[#735c00]">lock</span>
                    <span>Batasan Akses (Terkunci)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#4d4635]">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-[#805533] mt-0.5">not_interested</span>
                      <div>
                        <strong>Konfigurasi Balai Desa &amp; GPS:</strong>
                        <p className="text-[11px] text-[#805533] leading-relaxed">
                          Titik koordinat balai desa, toleransi keterlambatan, dan jam kerja dikunci oleh Administrator Desa.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-[#805533] mt-0.5">key_off</span>
                      <div>
                        <strong>Portal Lisensi &amp; Multi-Desa:</strong>
                        <p className="text-[11px] text-[#805533] leading-relaxed">
                          Kode lisensi desa dan aktivasi tenant hanya dapat diakses oleh Pengembang (Arunika) dan Kades/Sekdes.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-[#805533] mt-0.5">shield_person</span>
                      <div>
                        <strong>Isolasi Data Rekan Kerja:</strong>
                        <p className="text-[11px] text-[#805533] leading-relaxed">
                          Setiap aparatur hanya memiliki hak akses atas rekap absensi dan laporan kerja miliknya sendiri.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Callout Info */}
              <div className="p-4 rounded-2xl bg-[#f6f3ea] border border-[#d0c5af]/30 flex items-center gap-3 text-xs text-[#4d4635]">
                <span className="material-symbols-outlined text-xl text-[#735c00]">security</span>
                <p className="leading-relaxed">
                  Jika terdapat kekeliruan data profil atau kebutuhan pergantian kata sandi akun aparatur, silakan berkoordinasi langsung dengan <strong>Sekretaris Desa / Admin Desa</strong> di kantor balai desa Anda.
                </p>
              </div>
            </div>
          ) : (
            /* KHUSUS ADMINISTRATOR DESA */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d0c5af]/25 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#735c00]/10 text-[#735c00] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">shield</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-headline text-[#1c1c17]">
                    Hierarki Peran &amp; Protokol Keamanan
                  </h2>
                  <p className="text-xs text-[#805533]">
                    Protokol pembagian wewenang antara Pengembang, Admin Desa, dan Aparatur
                  </p>
                </div>
              </div>

              {/* Hierarchy Graphic */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 p-4 rounded-2xl bg-[#1c1c17] text-white space-y-1 w-full border border-[#d4af37]/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#ffe088] uppercase tracking-wider">Tingkat 1</span>
                      <span className="material-symbols-outlined text-sm text-[#ffe088]">code</span>
                    </div>
                    <h4 className="font-bold text-sm">Pengembang (Arunika)</h4>
                    <p className="text-[11px] text-stone-300">
                      Menerbitkan Lisensi Resmi Desa &amp; memelihara infrastruktur basis data Supabase.
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-[#735c00] text-xl rotate-90 sm:rotate-0">
                    arrow_forward
                  </span>

                  <div className="flex-1 p-4 rounded-2xl bg-[#735c00] text-white space-y-1 w-full shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Tingkat 2</span>
                      <span className="material-symbols-outlined text-sm text-amber-200">admin_panel_settings</span>
                    </div>
                    <h4 className="font-bold text-sm">Admin Desa (Kades/Sekdes)</h4>
                    <p className="text-[11px] text-stone-200">
                      Memasukkan data desa, koordinat GPS balai, dan input akun aparatur desa.
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-[#735c00] text-xl rotate-90 sm:rotate-0">
                    arrow_forward
                  </span>

                  <div className="flex-1 p-4 rounded-2xl bg-emerald-800 text-white space-y-1 w-full shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Tingkat 3</span>
                      <span className="material-symbols-outlined text-sm text-emerald-200">badge</span>
                    </div>
                    <h4 className="font-bold text-sm">Aparatur Desa (Pegawai)</h4>
                    <p className="text-[11px] text-emerald-100">
                      Login akun, rekam presensi kamera langsung, buat laporan kerja, dan unduh PDF.
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Admin License Box */}
              {user.desaLicenseKey && (
                <div className="p-4 rounded-2xl bg-[#fcf9f0] border border-[#d0c5af]/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#805533]">
                      Kode Lisensi Desa Anda:
                    </div>
                    <div className="font-mono font-bold text-sm text-[#735c00]">
                      {user.desaLicenseKey}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.desaLicenseKey || '')}
                    className="px-3 py-1 bg-white border border-[#d0c5af]/40 hover:bg-[#f6f3ea] text-[#735c00] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedCode === user.desaLicenseKey ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedCode === user.desaLicenseKey ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              )}

              {/* Status Keamanan Basis Data Terisolasi */}
              <div className="p-4 rounded-2xl bg-[#f6f3ea] border border-[#d0c5af]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl text-[#735c00]">shield_lock</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#1c1c17]">
                      Isolasi Basis Data Desa Mandiri (Row-Level Security)
                    </h4>
                    <p className="text-[11px] text-[#805533]">
                      Data aparatur, absensi, dan laporan kerja desa Anda terenkripsi dan terisolasi. Konfigurasi basis data pusat dikelola eksklusif oleh Pengembang (Arunika Kreatif Media).
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0 self-start sm:self-center">
                  Terisolasi Aman
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Footer Info */}
      <footer className="text-center pt-4 pb-2 border-t border-[#d0c5af]/20 space-y-1">
        <p className="text-xs text-[#4d4635] font-semibold">
          SIGAP • Sistem Informasi &amp; Geofencing Presensi Aparatur Desa
        </p>
        <p className="text-[11px] text-[#805533]">
          Hak Cipta © {new Date().getFullYear()} <strong>ARUNIKA KREATIF MEDIA</strong>. Seluruh hak cipta dilindungi undang-undang.
        </p>
      </footer>
    </main>
  );
};
