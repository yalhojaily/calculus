import { useEffect, useMemo, useRef, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Readout, Slider, Widget, useClock, usePlot } from './ui';

const GM = 1;

/** 12.4 — مدار تحت قوة مركزية GM/r²: يُحسب عددياً من F = ma. القطع الناقص (القانون 1)، ومساحات متساوية في أزمنة متساوية (القانون 2). */
export default function KeplerOrbit() {
  const [v0, setV0] = useState(1.25);
  const clock = useClock(12, { loop: true });
  // مدار كامل مسبق الحساب بخطوات ثابتة (فيرليه)
  const orbit = useMemo(() => {
    const dt = 0.002; let x = 1, y = 0, vx = 0, vy = v0;
    const pts: [number, number][] = [[x, y]];
    const E = 0.5 * v0 * v0 - GM / 1;
    const a = E < 0 ? -GM / (2 * E) : Infinity;
    const period = Number.isFinite(a) ? 2 * Math.PI * Math.sqrt(a ** 3 / GM) : 12;
    const steps = Math.ceil(Math.min(Number.isFinite(a) ? period * 1.002 : 14, 60) / dt);
    let ax = -x / Math.hypot(x, y) ** 3, ay = -y / Math.hypot(x, y) ** 3;
    for (let i = 0; i < steps; i++) {
      x += vx * dt + 0.5 * ax * dt * dt; y += vy * dt + 0.5 * ay * dt * dt;
      const r3 = Math.hypot(x, y) ** 3, nx = -x / r3, ny = -y / r3;
      vx += 0.5 * (ax + nx) * dt; vy += 0.5 * (ay + ny) * dt; ax = nx; ay = ny;
      pts.push([x, y]);
    }
    return { pts, dt, a, period, e: Number.isFinite(a) ? Math.abs(1 - 1 / a) : NaN };
  }, [v0]);
  const n = orbit.pts.length;
  const idx = Math.min(n - 1, Math.floor(clock.t * (n - 1)));
  const wedges = 8, per = Math.floor((n - 1) / wedges);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const xs = orbit.pts.map((q) => q[0]), ys = orbit.pts.map((q) => q[1]);
    const xMin = Math.max(-8, Math.min(...xs)), xMax = Math.min(8, Math.max(...xs)), yMin = Math.max(-6, Math.min(...ys)), yMax = Math.min(6, Math.max(...ys));
    fitEqual(p, xMin - 0.3, xMax + 0.3, yMin - 0.3, yMax + 0.3);
    const ctx = p.ctx;
    // أسافين بأزمنة متساوية: كلها لها المساحة نفسها
    for (let w = 0; w < wedges; w++) {
      const i0 = w * per, i1 = Math.min(idx, (w + 1) * per);
      if (i1 <= i0) break;
      ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0));
      for (let i = i0; i <= i1; i += 4) ctx.lineTo(p.X(orbit.pts[i][0]), p.Y(orbit.pts[i][1]));
      ctx.closePath(); ctx.fillStyle = w % 2 ? p.c.area : p.c.f2; ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.beginPath(); orbit.pts.forEach(([x, y], i) => (i ? ctx.lineTo(p.X(x), p.Y(y)) : ctx.moveTo(p.X(x), p.Y(y)))); ctx.strokeStyle = p.c.f1; ctx.lineWidth = 1.6; ctx.stroke();
    p.point(0, 0, '#e9a317', 10);
    if (Number.isFinite(orbit.a)) { const cxe = 1 - orbit.a; p.point(cxe, 0, p.c['ink-3'], 3); p.point(2 * cxe, 0, p.c['ink-3'], 3); }
    const [x, y] = orbit.pts[idx];
    p.line(0, 0, x, y, p.c.ink, { width: 1 });
    p.point(x, y, p.c.f1, 7);
  }, [orbit, idx]);
  // حساب h = r² dθ/dt عند الموضع الحالي (ثابت)
  const [x, y] = orbit.pts[idx], [xn, yn] = orbit.pts[Math.min(n - 1, idx + 1)];
  const h = (x * (yn - y) - y * (xn - x)) / orbit.dt;
  const r = Math.hypot(x, y);
  const lastV = useRef(v0); useEffect(() => { if (lastV.current !== v0) { clock.reset(); lastV.current = v0; } }, [v0, clock]);
  const kind = !Number.isFinite(orbit.a) ? (Math.abs(v0 - Math.SQRT2) < 0.01 ? 'قطع مكافئ' : 'قطع زائد') : Math.abs(v0 - 1) < 0.005 ? 'دائرة' : 'قطع ناقص';
  return (
    <Widget title="مدار كوكب حول الشمس" hint="الجاذبية قوة **مركزية** $\mathbf F = -GMm\,\mathbf R/r^3$. الكوكب يبدأ على بعد 1 بسرعة عمودية $v_0$، ويُحسب مساره عددياً من $\mathbf F = m\mathbf a$ وحدها. **القانون الأول:** المدار قطع ناقص والشمس في إحدى بؤرتيه (لا في مركزه). **القانون الثاني:** الأسافين الملونة بأزمنة متساوية، **ولها كلها المساحة نفسها**: قرب الشمس يسرع الكوكب.">
      <Canvas refEl={ref} ratio={0.68} label="مدار كوكب وأسافين مساحات متساوية" />
      <AnimControls clock={clock} label="شغّل المدار" />
      <div className="controls">
        <Slider label="السرعة الابتدائية $v_0$" value={v0} min={0.6} max={1.6} step={0.01} onChange={setV0} show={(v) => fmt(v, 2)} color="var(--f1)" />
      </div>
      <Readout items={[
        { label: 'المدار', value: kind },
        { label: 'الاختلاف المركزي $e$', value: Number.isFinite(orbit.e) ? fmt(orbit.e, 3) : '≥ 1' },
        { label: 'نصف المحور الأكبر $a$', value: Number.isFinite(orbit.a) ? fmt(orbit.a, 3) : '∞' },
        { label: 'السنة $T = 2\\pi a^{3/2}/\\sqrt{GM}$', value: Number.isFinite(orbit.a) ? fmt(orbit.period, 3) : '—', color: 'var(--area)' },
        { label: '$h = r^2\\,d\\theta/dt$', value: fmt(h, 4), color: 'var(--f2)' },
        { label: 'البعد $r$', value: fmt(r, 3) },
      ]} />
      <MathText as="div" className="verdict">{'**لماذا تبقى $h$ ثابتة؟** القوة على امتداد $\\mathbf R$، فـ $\\mathbf R\\times\\mathbf a = \\mathbf 0$، ومشتقة $\\mathbf R\\times\\mathbf v$ هي $\\mathbf v\\times\\mathbf v + \\mathbf R\\times\\mathbf a = \\mathbf 0$. فـ $\\mathbf R\\times\\mathbf v = r^2\\tfrac{d\\theta}{dt}\\,\\mathbf k$ ثابت، **والمدار في مستوى**، و $dA/dt = \\tfrac12 r^2\\,d\\theta/dt = \\tfrac12 h$. $v_0 = 1$ دائرة، وعند $v_0 = \\sqrt2$ (سرعة الإفلات) يصير المدار قطعاً مكافئاً ولا يعود.'}</MathText>
    </Widget>
  );
}
