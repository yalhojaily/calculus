import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 3.2 — المثال 7: أين تدخل الطريق السريع؟ سرعة 30 حتى الطريق ثم 60 عليه. */
export default function Expressway() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(6);
  const [x, setX] = useState(1);
  const T = (s: number) => Math.sqrt(a * a + s * s) / 30 + (b - s) / 60;
  const xs = a / Math.sqrt(3);
  const best = xs <= b ? Math.min(T(xs), T(b)) : T(b);
  const bestX = xs <= b && T(xs) <= T(b) ? xs : b;

  const map = usePlot({ xMin: -0.6, xMax: b + 0.8, yMin: -0.6, yMax: a + 0.8 }, (p) => {
    p.pad = { l: 10, r: 10, t: 10, b: 18 };
    p.line(-0.6, 0, b + 0.8, 0, p.c.ink, { width: 5 });
    p.line(0, a, x, 0, p.c.f2, { width: 3 });
    p.line(x, 0, b, 0, p.c.f1, { width: 6 });
    p.line(0, a, xs, 0, p.c.area, { width: 1.4, dash: [4, 4] });
    p.point(0, a, p.c.ink, 7);
    p.point(b, 0, p.c.red, 8);
    p.point(x, 0, p.c.f2, 6);
    p.text('home', 0, a, p.c.ink, { dx: 10, base: 'middle', italic: false });
    p.text('MIT', b, 0, p.c.red, { align: 'center', base: 'bottom', dy: -10, italic: false });
    p.text('speed 30', x / 2, a / 2, p.c.f2, { dx: 8 });
    p.text('speed 60', (x + b) / 2, 0, p.c.f1, { align: 'center', base: 'top', dy: 6 });
  }, [a, b, x]);

  const tmin = Math.min(T(0), T(b), T(xs)) * 0.95, tmax = Math.max(T(0), T(b)) * 1.05;
  const g = usePlot({ xMin: -0.2, xMax: b + 0.2, yMin: tmin, yMax: tmax }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'time (h)' });
    p.fn(T, p.c.f1, { width: 3, from: 0, to: b });
    if (xs <= b) p.point(xs, T(xs), p.c.area, 6);
    p.point(x, T(x), p.c.f2, 6);
  }, [a, b, x]);

  return (
    <Widget title="أين تدخل الطريق السريع؟" hint="تقود بسرعة $30$ من البيت إلى الطريق السريع (مسافة $\sqrt{a^2 + x^2}$)، ثم بسرعة $60$ عليه (مسافة $b - x$). نقطة السكون $x^* = a/\sqrt3$ **لا تعتمد** على $b$، وهذا تحذير من Strang بأن نفحص الطرفين أيضاً. إذا كانت $b$ صغيرة أو $a$ كبيرة، فالأفضل أن تقود مباشرة إلى MIT ($x = b$).">
      <div className="cv-row">
        <div><Canvas refEl={map} ratio={0.7} label="خريطة الطريق" /><div className="cv-cap">المسار</div></div>
        <div><Canvas refEl={g} ratio={0.7} label="زمن الرحلة بحسب نقطة الدخول" /><div className="cv-cap f1">الزمن الكلي <i>f(x)</i></div></div>
      </div>
      <div className="controls">
        <Slider label="نقطة الدخول $x$" value={x} min={0} max={b} step={0.01} onChange={setX} show={(v) => fmt(v)} color="var(--f2)" />
        <Slider label="البعد عن الطريق $a$" value={a} min={0.5} max={8} step={0.1} onChange={(v) => { setA(v); }} show={(v) => fmt(v)} />
        <Slider label="الطول حتى MIT $b$" value={b} min={1} max={10} step={0.1} onChange={(v) => { setB(v); setX(Math.min(x, v)); }} show={(v) => fmt(v)} />
      </div>
      <Readout items={[
        { label: 'زمنك (دقائق)', value: fmt(T(x) * 60, 2), color: 'var(--f2)' },
        { label: 'نقطة السكون $a/\\sqrt3$', value: xs <= b ? fmt(xs, 3) : 'بعد MIT', color: 'var(--area)' },
        { label: 'الأفضل', value: `x = ${fmt(bestX, 3)} · ${fmt(best * 60, 2)} min` },
      ]} />
    </Widget>
  );
}
