import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual, polarCurve, polarGrid } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface C { label: string; F: (t: number) => number; dF: (t: number) => number; G?: (t: number) => number; a: number; b: number; bMax: number; area: (b: number) => number; areaTxt: string; box: [number, number, number, number]; note: string }
const cs: Record<string, C> = {
  circ: { label: 'الدائرة $\\cos\\theta$', F: Math.cos, dF: (t) => -Math.sin(t), a: 0, b: 2 * Math.PI, bMax: 2 * Math.PI, area: (b) => b / 4 + Math.sin(2 * b) / 8, areaTxt: 'π/4 ≈ 0.78540 (لا π/2)', box: [-0.2, 1.1, -0.65, 0.65], note: 'المثال 1: $\\int_0^{2\\pi}\\tfrac12\\cos^2\\theta\\,d\\theta = \\tfrac\\pi2$. **هذا خطأ!** مساحة دائرة نصف قطرها $\\tfrac12$ هي $\\pi/4$. الخطأ: **درنا حول الدائرة مرتين** حين زاد $\\theta$ إلى $2\\pi$. اسحب $\\theta$ النهائية إلى $\\pi$ لترى المساحة الصحيحة. (وطول الدائرة $\\pi$ لا $2\\pi$ للسبب نفسه.)' },
  card: { label: 'القلبية $1 + \\cos\\theta$', F: (t) => 1 + Math.cos(t), dF: (t) => -Math.sin(t), a: 0, b: 2 * Math.PI, bMax: 2 * Math.PI, area: (b) => 0.75 * b + Math.sin(b) + Math.sin(2 * b) / 8, areaTxt: '3π/2 ≈ 4.71239', box: [-0.6, 2.1, -1.35, 1.35], note: 'مساحة القلبية $\\int_0^{2\\pi}\\tfrac12(1 + \\cos\\theta)^2 d\\theta = \\tfrac{3\\pi}{2}$ (التمرين 1). **وطولها 8 بالضبط** (المثال 5): مع $2 + 2\\cos\\theta = 4\\cos^2\\tfrac\\theta2$ يصير الجذر $2\\cos\\tfrac\\theta2$.' },
  petal: { label: 'بتلة من $\\cos 2\\theta$', F: (t) => Math.cos(2 * t), dF: (t) => -2 * Math.sin(2 * t), a: -Math.PI / 4, b: Math.PI / 4, bMax: Math.PI / 4, area: (b) => (b + Math.PI / 4) / 4 + Math.sin(4 * b) / 16, areaTxt: 'π/8 ≈ 0.39270', box: [-0.15, 1.1, -0.48, 0.48], note: 'البتلة بين $-\\pi/4$ و $\\pi/4$، حيث $\\cos 2\\theta \\ge 0$: $\\int\\tfrac12\\cos^2 2\\theta\\,d\\theta = \\tfrac\\pi8$ (التمرين 5). الوردة الكاملة أربع بتلات: $\\pi/2$.' },
  between: { label: 'بين $\\cos\\theta$ و $r = \\tfrac12$', F: Math.cos, dF: (t) => -Math.sin(t), G: () => 0.5, a: -Math.PI / 3, b: Math.PI / 3, bMax: Math.PI / 3, area: (b) => { const f = (t: number) => t / 4 + Math.sin(2 * t) / 8 - t / 8; return f(b) - f(-Math.PI / 3); }, areaTxt: 'π/12 + √3/8 ≈ 0.47830', box: [-0.2, 1.1, -0.65, 0.65], note: 'المثال 2: الدائرتان تتقاطعان حيث $\\cos\\theta = \\tfrac12$، أي $\\theta = \\pm\\pi/3$. **الإسفين المقطوع** مساحته $\\tfrac12(F_1^2 - F_2^2)\\Delta\\theta$، **لا** $\\tfrac12(F_1 - F_2)^2\\Delta\\theta$.' },
};

/** 9.3 — المساحة داخل r = F(θ) من أسافين ضيقة: كل إسفين ½ r² Δθ. والطول من ds = √(F′² + F²) dθ. */
export default function PolarArea() {
  const [k, setK] = useState<string>('circ');
  const C = cs[k];
  const [n, setN] = useState(24);
  const [b, setB] = useState(C.b);
  useEffect(() => setB(cs[k].b), [k]);
  const dt = (b - C.a) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) { const t = C.a + (i + 0.5) * dt; sum += 0.5 * (C.F(t) ** 2 - (C.G ? C.G(t) ** 2 : 0)) * dt; }
  let len = 0; const m = 2000; for (let i = 0; i < m; i++) { const t = C.a + ((i + 0.5) * (b - C.a)) / m; len += Math.hypot(C.F(t), C.dF(t)) * ((b - C.a) / m); }
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const [x0, x1, y0, y1] = C.box; fitEqual(p, x0, x1, y0, y1);
    polarGrid(p, 2.2, 0.5);
    const ctx = p.ctx;
    for (let i = 0; i < n; i++) {
      const t0 = C.a + i * dt, t1 = t0 + dt, tm = t0 + dt / 2, R = C.F(tm), R2 = C.G ? C.G(tm) : 0;
      const neg = R < 0; const s = neg ? Math.PI : 0;
      ctx.beginPath();
      ctx.arc(p.X(0), p.Y(0), Math.abs(p.X(R) - p.X(0)), -(t0 + s), -(t1 + s), true);
      if (R2) ctx.arc(p.X(0), p.Y(0), p.X(R2) - p.X(0), -(t1 + s), -(t0 + s), false); else ctx.lineTo(p.X(0), p.Y(0));
      ctx.closePath();
      ctx.fillStyle = i % 2 ? p.c.area : p.c.f2; ctx.globalAlpha = 0.35 + (b > Math.PI + 0.01 && k === 'circ' && tm > Math.PI ? 0.25 : 0); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = p.c.card; ctx.lineWidth = 1; ctx.stroke();
    }
    if (C.G) polarCurve(p, C.G, -Math.PI, Math.PI, p.c.violet, p.c.violet, { width: 2 });
    polarCurve(p, C.F, k === 'petal' ? -Math.PI / 4 : 0, k === 'petal' ? Math.PI / 4 : 2 * Math.PI, p.c.f1, p.c.f1, { width: 2.6 });
  }, [k, n, b]);
  return (
    <Widget title="المساحة بالأسافين القطبية" hint="بين $\theta$ و $\theta + \Delta\theta$ إسفين ضيق، **مثلث تقريباً** زاويته الصغيرة $\Delta\theta$. إن عاملناه قطاعاً دائرياً فمساحته كسر $\Delta\theta/2\pi$ من $\pi r^2$: أي $\tfrac12 r^2\Delta\theta$. اجمع الأسافين وصغّرها: **9B** المساحة $= \int\tfrac12 r^2\,d\theta = \int\tfrac12\big[F(\theta)\big]^2 d\theta$.">
      <Choice value={k} onChange={setK} options={Object.keys(cs).map((v) => ({ v, label: cs[v].label }))} />
      <Canvas refEl={ref} ratio={0.75} label="أسافين قطبية تملأ المنحنى" />
      <div className="controls">
        <Slider label="عدد الأسافين $n$" value={n} min={2} max={80} step={1} onChange={setN} />
        <Slider label="$\theta$ النهائية" value={b} min={C.a + 0.05} max={C.bMax} step={0.01} onChange={setB} show={(v) => `${fmt((v * 180) / Math.PI, 0)}°`} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: 'مجموع $\\tfrac12 F^2\\Delta\\theta$', value: fmt(sum, 5), color: 'var(--f2)' },
        { label: 'التكامل حتى $\\theta$ النهائية', value: fmt(C.area(b), 5), color: 'var(--f1)' },
        { label: 'المساحة الحقيقية', value: C.areaTxt },
        ...(k !== 'between' ? [{ label: 'الطول $\\int\\sqrt{F^2 + F\'^2}\\,d\\theta$', value: fmt(len, 4), color: 'var(--violet)' }] : []),
      ]} />
      <MathText as="div" className="verdict">{C.note}</MathText>
    </Widget>
  );
}
