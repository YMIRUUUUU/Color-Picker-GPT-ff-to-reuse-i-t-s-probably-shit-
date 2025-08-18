import React, { useMemo, useState } from 'react';
import { contrastRatio } from '../utils/color';

interface ContrastComparatorProps {
  a: string;
  b: string;
}

const ContrastComparator: React.FC<ContrastComparatorProps> = ({ a, b }) => {
  const ratio = useMemo(() => contrastRatio(a, b), [a, b]);
  const passAA = ratio >= 4.5; // normal text
  const passAALarge = ratio >= 3;
  const passAAA = ratio >= 7;
  return (
    <div className="rounded-2xl p-3 border border-white/50 bg-white/40">
      <div className="text-sm font-medium text-[#1F2A2E] mb-2">Comparateur de contrastes</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg border border-white/60 p-3" style={{ background: a, color: b }}>
          <div className="text-xs">Texte sur A</div>
          <div className="font-medium">Exemple</div>
        </div>
        <div className="flex-1 rounded-lg border border-white/60 p-3" style={{ background: b, color: a }}>
          <div className="text-xs">Texte sur B</div>
          <div className="font-medium">Exemple</div>
        </div>
      </div>
      <div className="mt-2 text-sm text-[#1F2A2E]">Ratio: {ratio.toFixed(2)}</div>
      <div className="text-xs text-[#47555A]">AA: {passAA ? 'OK' : '—'} · AA Large: {passAALarge ? 'OK' : '—'} · AAA: {passAAA ? 'OK' : '—'}</div>
    </div>
  );
};

export default ContrastComparator;

