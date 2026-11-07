import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

interface C { label: string; x: (t: number) => number; y: (t: number) => number; t0: number; t1: number; box: [number, number, number, number]; note: string }
const cs: Record<string, C> = {
  par: { label: '$y = \\tfrac12 x^2$', x: (t) => t, y: (t) => 0.5 * t * t, t0: -3, t1: 3, box: [-3.5, 3.5, -1, 4.5], note: 'المثال 2: $\\kappa = \\dfrac{y\'\'}{(1 + y\'^2)^{3/2}} = \\dfrac{1}{(1 + x^2)^{3/2}}$. **التقريب الشائع $\\kappa \\approx y\'\' = 1$ صحيح عند الرأس فقط.** بعيداً على القطع نقطع مسافة طويلة لتغير صغير في الاتجاه، فالانحناء يذهب إلى الصفر والدائرة تكبر.' },
  ell: { label: 'قطع ناقص $2\\cos t$، $\\sin t$', x: (t) => 2 * Math.cos(t), y: (t) => Math.sin(t), t0: 0, t1: 2 * Math.PI, box: [-3.6, 3.6, -2.5, 2.5], note: 'بالصيغة «القاسية لكن القيّمة» للمنحنى الوسيطي: $\\kappa = \\dfrac{|x\'y\'\' - y\'x\'\'|}{(x\'^2 + y\'^2)^{3/2}}$. **أكبر انحناء عند طرفي المحور الطويل** ($\\kappa = 2$، دائرة نصف قطرها $\\tfrac12$)، وأصغره عند طرفي القصير ($\\kappa = \\tfrac14$).' },
  sine: { label: '$y = \\sin x$', x: (t) => t, y: Math.sin, t0: -Math.PI, t1: Math.PI, box: [-3.8, 3.8, -2.4, 2.4], note: 'عند نقطة الانعطاف $x = 0$ يكون $y\'\' = 0$ **فالانحناء صفر** والدائرة تنفتح إلى خط مستقيم، ويقفز $\\mathbf N$ من جهة إلى أخرى. والانحناء أكبر عند القمة والقاع: $\\kappa = 1$.' },
  circ: { label: 'دائرة نصف قطرها 2', x: (t) => 2 * Math.cos(t), y: (t) => 2 * Math.sin(t), t0: 0, t1: 2 * Math.PI, box: [-3, 3, -2.6, 2.6], note: 'المثال 1: **$\\kappa = 1/\\text{نصف القطر}$** في كل مكان، والدائرة الملاصقة هي الدائرة نفسها. $\\mathbf N$ يشير إلى المركز. والسرعة لا تؤثر: $\\omega$ يُلغى.' },
};
const d1 = (f: (t: number) => number, t: number, h = 1e-4) => (f(t + h) - f(t - h)) / (2 * h);
const d2 = (f: (t: number) => number, t: number, h = 1e-3) => (f(t + h) - 2 * f(t) + f(t - h)) / (h * h);

/** 12.3 — الانحناء κ = |dT/ds| والمتجه العمودي N. الدائرة الملاصقة نصف قطرها 1/κ ومركزها على N. */
export default function Osculating() {
  const [k, setK] = useState('par');
  const C = cs[k];
  const clock = useClock(10, { loop: true });
  const t = C.t0 + (C.t1 - C.t0) * (0.5 + 0.5 * Math.sin(2 * Math.PI * clock.t - Math.PI / 2)) * (k === 'par' || k === 'sine' ? 1 : 0) + (k === 'par' || k === 'sine' ? 0 : (C.t1 - C.t0) * clock.t);
  const x1 = d1(C.x, t), y1 = d1(C.y, t), x2 = d2(C.x, t), y2 = d2(C.y, t);
  const sp = Math.hypot(x1, y1);
  const cr = x1 * y2 - y1 * x2;
  const kap = Math.abs(cr) / sp ** 3;
  const T: [number, number] = [x1 / sp, y1 / sp];
  const sg = cr >= 0 ? 1 : -1;
  const N: [number, number] = [-sg * T[1], sg * T[0]];
  const P: [number, number] = [C.x(t), C.y(t)];
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const [a, b, c, d] = C.box; fitEqual(p, a, b, c, d);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    p.curve(C.x, C.y, C.t0, C.t1, p.c.f1, { width: 3, n: 400 });
    if (kap > 1e-3) {
      const r = 1 / kap, cx = P[0] + r * N[0], cy = P[1] + r * N[1];
      const ctx = p.ctx; ctx.beginPath(); ctx.arc(p.X(cx), p.Y(cy), p.X(r) - p.X(0), 0, 2 * Math.PI); ctx.strokeStyle = p.c.area; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
      p.line(P[0], P[1], cx, cy, p.c.area, { width: 1 }); p.point(cx, cy, p.c.area, 3.5);
    }
    p.arrow(P[0], P[1], P[0] + T[0], P[1] + T[1], p.c.f2, { width: 2.6 });
    p.arrow(P[0], P[1], P[0] + N[0], P[1] + N[1], p.c.red, { width: 2.6 });
    p.text('T', P[0] + T[0], P[1] + T[1], p.c.f2, { dx: 5 }); p.text('N', P[0] + N[0], P[1] + N[1], p.c.red, { dx: 5 });
    p.point(P[0], P[1], p.c.ink, 5);
  }, [k, t]);
  return (
    <Widget title="الانحناء والدائرة الملاصقة" hint="اتجاه الحركة $\mathbf T = \mathbf v/|\mathbf v|$. **الانحناء $\kappa = |d\mathbf T/ds|$: كم يدور $\mathbf T$ لكل وحدة طول.** و $\mathbf N$ (الأحمر) متجه وحدة في اتجاه الدوران، عمودي على $\mathbf T$. الدائرة الملاصقة (الخضراء المتقطعة) نصف قطرها $1/\kappa$ ومركزها على $\mathbf N$: **أفضل دائرة تطابق المنحنى عند النقطة**.">
      <Choice value={k} onChange={(v) => { setK(v); clock.reset(); }} options={Object.keys(cs).map((v) => ({ v, label: cs[v].label }))} />
      <Canvas refEl={ref} ratio={0.62} label="منحنى ومتجها المماس والعمودي والدائرة الملاصقة" />
      <AnimControls clock={clock} label="حرّك النقطة" />
      <Readout items={[
        { label: 'النقطة', value: `(${fmt(P[0], 2)}, ${fmt(P[1], 2)})` },
        { label: '$\\kappa$', value: fmt(kap, 4), color: 'var(--red)' },
        { label: 'نصف قطر الانحناء $1/\\kappa$', value: kap > 1e-3 ? fmt(1 / kap, 3) : '∞', color: 'var(--area)' },
      ]} />
      <MathText as="div" className="verdict">{C.note}</MathText>
    </Widget>
  );
}
