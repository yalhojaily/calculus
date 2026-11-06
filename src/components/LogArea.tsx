import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

/** 6.4 — اللوغاريتم مساحة تحت 1/x من 1. المساحة من a إلى ab تساوي المساحة من 1 إلى b. */
export default function LogArea() {
  const [mode, setMode] = useState<'area' | 'prod'>('area');
  const [x, setX] = useState(2);
  const [a, setA] = useState(2);
  const [b, setB] = useState(1.5);
  const ab = a * b;
  const xMax = mode === 'area' ? 8.4 : Math.max(6.5, ab + 0.4);
  const ref = usePlot({ xMin: -0.15, xMax, yMin: -0.08, yMax: 2.2 }, (p) => {
    p.axes({ xLabel: 'x', yLabel: '1/x' });
    const f = (t: number) => 1 / t;
    if (mode === 'area') {
      p.fillUnder(f, Math.min(1, x), Math.max(1, x), x >= 1 ? p.c.area : p.c.red, 0.4);
      p.line(Math.E, 0, Math.E, 1 / Math.E, p.c.f2, { width: 1.4, dash: [4, 3] });
      p.text('e', Math.E, 0, p.c.f2, { align: 'center', base: 'top', dy: 4 });
    } else {
      p.fillUnder(f, 1, a, p.c.f1, 0.35);
      p.fillUnder(f, a, ab, p.c.area, 0.45);
      p.fillUnder(f, 1, b, p.c.f2, 0.25);
    }
    p.fn(f, p.c.ink, { width: 2.6, from: 0.46, to: xMax });
  }, [mode, x, a, b]);
  return (
    <Widget title="اللوغاريتم مساحةً" hint="التعريف الجديد: $\ln x = \displaystyle\int_1^x \frac{dt}{t}$، المساحة تحت القطع الزائد $1/t$ **مقيسةً من 1**. فـ $\ln 1 = 0$، وتحت 1 تُطرح المساحة (الأحمر). والعدد $e$ هو حيث تبلغ المساحة 1 بالضبط. في وضع «الضرب»: الأخضر من $a$ إلى $ab$ **يساوي** البرتقالي من 1 إلى $b$، فـ $\ln ab = \ln a + \ln b$.">
      <Choice value={mode} onChange={setMode} options={[{ v: 'area', label: 'المساحة حتى x' }, { v: 'prod', label: 'ln ab = ln a + ln b' }]} />
      <Canvas refEl={ref} ratio={0.5} label="المساحة تحت 1/x" />
      <div className="controls">
        {mode === 'area'
          ? <Slider label="$x$" value={x} min={0.15} max={8} step={0.005} onChange={setX} show={(v) => fmt(v, 3)} color="var(--area)" />
          : <>
            <Slider label="$a$" value={a} min={1} max={3} step={0.01} onChange={setA} show={(v) => fmt(v, 2)} color="var(--f1)" />
            <Slider label="$b$" value={b} min={1} max={3} step={0.01} onChange={setB} show={(v) => fmt(v, 2)} color="var(--f2)" />
          </>}
      </div>
      <Readout items={mode === 'area' ? [
        { label: '$\\ln x$ (المساحة)', value: fmt(Math.log(x), 5), color: 'var(--area)' },
        { label: '$x$', value: fmt(x, 3) },
        { label: 'المساحة = 1 عند', value: 'e = 2.71828' },
      ] : [
        { label: '$\\ln a$', value: fmt(Math.log(a), 4), color: 'var(--f1)' },
        { label: 'من $a$ إلى $ab$', value: fmt(Math.log(ab) - Math.log(a), 4), color: 'var(--area)' },
        { label: '$\\ln b$', value: fmt(Math.log(b), 4), color: 'var(--f2)' },
        { label: '$\\ln ab$', value: fmt(Math.log(ab), 4) },
      ]} />
      <MathText as="div" className="verdict">{mode === 'area' ? 'المساحة من 1 إلى 2 أكبر من $\\tfrac12$، ومن 1 إلى 4 أكبر من 1، **فالمساحة تبلغ 1 قبل 4** (عند $e$). ولكي تضاعف المساحة عليك أن **تربّع** المسافة: اللوغاريتم يزحف ببطء.' : 'لماذا تتساوى المساحتان؟ بالتعويض $u = x/a$: الشريط من $a$ إلى $ab$ **أعرض $a$ مرة وأقصر $a$ مرة**، فـ $dx/x = du/u$.'}</MathText>
    </Widget>
  );
}
