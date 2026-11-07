import { useEffect, type RefObject } from 'react';
import type { Plot } from './plot';

export type V3 = [number, number, number];
export interface Cam { az: number; el: number }

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (s: number, a: V3): V3 => [s * a[0], s * a[1], s * a[2]];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3) => Math.sqrt(dot(a, a));

/** إسقاط متعامد: المشاهد في اتجاه السمت az وارتفاع el، والمحور z إلى أعلى. */
export function proj(c: Cam) {
  const ca = Math.cos(c.az), sa = Math.sin(c.az), ce = Math.cos(c.el), se = Math.sin(c.el);
  return (v: V3): [number, number] => {
    const u = -sa * v[0] + ca * v[1];
    const w = ca * v[0] + sa * v[1];
    return [u, v[2] * ce - w * se];
  };
}
/** عمق النقطة نحو المشاهد (للترتيب) */
export const depth = (c: Cam, v: V3) => Math.cos(c.az) * Math.cos(c.el) * v[0] + Math.sin(c.az) * Math.cos(c.el) * v[1] + Math.sin(c.el) * v[2];

/** أدوات رسم ثلاثية الأبعاد فوق Plot */
export function draw3(p: Plot, c: Cam) {
  const P = proj(c);
  return {
    P,
    line(a: V3, b: V3, color: string, opts: { width?: number; dash?: number[] } = {}) { const [x1, y1] = P(a), [x2, y2] = P(b); p.line(x1, y1, x2, y2, color, opts); },
    arrow(a: V3, b: V3, color: string, opts: { width?: number; head?: number } = {}) { const [x1, y1] = P(a), [x2, y2] = P(b); if (Math.hypot(x2 - x1, y2 - y1) < 1e-6) { p.point(x1, y1, color, 3); return; } p.arrow(x1, y1, x2, y2, color, opts); },
    point(a: V3, color: string, r = 5) { const [x, y] = P(a); p.point(x, y, color, r); },
    text(s: string, a: V3, color: string, opts: Parameters<Plot['text']>[4] = {}) { const [x, y] = P(a); p.text(s, x, y, color, opts); },
    poly(pts: V3[], color: string, alpha = 0.25, stroke = true) {
      const ctx = p.ctx; ctx.beginPath();
      pts.forEach((q, i) => { const [x, y] = P(q); if (i) ctx.lineTo(p.X(x), p.Y(y)); else ctx.moveTo(p.X(x), p.Y(y)); });
      ctx.closePath(); ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.fill(); ctx.globalAlpha = 1;
      if (stroke) { ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.stroke(); }
    },
    axes(L = 3, labels = true) {
      const ax: [V3, string][] = [[[L, 0, 0], 'x'], [[0, L, 0], 'y'], [[0, 0, L], 'z']];
      ax.forEach(([e, s]) => {
        const [x1, y1] = P(mul(-0.35, e)), [x2, y2] = P(e);
        p.line(x1, y1, x2, y2, p.c['ink-3'], { width: 1.2 });
        if (labels) p.text(s, x2, y2, p.c['ink-3'], { dx: 4, dy: -4 });
      });
    },
    /** شبكة على المستوى xy */
    floor(L = 3, step = 1) {
      for (let t = -L; t <= L + 1e-9; t += step) {
        const a = P([t, -L, 0]), b = P([t, L, 0]), c2 = P([-L, t, 0]), d = P([L, t, 0]);
        p.line(a[0], a[1], b[0], b[1], p.c.grid, { width: 1 }); p.line(c2[0], c2[1], d[0], d[1], p.c.grid, { width: 1 });
      }
    },
  };
}

/** دوران المشهد بالسحب (فأرة أو لمس أفقي). الاستعمال: const [cam, setCam] = useState(...)، ثم usePlot، ثم useOrbit(ref, setCam). */
export function useOrbit(ref: RefObject<HTMLCanvasElement | null>, setCam: (f: (c: Cam) => Cam) => void) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let last: [number, number] | null = null;
    const down = (e: PointerEvent) => { last = [e.clientX, e.clientY]; };
    const move = (e: PointerEvent) => {
      if (!last) return;
      const dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY];
      setCam((c) => ({ az: c.az - dx * 0.01, el: Math.max(-0.2, Math.min(1.45, c.el + dy * 0.01)) }));
    };
    const up = () => { last = null; };
    el.style.touchAction = 'pan-y'; el.style.cursor = 'grab';
    el.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, [ref, setCam]);
}
