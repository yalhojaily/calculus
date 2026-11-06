import { useState } from 'react';
import { type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Widget, usePlot } from './ui';

interface Term { c: number; r: number; label: string; color: 'f1' | 'f2' | 'area' | 'violet' }
interface Ex { label: string; f: (x: number) => number; terms: Term[]; view: View; split: string; cover: string; integral: string }
const exs: Record<string, Ex> = {
  ex1: {
    label: '$\\dfrac{3x^2 + 8x - 4}{(x - 2)(x + 2)x}$', f: (x) => (3 * x * x + 8 * x - 4) / ((x - 2) * (x + 2) * x),
    terms: [{ c: 3, r: 2, label: '3/(x − 2)', color: 'f2' }, { c: -1, r: -2, label: '−1/(x + 2)', color: 'area' }, { c: 1, r: 0, label: '1/x', color: 'violet' }],
    view: { xMin: -4, xMax: 4, yMin: -8, yMax: 8 },
    split: '\\frac{3}{x - 2} - \\frac{1}{x + 2} + \\frac{1}{x}',
    cover: 'غطِّ $(x - 2)$ وضع $x = 2$: $\\dfrac{12 + 16 - 4}{(4)(2)} = 3 = A$. غطِّ $(x + 2)$ وضع $x = -2$: $\\dfrac{12 - 16 - 4}{(-4)(-2)} = -1 = B$. غطِّ $x$ وضع $x = 0$: $\\dfrac{-4}{(-2)(2)} = 1 = C$.',
    integral: '3\\ln|x - 2| - \\ln|x + 2| + \\ln|x| + C',
  },
  ex2: {
    label: '$\\dfrac{x + 2}{(x - 1)(x + 3)}$', f: (x) => (x + 2) / ((x - 1) * (x + 3)),
    terms: [{ c: 0.75, r: 1, label: '¾/(x − 1)', color: 'f2' }, { c: 0.25, r: -3, label: '¼/(x + 3)', color: 'area' }],
    view: { xMin: -6, xMax: 4, yMin: -5, yMax: 5 },
    split: '\\frac{3/4}{x - 1} + \\frac{1/4}{x + 3}',
    cover: 'غطِّ $(x - 1)$ وضع $x = 1$: $\\dfrac{3}{4} = A$. غطِّ $(x + 3)$ وضع $x = -3$: $\\dfrac{-1}{-4} = \\dfrac14 = B$.',
    integral: '\\tfrac34\\ln|x - 1| + \\tfrac14\\ln|x + 3| + C',
  },
  logi: {
    label: '$\\dfrac{1}{y(1 - y)}$', f: (x) => 1 / (x * (1 - x)),
    terms: [{ c: 1, r: 0, label: '1/y', color: 'f2' }, { c: -1, r: 1, label: '1/(1 − y)', color: 'area' }],
    view: { xMin: -1.5, xMax: 2.5, yMin: -12, yMax: 12 },
    split: '\\frac{1}{y} + \\frac{1}{1 - y}',
    cover: 'المثال 3 (المعادلة اللوجستية مع $c = b = 1$): غطِّ $y$ وضع $y = 0$: $A = 1$. غطِّ $(1 - y)$ وضع $y = 1$: $B = 1$. **هذا ما احتجناه في 6.5.**',
    integral: '\\ln|y| - \\ln|1 - y| = \\ln\\left|\\frac{y}{1 - y}\\right| + C',
  },
};

/** 7.4 — الكسور الجزئية: P/Q مجموع كسور بسيطة A/(x − r)، تُوجد ثوابتها بطريقة التغطية. */
export default function PartialFrac() {
  const [k, setK] = useState('ex1');
  const E = exs[k];
  const [show, setShow] = useState<'sum' | 'pieces'>('pieces');
  const piece = (t: Term) => (x: number) => t.c / (x - t.r);
  const ref = usePlot(E.view, (p) => {
    p.axes();
    for (const t of E.terms) p.line(t.r, E.view.yMin, t.r, E.view.yMax, p.c['ink-3'], { width: 1, dash: [3, 4] });
    if (show === 'pieces') for (const t of E.terms) p.fn(piece(t), p.c[t.color], { width: 2 });
    p.fn(E.f, p.c.ink, { width: show === 'sum' ? 3 : 1.6, dash: show === 'pieces' ? [6, 4] : [] });
  }, [k, show]);
  return (
    <Widget title="الكسور الجزئية" hint="المنحنى الأسود الدالة الكسرية $P/Q$، وخطوط التقارب الرأسية عند أصفار $Q$. **قرب كل صفر يتصرف المنحنى مثل كسر واحد بسيط** $A/(x - r)$ (الملوّن). ولهذا تنجح طريقة التغطية: قرب $x = r$ يهيمن الحد الذي ينفجر هناك، والباقي محدود.">
      <Choice value={k} onChange={setK} options={Object.entries(exs).map(([v, e]) => ({ v, label: e.label }))} />
      <Choice value={show} onChange={setShow} options={[{ v: 'pieces', label: 'الأجزاء' }, { v: 'sum', label: 'الدالة وحدها' }]} />
      <Canvas refEl={ref} ratio={0.6} label="الدالة الكسرية وكسورها الجزئية" />
      <MathText as="div" className="verdict">{`$${'\\dfrac{P}{Q} = '}${E.split}$`}</MathText>
      <MathText as="div" className="cv-cap">{E.cover}</MathText>
      <MathText as="div" className="cv-cap">{`التكامل: $${E.integral}$`}</MathText>
    </Widget>
  );
}
