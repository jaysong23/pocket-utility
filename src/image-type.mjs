// Inspect bytes first: downloaded images can have missing or incorrect extensions.
export async function detectImageType(file) {
  const b = new Uint8Array(await file.slice(0, 256).arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...b.slice(start, end));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i) => b[i] === v)) return 'png';
  if (ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP') return 'webp';
  if (ascii(4,8) === 'ftyp') {
    const end = Math.min(new DataView(b.buffer).getUint32(0), b.length);
    for (let i = 8; i + 4 <= end; i += 4) {
      if (i !== 12 && /^(heic|heix|hevc|hevx|heim|heis|hevm|hevs)$/.test(ascii(i,i+4))) return 'heic';
    }
  }
  return '';
}
export const imageMime = type => ({jpg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic'})[type];
