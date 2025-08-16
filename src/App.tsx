// @ts-nocheck
// NOTE: This legacy single-file App is kept for reference but is no longer mounted.
// The new entrypoint is `src/AppRouter.tsx` with routed pages.
import React, { useEffect, useMemo, useRef, useState } from "react";
import hexToPantone from "./utils/pantoneLookup";

import { savePalette, loadPalettes } from "./utils/storage";

// import useHaloTrail from "./useHaloTrail";

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
  const [seedHue, setSeedHue] = useState(() => store.get("pm_seedHue", Math.floor(rand(0,360))));
  const [palette, setPalette] = useState(() => store.get("pm_palette", makePalette(seedHue)));
  const [savedColors, setSavedColors] = useState(() => store.get("pm_savedColors", []));
  const [groups, setGroups] = useState(() => store.get("pm_groups", [])); // [{name, colors:[] }]
  const [savedPalettes, setSavedPalettes] = useState(() => loadPalettes());
  const [projects, setProjects] = useState(() => {
    const raw = store.get("pm_projects", []);
    return raw.map(p => ({
      name: p.name,
      phases: Object.fromEntries(
        PHASES.map(ph => [ph, p.phases?.[ph] || p.phases?.[ph.charAt(0).toUpperCase()+ph.slice(1)] || []])
      ),
    }));
  }); // [{name, phases:{exploration:[], direction:[], refinement:[], production:[], handoff:[]}}]
  const [activeProjectIdx, setActiveProjectIdx] = useState(() => store.get("pm_activeProjectIdx", -1));

  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => { store.set("pm_seedHue", seedHue); }, [seedHue]);
  useEffect(() => { store.set("pm_palette", palette); }, [palette]);
  useEffect(() => { store.set("pm_savedColors", savedColors); }, [savedColors]);
  useEffect(() => { store.set("pm_groups", groups); }, [groups]);
  useEffect(() => { store.set("pm_projects", projects); }, [projects]);
  useEffect(() => { store.set("pm_activeProjectIdx", activeProjectIdx); }, [activeProjectIdx]);

  const regenerate = (h = Math.floor(rand(0,360))) => {
    setSeedHue(h);
    setPalette(makePalette(h));
  };

  const randomBest = () => {
    const { palette: p, seedHue: h } = aiBestMatch();
    setSeedHue(h); setPalette(p);
  };

  const handleSavePalette = () => {
    const updated = savePalette(palette);
    setSavedPalettes(updated);
  };

  const handleLoadPalettes = () => {
    setSavedPalettes(loadPalettes());
  };

  const copy = async (text, idx = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (idx !== null) {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1000);
      }
      toast(`Copié: ${text}`);
    } catch {
      toast("Impossible de copier");
    }
  };

  const toastRef = useRef(null);
  const toast = (msg) => {
    if (!toastRef.current) return;
    toastRef.current.textContent = msg;
    toastRef.current.style.opacity = 1;
    clearTimeout(toastRef.current._t);
    toastRef.current._t = setTimeout(() => (toastRef.current.style.opacity = 0), 1400);
  };

  // Project helpers
  const createProject = (name) => ({
    name,
    phases: Object.fromEntries(PHASES.map(p => [p, []])),
  });

  const addProject = () => {
    const name = prompt("Nom du projet ?");
    if (!name) return;
    const next = [...projects, createProject(name)];
    setProjects(next);
    setActiveProjectIdx(next.length-1);
  };

  const pinPaletteToPhase = (phase) => {
    if (activeProjectIdx < 0) { toast("Créez d'abord un projet"); return; }
    const next = [...projects];
    next[activeProjectIdx].phases[phase].push([...palette]);
    setProjects(next);
    toast(`Palette épinglée → ${phase.charAt(0).toUpperCase()+phase.slice(1)}`);
  };

  const exportProjects = () => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "palette-muse-projects.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importProjects = async () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/json";
    inp.onchange = async () => {
      const file = inp.files?.[0];
      if (!file) return;
      const text = await file.text();
        try {
          const data = JSON.parse(text);
          const parsed = Array.isArray(data) ? data : projects;
          setProjects(parsed.map(p => ({
            name: p.name,
            phases: Object.fromEntries(
              PHASES.map(ph => [ph, p.phases?.[ph] || p.phases?.[ph.charAt(0).toUpperCase()+ph.slice(1)] || []])
            ),
          })));
          toast("Projets importés");
        } catch { toast("Fichier invalide"); }
      };
      inp.click();
    };


  return (
    <div className="relative min-h-[100vh] w-full overflow-hidden" style={{ background: BLANC_OCRE }}>

      {/* subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_20%_-10%,rgba(255,255,255,0.6),transparent),radial-gradient(800px_400px_at_100%_20%,rgba(255,255,255,0.25),transparent)]" />

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/50 backdrop-blur-md border border-white/30 shadow-md" style={{boxShadow: "0 8px 30px rgba(0,0,0,0.12)"}} />
            <div className="leading-tight">
              <h1 className="text-2xl font-semibold text-[#1F2A2E]">Palette Muse</h1>
              <p className="text-sm text-[#47555A] opacity-80">Liquid Glass • Blanc Ocre • Palettes intelligentes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => regenerate(Math.floor(rand(0,360)))} className="px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 backdrop-blur-md shadow"> 
              <span className="inline-flex items-center gap-2"><Icon name="shuffle"/> Shuffle</span>
            </button>
            <button onClick={randomBest} className="px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 backdrop-blur-md shadow">
              <span className="inline-flex items-center gap-2"><Icon name="arrowRight"/> Meilleur match</span>
            </button>
            <button onClick={addProject} className="px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 backdrop-blur-md shadow">
              <span className="inline-flex items-center gap-2"><Icon name="plus"/> Nouveau projet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Generator */}
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#1F2A2E]">Générateur de palettes</h2>
                <p className="text-sm text-[#47555A] opacity-80">Glissez votre curseur sur la page: l'encre colore le verre. Le blanc ocre révèle sa boîte de teintes.</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={359} value={seedHue} onChange={e=>regenerate(parseInt(e.target.value))} className="w-40"/>
                <div className="text-xs text-[#47555A]">Hue: {seedHue}°</div>
              </div>
            </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {palette.map((hex, idx) => {
                  const pant = hexToPantone(hex);
                  return (
                    <div key={idx} className="group relative">
                      <div className="rounded-2xl overflow-hidden border border-white/40 shadow-lg">
                        <div className="h-24 cursor-pointer" style={{ background: hex }} onClick={() => copy(hex, idx)} />
                        <div className="p-3 bg-white/50 backdrop-blur-md">
                          <div className="flex items-center justify-between text-[#1F2A2E]">
                            <span className="font-mono text-sm cursor-pointer" onClick={() => copy(hex, idx)}>{hex.toUpperCase()}</span>
                            <span className="font-mono text-sm" title={pant.hex}>{pant.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 mt-1">
                            <button onClick={() => copy(hex, idx)} title="Copier HEX" className="p-1 rounded-lg hover:bg-white/60"><Icon name="copy"/></button>
                            <button onClick={() => setSavedColors(prev=>[...prev, hex])} title="Enregistrer" className="p-1 rounded-lg hover:bg-white/60"><Icon name="save"/></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>



            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={handleSavePalette} className="px-2 py-1 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 text-sm"><Icon name="save"/> Enregistrer la palette</button>
              <button onClick={handleLoadPalettes} className="px-2 py-1 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 text-sm">Charger palettes sauvegardées</button>
            </div>

            {savedPalettes.length > 0 && (
              <div className="mt-3 space-y-2 max-h-32 overflow-auto pr-1">
                {savedPalettes.map((p,i)=>(
                  <button key={i} onClick={()=>setPalette(p)} className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/40">
                    {p.map((c,ci)=>(<div key={ci} style={{background:c}} className="h-6"/>))}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {PHASES.map(ph => (
                <button key={ph} onClick={()=>pinPaletteToPhase(ph)} className="px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 backdrop-blur-md shadow text-sm">Épingler → {ph.charAt(0).toUpperCase()+ph.slice(1)}</button>
              ))}
            </div>

          </GlassCard>

          {/* Right: Library & Projects */}
          <div className="space-y-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1F2A2E]">Couleurs enregistrées</h3>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setSavedColors([])} className="px-2 py-1 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 text-sm"><Icon name="trash"/> Vider</button>
                </div>
              </div>
              {savedColors.length === 0 ? (
                <p className="text-sm text-[#47555A] opacity-80">Aucune couleur sauvegardée pour l'instant.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {savedColors.map((c,i)=> (
                    <button key={i} onClick={()=>copy(c)} className="rounded-xl overflow-hidden border border-white/40 shadow">
                      <div className="h-10" style={{background:c}}/>
                      <div className="px-2 py-1 bg-white/60 text-[11px] font-mono">{c.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1F2A2E]">Groupes (palettes)</h3>
                <button onClick={()=>setGroups(g=>[...g,{ name: `Groupe ${g.length+1}`, colors:[...palette] }])} className="px-2 py-1 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40 text-sm"><Icon name="save"/> Sauver palette</button>
              </div>
              {groups.length===0 ? (
                <p className="text-sm text-[#47555A] opacity-80">Sauvegardez des ensembles pour les réutiliser.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-auto pr-1">
                  {groups.map((g,gi)=> (
                    <div key={gi} className="rounded-2xl overflow-hidden border border-white/40">
                      <div className="flex items-center justify-between px-3 py-2 bg-white/50">
                        <div className="font-medium">{g.name}</div>
                        <div className="flex items-center gap-2">
                          <button onClick={()=>setPalette(g.colors)} className="text-sm px-2 py-1 rounded-lg bg-white/60 border">Charger</button>
                          <button onClick={()=>setGroups(prev=>prev.filter((_,i)=>i!==gi))} className="text-sm px-2 py-1 rounded-lg bg-white/60 border"><Icon name="trash"/></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-8">
                        {g.colors.map((c,ci)=>(<div key={ci} style={{background:c}} className="h-6"/>))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            <ProjectBoard
              projects={projects}
              activeProjectIdx={activeProjectIdx}
              setActiveProjectIdx={setActiveProjectIdx}
              pinPaletteToPhase={pinPaletteToPhase}
              exportProjects={exportProjects}
              importProjects={importProjects}
            />
          </div>
        </div>
      </div>

      {/* Floating info & toast */}
      <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div ref={toastRef} className="px-4 py-2 rounded-xl bg-black/70 text-white text-sm transition-opacity duration-300 opacity-0 shadow-lg" />
      </div>

    </div>
  );
}
