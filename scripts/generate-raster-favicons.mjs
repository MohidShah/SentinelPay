import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

/**
 * Creates an uncompressed/deflated RGBA PNG buffer in pure Node.js (no sharp/canvas required).
 */
function createPng(width, height, rgbaBuffer) {
  // 1. Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // 2. IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // 3. IDAT Chunk: Each scanline starts with filter byte 0x00
  const scanlineLength = width * 4;
  const rawScanlines = Buffer.alloc((scanlineLength + 1) * height);
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (scanlineLength + 1);
    rawScanlines[rawOffset] = 0; // Filter 0
    rgbaBuffer.copy(rawScanlines, rawOffset + 1, y * scanlineLength, (y + 1) * scanlineLength);
  }
  const compressed = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk("IDAT", compressed);

  // 4. IEND Chunk
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);
  const crc = calcCrc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function calcCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Creates an ICO buffer wrapping a PNG or BMP.
 */
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  let offset = 6 + count * 16;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry[0] = item.width === 256 ? 0 : item.width;
    entry[1] = item.height === 256 ? 0 : item.height;
    entry[2] = 0; // palette
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += item.buffer.length;
    dirEntries.push(entry);
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((p) => p.buffer)]);
}

/**
 * Draws the high-contrast SentinelPay 'S' squircle icon at arbitrary resolution.
 */
function renderSentinelIconRgba(size) {
  const buf = Buffer.alloc(size * size * 4);
  const radius = Math.floor(size * 0.25);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    // Simple alpha blending
    const srcA = a / 255;
    const destA = buf[idx + 3] / 255;
    const outA = srcA + destA * (1 - srcA);
    if (outA > 0) {
      buf[idx] = Math.round((r * srcA + buf[idx] * destA * (1 - srcA)) / outA);
      buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * destA * (1 - srcA)) / outA);
      buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * destA * (1 - srcA)) / outA);
      buf[idx + 3] = Math.round(outA * 255);
    }
  }

  // 1. Draw rounded squircle background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let inside = false;
      const cornerR = radius;
      if (x >= cornerR && x < size - cornerR) inside = true;
      else if (y >= cornerR && y < size - cornerR) inside = true;
      else {
        // In a corner
        const cx = x < cornerR ? cornerR : size - 1 - cornerR;
        const cy = y < cornerR ? cornerR : size - 1 - cornerR;
        const dist = Math.hypot(x - cx, y - cy);
        if (dist <= cornerR) inside = true;
      }

      if (inside) {
        // Gradient: Electric Blue (#2563EB = 37, 99, 235) to Deep Cobalt (#0F172A = 15, 23, 42)
        const t = (x + y) / ((size - 1) * 2);
        const r = Math.round(37 * (1 - t) + 15 * t);
        const g = Math.round(99 * (1 - t) + 23 * t);
        const b = Math.round(235 * (1 - t) + 42 * t);
        setPixel(x, y, r, g, b, 255);
      }
    }
  }

  // 2. Draw Mathematical S curve
  // Normalized S path points
  const points = [];
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Cubic bezier or parametric S curve
    let nx, ny;
    if (t < 0.5) {
      // Upper loop: starts upper right (0.68, 0.31), curves to top apex (0.50, 0.22), then to left shoulder (0.28, 0.36), then to center (0.50, 0.50)
      const u = t * 2;
      const p0 = [0.68, 0.31];
      const p1 = [0.68, 0.22];
      const p2 = [0.28, 0.22];
      const p3 = [0.50, 0.50];
      nx = Math.pow(1 - u, 3) * p0[0] + 3 * Math.pow(1 - u, 2) * u * p1[0] + 3 * (1 - u) * Math.pow(u, 2) * p2[0] + Math.pow(u, 3) * p3[0];
      ny = Math.pow(1 - u, 3) * p0[1] + 3 * Math.pow(1 - u, 2) * u * p1[1] + 3 * (1 - u) * Math.pow(u, 2) * p2[1] + Math.pow(u, 3) * p3[1];
    } else {
      // Lower loop (180deg symmetric): from center (0.50, 0.50) to right hip (0.72, 0.64) to bottom apex (0.50, 0.78) to lower left (0.32, 0.69)
      const u = (t - 0.5) * 2;
      const p0 = [0.50, 0.50];
      const p1 = [0.72, 0.78];
      const p2 = [0.32, 0.78];
      const p3 = [0.32, 0.69];
      nx = Math.pow(1 - u, 3) * p0[0] + 3 * Math.pow(1 - u, 2) * u * p1[0] + 3 * (1 - u) * Math.pow(u, 2) * p2[0] + Math.pow(u, 3) * p3[0];
      ny = Math.pow(1 - u, 3) * p0[1] + 3 * Math.pow(1 - u, 2) * u * p1[1] + 3 * (1 - u) * Math.pow(u, 2) * p2[1] + Math.pow(u, 3) * p3[1];
    }
    points.push({ x: nx * size, y: ny * size, t });
  }

  // Draw thick stroke with brush
  const brushR = Math.max(1, Math.round(size * 0.055));
  for (const pt of points) {
    // Upper half is white (255, 255, 255), lower half is cyan (0, 210, 255)
    let pr, pg, pb;
    if (pt.t < 0.4) {
      pr = 255; pg = 255; pb = 255;
    } else if (pt.t > 0.7) {
      pr = 0; pg = 210; pb = 255;
    } else {
      const blend = (pt.t - 0.4) / 0.3;
      pr = Math.round(255 * (1 - blend));
      pg = Math.round(255 * (1 - blend) + 210 * blend);
      pb = 255;
    }

    const ix = Math.round(pt.x);
    const iy = Math.round(pt.y);
    for (let dy = -brushR; dy <= brushR; dy++) {
      for (let dx = -brushR; dx <= brushR; dx++) {
        const d = Math.hypot(dx, dy);
        if (d <= brushR) {
          const alpha = Math.min(255, Math.round((1 - d / (brushR + 0.5)) * 255 * 1.5));
          setPixel(ix + dx, iy + dy, pr, pg, pb, alpha);
        }
      }
    }
  }

  return buf;
}

export function generateRasterAssets() {
  const publicDir = path.join(rootDir, "public");
  const appDir = path.join(rootDir, "app");

  // 1. Generate 32x32 PNG
  const rgba32 = renderSentinelIconRgba(32);
  const png32 = createPng(32, 32, rgba32);
  fs.writeFileSync(path.join(publicDir, "favicon-32x32.png"), png32);

  // 2. Generate 16x16 PNG
  const rgba16 = renderSentinelIconRgba(16);
  const png16 = createPng(16, 16, rgba16);
  fs.writeFileSync(path.join(publicDir, "favicon-16x16.png"), png16);

  // 3. Generate 180x180 Apple Touch PNG
  const rgba180 = renderSentinelIconRgba(180);
  const png180 = createPng(180, 180, rgba180);
  fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), png180);
  fs.writeFileSync(path.join(appDir, "apple-icon.png"), png180);

  // 4. Generate multi-resolution favicon.ico
  const icoBuf = createIco([
    { width: 32, height: 32, buffer: png32 },
    { width: 16, height: 16, buffer: png16 },
  ]);
  fs.writeFileSync(path.join(appDir, "favicon.ico"), icoBuf);

  console.log("Successfully generated raster brand assets:");
  console.log("- public/favicon-32x32.png");
  console.log("- public/favicon-16x16.png");
  console.log("- public/apple-touch-icon.png");
  console.log("- app/apple-icon.png");
  console.log("- app/favicon.ico");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  generateRasterAssets();
}

