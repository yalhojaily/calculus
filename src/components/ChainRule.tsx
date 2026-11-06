import { useEffect, useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

interface Chain {
  label: string; g: (x: number) => number; dg: (x: number) => number; f: (y: number) => number; df: (y: number) => number;
  xr: [number, number]; gv: View; fv: View; zv: View; note: string;
}

const sq = (x: number) => x * x;
const chains: Record<string, Chain> = {
  sinx2: {
    label: '$\\sin(x^2)$', g: sq, dg: (x) => 2 * x, f: Math.sin, df: Math.cos, xr: [-2.6, 2.6],
    gv: { xMin: -2.8, xMax: 2.8, yMin: -0.5, yMax: 7.2 }, fv: { xMin: -0.5, xMax: 7.2, yMin: -1.4, yMax: 1.4 }, zv: { xMin: -2.8, xMax: 2.8, yMin: -1.4, yMax: 1.4 },
    note: 'المشتقة $\\cos(x^2) \\cdot 2x$: جيب التمام يُحسب عند $y = x^2$ **لا** عند $x$. والرسم «إشارة FM»: القمم تتزاحم كلما ابتعدت عن الصفر.',
  },
  sin2x: {
    label: '$(\\sin x)^2$', g: Math.sin, dg: Math.cos, f: sq, df: (y) => 2 * y, xr: [-3.1, 3.1],
    gv: { xMin: -3.3, xMax: 3.3, yMin: -1.4, yMax: 1.4 }, fv: { xMin: -1.3, xMax: 1.3, yMin: -0.2, yMax: 1.5 }, zv: { xMin: -3.3, xMax: 3.3, yMin: -0.3, yMax: 1.3 },
    note: 'الترتيب معكوس: الجيب في الداخل والتربيع في الخارج. المشتقة $2y \\cdot \\cos x = 2\\sin x \\cos x$، لا $2x\\cos x$.',
  },
  sin3x: {
    label: '$\\sin 3x$', g: (x) => 3 * x, dg: () => 3, f: Math.sin, df: Math.cos, xr: [-2, 2],
    gv: { xMin: -2.2, xMax: 2.2, yMin: -6.6, yMax: 6.6 }, fv: { xMin: -6.6, xMax: 6.6, yMin: -1.4, yMax: 1.4 }, zv: { xMin: -2.2, xMax: 2.2, yMin: -1.4, yMax: 1.4 },
    note: 'المثال 4: $\\cos 3x \\cdot 3$. الموجة أسرع بثلاث مرات، فالسرعة فيها العامل 3 من الداخل.',
  },
  power: {
    label: '$(x^3 + 1)^5$', g: (x) => x ** 3 + 1, dg: (x) => 3 * x * x, f: (y) => y ** 5, df: (y) => 5 * y ** 4, xr: [-1.25, 0.6],
    gv: { xMin: -1.4, xMax: 0.8, yMin: -1.2, yMax: 1.8 }, fv: { xMin: -1.2, xMax: 1.6, yMin: -2.5, yMax: 8 }, zv: { xMin: -1.4, xMax: 0.8, yMin: -2.5, yMax: 8 },
    note: 'قاعدة القوة هي قاعدة السلسلة: $5(x^3 + 1)^4$ **مضروبة في** $3x^2$. العامل الأخير يسهل نسيانه.',
  },
};

/** 4.1 — قاعدة السلسلة: Δx يحرّك y، و Δy يحرّك z. الميلان يُضربان. */
export default function ChainRule() {
  const [k, setK] = useState('sinx2');
  const C = chains[k];
  const [x, setX] = useState(1);
  const [dx, setDx] = useState(0.3);
  const clock = useClock(12, { loop: true });
  useEffect(() => {
    if (clock.playing) setX(C.xr[0] + (C.xr[1] - C.xr[0]) * (0.5 - 0.5 * Math.cos(2 * Math.PI * clock.t)));
  }, [clock.t, clock.playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const y = C.g(x), y2 = C.g(x + dx);
  const z = C.f(y), z2 = C.f(y2);
  const gp = C.dg(x), fp = C.df(y);

  const left = usePlot(C.gv, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'y' });
    p.fn(C.g, p.c.f1, { width: 3 });
    p.lineThrough(x, y, gp, p.c.f1, { width: 1, dash: [4, 4] });
    p.line(x, y, x + dx, y, p.c['ink-3'], { width: 1.5 });
    p.line(x + dx, y, x + dx, y2, p.c.violet, { width: 3 });
    p.point(x, y, p.c.f1, 5);
    p.point(x + dx, y2, p.c.f1, 4);
  }, [k, x, dx]);

  const right = usePlot(C.fv, (p) => {
    p.axes({ xLabel: 'y', yLabel: 'z' });
    p.fn(C.f, p.c.f2, { width: 3 });
    p.lineThrough(y, z, fp, p.c.f2, { width: 1, dash: [4, 4] });
    p.line(y, z, y2, z, p.c.violet, { width: 3 });
    p.line(y2, z, y2, z2, p.c.area, { width: 3 });
    p.point(y, z, p.c.f2, 5);
    p.point(y2, z2, p.c.f2, 4);
  }, [k, x, dx]);

  const comp = usePlot(C.zv, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'z' });
    p.fn((t) => C.f(C.g(t)), p.c.ink, { width: 2.6 });
    p.lineThrough(x, z, fp * gp, p.c.red, { width: 1.6, dash: [6, 4] });
    p.point(x, z, p.c.red, 6);
  }, [k, x]);

  const ry = (y2 - y) / dx, rz = Math.abs(y2 - y) < 1e-12 ? NaN : (z2 - z) / (y2 - y);
  return (
    <Widget title="قاعدة السلسلة: أحجار الدومينو" hint="يسار: الدالة **الداخلية** $y = g(x)$. التغيّر $\Delta x$ ينتج $\Delta y$ (البنفسجي). يمين: الدالة **الخارجية** $z = f(y)$، ومحورها الأفقي **هو** $y$. البنفسجي نفسه صار مُدخلاً وأنتج $\Delta z$ (الأخضر). صغّر $\Delta x$: النسبتان تقتربان من الميلين، وحاصل ضربهما ميل المنحنى المركّب في الأسفل.">
      <Choice value={k} onChange={(v) => { setK(v); setX(Math.min(chains[v].xr[1], Math.max(chains[v].xr[0], 0.8))); }} options={Object.entries(chains).map(([v, c]) => ({ v, label: c.label }))} />
      <div className="cv-row">
        <div><Canvas refEl={left} ratio={0.8} label="الدالة الداخلية" /><div className="cv-cap f1">الداخلية <i>y = g(x)</i></div></div>
        <div><Canvas refEl={right} ratio={0.8} label="الدالة الخارجية" /><div className="cv-cap f2">الخارجية <i>z = f(y)</i></div></div>
      </div>
      <Canvas refEl={comp} ratio={0.38} label="الدالة المركّبة ومماسها" />
      <div className="cv-cap">المركّبة <i>z = f(g(x))</i>، والمماس الأحمر ميله <i>f′(y) · g′(x)</i></div>
      <AnimControls clock={clock} label="حرّك x" />
      <div className="controls">
        <Slider label="$x$" value={x} min={C.xr[0]} max={C.xr[1]} step={0.005} onChange={setX} show={(v) => fmt(v, 3)} color="var(--f1)" />
        <Slider label="$\Delta x$" value={dx} min={0.002} max={0.6} step={0.002} onChange={setDx} show={(v) => fmt(v, 3)} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: '$\\Delta y / \\Delta x$', value: fmt(ry, 4), color: 'var(--f1)' },
        { label: '$\\Delta z / \\Delta y$', value: Number.isFinite(rz) ? fmt(rz, 4) : '—', color: 'var(--f2)' },
        { label: '$\\Delta z / \\Delta x$', value: fmt((z2 - z) / dx, 4) },
        { label: "$f'(y)\\,g'(x)$", value: fmt(fp * gp, 4), color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{C.note}</MathText>
    </Widget>
  );
}
