// Color utilities: conversions, harmonies, contrast, color-blind simulation, formats

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

export const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

export const hexToRgb = (hex: string): Rgb => {
  const v = hex.replace('#', '').trim();
  const n = parseInt(v.length === 3 ? v.split('').map(x => x + x).join('') : v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

export const rgbToHex = (r: number, g: number, b: number): string =>
  '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

export const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - C / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) [r, g, b] = [C, X, 0];
  else if (60 <= h && h < 120) [r, g, b] = [X, C, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, C, X];
  else if (180 <= h && h < 240) [r, g, b] = [0, X, C];
  else if (240 <= h && h < 300) [r, g, b] = [X, 0, C];
  else [r, g, b] = [C, 0, X];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
};

export const rgbToHsl = (r: number, g: number, b: number): Hsl => {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d === 0) h = 0;
  else if (max === R) h = 60 * (((G - B) / d) % 6);
  else if (max === G) h = 60 * (((B - R) / d) + 2);
  else h = 60 * (((R - G) / d) + 4);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
};

export const hexToHsl = (hex: string): Hsl => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
};

export const hslToHex = (h: number, s: number, l: number): string => {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

export const formatAs = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const toCssVar = (name = '--color'): string => `${name}: ${hex.toUpperCase()};`;
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
    cssVar: toCssVar(),
    json: JSON.stringify({ hex: hex.toUpperCase(), rgb: { r, g, b }, hsl: { h, s, l } }, null, 2),
  };
};

export const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = chan(r), G = chan(g), B = chan(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

export const contrastRatio = (hex1: string, hex2: string): number => {
  const L1 = relativeLuminance(hex1) + 0.05;
  const L2 = relativeLuminance(hex2) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
};

// Harmonies from a base color (HSL space)
export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochrome';

const wrapHue = (h: number): number => ((h % 360) + 360) % 360;

export const generateHarmony = (hex: string, type: HarmonyType): string[] => {
  const { h, s, l } = hexToHsl(hex);
  switch (type) {
    case 'complementary':
      return [hex, hslToHex(wrapHue(h + 180), s, l)];
    case 'analogous':
      return [hslToHex(wrapHue(h - 30), s, l), hex, hslToHex(wrapHue(h + 30), s, l)];
    case 'triadic':
      return [hex, hslToHex(wrapHue(h + 120), s, l), hslToHex(wrapHue(h + 240), s, l)];
    case 'tetradic':
      return [hex, hslToHex(wrapHue(h + 90), s, l), hslToHex(wrapHue(h + 180), s, l), hslToHex(wrapHue(h + 270), s, l)];
    case 'monochrome':
      return [
        hslToHex(h, s, clamp01(l * 0.25)),
        hslToHex(h, s, clamp01(l * 0.5)),
        hslToHex(h, s, clamp01(l)),
        hslToHex(h, s, clamp01(l * 1.2)),
        hslToHex(h, s, clamp01(l * 1.4)),
      ];
    default:
      return [hex];
  }
};

// Dynamic palette: light/dark scales
export const generateDynamicPalette = (baseHex: string): { light: string[]; dark: string[] } => {
  const { h, s, l } = hexToHsl(baseHex);
  const light = [0.97, 0.9, 0.8, 0.7, 0.6].map(L => hslToHex(h, clamp01(s * 0.9), clamp01(L)));
  const dark = [0.5, 0.4, 0.3, 0.2, 0.12].map(L => hslToHex(h, clamp01(Math.min(1, s * 1.05)), clamp01(L)));
  return { light, dark };
};

// Color-blind simulation matrices (approximation, Brettel/Viénot-inspired)
// Each returns simulated RGB in [0..255]
type CvdMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

const applyMatrix = (rgb: Rgb, m: number[][]): Rgb => {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const R = m[0][0] * r + m[0][1] * g + m[0][2] * b;
  const G = m[1][0] * r + m[1][1] * g + m[1][2] * b;
  const B = m[2][0] * r + m[2][1] * g + m[2][2] * b;
  return { r: Math.round(clamp01(R) * 255), g: Math.round(clamp01(G) * 255), b: Math.round(clamp01(B) * 255) };
};

const MATRICES: Record<Exclude<CvdMode, 'none'>, number[][]> = {
  protanopia: [
    [0.56667, 0.43333, 0.0],
    [0.55833, 0.44167, 0.0],
    [0.0, 0.24167, 0.75833],
  ],
  deuteranopia: [
    [0.625, 0.375, 0.0],
    [0.70, 0.30, 0.0],
    [0.0, 0.30, 0.70],
  ],
  tritanopia: [
    [0.95, 0.05, 0.0],
    [0.0, 0.43333, 0.56667],
    [0.0, 0.475, 0.525],
  ],
};

export const simulateColorBlindHex = (hex: string, mode: CvdMode): string => {
  if (mode === 'none') return hex;
  const rgb = hexToRgb(hex);
  const m = MATRICES[mode];
  const out = applyMatrix(rgb, m);
  return rgbToHex(out.r, out.g, out.b);
};

export const copyMultiFormat = async (hex: string, format: keyof ReturnType<typeof formatAs> = 'hex') => {
  const f = formatAs(hex);
  const text = f[format as keyof typeof f] as string;
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
};

export const hasEyeDropper = (): boolean => typeof (window as any).EyeDropper !== 'undefined';

export const pickWithEyeDropper = async (): Promise<string | null> => {
  try {
    const EyeDropperCtor = (window as any).EyeDropper;
    if (!EyeDropperCtor) return null;
    const ed = new EyeDropperCtor();
    const res = await ed.open();
    return (res && res.sRGBHex) ? res.sRGBHex : null;
  } catch {
    return null;
  }
};

