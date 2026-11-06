import { useEffect, useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

interface Fn { label: string; v: (x: number) => number; a: number; b: number; I: number; lo: number; hi: number; view: View; note: string }
const fns: Record<string, Fn> = {
  sq: { label: '$x^2$ على $[-1, 1]$', v: (x) => x * x, a: -1, b: 1, I: 2 / 3, lo: 0, hi: 1, view: { xMin: -1.2, xMax: 1.2, yMin: -0.15, yMax: 1.15 }, note: 'المثال 5: المتوسط $\\tfrac13$، ويتحقق عند $c = \\pm 1/\\sqrt3$. **هاتان نقطتا غاوس**، وستعودان في 5.8 للتكامل العددي.' },
  sin2: { label: '$\\sin^2 x$ على $[0, \\pi]$', v: (x) => Math.sin(x) ** 2, a: 0, b: Math.PI, I: Math.PI / 2, lo: 0, hi: 1, view: { xMin: -0.15, xMax: 3.3, yMin: -0.12, yMax: 1.15 }, note: 'المثال 6: المتوسط $\\tfrac12$، عند $c = \\pi/4$ و $3\\pi/4$. الرسم يتذبذب حول متوسطه: $\\sin^2 x = \\tfrac12 - \\tfrac12\\cos 2x$.' },
  odd: { label: '$x^3$ على $[-1, 1]$', v: (x) => x ** 3, a: -1, b: 1, I: 0, lo: -1, hi: 1, view: { xMin: -1.2, xMax: 1.2, yMin: -1.15, yMax: 1.15 }, note: 'المثال 4: متوسط الدالة الفردية صفر. المساحتان فوق المحور وتحته **تلغيان بعضهما**، و $c = 0$ في المركز.' },
  sqrt: { label: '$\\sqrt{x}$ على $[0, 4]$', v: Math.sqrt, a: 0, b: 4, I: 16 / 3, lo: 0, hi: 2, view: { xMin: -0.15, xMax: 4.3, yMin: -0.12, yMax: 2.2 }, note: 'متوسط الدخل في السنوات الأربع: $\\tfrac{16/3}{4} = \\tfrac43$ مليون في السنة. ويساوي الجذر متوسطه عند $c = \\tfrac{16}{9}$.' },
};

/** 5.6 — مبرهنة القيمة المتوسطة للتكاملات: ارفع مستطيلاً من v_min إلى v_max حتى تساوي مساحته المساحة تحت المنحنى. */
export default function AverageValue() {
  const [k, setK] = useState('sq');
  const F = fns[k];
  const [h, setH] = useState(F.lo);
  const clock = useClock(5, { loop: false });
  const avg = F.I / (F.b - F.a);
  useEffect(() => {
    if (!clock.playing) return;
    const target = F.lo + (F.hi - F.lo) * clock.t;
    if (target >= avg && h < avg) { setH(avg); clock.setPlaying(false); } else setH(target);
  }, [clock.t, clock.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  const rect = h * (F.b - F.a);
  const hit = Math.abs(h - avg) < (F.hi - F.lo) * 0.012;
  const cs: number[] = [];
  for (let i = 0; i < 2000; i++) { const x0 = F.a + ((F.b - F.a) * i) / 2000, x1 = F.a + ((F.b - F.a) * (i + 1)) / 2000; if ((F.v(x0) - avg) * (F.v(x1) - avg) <= 0 && !(F.v(x0) === avg && i > 0)) cs.push((x0 + x1) / 2); }
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.fillUnder(F.v, F.a, F.b, p.c.area, 0.3);
    p.rect(F.a, 0, F.b, h, hit ? p.c.red : p.c.f2, { alpha: 0.18 });
    p.line(F.a, h, F.b, h, hit ? p.c.red : p.c.f2, { width: 2.6 });
    p.fn(F.v, p.c.f1, { width: 3, from: F.a, to: F.b });
    if (hit) for (const c of cs) { p.line(c, 0, c, avg, p.c.red, { width: 1.2, dash: [3, 3] }); p.point(c, avg, p.c.red, 6); }
  }, [k, h]);
  return (
    <Widget title="القيمة المتوسطة: ارفع المستطيل" hint="الأخضر: المساحة تحت المنحنى. البرتقالي: مستطيل قاعدته الفترة كلها. **شغّل** ليرتفع المستطيل من أدنى قيمة إلى أعلى قيمة. عند ارتفاع ما تتساوى المساحتان (الأحمر): هذا الارتفاع هو المتوسط $v_{ave}$، وتأخذه الدالة عند نقطة $c$ على الأقل (قيمة متوسطة).">
      <Choice value={k} onChange={(v) => { setK(v); setH(fns[v].lo); clock.reset(); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} ratio={0.55} label="المستطيل والمساحة تحت المنحنى" />
      <AnimControls clock={clock} label="ارفع" />
      <div className="controls">
        <Slider label="ارتفاع المستطيل" value={h} min={F.lo} max={F.hi} step={(F.hi - F.lo) / 400} onChange={setH} show={(v) => fmt(v, 3)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: 'مساحة المستطيل', value: fmt(rect, 4), color: 'var(--f2)' },
        { label: 'المساحة تحت المنحنى', value: fmt(F.I, 4), color: 'var(--area)' },
        { label: '$v_{ave}$', value: fmt(avg, 4), color: 'var(--red)' },
        { label: '$c$', value: hit ? cs.map((c) => fmt(c, 3)).join(' · ') : '—', color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{F.note}</MathText>
    </Widget>
  );
}
