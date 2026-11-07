import { useCallback, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { type Cam, type V3, cross, dot, draw3, len, mul, useOrbit } from '../lib/three';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 11.2 — المستوى ax + by + cz = d: المتجه العمودي N = (a, b, c) يُقرأ من المعاملات، وأقرب نقطة إلى الأصل tN مع t = d/|N|². */
export default function PlaneNormal() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(2);
  const [d, setD] = useState(5);
  const [cam, setCam0] = useState<Cam>({ az: 0.7, el: 0.42 });
  const setCam = useCallback((f: (c: Cam) => Cam) => setCam0(f), []);
  const N: V3 = [a, b, c];
  const n2 = dot(N, N);
  const ok = n2 > 1e-9;
  const t = ok ? d / n2 : 0;
  const P = mul(t, N);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -3.6, 3.6, -2.8, 3.6);
    const g = draw3(p, cam);
    g.floor(3, 1); g.axes(3.2);
    if (!ok) return;
    // رقعة مربعة من المستوى حول P، بضلعين عموديين على N
    const e = Math.abs(a) < 0.9 * Math.sqrt(n2) ? [1, 0, 0] as V3 : [0, 1, 0] as V3;
    let u = cross(N, e); u = mul(1 / len(u), u);
    let v = cross(N, u); v = mul(1 / len(v), v);
    const S = 1.7, corner = (s1: number, s2: number): V3 => [P[0] + S * (s1 * u[0] + s2 * v[0]), P[1] + S * (s1 * u[1] + s2 * v[1]), P[2] + S * (s1 * u[2] + s2 * v[2])];
    g.poly([corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], p.c.f1, 0.2);
    for (let i = -2; i <= 2; i++) { g.line(corner(i / 2, -1), corner(i / 2, 1), p.c.f1, { width: 0.7 }); g.line(corner(-1, i / 2), corner(1, i / 2), p.c.f1, { width: 0.7 }); }
    g.line([0, 0, 0], P, p.c.red, { width: 2, dash: [5, 4] });
    g.point([0, 0, 0], p.c.ink, 4);
    const Nn = mul(1.3 / Math.sqrt(n2), N);
    g.arrow(P, [P[0] + Nn[0], P[1] + Nn[1], P[2] + Nn[2]], p.c.f2, { width: 3 });
    g.point(P, p.c.red, 6);
    g.text('N', [P[0] + Nn[0], P[1] + Nn[1], P[2] + Nn[2]], p.c.f2, { dx: 6 });
    g.text('P', P, p.c.red, { dx: 6, dy: 12 });
  }, [a, b, c, d, cam]);
  useOrbit(ref, setCam);
  return (
    <Widget title="المستوى ومتجهه العمودي" hint="المستوى يحدده **متجه عمودي** $\mathbf N = (a, b, c)$ ونقطة واحدة. كل متجه داخل المستوى ضربه النقطي مع $\mathbf N$ صفر، فالمعادلة $ax + by + cz = d$. **تقرأ $\mathbf N$ من المعاملات مباشرة.** تغيير $d$ يعطي مستوى موازياً. اسحب الرسم أفقياً لتدير المشهد.">
      <Canvas refEl={ref} ratio={0.75} label="مستوى ثلاثي الأبعاد ومتجهه العمودي وأقرب نقطة إلى الأصل" />
      <div className="controls">
        <Slider label="$a$" value={a} min={-3} max={3} step={0.5} onChange={setA} color="var(--f2)" />
        <Slider label="$b$" value={b} min={-3} max={3} step={0.5} onChange={setB} color="var(--f2)" />
        <Slider label="$c$" value={c} min={-3} max={3} step={0.5} onChange={setC} color="var(--f2)" />
        <Slider label="$d$" value={d} min={-8} max={8} step={0.5} onChange={setD} />
      </div>
      <Readout items={[
        { label: 'المستوى', value: `${fmt(a, 1)}x + ${fmt(b, 1)}y + ${fmt(c, 1)}z = ${fmt(d, 1)}`.replace(/\+ -/g, '− ') },
        { label: 'أقرب نقطة $t\\mathbf N$', value: ok ? `(${fmt(P[0], 3)}, ${fmt(P[1], 3)}, ${fmt(P[2], 3)})` : '—', color: 'var(--red)' },
        { label: 'البعد $|d|/|\\mathbf N|$', value: ok ? fmt(Math.abs(d) / Math.sqrt(n2), 4) : '—', color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{'المثال 8: أقرب نقطة على $x + 2y + 2z = 5$ إلى الأصل. **الطريق الأقصر يسير على $\\mathbf N$**، فالنقطة $t\\mathbf N = (t, 2t, 2t)$، وتقع على المستوى إذا $t + 4t + 4t = 5$، أي $t = \\tfrac59$. البعد $\\tfrac59|\\mathbf N| = \\tfrac53$. **11E:** عموماً $t = d/(a^2 + b^2 + c^2)$ والبعد $|d|/\\sqrt{a^2 + b^2 + c^2}$.'}</MathText>
    </Widget>
  );
}
