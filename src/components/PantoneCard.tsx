import React from 'react';
import { copyMultiFormat } from '../utils/color';
import { contrastRatio } from '../utils/color';
import hexToPantone from '../utils/pantoneLookup';

interface PantoneCardProps {
	hex: string;
	onCopy?: (hex: string) => void;
	onSave?: (hex: string) => void;
}

const PantoneCard: React.FC<PantoneCardProps> = ({ hex, onCopy, onSave }) => {
	const pantone = hexToPantone(hex);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(hex);
			onCopy && onCopy(hex);
		} catch {}
	};

	const handleSave = () => {
		onSave && onSave(hex);
	};

	return (
		<div className="rounded-2xl p-3 border border-white/40 bg-white/30 backdrop-blur-xl shadow-md">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl border border-white/60" style={{ background: hex }} />
				<div className="flex-1 min-w-0">
					<div className="text-sm font-medium text-[#1F2A2E] truncate">{hex.toUpperCase()}</div>
					<div className="text-xs text-[#47555A] opacity-80 truncate">{pantone.name}</div>
				</div>
			</div>
			<div className="mt-3 flex items-center gap-2 flex-wrap">
				<button onClick={handleCopy} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Copier</button>
				<button onClick={handleSave} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Enregistrer</button>
				<button onClick={() => copyMultiFormat(hex, 'rgb')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">RGB</button>
				<button onClick={() => copyMultiFormat(hex, 'hsl')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">HSL</button>
				<button onClick={() => copyMultiFormat(hex, 'cssVar')} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">CSS</button>
			</div>
			<div className="mt-2 text-[11px] text-[#47555A]">Contraste (sur blanc): {contrastRatio(hex, '#FFFFFF').toFixed(2)} · (sur noir): {contrastRatio(hex, '#000000').toFixed(2)}</div>
		</div>
	);
};

export default PantoneCard;