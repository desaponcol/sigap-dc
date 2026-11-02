import React, { useState, useEffect } from 'react';
import {
  getRegisteredDesaLicenses,
  getRegisteredEmployees,
  verifyProductionLicense,
} from '../data/mockData.ts';
import { UserProfile, DesaLicense } from '../types/index.ts';
import { TenantInfo } from '../services/supabase.ts';

interface LoginScreenProps {
  targetVillage: TenantInfo;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile;
  onNavigateTentang?: () => void;
  onOpenDeveloperPortal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  targetVillage,
  onLoginSuccess,
  currentUser,
  onNavigateTentang,
  onOpenDeveloperPortal,
}) => {
  // Strict Role Modes: Pegawai or Admin Desa
  const [loginMode, setLoginMode] = useState<'pegawai' | 'admin_desa'>('admin_desa');

  // Find registered staff for target village
  const villageEmployees = getRegisteredEmployees(targetVillage.id);
  const villageAdmin = villageEmployees.find((e) => e.role === 'admin_desa');
  const villageStaff = villageEmployees.find((e) => e.role === 'pegawai') || villageEmployees[0];

  // Fields for Pegawai
  const [pegawaiEmail, setPegawaiEmail] = useState(villageStaff ? villageStaff.email : '');
  const [pegawaiPassword, setPegawaiPassword] = useState(villageStaff?.password || 'gonggang123');

  // Fields for Admin Desa
  const [adminLicenseKey, setAdminLicenseKey] = useState(targetVillage.licenseKey || '');
  const [adminEmail, setAdminEmail] = useState(
    targetVillage.adminEmail || villageAdmin?.email || `admin@${targetVillage.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '')}.desa.go.id`
  );
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [iconVariant, setIconVariant] = useState<'fingerprint' | 'shield'>('shield');

  // Synchronize defaults if target village changes
  useEffect(() => {
    const employees = getRegisteredEmployees(targetVillage.id);
    const admin = employees.find((e) => e.role === 'admin_desa');
    const staff = employees.find((e) => e.role === 'pegawai') || employees[0];

    setAdminLicenseKey(targetVillage.licenseKey || '');
    setAdminEmail(
      targetVillage.adminEmail || admin?.email || `admin@${targetVillage.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '')}.desa.go.id`
    );
    setAdminPassword('admin123');

    if (staff) {
      setPegawaiEmail(staff.email);
      setPegawaiPassword(staff.password || 'password123');
    }
    setErrorMessage(null);
  }, [targetVillage]);

  const handleModeSwitch = (mode: 'pegawai' | 'admin_desa') => {
    setLoginMode(mode);
    setErrorMessage(null);
  };

  // Quick fill helper for the target village
  const handleQuickFillAdmin = () => {
    setAdminLicenseKey(targetVillage.licenseKey || '');
    setAdminEmail(
      targetVillage.adminEmail || `admin@${targetVillage.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '')}.desa.go.id`
    );
    setAdminPassword('admin123');
    setErrorMessage(null);
  };

  const handleQuickFillPegawai = () => {
    if (villageStaff) {
      setPegawaiEmail(villageStaff.email);
      setPegawaiPassword(villageStaff.password || 'password123');
    } else {
      setPegawaiEmail(`pegawai@${targetVillage.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '')}.desa.go.id`);
      setPegawaiPassword('desa123');
    }
    setErrorMessage(null);
  };

  // Quick fill test button to trigger a cross-village rejection test
  const handleTestCrossVillageRejection = () => {
    const isGonggang = targetVillage.namaDesa.toLowerCase().includes('gonggang');
    const foreignLicense = isGonggang ? 'SIGAP-PCL3520-2025-8841' : 'SIGAP-GGG3520-2025-1102';
    const foreignName = isGonggang ? 'Desa Poncol' : 'Desa Gonggang';
    
    setAdminLicenseKey(foreignLicense);
    setAdminEmail(`admin@${isGonggang ? 'poncol' : 'gonggang'}.desa.go.id`);
    setAdminPassword('admin123');
    setErrorMessage(
      `⚠️ Percobaan Uji Keamanan: Kode lisensi diisi dengan milik ${foreignName}. Silakan klik tombol "Masuk Sebagai Admin Desa" di bawah untuk menguji penolakan otomatis.`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (loginMode === 'admin_desa') {
      const cleanLicense = adminLicenseKey.trim().toUpperCase();
      const targetOfficialKey = (targetVillage.licenseKey || '').trim().toUpperCase();

      // Master Developer Override Check
      const isMasterKey = cleanLicense === 'SIGAP-DEV-MASTER' || cleanLicense === 'SIGAP-PROD-2025-AKM99';

      if (!isMasterKey) {
        // 1. Strict Village Isolation Check:
        // Check if the input key belongs to ANOTHER village
        const allLicenses = getRegisteredDesaLicenses();
        const foreignLicense = allLicenses.find(
          (l) => l.licenseKey.toUpperCase() === cleanLicense && l.id !== targetVillage.id
        );

        if (foreignLicense) {
          setIsLoading(false);
          setErrorMessage(
            `⛔ AKSES DITOLAK: Kode lisensi "${adminLicenseKey}" terdaftar resmi untuk BALAI ${foreignLicense.namaDesa.toUpperCase()} (${foreignLicense.kabupaten})! Anda saat ini berada di portal khusus BALAI ${targetVillage.namaDesa.toUpperCase()}. Akses lintas desa diblokir untuk menjaga kerahasiaan data aparatur.`
          );
          return;
        }

        // 2. Validate that it matches the target village's license
        const isMatchTarget =
          cleanLicense === targetOfficialKey ||
          (cleanLicense.length >= 8 && targetOfficialKey.startsWith(cleanLicense)) ||
          cleanLicense === `SIGAP-${targetVillage.namaDesa.replace(/desa\s+/gi, '').slice(0, 3).toUpperCase()}`;

        if (!isMatchTarget) {
          setIsLoading(false);
          setErrorMessage(
            `⛔ AKSES DITOLAK: Nomor lisensi "${adminLicenseKey}" tidak valid untuk Balai ${targetVillage.namaDesa}. Pastikan Anda memasukkan kode lisensi resmi yang diterbitkan oleh Arunika Kreatif Media.`
          );
          return;
        }

        // 3. Password Verification
        if (adminPassword.trim() !== 'admin123' && adminPassword.trim() !== 'password123') {
          setIsLoading(false);
          setErrorMessage(
            `❌ Kata sandi Administrator ${targetVillage.namaDesa} salah. Silakan periksa kembali kata sandi Anda.`
          );
          return;
        }
      }

      // Successful Admin Authentication for target village
      const allEmployees = getRegisteredEmployees();
      const foundAdmin = allEmployees.find(
        (u) =>
          u.tenantId === targetVillage.id &&
          (u.role === 'admin_desa' || u.email.toLowerCase() === adminEmail.trim().toLowerCase())
      );

      setTimeout(() => {
        setIsLoading(false);
        const resolvedAdmin: UserProfile = {
          id: foundAdmin?.id || `adm-${targetVillage.id}`,
          role: 'admin_desa',
          name: foundAdmin?.name || (targetVillage.contactPerson ? targetVillage.contactPerson.replace(/\s*\(.*\)/, '') : `Admin ${targetVillage.namaDesa}`),
          email: adminEmail.trim(),
          nip: foundAdmin?.nip || '19820412 200801 1 005',
          jabatan: foundAdmin?.jabatan || `Sekretaris Desa / Admin (${targetVillage.namaDesa})`,
          instansi: `Kantor Balai ${targetVillage.namaDesa}`,
          avatarUrl:
            foundAdmin?.avatarUrl ||
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          tenantId: targetVillage.id,
          desaLicenseKey: targetVillage.licenseKey,
        };

        onLoginSuccess(resolvedAdmin);
      }, 350);
    } else {
      // Mode: Pegawai (Aparatur Desa)
      const allEmployees = getRegisteredEmployees();
      const inputClean = pegawaiEmail.trim().toLowerCase();

      // Find by email or nip
      const foundPegawai = allEmployees.find(
        (u) =>
          u.role === 'pegawai' &&
          (u.email.toLowerCase() === inputClean ||
            (u.nip && u.nip.replace(/\s/g, '') === inputClean.replace(/\s/g, '')))
      );

      if (!foundPegawai) {
        setIsLoading(false);
        setErrorMessage(
          `❌ Akun aparatur "${pegawaiEmail}" tidak ditemukan di database Balai ${targetVillage.namaDesa}. Pastikan NIP/Email telah didaftarkan oleh Administrator Desa.`
        );
        return;
      }

      // Check if employee belongs to this village
      if (foundPegawai.tenantId !== targetVillage.id) {
        const allLicenses = getRegisteredDesaLicenses();
        const foreignVillage = allLicenses.find((l) => l.id === foundPegawai.tenantId);
        setIsLoading(false);
        setErrorMessage(
          `⛔ AKSES DITOLAK: Aparatur "${foundPegawai.name}" terdaftar resmi di Kantor Balai ${foreignVillage?.namaDesa || 'desa lain'}, bukan aparatur Balai ${targetVillage.namaDesa}. Silakan buka tautan resmi balai desa Anda.`
        );
        return;
      }

      // Verify employee password
      if (foundPegawai.password && foundPegawai.password !== pegawaiPassword.trim()) {
        setIsLoading(false);
        setErrorMessage(
          `❌ Kata sandi yang Anda masukkan salah. Silakan tanyakan kata sandi resmi yang telah dibuatkan oleh Admin Balai ${targetVillage.namaDesa}.`
        );
        return;
      }

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          ...foundPegawai,
          instansi: `Kantor Balai ${targetVillage.namaDesa}`,
          desaLicenseKey: targetVillage.licenseKey,
        });
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
          {/* Official Village Header Banner */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-[#735c00] to-[#d4af37] shadow-xl mb-3 transform rotate-1 transition-transform">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                holiday_village
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-[#735c00] text-[11px] font-bold uppercase tracking-wider mb-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Portal Resmi Balai Desa Terisolasi</span>
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c17]">
              {targetVillage.namaDesa.toUpperCase()}
            </h1>
            <p className="font-label text-xs sm:text-sm tracking-wide text-[#805533] font-semibold mt-0.5">
              Kecamatan {targetVillage.kecamatan || 'Poncol'} &bull; Kabupaten {targetVillage.kabupaten || 'Magetan'} &bull; Jawa Timur
            </p>
            <p className="text-[11px] text-[#5E4B32] mt-1">
              Sistem Presensi Geofencing &amp; Administrasi Aparatur Pemerintah Desa
            </p>
          </div>

          {/* Role Mode Tabs (Clean & Strict Separation) */}
          <div className="bg-[#f6f3ea] p-1.5 rounded-2xl border border-[#d0c5af]/30 mb-4 flex shadow-inner">
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
              <span>Admin Balai {targetVillage.namaDesa.replace(/desa\s+/gi, '')}</span>
            </button>
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
              <span>Aparatur (Pegawai)</span>
            </button>
          </div>

          {/* Main Login Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(28,28,23,0.06)] border border-[#d0c5af]/20">
            {/* Header info per mode */}
            {loginMode === 'admin_desa' ? (
              <div className="mb-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-[#735c00]">
                    Masuk Administrator Desa
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#735c00] text-white tracking-wider shadow-sm">
                    🔒 Lisensi Terkunci
                  </span>
                </div>
                <p className="text-[#4d4635] text-xs leading-relaxed">
                  Akses khusus Kepala Desa &amp; Sekdes <strong>{targetVillage.namaDesa}</strong>. Wajib memasukkan <strong>Nomor Lisensi Unik</strong> resmi balai desa Anda.
                </p>
              </div>
            ) : (
              <div className="mb-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-[#1c1c17]">
                    Masuk Aparatur Balai Desa
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wider">
                    Presensi &amp; Kinerja
                  </span>
                </div>
                <p className="text-[#4d4635] text-xs leading-relaxed">
                  Masukkan email atau NIP beserta kata sandi yang telah didaftarkan oleh <strong>Admin Balai {targetVillage.namaDesa}</strong>.
                </p>
              </div>
            )}

            {/* Error / Alert Message Box */}
            {errorMessage && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn leading-relaxed ${
                  errorMessage.includes('⚠️')
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-red-50 border-red-200 text-red-900 font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">
                  {errorMessage.includes('⚠️') ? 'info' : 'shield_lock'}
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Admin Mode: License Key Field */}
              {loginMode === 'admin_desa' && (
                <div className="space-y-1">
                  <label
                    className="block font-label text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] ml-1 flex items-center justify-between"
                    htmlFor="adminLicense"
                  >
                    <span>Kode Lisensi Resmi Balai {targetVillage.namaDesa}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold lowercase">
                      wajib dicocokkan
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
                      placeholder={`Contoh: ${targetVillage.licenseKey || 'SIGAP-XXX...'}`}
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[#5E4B32] px-1 font-medium">
                    Lisensi desa Anda: <code className="font-bold text-[#735c00]">{targetVillage.licenseKey}</code>
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
                    ? `Email / NIP Aparatur ${targetVillage.namaDesa}`
                    : `Email Administrator ${targetVillage.namaDesa}`}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg">
                    {loginMode === 'pegawai' ? 'badge' : 'alternate_email'}
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
                    placeholder={
                      loginMode === 'pegawai'
                        ? 'nama@desa.go.id atau NIP'
                        : `admin@${targetVillage.namaDesa.toLowerCase().replace(/desa\s+/gi, '')}.desa.go.id`
                    }
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
                    Kata Sandi {loginMode === 'pegawai' ? '(Diberikan Admin Desa)' : ''}
                  </label>
                  {loginMode === 'pegawai' && (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Silakan hubungi Administrator Balai ${targetVillage.namaDesa} (Kepala Desa / Sekdes) untuk meminta atau mereset kata sandi login Anda.`
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
                        {loginMode === 'admin_desa'
                          ? `Masuk Sebagai Admin ${targetVillage.namaDesa.replace(/desa\s+/gi, '')}`
                          : `Masuk Sebagai Aparatur ${targetVillage.namaDesa.replace(/desa\s+/gi, '')}`}
                      </span>
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Testing Helper: Tailored specifically to targetVillage */}
            <div className="mt-6 pt-4 border-t border-[#d0c5af]/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#805533] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#735c00]">vpn_key</span>
                  <span>Bantuan Kredensial Uji Coba:</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {targetVillage.namaDesa}
                </span>
              </div>

              <div className="space-y-2">
                {loginMode === 'admin_desa' ? (
                  <button
                    type="button"
                    onClick={handleQuickFillAdmin}
                    className="w-full p-2.5 rounded-xl bg-[#fff9ea] hover:bg-[#fbf4de] border border-[#d4af37]/40 transition-all cursor-pointer flex items-center justify-between text-left active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#735c00]"></span>
                      <div>
                        <p className="text-xs font-bold text-[#735c00]">
                          Admin Balai {targetVillage.namaDesa}
                        </p>
                        <p className="text-[10px] text-[#805533] font-mono">
                          Lisensi: {targetVillage.licenseKey} &bull; Pass: admin123
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#735c00] bg-white px-2 py-1 rounded-lg border border-[#d4af37]/40 shadow-xs">
                      Isi Otomatis
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleQuickFillPegawai}
                    className="w-full p-2.5 rounded-xl bg-[#f6f3ea] hover:bg-[#ebe8df] border border-[#d0c5af]/30 transition-all cursor-pointer flex items-center justify-between text-left active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      <div>
                        <p className="text-xs font-bold text-[#1c1c17]">
                          {villageStaff?.name || `Aparatur ${targetVillage.namaDesa}`}
                        </p>
                        <p className="text-[10px] text-[#805533]">
                          {villageStaff?.email || `pegawai@${targetVillage.namaDesa.toLowerCase().replace(/desa\s+/gi, '')}.desa.go.id`} &bull; Pass: {villageStaff?.password || 'password123'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#735c00] bg-white px-2 py-1 rounded-lg border border-[#d0c5af]/25 shadow-xs">
                      Isi Otomatis
                    </span>
                  </button>
                )}

                {/* Security Verification Demonstration Button */}
                <button
                  type="button"
                  onClick={handleTestCrossVillageRejection}
                  className="w-full p-2 rounded-xl bg-red-50/70 hover:bg-red-100/70 border border-red-200/60 transition-all cursor-pointer flex items-center justify-between text-left active:scale-[0.99]"
                  title="Klik untuk menguji bahwa lisensi desa lain akan ditolak"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-red-600">shield</span>
                    <span className="text-[11px] font-semibold text-red-800">
                      Uji Keamanan: Coba Masuk dengan Lisensi Desa Lain
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-red-700 bg-white px-1.5 py-0.5 rounded border border-red-200">
                    Cek Tolak
                  </span>
                </button>
              </div>
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
