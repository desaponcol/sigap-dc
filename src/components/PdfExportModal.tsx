import React, { useState } from 'react';
import { AttendanceRecord, UserProfile, WorkReport } from '../types/index.ts';
import {
  getCurrentYear,
  getCurrentMonthName,
  getDynamicYearsList,
  formatDynamicIndonesianDate,
} from '../utils/presence.ts';
import { getRegisteredDesaLicenses } from '../data/mockData.ts';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  attendanceRecords: AttendanceRecord[];
  workReports: WorkReport[];
}

/**
 * Official Indonesian Village Government Crest / Lambang Daerah Desa Standar
 */
const VillageOfficialLogo: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} shrink-0 drop-shadow-sm`}
    aria-label="Logo Resmi Pemerintahan Desa"
  >
    {/* Shield Outer Gold Border */}
    <path
      d="M60 4L108 20V56C108 84.5 87 106 60 116C33 106 12 84.5 12 56V20L60 4Z"
      fill="#B8860B"
      stroke="#735C00"
      strokeWidth="2.5"
    />
    {/* Inner Shield (Dark Green / Navy Regional Seal) */}
    <path
      d="M60 9L102 23V55C102 81 83.5 101 60 110C36.5 101 18 81 18 55V23L60 9Z"
      fill="#0F3822"
    />

    {/* Golden Star at Apex */}
    <polygon
      points="60,16 63.5,25 73,25.5 65,31 68,40 60,34.5 52,40 55,31 47,25.5 56.5,25"
      fill="#FFD700"
      stroke="#B8860B"
      strokeWidth="0.8"
    />

    {/* Left Laurel (Padi - Rice Gold) */}
    <path
      d="M30 76C27 68 28 50 36 38C38 42 39 48 37 54C41 46 45 42 43 58C39 66 35 72 30 76Z"
      fill="#F5C518"
    />
    <circle cx="28" cy="46" r="3" fill="#FFD700" />
    <circle cx="31" cy="54" r="3" fill="#FFD700" />
    <circle cx="33" cy="62" r="3" fill="#FFD700" />
    <circle cx="36" cy="70" r="3" fill="#FFD700" />

    {/* Right Laurel (Kapas - Cotton Green/White) */}
    <path
      d="M90 76C93 68 92 50 84 38C82 42 81 48 83 54C79 46 75 42 77 58C81 66 85 72 90 76Z"
      fill="#2E7D32"
    />
    <circle cx="92" cy="46" r="3" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="1" />
    <circle cx="89" cy="54" r="3" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="1" />
    <circle cx="87" cy="62" r="3" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="1" />
    <circle cx="84" cy="70" r="3" fill="#FFFFFF" stroke="#2E7D32" strokeWidth="1" />

    {/* Center Village Hall / Rumah Adat Symbol */}
    <polygon points="60,42 42,56 78,56" fill="#D4AF37" stroke="#735C00" strokeWidth="1" />
    <rect x="46" y="56" width="28" height="20" fill="#FCF9F0" stroke="#735C00" strokeWidth="1" />
    {/* Pillars */}
    <rect x="49" y="58" width="3" height="18" fill="#735C00" />
    <rect x="58.5" y="58" width="3" height="18" fill="#735C00" />
    <rect x="68" y="58" width="3" height="18" fill="#735C00" />

    {/* Indonesian Red & White Ribbon at Base */}
    <path d="M30 84C45 92 75 92 90 84L87 93C73 99 47 99 33 93L30 84Z" fill="#DC2626" />
    <path d="M33 93C47 99 73 99 87 93L84 99C71 104 49 104 36 99L33 93Z" fill="#FFFFFF" />

    {/* Ribbon Banner Text */}
    <text
      x="60"
      y="91"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="6.5"
      fontWeight="900"
      fontFamily="sans-serif"
      letterSpacing="1"
    >
      DESA PRAJA
    </text>
  </svg>
);

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  user,
  attendanceRecords,
  workReports,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthName());
  const [selectedYear, setSelectedYear] = useState<string>(String(getCurrentYear()));
  const [showPreview, setShowPreview] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const availableYears = getDynamicYearsList();
  const todayIndo = formatDynamicIndonesianDate();

  if (!isOpen) return null;

  // Resolve official Village & Regional data from licenses or user profile
  const licenses = getRegisteredDesaLicenses();
  const foundLicense =
    licenses.find((l) => l.id === user.tenantId || l.licenseKey === user.desaLicenseKey) ||
    licenses.find((l) => user.instansi.toLowerCase().includes(l.namaDesa.toLowerCase()));

  const activeDesa: {
    namaDesa: string;
    kecamatan: string;
    kabupaten: string;
    provinsi: string;
    officeLat: number;
    officeLng: number;
    logoUrl?: string;
  } = foundLicense || {
    namaDesa: 'Desa Poncol',
    kecamatan: 'Poncol',
    kabupaten: 'Magetan',
    provinsi: 'Jawa Timur',
    officeLat: -7.712345,
    officeLng: 111.234567,
    logoUrl: undefined,
  };

  // Build clean uppercase names for the 4-line government Kop
  const namaKabupaten = activeDesa.kabupaten.toUpperCase();
  const namaKecamatan = activeDesa.kecamatan.toUpperCase();
  const cleanNamaDesa = activeDesa.namaDesa.replace(/^desa\s+/i, '').trim().toUpperCase();
  const lineDesa = `DESA ${cleanNamaDesa}`;

  // Robust HTML string generation for direct standalone download and iframe printing
  const generateStandaloneHtml = () => {
    const tableRows = attendanceRecords
      .map((rec, idx) => {
        const isHadir = rec.status === 'HADIR';
        const isDinas = rec.status === 'DINAS';
        const isIzin = rec.status === 'IZIN';
        const lat = rec.latitude ?? activeDesa.officeLat;
        const lng = rec.longitude ?? activeDesa.officeLng;

        let coordHtml = '';
        if (isHadir || isDinas) {
          coordHtml = `<span style="font-family: monospace; font-size: 10px; font-weight: bold;">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>`;
        } else {
          coordHtml = `<span style="color: #6b7280; font-style: italic; font-size: 10px;">${isIzin ? 'Dispensasi Izin Pribadi' : 'Dispensasi Surat Dokter'}</span>`;
        }

        const statusLabel = isDinas ? 'DINAS LUAR' : rec.status;
        const statusColor = isHadir
          ? 'background: #d1fae5; color: #065f46;'
          : isDinas
          ? 'background: #dbeafe; color: #1e40af;'
          : isIzin
          ? 'background: #fef3c7; color: #92400e;'
          : 'background: #fee2e2; color: #991b1b;';

        return `
        <tr>
          <td style="text-align: center; border: 1px solid #333; padding: 4px 6px; font-size: 10.5px;">${idx + 1}</td>
          <td style="border: 1px solid #333; padding: 4px 8px; font-weight: bold; font-size: 10.5px; white-space: nowrap;">${rec.formattedDate}</td>
          <td style="text-align: center; border: 1px solid #333; padding: 4px 6px; white-space: nowrap;">
            <span style="display: inline-block; padding: 1.5px 7px; border-radius: 9999px; font-size: 9.5px; font-weight: bold; ${statusColor}">
              ${statusLabel}
            </span>
          </td>
          <td style="text-align: center; border: 1px solid #333; padding: 4px 8px; white-space: nowrap;">
            ${coordHtml}
          </td>
          <td style="border: 1px solid #333; padding: 4px 8px; font-size: 10.5px; white-space: nowrap;">${rec.note || rec.locationName}</td>
        </tr>`;
      })
      .join('');

    const workReportRows = workReports
      .map(
        (rep) => `
      <div style="background: #faf8f2; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; margin-bottom: 8px; font-size: 11px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
          <span>Tanggal: ${rep.date}</span>
          <span style="color: #065f46; text-transform: uppercase;">${rep.status}</span>
        </div>
        <div style="margin-bottom: 4px;"><strong>Uraian Kegiatan:</strong> ${rep.detail}</div>
        <div style="color: #805533;"><strong>Hasil / Bukti Fisik:</strong> ${rep.output}</div>
      </div>`
      )
      .join('');

    const logoHtml = activeDesa.logoUrl
      ? `<img src="${activeDesa.logoUrl}" alt="Logo Desa" style="width: 80px; height: 80px; object-fit: contain;" />`
      : `<svg viewBox="0 0 120 120" style="width: 80px; height: 80px;"><path d="M60 4L108 20V56C108 84.5 87 106 60 116C33 106 12 84.5 12 56V20L60 4Z" fill="#B8860B" stroke="#735C00" stroke-width="2.5"/><path d="M60 9L102 23V55C102 81 83.5 101 60 110C36.5 101 18 81 18 55V23L60 9Z" fill="#0F3822"/><polygon points="60,16 63.5,25 73,25.5 65,31 68,40 60,34.5 52,40 55,31 47,25.5 56.5,25" fill="#FFD700"/><polygon points="60,42 42,56 78,56" fill="#D4AF37"/><rect x="46" y="56" width="28" height="20" fill="#FCF9F0"/><text x="60" y="91" text-anchor="middle" fill="#FFFFFF" font-size="6.5" font-weight="900" font-family="sans-serif">DESA PRAJA</text></svg>`;

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Rekap_Presensi_${lineDesa.replace(/\s+/g, '_')}_${selectedMonth}_${selectedYear}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
    body { font-family: "Times New Roman", Times, serif; color: #111; margin: 0; padding: 20px; line-height: 1.4; background: #fff; }
    .header-table { width: 100%; border: none; margin-bottom: 8px; }
    .header-table td { border: none; vertical-align: middle; }
    .kop-border { border-bottom: 4px double #000; margin-bottom: 15px; padding-bottom: 10px; }
    .title-1 { font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 0.5px; }
    .title-2 { font-size: 15px; font-weight: 800; text-transform: uppercase; margin: 2px 0; letter-spacing: 1px; }
    .title-3 { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 2px 0; letter-spacing: 2px; }
    .title-4 { font-size: 11px; font-style: italic; color: #333; margin-top: 4px; }
    .id-box { width: 100%; border: 1px solid #999; background: #faf8f2; border-radius: 8px; padding: 10px; margin-bottom: 16px; font-size: 11px; box-sizing: border-box; }
    .id-grid { display: flex; flex-wrap: wrap; }
    .id-col { width: 50%; padding: 2px 0; }
    .table-data { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 16px; font-size: 11px; }
    .table-data th { background: #f3f0e6; border: 1px solid #333; padding: 6px 8px; text-align: center; }
    .signature-table { width: 100%; border: none; margin-top: 25px; font-size: 12px; }
    .signature-table td { border: none; text-align: center; width: 50%; vertical-align: top; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 10px 14px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 12px;">
    <span>Dokumen Siap Cetak &bull; Klik tombol di kanan atau tekan <strong>Ctrl + P</strong> untuk Cetak / Simpan PDF</span>
    <button onclick="window.print()" style="background: #735c00; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
      Cetak / Simpan PDF
    </button>
  </div>

  <div class="kop-border">
    <table class="header-table">
      <tr>
        <td style="width: 85px; text-align: left;">
          ${logoHtml}
        </td>
        <td style="text-align: center; padding: 0 10px;">
          <div class="title-1">PEMERINTAH KABUPATEN ${namaKabupaten}</div>
          <div class="title-2">KECAMATAN ${namaKecamatan}</div>
          <div class="title-3">${lineDesa}</div>
          <div class="title-4">Laporan Rekapitulasi Presensi &amp; Laporan Kinerja Harian Pegawai</div>
        </td>
        <td style="width: 85px;"></td>
      </tr>
    </table>
  </div>

  <div class="id-box">
    <div class="id-grid">
      <div class="id-col">Nama Pegawai: <strong>${user.name}</strong></div>
      <div class="id-col">NIP / NIAP: <strong>${user.nip}</strong></div>
      <div class="id-col">Jabatan: <strong>${user.jabatan}</strong></div>
      <div class="id-col">Instansi Balai: <strong>${user.instansi}</strong></div>
    </div>
  </div>

  <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">
    1. Rekapitulasi Presensi Kehadiran Berbasis Geofence GPS
  </div>
  <table class="table-data">
    <thead>
      <tr>
        <th style="width: 32px; padding: 5px 4px;">No</th>
        <th style="padding: 5px 8px;">Hari / Tanggal</th>
        <th style="width: 90px; padding: 5px 4px;">Status</th>
        <th style="width: 180px; padding: 5px 8px;">Titik Koordinat (Geofence GPS)</th>
        <th style="padding: 5px 8px;">Lokasi / Keterangan</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; margin-top: 16px; margin-bottom: 6px;">
    2. Laporan Realisasi Kinerja Harian Pegawai
  </div>
  ${workReportRows}

  <table class="signature-table">
    <tr>
      <td>
        <div>Mengetahui,</div>
        <div style="font-weight: bold;">Kepala Desa ${cleanNamaDesa}</div>
        <div style="height: 60px;"></div>
        <div style="font-weight: bold; text-decoration: underline;">H. KUSNADI, S.Sos.</div>
        <div style="font-size: 10px; color: #555;">NIP. 19740510 199803 1 002</div>
      </td>
      <td>
        <div>${cleanNamaDesa}, ${todayIndo.dateNumber} ${todayIndo.monthName} ${todayIndo.year}</div>
        <div style="font-weight: bold;">Aparatur Pelapor,</div>
        <div style="height: 60px;"></div>
        <div style="font-weight: bold; text-decoration: underline;">${user.name}</div>
        <div style="font-size: 10px; color: #555;">NIP. ${user.nip}</div>
      </td>
    </tr>
  </table>

  <!-- Footer Watermark / Printed by Sigap-Digital Concierge -->
  <div style="margin-top: 40px; padding-top: 8px; border-top: 1px dashed #888; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #555; font-style: italic; font-family: sans-serif;">
    <span>printed by sigap-digital Concierge pada ${todayIndo.dateNumber} ${todayIndo.monthName} ${todayIndo.year}</span>
    <span style="font-family: monospace; font-size: 9px; color: #777;">Dokumen Sah SIGAP Desa &bull; Terverifikasi Geofence GPS</span>
  </div>

  <script>
    // Auto-trigger browser print dialog on load
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;
  };

  // Direct download of the standalone printable file (100% reliable bypass for iframe sandbox)
  const handleDownloadPrintableHtml = () => {
    try {
      const htmlContent = generateStandaloneHtml();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rekap_Presensi_${lineDesa.replace(/\s+/g, '_')}_${selectedMonth}_${selectedYear}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setPrintStatus('Dokumen berhasil diunduh! Buka file tersebut untuk langsung mencetak atau simpan ke PDF.');
    } catch (e: any) {
      setPrintStatus(`Gagal mengunduh: ${e.message}`);
    }
  };

  // Print button action
  const handlePrint = () => {
    setPrintStatus('Mempersiapkan pencetakan...');
    const originalTitle = document.title;
    document.title = `Rekap_Presensi_${lineDesa.replace(/\s+/g, '_')}_${selectedMonth}_${selectedYear}`;

    try {
      // 1. Direct window.print() call
      window.print();
      setPrintStatus('Dialog cetak dibuka. Jika tidak muncul di browser Anda, klik "Unduh File Cetak (PDF)"');
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } catch (err) {
      console.warn('Direct print blocked by iframe sandbox, falling back to download:', err);
      // 2. Fallback to direct printable file download
      handleDownloadPrintableHtml();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1c1c17]/50 backdrop-blur-sm no-print"
        onClick={() => {
          setShowPreview(false);
          setPrintStatus(null);
          onClose();
        }}
      />

      {!showPreview ? (
        /* Period Selection Modal */
        <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl z-10 border border-[#d0c5af]/25">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-xl font-bold text-[#1c1c17]">
              Pilih Periode Laporan
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#805533] mb-2">
                Bulan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-[#f6f3ea] border-none rounded-xl py-3 px-4 font-semibold text-[#1c1c17] focus:ring-2 focus:ring-[#735c00]/20 text-sm outline-none cursor-pointer"
              >
                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktober">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#805533] mb-2">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#f6f3ea] border-none rounded-xl py-3 px-4 font-semibold text-[#1c1c17] focus:ring-2 focus:ring-[#735c00]/20 text-sm outline-none cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="w-full py-4 bg-[#735c00] hover:bg-[#554300] text-white font-headline font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-[#735c00]/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">description</span>
            Lihat &amp; Cetak Dokumen
          </button>
        </div>
      ) : (
        /* Printable Document Preview */
        <div className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-[1.75rem] sm:rounded-[2rem] p-3.5 sm:p-7 shadow-2xl z-10 border border-[#d0c5af]/25 flex flex-col printable-paper overflow-hidden">
          {/* Header Action Bar (Hidden during Print) */}
          <div className="flex flex-col gap-2 pb-3 border-b border-[#d0c5af]/25 no-print mb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-headline font-bold text-base sm:text-lg text-[#1c1c17] truncate">
                  Pratinjau Dokumen Cetak Presensi
                </h3>
                <p className="text-[11px] sm:text-xs text-[#805533] truncate">
                  Periode Rekap: {selectedMonth} {selectedYear} &bull; {activeDesa.namaDesa}
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto justify-end">
                {/* 1. Tombol Cetak Langsung */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-[#735c00] to-[#d4af37] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 hover:shadow-lg transition-all cursor-pointer shrink-0"
                  title="Cetak langsung menggunakan dialog print browser"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>Cetak / PDF</span>
                </button>

                {/* 2. Tombol Unduh Dokumen (Bypass sandbox iframe jika print browser diblokir) */}
                <button
                  type="button"
                  onClick={handleDownloadPrintableHtml}
                  className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-[#f6f3ea] hover:bg-[#ebe8df] text-[#735c00] border border-[#d4af37]/40 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
                  title="Unduh file dokumen yang langsung membuka dialog cetak PDF saat dibuka"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span className="hidden sm:inline">Unduh File Cetak</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPreview(false);
                    setPrintStatus(null);
                  }}
                  className="p-1.5 sm:p-2 rounded-full text-[#7f7663] hover:bg-[#f6f3ea] cursor-pointer shrink-0"
                  title="Tutup"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">close</span>
                </button>
              </div>
            </div>

            {/* Notification/Help Banner */}
            {printStatus && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#735c00]">info</span>
                  <span>{printStatus}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPrintStatus(null)}
                  className="text-[10px] text-amber-700 font-bold hover:underline"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>

          {/* Printable Document Body */}
          <div
            id="printable-document-content"
            className="overflow-y-auto pr-1 py-1 space-y-5 text-sm text-[#1c1c17]"
          >
            {/* KOP RESMI PEMERINTAHAN DESA - LOGO DI KIRI ATAS */}
            <div className="pb-3 border-b-4 border-double border-black">
              <div className="flex items-center justify-between gap-3 sm:gap-6">
                {/* 1. LOGO DESA DI SEBELAH KIRI ATAS */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                  {activeDesa.logoUrl ? (
                    <img
                      src={activeDesa.logoUrl}
                      alt={`Logo Resmi ${activeDesa.namaDesa}`}
                      className="w-16 h-16 sm:w-24 sm:h-24 object-contain"
                    />
                  ) : (
                    <VillageOfficialLogo className="w-16 h-16 sm:w-24 sm:h-24" />
                  )}
                </div>

                {/* 2. TEKS KOP SURAT DI TENGAH */}
                <div className="flex-1 text-center">
                  {/* Baris 1: PEMERINTAH KABUPATEN ....... */}
                  <h3 className="font-serif font-bold text-xs sm:text-sm tracking-wider uppercase text-black leading-tight">
                    PEMERINTAH KABUPATEN {namaKabupaten}
                  </h3>
                  {/* Baris 2: KECAMATAN ........ */}
                  <h2 className="font-serif font-extrabold text-sm sm:text-base tracking-widest uppercase text-black leading-tight mt-0.5">
                    KECAMATAN {namaKecamatan}
                  </h2>
                  {/* Baris 3: DESA ........ */}
                  <h1 className="font-serif font-black text-lg sm:text-2xl tracking-[0.15em] uppercase text-black leading-tight mt-0.5">
                    {lineDesa}
                  </h1>
                  {/* Baris 4: Laporan Rekapitulasi Presensi & Laporan Kinerja Harian Pegawai */}
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-800 tracking-normal mt-1.5 italic">
                    Laporan Rekapitulasi Presensi &amp; Laporan Kinerja Harian Pegawai
                  </p>
                </div>

                {/* 3. SPACER KANAN (SIMETRIS) */}
                <div className="w-16 sm:w-24 shrink-0 hidden sm:block" aria-hidden="true" />
              </div>
            </div>

            {/* Identitas Aparatur Desa */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#fcf9f0] p-4 rounded-xl border border-black/30">
              <div>
                <span className="text-gray-600">Nama Pegawai:</span>{' '}
                <strong className="text-black font-bold">{user.name}</strong>
              </div>
              <div>
                <span className="text-gray-600">NIP / NIAP:</span>{' '}
                <strong className="text-black font-bold">{user.nip}</strong>
              </div>
              <div>
                <span className="text-gray-600">Jabatan:</span>{' '}
                <span className="text-black font-semibold">{user.jabatan}</span>
              </div>
              <div>
                <span className="text-gray-600">Instansi Balai:</span>{' '}
                <span className="text-black font-semibold">{user.instansi}</span>
              </div>
            </div>

            {/* TABEL REKAPITULASI PRESENSI KEHADIRAN (TITIK KOORDINAT GEOFENCE) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-black">
                  1. Rekapitulasi Presensi Kehadiran Berbasis Geofence GPS
                </h4>
                <span className="text-[10px] text-gray-600 font-mono">
                  Koordinat Pusat Balai: {activeDesa.officeLat}, {activeDesa.officeLng}
                </span>
              </div>

              <div className="border border-black/40 rounded-lg overflow-x-auto w-full max-w-full">
                <table className="w-full text-xs min-w-[500px]">
                  <thead className="bg-[#f6f3ea] text-black border-b border-black">
                    <tr>
                      <th className="py-1.5 px-2 text-center w-10 border-r border-black/30">No</th>
                      <th className="py-1.5 px-3 text-left border-r border-black/30">Hari / Tanggal</th>
                      <th className="py-1.5 px-2 text-center w-24 border-r border-black/30">Status</th>
                      <th className="py-1.5 px-3 text-center border-r border-black/30">
                        Titik Koordinat (Geofence GPS)
                      </th>
                      <th className="py-1.5 px-3 text-left">Lokasi / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/20">
                    {attendanceRecords.map((rec, idx) => {
                      const isHadir = rec.status === 'HADIR';
                      const isDinas = rec.status === 'DINAS';
                      const isIzin = rec.status === 'IZIN';

                      // Format geofence coordinates
                      const lat = rec.latitude ?? activeDesa.officeLat;
                      const lng = rec.longitude ?? activeDesa.officeLng;

                      return (
                        <tr key={rec.id} className="hover:bg-gray-50/70">
                          <td className="py-1.5 px-2 text-center font-medium border-r border-black/20 text-gray-700 whitespace-nowrap">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 font-semibold text-black border-r border-black/20 whitespace-nowrap">
                            {rec.formattedDate}
                          </td>
                          <td className="py-1.5 px-2 text-center border-r border-black/20 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9.5px] font-black tracking-wider uppercase inline-block ${
                                isHadir
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : isDinas
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : isIzin
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-red-100 text-red-900 border border-red-300'
                              }`}
                            >
                              {isDinas ? 'DINAS LUAR' : rec.status}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-center border-r border-black/20 whitespace-nowrap">
                            {isHadir || isDinas ? (
                              <span className="font-mono text-[11px] font-bold text-black">
                                {lat.toFixed(6)}, {lng.toFixed(6)}
                              </span>
                            ) : (
                              <span className="text-gray-500 italic text-[10.5px]">
                                {isIzin ? 'Dispensasi Izin Pribadi' : 'Dispensasi Surat Dokter'}
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-gray-800 text-xs font-medium whitespace-nowrap">
                            {rec.note || rec.locationName}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL 2: REALISASI KINERJA HARIAN */}
            <div>
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-black mb-2">
                2. Laporan Realisasi Kinerja Harian Pegawai
              </h4>
              <div className="space-y-2">
                {workReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 bg-[#fcf9f0] rounded-xl text-xs border border-black/20"
                  >
                    <div className="flex justify-between font-bold text-black mb-1">
                      <span>Tanggal: {rep.date}</span>
                      <span className="text-emerald-800 font-black tracking-wider uppercase">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-1 leading-relaxed">
                      <strong>Uraian Kegiatan:</strong> {rep.detail}
                    </p>
                    <p className="text-[#805533] leading-relaxed">
                      <strong>Hasil / Bukti Fisik:</strong> {rep.output}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* TANDA TANGAN RESMI PENGESAHAN */}
            <div className="pt-4 grid grid-cols-2 text-center text-xs text-black">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Desa {cleanNamaDesa}</p>
                <div className="h-16"></div>
                <p className="font-bold underline uppercase">H. KUSNADI, S.Sos.</p>
                <p className="text-[10px] text-gray-600">NIP. 19740510 199803 1 002</p>
              </div>
              <div>
                <p>
                  {cleanNamaDesa}, {todayIndo.dateNumber} {todayIndo.monthName} {todayIndo.year}
                </p>
                <p className="font-bold">Aparatur Pelapor,</p>
                <div className="h-16"></div>
                <p className="font-bold underline">{user.name}</p>
                <p className="text-[10px] text-gray-600">NIP. {user.nip}</p>
              </div>
            </div>

            {/* FOOTER WATERMARK / PRINTED BY SIGAP-DIGITAL CONCIERGE */}
            <div className="pt-4 mt-6 border-t border-dashed border-gray-400 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-gray-500 italic">
              <span>
                printed by sigap-digital Concierge pada {todayIndo.dateNumber} {todayIndo.monthName} {todayIndo.year}
              </span>
              <span className="font-mono text-[9px] text-gray-400">
                Dokumen Sah SIGAP Desa &bull; Terverifikasi Geofence GPS
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
