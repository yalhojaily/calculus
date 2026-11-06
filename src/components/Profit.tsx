import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

// المثال 9 في 3.2: C = 900 + 400x − x²، I = 600x − 6x². الربح الأقصى حيث I' = C'.
const C = (x: number) => 900 + 400 * x - x * x;
const I = (x: number) => 600 * x - 6 * x * x;
const dC = (x: number) => 400 - 2 * x;
const dI = (x: number) => 600 - 12 * x;

export default function Profit() {
  const [x, setX] = useState(12);
  const top = usePlot({ xMin: -1, xMax: 52, yMin: -500, yMax: 16000 }, (p) => {
    p.axes({ xLabel: 'x (ads)', yLabel: '$', xStep: 10, yStep: 5000 });
    p.fn(I, p.c.area, { width: 3, from: 0 });
    p.fn(C, p.c.red, { width: 3, from: 0 });
    p.line(x, C(x), x, I(x), I(x) >= C(x) ? p.c.area : p.c.red, { width: 2, dash: [3, 3] });
    p.lineThrough(x, I(x), dI(x), p.c.area, { width: 1.2, dash: [5, 5] });
    p.lineThrough(x, C(x), dC(x), p.c.red, { width: 1.2, dash: [5, 5] });
    p.text('income I(x)', 47, I(47), p.c.area, { align: 'right', dy: -6 });
    p.text('cost C(x)', 47, C(47), p.c.red, { align: 'right', dy: -6 });
  }, [x]);
  const P = I(x) - C(x);
  return (
    <Widget title="الربح الأقصى: الدخل الحدّي = التكلفة الحدّية" hint="المثال 9 في الكتاب: تكلفة $x$ إعلاناً $C = 900 + 400x - x^2$ (إعداد ثابت، وطباعة، وتوفير بالحجم)، والدخل $I = 600x - 6x^2$ (تناقص العوائد). الربح $I - C$ هو المسافة بين المنحنيين، ويكون أكبر ما يكون حيث يتوازى المماسان: $I'(x) = C'(x)$.">
      <Canvas refEl={top} label="الدخل والتكلفة" />
      <div className="controls">
        <Slider label="عدد الإعلانات $x$" value={x} min={0} max={50} step={0.5} onChange={setX} show={(v) => fmt(v)} />
      </div>
      <Readout items={[
        { label: 'الربح $I - C$', value: fmt(P, 1), color: P >= 0 ? 'var(--area)' : 'var(--red)' },
        { label: "الدخل الحدّي $I'$", value: fmt(dI(x), 1), color: 'var(--area)' },
        { label: "التكلفة الحدّية $C'$", value: fmt(dC(x), 1), color: 'var(--red)' },
      ]} />
      <div className="verdict">{Math.abs(x - 20) < 0.3 ? '✓ عند x = 20 يتساوى الحدّيان: الربح الأقصى 9600 − 8500 = 1100.' : x < 20 ? 'الدخل الحدّي أكبر من التكلفة الحدّية: إعلان إضافي يزيد الربح.' : 'التكلفة الحدّية أكبر: إعلان إضافي يقلّل الربح.'}</div>
    </Widget>
  );
}
