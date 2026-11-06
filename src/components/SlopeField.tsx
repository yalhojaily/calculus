import { useEffect, useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

interface Eq { label: string; f: (t: number, y: number) => number; sol?: (t: number, y0: number) => number; view: View; y0: number; yr: [number, number]; note: string }
const eqs: Record<string, Eq> = {
  x: { label: "$y' = t$", f: (t) => t, sol: (t, y0) => y0 + t * t / 2, view: { xMin: -3, xMax: 3, yMin: -3, yMax: 4 }, y0: 0, yr: [-3, 3], note: 'الأسهم تزداد ميلاً كلما كبر $t$، والحلول $\\tfrac12 t^2 + C$ **قطوع مكافئة متوازية**: كل حل هو السابق مزاحاً للأعلى.' },
  y: { label: "$y' = y$", f: (_t, y) => y, sol: (t, y0) => y0 * Math.exp(t), view: { xMin: -3, xMax: 2.2, yMin: -3, yMax: 4 }, y0: 0.5, yr: [-2, 2], note: 'الأسهم تزداد ميلاً كلما كبر $y$. الحلول $y_0 e^t$: **الارتفاعات تبقى متناسبة**. وكلها تذهب إلى الصفر حين $t \\to -\\infty$.' },
  decay: { label: "$y' = -y$", f: (_t, y) => -y, sol: (t, y0) => y0 * Math.exp(-t), view: { xMin: -1, xMax: 4, yMin: -3, yMax: 4 }, y0: 3, yr: [-3, 3.8], note: 'اضمحلال: $y_0 e^{-t}$. **كل الحلول تذهب إلى الصفر**، والصفر حل ثابت.' },
  src: { label: "$y' = -y + 5$", f: (_t, y) => -y + 5, sol: (t, y0) => 5 + (y0 - 5) * Math.exp(-t), view: { xMin: -0.5, xMax: 5, yMin: -1, yMax: 9 }, y0: 0, yr: [-0.5, 8.5], note: 'المثال 5: $y = 5 + (y_0 - 5)e^{-t}$. الجزء $y_0 e^{-t}$ **عابر** يختفي، ويبقى **الحالة المستقرة** $y_\\infty = 5$ حيث يوازن المصدر الاضمحلال.' },
  logi: { label: "$y' = y - y^2$", f: (_t, y) => y - y * y, sol: (t, y0) => 1 / (1 + (1 / y0 - 1) * Math.exp(-t)), view: { xMin: -4, xMax: 6, yMin: -0.4, yMax: 1.6 }, y0: 0.05, yr: [0.01, 1.5], note: 'المعادلة اللوجستية: **منحنى S** يبدأ أسّياً، ثم تبطئه المنافسة $-y^2$، ويستقر عند $y = 1$. الانقلاب في منتصف الطريق، $y = \\tfrac12$.' },
  sq: { label: "$y' = y^2$", f: (_t, y) => y * y, sol: (t, y0) => y0 / (1 - y0 * t), view: { xMin: -2, xMax: 3, yMin: -1, yMax: 6 }, y0: 0.5, yr: [0.1, 2], note: 'المثال 1: $y = \\dfrac{y_0}{1 - y_0 t}$ **ينفجر** عند $t = 1/y_0$. لو دفع البنك فائدة على مربع رصيدك، لامتلكت قريباً كل مال العالم.' },
};

/** 6.3 / 6.5 — حقل الميول: المعادلة التفاضلية تعطي سهماً عند كل نقطة، والحل منحنى يبقى مماساً للأسهم. */
export default function SlopeField({ initial = 'y' }: { initial?: keyof typeof eqs }) {
  const [k, setK] = useState<string>(initial);
  const E = eqs[k];
  const [y0, setY0] = useState(E.y0);
  const clock = useClock(6, { loop: true });
  const t0 = 0;
  const tEnd = E.view.xMax;
  const tNow = t0 + (tEnd - t0) * clock.t;
  useEffect(() => { clock.reset(); }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  const V = E.view;
  const ref = usePlot(V, (p) => {
    p.axes({ xLabel: 't', yLabel: 'y' });
    const nx = 21, ny = 15, dx = (V.xMax - V.xMin) / nx, dy = (V.yMax - V.yMin) / ny;
    const sx = p.X(1) - p.X(0), sy = p.Y(0) - p.Y(1);
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
      const t = V.xMin + i * dx, y = V.yMin + j * dy, m = E.f(t, y);
      const L = Math.min(sx * dx, sy * dy) * 0.38; const ang = Math.atan2(m * sy, sx);
      const ux = (Math.cos(ang) * L) / sx, uy = (Math.sin(ang) * L) / sy;
      p.line(t - ux, y - uy, t + ux, y + uy, p.c['ink-3'], { width: 1.2 });
    }
    if (E.sol) {
      // عائلة حلول باهتة
      for (const c of [-2, -1, -0.5, 0.5, 1, 2, 3]) {
        const yy = k === 'logi' ? Math.max(0.01, Math.min(1.5, 0.5 + c * 0.2)) : k === 'sq' ? Math.max(0.1, 0.4 + c * 0.25) : c;
        p.fn((t) => (k === 'sq' && t >= 1 / yy ? NaN : E.sol!(t, yy)), p.c.f1, { width: 1, dash: [3, 4] });
      }
      p.fn((t) => { const v = E.sol!(t, y0); return Number.isFinite(v) && Math.abs(v) < 1e3 && !(k === 'sq' && t >= 1 / y0) ? v : NaN; }, p.c.f2, { width: 3 });
      const yn = E.sol(tNow, y0);
      if (clock.t > 0 && Number.isFinite(yn) && !(k === 'sq' && tNow >= 1 / y0)) { p.point(tNow, yn, p.c.red, 6); p.lineThrough(tNow, yn, E.f(tNow, yn), p.c.red, { width: 1.4, dash: [4, 3] }); }
    }
    p.point(0, y0, p.c.f2, 6);
  }, [k, y0, tNow]);
  const yn = E.sol ? E.sol(tNow, y0) : NaN;
  return (
    <Widget title="حقل الميول" hint="المعادلة التفاضلية تعطي **ميلاً عند كل نقطة** $(t, y)$: هذه الأسهم الرمادية. الحل منحنى يبقى مماساً للأسهم في كل مكان. اختر نقطة البداية $y_0$ (عند $t = 0$)، وشغّل لترى نقطة تسير مع الأسهم.">
      <Choice value={k} onChange={(v) => { setK(v); setY0(eqs[v].y0); }} options={Object.entries(eqs).map(([v, e]) => ({ v, label: e.label }))} />
      <Canvas refEl={ref} ratio={0.62} label="حقل الميول ومنحنى الحل" />
      <AnimControls clock={clock} label="سِر مع الأسهم" />
      <div className="controls">
        <Slider label="$y_0$" value={y0} min={E.yr[0]} max={E.yr[1]} step={0.01} onChange={setY0} show={(v) => fmt(v, 2)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: '$t$', value: fmt(tNow, 2) },
        { label: '$y(t)$', value: Number.isFinite(yn) && Math.abs(yn) < 1e6 ? fmt(yn, 4) : '∞', color: 'var(--f2)' },
        { label: "الميل $y'$", value: Number.isFinite(yn) && Math.abs(yn) < 1e6 ? fmt(E.f(tNow, yn), 4) : '∞', color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{E.note}</MathText>
    </Widget>
  );
}
