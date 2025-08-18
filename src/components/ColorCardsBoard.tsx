import React from 'react';

interface ColorCardsBoardProps {
  colors: string[];
  onPick?: (hex: string) => void;
}

const ColorCardsBoard: React.FC<ColorCardsBoardProps> = ({ colors, onPick }) => {
  return (
    <div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
      <div className="text-sm font-medium text-[#1F2A2E] mb-2">Cartes de couleurs</div>
      {colors.length === 0 ? (
        <div className="text-sm text-[#47555A] opacity-80">Aucune couleur.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {colors.map((c, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-white/50 bg-white/50">
              <div className="h-20" style={{ background: c }} onClick={() => onPick && onPick(c)} />
              <div className="px-3 py-2 text-sm text-[#1F2A2E]">{c.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorCardsBoard;

