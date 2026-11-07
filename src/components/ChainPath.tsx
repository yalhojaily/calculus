import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { contourMap } from '../lib/three';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

interface Pth { label: string; x: (t: number) => number; y: (t: number) => number; dx: (t: number) => number; dy: (t: number) => number; t1: number }
const paths: Record<string, Pth> = {
  circ: { label: 'دائرة $(\\cos t, \\sin t)$', x: Math.cos, y: Math.sin, dx: (t) => -Math.sin(t), dy: Math.cos, t1: 2 * Math.PI },
  line: { label: 'مستقيم $(t, 2t)$', x: (t) => t, y: (t) => 2 * t, dx: () => 1, dy: () => 2, t1: 1 },
  par: { label: 'قطع $(t^2, t)$', x: (t) => t * t, y: (t) => t, dx: (t) => 2 * t, dy: () => 1, t1: 1.4 },
};
const f = (x: number, y: number) => x * x + 3 * x * y;
const fx = (x: number, y: number) => 2 * x + 3 * y, fy = (x: number) => 3 * x;

/** 13.5 — قاعدة السلسلة: على مسار (x(t), y(t))، df/dt = fₓ dx/dt + f_y dy/dt = ∇f · v. */
export default function ChainPath() {
  const [k, setK] = useState('circ');
  const P = paths[k];
  const t0 = k === 'line' || k === 'par' ? -P.t1 : 0;
  const clock = useClock(8, { loop: true });
  const t = t0 + (P.t1 - t0) * clock.t;
  const x = P.x(t), y = P.y(t), vx = P.dx(t), vy = P.dy(t);
  const a = fx(x, y), b = fy(x);
  const dfdt = a * vx + b * vy;
  const map = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -2.3, 2.3, -2.3, 2.3);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    contourMap(p, f, [-4, -2, -1, -0.3, 0.3, 1, 2, 4, 6], [-2.3, 2.3], [-2.3, 2.3], { n: 90, width: 1.1 });
    p.curve(P.x, P.y, t0, P.t1, p.c.ink, { width: 2.4 });
    p.arrow(x, y, x + 0.4 * vx, y + 0.4 * vy, p.c.violet, { width: 2.6 });
    const g = Math.hypot(a, b) || 1; p.arrow(x, y, x + (0.6 * a) / g, y + (0.6 * b) / g, p.c.red, { width: 2.6 });
    p.point(x, y, p.c.ink, 6);
  }, [k, t]);
  const ft = usePlot({ xMin: t0, xMax: P.t1, yMin: -5, yMax: 7 }, (p) => {
    p.axes({ xLabel: 't', yLabel: 'f' });
    p.fn((s) => f(P.x(s), P.y(s)), p.c.f1, { width: 2.6 });
    p.lineThrough(t, f(x, y), dfdt, p.c.f2, { width: 1.6, dash: [5, 3] });
    p.point(t, f(x, y), p.c.f2, 5);
  }, [k, t]);
  return (
    <Widget title="قاعدة السلسلة على مسار" hint="$f = x^2 + 3xy$ على خريطة كنتورية، ونقطة تتحرك على مسار $(x(t), y(t))$. **قيمة $f$ على المسار دالة في $t$ وحده** (يمين). **13H:** $\dfrac{df}{dt} = \dfrac{\partial f}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial f}{\partial y}\dfrac{dy}{dt}$ = التدرّج (الأحمر) ضرب السرعة (البنفسجي) ضرباً نقطياً.">
      <Choice value={k} onChange={(v) => { setK(v); clock.reset(); }} options={Object.keys(paths).map((v) => ({ v, label: paths[v].label }))} />
      <div className="cv-row">
        <div><Canvas refEl={map} ratio={0.9} label="مسار على خريطة كنتورية" /><div className="cv-cap">المسار والتدرّج والسرعة</div></div>
        <div><Canvas refEl={ft} ratio={0.9} label="قيمة f على المسار" /><div className="cv-cap">f(x(t), y(t)) ومماسه</div></div>
      </div>
      <AnimControls clock={clock} label="سِر على المسار" />
      <Readout items={[
        { label: '$t$', value: fmt(t, 2) },
        { label: '$f_x\\,\\dfrac{dx}{dt}$', value: `${fmt(a, 2)} × ${fmt(vx, 2)} = ${fmt(a * vx, 3)}` },
        { label: '$f_y\\,\\dfrac{dy}{dt}$', value: `${fmt(b, 2)} × ${fmt(vy, 2)} = ${fmt(b * vy, 3)}` },
        { label: '$df/dt$', value: fmt(dfdt, 4), color: 'var(--f2)' },
      ]} />
      <MathText as="div" className="verdict">{'**حين يعبر المسار خط التساوي مماسياً** تكون السرعة عمودية على التدرّج، و $df/dt = 0$: قمة أو قاع للدالة على المسار. والتغيّر الكلي جمع أثرين: $\\Delta f \\approx f_x\\Delta x + f_y\\Delta y$، اقسم على $\\Delta t$. **مثال:** على المستقيم $(t, 2t)$ يكون $f = t^2 + 6t^2 = 7t^2$ و $df/dt = 14t$، وبالقاعدة $(2t + 6t)(1) + (3t)(2) = 14t$.'}</MathText>
    </Widget>
  );
}
