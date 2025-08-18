import React from 'react';
import { generateDynamicPalette } from '../utils/color';

interface DynamicPaletteProps {
  baseHex: string;
  onAdd?: (hex: string) => void;
}

const DynamicPalette: React.FC<DynamicPaletteProps> = ({ baseHex, onAdd }) => {
  const scales = generateDynamicPalette(baseHex);
  return (
    <div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-[#1F2A2E]">Palette dynamique</h3>
        <div className="text-xs text-[#47555A]">Base {baseHex.toUpperCase()}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
          <div className="text-sm font-medium text-[#1F2A2E] mb-2">Clair</div>
          <div className="grid grid-cols-5 gap-2">
            {scales.light.map((c, i) => (
              <button key={i} onClick={() => onAdd && onAdd(c)} className="h-8 rounded-md border border-white/60" style={{ background: c }} title={c} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
          <div className="text-sm font-medium text-[#1F2A2E] mb-2">Sombre</div>
          <div className="grid grid-cols-5 gap-2">
            {scales.dark.map((c, i) => (
              <button key={i} onClick={() => onAdd && onAdd(c)} className="h-8 rounded-md border border-white/60" style={{ background: c }} title={c} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPalette;

