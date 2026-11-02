import React from 'react';
import { UserProfile } from '../types/index.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1c1c17]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-[2rem] p-6 shadow-2xl z-10 border border-[#d0c5af]/25 space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-[#d0c5af]/20">
          <h3 className="font-headline font-bold text-lg text-[#1c1c17]">
            Profil Aparatur Desa
          </h3>
          <button
            onClick={onClose}
            aria-label="Tutup profil"
            className="p-1 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] transition-all"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#d4af37] shadow-lg"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
              ✓
            </div>
          </div>
          <div>
            <h4 className="font-headline font-extrabold text-xl text-[#1c1c17]">
              {user.name}
            </h4>
            <p className="font-label text-xs uppercase tracking-widest text-[#805533] font-semibold mt-0.5">
              NIP: {user.nip}
            </p>
          </div>
        </div>

        {/* Detailed Info Card */}
        <div className="bg-[#fcf9f0] p-4 rounded-2xl border border-[#d0c5af]/20 space-y-3 text-sm">
          <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
            <span className="text-[#7f7663] text-xs font-medium">Jabatan</span>
            <span className="text-[#1c1c17] font-semibold text-right">{user.jabatan}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
            <span className="text-[#7f7663] text-xs font-medium">Instansi</span>
            <span className="text-[#1c1c17] font-semibold text-right">{user.instansi}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
            <span className="text-[#7f7663] text-xs font-medium">Email Kedinasan</span>
            <span className="text-[#1c1c17] font-semibold text-right">{user.email}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#d0c5af]/15">
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
          <div className="flex justify-between py-1">
            <span className="text-[#6B4F1D] text-xs font-medium">Status Hak Akses</span>
            <span className="text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-0.5 rounded-full text-xs font-bold">
              {user.role === 'admin_desa' ? 'Kelola Desa & Pegawai' : 'Presensi, Laporan & PDF'}
            </span>
          </div>
        </div>

        {user.role === 'pegawai' && (
          <p className="text-[11px] text-[#7f7663] bg-[#f6f3ea] p-3 rounded-xl border border-[#d0c5af]/25 leading-relaxed text-center">
            🔒 <em>Data desa dan profil aparatur dikelola oleh Admin Desa melalui portal administrator resmi.</em>
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white font-headline font-bold rounded-xl shadow-md active:scale-95 transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
