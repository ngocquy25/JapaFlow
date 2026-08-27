import zlib
import struct

def create_png(width, height, r, g, b, filepath):
    # Generates a clean square PNG with background and circular accent
    raw_data = bytearray()
    center_x, center_y = width / 2, height / 2
    radius = width * 0.44

    for y in range(height):
        raw_data.append(0) # Filter byte 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = (dx*dx + dy*dy)**0.5
            
            if dist < radius:
                # Gradient Sakura Pink
                factor = (x + y) / (width + height)
                pr = int(255 - factor * 20)
                pg = int(77 + factor * 40)
                pb = int(109 + factor * 20)
                raw_data.extend([pr, pg, pb, 255])
            else:
                # Dark Tokyo Night background
                raw_data.extend([11, 15, 25, 255])

    # PNG Signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR Chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    # IDAT Chunk
    compressed_data = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data)
    png += struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)

    # IEND Chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)

    with open(filepath, 'wb') as f:
        f.write(png)

create_png(192, 192, 255, 77, 109, 'icon-192.png')
create_png(512, 512, 255, 77, 109, 'icon-512.png')
print("PWA Icons generated successfully!")
