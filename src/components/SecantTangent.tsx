import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

/** 0.2 — الوتر يصبح مماساً: Δx يصغر، و Δy/Δx يقترب من nxⁿ⁻¹. */
export default function SecantTangent() {
  const [n, setN] = useState(2);
  const [x0, setX0] = useState(1);
  const clock = useClock(7);
  // Δx من 1.5 نزولاً إلى 0.01 (منحنى أسّي حتى يبطؤ قرب الصفر)
  const dx = 1.5 * Math.pow(0.01 / 1.5, clock.t);
  const f = (x: number) => x ** n;
  const exact = n * x0 ** (n - 1);
  const ratio = (f(x0 + dx) - f(x0)) / dx;
  const yMax = n === 1 ? 4 : n === 2 ? 7 : 10;
  const view = { xMin: -2.2, xMax: 2.8, yMin: n % 2 ? -5 : -1, yMax };

  const ref = usePlot(view, (p) => {
    p.axes();
    p.fn(f, p.c.f1, { width: 3 });
    p.lineThrough(x0, f(x0), exact, p.c.f2, { width: 1.6, dash: [2, 5] });
    p.lineThrough(x0, f(x0), ratio, p.c.f2, { width: 2.4 });
    // المثلث: Δx أفقياً و Δy رأسياً
    p.line(x0, f(x0), x0 + dx, f(x0), p.c.violet, { width: 2 });
    p.line(x0 + dx, f(x0), x0 + dx, f(x0 + dx), p.c.violet, { width: 2 });
    p.text('Δx', x0 + dx / 2, f(x0), p.c.violet, { align: 'center', base: 'top', dy: 4 });
    p.text('Δy', x0 + dx, (f(x0) + f(x0 + dx)) / 2, p.c.violet, { dx: 6, base: 'middle' });
    p.point(x0, f(x0), p.c.f1, 6);
    p.point(x0 + dx, f(x0 + dx), p.c.f2, 5);
  }, [n, x0, dx]);

  const rows = [1, 0.1, 0.01, 0.001].map((h) => ({ h, r: (f(x0 + h) - f(x0)) / h }));
  const formula: Record<number, string> = {
    1: '\\frac{\\Delta y}{\\Delta x} = 1',
    2: '\\frac{\\Delta y}{\\Delta x} = 2x + \\Delta x',
    3: '\\frac{\\Delta y}{\\Delta x} = 3x^2 + 3x\\,\\Delta x + (\\Delta x)^2',
    4: '\\frac{\\Delta y}{\\Delta x} = 4x^3 + 6x^2\\Delta x + \\cdots',
  };
  return (
    <Widget title="من الوتر إلى المماس" hint="الخط البرتقالي المتصل هو الوتر بين نقطتين. شغّل الحركة: النقطة الثانية تقترب، $\Delta x \to 0$، فيقترب الوتر من المماس (المنقّط). ميل المماس هو $\frac{dy}{dx}$.">
      <Choice value={n} onChange={(v) => { setN(v); clock.reset(); }} options={[1, 2, 3, 4].map((k) => ({ v: k, label: k === 1 ? '$y = x$' : `$y = x^${k}$` }))} />
      <Canvas refEl={ref} label="منحنى مع وتر ومماس" />
      <AnimControls clock={clock} label="قرّب النقطتين" />
      <div className="controls">
        <Slider label="النقطة $x$" value={x0} min={-1.5} max={1.8} step={0.05} onChange={setX0} show={(v) => fmt(v)} color="var(--f1)" />
      </div>
      <Readout
        items={[
          { label: '$\\Delta x$', value: fmt(dx, 3), color: 'var(--violet)' },
          { label: 'ميل الوتر $\\Delta y / \\Delta x$', value: fmt(ratio, 4), color: 'var(--f2)' },
          { label: `ميل المماس $${n === 1 ? '1' : `${n}x${n > 2 ? `^${n - 1}` : ''}`}$`, value: fmt(exact, 4), color: 'var(--f2)' },
        ]}
      />
      <MathText as="div" className="verdict">{`$${formula[n]} \\;\\longrightarrow\\; \\frac{dy}{dx} = ${n === 1 ? '1' : `${n}x${n > 2 ? `^${n - 1}` : ''}`}$`}</MathText>
      <table>
        <thead><tr><th>Δx</th>{rows.map((r) => <td key={r.h}>{r.h}</td>)}</tr></thead>
        <tbody><tr><th>Δy/Δx</th>{rows.map((r) => <td key={r.h}>{fmt(r.r, 4)}</td>)}</tr></tbody>
      </table>
    </Widget>
  );
}
