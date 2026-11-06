import { fitEqual } from '../lib/polar';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Readout, Widget, useClock, usePlot } from './ui';

/** 9.2 — المريخ من الأرض: الأرض r = 2 بسرعة 2π، المريخ r = 3 بسرعة π. الموقع النسبي يرسم محاراً بعروة. */
export default function MarsLoop() {
  const clock = useClock(10, { loop: true });
  const T = 2 * clock.t; // سنتان أرضيتان
  const E = (t: number) => [2 * Math.cos(2 * Math.PI * t), 2 * Math.sin(2 * Math.PI * t)];
  const M = (t: number) => [3 * Math.cos(Math.PI * t), 3 * Math.sin(Math.PI * t)];
  const rel = (t: number) => { const e = E(t), m = M(t); return [m[0] - e[0], m[1] - e[1]]; };
  const sun = usePlot({ xMin: -3.5, xMax: 3.5, yMin: -3.5, yMax: 3.5 }, (p) => {
    fitEqual(p, -3.4, 3.4, -3.4, 3.4);
    p.curve((s) => 2 * Math.cos(s), (s) => 2 * Math.sin(s), 0, 2 * Math.PI, p.c['ink-3'], { width: 1, dash: [3, 3] });
    p.curve((s) => 3 * Math.cos(s), (s) => 3 * Math.sin(s), 0, 2 * Math.PI, p.c['ink-3'], { width: 1, dash: [3, 3] });
    p.point(0, 0, '#e9a317', 9);
    const e = E(T), m = M(T);
    p.line(e[0], e[1], m[0], m[1], p.c.violet, { width: 1.5 });
    p.point(e[0], e[1], p.c.f1, 7); p.point(m[0], m[1], p.c.red, 7);
    p.text('Earth', e[0], e[1], p.c.f1, { align: 'center', base: 'bottom', dy: -9, size: 12 });
    p.text('Mars', m[0], m[1], p.c.red, { align: 'center', base: 'bottom', dy: -9, size: 12 });
  }, [T]);
  const sky = usePlot({ xMin: -5.5, xMax: 5.5, yMin: -5.5, yMax: 5.5 }, (p) => {
    fitEqual(p, -1.3, 5.3, -3.3, 3.3);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    p.curve((s) => rel(s)[0], (s) => rel(s)[1], 0, 2, p.c['ink-3'], { width: 1, n: 400 });
    p.curve((s) => rel(s)[0], (s) => rel(s)[1], 0, T, p.c.red, { width: 2.8, n: 400 });
    p.point(0, 0, p.c.f1, 7);
    const q = rel(T); p.line(0, 0, q[0], q[1], p.c.violet, { width: 1.5 }); p.point(q[0], q[1], p.c.red, 7);
    p.point(2, 0, p.c.f2, 5);
  }, [T]);
  const q = rel(T);
  return (
    <Widget title="المريخ كما يُرى من الأرض" hint="الأرض على الدائرة $r = 2$ تُكمل دورة في سنة، والمريخ على $r = 3$ يكملها في سنتين. اطرح الموقعين لتحصل على المريخ **بالنسبة للأرض** (اليمين). مع $\cos 2\pi t = 2\cos^2\pi t - 1$: $x_{ME} = (3 - 4\cos\pi t)\cos\pi t + 2$ و $y_{ME} = (3 - 4\cos\pi t)\sin\pi t$.">
      <div className="cv-row">
        <div><Canvas refEl={sun} ratio={0.9} label="الأرض والمريخ حول الشمس" /><div className="cv-cap">حول الشمس</div></div>
        <div><Canvas refEl={sky} ratio={0.9} label="المريخ بالنسبة للأرض" /><div className="cv-cap">من الأرض: عروة في السماء</div></div>
      </div>
      <AnimControls clock={clock} label="شغّل السنتين" />
      <Readout items={[
        { label: 'الزمن (سنة)', value: fmt(T, 2) },
        { label: 'بُعد المريخ عن الأرض', value: fmt(Math.hypot(q[0], q[1]), 2), color: 'var(--red)' },
        { label: '$3 - 4\\cos\\pi t$', value: fmt(3 - 4 * Math.cos(Math.PI * T), 2), color: 'var(--violet)' },
      ]} />
      <MathText as="div" className="verdict">{'**المريخ يرسم عروة في السماء!** عند لحظتين يكون $\\cos\\pi t = \\tfrac34$ فيصير $3 - 4\\cos\\pi t = 0$، والمريخ عند النقطة $(2, 0)$ (البرتقالية). انقل الأصل إليها فيصير المسار $r = 3 - 4\\cos\\pi t$: **محار بعروة**. (مثال من دونالد ساري. ونسبة 3 إلى 2 نفسها تسخّن بقعتين متقابلتين على عطارد.)'}</MathText>
    </Widget>
  );
}
