import zlib
import struct
import math
import os

def create_png(width, height, draw_func, filename):
    # RGBA image buffer
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0: None
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(bytes(raw_data), 9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n') # PNG header
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', 13))
    png.extend(b'IHDR')
    png.extend(ihdr_data)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff))
    
    # IDAT
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    # IEND
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def icon_drawer(is_maskable=False):
    def pixel(x, y, w, h):
        # Normalized coordinates [-1, 1]
        nx = (x / (w - 1)) * 2 - 1
        ny = (y / (h - 1)) * 2 - 1
        dist_center = math.sqrt(nx*nx + ny*ny)
        
        # Background gradient: Gold (#5C4300 to #A67C00 to #C99700)
        t = (nx + ny + 2) / 4.0 # 0 to 1 diagonal
        bg_r = int(92 + t * (190 - 92))
        bg_g = int(67 + t * (145 - 67))
        bg_b = int(0 + t * (25 - 0))
        
        # Corner rounding if not maskable
        if not is_maskable:
            # Squircle radius check
            p = 4.0
            sq_dist = (abs(nx)**p + abs(ny)**p)**(1/p)
            if sq_dist > 0.95:
                # Outside squircle -> transparent
                return 0, 0, 0, 0
            elif sq_dist > 0.90:
                # Anti-alias edge
                alpha = int(255 * (1.0 - (sq_dist - 0.90) / 0.05))
                return bg_r, bg_g, bg_b, max(0, min(255, alpha))
        
        # Inner shield area
        # Shield coordinates: -0.55 < nx < 0.55, -0.65 < ny < 0.55
        if abs(nx) < 0.52 and -0.65 < ny < 0.50:
            # Shield boundary
            shield_w = 0.52 * max(0.0, min(1.0, 1.0 - max(0.0, ny - 0.0) * 1.6))
            if abs(nx) < shield_w:
                # Inside dark shield
                s_t = (ny + 0.65) / 1.15
                sr = int(32 + s_t * 8)
                sg = int(26 + s_t * 6)
                sb = int(18 + s_t * 4)
                
                # Check for radar / pin
                # Pin center around (0, -0.15)
                dx = nx - 0
                dy = ny - (-0.12)
                pin_dist = math.sqrt(dx*dx + dy*dy)
                
                # Radar rings
                if 0.28 < pin_dist < 0.31 or 0.18 < pin_dist < 0.20:
                    return 245, 215, 120, 255 # Gold ring
                
                # Pin body
                if pin_dist < 0.14 or (abs(dx) < 0.09 and -0.12 <= ny <= 0.10 and abs(dx) < (0.10 - ny)*0.8):
                    # Gold pin
                    if pin_dist < 0.04:
                        return 28, 22, 14, 255 # Pin hole
                    return 235, 195, 65, 255
                
                # Checkmark circle at bottom of shield (center (0, 0.25))
                cdx = nx - 0
                cdy = ny - 0.25
                cdist = math.sqrt(cdx*cdx + cdy*cdy)
                if cdist < 0.12:
                    if cdist > 0.10:
                        return 220, 252, 231, 255 # Border
                    # Green verified
                    # Checkmark stroke approximation
                    if (-0.05 < cdx < 0.05 and abs(cdy - cdx*0.7) < 0.025) or (-0.07 < cdx < -0.02 and abs(cdy - (-cdx - 0.04)) < 0.025):
                        return 255, 255, 255, 255 # White tick
                    return 21, 128, 61, 255 # Emerald green
                
                return sr, sg, sb, 255
                
        # Outer gold body
        return bg_r, bg_g, bg_b, 255
    return pixel

os.makedirs('public', exist_ok=True)
create_png(192, 192, icon_drawer(is_maskable=False), 'public/pwa-192x192.png')
create_png(512, 512, icon_drawer(is_maskable=False), 'public/pwa-512x512.png')
create_png(512, 512, icon_drawer(is_maskable=True), 'public/pwa-maskable-512x512.png')
create_png(180, 180, icon_drawer(is_maskable=False), 'public/apple-touch-icon.png')
create_png(32, 32, icon_drawer(is_maskable=False), 'public/favicon.png')
print("All PWA PNG icons created successfully!")
