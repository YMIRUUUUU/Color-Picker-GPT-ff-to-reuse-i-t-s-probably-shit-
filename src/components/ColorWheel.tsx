import React, { useMemo, useRef, useState, useEffect } from 'react';
import { hslToHex, clamp } from '../utils/color';

interface Props {
  onPick: (hex: string) => void;
}

export default function ColorWheel({ onPick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(1);
  const [light, setLight] = useState(0.5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const size = 220;
    canvas.width = size * dpr; canvas.height = size * dpr; canvas.style.width = size+'px'; canvas.style.height = size+'px';
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size/2, cy = size/2, r = size/2 - 4;
    for (let a=0; a<360; a++) {
      const start = (a-1) * Math.PI/180;
      const end = a * Math.PI/180;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, start, end);
      ctx!.lineWidth = 16;
      ctx!.strokeStyle = hslToHex(a, 1, 0.5);
      ctx!.stroke();
    }
  }, []);

  const current = useMemo(() => hslToHex(hue, clamp(sat), clamp(light)), [hue, sat, light]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="rounded-full border border-white/40 shadow" />
      <div className="flex items-center gap-3 w-full">
        <label className="text-sm w-16">Hue</label>
        <input type="range" min={0} max={359} value={hue} onChange={e=>setHue(parseInt(e.target.value))} className="w-full" />
        <div className="w-10 text-right text-sm">{hue}°</div>
      </div>
      <div className="flex items-center gap-3 w-full">
        <label className="text-sm w-16">Sat</label>
        <input type="range" min={0} max={100} value={Math.round(sat*100)} onChange={e=>setSat(parseInt(e.target.value)/100)} className="w-full" />
        <div className="w-10 text-right text-sm">{Math.round(sat*100)}%</div>
      </div>
      <div className="flex items-center gap-3 w-full">
        <label className="text-sm w-16">Light</label>
        <input type="range" min={0} max={100} value={Math.round(light*100)} onChange={e=>setLight(parseInt(e.target.value)/100)} className="w-full" />
        <div className="w-10 text-right text-sm">{Math.round(light*100)}%</div>
      </div>
      <div className="w-24 h-10 rounded-xl border border-white/50" style={{ background: current }} />
      <button onClick={()=>onPick(current)} className="px-3 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/40">Ajouter</button>
    </div>
  );
}