import React, { useState } from 'react';
import {
  getRegisteredDesaLicenses,
  getRegisteredEmployees,
  verifyProductionLicense,
} from '../data/mockData.ts';
import { UserProfile } from '../types/index.ts';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile;
  onNavigateTentang?: () => void;
  onOpenDeveloperPortal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  currentUser,
  onNavigateTentang,
  onOpenDeveloperPortal,
}) => {
  // Strict Role Modes: Pegawai or Admin Desa
  const [loginMode, setLoginMode] = useState<'pegawai' | 'admin_desa'>('pegawai');

  // Fields for Pegawai
  const [pegawaiEmail, setPegawaiEmail] = useState('budi@poncol.desa.go.id');
  const [pegawaiPassword, setPegawaiPassword] = useState('poncol123');

  // Fields for Admin Desa
  const [adminLicenseKey, setAdminLicenseKey] = useState('SIGAP-PCL3520-2025-8841');
  const [adminEmail, setAdminEmail] = useState('admin@poncol.desa.go.id');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [iconVariant, setIconVariant] = useState<'fingerprint' | 'shield'>('fingerprint');

  const handleModeSwitch = (mode: 'pegawai' | 'admin_desa') => {
    setLoginMode(mode);
    setErrorMessage(null);
  };

  // Quick fill helper for testing without leaking database to public UI
  const handleQuickFillPegawai = () => {
    setPegawaiEmail('budi@poncol.desa.go.id');
    setPegawaiPassword('poncol123');
    setErrorMessage(null);
  };

  const handleQuickFillAdmin = () => {
    setAdminLicenseKey('SIGAP-PCL3520-2025-8841');
    setAdminEmail('admin@poncol.desa.go.id');
    setAdminPassword('admin123');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (loginMode === 'admin_desa') {
      // 1. Validate Official License Key
      const verification = verifyProductionLicense(adminLicenseKey);
      if (!verification.valid) {
        setIsLoading(false);
        setErrorMessage(
          `❌ ${verification.message} Hubungi Arunika Kreatif Media di WhatsApp 085150617732 untuk verifikasi lisensi desa Anda.`
        );
        return;
      }

      const targetDesa = verification.license;
      const allEmployees = getRegisteredEmployees();
      const foundAdmin = allEmployees.find(
        (u) =>
          u.role === 'admin_desa' &&
          (u.email.toLowerCase() === adminEmail.trim().toLowerCase() ||
            u.tenantId === targetDesa?.id)
      );

      setTimeout(() => {
        setIsLoading(false);
        if (foundAdmin) {
          onLoginSuccess({
            ...foundAdmin,
            tenantId: targetDesa?.id || foundAdmin.tenantId,
            instansi: `Kantor Balai ${targetDesa?.namaDesa || foundAdmin.instansi}`,
            desaLicenseKey: adminLicenseKey,
          });
        } else {
          // Dynamic admin verified strictly with the official license
          onLoginSuccess({
            ...currentUser,
            id: `adm-${Date.now()}`,
            role: 'admin_desa',
            email: adminEmail,
            name: adminEmail.split('@')[0].toUpperCase(),
            jabatan: `Sekretaris Desa / Admin (${targetDesa?.namaDesa || 'Desa'})`,
            instansi: `Kantor Balai ${targetDesa?.namaDesa || 'Desa'}`,
            tenantId: targetDesa?.id || 'c0000000-0000-0000-0000-000000000003',
            desaLicenseKey: adminLicenseKey,
          });
        }
      }, 350);
    } else {
      // Pegawai Portal: Login using credentials provided by Admin Desa
      const allEmployees = getRegisteredEmployees();
      const inputClean = pegawaiEmail.trim().toLowerCase();

      // Find by email or nip
      const foundPegawai = allEmployees.find(
        (u) =>
          u.role === 'pegawai' &&
          (u.email.toLowerCase() === inputClean || u.nip?.replace(/\s/g, '') === inputClean.replace(/\s/g, ''))
      );

      setTimeout(() => {
        setIsLoading(false);
        if (foundPegawai) {
          // Verify password if provided
          if (foundPegawai.password && foundPegawai.password !== pegawaiPassword.trim()) {
            setErrorMessage(
              'Kata sandi yang Anda masukkan salah. Silakan tanyakan kata sandi resmi yang telah dibuatkan oleh Admin Desa Anda.'
            );
            return;
          }

          // Match village license for this employee
          const allLicenses = getRegisteredDesaLicenses();
          const empVillage = allLicenses.find((l) => l.id === foundPegawai.tenantId);

          onLoginSuccess({
            ...foundPegawai,
            instansi: empVillage ? `Kantor Balai ${empVillage.namaDesa}` : foundPegawai.instansi,
            desaLicenseKey: empVillage?.licenseKey || foundPegawai.desaLicenseKey,
          });
        } else {
          setErrorMessage(
            'Akun aparatur desa tidak ditemukan. Pastikan Anda telah didaftarkan oleh Administrator Desa Anda.'
          );
        }
      }, 350);
    }
  };

  return (
    <div className="bg-[#fcf9f0] font-body text-[#1c1c17] min-h-screen flex flex-col relative overflow-hidden">
      {/* Texture Layer */}
      <div className="fixed inset-0 pointer-events-none grain-texture"></div>

      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#ffe088]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#fdc39a]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-lg">
          {/* Brand Identity */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() =>
                setIconVariant((prev) => (prev === 'fingerprint' ? 'shield' : 'fingerprint'))
              }
              title="Ganti varian ikon"
              className="inline-flex items-center justify-center w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-[#735c00] to-[#d4af37] shadow-xl mb-3 transform rotate-3 active:scale-95 transition-transform cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {iconVariant === 'fingerprint' ? 'fingerprint' : 'shield_person'}
              </span>
            </button>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-[#735c00] mb-1">
              SIGAP DESA
            </h1>
            <p className="font-label text-xs sm:text-sm tracking-wide text-[#805533] font-semibold">
              Presensi Geofencing aparatur desa
            </p>
          </div>

          {/* Role Mode Tabs (Clean & Strict Separation) */}
          <div className="bg-[#f6f3ea] p-1.5 rounded-2xl border border-[#d0c5af]/30 mb-4 flex shadow-inner">
            <button
              type="button"
              onClick={() => handleModeSwitch('pegawai')}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMode === 'pegawai'
                  ? 'bg-white text-[#735c00] shadow-md border border-[#d0c5af]/25'
                  : 'text-[#805533] hover:text-[#735c00]'
              }`}
            >
              <span className="material-symbols-outlined text-base">badge</span>
              <span>Portal Aparatur (Pegawai)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('admin_desa')}
              className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMode === 'admin_desa'
                  ? 'bg-gradient-to-r from-[#735c00] to-[#8c7000] text-white shadow-md'
                  : 'text-[#805533] hover:text-[#735c00]'
              }`}
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Portal Administrator Desa</span>
            </button>
          </div>

          {/* Main Login Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(28,28,23,0.06)] border border-[#d0c5af]/20">
            {/* Header info per mode */}
            {loginMode === 'pegawai' ? (
              <div className="mb-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-[#1c1c17]">
                    Masuk Sebagai Aparatur Desa
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wider">
                    Presensi &amp; Laporan
                  </span>
                </div>
                <p className="text-[#4d4635] text-xs leading-relaxed">
                  Masukkan email atau NIP beserta <strong>kata sandi</strong> yang telah dibuatkan dan diberikan oleh <strong>Administrator Desa</strong> Anda.
                </p>
              </div>
            ) : (
              <div className="mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-[#735c00]">
                    Masuk Administrator Desa
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#735c00] text-white tracking-wider shadow-sm">
                    🔒 Lisensi Resmi
                  </span>
                </div>
                <p className="text-[#4d4635] text-xs leading-relaxed">
                  Akses khusus Kepala Desa / Sekdes. Masuk menggunakan <strong>Nomor Lisensi Resmi Desa</strong> yang diterbitkan oleh <strong>Arunika Kreatif Media</strong>.
                </p>
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">
                  error
                </span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* If Admin Mode: Require Official License Key Given by Developer */}
              {loginMode === 'admin_desa' && (
                <div className="space-y-1">
                  <label
                    className="block font-label text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] ml-1 flex items-center justify-between"
                    htmlFor="adminLicense"
                  >
                    <span>Nomor Lisensi Resmi Desa (Diberikan Pengembang)</span>
                    <span className="text-[10px] text-[#805533] lowercase font-normal">
                      wajib untuk verifikasi
                    </span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#735c00] text-lg">
                      vpn_key
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-[#fff8e7] border-2 border-[#d4af37]/60 rounded-xl text-[#1c1c17] placeholder-[#8A7A66] focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/30 focus:outline-none transition-all text-xs font-mono font-bold uppercase"
                      id="adminLicense"
                      name="adminLicense"
                      value={adminLicenseKey}
                      onChange={(e) => setAdminLicenseKey(e.target.value)}
                      placeholder="Contoh: SIGAP-PCL3520-2025-8841"
                      required
                    />
                  </div>
                  <p className="text-xs text-[#5E4B32] px-1 font-medium">
                    Format resmi: <code>SIGAP-[KODE]-[TAHUN]-[SERIAL]</code>
                  </p>
                </div>
              )}

              {/* Email / Username Field */}
              <div className="space-y-1">
                <label
                  className="block font-label text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] ml-1"
                  htmlFor="loginEmail"
                >
                  {loginMode === 'pegawai'
                    ? 'Email / NIP Aparatur Desa'
                    : 'Email Administrator Desa'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg">
                    {loginMode === 'pegawai' ? 'mail' : 'shield_person'}
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl text-[#1c1c17] placeholder-[#8A7A66] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] focus:outline-none transition-all text-xs"
                    id="loginEmail"
                    name="loginEmail"
                    value={loginMode === 'pegawai' ? pegawaiEmail : adminEmail}
                    onChange={(e) =>
                      loginMode === 'pegawai'
                        ? setPegawaiEmail(e.target.value)
                        : setAdminEmail(e.target.value)
                    }
                    placeholder={loginMode === 'pegawai' ? 'nama@desa.go.id atau NIP' : 'admin@desa.go.id'}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label
                    className="font-label text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D]"
                    htmlFor="loginPassword"
                  >
                    Kata Sandi {loginMode === 'pegawai' ? '(Dari Admin Desa)' : ''}
                  </label>
                  {loginMode === 'pegawai' && (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Silakan hubungi Administrator Desa Anda (Kepala Desa / Sekdes) untuk meminta atau mereset kata sandi login Anda.'
                        )
                      }
                      className="text-[10px] font-bold uppercase tracking-widest text-[#6B4F1D] hover:text-[#5C4300] transition-colors cursor-pointer"
                    >
                      Lupa Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-11 py-3 bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl text-[#1c1c17] placeholder-[#8A7A66] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] focus:outline-none transition-all text-xs"
                    id="loginPassword"
                    name="loginPassword"
                    value={loginMode === 'pegawai' ? pegawaiPassword : adminPassword}
                    onChange={(e) =>
                      loginMode === 'pegawai'
                        ? setPegawaiPassword(e.target.value)
                        : setAdminPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7f7663] hover:text-[#1c1c17] cursor-pointer"
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  className={`w-full h-12 text-white font-headline font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                    loginMode === 'admin_desa'
                      ? 'bg-gradient-to-r from-[#735c00] to-[#8c7000] hover:from-[#5e4b00] hover:to-[#735c00] shadow-[#735c00]/25'
                      : 'bg-gradient-to-r from-[#735c00] to-[#d4af37] shadow-[#735c00]/20'
                  }`}
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <span>
                        {loginMode === 'pegawai'
                          ? 'Masuk Sebagai Aparatur Desa'
                          : 'Masuk Sebagai Admin Desa'}
                      </span>
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Testing Helper: Isolated sample account helper without exposing whole tenant list */}
            <div className="mt-6 pt-4 border-t border-[#d0c5af]/20 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#805533] block mb-2">
                Bantuan Uji Coba Cepat:
              </span>

              {loginMode === 'pegawai' ? (
                <button
                  type="button"
                  onClick={handleQuickFillPegawai}
                  className="w-full p-2.5 rounded-xl bg-[#f6f3ea] hover:bg-[#ebe8df] border border-[#d0c5af]/30 transition-all cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <div>
                      <p className="text-xs font-bold text-[#1c1c17]">Budi Santoso, S.AP</p>
                      <p className="text-[10px] text-[#805533]">Kaur Keuangan &bull; budi@poncol.desa.go.id</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#735c00] bg-white px-2 py-1 rounded-lg border border-[#d0c5af]/25">
                    Isi Otomatis
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="w-full p-2.5 rounded-xl bg-[#fff9ea] hover:bg-[#fbf4de] border border-[#d4af37]/40 transition-all cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#735c00]"></span>
                    <div>
                      <p className="text-xs font-bold text-[#735c00]">Siti Rahayu, S.IP (Admin Desa Poncol)</p>
                      <p className="text-[10px] text-[#805533]">Lisensi: SIGAP-PCL3520-2025-8841</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#735c00] bg-white px-2 py-1 rounded-lg border border-[#d4af37]/40">
                    Isi Otomatis
                  </span>
                </button>
              )}
            </div>

            {/* Official Licensing Support info */}
            <div className="mt-5 pt-3 border-t border-[#d0c5af]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#4d4635]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                <span>Penerbitan Lisensi: <strong>Arunika Kreatif Media</strong></span>
              </div>
              <a
                href="https://wa.me/6285150617732?text=Halo%20Arunika%20Kreatif%20Media,%20saya%20ingin%20berkonsultasi%20mengenai%20Lisensi%20SIGAP%20Desa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
              >
                <span>WhatsApp: 085150617732</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer with Protected Developer Portal Button */}
      <footer className="p-6 text-center relative z-10 space-y-3">
        <div className="flex flex-wrap justify-center gap-3">
          {onNavigateTentang && (
            <button
              type="button"
              onClick={onNavigateTentang}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white text-xs font-bold text-[#735c00] border border-[#d0c5af]/40 shadow-xs hover:shadow-md transition-all active:scale-95 group cursor-pointer"
            >
              <img
                src="https://res.cloudinary.com/maswardi/image/upload/v1792760931/akm1_u3kzra.png"
                alt="Arunika Kreatif Media Logo"
                className="w-5 h-5 object-contain"
              />
              <span>Tentang Aplikasi SIGAP &amp; Profil Pengembang</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          )}

          {/* Protected Super Admin / Developer Portal Button */}
          {onOpenDeveloperPortal && (
            <button
              type="button"
              onClick={onOpenDeveloperPortal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1c1c17] hover:bg-[#333129] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              title="Khusus Pengembang Arunika Kreatif Media (Memerlukan PIN Pengembang)"
            >
              <span className="material-symbols-outlined text-sm text-amber-300">vpn_key</span>
              <span>Portal Pengembang (Arunika Kreatif Media)</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-8 bg-[#d0c5af]/40"></div>
          <p className="font-label text-[10px] uppercase tracking-widest text-[#7f7663]">
            Isolasi Data Multi-Tenant &bull; SIGAP Desa Enterprise
          </p>
          <div className="h-px w-8 bg-[#d0c5af]/40"></div>
        </div>
        <p className="text-[10px] text-[#4d4635]/70 font-medium">
          © {new Date().getFullYear()} ARUNIKA KREATIF MEDIA &bull; Lisensi Eksklusif Desa Mandiri. Kontak Resmi WA: 085150617732 | Email: arunikakreatifm@gmail.com
        </p>
      </footer>
    </div>
  );
};
