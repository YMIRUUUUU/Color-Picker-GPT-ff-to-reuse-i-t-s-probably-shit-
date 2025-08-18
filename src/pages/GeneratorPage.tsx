import React, { useMemo, useState } from 'react';
import PantoneCard from '../components/PantoneCard';
import AdvancedColorPicker from '../components/AdvancedColorPicker';
import MixLab from '../components/MixLab';
import { loadPalettes, savePalette } from '../utils/storage';
import ContrastComparator from '../components/ContrastComparator';
import ColorCardsBoard from '../components/ColorCardsBoard';
import DynamicPalette from '../components/DynamicPalette';
import CloudSyncPanel from '../components/CloudSyncPanel';

interface GeneratorPageProps {
	palette: string[];
	setPalette: (colors: string[]) => void;
}

const DEFAULTS = ['#4F8A8B','#B9E3C6','#F9F7E8','#FAD9C1','#F76C6C','#A8D0E6','#374785','#24305E'];

const GeneratorPage: React.FC<GeneratorPageProps> = ({ palette, setPalette }) => {
	const [savedPalettes, setSavedPalettes] = useState<string[][]>(() => loadPalettes());

	const addColor = (hex: string) => {
		setPalette([...palette, hex]);
	};

	const copyAll = async () => {
		try { await navigator.clipboard.writeText(palette.join(', ')); } catch {}
	};

	const onSavePalette = () => {
		const updated = savePalette(palette);
		setSavedPalettes(updated);
	};

	const onLoadPalettes = () => setSavedPalettes(loadPalettes());

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-[#1F2A2E]">Générateur</h2>
					<p className="text-sm text-[#47555A] opacity-80">Cartes Pantone/HEX, roue chromatique, et MixLab.</p>
				</div>
				<div className="flex items-center gap-2">
					<button onClick={() => setPalette(DEFAULTS)} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Réinitialiser</button>
					<button onClick={copyAll} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Copier la palette</button>
					<button onClick={onSavePalette} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Enregistrer la palette</button>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				{palette.map((hex, idx) => (
					<PantoneCard key={idx} hex={hex}
						onCopy={() => {}}
						onSave={() => {}}
					/>
				))}
			</div>

			<AdvancedColorPicker onAdd={addColor} onChange={() => {}} />

			<MixLab poolColors={palette} />

			<ContrastComparator a={palette[0] || '#000'} b={palette[1] || '#FFF'} />

			<ColorCardsBoard colors={palette} onPick={(c)=>{}} />

			<DynamicPalette baseHex={palette[0] || '#4F8A8B'} onAdd={addColor} />

			<CloudSyncPanel />

			<div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-semibold text-[#1F2A2E]">Palettes enregistrées</h3>
					<div className="flex items-center gap-2">
						<button onClick={onLoadPalettes} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Recharger</button>
						<button onClick={() => { localStorage.removeItem('pm_palettes'); setSavedPalettes([]); }} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Vider</button>
					</div>
				</div>
				{savedPalettes.length === 0 ? (
					<p className="text-sm text-[#47555A] opacity-80">Aucune palette encore sauvegardée.</p>
				) : (
					<div className="space-y-2">
						{savedPalettes.map((p, i) => (
							<div key={i} className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/40">
								{p.map((c, j) => (<div key={j} className="h-8" style={{ background: c }} />))}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default GeneratorPage;