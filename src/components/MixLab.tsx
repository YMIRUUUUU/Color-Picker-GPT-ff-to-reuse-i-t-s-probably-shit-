import React, { useMemo, useState } from 'react';
import PaintCanvas from './PaintCanvas';

interface MixLabProps {
	poolColors: string[];
}

const hexToRgb = (hex: string): [number, number, number] => {
	const v = hex.replace('#', '');
	const n = parseInt(v.length === 3 ? v.split('').map(x=>x+x).join('') : v, 16);
	return [(n>>16)&255, (n>>8)&255, n&255];
};

const rgbToHex = (r: number, g: number, b: number): string => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

const MixLab: React.FC<MixLabProps> = ({ poolColors }) => {
	const [dropped, setDropped] = useState<string[]>([]);
	const [mode, setMode] = useState<'drag' | 'paint'>('drag');
	const [brushColor, setBrushColor] = useState<string>('#000000');
	const [diffusion, setDiffusion] = useState<number>(0.15);
	const [radius, setRadius] = useState<number>(10);
	const [paintAvg, setPaintAvg] = useState<string>('#CCCCCC');

	const mixed = useMemo(() => {
		if (mode === 'paint') return paintAvg;
		if (dropped.length === 0) return '#CCCCCC';
		const totals = dropped.map(hexToRgb).reduce((acc, [r,g,b]) => [acc[0]+r, acc[1]+g, acc[2]+b], [0,0,0] as [number,number,number]);
		const avg: [number, number, number] = [
			Math.round(totals[0] / dropped.length),
			Math.round(totals[1] / dropped.length),
			Math.round(totals[2] / dropped.length),
		];
		return rgbToHex(avg[0], avg[1], avg[2]);
	}, [dropped, mode, paintAvg]);

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const color = e.dataTransfer.getData('text/plain');
		if (!color) return;
		setDropped(prev => [...prev, color]);
	};

	return (
		<div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-[#1F2A2E]">MixLab</h3>
				<div className="flex items-center gap-2">
					<button onClick={() => setMode('drag')} className={`px-2 py-1 text-sm rounded-lg border ${mode==='drag' ? 'bg-white/80' : 'bg-white/50 hover:bg-white/70'}`}>Drag</button>
					<button onClick={() => setMode('paint')} className={`px-2 py-1 text-sm rounded-lg border ${mode==='paint' ? 'bg-white/80' : 'bg-white/50 hover:bg-white/70'}`}>Peinture</button>
					<button onClick={() => { setDropped([]); setPaintAvg('#CCCCCC'); }} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Réinitialiser</button>
				</div>
			</div>
			<div className="mt-3">
				{mode === 'drag' ? (
					<>
						<div className="text-sm text-[#47555A] opacity-80">Faites glisser des couleurs dans la zone pour les mélanger.</div>
						<div className="mt-3 grid grid-cols-8 gap-2">
							{poolColors.map((c, i) => (
								<div key={i}
									className="h-10 rounded-lg border border-white/60 cursor-grab"
									style={{ background: c }}
									draggable
									onDragStart={(e) => e.dataTransfer.setData('text/plain', c)}
								/>
							))}
						</div>
						<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
							<div className="rounded-2xl p-3 border border-white/50 bg-white/40">
								<div className="text-sm font-medium text-[#1F2A2E] mb-2">Drop zone</div>
								<div onDragOver={(e)=>e.preventDefault()} onDrop={onDrop} className="min-h-[120px] rounded-xl border border-dashed border-[#8aa] bg-white/60 flex flex-wrap gap-2 p-2">
									{dropped.map((c, i) => (
										<div key={i} className="w-8 h-8 rounded-md border border-white/60" style={{ background: c }} />
									))}
								</div>
							</div>
							<div className="rounded-2xl p-3 border border-white/50 bg-white/40">
								<div className="text-sm font-medium text-[#1F2A2E] mb-2">Résultat mixé</div>
								<div className="flex items-center gap-3">
									<div className="w-14 h-14 rounded-xl border border-white/60" style={{ background: mixed }} />
									<div className="text-sm text-[#1F2A2E]">{mixed.toUpperCase()}</div>
								</div>
							</div>
						</div>
					</>
				) : (
					<div className="grid grid-cols-1 gap-3">
						<div className="rounded-2xl p-3 border border-white/50 bg-white/40">
							<div className="text-sm font-medium text-[#1F2A2E] mb-2">Pinceau</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<label className="text-sm">Couleur
									<select value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-full px-2 py-2 rounded-lg bg-white/70 border">
										{poolColors.map((c,i)=>(<option key={i} value={c}>{c.toUpperCase()}</option>))}
									</select>
								</label>
								<label className="text-sm">Diffusion: {(diffusion*100)|0}%
									<input type="range" min={0} max={100} value={Math.round(diffusion*100)} onChange={e=>setDiffusion(parseInt(e.target.value)/100)} className="w-full" />
								</label>
								<label className="text-sm">Taille: {radius}
									<input type="range" min={3} max={30} value={radius} onChange={e=>setRadius(parseInt(e.target.value))} className="w-full" />
								</label>
							</div>
						</div>
						<div className="rounded-2xl p-3 border border-white/50 bg-white/40">
							<div className="text-sm font-medium text-[#1F2A2E] mb-2">Peindre et mélanger</div>
							<PaintCanvas brushColor={brushColor} diffusion={diffusion} brushRadius={radius} onMixedUpdate={setPaintAvg} />
							<div className="mt-3 flex items-center gap-3">
								<div className="w-14 h-14 rounded-xl border border-white/60" style={{ background: mixed }} />
								<div className="text-sm text-[#1F2A2E]">{mixed.toUpperCase()}</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default MixLab;