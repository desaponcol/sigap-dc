import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types/index.ts';
import { processImageFile, OFFICIAL_PRESET_AVATARS } from '../utils/imageUtils.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [nip, setNip] = useState(user.nip);
  const [jabatan, setJabatan] = useState(user.jabatan);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or user prop changes
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setNip(user.nip);
      setJabatan(user.jabatan);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl);
      setIsEditing(false);
      setSavedSuccess(false);
      setPhotoMessage(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle uploading photo from user device (mobile gallery/camera or computer)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    setPhotoMessage(null);

    try {
      const optimizedDataUrl = await processImageFile(file, 400, 0.88);
      setAvatarUrl(optimizedDataUrl);
      setPhotoMessage({
        type: 'success',
        text: 'Foto profil berhasil dimuat dari perangkat! Klik "Simpan Perubahan" di bawah untuk menerapkan.',
      });
    } catch (err: any) {
      setPhotoMessage({
        type: 'error',
        text: err.message || 'Gagal memproses gambar. Gunakan format JPG, PNG, atau WEBP.',
      });
    } finally {
      setIsProcessingPhoto(false);
      // Reset input value so re-selecting same file triggers change
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser: UserProfile = {
      ...user,
      name: name.trim(),
      nip: nip.trim(),
      jabatan: jabatan.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1c1c17]/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[92vh] bg-white rounded-[2rem] p-5 sm:p-6 shadow-2xl z-10 border border-[#d0c5af]/30 flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#d0c5af]/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#735c00]">
              {user.role === 'admin_desa' ? 'admin_panel_settings' : 'badge'}
            </span>
            <h3 className="font-headline font-bold text-base sm:text-lg text-[#1c1c17]">
              {isEditing ? 'Kelola Data & Foto Profil' : 'Profil Aparatur Desa'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup profil"
            className="p-1 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Data profil dan foto berhasil diperbarui dan disimpan!</span>
          </div>
        )}

        <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-0.5">
          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative group">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#d4af37] shadow-lg"
                  />
                  {/* Quick Change Photo Button */}
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    title="Ganti Foto Profil"
                    className="absolute bottom-0 right-0 bg-[#735c00] hover:bg-[#5e4b00] text-white p-2 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-110 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                </div>
                <div>
                  <h4 className="font-headline font-black text-xl text-[#1c1c17]">
                    {user.name}
                  </h4>
                  <p className="font-mono text-xs uppercase tracking-wider text-[#805533] font-semibold mt-0.5">
                    NIP: {user.nip}
                  </p>
                </div>
              </div>

              {/* Detailed Info Card */}
              <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/25 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-[#d0c5af]/15">
                  <span className="text-[#7f7663] text-xs font-medium">Jabatan</span>
                  <span className="text-[#1c1c17] font-bold text-right">{user.jabatan}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#d0c5af]/15">
                  <span className="text-[#7f7663] text-xs font-medium">Instansi</span>
                  <span className="text-[#1c1c17] font-semibold text-right">{user.instansi}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#d0c5af]/15">
                  <span className="text-[#7f7663] text-xs font-medium">Email Kedinasan</span>
                  <span className="text-[#1c1c17] font-mono text-xs font-semibold text-right">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#d0c5af]/15">
                  <span className="text-[#6B4F1D] text-xs font-medium">Peran / Role</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin_desa'
                        ? 'bg-[#5C4300] text-white shadow-xs'
                        : 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                    }`}
                  >
                    {user.role === 'admin_desa' ? '👑 Admin Desa' : '👤 Aparatur (Pegawai)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#6B4F1D] text-xs font-medium">Status Hak Akses</span>
                  <span className="text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-0.5 rounded-full text-xs font-bold">
                    {user.role === 'admin_desa' ? 'Kelola Balai, GPS & Pegawai' : 'Presensi, Laporan & PDF'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-gradient-to-r from-[#735c00] to-[#997c00] hover:from-[#5e4b00] hover:to-[#735c00] text-white font-headline font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  <span>Ganti Foto &amp; Edit Profil {user.role === 'admin_desa' ? 'Sekdes / Admin' : 'Aparatur'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-[#f6f3ea] hover:bg-[#ebe8df] text-[#4d4635] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            /* EDIT FORM MODE */
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-[#fcf9f0] p-3 rounded-xl border border-[#d0c5af]/30 text-xs text-[#5C4300] leading-relaxed">
                <p>
                  <strong>Pengaturan Foto &amp; Data Pribadi:</strong>
                </p>
                <p className="text-[11px] text-[#805533] mt-0.5">
                  Foto dan data nama akan digunakan pada header aplikasi, presensi, serta tanda tangan laporan kedinasan.
                </p>
              </div>

              {/* SECTION: UPLOAD / GANTI FOTO PROFIL */}
              <div className="p-3.5 bg-gradient-to-br from-[#fffcf7] to-[#f6f3ea] rounded-2xl border border-[#d4af37]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B4F1D] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-[#735c00]">photo_camera</span>
                    <span>Foto Profil {user.role === 'admin_desa' ? 'Admin / Sekdes' : 'Aparatur'}</span>
                  </label>
                  {avatarUrl !== user.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(user.avatarUrl)}
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Batal Ganti Foto
                    </button>
                  )}
                </div>

                {/* Photo Preview & Upload Controls */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl}
                      alt="Preview Foto"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#d4af37] shadow-md bg-white"
                    />
                    {isProcessingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="avatar-file-input"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Primary File Upload Button */}
                    <label
                      htmlFor="avatar-file-input"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#735c00] hover:bg-[#5e4b00] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">upload</span>
                      <span>Unggah Foto dari HP / Perangkat</span>
                    </label>

                    <p className="text-[10px] text-[#805533]">
                      Bisa pilih dari Galeri, Kamera HP, atau File Laptop (JPG, PNG, WEBP).
                    </p>

                    {/* Direct Image URL input */}
                    <div className="pt-1">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-[#735c00]">link</span>
                        <span className="text-[10px] font-semibold text-[#6B4F1D]">Atau tempel Link/URL Foto:</span>
                      </div>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#d0c5af]/50 rounded-lg text-[11px] font-mono outline-none focus:ring-1 focus:ring-[#735c00]"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Message for Photo Upload */}
                {photoMessage && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      photoMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm shrink-0">
                      {photoMessage.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="text-[11px] font-medium leading-snug">{photoMessage.text}</span>
                  </div>
                )}

                {/* Quick Preset Selector */}
                <div className="pt-2 border-t border-[#d0c5af]/25">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#805533] mb-1.5">
                    Atau Pilih Cepat Foto Standar ASN / Perangkat Desa:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {OFFICIAL_PRESET_AVATARS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(p.url);
                          setPhotoMessage({
                            type: 'success',
                            text: `Foto "${p.label}" dipilih.`,
                          });
                        }}
                        className={`relative group rounded-full border-2 overflow-hidden transition-all cursor-pointer ${
                          avatarUrl === p.url
                            ? 'border-[#735c00] ring-2 ring-[#d4af37] scale-110 shadow-sm'
                            : 'border-transparent opacity-75 hover:opacity-100 hover:scale-105'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-8 h-8 rounded-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nama Lengkap & Gelar */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B4F1D] mb-1">
                  Nama Lengkap &amp; Gelar Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Siti Rahayu, S.IP"
                  className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-bold text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00] transition-all"
                  required
                />
              </div>

              {/* NIP */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B4F1D] mb-1">
                  NIP / Nomor Registrasi Perangkat Desa
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 19850614 200901 2 003"
                  className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-mono font-semibold text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00] transition-all"
                />
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B4F1D] mb-1">
                  Jabatan Kedinasan
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Sekretaris Desa / Admin Sistem"
                  className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-semibold text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00] transition-all"
                />
              </div>

              {/* Email Kedinasan */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B4F1D] mb-1">
                  Email Kedinasan
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: sekdes@poncol.desa.go.id"
                  className="w-full px-3 py-2 bg-[#f6f3ea] border border-[#d0c5af]/50 rounded-xl text-xs font-mono text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#735c00] transition-all"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 bg-[#f6f3ea] hover:bg-[#ebe8df] text-[#4d4635] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPhoto}
                  className="py-2.5 bg-[#735c00] hover:bg-[#5e4b00] text-white font-headline font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
