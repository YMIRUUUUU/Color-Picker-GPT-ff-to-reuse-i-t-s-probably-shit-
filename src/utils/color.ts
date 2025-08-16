export type RGB = { r: number; g: number; b: number };

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function hexToRgb(hex: string): RGB {
  const v = hex.replace('#', '');
  const bigint = parseInt(v.length === 3 ? v.split('').map(x=>x+x).join('') : v, 16);
  return { r: (bigint>>16)&255, g: (bigint>>8)&255, b: bigint&255 };
}

export function mixColors(hexColors: string[]): string {
  if (!hexColors.length) return '#000000';
  let r = 0, g = 0, b = 0;
  for (const h of hexColors) {
    const c = hexToRgb(h);
    r += c.r; g += c.g; b += c.b;
  }
  const n = hexColors.length;
  return rgbToHex(Math.round(r/n), Math.round(g/n), Math.round(b/n));
}