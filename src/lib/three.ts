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

/** سطح z = f(x, y) بأوجه ملونة حسب الارتفاع، مرتبة من الأبعد إلى الأقرب (رسم الرسام). */
export function surface(p: Plot, c: Cam, f: (x: number, y: number) => number, [x0, x1]: [number, number], [y0, y1]: [number, number], { n = 22, zMin = -Infinity, zMax = Infinity, alpha = 0.85, clip = true } = {}) {
  const P = proj(c);
  const quads: { d: number; pts: V3[]; z: number }[] = [];
  const val = (x: number, y: number) => { const z = f(x, y); return clip ? Math.max(zMin, Math.min(zMax, z)) : z; };
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const xa = x0 + ((x1 - x0) * i) / n, xb = x0 + ((x1 - x0) * (i + 1)) / n, ya = y0 + ((y1 - y0) * j) / n, yb = y0 + ((y1 - y0) * (j + 1)) / n;
    const pts: V3[] = [[xa, ya, val(xa, ya)], [xb, ya, val(xb, ya)], [xb, yb, val(xb, yb)], [xa, yb, val(xa, yb)]];
    if (pts.some((q) => !Number.isFinite(q[2]))) continue;
    const zc = (pts[0][2] + pts[1][2] + pts[2][2] + pts[3][2]) / 4;
    lo = Math.min(lo, zc); hi = Math.max(hi, zc);
    const ctr: V3 = [(xa + xb) / 2, (ya + yb) / 2, zc];
    quads.push({ d: depth(c, ctr), pts, z: zc });
  }
  quads.sort((a, b) => a.d - b.d);
  const ctx = p.ctx;
  for (const q of quads) {
    const s = hi > lo ? (q.z - lo) / (hi - lo) : 0.5;
    const hue = 220 - 190 * s; // أزرق منخفض ← برتقالي مرتفع
    ctx.beginPath();
    q.pts.forEach((v, i) => { const [x, y] = P(v); if (i) ctx.lineTo(p.X(x), p.Y(y)); else ctx.moveTo(p.X(x), p.Y(y)); });
    ctx.closePath();
    ctx.fillStyle = `hsla(${hue}, 65%, ${52 + 8 * s}%, ${alpha})`; ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, 40%, 30%, 0.35)`; ctx.lineWidth = 0.6; ctx.stroke();
  }
}

/** خطوط تساوي f = c على المستوى (خوارزمية المربعات الزاحفة المبسطة). ترجع قطعاً مستقيمة. */
export function contourSegs(f: (x: number, y: number) => number, c: number, [x0, x1]: [number, number], [y0, y1]: [number, number], n = 80): [number, number, number, number][] {
  const segs: [number, number, number, number][] = [];
  const hx = (x1 - x0) / n, hy = (y1 - y0) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = x0 + i * hx, y = y0 + j * hy;
    const v = [f(x, y) - c, f(x + hx, y) - c, f(x + hx, y + hy) - c, f(x, y + hy) - c];
    if (v.some((q) => !Number.isFinite(q))) continue;
    const corners: [number, number][] = [[x, y], [x + hx, y], [x + hx, y + hy], [x, y + hy]];
    const cross: [number, number][] = [];
    for (let e = 0; e < 4; e++) {
      const a = v[e], b = v[(e + 1) % 4];
      if ((a < 0) !== (b < 0)) { const t = a / (a - b); const [ax, ay] = corners[e], [bx, by] = corners[(e + 1) % 4]; cross.push([ax + t * (bx - ax), ay + t * (by - ay)]); }
    }
    if (cross.length === 2) segs.push([cross[0][0], cross[0][1], cross[1][0], cross[1][1]]);
    else if (cross.length === 4) { segs.push([cross[0][0], cross[0][1], cross[1][0], cross[1][1]]); segs.push([cross[2][0], cross[2][1], cross[3][0], cross[3][1]]); }
  }
  return segs;
}

/** خريطة خطوط تساوٍ على مستوى ثنائي الأبعاد، ملونة من الأزرق (منخفض) إلى البرتقالي (مرتفع). */
export function contourMap(p: Plot, f: (x: number, y: number) => number, levels: number[], xr: [number, number], yr: [number, number], { n = 90, width = 1.4, highlight }: { n?: number; width?: number; highlight?: number } = {}) {
  const lo = Math.min(...levels), hi = Math.max(...levels);
  for (const c of levels) {
    const s = hi > lo ? (c - lo) / (hi - lo) : 0.5;
    const col = `hsl(${220 - 190 * s}, 62%, 45%)`;
    const hl = highlight !== undefined && Math.abs(c - highlight) < 1e-9;
    for (const [a, b, c2, d] of contourSegs(f, c, xr, yr, n)) p.line(a, b, c2, d, hl ? p.c.red : col, { width: hl ? 3 : width });
  }
}
