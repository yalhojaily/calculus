import { useState } from 'react';
import { fmt } from '../lib/plot';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

type Kind = 'ellipse' | 'hyperbola' | 'parabola';

/** 3.5 — القطوع الثلاثة ببؤرها: مجموع البعدين ثابت (ناقص)، فرقهما ثابت (زائد)، البعد إلى البؤرة = البعد إلى الدليل (مكافئ). */
export default function Conics() {
  const [kind, setKind] = useState<Kind>('ellipse');
  const [b, setB] = useState(2);
  const a = 3;
  const clock = useClock(10, { loop: true });
  const t = clock.t * 2 * Math.PI;
  let P: [number, number], F1: [number, number], F2: [number, number] | null, c: number;
  if (kind === 'ellipse') {
    c = Math.sqrt(Math.max(a * a - b * b, 0)); F1 = [c, 0]; F2 = [-c, 0]; P = [a * Math.cos(t), b * Math.sin(t)];
  } else if (kind === 'hyperbola') {
    c = Math.sqrt(a * a + b * b); F1 = [c, 0]; F2 = [-c, 0];
    const u = 1.6 * Math.sin(t); P = [a * Math.cosh(u) * (Math.cos(t) >= 0 ? 1 : -1), b * Math.sinh(u)];
  } else {
    const p4 = 1 / (4 * (b / 4)); // y = x²/(4p) مع p = b/4
    c = b / 4; F1 = [0, c]; F2 = null; const X = 3.2 * Math.sin(t); P = [X, X * X * p4 / 1];
  }
  const d1 = Math.hypot(P[0] - F1[0], P[1] - F1[1]);
  const d2 = F2 ? Math.hypot(P[0] - F2[0], P[1] - F2[1]) : P[1] + c; // للمكافئ: البعد إلى الدليل y = −p
  const view = kind === 'parabola' ? { xMin: -4.5, xMax: 4.5, yMin: -1.5, yMax: 6 } : { xMin: -6.5, xMax: 6.5, yMin: -4.5, yMax: 4.5 };

  const ref = usePlot(view, (p) => {
    p.axes();
    const C = p.c;
    if (kind === 'ellipse') p.curve((s) => a * Math.cos(s), (s) => b * Math.sin(s), 0, 2 * Math.PI, C.f1, { width: 3 });
    if (kind === 'hyperbola') {
      p.curve((s) => a * Math.cosh(s), (s) => b * Math.sinh(s), -2.2, 2.2, C.f1, { width: 3 });
      p.curve((s) => -a * Math.cosh(s), (s) => b * Math.sinh(s), -2.2, 2.2, C.f1, { width: 3 });
      p.lineThrough(0, 0, b / a, C['ink-3'], { width: 1, dash: [4, 4] });
      p.lineThrough(0, 0, -b / a, C['ink-3'], { width: 1, dash: [4, 4] });
    }
    if (kind === 'parabola') {
      p.fn((x) => x * x / (4 * c), C.f1, { width: 3 });
      p.line(view.xMin, -c, view.xMax, -c, C.violet, { width: 2, dash: [6, 4] });
      p.line(P[0], P[1], P[0], -c, C.f2, { width: 2 });
      p.text('directrix', view.xMax - 0.1, -c, C.violet, { align: 'right', base: 'top', dy: 3 });
    }
    p.line(P[0], P[1], F1[0], F1[1], C.area, { width: 2 });
    if (F2) p.line(P[0], P[1], F2[0], F2[1], C.f2, { width: 2 });
    p.point(F1[0], F1[1], C.red, 6);
    if (F2) p.point(F2[0], F2[1], C.red, 6);
    p.point(P[0], P[1], C.ink, 6);
  }, [kind, b, t]);

  const rule = kind === 'ellipse' ? { label: '$d_1 + d_2$ (ثابت $= 2a$)', value: fmt(d1 + d2, 3) } : kind === 'hyperbola' ? { label: '$|d_1 - d_2|$ (ثابت $= 2a$)', value: fmt(Math.abs(d1 - d2), 3) } : { label: 'البعد إلى البؤرة − البعد إلى الدليل', value: fmt(d1 - d2, 3) };
  return (
    <Widget title="القطوع الثلاثة وبؤرها" hint={kind === 'ellipse' ? 'القطع الناقص: **مجموع** البعدين إلى البؤرتين ثابت ويساوي $2a$. البؤرتان على المحور الأكبر، و $a^2 = b^2 + c^2$. والدائرة حالة خاصة $a = b$ فتلتقي البؤرتان في المركز. وكل شعاع يخرج من بؤرة ينعكس إلى الأخرى.' : kind === 'hyperbola' ? 'القطع الزائد: **فرق** البعدين إلى البؤرتين ثابت ويساوي $2a$، و $c^2 = a^2 + b^2$. والخطان المتقطعان خطا التقارب $y = \pm\tfrac{b}{a}x$.' : 'القطع المكافئ: البعد إلى **البؤرة** يساوي البعد إلى **الدليل** (الخط البنفسجي). وكل شعاع ينزل رأسياً ينعكس إلى البؤرة، ولهذا تُصنع أطباق الاستقبال ومركّزات الطاقة الشمسية مكافئة. البؤرة الثانية عند اللانهاية.'}>
      <Choice value={kind} onChange={setKind} options={[{ v: 'ellipse', label: 'ناقص' }, { v: 'parabola', label: 'مكافئ' }, { v: 'hyperbola', label: 'زائد' }]} />
      <Canvas refEl={ref} ratio={0.7} label="قطع مخروطي وبؤره" />
      <AnimControls clock={clock} label="حرّك النقطة" />
      <div className="controls">
        <Slider label={kind === 'parabola' ? 'بُعد البؤرة ×4' : '$b$'} value={b} min={kind === 'ellipse' ? 0.6 : 0.6} max={kind === 'ellipse' ? 3 : 4} step={0.05} onChange={setB} show={(v) => fmt(v)} />
      </div>
      <Readout items={[
        { label: '$d_1$ (إلى البؤرة الأولى)', value: fmt(d1, 3), color: 'var(--area)' },
        { label: kind === 'parabola' ? 'البعد إلى الدليل' : '$d_2$', value: fmt(d2, 3), color: 'var(--f2)' },
        { ...rule, color: 'var(--f1)' },
      ]} />
    </Widget>
  );
}
