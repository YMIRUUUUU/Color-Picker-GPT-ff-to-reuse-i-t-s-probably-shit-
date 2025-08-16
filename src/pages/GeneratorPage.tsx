import React, { useState } from 'react';
import PantoneCard from '../components/PantoneCard';
import ColorWheel from '../components/ColorWheel';
import MixLab from '../components/MixLab';
import { savePalette, loadPalettes } from '../utils/storage';

export default function GeneratorPage() {
  const [palette, setPalette] = useState<string[]>(['#FF6A13', '#005EB8', '#78BE20', '#F4ED7C']);
  const [savedPalettes, setSavedPalettes] = useState<string[][]>(loadPalettes());
  const [savedColors, setSavedColors] = useState<string[]>([]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const handleSavePalette = () => {
    const updated = savePalette(palette);
    setSavedPalettes(updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {palette.map((hex, idx) => (
          <PantoneCard key={idx} hex={hex} onCopy={copy} onSave={(c)=>setSavedColors(prev=>[...prev, c])} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-3xl p-4 shadow-2xl border border-white/30 bg-white/20 backdrop-blur-xl">
          <h3 className="font-semibold text-[#1F2A2E] mb-3">Ajouter une couleur</h3>
          <ColorWheel onPick={(hex)=>setPalette(p=>[hex, ...p].slice(0,8))} />
        </div>
        <div className="lg:col-span-2 rounded-3xl p-4 shadow-2xl border border-white/30 bg-white/20 backdrop-blur-xl">
          <h3 className="font-semibold text-[#1F2A2E] mb-3">MixLab</h3>
          <MixLab initial={palette} />
        </div>
      </div>

      {savedPalettes.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-[#1F2A2E] font-medium">Palettes sauvegardées</div>
          {savedPalettes.map((p,i)=> (
            <button key={i} onClick={()=>setPalette(p)} className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/40">
              {p.map((c,ci)=>(<div key={ci} style={{background:c}} className="h-6"/>))}
            </button>
          ))}
          <div>
            <button onClick={handleSavePalette} className="mt-2 px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40">Enregistrer la palette</button>
          </div>
        </div>
      )}
    </div>
  );
}