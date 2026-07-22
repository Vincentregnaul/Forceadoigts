// make-icons.mjs — génère les icônes PNG de l'app sans dépendance (encodeur PNG maison).
// Usage : node tools/make-icons.mjs   (depuis la racine du projet)
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, draw) {
  const stride = size * 4 + 1;           // +1 byte de filtre par ligne
  const raw = Buffer.alloc(size * stride);
  const px = (x, y, r, g, b, a = 255) => {
    const off = y * stride + 1 + x * 4;
    raw[off] = r; raw[off + 1] = g; raw[off + 2] = b; raw[off + 3] = a;
  };
  draw(px, size);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // profondeur
  ihdr[9] = 6;  // RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))
  ]);
}

function drawIcon(maskable) {
  return (px, size) => {
    const pad = Math.floor((maskable ? 0.18 : 0.08) * size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) px(x, y, 0x0e, 0x11, 0x16);
    const barY = Math.floor(size * 0.30), barH = Math.floor(size * 0.14);
    for (let y = barY; y < barY + barH; y++) for (let x = pad; x < size - pad; x++) px(x, y, 0x4a, 0xde, 0x80);
    const n = 4, gap = Math.floor(size * 0.03);
    const w = Math.floor((size - 2 * pad - (n - 1) * gap) / n);
    for (let i = 0; i < n; i++) {
      const fx = pad + i * (w + gap);
      for (let y = barY + barH; y < barY + barH + Math.floor(size * 0.22); y++)
        for (let x = fx; x < fx + w; x++) px(x, y, 0x4a, 0xde, 0x80);
    }
  };
}

mkdirSync('icons', { recursive: true });
writeFileSync('icons/icon-192.png', png(192, drawIcon(false)));
writeFileSync('icons/icon-512.png', png(512, drawIcon(false)));
writeFileSync('icons/icon-maskable-512.png', png(512, drawIcon(true)));
console.log('Icones generees : icon-192, icon-512, icon-maskable-512.');
