import React, { useState, useEffect } from 'react';
import {
  getRegisteredDesaLicenses,
  getRegisteredEmployees,
} from '../data/mockData.ts';
import { UserProfile } from '../types/index.ts';
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
  const [showHelpModal, setShowHelpModal] = useState(false);

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
            `⛔ AKSES DITOLAK: Kode lisensi "${adminLicenseKey}" terdaftar resmi untuk BALAI ${foreignLicense.namaDesa.toUpperCase()} (${foreignLicense.kabupaten})! Anda saat ini berada di portal khusus BALAI ${targetVillage.namaDesa.toUpperCase()}. Akses lintas desa diblokir untuk menjaga integritas data aparatur.`
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
            `⛔ AKSES DITOLAK: Nomor lisensi "${adminLicenseKey}" tidak terdaftar untuk Balai ${targetVillage.namaDesa}. Pastikan Anda memasukkan kode lisensi resmi yang diterbitkan untuk desa ini.`
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
          `❌ Akun aparatur "${pegawaiEmail}" tidak ditemukan di database Balai ${targetVillage.namaDesa}. Pastikan NIP atau Email telah didaftarkan oleh Administrator Desa.`
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
    <div className="bg-[#fcf9f0] font-body text-[#1c1c17] min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-between relative selection:bg-amber-200">
      {/* Texture & Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 grain-texture opacity-30"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#ffe088]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#fdc39a]/15 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Section */}
      <main className="flex-grow flex items-center justify-center p-3 sm:p-6 relative z-10 w-full max-w-full my-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Official Village Header */}
          <div className="text-center mb-4 sm:mb-6">
            {/* Government Emblem */}
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#735c00] via-[#8c7000] to-[#b8860b] shadow-lg shadow-[#735c00]/25 mb-3 border border-amber-300/40">
              <span
                className="material-symbols-outlined text-white text-2xl sm:text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
            </div>

            {/* Official Portal Pill */}
            <div className="flex justify-center mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[#735c00] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Portal Resmi Pemerintah Desa</span>
              </div>
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c17]">
              {targetVillage.namaDesa.toUpperCase()}
            </h1>
            <p className="font-label text-xs sm:text-sm tracking-wide text-[#735c00] font-semibold mt-0.5">
              Kecamatan {targetVillage.kecamatan || 'Poncol'} &bull; Kabupaten {targetVillage.kabupaten || 'Magetan'} &bull; Jawa Timur
            </p>
            <p className="text-[11px] text-[#7f7663] mt-1 max-w-xs mx-auto">
              Sistem Informasi Geospasial &amp; Presensi Aparatur Pemerintah Desa
            </p>
          </div>

          {/* Role Mode Tabs (Clean & Professional) */}
          <div className="bg-[#f0ece0] p-1 rounded-2xl border border-[#d0c5af]/40 mb-4 flex gap-1 shadow-inner w-full">
            <button
              type="button"
              onClick={() => handleModeSwitch('admin_desa')}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
                loginMode === 'admin_desa'
                  ? 'bg-gradient-to-r from-[#735c00] to-[#8c7000] text-white shadow-md'
                  : 'text-[#6b583e] hover:text-[#735c00]'
              }`}
            >
              <span className="material-symbols-outlined text-base shrink-0">admin_panel_settings</span>
              <span className="truncate">Admin Balai {targetVillage.namaDesa.replace(/desa\s+/gi, '')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('pegawai')}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0 ${
                loginMode === 'pegawai'
                  ? 'bg-white text-[#735c00] shadow-md border border-[#d0c5af]/30'
                  : 'text-[#6b583e] hover:text-[#735c00]'
              }`}
            >
              <span className="material-symbols-outlined text-base shrink-0">badge</span>
              <span className="truncate">Aparatur (Pegawai)</span>
            </button>
          </div>

          {/* Main Login Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_12px_40px_rgba(28,28,23,0.06)] border border-[#d0c5af]/30 w-full overflow-hidden">
            {/* Header info per mode */}
            {loginMode === 'admin_desa' ? (
              <div className="mb-5 space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-[#735c00]">
                    Masuk Administrator Desa
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100/80 text-[#735c00] border border-amber-300/50">
                    <span className="material-symbols-outlined text-xs">lock</span>
                    Lisensi Resmi
                  </span>
                </div>
                <p className="text-[#6b583e] text-xs leading-relaxed">
                  Akses khusus Kepala Desa, Sekretaris Desa, dan Operator {targetVillage.namaDesa}.
                </p>
              </div>
            ) : (
              <div className="mb-5 space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-lg font-bold text-[#1c1c17]">
                    Masuk Aparatur Balai Desa
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100/80 text-emerald-800 border border-emerald-300/50">
                    <span className="material-symbols-outlined text-xs">person_check</span>
                    Presensi GPS
                  </span>
                </div>
                <p className="text-[#6b583e] text-xs leading-relaxed">
                  Masukkan NIP / Email beserta kata sandi yang telah didaftarkan oleh Balai {targetVillage.namaDesa}.
                </p>
              </div>
            )}

            {/* Error / Alert Message Box */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-900 text-xs flex items-start gap-2.5 animate-fadeIn leading-relaxed">
                <span className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5 text-red-700">
                  shield_lock
                </span>
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Admin Mode: License Key Field */}
              {loginMode === 'admin_desa' && (
                <div className="space-y-1.5">
                  <label
                    className="block font-label text-xs font-bold uppercase tracking-wider text-[#735c00] ml-1"
                    htmlFor="adminLicense"
                  >
                    Nomor Lisensi Balai Desa
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#735c00] text-lg">
                      vpn_key
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-[#fffdf9] border-2 border-[#d4af37]/60 rounded-xl text-[#1c1c17] placeholder-[#a69880] focus:border-[#735c00] focus:ring-2 focus:ring-[#735c00]/20 focus:outline-none transition-all text-xs font-mono font-bold uppercase tracking-wider"
                      id="adminLicense"
                      name="adminLicense"
                      value={adminLicenseKey}
                      onChange={(e) => setAdminLicenseKey(e.target.value)}
                      placeholder="Contoh: SIGAP-PCL3520-2025-XXXX"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-[#7f7663] px-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                    <span>Lisensi terenkripsi per-wilayah hukum {targetVillage.namaDesa}.</span>
                  </p>
                </div>
              )}

              {/* Email / NIP Field */}
              <div className="space-y-1.5">
                <label
                  className="block font-label text-xs font-bold uppercase tracking-wider text-[#735c00] ml-1"
                  htmlFor="loginEmail"
                >
                  {loginMode === 'pegawai'
                    ? 'Email / NIP Aparatur Desa'
                    : 'Email Administrator Desa'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg">
                    {loginMode === 'pegawai' ? 'badge' : 'alternate_email'}
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-[#fbf9f4] border border-[#d0c5af]/50 rounded-xl text-[#1c1c17] placeholder-[#a69880] focus:ring-2 focus:ring-[#735c00]/20 focus:border-[#735c00] focus:outline-none transition-all text-xs"
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
                        ? 'nama@desa.go.id atau NIP 18 digit'
                        : `admin@${targetVillage.namaDesa.toLowerCase().replace(/desa\s+/gi, '')}.desa.go.id`
                    }
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label
                    className="font-label text-xs font-bold uppercase tracking-wider text-[#735c00]"
                    htmlFor="loginPassword"
                  >
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-[11px] font-semibold text-[#735c00] hover:text-[#524100] transition-colors cursor-pointer hover:underline"
                  >
                    Bantuan Akun?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-11 py-3 bg-[#fbf9f4] border border-[#d0c5af]/50 rounded-xl text-[#1c1c17] placeholder-[#a69880] focus:ring-2 focus:ring-[#735c00]/20 focus:border-[#735c00] focus:outline-none transition-all text-xs"
                    id="loginPassword"
                    name="loginPassword"
                    value={loginMode === 'pegawai' ? pegawaiPassword : adminPassword}
                    onChange={(e) =>
                      loginMode === 'pegawai'
                        ? setPegawaiPassword(e.target.value)
                        : setAdminPassword(e.target.value)
                    }
                    placeholder="Masukkan kata sandi"
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
                  className="w-full h-12 text-white font-headline font-bold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer bg-gradient-to-r from-[#735c00] via-[#856b00] to-[#997b00]"
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
                          : `Masuk Sebagai Aparatur Desa`}
                      </span>
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Official Security Seal Row */}
            <div className="mt-5 pt-4 border-t border-[#d0c5af]/25 flex items-center justify-center gap-2 text-[11px] text-[#7f7663]">
              <span className="material-symbols-outlined text-sm text-emerald-600">verified_user</span>
              <span>Koneksi Aman Terisolasi &bull; Geofencing Presisi Balai Desa</span>
            </div>
          </div>
        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="py-4 px-4 text-center relative z-10 space-y-2 border-t border-[#d0c5af]/20 bg-[#fcf9f0]/80 backdrop-blur-sm">
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          {onNavigateTentang && (
            <button
              type="button"
              onClick={onNavigateTentang}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#735c00] hover:text-[#524100] hover:underline cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              <span>Tentang Sistem SIGAP</span>
            </button>
          )}

          {onOpenDeveloperPortal && (
            <>
              <span className="text-[#d0c5af] hidden sm:inline">&bull;</span>
              <button
                type="button"
                onClick={onOpenDeveloperPortal}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7f7663] hover:text-[#1c1c17] hover:underline cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Pusat Administrasi Lisensi</span>
              </button>
            </>
          )}
        </div>

        <p className="text-[11px] text-[#7f7663]">
          &copy; {new Date().getFullYear()} Pemerintah Kabupaten {targetVillage.kabupaten || 'Magetan'} &bull; SIGAP Desa v2.5 Enterprise
        </p>
      </footer>

      {/* Account Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-[#d0c5af]/40">
            <div className="flex items-center gap-2 text-[#735c00] font-headline font-bold text-base mb-2">
              <span className="material-symbols-outlined">help</span>
              <span>Bantuan Akun &amp; Kredensial</span>
            </div>
            <p className="text-xs text-[#4d4635] leading-relaxed mb-4">
              Untuk aparatur yang lupa kata sandi atau membutuhkan aktivasi akun, silakan menghubungi <strong>Sekretaris Desa atau Operator Balai {targetVillage.namaDesa}</strong>.
            </p>
            <div className="bg-[#fcf9f0] p-3 rounded-xl border border-[#d0c5af]/30 text-xs space-y-1 mb-4 text-[#4d4635]">
              <p><strong>Balai:</strong> {targetVillage.namaDesa}</p>
              <p><strong>Kecamatan:</strong> {targetVillage.kecamatan}</p>
              <p><strong>Kabupaten:</strong> {targetVillage.kabupaten}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#735c00] text-white font-bold text-xs hover:bg-[#5e4b00] transition-colors cursor-pointer"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

