import { useEffect, useRef } from "react";

export default function useHaloTrail(canvasRef, activePalette, onInk) {
  const rafRef = useRef(0);
  const inkRef = useRef(null);
  const tempRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, t: 0 });
  const lastPosRef = useRef(null);
  const lastColorRef = useRef(activePalette?.[0] || "#777777");

  useEffect(() => {
    lastColorRef.current = activePalette?.[0] || lastColorRef.current;
  }, [activePalette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const ensureBuffers = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const a = document.createElement("canvas");
      a.width = w; a.height = h;
      const b = document.createElement("canvas");
      b.width = w; b.height = h;
      inkRef.current = a; tempRef.current = b;
    };

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ensureBuffers();
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const ink = inkRef.current.getContext("2d");
      ink.globalCompositeOperation = "source-over";
      ink.fillStyle = "rgba(245,239,227,0.01)";
      ink.fillRect(0, 0, w, h);

      const p = pointerRef.current;
      if (lastPosRef.current) {
        const pal = activePalette && activePalette.length ? activePalette : ["#8BAAAD", "#BFD8D2", "#F2EAD3", "#E1CE7A"];
        const color = pal[Math.floor(Math.random() * pal.length)];
        lastColorRef.current = color;
        onInk?.(color);

        const lp = lastPosRef.current;
        const dx = p.x - lp.x;
        const dy = p.y - lp.y;
        const dist = Math.hypot(dx, dy);
        const step = 6;
        for (let s = 0; s <= dist; s += step) {
          const t = s / (dist || 1);
          const x = lp.x + dx * t;
          const y = lp.y + dy * t;
          const speed = Math.min(1.5, Math.hypot(p.vx, p.vy) / 800);
          const r = 26 + 90 * (1 - speed);
          const g = ink.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, color + "55");
          g.addColorStop(1, color + "00");
          ink.fillStyle = g;
          ink.beginPath();
          ink.arc(x, y, r, 0, Math.PI * 2);
          ink.fill();
        }
      }
      lastPosRef.current = { x: p.x, y: p.y };

      const tmp = tempRef.current.getContext("2d");
      tmp.clearRect(0, 0, w, h);
      tmp.filter = "blur(10px)";
      tmp.drawImage(inkRef.current, 0, 0);
      tmp.filter = "none";

      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#F5EFE3";
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(tempRef.current, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      const auraR = 70;
      const aura = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, auraR);
      aura.addColorStop(0, lastColorRef.current + "44");
      aura.addColorStop(1, lastColorRef.current + "00");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(p.x, p.y, auraR, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const setPointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const p = pointerRef.current;
      const t = performance.now();
      const dt = Math.max(0.001, (t - p.t) / 1000);
      const vx = (x - p.x) / dt;
      const vy = (y - p.y) / dt;
      pointerRef.current = { x, y, vx, vy, t };
    };

    const handleMove = (e) => {
      if (e.touches && e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
      else setPointer(e.clientX, e.clientY);
    };
    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef, activePalette, onInk]);
}

