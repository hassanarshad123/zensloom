// Generates the Zensloom app icon (1024x1024 PNG) with zero dependencies.
// Draws a rounded indigo square with the playful concentric "loom" rings,
// matching the in-app logo. Run: node scripts/gen-zensloom-icon.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const SIZE = 1024;
const RADIUS = 220; // corner radius of the rounded square
const INDIGO = [0x4f, 0x46, 0xe5];

// Concentric rings: [radius, white-alpha]
const RINGS = [
	[330, 0.16],
	[220, 0.34],
	[110, 1.0],
];

// Anti-aliased coverage of a rounded-rect for a pixel center (x, y).
function roundedRectCoverage(x, y, size, r) {
	// distance "outside" the rounded rect; <=0 inside, smooth 1px edge
	const inset = 0.5;
	const minX = inset;
	const minY = inset;
	const maxX = size - inset;
	const maxY = size - inset;
	const cxMin = minX + r;
	const cxMax = maxX - r;
	const cyMin = minY + r;
	const cyMax = maxY - r;
	let dx = 0;
	let dy = 0;
	if (x < cxMin) dx = cxMin - x;
	else if (x > cxMax) dx = x - cxMax;
	if (y < cyMin) dy = cyMin - y;
	else if (y > cyMax) dy = y - cyMax;
	const cornerDist = Math.sqrt(dx * dx + dy * dy) - r;
	// inside flat edges
	const edgeDist = Math.max(minX - x, x - maxX, minY - y, y - maxY);
	const d = dx > 0 && dy > 0 ? cornerDist : edgeDist;
	return clamp01(0.5 - d);
}

function circleCoverage(x, y, cx, cy, r) {
	const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) - r;
	return clamp01(0.5 - d);
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Build RGBA buffer
const px = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
	for (let x = 0; x < SIZE; x++) {
		const rectA = roundedRectCoverage(x + 0.5, y + 0.5, SIZE, RADIUS);
		let r = INDIGO[0];
		let g = INDIGO[1];
		let b = INDIGO[2];
		// overlay white rings (back to front)
		for (const [radius, alpha] of RINGS) {
			const cov = circleCoverage(x + 0.5, y + 0.5, SIZE / 2, SIZE / 2, radius) * alpha;
			r = r + (255 - r) * cov;
			g = g + (255 - g) * cov;
			b = b + (255 - b) * cov;
		}
		const a = Math.round(rectA * 255);
		const i = (y * SIZE + x) * 4;
		px[i] = Math.round(r);
		px[i + 1] = Math.round(g);
		px[i + 2] = Math.round(b);
		px[i + 3] = a;
	}
}

// --- Minimal PNG encoder (truecolor + alpha) ---
function crc32(buf) {
	let c = ~0;
	for (let i = 0; i < buf.length; i++) {
		c ^= buf[i];
		for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
	}
	return ~c >>> 0;
}
function chunk(type, data) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length, 0);
	const typeBuf = Buffer.from(type, "ascii");
	const body = Buffer.concat([typeBuf, data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body), 0);
	return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

// scanlines with filter byte 0
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
for (let y = 0; y < SIZE; y++) {
	const srcStart = y * SIZE * 4;
	const dstStart = y * (SIZE * 4 + 1);
	raw[dstStart] = 0;
	px.copy(raw, dstStart + 1, srcStart, srcStart + SIZE * 4);
}
const idat = deflateSync(raw, { level: 9 });

const png = Buffer.concat([
	Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
	chunk("IHDR", ihdr),
	chunk("IDAT", idat),
	chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync(new URL("../zensloom-icon-source.png", import.meta.url), png);
console.log(`Wrote zensloom-icon-source.png (${png.length} bytes, ${SIZE}x${SIZE})`);
