import React, { useState, useEffect, useRef } from 'react';
import {
  getRegisteredDesaLicenses,
  getRegisteredEmployees,
  saveDesaLicense,
  saveRegisteredEmployee,
  deleteRegisteredEmployee,
} from '../data/mockData.ts';
import {
  isSupabaseConfigured,
  saveDesaLicenseToSupabase,
  TenantInfo,
} from '../services/supabase.ts';
import { DesaLicense, UserProfile } from '../types/index.ts';
import { processImageFile, OFFICIAL_PRESET_AVATARS } from '../utils/imageUtils.ts';

interface AdminDesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded?: (tenant: TenantInfo) => void;
  onSelectTenant?: (tenant: TenantInfo) => void;
  onUpdateUser?: (updated: UserProfile) => void;
  user?: UserProfile;
}

export const AdminDesaModal: React.FC<AdminDesaModalProps> = ({
  isOpen,
  onClose,
  onSelectTenant,
  onUpdateUser,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'profil_balai' | 'aparatur' | 'lisensi_desa'>('profil_balai');

  // Find active village license for this admin
  const allLicenses = getRegisteredDesaLicenses();
  const currentVillageLicense =
    allLicenses.find((l) => l.licenseKey === user?.desaLicenseKey || l.id === user?.tenantId) ||
    allLicenses[0];

  // Balai Desa Form State
  const [namaDesa, setNamaDesa] = useState(currentVillageLicense?.namaDesa || 'Desa Poncol');
  const [kecamatan, setKecamatan] = useState(currentVillageLicense?.kecamatan || 'Poncol');
  const [kabupaten, setKabupaten] = useState(currentVillageLicense?.kabupaten || 'Magetan');
  const [officeLat, setOfficeLat] = useState(String(currentVillageLicense?.officeLat ?? -7.712345));
  const [officeLng, setOfficeLng] = useState(String(currentVillageLicense?.officeLng ?? 111.234567));
  const [radius, setRadius] = useState(String(currentVillageLicense?.allowedRadiusMeters ?? 50));
  const [jamMasuk, setJamMasuk] = useState(currentVillageLicense?.jamMasuk || '07:30');
  const [jamPulang, setJamPulang] = useState(currentVillageLicense?.jamPulang || '15:30');
  const [toleransiMenit, setToleransiMenit] = useState(String(currentVillageLicense?.toleransiMenit ?? 15));
  const [logoUrl, setLogoUrl] = useState(currentVillageLicense?.logoUrl || '');
  const [contactPerson, setContactPerson] = useState(currentVillageLicense?.contactPerson || '');
  const [adminEmail, setAdminEmail] = useState(currentVillageLicense?.adminEmail || '');
  const [contactPhone, setContactPhone] = useState(currentVillageLicense?.contactPhone || '');
  const [adminPhotoUrl, setAdminPhotoUrl] = useState(
    user?.avatarUrl || currentVillageLicense?.adminPhotoUrl || OFFICIAL_PRESET_AVATARS[2].url
  );

  // Employee Form State (Admin Desa creates accounts with photo and password)
  const [namaPegawai, setNamaPegawai] = useState('');
  const [nipPegawai, setNipPegawai] = useState('');
  const [jabatanPegawai, setJabatanPegawai] = useState('');
  const [emailPegawai, setEmailPegawai] = useState('');
  const [passwordPegawai, setPasswordPegawai] = useState('');
  const [showPegawaiPass, setShowPegawaiPass] = useState(true);
  const [fotoPegawai, setFotoPegawai] = useState(OFFICIAL_PRESET_AVATARS[0].url);

  // Edit Existing Employee State
  const [editingEmp, setEditingEmp] = useState<(UserProfile & { password?: string }) | null>(null);
  const [editEmpPhoto, setEditEmpPhoto] = useState('');
  const [editEmpName, setEditEmpName] = useState('');
  const [editEmpNip, setEditEmpNip] = useState('');
  const [editEmpJabatan, setEditEmpJabatan] = useState('');
  const [editEmpPassword, setEditEmpPassword] = useState('');

  // Dynamic Employee List for this village
  const [employeeList, setEmployeeList] = useState<(UserProfile & { password?: string })[]>([]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Status and feedback
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync village data on modal open or user change
  useEffect(() => {
    if (currentVillageLicense) {
      setNamaDesa(currentVillageLicense.namaDesa);
      setKecamatan(currentVillageLicense.kecamatan);
      setKabupaten(currentVillageLicense.kabupaten);
      setOfficeLat(String(currentVillageLicense.officeLat));
      setOfficeLng(String(currentVillageLicense.officeLng));
      setRadius(String(currentVillageLicense.allowedRadiusMeters));
      setJamMasuk(currentVillageLicense.jamMasuk);
      setJamPulang(currentVillageLicense.jamPulang);
      setToleransiMenit(String(currentVillageLicense.toleransiMenit));
      setLogoUrl(currentVillageLicense.logoUrl || '');
      setContactPerson(currentVillageLicense.contactPerson || '');
      setAdminEmail(currentVillageLicense.adminEmail || '');
      setContactPhone(currentVillageLicense.contactPhone || '');
      setAdminPhotoUrl(
        user?.avatarUrl || currentVillageLicense.adminPhotoUrl || OFFICIAL_PRESET_AVATARS[2].url
      );
      setEmployeeList(
        getRegisteredEmployees(currentVillageLicense.id).filter((e) => e.role === 'pegawai')
      );
    }
  }, [isOpen, currentVillageLicense?.licenseKey, user?.avatarUrl]);

  if (!isOpen) return null;

  // STRICT ACCESS CONTROL GUARD: Block Pegawai / Aparatur Desa
  if (user && user.role === 'pegawai') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1c1c17]/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-7 shadow-2xl z-10 border border-amber-300 text-center space-y-5 animate-scaleUp">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-headline font-extrabold text-xl text-[#1c1c17]">Akses Ditolak</h3>
            <p className="text-xs font-bold text-[#735c00] uppercase tracking-wider">
              Khusus Administrator Desa ({namaDesa})
            </p>
          </div>
          <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/30 text-xs text-[#4d4635] text-left space-y-2 leading-relaxed">
            <p>
              Akun Anda masuk sebagai <strong>Aparatur Desa ({user.name})</strong>.
            </p>
            <p>
              Pengaturan titik GPS balai desa, jam kerja, dan pendaftaran aparatur dikelola eksklusif oleh <strong>Admin Desa ({namaDesa})</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl font-headline font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active employees in this village
  const currentVillageEmployees = employeeList.length > 0 
    ? employeeList 
    : getRegisteredEmployees(currentVillageLicense?.id).filter((e) => e.role === 'pegawai');

  const handleUseCurrentGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOfficeLat(pos.coords.latitude.toFixed(6));
          setOfficeLng(pos.coords.longitude.toFixed(6));
          setStatusMessage({
            success: true,
            text: `Koordinat GPS berhasil disinkronkan ke lokasi perangkat saat ini (${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}).`,
          });
        },
        (err) => {
          setStatusMessage({
            success: false,
            text: `Gagal membaca GPS: ${err.message}. Pastikan izin lokasi browser telah diaktifkan.`,
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setStatusMessage({
        success: false,
        text: 'Perangkat atau browser Anda tidak mendukung Geolocation API.',
      });
    }
  };

  // Upload photo handler for Admin Desa / Sekdes
  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const dataUrl = await processImageFile(file, 400, 0.88);
      setAdminPhotoUrl(dataUrl);
      setStatusMessage({
        success: true,
        text: 'Foto profil Admin/Sekdes berhasil dimuat! Klik "Simpan Pengaturan Balai Desa" untuk menerapkan.',
      });
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: err.message || 'Gagal memproses foto.',
      });
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Upload photo handler for New Employee
  const handleFotoPegawaiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const dataUrl = await processImageFile(file, 400, 0.88);
      setFotoPegawai(dataUrl);
      setStatusMessage({
        success: true,
        text: 'Foto calon aparatur berhasil dimuat!',
      });
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: err.message || 'Gagal memproses foto.',
      });
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Upload photo handler for Editing Existing Employee
  const handleEditEmpPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    try {
      const dataUrl = await processImageFile(file, 400, 0.88);
      setEditEmpPhoto(dataUrl);
      setStatusMessage({
        success: true,
        text: 'Foto baru aparatur berhasil dimuat! Klik "Simpan Foto & Data Aparatur".',
      });
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: err.message || 'Gagal memproses foto.',
      });
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSaveBalaiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const updatedLicense: DesaLicense = {
        ...currentVillageLicense,
        namaDesa: namaDesa.trim(),
        kecamatan: kecamatan.trim(),
        kabupaten: kabupaten.trim(),
        contactPerson: contactPerson.trim() || currentVillageLicense.contactPerson,
        adminEmail: adminEmail.trim() || currentVillageLicense.adminEmail,
        contactPhone: contactPhone.trim() || currentVillageLicense.contactPhone,
        officeLat: parseFloat(officeLat) || currentVillageLicense.officeLat,
        officeLng: parseFloat(officeLng) || currentVillageLicense.officeLng,
        allowedRadiusMeters: parseInt(radius, 10) || currentVillageLicense.allowedRadiusMeters,
        jamMasuk: jamMasuk || '07:30',
        jamPulang: jamPulang || '15:30',
        toleransiMenit: parseInt(toleransiMenit, 10) || 15,
        logoUrl: logoUrl.trim() || undefined,
        adminPhotoUrl: adminPhotoUrl.trim() || undefined,
      };

      saveDesaLicense(updatedLicense);

      // Sync active admin user display name & avatar if changed
      if (onUpdateUser && user && user.role === 'admin_desa') {
        const cleanName = contactPerson.replace(/\s*\(sekdes\)|\s*\(admin\s*sistem\)/gi, '').trim();
        onUpdateUser({
          ...user,
          name: cleanName || user.name,
          email: adminEmail.trim() || user.email,
          avatarUrl: adminPhotoUrl.trim() || user.avatarUrl,
        });
      }

      if (onSelectTenant) {
        onSelectTenant({
          id: updatedLicense.id,
          kodeDesa: updatedLicense.kodeDesa,
          namaDesa: updatedLicense.namaDesa,
          kecamatan: updatedLicense.kecamatan,
          kabupaten: updatedLicense.kabupaten,
          provinsi: updatedLicense.provinsi,
          licenseKey: updatedLicense.licenseKey,
          officeLat: updatedLicense.officeLat,
          officeLng: updatedLicense.officeLng,
          allowedRadiusMeters: updatedLicense.allowedRadiusMeters,
          jamMasuk: updatedLicense.jamMasuk,
          jamPulang: updatedLicense.jamPulang,
          toleransiMenit: updatedLicense.toleransiMenit,
          contactPhone: updatedLicense.contactPhone,
          adminEmail: updatedLicense.adminEmail,
          logoUrl: updatedLicense.logoUrl,
        });
      }

      if (isSupabaseConfigured()) {
        await saveDesaLicenseToSupabase(updatedLicense);
      }

      setStatusMessage({
        success: true,
        text: `Pengaturan Balai & Data Sekdes/Admin ${updatedLicense.namaDesa} berhasil diperbarui!`,
      });
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: `Gagal menyimpan: ${err.message || 'Kesalahan sistem'}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPegawai.trim() || !emailPegawai.trim() || !passwordPegawai.trim()) {
      setStatusMessage({
        success: false,
        text: 'Nama, Email/NIP, dan Kata Sandi wajib diisi untuk membuat akun aparatur.',
      });
      return;
    }

    try {
      const newEmployee: UserProfile & { password: string } = {
        id: `peg-${Date.now()}`,
        name: namaPegawai.trim(),
        nip: nipPegawai.trim() || `199${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        jabatan: jabatanPegawai.trim() || 'Aparatur Desa',
        email: emailPegawai.trim().toLowerCase(),
        password: passwordPegawai.trim(),
        instansi: `Kantor Balai ${currentVillageLicense?.namaDesa || 'Desa'}`,
        role: 'pegawai',
        tenantId: currentVillageLicense?.id || 'c0000000-0000-0000-0000-000000000003',
        desaLicenseKey: currentVillageLicense?.licenseKey,
        avatarUrl: fotoPegawai.trim() || OFFICIAL_PRESET_AVATARS[0].url,
      };

      saveRegisteredEmployee(newEmployee);
      setEmployeeList(
        getRegisteredEmployees(currentVillageLicense?.id).filter((e) => e.role === 'pegawai')
      );

      setStatusMessage({
        success: true,
        text: `Akun Aparatur ${newEmployee.name} berhasil dibuat! Pegawai dapat langsung login dengan Email: ${newEmployee.email} dan Password yang Anda tentukan.`,
      });

      // Clear input form
      setNamaPegawai('');
      setNipPegawai('');
      setJabatanPegawai('');
      setEmailPegawai('');
      setPasswordPegawai('');
      setFotoPegawai(OFFICIAL_PRESET_AVATARS[0].url);
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: `Gagal menambahkan aparatur: ${err.message}`,
      });
    }
  };

  const handleStartEditEmployee = (emp: UserProfile & { password?: string }) => {
    setEditingEmp(emp);
    setEditEmpPhoto(emp.avatarUrl || OFFICIAL_PRESET_AVATARS[0].url);
    setEditEmpName(emp.name);
    setEditEmpNip(emp.nip);
    setEditEmpJabatan(emp.jabatan);
    setEditEmpPassword(emp.password || 'admin123');
  };

  const handleSaveEditEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    try {
      const updatedEmp: UserProfile & { password: string } = {
        ...editingEmp,
        name: editEmpName.trim() || editingEmp.name,
        nip: editEmpNip.trim() || editingEmp.nip,
        jabatan: editEmpJabatan.trim() || editingEmp.jabatan,
        password: editEmpPassword.trim() || (editingEmp as any).password || 'admin123',
        avatarUrl: editEmpPhoto.trim() || editingEmp.avatarUrl,
      };

      saveRegisteredEmployee(updatedEmp);
      setEmployeeList(
        getRegisteredEmployees(currentVillageLicense?.id).filter((e) => e.role === 'pegawai')
      );

      // If active user is this employee, update active session
      if (user && (user.id === updatedEmp.id || user.email.toLowerCase() === updatedEmp.email.toLowerCase())) {
        if (onUpdateUser) {
          onUpdateUser(updatedEmp);
        }
      }

      setStatusMessage({
        success: true,
        text: `Foto & data aparatur ${updatedEmp.name} berhasil diperbarui!`,
      });
      setEditingEmp(null);
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: `Gagal memperbarui data aparatur: ${err.message}`,
      });
    }
  };

  const handleDeleteEmployee = (emp: UserProfile & { password?: string }) => {
    if (window.confirm(`Hapus akun aparatur ${emp.name}? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteRegisteredEmployee(emp.id, emp.email);
      setEmployeeList(
        getRegisteredEmployees(currentVillageLicense?.id).filter((e) => e.role === 'pegawai')
      );
      setStatusMessage({
        success: true,
        text: `Akun aparatur ${emp.name} berhasil dihapus dari balai desa.`,
      });
      if (editingEmp?.id === emp.id) {
        setEditingEmp(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
      <div className="fixed inset-0 bg-[#1c1c17]/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl max-h-[94vh] sm:max-h-[92vh] rounded-[1.75rem] sm:rounded-[2.5rem] p-4 sm:p-7 shadow-2xl z-10 border border-[#d0c5af]/30 flex flex-col animate-scaleUp overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-[#d0c5af]/25">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-xl sm:text-2xl">holiday_village</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-headline font-black text-sm sm:text-lg text-[#1c1c17] truncate">
                  Pengaturan {currentVillageLicense?.namaDesa || 'Balai Desa'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold uppercase bg-amber-100 text-[#735c00] border border-amber-300 shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#805533] truncate">
                Kec. {currentVillageLicense?.kecamatan}, Kab. {currentVillageLicense?.kabupaten} &bull; Lisensi Terkunci
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="p-1.5 sm:p-2 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
          </button>
        </div>

        {/* Tab Navigation (Exclusively for this village - Responsive grid) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#f6f3ea] rounded-xl sm:rounded-2xl border border-[#d0c5af]/30 mt-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profil_balai');
              setStatusMessage(null);
            }}
            className={`py-2 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              activeTab === 'profil_balai'
                ? 'bg-white text-[#735c00] shadow-sm'
                : 'text-[#805533] hover:bg-[#ebe8df]'
            }`}
          >
            <span className="material-symbols-outlined text-xs sm:text-sm shrink-0">location_on</span>
            <span className="truncate">1. Geofence</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('aparatur');
              setStatusMessage(null);
            }}
            className={`py-2 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              activeTab === 'aparatur'
                ? 'bg-white text-[#735c00] shadow-sm'
                : 'text-[#805533] hover:bg-[#ebe8df]'
            }`}
          >
            <span className="material-symbols-outlined text-xs sm:text-sm shrink-0">badge</span>
            <span className="truncate">2. Aparatur ({currentVillageEmployees.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('lisensi_desa');
              setStatusMessage(null);
            }}
            className={`py-2 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
              activeTab === 'lisensi_desa'
                ? 'bg-white text-[#735c00] shadow-sm'
                : 'text-[#805533] hover:bg-[#ebe8df]'
            }`}
          >
            <span className="material-symbols-outlined text-xs sm:text-sm shrink-0">verified</span>
            <span className="truncate">3. Lisensi</span>
          </button>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
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

        {/* Modal Body */}
        <div className="overflow-y-auto py-4 space-y-4 text-sm flex-1">
          {/* TAB 1: PROFIL BALAI DESA & GEOFENCE */}
          {activeTab === 'profil_balai' && (
            <form onSubmit={handleSaveBalaiSettings} className="space-y-4">
              {/* Tautan PWA Khusus Balai Desa */}
              <div className="bg-gradient-to-r from-[#5C4300] to-[#7A5B00] text-white p-3.5 rounded-2xl shadow-md border border-[#FFE9A8]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FFE082] text-lg">share_location</span>
                    <span className="text-xs font-bold text-[#FFE9A8]">Tautan Resmi &amp; Mode PWA Balai {namaDesa}</span>
                  </div>
                  <p className="text-[11px] text-white/90 mt-0.5">
                    Kirimkan tautan ini ke WhatsApp perangkat desa agar mereka langsung membuka profil Balai {namaDesa} dan memasangnya di HP.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const slug = namaDesa.toLowerCase().replace(/desa\s+/gi, '').replace(/\s+/g, '');
                    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
                    const url = `${currentOrigin}/?desa=${slug}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(url);
                    }
                    setStatusMessage({
                      success: true,
                      text: `Tautan PWA ${namaDesa} berhasil disalin (${url})! Siap dibagikan ke WhatsApp.`,
                    });
                  }}
                  className="bg-[#FFE9A8] hover:bg-white text-[#5C4300] text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>Salin Link Desa</span>
                </button>
              </div>

              <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/30 space-y-1">
                <h4 className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">radar</span>
                  <span>Radius &amp; Geofencing Balai {namaDesa}</span>
                </h4>
                <p className="text-xs text-[#4d4635] leading-relaxed">
                  Aparatur desa hanya dapat melakukan presensi kehadiran jika berada di dalam radius toleransi kantor balai desa yang Anda tentukan di bawah ini.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                    Nama Balai Desa
                  </label>
                  <input
                    type="text"
                    value={namaDesa}
                    onChange={(e) => setNamaDesa(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                    Wilayah Kecamatan &amp; Kabupaten
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${kecamatan}, ${kabupaten}`}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium"
                  />
                </div>
              </div>

              {/* Data Pejabat Sekretaris Desa / Penanggung Jawab Lisensi */}
              <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#d4af37]/40 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#735c00] text-lg">badge</span>
                  <span className="text-xs font-bold text-[#735c00] uppercase tracking-wider">
                    Data &amp; Foto Pejabat Sekretaris Desa (Admin Balai)
                  </span>
                </div>

                {/* Foto Profil Admin / Sekdes Balai */}
                <div className="p-3 bg-white rounded-xl border border-[#d0c5af]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-[#805533] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#735c00]">photo_camera</span>
                      <span>Foto Profil Pejabat / Sekdes Balai Desa</span>
                    </label>
                    <span className="text-[9px] text-[#805533]">Tampil di Header &amp; Profil</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <img
                      src={adminPhotoUrl}
                      alt="Foto Admin Desa"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#d4af37] shadow-sm shrink-0"
                    />

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        id="admin-photo-input"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleAdminPhotoUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <label
                          htmlFor="admin-photo-input"
                          className="px-2.5 py-1.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-xs">upload</span>
                          <span>Upload Foto Sekdes</span>
                        </label>

                        <div className="flex items-center gap-1">
                          {OFFICIAL_PRESET_AVATARS.slice(0, 4).map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAdminPhotoUrl(p.url)}
                              title={p.label}
                              className={`w-6 h-6 rounded-full border overflow-hidden transition-all cursor-pointer ${
                                adminPhotoUrl === p.url ? 'border-[#735c00] ring-1 ring-[#735c00] scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Foto ini akan digunakan sebagai avatar resmi Admin Desa di sistem presensi.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                      Nama Sekretaris Desa / Admin Resmi
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Contoh: Siti Rahayu, S.IP (Sekdes)"
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/40 rounded-xl text-xs font-bold text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                      Email Kedinasan Admin Desa
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Contoh: admin@desa.go.id"
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/40 rounded-xl text-xs font-mono text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                      No. WhatsApp / Kontak Balai Desa
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Contoh: 085150617732"
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/40 rounded-xl text-xs font-mono text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Resmi Desa untuk Dokumen Cetak */}
              <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#d4af37]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#735c00] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">image</span>
                    <span>Logo Resmi Balai Desa (Header Dokumen Cetak)</span>
                  </span>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Hapus / Gunakan Lambang Standar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Preview Box */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-[#d4af37] bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Desa"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <span className="material-symbols-outlined text-2xl text-[#735c00]/40 block">
                          add_photo_alternate
                        </span>
                        <span className="text-[8px] font-bold text-[#805533] uppercase">
                          Standar
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      id="logo-upload-input"
                      accept="image/png, image/jpeg, image/svg+xml, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            setStatusMessage({
                              success: false,
                              text: 'Ukuran file logo maksimal 2MB. Harap gunakan gambar PNG atau JPG yang lebih kecil.',
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setLogoUrl(reader.result);
                              setStatusMessage({
                                success: true,
                                text: 'Logo desa berhasil dipilih! Klik "Simpan Pengaturan Balai Desa" di bawah untuk menerapkan ke dokumen cetak.',
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2 flex-wrap">
                      <label
                        htmlFor="logo-upload-input"
                        className="px-3 py-1.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">upload</span>
                        <span>Upload File Logo (PNG/JPG)</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          // Official Magetan / Regional Crest
                          setLogoUrl('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lambang_Kabupaten_Magetan.png/480px-Lambang_Kabupaten_Magetan.png');
                          setStatusMessage({
                            success: true,
                            text: 'Logo Lambang Daerah (Magetan) dipilih. Klik "Simpan Pengaturan Balai Desa" untuk menerapkan.',
                          });
                        }}
                        className="px-2.5 py-1.5 bg-[#f6f3ea] hover:bg-[#ebe8df] text-[#735c00] border border-[#d0c5af]/40 rounded-xl text-[10px] font-bold cursor-pointer"
                      >
                        Pakai Contoh Logo Daerah
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-500">
                      Disarankan PNG transparan atau JPG. Logo akan tampil di sebelah kiri atas dokumen cetak presensi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Coordinates and Geofence */}
              <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#d4af37]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#735c00] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    <span>Koordinat Titik Kantor Balai Desa:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleUseCurrentGps}
                    className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-[#735c00] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">explore</span>
                    <span>Ambil GPS Saya Saat Ini</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                      Latitude Kantor
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
                      Longitude Kantor
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
                      min="10"
                      max="500"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-bold outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                    Jam Masuk Kantor
                  </label>
                  <input
                    type="time"
                    value={jamMasuk}
                    onChange={(e) => setJamMasuk(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                    Jam Pulang Kantor
                  </label>
                  <input
                    type="time"
                    value={jamPulang}
                    onChange={(e) => setJamPulang(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#805533] mb-1">
                    Toleransi Telat (Menit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={toleransiMenit}
                    onChange={(e) => setToleransiMenit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/30 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl font-headline font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Simpan Pengaturan Balai Desa</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: MANAJEMEN AKUN & KATA SANDI APARATUR DESA */}
          {activeTab === 'aparatur' && (
            <div className="space-y-4">
              <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/30 space-y-1">
                <h4 className="font-bold text-xs text-[#735c00] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">person_add</span>
                  <span>Pendaftaran Aparatur Desa ({namaDesa})</span>
                </h4>
                <p className="text-xs text-[#4d4635] leading-relaxed">
                  Admin Desa berwenang mendaftarkan aparatur dan menentukan <strong>kata sandi login</strong> mereka. Berikan email/NIP dan kata sandi ini kepada aparatur bersangkutan agar mereka dapat masuk ke Portal Pegawai.
                </p>
              </div>

              {/* Form Tambah Aparatur */}
              <form onSubmit={handleAddEmployee} className="p-4 bg-white rounded-2xl border border-[#d0c5af]/30 space-y-3.5">
                <h5 className="font-headline font-bold text-xs text-[#1c1c17] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#735c00]">person_add</span>
                  <span>+ Buat Akun Aparatur Baru</span>
                </h5>

                {/* Section Foto Profil Aparatur Baru */}
                <div className="p-3 bg-[#fcf9f0] rounded-xl border border-[#d4af37]/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-[#6B4F1D] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#735c00]">photo_camera</span>
                      <span>Foto Profil Aparatur Desa</span>
                    </label>
                    <span className="text-[9px] text-[#805533]">Dapat diunggah sekarang atau diedit nanti</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <img
                      src={fotoPegawai}
                      alt="Preview Aparatur"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#d4af37] shadow-sm shrink-0 bg-white"
                    />

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        id="foto-pegawai-input"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFotoPegawaiUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <label
                          htmlFor="foto-pegawai-input"
                          className="px-2.5 py-1.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-xs">upload</span>
                          <span>Upload Foto (HP / Laptop)</span>
                        </label>

                        {/* Presets */}
                        <div className="flex items-center gap-1">
                          {OFFICIAL_PRESET_AVATARS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setFotoPegawai(p.url)}
                              title={p.label}
                              className={`w-6 h-6 rounded-full border overflow-hidden transition-all cursor-pointer ${
                                fotoPegawai === p.url ? 'border-[#735c00] ring-1 ring-[#735c00] scale-110' : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500">
                        Pilih foto resmi aparatur atau gunakan avatar standar ASN.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                      Nama Lengkap Aparatur &amp; Gelar
                    </label>
                    <input
                      type="text"
                      value={namaPegawai}
                      onChange={(e) => setNamaPegawai(e.target.value)}
                      placeholder="Contoh: Joko Widodo, S.Pd"
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl text-xs outline-none font-semibold placeholder-[#8A7A66] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                      NIP / Nomor Registrasi Perangkat Desa
                    </label>
                    <input
                      type="text"
                      value={nipPegawai}
                      onChange={(e) => setNipPegawai(e.target.value)}
                      placeholder="Contoh: 19930412 201902 1 005"
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl text-xs outline-none placeholder-[#8A7A66] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                      Jabatan di Kantor Balai Desa
                    </label>
                    <input
                      type="text"
                      value={jabatanPegawai}
                      onChange={(e) => setJabatanPegawai(e.target.value)}
                      placeholder="Contoh: Kaur Keuangan / Kasi Pemerintahan"
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl text-xs outline-none placeholder-[#8A7A66] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D] mb-1">
                      Email Login Aparatur
                    </label>
                    <input
                      type="email"
                      value={emailPegawai}
                      onChange={(e) => setEmailPegawai(e.target.value)}
                      placeholder={`aparatur@${namaDesa.toLowerCase().replace(/[^a-z]/g, '')}.desa.go.id`}
                      className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#E5D9C3] rounded-xl text-xs outline-none placeholder-[#8A7A66] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password field given by Admin Desa */}
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-[0.06em] text-[#6B4F1D]">
                      Kata Sandi Login (Diberikan oleh Admin Desa)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPegawaiPass(!showPegawaiPass)}
                      className="text-xs text-[#5C4300] font-bold hover:underline"
                    >
                      {showPegawaiPass ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  <input
                    type={showPegawaiPass ? 'text' : 'password'}
                    value={passwordPegawai}
                    onChange={(e) => setPasswordPegawai(e.target.value)}
                    placeholder="Contoh: poncol2025 (Berikan ke pegawai ini)"
                    className="w-full px-3 py-2 bg-white border border-[#E5D9C3] rounded-xl text-xs font-mono font-bold outline-none placeholder-[#8A7A66] focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B] transition-all"
                    required
                  />
                  <p className="text-xs text-[#5E4B32] font-medium">
                    💡 Pegawai akan menggunakan Email dan Kata Sandi ini untuk masuk ke <strong>Portal Pegawai</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl font-headline font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Daftarkan &amp; Berikan Akses Aparatur</span>
                </button>
              </form>

              {/* MODAL / PANEL EDIT FOTO & DATA APARATUR EXISTING */}
              {editingEmp && (
                <div className="p-4 bg-amber-50/80 rounded-2xl border-2 border-[#d4af37] space-y-3.5 shadow-md animate-scaleUp">
                  <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#735c00]">edit_square</span>
                      <h5 className="font-headline font-bold text-xs text-[#1c1c17]">
                        Edit Data &amp; Foto Aparatur: <span className="text-[#735c00]">{editingEmp.name}</span>
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingEmp(null)}
                      className="text-xs text-gray-500 hover:text-red-600 font-bold"
                    >
                      Batal
                    </button>
                  </div>

                  {/* Foto Editor */}
                  <div className="p-3 bg-white rounded-xl border border-[#d0c5af]/30 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-[#6B4F1D] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#735c00]">photo_camera</span>
                      <span>Ganti Foto Aparatur</span>
                    </label>

                    <div className="flex items-center gap-3.5">
                      <img
                        src={editEmpPhoto}
                        alt={editEmpName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#d4af37] shadow-sm shrink-0"
                      />

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="file"
                          id="edit-emp-photo-input"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleEditEmpPhotoUpload}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <label
                            htmlFor="edit-emp-photo-input"
                            className="px-2.5 py-1.5 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                          >
                            <span className="material-symbols-outlined text-xs">upload</span>
                            <span>Upload Foto Baru</span>
                          </label>

                          <div className="flex items-center gap-1">
                            {OFFICIAL_PRESET_AVATARS.map((p, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setEditEmpPhoto(p.url)}
                                title={p.label}
                                className={`w-6 h-6 rounded-full border overflow-hidden transition-all cursor-pointer ${
                                  editEmpPhoto === p.url ? 'border-[#735c00] ring-1 ring-[#735c00] scale-110' : 'opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveEditEmployee} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#6B4F1D] mb-0.5">Nama &amp; Gelar</label>
                        <input
                          type="text"
                          value={editEmpName}
                          onChange={(e) => setEditEmpName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#d0c5af]/50 rounded-lg text-xs font-bold outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#6B4F1D] mb-0.5">NIP</label>
                        <input
                          type="text"
                          value={editEmpNip}
                          onChange={(e) => setEditEmpNip(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#d0c5af]/50 rounded-lg text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#6B4F1D] mb-0.5">Jabatan Balai</label>
                        <input
                          type="text"
                          value={editEmpJabatan}
                          onChange={(e) => setEditEmpJabatan(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#d0c5af]/50 rounded-lg text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#6B4F1D] mb-0.5">Kata Sandi Login</label>
                        <input
                          type="text"
                          value={editEmpPassword}
                          onChange={(e) => setEditEmpPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#d0c5af]/50 rounded-lg text-xs font-mono font-bold outline-none text-[#735c00]"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        <span>Simpan Foto &amp; Data Aparatur</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(editingEmp)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Hapus Akun Ini"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* List of Registered Employees in this Village */}
              <div className="space-y-2">
                <h5 className="font-headline font-bold text-xs text-[#1c1c17] flex items-center justify-between">
                  <span>Daftar Aparatur Desa Terdaftar ({currentVillageEmployees.length})</span>
                  <span className="text-[10px] text-[#805533] font-normal">Hanya aparatur di balai ini</span>
                </h5>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                  {currentVillageEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3 bg-[#f6f3ea] rounded-xl border border-[#d0c5af]/30 flex items-center justify-between gap-3 hover:border-[#d4af37]/60 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37] shadow-xs"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-[#1c1c17] truncate">{emp.name}</p>
                          <p className="text-[10px] text-[#805533] font-medium truncate">{emp.jabatan}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate">
                            Email: {emp.email} &bull; Pass: <strong className="text-[#735c00]">{emp.password}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Edit / Ganti Foto Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEditEmployee(emp)}
                          className="px-2.5 py-1 bg-white hover:bg-[#fffcf7] text-[#735c00] border border-[#d4af37]/60 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                          title="Ganti Foto atau Edit Data"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span>
                          <span>Ganti Foto &amp; Data</span>
                        </button>

                        {/* Hapus Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteEmployee(emp)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFORMASI LISENSI RESMI DESA */}
          {activeTab === 'lisensi_desa' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#fffcf7] to-[#f6f3ea] p-5 rounded-2xl border-2 border-[#d4af37] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[#735c00]">verified</span>
                    <div>
                      <h4 className="font-headline font-black text-sm text-[#735c00]">
                        Lisensi Resmi SIGAP Desa
                      </h4>
                      <p className="text-[10px] text-[#805533]">Diterbitkan oleh PT/CV Arunika Kreatif Media</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase border border-emerald-300">
                    Status: {currentVillageLicense?.status || 'AKTIF'}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#d0c5af]/30 space-y-2">
                  <p className="text-[10px] text-[#805533] font-bold uppercase tracking-wider">
                    Nomor Lisensi Desa ({currentVillageLicense?.namaDesa}):
                  </p>
                  <code className="text-sm font-mono font-black text-[#735c00] block select-all tracking-wide">
                    {currentVillageLicense?.licenseKey}
                  </code>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#4d4635]">
                  <p>Wilayah: <strong>{currentVillageLicense?.kecamatan}, {currentVillageLicense?.kabupaten}</strong></p>
                  <p>Masa Berlaku: <strong>s.d {currentVillageLicense?.validUntil || '2027-12-31'}</strong></p>
                  <p>Admin Resmi: <strong>{currentVillageLicense?.contactPerson}</strong></p>
                  <p>Penerbit: <strong>Arunika Kreatif Media</strong></p>
                </div>
              </div>

              {/* Support Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#d0c5af]/30 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-[#1c1c17]">Bantuan &amp; Layanan Pengembang</h5>
                  <p className="text-[11px] text-[#805533] mt-0.5">
                    Hubungi Arunika Kreatif Media untuk perpanjangan masa aktif atau dukungan teknis.
                  </p>
                </div>
                <a
                  href="https://wa.me/6285150617732?text=Halo%20Arunika%20Kreatif%20Media,%20saya%20Admin%20Desa%20ingin%20berkonsultasi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>WhatsApp Resmi</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#d0c5af]/20 flex items-center justify-between text-xs text-[#805533]">
          <span>
            Desa Terkunci: <strong>{namaDesa}</strong> ({kabupaten})
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
