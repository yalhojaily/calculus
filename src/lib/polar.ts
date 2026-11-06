import type { Plot } from './plot';

/** يضبط مجال الرسم ليكون مقياس x مساوياً لمقياس y (الدوائر دوائر)، ويحتوي المستطيل المطلوب. */
export function fitEqual(p: Plot, xMin: number, xMax: number, yMin: number, yMax: number) {
  const pw = p.w - p.pad.l - p.pad.r, ph = p.h - p.pad.t - p.pad.b;
  const s = Math.min(pw / (xMax - xMin), ph / (yMax - yMin));
  const cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2;
  const hw = pw / s / 2, hh = ph / s / 2;
  p.view = { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
}

/** شبكة قطبية: دوائر r ثابت وأشعة θ ثابتة (كل 30°). */
export function polarGrid(p: Plot, rMax: number, rStep = 1) {
  const { ctx } = p;
  ctx.save();
  ctx.strokeStyle = p.c.grid; ctx.lineWidth = 1;
  for (let r = rStep; r <= rMax + 1e-9; r += rStep) {
    ctx.beginPath(); ctx.arc(p.X(0), p.Y(0), p.X(r) - p.X(0), 0, 2 * Math.PI); ctx.stroke();
  }
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0)); ctx.lineTo(p.X(rMax * Math.cos(a)), p.Y(rMax * Math.sin(a))); ctx.stroke();
  }
  ctx.strokeStyle = p.c['ink-3']; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(p.X(-rMax), p.Y(0)); ctx.lineTo(p.X(rMax), p.Y(0)); ctx.moveTo(p.X(0), p.Y(-rMax)); ctx.lineTo(p.X(0), p.Y(rMax)); ctx.stroke();
  ctx.restore();
}

/** قوس زاوية صغير عند الأصل من 0 إلى th */
export function angleArc(p: Plot, th: number, rad: number, color: string) {
  const { ctx } = p;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(p.X(0), p.Y(0), rad, 0, -th, th > 0); ctx.stroke(); ctx.restore();
}

/** يرسم المنحنى القطبي r = F(θ) من a إلى b؛ الأجزاء ذات r سالب بلون آخر. */
export function polarCurve(p: Plot, F: (t: number) => number, a: number, b: number, pos: string, neg: string, { width = 2.6, n = 600 } = {}) {
  const { ctx } = p;
  if (b <= a) return;
  ctx.save(); ctx.lineWidth = width; ctx.lineJoin = 'round';
  let prevSign = 0, started = false;
  for (let i = 0; i <= n; i++) {
    const t = a + ((b - a) * i) / n, r = F(t);
    if (!Number.isFinite(r)) { if (started) ctx.stroke(); started = false; continue; }
    const sg = r < 0 ? -1 : 1, X = p.X(r * Math.cos(t)), Y = p.Y(r * Math.sin(t));
    if (!started || sg !== prevSign) {
      if (started) { ctx.lineTo(X, Y); ctx.stroke(); }
      ctx.beginPath(); ctx.strokeStyle = sg < 0 ? neg : pos; ctx.moveTo(X, Y); started = true; prevSign = sg;
    } else ctx.lineTo(X, Y);
  }
  if (started) ctx.stroke();
  ctx.restore();
}
