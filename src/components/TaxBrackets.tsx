import { useState } from 'react';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

// تعليمات مصلحة الضرائب الأمريكية لعام 1991 للأعزب، كما في الكتاب (القسم 1.2، المثال 3)
const B1 = 20350;
const B2 = 49300;
const rate = (x: number) => (x <= B1 ? 0.15 : x <= B2 ? 0.28 : 0.31);
const tax = (x: number) => (x <= B1 ? 0.15 * x : x <= B2 ? 3052.5 + 0.28 * (x - B1) : 11158.5 + 0.31 * (x - B2));
const usd = (v: number) => `$${Math.round(v).toLocaleString('en')}`;

/** 1.2 — الضريبة متعددة القطع الخطية: النسبة الحدّية هي الميل، والضريبة الكلية تتراكم مثل المساحة. */
export default function TaxBrackets() {
  const [x, setX] = useState(35000);
  const X = 80000;
  const tRef = usePlot({ xMin: -2000, xMax: X * 1.05, yMin: -1200, yMax: tax(X) * 1.08 }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'f', xStep: 20000, yStep: 5000 });
    p.fn(tax, p.c.f1, { width: 3, from: 0, to: X });
    p.lineThrough(x, tax(x), rate(x), p.c.f2, { width: 1.6, dash: [6, 4] });
    for (const b of [B1, B2]) p.line(b, 0, b, tax(b), p.c['ink-3'], { width: 1, dash: [3, 4] });
    p.point(x, tax(x), p.c.f1, 6);
  }, [x]);
  const rRef = usePlot({ xMin: -2000, xMax: X * 1.05, yMin: -0.02, yMax: 0.36 }, (p) => {
    p.axes({ xLabel: 'x', yLabel: 'rate', xStep: 20000, yStep: 0.05 });
    p.fillUnder(rate, 0, x, p.c.area, 0.3);
    p.fn(rate, p.c.f2, { width: 3, from: 0, to: X });
    p.point(x, rate(x), p.c.f2, 6);
  }, [x]);

  return (
    <Widget title="الضريبة: النسبة الحدّية مقابل الضريبة الكلية" hint="تعليمات عام 1991 كما في الكتاب. **النسبة الحدّية** (البرتقالي) هي ميل رسم الضريبة: ضريبة كل دولار **إضافي**. **الضريبة الكلية** (الأزرق) تتراكم مثل المساحة تحت النسبة. والنسبة **المتوسطة** = الكلية ÷ الدخل، وهي دائماً أقل من الحدّية في الشرائح العليا.">
      <div className="cv-row">
        <div><Canvas refEl={tRef} ratio={0.75} label="الضريبة الكلية" /><div className="cv-cap f1">الضريبة الكلية <i className="ltr">f(x)</i></div></div>
        <div><Canvas refEl={rRef} ratio={0.75} label="النسبة الحدية" /><div className="cv-cap f2">النسبة الحدّية = الميل</div></div>
      </div>
      <div className="controls">
        <Slider label="الدخل الخاضع للضريبة $x$" value={x} min={0} max={X} step={250} onChange={setX} show={usd} />
      </div>
      <Readout items={[
        { label: 'الضريبة الكلية', value: usd(tax(x)), color: 'var(--f1)' },
        { label: 'النسبة الحدّية (الميل)', value: `${Math.round(rate(x) * 100)}%`, color: 'var(--f2)' },
        { label: 'النسبة المتوسطة', value: x > 0 ? `${((tax(x) / x) * 100).toFixed(1)}%` : '—' },
      ]} />
    </Widget>
  );
}
