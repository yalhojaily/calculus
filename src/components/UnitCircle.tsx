import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

const D = Math.PI / 180;
const nice = (v: number) => (Math.abs(v) > 1e6 ? '∞' : fmt(v, 3));

/** 1.5 — الدوال المثلثية الست على دائرة الوحدة، لكل زاوية حتى بعد 90° و 180°. */
export default function UnitCircle() {
  const [deg, setDeg] = useState(120);
  const [unit, setUnit] = useState<'deg' | 'rad'>('deg');
  const th = deg * D;
  const x = Math.cos(th), y = Math.sin(th);
  const S = 1.45;
  const cRef = usePlot({ xMin: -S, xMax: S, yMin: -S, yMax: S }, (p) => {
    p.pad = { l: 8, r: 8, t: 8, b: 8 };
    const { c } = p;
    p.line(-S, 0, S, 0, c['ink-3'], { width: 1 });
    p.line(0, -S, 0, S, c['ink-3'], { width: 1 });
    p.curve(Math.cos, Math.sin, 0, 2 * Math.PI, c['ink-2'], { width: 1.6 });
    p.curve((s) => 0.22 * Math.cos(s), (s) => 0.22 * Math.sin(s), 0, th, c.red, { width: 2 });
    p.line(0, 0, x, y, c.ink, { width: 2 });
    p.line(0, 0, x, 0, c.violet, { width: 3.2 });
    p.line(x, 0, x, y, c.f1, { width: 3.2 });
    p.text(`x = ${fmt(x, 2)}`, x / 2, 0, c.violet, { align: 'center', base: y >= 0 ? 'top' : 'bottom', dy: y >= 0 ? 4 : -4 });
    p.text(`y = ${fmt(y, 2)}`, x, y / 2, c.f1, { align: x >= 0 ? 'left' : 'right', base: 'middle', dx: x >= 0 ? 6 : -6 });
    p.point(x, y, c.f2, 7);
  }, [deg]);

  const gRef = usePlot({ xMin: -0.2, xMax: 2 * Math.PI + 0.2, yMin: -2.4, yMax: 2.4 }, (p) => {
    p.axes({ xLabel: 'θ', yLabel: '', xStep: Math.PI / 2 });
    p.fn(Math.tan, p.c.area, { width: 1.6, dash: [4, 4] });
    p.fn(Math.cos, p.c.violet, { width: 2.4 });
    p.fn(Math.sin, p.c.f1, { width: 2.4 });
    p.line(th, -2.4, th, 2.4, p.c['ink-3'], { width: 1, dash: [3, 4] });
    p.point(th, y, p.c.f1, 5);
    p.point(th, x, p.c.violet, 5);
    p.text('sin', 1.6, 1.0, p.c.f1, { base: 'bottom' });
    p.text('cos', 0.1, 1.0, p.c.violet, { base: 'bottom' });
    p.text('tan', 1.15, 2.2, p.c.area, { align: 'right' });
  }, [deg]);

  const ang = unit === 'deg' ? `${deg}°` : `${fmt(th, 3)} rad`;
  const quad = deg % 90 === 0 ? 'على محور' : `الربع ${['الأول', 'الثاني', 'الثالث', 'الرابع'][Math.floor((((deg % 360) + 360) % 360) / 90)]}`;
  return (
    <Widget title="الدوال الست على دائرة الوحدة" hint="على دائرة نصف قطرها $r = 1$: $\cos\theta = x$ و $\sin\theta = y$ و $\tan\theta = y/x$. المثلث لا يتسع لزاوية $240°$، أما الدائرة فتتسع لأي زاوية. والإشارات تأتي من موقع النقطة: في الربع الثاني $x$ سالب و $y$ موجب.">
      <Choice value={unit} onChange={setUnit} options={[{ v: 'deg', label: 'درجات' }, { v: 'rad', label: 'راديان' }]} />
      <div className="cv-row">
        <div><Canvas refEl={cRef} ratio={1} label="دائرة الوحدة" /><div className="cv-cap">{ang} · {quad}</div></div>
        <div><Canvas refEl={gRef} ratio={1} label="رسوم sin و cos و tan" /><div className="cv-cap"><span className="f1">sin</span> · <span className="vi">cos</span> · <span className="area">tan</span></div></div>
      </div>
      <div className="controls">
        <Slider label="الزاوية $\theta$" value={deg} min={-180} max={360} step={5} onChange={setDeg} show={() => ang} color="var(--red)" />
      </div>
      <Readout items={[
        { label: '$\\cos\\theta = x$', value: nice(x), color: 'var(--violet)' },
        { label: '$\\sin\\theta = y$', value: nice(y), color: 'var(--f1)' },
        { label: '$\\tan\\theta = y/x$', value: nice(y / x), color: 'var(--area)' },
        { label: '$\\sec\\theta = 1/x$', value: nice(1 / x) },
        { label: '$\\csc\\theta = 1/y$', value: nice(1 / y) },
        { label: '$\\cot\\theta = x/y$', value: nice(x / y) },
        { label: '$\\cos^2\\theta + \\sin^2\\theta$', value: fmt(x * x + y * y, 6) },
      ]} />
    </Widget>
  );
}
