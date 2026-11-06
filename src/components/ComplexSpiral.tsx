import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual, polarGrid } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

const ps: Record<string, { label: string; a: number; b: number; note: string }> = {
  osc: { label: "$y'' = -4y$", a: 0, b: 2, note: '$c^2 = -4$ يعطي $c = 2i$: الحل $e^{2it} = \\cos 2t + i\\sin 2t$ **يدور على دائرة الوحدة**. جزؤه التخيلي $\\sin 2t$ يصعد وينزل، والحقيقي $\\cos 2t$ يذهب ويعود: الكرة وظلها من القسم 1.4، بسرعة مضاعفة.' },
  cube: { label: "$y''' = y$", a: -0.5, b: Math.sqrt(3) / 2, note: 'المثال 5: $c^3 = 1$، والجذر المركب $c = -\\tfrac12 + i\\tfrac{\\sqrt3}{2}$. الجزء الحقيقي من الأس يعطي القيمة المطلقة $e^{-t/2}$ المتناقصة، و $e^{i\\sqrt3 t/2}$ يدور: **$y$ يلتف حلزونياً نحو الصفر.** والحلول الحقيقية $e^{-t/2}\\cos\\tfrac{\\sqrt3}{2}t$ و $e^{-t/2}\\sin\\tfrac{\\sqrt3}{2}t$. «لا أظن أننا كنا سنجدها بلا مساعدة.»' },
  grow: { label: '$c = 0.1 + i$', a: 0.1, b: 1, note: 'إذا كان الجزء الحقيقي من $c$ **موجباً** فالحلزون يخرج إلى الخارج. **$e^{ct} \\to 0$ إذا وفقط إذا كان الجزء الحقيقي لـ $c$ سالباً** (التمرين 31d).' },
};

/** 9.4 — y = e^{ct} في المستوى المركب: |y| = e^{at} و arg y = bt. دائرة أو حلزون داخل أو خارج. */
export default function ComplexSpiral() {
  const [k, setK] = useState('osc');
  const [a, setA] = useState(ps.osc.a);
  const [b, setB] = useState(ps.osc.b);
  useEffect(() => { setA(ps[k].a); setB(ps[k].b); }, [k]);
  const T = 10;
  const clock = useClock(10, { loop: false });
  const t = clock.t * T;
  const y = (s: number) => [Math.exp(a * s) * Math.cos(b * s), Math.exp(a * s) * Math.sin(b * s)];
  const R = Math.max(1.15, Math.min(4, Math.exp(a * T) * 1.05));
  const plane = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -R, R, -R, R);
    polarGrid(p, R, R > 2 ? 1 : 0.5);
    p.curve((s) => y(s)[0], (s) => y(s)[1], 0, T, p.c['ink-3'], { width: 1, n: 800 });
    p.curve((s) => y(s)[0], (s) => y(s)[1], 0, t, p.c.f1, { width: 2.6, n: 800 });
    const q = y(t);
    p.line(q[0], 0, q[0], q[1], p.c.f2, { width: 1.4, dash: [3, 3] });
    p.point(q[0], 0, p.c.area, 5); p.point(q[0], q[1], p.c.red, 6);
  }, [a, b, t]);
  const re = usePlot({ xMin: 0, xMax: T, yMin: -R, yMax: R }, (p) => {
    p.axes({ xLabel: 't', yLabel: 'Re y' });
    p.fn((s) => Math.exp(a * s), p.c['ink-3'], { width: 1, dash: [4, 3] });
    p.fn((s) => -Math.exp(a * s), p.c['ink-3'], { width: 1, dash: [4, 3] });
    p.fn((s) => y(s)[0], p.c.area, { width: 2.4, from: 0, to: t });
    p.point(t, y(t)[0], p.c.area, 5);
  }, [a, b, t]);
  const q = y(t);
  return (
    <Widget title="الأسّ المركّب: دائرة أم حلزون؟" hint="**الفكرة الواحدة التي تُحفظ:** عوّض $y = e^{ct}$ في المعادلة التفاضلية وحلّ لإيجاد $c$. كل مشتقة تأتي بعامل $c$. وإن كان $c = a + ib$ مركباً فـ $e^{ct} = e^{at}\,e^{ibt}$: **الطول $e^{at}$ والزاوية $bt$**. شغّل لترى $y$ يتحرك في المستوى المركب، ويمينه جزؤه الحقيقي.">
      <Choice value={k} onChange={setK} options={Object.keys(ps).map((v) => ({ v, label: ps[v].label }))} />
      <div className="cv-row">
        <div><Canvas refEl={plane} ratio={0.9} label="مسار e^{ct} في المستوى المركب" /><div className="cv-cap">المستوى المركب</div></div>
        <div><Canvas refEl={re} ratio={0.9} label="الجزء الحقيقي مع الزمن" /><div className="cv-cap">الجزء الحقيقي عبر الزمن</div></div>
      </div>
      <AnimControls clock={clock} label="شغّل" />
      <div className="controls">
        <Slider label="الجزء الحقيقي $a$" value={a} min={-0.8} max={0.15} step={0.01} onChange={setA} show={(v) => fmt(v, 2)} color="var(--f1)" />
        <Slider label="الجزء التخيلي $b$" value={b} min={-3} max={3} step={0.01} onChange={setB} show={(v) => fmt(v, 2)} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: '$t$', value: fmt(t, 2) },
        { label: '$|y| = e^{at}$', value: fmt(Math.exp(a * t), 3), color: 'var(--red)' },
        { label: '$\\text{Re}\\,y = e^{at}\\cos bt$', value: fmt(q[0], 3), color: 'var(--area)' },
        { label: '$\\text{Im}\\,y = e^{at}\\sin bt$', value: fmt(q[1], 3), color: 'var(--f2)' },
      ]} />
      <MathText as="div" className="verdict">{ps[k].note}</MathText>
    </Widget>
  );
}
