import React, { useMemo, useState } from 'react';

interface ColorWheelProps {
	onAdd: (hex: string) => void;
}

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
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

const rgbToHex = (r: number, g: number, b: number): string => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

const ColorWheel: React.FC<ColorWheelProps> = ({ onAdd }) => {
	const [h, setH] = useState<number>(200);
	const [s, setS] = useState<number>(60);
	const [l, setL] = useState<number>(50);

	const hex = useMemo(() => {
		const [r, g, b] = hslToRgb(h, s / 100, l / 100);
		return rgbToHex(r, g, b);
	}, [h, s, l]);

	return (
		<div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
			<div className="flex items-center gap-3">
				<div className="w-14 h-14 rounded-2xl border border-white/60 shadow" style={{ background: hex }} />
				<div className="text-sm text-[#1F2A2E]"><span className="font-medium">Aperçu</span> {hex.toUpperCase()}</div>
			</div>
			<div className="mt-4 space-y-3">
				<label className="block text-sm">Hue: {h}°
					<input type="range" min={0} max={359} value={h} onChange={e => setH(parseInt(e.target.value))} className="w-full" />
				</label>
				<label className="block text-sm">Saturation: {s}%
					<input type="range" min={0} max={100} value={s} onChange={e => setS(parseInt(e.target.value))} className="w-full" />
				</label>
				<label className="block text-sm">Lumière: {l}%
					<input type="range" min={0} max={100} value={l} onChange={e => setL(parseInt(e.target.value))} className="w-full" />
				</label>
			</div>
			<div className="mt-3">
				<button onClick={() => onAdd(hex)} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Ajouter</button>
			</div>
		</div>
	);
};

export default ColorWheel;