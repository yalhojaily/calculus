import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

/** 2.2 — المرونة = الحدّي ÷ المتوسط. للدالة y = c xⁿ هي n عند كل سعر. */
export default function Elasticity() {
  const [n, setN] = useState(-1);
  const [x, setX] = useState(2);
  const c = 4;
  const y = (s: number) => c * s ** n;
  const dy = (s: number) => c * n * s ** (n - 1);
  const yMax = Math.max(8, Math.min(30, y(4) * 1.2, y(0.6) * 1.1));
  const ref = usePlot({ xMin: -0.1, xMax: 4.3, yMin: -0.5, yMax }, (p) => {
    p.axes({ xLabel: 'x (price)', yLabel: 'y' });
    p.fn(y, p.c.f1, { width: 3, from: 0.05 });
    p.lineThrough(x, y(x), dy(x), p.c.f2, { width: 2 });
    p.line(0, 0, x, y(x), p.c.violet, { width: 1.6, dash: [5, 4] });
    p.point(x, y(x), p.c.f1, 6);
  }, [n, x]);
  const marginal = dy(x);
  const average = y(x) / x;
  const kind = n === 0 ? 'غير مرن تماماً' : Math.abs(n) < 1 ? 'غير مرن ($|E| \\lt 1$)' : Math.abs(n) === 1 ? 'مرونة واحدية ($|E| = 1$)' : 'مرن ($|E| \\gt 1$)';
  return (
    <Widget title="المرونة: الحدّي مقسوماً على المتوسط" hint="**الحدّي** هو ميل المماس (البرتقالي)، و**المتوسط** $y/x$ هو ميل الخط من نقطة الأصل (البنفسجي المتقطّع). المرونة $E$ نسبتهما. للدالة $y = cx^n$ تبقى $E = n$ مهما حرّكت السعر، ولهذا تُستعمل مقياساً.">
      <Canvas refEl={ref} label="منحنى الطلب أو العرض" />
      <div className="controls">
        <Slider label="الأس $n$" value={n} min={-3} max={2} step={0.5} onChange={setN} show={(v) => fmt(v)} color="var(--f1)" />
        <Slider label="السعر $x$" value={x} min={0.6} max={4} step={0.05} onChange={setX} show={(v) => fmt(v)} />
      </div>
      <Readout items={[
        { label: 'الحدّي $dy/dx$', value: fmt(marginal, 3), color: 'var(--f2)' },
        { label: 'المتوسط $y/x$', value: fmt(average, 3), color: 'var(--violet)' },
        { label: 'المرونة $E$', value: fmt(marginal / average, 3), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{`$y = ${c}x^{${fmt(n)}}$: ${kind}${n === -1 ? '. المستهلكون ينفقون المبلغ نفسه عند كل سعر: $xy = c$' : ''}`}</MathText>
    </Widget>
  );
}
