import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HarmonyType, copyMultiFormat, formatAs, generateHarmony, hasEyeDropper, pickWithEyeDropper, simulateColorBlindHex, contrastRatio } from '../utils/color';
import { loadHistory, pushHistory, loadFavorites, toggleFavorite, setFavoriteTags, FavoriteColor } from '../utils/storage';

interface AdvancedColorPickerProps {
  value?: string;
  onChange?: (hex: string) => void;
  onAdd?: (hex: string) => void;
}

const HARMONIES: { key: HarmonyType; label: string }[] = [
  { key: 'complementary', label: 'Complémentaire' },
  { key: 'analogous', label: 'Analogues' },
  { key: 'triadic', label: 'Triadique' },
  { key: 'tetradic', label: 'Tétradique' },
  { key: 'monochrome', label: 'Monochrome' },
];

const CVD_OPTIONS = [
  { key: 'none', label: 'Normal' },
  { key: 'protanopia', label: 'Protanopie' },
  { key: 'deuteranopia', label: 'Deutéranopie' },
  { key: 'tritanopia', label: 'Tritanopie' },
] as const;

type CvdKey = typeof CVD_OPTIONS[number]['key'];

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({ value = '#4F8A8B', onChange, onAdd }) => {
  const [hex, setHex] = useState<string>(value);
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [favorites, setFavorites] = useState<FavoriteColor[]>(() => loadFavorites());
  const [harmony, setHarmony] = useState<HarmonyType>('analogous');
  const [cvd, setCvd] = useState<CvdKey>('none');

  useEffect(() => setHex(value), [value]);
  useEffect(() => { onChange && onChange(hex); setHistory(pushHistory(hex)); }, [hex]);

  const harmonies = useMemo(() => generateHarmony(hex, harmony), [hex, harmony]);
  const cvdPreview = useMemo(() => simulateColorBlindHex(hex, cvd as any), [hex, cvd]);
  const contrastOnWhite = useMemo(() => contrastRatio(hex, '#FFFFFF'), [hex]);
  const contrastOnBlack = useMemo(() => contrastRatio(hex, '#000000'), [hex]);

  const isFav = favorites.some(f => f.hex.toLowerCase() === hex.toLowerCase());

  const handleToggleFav = () => {
    const list = toggleFavorite(hex);
    setFavorites(list);
  };

  const handleSetTags = () => {
    const prev = favorites.find(f => f.hex.toLowerCase() === hex.toLowerCase());
    const input = prompt('Tags (séparés par des virgules):', prev ? prev.tags.join(', ') : '');
    if (input === null) return;
    const tags = input.split(',').map(t => t.trim()).filter(Boolean);
    setFavorites(setFavoriteTags(hex, tags));
  };

  const tryPick = async () => {
    if (!hasEyeDropper()) return;
    const picked = await pickWithEyeDropper();
    if (picked) setHex(picked);
  };

  const copyFmt = async (fmt: 'hex' | 'rgb' | 'hsl' | 'cssVar' | 'json') => { await copyMultiFormat(hex, fmt); };

  return (
    <div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl border border-white/60 shadow" style={{ background: hex }} />
          <div className="text-sm text-[#1F2A2E]"><span className="font-medium">Couleur</span> {hex.toUpperCase()}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleFav} className={`px-2 py-1 text-sm rounded-lg border ${isFav ? 'bg-white/80' : 'bg-white/50 hover:bg-white/70'}`}>{isFav ? '★ Favori' : '☆ Favori'}</button>
          <button onClick={handleSetTags} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Tags</button>
          <button onClick={() => onAdd && onAdd(hex)} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Ajouter à la palette</button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
          <div className="text-sm font-medium text-[#1F2A2E] mb-2">Sélecteur (roue)</div>
          <Wheel value={hex} onChange={setHex} />
          <div className="mt-2 flex items-center gap-2">
            <input value={hex} onChange={e => setHex(e.target.value)} className="px-2 py-1 rounded-lg bg-white/70 border text-sm font-mono" />
            <button onClick={() => copyFmt('hex')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">HEX</button>
            <button onClick={() => copyFmt('rgb')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">RGB</button>
            <button onClick={() => copyFmt('hsl')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">HSL</button>
            <button onClick={() => copyFmt('cssVar')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">CSS</button>
            <button onClick={() => copyFmt('json')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">JSON</button>
          </div>
          <div className="mt-2">
            <button onClick={tryPick} disabled={!hasEyeDropper()} className="px-2 py-1 text-sm rounded-lg border disabled:opacity-50 bg-white/50 hover:bg-white/70">Pipette</button>
          </div>
        </div>

        <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
          <div className="text-sm font-medium text-[#1F2A2E] mb-2">Harmonies</div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {HARMONIES.map(h => (
              <button key={h.key} onClick={() => setHarmony(h.key)} className={`px-2 py-1 text-sm rounded-lg border ${harmony===h.key?'bg-white/80':'bg-white/50 hover:bg-white/70'}`}>{h.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {harmonies.map((c, i) => (
              <div key={i} className="h-8 rounded-lg border border-white/60 cursor-pointer" style={{ background: c }} onClick={() => setHex(c)} title={c} />
            ))}
          </div>
          <div className="mt-3 text-xs text-[#47555A]">
            Contraste sur blanc: {contrastOnWhite.toFixed(2)} · Contraste sur noir: {contrastOnBlack.toFixed(2)}
          </div>
        </div>

        <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
          <div className="text-sm font-medium text-[#1F2A2E] mb-2">Accessibilité</div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {CVD_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => setCvd(opt.key)} className={`px-2 py-1 text-sm rounded-lg border ${cvd===opt.key?'bg-white/80':'bg-white/50 hover:bg-white/70'}`}>{opt.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-white/60" style={{ background: hex }} title="Original" />
            <div className="w-12 h-12 rounded-xl border border-white/60" style={{ background: cvdPreview }} title="Simulé" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
          <div className="text-sm font-medium text-[#1F2A2E] mb-2">Historique</div>
          {history.length === 0 ? (
            <div className="text-sm text-[#47555A] opacity-80">Aucune couleur récente.</div>
          ) : (
            <div className="grid grid-cols-10 gap-2">
              {history.map((c, i) => (
                <div key={i} className="h-6 rounded-md border border-white/60 cursor-pointer" style={{ background: c }} title={c} onClick={() => setHex(c)} />
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
          <div className="text-sm font-medium text-[#1F2A2E] mb-2">Favoris</div>
          {favorites.length === 0 ? (
            <div className="text-sm text-[#47555A] opacity-80">Aucun favori.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favorites.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg border bg-white/60">
                  <div className="w-5 h-5 rounded border border-white/60" style={{ background: f.hex }} onClick={() => setHex(f.hex)} title={f.hex} />
                  <div className="text-xs text-[#1F2A2E]">{f.hex.toUpperCase()}</div>
                  {f.tags.length>0 && <div className="text-[10px] text-[#47555A]">[{f.tags.join(', ')}]</div>}
                  <button onClick={() => { setFavorites(toggleFavorite(f.hex)); }} className="text-xs px-1 py-0.5 rounded border bg-white/70">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Minimal Photoshop-like wheel + square picker implemented on Canvas
const Wheel: React.FC<{ value: string; onChange: (hex: string) => void }> = ({ value, onChange }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const refSL = useRef<HTMLCanvasElement | null>(null);
  const [h, setH] = useState<number>(200);
  const [s, setS] = useState<number>(0.6);
  const [l, setL] = useState<number>(0.5);

  // derive hsl from incoming value
  useEffect(() => {
    try {
      const tmp = document.createElement('div');
      tmp.style.color = value;
      // parse hex only; keep simple using our functions instead to avoid circular import
    } catch {}
  }, [value]);

  useEffect(() => {
    // Draw wheel canvas
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const size = 160; canvas.width = size; canvas.height = size;
    const image = ctx.createImageData(size, size);
    const cx = size / 2, cy = size / 2, r = size / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        const idx = (y * size + x) * 4;
        if (dist <= r && dist >= r * 0.7) {
          const c = hslToRgbInt(angle, 1, 0.5);
          image.data[idx] = c[0]; image.data[idx+1] = c[1]; image.data[idx+2] = c[2]; image.data[idx+3] = 255;
        } else {
          image.data[idx+3] = 0;
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  }, []);

  useEffect(() => {
    // Draw SL square for current hue
    const canvas = refSL.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = 200, hgt = 160; canvas.width = w; canvas.height = hgt;
    const img = ctx.createImageData(w, hgt);
    for (let y = 0; y < hgt; y++) {
      for (let x = 0; x < w; x++) {
        const S = x / (w - 1);
        const L = 1 - (y / (hgt - 1));
        const c = hslToRgbInt(h, S, L);
        const idx = (y * w + x) * 4;
        img.data[idx] = c[0]; img.data[idx+1] = c[1]; img.data[idx+2] = c[2]; img.data[idx+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [h]);

  useEffect(() => {
    onChange(hslToHex(h, s, l));
  }, [h, s, l]);

  const handleWheel = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2, r = rect.width / 2;
    const dx = x - cx, dy = y - cy; const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < r * 0.7 || dist > r) return;
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    setH(angle);
  };

  const handleSL = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const S = Math.max(0, Math.min(1, x / rect.width));
    const L = Math.max(0, Math.min(1, 1 - (y / rect.height)));
    setS(S); setL(L);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <canvas ref={ref} onMouseDown={handleWheel} onMouseMove={(e)=>{ if (e.buttons===1) handleWheel(e); }} className="rounded-xl border border-white/60 bg-white" style={{ width: 160, height: 160 }} />
        <div className="mt-2 text-xs text-[#47555A]">Teinte</div>
      </div>
      <div className="flex flex-col items-center">
        <canvas ref={refSL} onMouseDown={handleSL} onMouseMove={(e)=>{ if (e.buttons===1) handleSL(e); }} className="rounded-xl border border-white/60 bg-white" style={{ width: 200, height: 160 }} />
        <div className="mt-2 text-xs text-[#47555A]">Saturation / Lumière</div>
      </div>
    </div>
  );
};

function hslToHex(h: number, s: number, l: number): string {
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
  const R = Math.round((r + m) * 255), G = Math.round((g + m) * 255), B = Math.round((b + m) * 255);
  return '#' + [R,G,B].map(v => v.toString(16).padStart(2,'0')).join('');
}

function hslToRgbInt(h: number, s: number, l: number): [number, number, number] {
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
  const R = Math.round((r + m) * 255), G = Math.round((g + m) * 255), B = Math.round((b + m) * 255);
  return [R, G, B];
}

export default AdvancedColorPicker;

