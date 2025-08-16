import React, { useEffect, useMemo, useRef } from 'react';

interface PaintCanvasProps {
  brushColor: string;
  diffusion: number; // 0..1 small
  brushRadius: number; // in grid pixels
  onMixedUpdate?: (hex: string) => void;
  displayWidth?: number;
  displayHeight?: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const hexToRgb01 = (hex: string): [number, number, number] => {
  const v = hex.replace('#', '');
  const n = parseInt(v.length === 3 ? v.split('').map(x => x + x).join('') : v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const rgb01ToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('');

const PaintCanvas: React.FC<PaintCanvasProps> = ({
  brushColor,
  diffusion,
  brushRadius,
  onMixedUpdate,
  displayWidth = 480,
  displayHeight = 320,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const pointerRef = useRef<{ down: boolean; x: number; y: number }>({ down: false, x: 0, y: 0 });

  // Low-res simulation grid (kept small for performance)
  const gridW = 160;
  const gridH = 106; // ~3:2 ratio

  // Buffers
  const rA = useRef<Float32Array>(new Float32Array(gridW * gridH));
  const gA = useRef<Float32Array>(new Float32Array(gridW * gridH));
  const bA = useRef<Float32Array>(new Float32Array(gridW * gridH));
  const aA = useRef<Float32Array>(new Float32Array(gridW * gridH));

  const rB = useRef<Float32Array>(new Float32Array(gridW * gridH));
  const gB = useRef<Float32Array>(new Float32Array(gridW * gridH));
  const bB = useRef<Float32Array>(new Float32Array(gridW * gridH));
  const aB = useRef<Float32Array>(new Float32Array(gridW * gridH));

  const depositColor = (gx: number, gy: number, radius: number, color: [number, number, number]) => {
    const rr = Math.max(1, radius);
    const r2 = rr * rr;
    const startX = Math.max(1, Math.floor(gx - rr));
    const endX = Math.min(gridW - 2, Math.ceil(gx + rr));
    const startY = Math.max(1, Math.floor(gy - rr));
    const endY = Math.min(gridH - 2, Math.ceil(gy + rr));
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const dx = x - gx;
        const dy = y - gy;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        const i = y * gridW + x;
        const t = 1 - Math.sqrt(d2) / rr; // 1 at center -> 0 at edge
        const f = t * 0.5; // strength
        const ra = rA.current;
        const ga = gA.current;
        const ba = bA.current;
        const aa = aA.current;
        ra[i] = ra[i] + (color[0] - ra[i]) * f;
        ga[i] = ga[i] + (color[1] - ga[i]) * f;
        ba[i] = ba[i] + (color[2] - ba[i]) * f;
        aa[i] = clamp01(aa[i] + f * (1 - aa[i]));
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale canvas to display size
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    const img = ctx.createImageData(gridW, gridH);
    const brush = hexToRgb01(brushColor);

    const toGrid = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width;
      const ny = (clientY - rect.top) / rect.height;
      return [Math.floor(nx * gridW), Math.floor(ny * gridH)] as [number, number];
    };

    const handleDown = (e: PointerEvent) => {
      pointerRef.current.down = true;
      const [gx, gy] = toGrid(e.clientX, e.clientY);
      depositColor(gx, gy, brushRadius, brush);
    };
    const handleMove = (e: PointerEvent) => {
      const [gx, gy] = toGrid(e.clientX, e.clientY);
      pointerRef.current.x = gx;
      pointerRef.current.y = gy;
      if (pointerRef.current.down) {
        depositColor(gx, gy, brushRadius, brush);
      }
    };
    const handleUp = () => {
      pointerRef.current.down = false;
    };

    canvas.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });

    const step = () => {
      // Diffusion step (simple 4-neighbour average)
      const k = diffusion * 0.25; // small
      const ra = rA.current, ga = gA.current, ba = bA.current, aa = aA.current;
      const rb = rB.current, gb = gB.current, bb = bB.current, ab = aB.current;
      for (let y = 1; y < gridH - 1; y++) {
        for (let x = 1; x < gridW - 1; x++) {
          const i = y * gridW + x;
          const iL = i - 1, iR = i + 1, iU = i - gridW, iD = i + gridW;
          rb[i] = ra[i] * (1 - 4 * k) + k * (ra[iL] + ra[iR] + ra[iU] + ra[iD]);
          gb[i] = ga[i] * (1 - 4 * k) + k * (ga[iL] + ga[iR] + ga[iU] + ga[iD]);
          bb[i] = ba[i] * (1 - 4 * k) + k * (ba[iL] + ba[iR] + ba[iU] + ba[iD]);
          ab[i] = aa[i] * (1 - 4 * k) + k * (aa[iL] + aa[iR] + aa[iU] + aa[iD]);
        }
      }
      // Swap buffers
      rA.current = rb.slice(0); gA.current = gb.slice(0); bA.current = bb.slice(0); aA.current = ab.slice(0);

      // Render to low-res image
      const data = img.data;
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0, cnt = 0;
      for (let i = 0; i < gridW * gridH; i++) {
        const rr = rA.current[i];
        const gg = gA.current[i];
        const bbv = bA.current[i];
        const aaV = aA.current[i];
        // Composite on white for display
        const R = 255 * (rr * aaV + (1 - aaV));
        const G = 255 * (gg * aaV + (1 - aaV));
        const B = 255 * (bbv * aaV + (1 - aaV));
        const j = i * 4;
        data[j] = R;
        data[j + 1] = G;
        data[j + 2] = B;
        data[j + 3] = 255;
        if (aaV > 0.02) {
          sumR += rr * aaV;
          sumG += gg * aaV;
          sumB += bbv * aaV;
          sumA += aaV;
          cnt++;
        }
      }
      // Upscale to display size
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = gridW; tmpCanvas.height = gridH;
      const tmpCtx = tmpCanvas.getContext('2d')!;
      tmpCtx.putImageData(img, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);

      if (onMixedUpdate && sumA > 0) {
        const avgR = sumR / sumA;
        const avgG = sumG / sumA;
        const avgB = sumB / sumA;
        onMixedUpdate(rgb01ToHex(avgR, avgG, avgB));
      }

      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [brushColor, diffusion, brushRadius, displayWidth, displayHeight, onMixedUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-xl border border-white/60 bg-white/80"
      style={{ aspectRatio: `${displayWidth} / ${displayHeight}` }}
    />
  );
};

export default PaintCanvas;