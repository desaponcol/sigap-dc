import React, { useState, useEffect, useMemo } from 'react';
import {
  AppScreen,
  AttendanceRecord,
  UserProfile,
  WorkReport,
} from './types/index.ts';
import {
  CURRENT_USER,
  getRegisteredDesaLicenses,
  getRegisteredEmployees,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_WORK_REPORTS,
} from './data/mockData.ts';

import { TopAppBar } from './components/TopAppBar.tsx';
import { BottomNavBar } from './components/BottomNavBar.tsx';
import { DrawerMenu } from './components/DrawerMenu.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { AttendanceDetailModal } from './components/AttendanceDetailModal.tsx';
import { PdfExportModal } from './components/PdfExportModal.tsx';
import { LoginScreen } from './screens/LoginScreen.tsx';
import { DashboardScreen } from './screens/DashboardScreen.tsx';
import { PresensiScreen } from './screens/PresensiScreen.tsx';
import { LaporanScreen } from './screens/LaporanScreen.tsx';
import { RekapScreen } from './screens/RekapScreen.tsx';
import { TentangScreen } from './screens/TentangScreen.tsx';
import { AdminDesaModal } from './components/AdminDesaModal.tsx';
import { DeveloperPortalModal } from './components/DeveloperPortalModal.tsx';
import {
  SAMPLE_TENANTS,
  TenantInfo,
  insertAttendanceToSupabase,
  insertWorkReportToSupabase,
  fetchLiveTenants,
  fetchAttendanceFromSupabase,
  fetchWorkReportsFromSupabase,
  isSupabaseConfigured,
} from './services/supabase.ts';
import { DesaLicense } from './types/index.ts';

function resolveMatchingTenant(
  allTenants: (TenantInfo | DesaLicense)[],
  paramDesa?: string | null,
  paramKode?: string | null
): TenantInfo | null {
  if (paramDesa) {
    const clean = paramDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/[^a-z0-9]/g, '');
    const match = allTenants.find((t) => {
      const tClean = t.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/[^a-z0-9]/g, '');
      return tClean === clean || tClean.includes(clean) || clean.includes(tClean);
    });
    if (match) {
      return {
        id: match.id,
        kodeDesa: match.kodeDesa,
        namaDesa: match.namaDesa,
        kecamatan: match.kecamatan,
        kabupaten: match.kabupaten,
        provinsi: match.provinsi || 'Jawa Timur',
        licenseKey: match.licenseKey,
        officeLat: match.officeLat,
        officeLng: match.officeLng,
        allowedRadiusMeters: match.allowedRadiusMeters,
        jamMasuk: match.jamMasuk,
        jamPulang: match.jamPulang,
        toleransiMenit: match.toleransiMenit,
        contactPhone: match.contactPhone,
        adminEmail: match.adminEmail,
      };
    }
  }
  if (paramKode) {
    const cleanKode = paramKode.trim().toUpperCase();
    const match = allTenants.find((t) => (t.licenseKey || '').toUpperCase() === cleanKode);
    if (match) {
      return {
        id: match.id,
        kodeDesa: match.kodeDesa,
        namaDesa: match.namaDesa,
        kecamatan: match.kecamatan,
        kabupaten: match.kabupaten,
        provinsi: match.provinsi || 'Jawa Timur',
        licenseKey: match.licenseKey,
        officeLat: match.officeLat,
        officeLng: match.officeLng,
        allowedRadiusMeters: match.allowedRadiusMeters,
        jamMasuk: match.jamMasuk,
        jamPulang: match.jamPulang,
        toleransiMenit: match.toleransiMenit,
        contactPhone: match.contactPhone,
        adminEmail: match.adminEmail,
      };
    }
  }
  return null;
}

function getMatchingDemoUser(tenant: TenantInfo): UserProfile {
  const employees = getRegisteredEmployees(tenant.id);
  const found = employees.find((e) => e.role === 'admin_desa') || employees[0];
  if (found) {
    return {
      ...found,
      tenantId: tenant.id,
      instansi: `Kantor Balai ${tenant.namaDesa}`,
      desaLicenseKey: tenant.licenseKey || found.desaLicenseKey,
    };
  }
  return {
    ...CURRENT_USER,
    tenantId: tenant.id,
    instansi: `Kantor Balai ${tenant.namaDesa}`,
    desaLicenseKey: tenant.licenseKey || CURRENT_USER.desaLicenseKey,
  };
}

export default function App() {
  const [selectedTenant, setSelectedTenant] = useState<TenantInfo>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const desaParam = params.get('desa') || params.get('village');
      const kodeParam = params.get('kode') || params.get('license');
      const allSources = [...SAMPLE_TENANTS, ...getRegisteredDesaLicenses()];
      const match = resolveMatchingTenant(allSources, desaParam, kodeParam);
      if (match) return match;
    } catch {
      // fallback
    }
    return SAMPLE_TENANTS[0];
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = sessionStorage.getItem('sigap_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    const allSources = [...SAMPLE_TENANTS, ...getRegisteredDesaLicenses()];
    const params = new URLSearchParams(window.location.search);
    const desaParam = params.get('desa') || params.get('village');
    const kodeParam = params.get('kode') || params.get('license');
    const match = resolveMatchingTenant(allSources, desaParam, kodeParam) || SAMPLE_TENANTS[0];
    return getMatchingDemoUser(match);
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('login') === '1') return false;

      const saved = sessionStorage.getItem('sigap_auth_user');
      if (!saved) return false;
      const parsed: UserProfile = JSON.parse(saved);

      // Verify that the saved session belongs to the URL target village (if provided)
      const desaParam = params.get('desa') || params.get('village');
      if (desaParam) {
        const cleanDesa = desaParam.toLowerCase().replace(/desa\s+/gi, '').replace(/[^a-z0-9]/g, '');
        const instansiClean = (parsed.instansi || '').toLowerCase().replace(/kantor balai desa\s+/gi, '').replace(/desa\s+/gi, '').replace(/[^a-z0-9]/g, '');
        if (!instansiClean.includes(cleanDesa) && !cleanDesa.includes(instansiClean)) {
          // Cross-village mismatch detected: clear session to enforce strict village gate
          sessionStorage.removeItem('sigap_auth_user');
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen') as AppScreen;
    if (['dashboard', 'presensi', 'laporan', 'rekap', 'tentang', 'login'].includes(screenParam)) {
      return screenParam;
    }
    return 'dashboard';
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sigap_attendance_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length >= 10) return parsed;
      }
      return INITIAL_ATTENDANCE_RECORDS;
    } catch {
      return INITIAL_ATTENDANCE_RECORDS;
    }
  });

  const [workReports, setWorkReports] = useState<WorkReport[]>(() => {
    try {
      const saved = localStorage.getItem('sigap_work_reports');
      return saved ? JSON.parse(saved) : INITIAL_WORK_REPORTS;
    } catch {
      return INITIAL_WORK_REPORTS;
    }
  });

  const [isInsideRadius, setIsInsideRadius] = useState<boolean>(true);
  const [distanceMeters, setDistanceMeters] = useState<number>(12);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDeveloperPortalOpen, setIsDeveloperPortalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'sigap_attendance_records',
        JSON.stringify(attendanceRecords)
      );
    } catch {
      // ignore
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('sigap_work_reports', JSON.stringify(workReports));
    } catch {
      // ignore
    }
  }, [workReports]);

  // Fetch live tenants & data from Supabase on start if configured
  useEffect(() => {
    async function initSupabaseData() {
      if (isSupabaseConfigured()) {
        const liveTenants = await fetchLiveTenants();
        if (liveTenants.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const desaParam = params.get('desa') || params.get('village');
          const kodeParam = params.get('kode') || params.get('license');

          let targetTenant: TenantInfo | null = null;
          // Priority 1: If URL specifies a village, match that in liveTenants!
          if (desaParam || kodeParam) {
            targetTenant = resolveMatchingTenant(liveTenants, desaParam, kodeParam);
          }

          // Priority 2: If no URL param, keep current selectedTenant or liveTenants[0]
          if (!targetTenant && !desaParam && !kodeParam) {
            targetTenant = liveTenants.find((t) => t.id === selectedTenant.id) || liveTenants[0];
          }

          // Only update if targetTenant was resolved (prevent overwriting URL param with unrelated liveTenants[0])
          if (targetTenant) {
            setSelectedTenant(targetTenant);
            const matchedUser = getMatchingDemoUser(targetTenant);
            setUser(matchedUser);

            const records = await fetchAttendanceFromSupabase(targetTenant.id);
            if (records && records.length > 0) {
              setAttendanceRecords(records);
            }

            const reports = await fetchWorkReportsFromSupabase(targetTenant.id);
            if (reports && reports.length > 0) {
              setWorkReports(reports);
            }
          }
        }
      }
    }
    initSupabaseData();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleToggleRadius = (inside: boolean) => {
    setIsInsideRadius(inside);
    setDistanceMeters(inside ? 12 : 450);
    showToast(
      inside
        ? 'Mode simulasi: Anda berada di dalam radius kantor (12m).'
        : 'Mode simulasi: Anda berada di luar radius kantor (450m).'
    );
  };

  const handleCopyVillageLink = (tenantToCopy?: TenantInfo) => {
    const target = tenantToCopy || selectedTenant;
    const cleanSlug = target.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '');
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareableLink = `${currentOrigin}/?desa=${cleanSlug}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareableLink).then(() => {
        showToast(`Tautan PWA ${target.namaDesa} tersalin! Siap dibagikan ke WhatsApp.`);
      }).catch(() => {
        showToast(`Tautan: ${shareableLink}`);
      });
    } else {
      showToast(`Tautan: ${shareableLink}`);
    }
  };

  const handleSelectTenant = (tenant: TenantInfo) => {
    setSelectedTenant(tenant);
    const matchedUser = getMatchingDemoUser(tenant);
    setUser(matchedUser);

    try {
      const cleanSlug = tenant.namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('desa', cleanSlug);
      window.history.replaceState({}, '', newUrl.toString());
    } catch {
      // ignore
    }

    showToast(`Beralih ke ${tenant.namaDesa} (${matchedUser.name})`);
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');

    try {
      sessionStorage.setItem('sigap_auth_user', JSON.stringify(loggedInUser));
    } catch {
      // ignore
    }

    // Find and synchronize matching tenant for the logged-in user
    const registered = [...SAMPLE_TENANTS, ...getRegisteredDesaLicenses()];
    const match = registered.find(
      (l) =>
        l.id === loggedInUser.tenantId ||
        (loggedInUser.desaLicenseKey && l.licenseKey === loggedInUser.desaLicenseKey)
    );
    if (match) {
      setSelectedTenant({
        id: match.id,
        kodeDesa: match.kodeDesa,
        namaDesa: match.namaDesa,
        kecamatan: match.kecamatan,
        kabupaten: match.kabupaten,
        provinsi: match.provinsi || 'Jawa Timur',
        licenseKey: match.licenseKey,
        officeLat: match.officeLat,
        officeLng: match.officeLng,
        allowedRadiusMeters: match.allowedRadiusMeters,
        jamMasuk: match.jamMasuk,
        jamPulang: match.jamPulang,
        toleransiMenit: match.toleransiMenit,
        contactPhone: match.contactPhone,
        adminEmail: match.adminEmail,
      });
    }

    showToast(`Selamat datang, ${loggedInUser.name}`);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('sigap_auth_user');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCurrentScreen('login');
    showToast(`Anda telah keluar dari Portal Balai ${selectedTenant.namaDesa}.`);
  };

  const handlePresensiSuccess = async (newRecord: AttendanceRecord) => {
    const recordWithTenant: AttendanceRecord = {
      ...newRecord,
      tenantId: selectedTenant.id,
      employeeId: user.id,
    };
    setAttendanceRecords((prev) => [recordWithTenant, ...prev]);

    // Push to Supabase if configured
    if (isSupabaseConfigured()) {
      const saved = await insertAttendanceToSupabase(recordWithTenant, selectedTenant.id, user.id);
      if (saved) {
        showToast(`Presensi ${newRecord.status} tersinkronisasi ke Supabase Cloud!`);
        return;
      }
    }

    showToast(`Presensi ${newRecord.status} berhasil terekam!`);
  };

  const handleLaporanSuccess = async (newReport: WorkReport) => {
    const reportWithTenant: WorkReport = {
      ...newReport,
      tenantId: selectedTenant.id,
      employeeId: user.id,
    };
    setWorkReports((prev) => [reportWithTenant, ...prev]);

    // Push to Supabase if configured
    if (isSupabaseConfigured()) {
      const saved = await insertWorkReportToSupabase(reportWithTenant, selectedTenant.id, user.id);
      if (saved) {
        showToast('Laporan harian tersinkronisasi ke Supabase Cloud!');
        return;
      }
    }

    showToast('Laporan kerja harian berhasil disimpan!');
  };

  const handleOpenAdminModal = () => {
    if (user.role === 'pegawai') {
      showToast('Akses Ditolak: Anda masuk sebagai Aparatur Desa. Menu ini khusus Admin Desa & Pengembang.');
      return;
    }
    setIsAdminModalOpen(true);
  };

  const navigateTo = (screen: AppScreen) => {
    if (screen === 'login') {
      setIsAuthenticated(false);
    }
    if (!isAuthenticated && screen !== 'tentang' && screen !== 'login') {
      setCurrentScreen('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Strict Multi-Tenant Data Isolation: Only show records belonging to selectedTenant
  const villageAttendanceRecords = useMemo(() => {
    return attendanceRecords.filter(
      (r) => !r.tenantId || r.tenantId === selectedTenant.id
    );
  }, [attendanceRecords, selectedTenant.id]);

  const villageWorkReports = useMemo(() => {
    return workReports.filter(
      (r) => !r.tenantId || r.tenantId === selectedTenant.id
    );
  }, [workReports, selectedTenant.id]);

  if ((!isAuthenticated || currentScreen === 'login') && currentScreen !== 'tentang') {
    return (
      <>
        <LoginScreen
          targetVillage={selectedTenant}
          onLoginSuccess={handleLoginSuccess}
          currentUser={user}
          onNavigateTentang={() => navigateTo('tentang')}
          onOpenDeveloperPortal={() => setIsDeveloperPortalOpen(true)}
        />
        <DeveloperPortalModal
          isOpen={isDeveloperPortalOpen}
          onClose={() => setIsDeveloperPortalOpen(false)}
          onSelectTenant={handleSelectTenant}
        />
      </>
    );
  }

  return (
    <div className="bg-[#fcf9f0] font-body text-[#1c1c17] min-h-screen w-full max-w-full overflow-x-hidden relative selection:bg-[#d4af37]/30 selection:text-[#735c00]">
      {/* Texture & Decorative Warm Ambient Glows (Clipped to prevent Android overflow) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 grain-texture"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ffe088]/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#fdc39a]/15 rounded-full blur-[140px]"></div>
      </div>

      {/* Top Header App Bar */}
      <TopAppBar
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        user={user}
        selectedTenant={selectedTenant}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdminModal={handleOpenAdminModal}
      />

      {/* Screen Views */}
      {currentScreen === 'dashboard' && (
        <DashboardScreen
          user={user}
          attendanceRecords={villageAttendanceRecords}
          workReports={villageWorkReports}
          isInsideRadius={isInsideRadius}
          distanceMeters={distanceMeters}
          onNavigate={navigateTo}
          onSelectRecord={(rec) => setSelectedRecord(rec)}
          onOpenAdminModal={handleOpenAdminModal}
        />
      )}

      {currentScreen === 'presensi' && (
        <PresensiScreen
          user={user}
          isInsideRadius={isInsideRadius}
          distanceMeters={distanceMeters}
          onPresensiSuccess={handlePresensiSuccess}
          onNavigateRekap={() => navigateTo('rekap')}
        />
      )}

      {currentScreen === 'laporan' && (
        <LaporanScreen
          user={user}
          onLaporanSuccess={handleLaporanSuccess}
          onNavigateRekap={() => navigateTo('rekap')}
        />
      )}

      {currentScreen === 'rekap' && (
        <RekapScreen
          user={user}
          attendanceRecords={villageAttendanceRecords}
          workReports={villageWorkReports}
          onSelectRecord={(rec) => setSelectedRecord(rec)}
          onOpenPdfModal={() => setIsPdfModalOpen(true)}
        />
      )}

      {currentScreen === 'tentang' && (
        <TentangScreen
          user={user}
          onNavigate={navigateTo}
          onOpenDeveloperPortal={() => setIsDeveloperPortalOpen(true)}
        />
      )}

      {/* Bottom Floating Navigation for Mobile */}
      <BottomNavBar currentScreen={currentScreen} onNavigate={navigateTo} />

      {/* Navigation Drawer */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        user={user}
        selectedTenant={selectedTenant}
        isInsideRadius={isInsideRadius}
        onToggleRadius={handleToggleRadius}
        onLogout={handleLogout}
        onOpenAdminModal={handleOpenAdminModal}
        onCopyVillageLink={() => handleCopyVillageLink()}
        onSelectTenant={handleSelectTenant}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      {/* Attendance Item Detail Modal */}
      <AttendanceDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* PDF Export & Period Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        user={user}
        attendanceRecords={villageAttendanceRecords}
        workReports={villageWorkReports}
      />

      {/* Admin Desa: Pengaturan Balai Desa & Aparatur Modal */}
      <AdminDesaModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        user={user}
        onTenantAdded={(newTenant) => {
          handleSelectTenant(newTenant);
          showToast(`Desa ${newTenant.namaDesa} berhasil ditambahkan dan aktif!`);
        }}
        onSelectTenant={handleSelectTenant}
      />

      {/* Super Admin: Portal Pengembang Arunika Kreatif Media Modal */}
      <DeveloperPortalModal
        isOpen={isDeveloperPortalOpen}
        onClose={() => setIsDeveloperPortalOpen(false)}
        onSelectTenant={handleSelectTenant}
      />


      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c17] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-[#d0c5af]/30 flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-sm text-[#d4af37]">
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
