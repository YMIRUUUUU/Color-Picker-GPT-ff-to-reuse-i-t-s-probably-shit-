import React, { useState, useMemo, useCallback } from 'react';
import { mixColors } from '../utils/color';

interface Props {
  initial?: string[];
}

export default function MixLab({ initial = [] }: Props) {
  const [pool, setPool] = useState<string[]>(initial.length ? initial : ['#FF6A13', '#005EB8', '#78BE20', '#F4ED7C']);
  const [bucket, setBucket] = useState<string[]>([]);

  const result = useMemo(() => mixColors(bucket.length ? bucket : ['#FFFFFF']), [bucket]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const hex = e.dataTransfer.getData('text/plain');
    if (!hex) return;
    setBucket(b => [...b, hex]);
  }, []);

  const onDragStart = (hex: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', hex);
  };

  const clear = () => setBucket([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <div className="text-sm text-[#1F2A2E] font-medium">Couleurs disponibles</div>
        <div className="grid grid-cols-4 gap-2">
          {pool.map((hex, i) => (
            <div key={i} draggable onDragStart={onDragStart(hex)} className="h-10 rounded-xl border border-white/40 shadow cursor-grab active:cursor-grabbing" style={{ background: hex }} title={hex} />
          ))}
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <div className="text-sm text-[#1F2A2E] font-medium">Mélange</div>
        <div onDrop={onDrop} onDragOver={e=>e.preventDefault()} className="rounded-2xl border-2 border-dashed border-white/60 bg-white/30 min-h-[140px] p-3">
          {bucket.length === 0 ? (
            <div className="text-sm text-[#47555A] opacity-80">Glissez des carrés de couleur ici pour les mélanger.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {bucket.map((hex, i) => (
                <div key={i} className="w-8 h-8 rounded-md border border-white/60" style={{ background: hex }} title={hex} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-10 rounded-xl border border-white/60" style={{ background: result }} />
          <div className="text-sm text-[#364247] font-mono">{result.toUpperCase()}</div>
          <button onClick={clear} className="ml-auto px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40">Réinitialiser</button>
        </div>
      </div>
    </div>
  );
}