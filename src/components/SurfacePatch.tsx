import { useCallback, useMemo, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, add, cross, depth, draw3, len, mul, sub, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Sf { label: string; R: (u: number, v: number) => V3; u: [number, number]; v: [number, number]; uL: string; vL: string; exact: string; note: string }
const surfs: Record<string, Sf> = {
  plane: { label: 'مستوٍ $z = x + 2y$', R: (u, v) => [u, v, 0.5 * (u + 2 * v)], u: [-1, 1], v: [-1, 1], uL: 'x', vL: 'y', exact: '$4\\sqrt{1 + \\tfrac14 + 1}$ = 6', note: '**المثال 1 (مصغّراً بعامل ½):** $z = \\tfrac12(x + 2y)$ فوق المربع. $|\\mathbf N| = \\sqrt{1 + z_x^2 + z_y^2}$ **ثابت**: السقف المائل أكبر من أرضية الغرفة بنسبة ثابتة.' },
  cone: { label: 'مخروط $z = r$', R: (u, v) => [u * Math.cos(v), u * Math.sin(v), u], u: [0, 1.5], v: [0, 2 * Math.PI], uL: 'r', vL: '\\theta', exact: '$\\sqrt2\\,\\pi a^2$ ≈ 9.996', note: '**المثالان 3 و 4:** $\\mathbf A = (\\cos\\theta, \\sin\\theta, 1)$ و $\\mathbf B = (-r\\sin\\theta, r\\cos\\theta, 0)$، و $|\\mathbf A\\times\\mathbf B| = \\sqrt2\\,r$. المساحة حتى الارتفاع $a$ هي $\\sqrt2\\,\\pi a^2$: **$\\sqrt2$ مرة مساحة الظل**.' },
  para: { label: 'قطع مكافئ $z = r^2$', R: (u, v) => [u * Math.cos(v), u * Math.sin(v), u * u], u: [0, 1.4], v: [0, 2 * Math.PI], uL: 'r', vL: '\\theta', exact: '$\\tfrac\\pi6\\big((1 + 4a^2)^{3/2} - 1\\big)$ ≈ 13.24', note: '**التمرين 1:** $|\\mathbf N| = r\\sqrt{1 + 4r^2}$. **الرقعة تكبر بسرعة صعوداً** لأن السطح يزداد انحداراً.' },
  sphere: { label: 'كرة $\\rho = a$', R: (u, v) => [1.5 * Math.sin(u) * Math.cos(v), 1.5 * Math.sin(u) * Math.sin(v), 1.5 * Math.cos(u)], u: [0.001, Math.PI], v: [0, 2 * Math.PI], uL: '\\phi', vL: '\\theta', exact: '$4\\pi a^2$ ≈ 28.27', note: '**المثالان 6 و 7:** بالمعاملين $\\phi$ و $\\theta$: $|\\mathbf A\\times\\mathbf B| = a^2\\sin\\phi$، كما في عنصر الحجم الكروي من دون $d\\rho$. **الرقع تصغر قرب القطبين.** والمساحة $a^2\\cdot 2\\cdot 2\\pi = 4\\pi a^2$.' },
  cyl: { label: 'أسطوانة $r = a$', R: (u, v) => [1.2 * Math.cos(u), 1.2 * Math.sin(u), v], u: [0, 2 * Math.PI], v: [0, 1.8], uL: '\\theta', vL: 'z', exact: '$2\\pi ab$ ≈ 13.57', note: '**المثال 11:** $\\mathbf A = (-a\\sin\\theta, a\\cos\\theta, 0)$ و $\\mathbf B = \\mathbf k$، و $\\mathbf N = \\mathbf A\\times\\mathbf B$ يشير **أفقياً إلى الخارج** وطوله $a$ ثابت. افرد الأسطوانة: مستطيل $2\\pi a \\times b$.' },
};
const area = (s: Sf) => { const m = 120; let A = 0; const du = (s.u[1] - s.u[0]) / m, dv = (s.v[1] - s.v[0]) / m; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const u = s.u[0] + (i + 0.5) * du, v = s.v[0] + (j + 0.5) * dv; A += len(cross(dR(s, u, v, 0), dR(s, u, v, 1))) * du * dv; } return A; };
function dR(s: Sf, u: number, v: number, w: 0 | 1): V3 { const h = 1e-4; return w === 0 ? mul(1 / (2 * h), sub(s.R(u + h, v), s.R(u - h, v))) : mul(1 / (2 * h), sub(s.R(u, v + h), s.R(u, v - h))); }

/** 15.4 — التكاملات السطحية: رقعة صغيرة على السطح أضلاعها A du و B dv، ومساحتها |A × B| du dv. */
export default function SurfacePatch() {
  const [k, setK] = useState('cone');
  const sf = surfs[k];
  const [a, setA] = useState(0.55);
  const [b, setB] = useState(0.15);
  const [cam, setCam0] = useState<Cam>({ az: 0.7, el: 0.38 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const u = sf.u[0] + a * (sf.u[1] - sf.u[0]), v = sf.v[0] + b * (sf.v[1] - sf.v[0]);
  const n = 7, du = (sf.u[1] - sf.u[0]) / n, dv = (sf.v[1] - sf.v[0]) / n;
  const A = dR(sf, u, v, 0), B = dR(sf, u, v, 1), N = cross(A, B);
  const total = useMemo(() => area(sf), [sf]);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -2.3, 2.3, -1.6, 2.6);
    const g = draw3(p, cam);
    g.floor(2, 1); g.axes(2.2);
    // السطح: أوجه مرتبة من الأبعد إلى الأقرب
    const quads: { d: number; pts: V3[]; hl: boolean }[] = [];
    const m = 28, eu = (sf.u[1] - sf.u[0]) / m, ev = (sf.v[1] - sf.v[0]) / m;
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
      const u0 = sf.u[0] + i * eu, v0 = sf.v[0] + j * ev;
      const pts = [sf.R(u0, v0), sf.R(u0 + eu, v0), sf.R(u0 + eu, v0 + ev), sf.R(u0, v0 + ev)];
      const c = mul(0.25, pts.reduce((s, q) => add(s, q), [0, 0, 0] as V3));
      quads.push({ d: depth(cam, c), pts, hl: false });
    }
    // الرقعة المختارة du × dv
    const u0 = u - du / 2, v0 = v - dv / 2;
    const patch = [sf.R(u0, v0), sf.R(u0 + du, v0), sf.R(u0 + du, v0 + dv), sf.R(u0, v0 + dv)];
    quads.sort((x, y) => x.d - y.d);
    for (const q of quads) g.poly(q.pts, p.c.f1, 0.16, false);
    for (const q of quads) { const [a0, a1, , a3] = q.pts; g.line(a0, a1, p.c.f1, { width: 0.5 }); g.line(a0, a3, p.c.f1, { width: 0.5 }); }
    g.poly(patch, p.c.area, 0.75, true);
    const P0 = sf.R(u, v);
    g.arrow(P0, add(P0, mul(du, A)), p.c.red, { width: 2.6 });
    g.arrow(P0, add(P0, mul(dv, B)), p.c.violet, { width: 2.6 });
    const nl = len(N); if (nl > 1e-6) g.arrow(P0, add(P0, mul(0.9 / Math.max(1, nl), N)), p.c.ink, { width: 2.2 });
    g.point(P0, p.c.ink, 4);
  }, [k, a, b, cam]);
  useOrbit(ref, setCam);
  return (
    <Widget title="رقعة صغيرة على سطح" hint={`السطح $\\mathbf R(u, v)$ بمعاملين. **تغيير $u$ قليلاً يحرك النقطة $\\mathbf A\\,du$** (الأحمر)، **وتغيير $v$ يحركها $\\mathbf B\\,dv$** (البنفسجي)، حيث $\\mathbf A = \\partial\\mathbf R/\\partial u$ و $\\mathbf B = \\partial\\mathbf R/\\partial v$. الرقعة (الخضراء) متوازي أضلاع تقريباً، **فمساحتها $|\\mathbf A\\times\\mathbf B|\\,du\\,dv$** والأسود العمودي $\\mathbf N = \\mathbf A\\times\\mathbf B$. اسحب الرسم لتديره.`}>
      <Choice value={k} onChange={setK} options={Object.keys(surfs).map((v2) => ({ v: v2, label: surfs[v2].label }))} />
      <Canvas refEl={ref} ratio={0.8} label="سطح بمعاملين ورقعة صغيرة ومتجهاها المماسان والعمودي" />
      <div className="controls">
        <Slider label={`$${sf.uL}$`} value={a} min={0.02} max={0.98} step={0.005} onChange={setA} show={(t) => fmt(sf.u[0] + t * (sf.u[1] - sf.u[0]), 2)} color="var(--red)" />
        <Slider label={`$${sf.vL}$`} value={b} min={0.02} max={0.98} step={0.005} onChange={setB} show={(t) => fmt(sf.v[0] + t * (sf.v[1] - sf.v[0]), 2)} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: '$|\\mathbf A|$', value: fmt(len(A), 3), color: 'var(--red)' },
        { label: '$|\\mathbf B|$', value: fmt(len(B), 3), color: 'var(--violet)' },
        { label: 'عامل المساحة $|\\mathbf A\\times\\mathbf B|$', value: fmt(len(N), 3), color: 'var(--area)' },
        { label: 'المساحة الكلية $\\iint|\\mathbf N|\\,du\\,dv$', value: fmt(total, 3) },
      ]} />
      <MathText as="div" className="verdict">{sf.note + ' **الصيغة الدقيقة:** ' + sf.exact + '.'}</MathText>
    </Widget>
  );
}
