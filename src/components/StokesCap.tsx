import { useCallback, useMemo, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, add, cross, depth, draw3, len, mul, sub, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fd { label: string; F: (p: V3) => V3; curl: (p: V3) => V3; line: string }
const fields: Record<string, Fd> = {
  S: { label: '$-y\\mathbf i + x\\mathbf j$', F: ([x, y]) => [-y, x, 0], curl: () => [0, 0, 2], line: '$\\oint -y\\,dx + x\\,dy = 2\\pi$' },
  A: { label: '$z\\mathbf i + x\\mathbf j + y\\mathbf k$', F: ([x, y, z]) => [z, x, y], curl: () => [1, 1, 1], line: '$\\oint x\\,dy = \\pi$ (على الدائرة $z = 0$)' },
  B: { label: '$\\mathbf R/\\rho^2$', F: ([x, y, z]) => { const r = x * x + y * y + z * z; return [x / r, y / r, z / r]; }, curl: () => [0, 0, 0], line: 'صفر: الحقل تدرّج ($\\ln\\rho$)' },
};
type Sk = 'cap' | 'sph' | 'cone';
// سطوح حدها كلها دائرة الوحدة في المستوى z = 0، بمعاملين (r, θ)
const shapes: Record<Sk, { label: string; z: (r: number, h: number) => number }> = {
  cap: { label: 'قبة $z = h(1 - r^2)$', z: (r, h) => h * (1 - r * r) },
  sph: { label: 'تموّج', z: (r, h) => h * Math.sin(Math.PI * r) * (1 + 0.5 * r) },
  cone: { label: 'مخروط', z: (r, h) => h * (1 - r) },
};

/** 15.6 — مبرهنة ستوكس: ∮ F·dR حول الحد = ∬ curl F · n dS لأي سطح حده المنحنى نفسه. */
export default function StokesCap() {
  const [k, setK] = useState('S');
  const [sk, setSk] = useState<Sk>('cap');
  const [h, setH] = useState(1.2);
  const [cam, setCam0] = useState<Cam>({ az: 0.6, el: 0.4 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const fd = fields[k], sh = shapes[sk];
  const R = (r: number, t: number): V3 => [r * Math.cos(t), r * Math.sin(t), sh.z(r, h)];
  const flux = useMemo(() => {
    const m = 80, dr = 1 / m, dt = (2 * Math.PI) / m; let s = 0; const e = 1e-4;
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
      const r = (i + 0.5) * dr, t = (j + 0.5) * dt;
      const A = mul(1 / (2 * e), sub(R(r + e, t), R(r - e, t))), B = mul(1 / (2 * e), sub(R(r, t + e), R(r, t - e)));
      const N = cross(A, B); const c = fd.curl(R(r, t)); s += (c[0] * N[0] + c[1] * N[1] + c[2] * N[2]) * dr * dt;
    }
    return s;
  }, [fd, sk, h]); // eslint-disable-line react-hooks/exhaustive-deps
  const circ = useMemo(() => { const m = 2000; let s = 0; for (let j = 0; j < m; j++) { const t = ((j + 0.5) * 2 * Math.PI) / m; const P: V3 = [Math.cos(t), Math.sin(t), 0]; const F = fd.F(P); s += (-F[0] * Math.sin(t) + F[1] * Math.cos(t)) * ((2 * Math.PI) / m); } return s; }, [fd]);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -1.9, 1.9, -1.5, 2);
    const g = draw3(p, cam);
    g.floor(1.5, 0.5); g.axes(1.8);
    const m = 18; const quads: { d: number; pts: V3[] }[] = [];
    for (let i = 0; i < m; i++) for (let j = 0; j < 2 * m; j++) {
      const r0 = i / m, r1 = (i + 1) / m, t0 = (j * Math.PI) / m, t1 = ((j + 1) * Math.PI) / m;
      const pts = [R(r0, t0), R(r1, t0), R(r1, t1), R(r0, t1)];
      quads.push({ d: depth(cam, mul(0.25, pts.reduce((s, q) => add(s, q), [0, 0, 0] as V3))), pts });
    }
    quads.sort((a, b) => a.d - b.d);
    for (const q of quads) g.poly(q.pts, p.c.f1, 0.22, false);
    for (const q of quads) { g.line(q.pts[0], q.pts[1], p.c.f1, { width: 0.4 }); g.line(q.pts[1], q.pts[2], p.c.f1, { width: 0.4 }); }
    // curl F على السطح، والعمودي n
    for (const r of [0.35, 0.75]) for (let j = 0; j < 6; j++) {
      const t = (j * Math.PI) / 3 + r; const P0 = R(r, t); const c = fd.curl(P0); const l = len(c);
      if (l > 1e-9) g.arrow(P0, add(P0, mul(0.4 / Math.max(1, l), c)), p.c.red, { width: 1.8, head: 5 });
    }
    // الحد C: دائرة الوحدة عكس عقارب الساعة (من فوق)
    for (let j = 0; j < 72; j++) { const a = (j * Math.PI) / 36, b = ((j + 1) * Math.PI) / 36; g.line([Math.cos(a), Math.sin(a), 0], [Math.cos(b), Math.sin(b), 0], p.c.violet, { width: 3.2 }); }
    for (const a of [0.3, 2.4, 4.5]) g.arrow([Math.cos(a), Math.sin(a), 0], [Math.cos(a + 0.25), Math.sin(a + 0.25), 0], p.c.violet, { width: 3, head: 9 });
  }, [k, sk, h, cam]);
  useOrbit(ref, setCam);
  return (
    <Widget title="مبرهنة ستوكس: سطوح كثيرة، حد واحد" hint="**كل هذه السطوح حدها دائرة الوحدة $C$** (البنفسجية). مبرهنة ستوكس: $\oint_C\mathbf F\cdot d\mathbf R = \iint_S(\operatorname{curl}\mathbf F)\cdot\mathbf n\,dS$. **غيّر السطح بالمنزلق $h$**: انفخه أو اقلبه أو سطّحه ($h = 0$ هو القرص، وتصير المبرهنة مبرهنة غرين). الأسهم الحمراء $\operatorname{curl}\mathbf F$. اسحب الرسم لتديره.">
      <Choice value={k} onChange={setK} options={Object.keys(fields).map((v) => ({ v, label: fields[v].label }))} />
      <Choice value={sk} onChange={setSk} options={(Object.keys(shapes) as Sk[]).map((v) => ({ v, label: shapes[v].label }))} />
      <Canvas refEl={ref} ratio={0.8} label="سطح حده دائرة الوحدة، والدوران عليه" />
      <div className="controls">
        <Slider label="الانتفاخ $h$" value={h} min={-1.2} max={1.6} step={0.01} onChange={setH} show={(v) => fmt(v, 2)} />
      </div>
      <Readout items={[
        { label: '$\\oint_C\\mathbf F\\cdot d\\mathbf R$', value: fmt(circ, 4), color: 'var(--violet)' },
        { label: '$\\iint_S\\operatorname{curl}\\mathbf F\\cdot\\mathbf n\\,dS$', value: fmt(flux, 4), color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{`**الحد وحده يحدد الجواب:** ${fd.line}. **التكامل السطحي لا يتغير مهما شكّلت السطح**، لأن $\\operatorname{div}\\operatorname{curl}\\mathbf F = 0$: لا شيء ينبع بين سطحين لهما الحد نفسه (التمرين 15). ` + (k === 'A' ? '$\\operatorname{curl}\\mathbf F = (1, 1, 1)$ ثابت، **ويعبر القرص بمركبته $\\mathbf k$ وحدها**: $1\\cdot\\pi$.' : k === 'S' ? '$\\operatorname{curl}\\mathbf S = 2\\mathbf k$، وعبر القرص $2\\cdot\\pi$.' : '')}</MathText>
    </Widget>
  );
}
