import pantoneData from './pantone.json';

const hexToRgb = (hex) => {
  const v = hex.replace('#', '');
  const bigint = parseInt(v.length === 3 ? v.split('').map(x => x + x).join('') : v, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const hexToPantone = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  let best = null;
  let dist = Infinity;
  for (const [pHex, name] of Object.entries(pantoneData)) {
    const [pr, pg, pb] = hexToRgb(pHex);
    const d = Math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2);
    if (d < dist) {
      dist = d;
      best = { name: `≈ ${name}`, hex: pHex };
    }
  }
  return best || { name: '—', hex: '#000000' };
};

export default hexToPantone;
