// @ts-nocheck
import React from 'react';

import { savePalette, loadPalettes } from "./utils/storage";

import useHaloTrail from "./useHaloTrail";

/**
 * Palette Muse – Liquid Glass UI Prototype
 * Single-file React component with TailwindCSS classes
 * Features
 * - Generate harmonious color palettes (AI-like best match scoring)
 * - Copy HEX & approximate Pantone labels
 * - Save colors & palette groups
 * - "Projects" with phases to pin palettes across workflow steps
 * - Liquid Glass aesthetic with an interactive "ink on water" canvas
 * - LocalStorage persistence
 *
 * Notes
 * - Pantone is proprietary; we use a small demo dictionary of common swatches and compute
 *   an approximate closest match (DeltaE-like in RGB). Marked as "≈".
 * - Designed to be elegant on a blanc-ocre page background.
 */

// ---------- Utilities ----------
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const rand = (min, max) => Math.random() * (max - min) + min;

const hslToRgb = (h, s, l) => {
  // h in [0, 360), s,l in [0,1]
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
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

const rgbToHex = (r,g,b) => "#" + [r,g,b].map(v => v.toString(16).padStart(2, "0")).join("");
const hslToHex = (h,s,l) => {
  const [r,g,b] = hslToRgb(h,s,l);
  return rgbToHex(r,g,b);
};

const hexToRgb = (hex) => {
  const v = hex.replace("#", "");
  const bigint = parseInt(v.length === 3 ? v.split("").map(x=>x+x).join("") : v, 16);
  return [(bigint>>16)&255, (bigint>>8)&255, bigint&255];
};

const contrastRatio = (hex1, hex2) => {
  const lum = (hex) => {
    const [r,g,b] = hexToRgb(hex).map(v => {
      const s = v/255;
      return s <= 0.03928 ? s/12.92 : Math.pow((s + 0.055)/1.055, 2.4);
    });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  };
  const L1 = lum(hex1) + 0.05;
  const L2 = lum(hex2) + 0.05;
  return L1 > L2 ? (L1/L2) : (L2/L1);
};


// ---------- Harmony Generator ----------
const makePalette = (seedHue) => {
  // Generate 8 swatches using analogous + complementary + accents
  const schemes = [
    seedHue,
    (seedHue + 20) % 360,
    (seedHue + 340) % 360,
    (seedHue + 180) % 360,
    (seedHue + 200) % 360,
    (seedHue + 160) % 360,
    (seedHue + 90) % 360,
    (seedHue + 270) % 360,
  ];
  // Vary sat/light for depth
  const swatches = schemes.map((h, i) => {
    const s = 0.5 + 0.4 * Math.sin((i+1)*1.1);
    const l = 0.45 + 0.25 * Math.cos((i+2)*0.9);
    return hslToHex(h, clamp(s), clamp(l));
  });
  return swatches;
};

// Score a palette for readability on blanc-ocre background
const BLANC_OCRE = "#F5EFE3"; // elegant white-ochre
const scorePalette = (palette) => {
  // Favor internal contrast & decent contrast vs background
  let score = 0;
  for (let i=0;i<palette.length;i++) {
    score += contrastRatio(palette[i], BLANC_OCRE);
    for (let j=i+1;j<palette.length;j++) {
      score += 0.3 * contrastRatio(palette[i], palette[j]);
    }
  }
  return score;
};

const aiBestMatch = () => {
  // Sample multiple seeds and pick the highest scoring palette
  let best = null, bestScore = -Infinity, bestHue = 0;
  for (let k=0;k<16;k++) {
    const hue = Math.floor(rand(0, 360));
    const p = makePalette(hue);
    const s = scorePalette(p);
    if (s > bestScore) { bestScore = s; best = p; bestHue = hue; }
  }
  return { palette: best, seedHue: bestHue, score: bestScore };
};

const PHASES = ["exploration","direction","refinement","production","handoff"];

// ---------- Storage ----------
const store = {
  get: (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ---------- Small UI primitives ----------
const Icon = ({ name, className = "w-4 h-4" }) => {
  const paths = {
    copy: "M16 8H8a2 2 0 00-2 2v8m2-12V6a2 2 0 012-2h8m-6 12h6m-6-4h6",
    save: "M5 5h8l4 4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zm3 12h6M7 5v4h6",
    shuffle: "M4 4l6 6-6 6M14 4h6M14 20h6",
    plus: "M12 5v14m-7-7h14",
    trash: "M6 7h12M9 7v10m6-10v10M7 7l1-3h8l1 3M8 20h8a2 2 0 002-2V7H6v11a2 2 0 002 2z",
    arrowRight: "M5 12h14M13 5l7 7-7 7",
    download: "M12 3v12m0 0l-4-4m4 4l4-4M5 21h14",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[name] || paths.plus} />
    </svg>
  );
};

const GlassCard = ({children, className=""}) => (
  <div
    className={
      "rounded-3xl p-4 shadow-2xl border border-white/30 " +
      "bg-white/20 backdrop-blur-xl " +
      "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.4),0_30px_60px_-15px_rgba(0,0,0,0.25)] " +
      className
    }
    style={{
      // subtle reflective overlay using CSS gradients
      backgroundImage:
        "linear-gradient( to bottom right, rgba(255,255,255,0.35), rgba(255,255,255,0.1) ), " +
        "radial-gradient( 1200px_400px_at_-10%_-20%, rgba(255,255,255,0.35), transparent )",
    }}
  >
    {children}
  </div>
);

// ---------- Liquid Canvas (ink on water) ----------
  function LiquidCanvas({ activePalette, onInk }) {
    const canvasRef = useHaloTrail(null, activePalette, onInk);
    return (
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full [touch-action:manipulation]" />
    );
  }

function ProjectBoard({ projects, activeProjectIdx, setActiveProjectIdx, pinPaletteToPhase, exportProjects, importProjects }) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1F2A2E]">Projets</h3>
        <div className="flex items-center gap-2">
          <button onClick={exportProjects} className="px-2 py-1 rounded-xl bg-white/40 hover:bg-white/60 border text-sm"><Icon name="download"/> Export</button>
          <button onClick={importProjects} className="px-2 py-1 rounded-xl bg-white/40 hover:bg-white/60 border text-sm">Import</button>
        </div>
      </div>
      {projects.length===0 ? (
        <p className="text-sm text-[#47555A] opacity-80">Créez un projet et épinglez des palettes par phase.</p>
      ) : (
        <div className="space-y-4">
          <select value={activeProjectIdx} onChange={e=>setActiveProjectIdx(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white/60 border border-white/40">
            <option value={-1}>— Sélectionner un projet —</option>
            {projects.map((p,i)=>(<option key={i} value={i}>{p.name}</option>))}
          </select>
          {activeProjectIdx>=0 && (
            <div className="space-y-3 max-h-80 overflow-auto pr-1">
              {PHASES.map(phase => {
                const lists = projects[activeProjectIdx].phases[phase];
                return (
                  <div key={phase} className="rounded-2xl overflow-hidden border border-white/40">
                    <div className="flex items-center justify-between px-3 py-2 bg-white/55 font-medium capitalize">
                      <span>{phase}</span>
                      <button onClick={()=>pinPaletteToPhase(phase)} className="text-xs px-2 py-1 rounded-lg bg-white/60 border">Épingler</button>
                    </div>
                    {lists.length===0 ? (
                      <div className="px-3 py-3 text-sm text-[#47555A] opacity-80">Aucune palette épinglée.</div>
                    ) : (
                      <div className="space-y-2 p-3">
                        {lists.map((cols, pi)=> (
                          <div key={pi} className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/40">
                            {cols.map((c,ci)=>(<div key={ci} style={{background:c}} className="h-8"/>))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

// ---------- Main App ----------
export default function App() {
  return (
    <div className="p-6 text-[#364247]">
      Cette page est remplacée par le router. Utilisez la navigation.
    </div>
  );
}
