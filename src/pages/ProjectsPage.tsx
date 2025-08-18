import React, { useMemo, useState } from 'react';
import { exportBundle, importBundle } from '../utils/storage';

const PHASES = ['exploration','direction','refinement','production','handoff'] as const;
type PhaseKey = typeof PHASES[number];

type Project = {
	name: string;
	phases: Record<PhaseKey, string[][]>;
};

interface ProjectsPageProps {
	palette: string[];
}

const createProject = (name: string): Project => ({
	name,
	phases: PHASES.reduce((acc, p) => { (acc as any)[p] = []; return acc; }, {} as Record<PhaseKey, string[][]>),
});

const ProjectsPage: React.FC<ProjectsPageProps> = ({ palette }) => {
	const [projects, setProjects] = useState<Project[]>(() => {
		try {
			const raw = localStorage.getItem('pm_projects_v2');
			return raw ? JSON.parse(raw) : [];
		} catch { return []; }
	});
	const [activeIdx, setActiveIdx] = useState<number>(-1);

	const persist = (next: Project[]) => {
		setProjects(next);
		try { localStorage.setItem('pm_projects_v2', JSON.stringify(next)); } catch {}
	};

	const addProject = () => {
		const name = prompt('Nom du projet ?');
		if (!name) return;
		const next = [...projects, createProject(name)];
		persist(next);
		setActiveIdx(next.length - 1);
	};

	const pinToPhase = (phase: PhaseKey) => {
		if (activeIdx < 0) return;
		const next = [...projects];
		next[activeIdx].phases[phase].push([...palette]);
		persist(next);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-[#1F2A2E]">Projets</h2>
				<div className="flex items-center gap-2">
					<button onClick={addProject} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Nouveau projet</button>
					<button onClick={() => {
						const data = exportBundle();
						const blob = new Blob([data], { type: 'application/json' });
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a'); a.href = url; a.download = 'palette-muse-backup.json'; a.click(); URL.revokeObjectURL(url);
					}} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Exporter</button>
					<button onClick={() => {
						const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json';
						input.onchange = async () => { const f = input.files?.[0]; if (!f) return; const txt = await f.text(); importBundle(txt); };
						input.click();
					}} className="px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border">Importer</button>
				</div>
			</div>

			<div className="rounded-3xl p-4 border border-white/40 bg-white/30 backdrop-blur-xl">
				<div className="flex items-center gap-2 mb-3">
					<select value={activeIdx} onChange={e => setActiveIdx(parseInt(e.target.value))} className="px-3 py-2 rounded-xl bg-white/60 border border-white/40">
						<option value={-1}>— Sélectionner un projet —</option>
						{projects.map((p, i) => (<option key={i} value={i}>{p.name}</option>))}
					</select>
					{activeIdx >= 0 && (
						<button onClick={() => { const next = projects.filter((_, i) => i !== activeIdx); setActiveIdx(-1); persist(next); }} className="px-2 py-1 text-sm rounded-lg bg-white/50 hover:bg-white/70 border">Supprimer</button>
					)}
				</div>

				{activeIdx < 0 ? (
					<p className="text-sm text-[#47555A] opacity-80">Créez un projet et épinglez des palettes par phase.</p>
				) : (
					<div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
						{PHASES.map(phase => (
							<div key={phase} className="rounded-2xl overflow-hidden border border-white/40">
								<div className="flex items-center justify-between px-3 py-2 bg-white/55 font-medium capitalize">
									<span>{phase}</span>
									<button onClick={() => pinToPhase(phase)} className="text-xs px-2 py-1 rounded-lg bg-white/60 border">Épingler cette palette</button>
								</div>
								{projects[activeIdx].phases[phase].length === 0 ? (
									<div className="px-3 py-3 text-sm text-[#47555A] opacity-80">Aucune palette épinglée.</div>
								) : (
									<div className="space-y-2 p-3">
										{projects[activeIdx].phases[phase].map((cols, pi) => (
											<div key={pi} className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/40">
												{cols.map((c, ci) => (<div key={ci} style={{ background: c }} className="h-8"/>))}
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ProjectsPage;