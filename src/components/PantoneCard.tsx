import React from 'react';
import hexToPantone from '../utils/pantoneLookup';

interface Props {
  hex: string;
  onCopy?: (text: string) => void;
  onSave?: (hex: string) => void;
}

export default function PantoneCard({ hex, onCopy, onSave }: Props) {
  const pant = hexToPantone(hex);
  return (
    <div className="group rounded-2xl overflow-hidden border border-white/40 shadow-lg bg-white/40">
      <div className="h-24" style={{ background: hex }} />
      <div className="p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-[#1F2A2E]">
          <span className="font-mono text-sm cursor-pointer" onClick={() => onCopy?.(hex)}>{hex.toUpperCase()}</span>
          <span className="font-mono text-sm" title={pant.hex}>{pant.name}</span>
        </div>
        <div className="flex items-center gap-2 opacity-80 mt-2">
          <button onClick={() => onCopy?.(hex)} className="px-2 py-1 rounded-lg bg-white/60 border">Copier</button>
          <button onClick={() => onSave?.(hex)} className="px-2 py-1 rounded-lg bg-white/60 border">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}