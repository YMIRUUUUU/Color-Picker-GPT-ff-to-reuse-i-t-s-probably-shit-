import React, { useState } from 'react';

const PHASES = ["exploration","direction","refinement","production","handoff"];

interface Project { name: string; phases: Record<string, string[][]>; }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [active, setActive] = useState<number>(-1);

  const addProject = () => {
    const name = prompt('Nom du projet ?');
    if (!name) return;
    const p: Project = { name, phases: Object.fromEntries(PHASES.map(ph => [ph, []])) as any };
    setProjects(prev => [...prev, p]);
    setActive(projects.length);
  };

  const pin = (phase: string, colors: string[]) => {
    if (active < 0) return;
    setProjects(prev => {
      const next = [...prev];
      next[active] = { ...next[active], phases: { ...next[active].phases, [phase]: [...next[active].phases[phase], colors] } };
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <select value={active} onChange={e=>setActive(parseInt(e.target.value))} className="px-3 py-2 rounded-xl bg-white/60 border border-white/40">
          <option value={-1}>— Sélectionner un projet —</option>
          {projects.map((p,i)=>(<option key={i} value={i}>{p.name}</option>))}
        </select>
        <button onClick={addProject} className="px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40">Nouveau projet</button>
      </div>

      {active>=0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PHASES.map(ph => (
            <div key={ph} className="rounded-3xl p-4 shadow-2xl border border-white/30 bg-white/20 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium capitalize text-[#1F2A2E]">{ph}</div>
                <button onClick={()=>pin(ph, ['#333333','#888888','#CCCCCC','#F5EFE3','#005EB8','#FF6A13','#78BE20','#F4ED7C'])} className="px-2 py-1 rounded-lg bg-white/60 border text-sm">Épingler la palette courante</button>
              </div>
              {projects[active].phases[ph].length === 0 ? (
                <div className="text-sm text-[#47555A] opacity-80">Aucune palette épinglée.</div>
              ) : (
                <div className="space-y-2">
                  {projects[active].phases[ph].map((cols, i) => (
                    <div key={i} className="grid grid-cols-8 rounded-xl overflow-hidden border border-white/40">
                      {cols.map((c,ci)=>(<div key={ci} style={{background:c}} className="h-6"/>))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}