import { useEffect, useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

interface Fn { label: string; v: (x: number) => number; f: (x: number) => number; a: number; b: number; vv: View; fv: View; note: string }
const step = (x: number) => (x < 1 ? 0.5 : 1.5);
const fns: Record<string, Fn> = {
  down: { label: '$v = 4 - x$', v: (x) => 4 - x, f: (x) => 4 * x - x * x / 2, a: 0, b: 6, vv: { xMin: -0.3, xMax: 6.3, yMin: -2.4, yMax: 4.4 }, fv: { xMin: -0.3, xMax: 6.3, yMin: -0.5, yMax: 9 }, note: 'المثال 3: $f(x) = 4x - \\tfrac12 x^2$. الرسم $f$ **ينحني للأسفل** لأن $v$ تتناقص، ويتسطّح حين تلمس $v$ الصفر عند $x = 4$: لا مساحة جديدة تُضاف. بعدها $v \\lt 0$ فالمساحة تُطرح.' },
  sqrt: { label: '$v = \\sqrt{x}$', v: Math.sqrt, f: (x) => (2 / 3) * x ** 1.5, a: 0, b: 4, vv: { xMin: -0.2, xMax: 4.3, yMin: -0.2, yMax: 2.3 }, fv: { xMin: -0.2, xMax: 4.3, yMin: -0.3, yMax: 5.8 }, note: 'دخل الشركة: $f(x) = \\tfrac23 x^{3/2}$، وعند $x = 4$ يساوي $\\tfrac{16}{3} = 5\\tfrac13$ مليون. **الجذر يغطي ثلثَي المستطيل** الذي يجلس فيه.' },
  cos: { label: '$v = \\cos x$', v: Math.cos, f: Math.sin, a: 0, b: 2 * Math.PI, vv: { xMin: -0.3, xMax: 6.6, yMin: -1.3, yMax: 1.3 }, fv: { xMin: -0.3, xMax: 6.6, yMin: -1.3, yMax: 1.3 }, note: 'تكامل جيب التمام هو الجيب. حيث $v$ موجبة تصعد $f$، وحيث سالبة تنزل. **قمة $f$ حيث $v = 0$.**' },
  step: { label: 'دالة درجية', v: step, f: (x) => (x < 1 ? 0.5 * x : 0.5 + 1.5 * (x - 1)), a: 0, b: 3, vv: { xMin: -0.2, xMax: 3.2, yMin: -0.2, yMax: 1.9 }, fv: { xMin: -0.2, xMax: 3.2, yMin: -0.2, yMax: 3.8 }, note: 'لماذا تشترط المبرهنة أن تكون $v$ **متصلة**؟ عند القفزة يكون لـ $f$ **زاوية**: الميل من اليسار $\\tfrac12$ ومن اليمين $\\tfrac32$، فلا مشتقة هناك.' },
};

/** 5.2 / 5.7 — دالة المساحة: f(x) مساحة تحت v حتى x، وميلها ارتفاع v عند x. */
export default function AreaFunction() {
  const [k, setK] = useState('down');
  const F = fns[k];
  const [x, setX] = useState(2.5);
  const [dx, setDx] = useState(0.3);
  const clock = useClock(8, { loop: true });
  useEffect(() => { if (clock.playing) setX(F.a + (F.b - F.a) * clock.t); }, [clock.t, clock.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  const xx = Math.min(Math.max(x, F.a), F.b);
  const top = usePlot(F.vv, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'v' });
    p.fillUnder(F.v, F.a, xx, p.c.area, 0.3);
    const x2 = Math.min(xx + dx, F.b);
    p.fillUnder(F.v, xx, x2, p.c.f2, 0.55);
    p.fn(F.v, p.c.ink, { width: 2.6, from: F.a, to: F.b });
    p.line(xx, 0, xx, F.v(xx), p.c.f2, { width: 2.4 });
    p.point(xx, F.v(xx), p.c.f2, 5);
  }, [k, xx, dx]);
  const bot = usePlot(F.fv, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'f' });
    p.fn(F.f, p.c.f1, { width: 1.4, dash: [3, 4], from: F.a, to: F.b });
    p.fn(F.f, p.c.f1, { width: 3, from: F.a, to: xx });
    if (k !== 'step' || Math.abs(xx - 1) > 1e-3) p.lineThrough(xx, F.f(xx), F.v(xx), p.c.f2, { width: 1.6, dash: [6, 4] });
    p.point(xx, F.f(xx), p.c.f1, 6);
  }, [k, xx]);
  const x2 = Math.min(xx + dx, F.b), df = F.f(x2) - F.f(xx);
  return (
    <Widget title="دالة المساحة وميلها" hint="أعلى: المساحة تحت $v$ من البداية حتى $x$ (الأخضر)، وهي $f(x)$. أسفل: رسم $f$ يُبنى وأنت تتحرك. الشريط البرتقالي $\Delta f$ عرضه $\Delta x$ وارتفاعه تقريباً $v(x)$، **فميل $f$ هو ارتفاع $v$**: هذه المبرهنة الأساسية.">
      <Choice value={k} onChange={(v) => { setK(v); setX((fns[v].a + fns[v].b) / 2); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={top} ratio={0.42} label="المساحة تحت v" />
      <Canvas refEl={bot} ratio={0.42} label="دالة المساحة f" />
      <AnimControls clock={clock} label="امسح المساحة" />
      <div className="controls">
        <Slider label="$x$" value={xx} min={F.a} max={F.b} step={0.005} onChange={setX} show={(v) => fmt(v, 2)} color="var(--f2)" />
        <Slider label="$\Delta x$" value={dx} min={0.01} max={0.8} step={0.01} onChange={setDx} show={(v) => fmt(v, 2)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: '$f(x)$ (المساحة)', value: fmt(F.f(xx), 4), color: 'var(--f1)' },
        { label: '$\\Delta f / \\Delta x$', value: fmt(df / (x2 - xx || 1), 4), color: 'var(--f2)' },
        { label: '$v(x)$', value: fmt(F.v(xx), 4) },
      ]} />
      <MathText as="div" className="verdict">{F.note}</MathText>
    </Widget>
  );
}
