import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/index.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
}

const PRESET_AVATARS = [
  { label: 'Wanita ASN (Berhijab/Formal)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { label: 'Pria ASN (Batik/Formal)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Pria Jas (Sekdes/Kades)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { label: 'Wanita Eksekutif', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
  { label: 'Pria Kemeja Putih ASN', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
];

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
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

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

      <div className="relative w-full max-w-md max-h-[92vh] bg-white rounded-[2rem] p-5 sm:p-6 shadow-2xl z-10 border border-[#d0c5af]/30 flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[#d0c5af]/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#735c00]">
              {user.role === 'admin_desa' ? 'admin_panel_settings' : 'badge'}
            </span>
            <h3 className="font-headline font-bold text-base sm:text-lg text-[#1c1c17]">
              {isEditing ? 'Edit Data Admin / Aparatur' : 'Profil Aparatur Desa'}
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
            <span>Data nama &amp; profil berhasil diperbarui dan tersimpan!</span>
          </div>
        )}

        <div className="overflow-y-auto py-3 space-y-4 flex-1">
          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#d4af37] shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] shadow-sm">
                    ✓
                  </div>
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
                  <span>Edit Data Nama / Profil {user.role === 'admin_desa' ? 'Sekdes & Admin' : 'Aparatur'}</span>
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
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="bg-[#fcf9f0] p-3 rounded-xl border border-[#d0c5af]/30 text-xs text-[#5C4300] leading-relaxed">
                <p>
                  <strong>Form Perubahan Data Aparatur / Sekretaris Desa:</strong>
                </p>
                <p className="text-[11px] text-[#805533] mt-0.5">
                  Perubahan nama akan langsung ditampilkan pada Dashboard, sapaan aplikasi, serta lembar ekspor PDF resmi.
                </p>
              </div>

              {/* Avatar Preview & Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B4F1D]">
                  Pilih Foto Profil / Avatar
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#d4af37] shadow-sm shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-[11px] text-[#805533] mb-1 font-medium">Pilih cepat foto standar:</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_AVATARS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(p.url)}
                          className={`w-7 h-7 rounded-full border-2 overflow-hidden transition-all ${
                            avatarUrl === p.url ? 'border-[#735c00] scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
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
                  className="py-2.5 bg-[#735c00] hover:bg-[#5e4b00] text-white font-headline font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
