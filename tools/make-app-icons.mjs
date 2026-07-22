// make-app-icons.mjs — décode un PNG source et écrit les icônes PWA (sans dépendance).
// Usage : node make-app-icons.mjs <source.png> <dossier-icons>
import { readFile, writeFile } from 'node:fs/promises';
import { inflateSync, deflateSync } from 'node:zlib';

const SRC = process.argv[2];
const OUTDIR = process.argv[3];

function decodePNG(buf) {
  let pos = 8, width = 0, height = 0, colorType = 0, bitDepth = 8, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos); pos += 4;
    const type = buf.toString('ascii', pos, pos + 4); pos += 4;
    const data = buf.subarray(pos, pos + len); pos += len + 4;
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  if (bitDepth !== 8) throw new Error('bitDepth ' + bitDepth + ' non supporté');
  if (interlace !== 0) throw new Error('PNG entrelacé non supporté');
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : colorType === 4 ? 2 : 4;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const ft = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (ft === 1) v = (v + a) & 255;
      else if (ft === 2) v = (v + b) & 255;
      else if (ft === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (ft === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; }
      cur[x] = v;
    }
    cur.copy(out, y * stride); prev = cur;
  }
  return { width, height, channels, data: out };
}

function toRGBA(img) {
  if (img.channels === 4) return img;
  const { width, height, channels, data } = img;
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i++) {
    const s = i * channels;
    if (channels === 3) { out[j++] = data[s]; out[j++] = data[s + 1]; out[j++] = data[s + 2]; out[j++] = 255; }
    else if (channels === 1) { out[j++] = data[s]; out[j++] = data[s]; out[j++] = data[s]; out[j++] = 255; }
    else { out[j++] = data[s]; out[j++] = data[s]; out[j++] = data[s]; out[j++] = data[s + 1]; }
  }
  return { width, height, channels: 4, data: out };
}

function resizeBox(img, dw, dh) {
  const { width: sw, height: sh, data } = img;
  const out = Buffer.alloc(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const y0 = Math.floor(y * sh / dh), y1 = Math.max(y0 + 1, Math.floor((y + 1) * sh / dh));
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor(x * sw / dw), x1 = Math.max(x0 + 1, Math.floor((x + 1) * sw / dw));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const s = (yy * sw + xx) * 4; r += data[s]; g += data[s + 1]; b += data[s + 2]; a += data[s + 3]; n++; }
      const d = (y * dw + x) * 4; out[d] = Math.round(r / n); out[d + 1] = Math.round(g / n); out[d + 2] = Math.round(b / n); out[d + 3] = Math.round(a / n);
    }
  }
  return { width: dw, height: dh, channels: 4, data: out };
}

function maskable(img, size, bg, scale) {
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) { const d = i * 4; out[d] = bg[0]; out[d + 1] = bg[1]; out[d + 2] = bg[2]; out[d + 3] = 255; }
  const inner = Math.round(size * scale);
  const small = resizeBox(img, inner, inner);
  const off = Math.floor((size - inner) / 2);
  for (let y = 0; y < inner; y++) for (let x = 0; x < inner; x++) {
    const s = (y * inner + x) * 4;
    const d = ((off + y) * size + (off + x)) * 4;
    const a = small.data[s + 3] / 255;
    out[d] = Math.round(small.data[s] * a + out[d] * (1 - a));
    out[d + 1] = Math.round(small.data[s + 1] * a + out[d + 1] * (1 - a));
    out[d + 2] = Math.round(small.data[s + 2] * a + out[d + 2] * (1 - a));
    out[d + 3] = 255;
  }
  return { width: size, height: size, channels: 4, data: out };
}

function crc32(buf) { let c = ~0; for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); } return ~c >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const body = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body)); return Buffer.concat([len, body, crc]); }
function encodePNG(img) {
  const { width, height, data } = img;
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) { raw[y * (stride + 1)] = 0; data.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const src = toRGBA(decodePNG(await readFile(SRC)));
console.log('source décodée : ' + src.width + 'x' + src.height);
await writeFile(`${OUTDIR}/icon-192.png`, encodePNG(resizeBox(src, 192, 192)));
await writeFile(`${OUTDIR}/icon-512.png`, encodePNG(resizeBox(src, 512, 512)));
await writeFile(`${OUTDIR}/icon-maskable-512.png`, encodePNG(maskable(src, 512, [14, 17, 22], 0.86)));
console.log('Icones ecrites dans ' + OUTDIR);
