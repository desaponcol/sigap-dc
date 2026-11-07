/**
 * Utility for client-side image processing, compression, and resizing
 * Ensures avatar and document photo uploads are lightweight, fast, and fit within storage quotas.
 */

export const OFFICIAL_PRESET_AVATARS = [
  {
    label: 'Wanita ASN (Berhijab/Formal)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    category: 'Wanita',
  },
  {
    label: 'Pria ASN (Batik/Formal)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    category: 'Pria',
  },
  {
    label: 'Pria Jas (Sekdes/Kades)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    category: 'Pria',
  },
  {
    label: 'Wanita ASN (Kemeja Putih)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    category: 'Wanita',
  },
  {
    label: 'Pria Kemeja Putih ASN',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    category: 'Pria',
  },
  {
    label: 'Wanita Profesional Berjilbab',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    category: 'Wanita',
  },
  {
    label: 'Pria Aparatur Muda',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    category: 'Pria',
  },
];

/**
 * Reads a File object and compresses/resizes it to an optimized base64 Data URL.
 * Automatically limits dimension to maxSize (default 400px) and converts to JPEG at high visual fidelity.
 */
export function processImageFile(
  file: File,
  maxSize: number = 400,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar valid. Harap pilih file JPG, PNG, atau WEBP.'));
      return;
    }

    // Reject oversized files before attempting read
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Ukuran file foto maksimal 10MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari perangkat.'));
    reader.onload = (e) => {
      const srcResult = e.target?.result;
      if (typeof srcResult !== 'string') {
        reject(new Error('Hasil baca file tidak valid.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung atau file korup.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale maintaining aspect ratio
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(srcResult);
            return;
          }

          // Smooth resampling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          // Fallback to raw data url if canvas security or memory issue occurs
          resolve(srcResult);
        }
      };
      img.src = srcResult;
    };
    reader.readAsDataURL(file);
  });
}
