import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Slider, Widget, usePlot } from './ui';

interface Ex { label: string; f: (x: number) => number; d: (x: number) => number; rule: string; dTex: string; view: View }

const exs: Record<string, Ex> = {
  xsin: { label: '$x \\sin x$', f: (x) => x * Math.sin(x), d: (x) => x * Math.cos(x) + Math.sin(x), rule: 'الضرب', dTex: 'x\\cos x + \\sin x', view: { xMin: -0.2, xMax: 7, yMin: -6, yMax: 4 } },
  tan: { label: '$\\tan x$', f: Math.tan, d: (x) => 1 / Math.cos(x) ** 2, rule: 'القسمة', dTex: '\\sec^2 x = \\dfrac{1}{\\cos^2 x}', view: { xMin: -1.5, xMax: 1.5, yMin: -5, yMax: 8 } },
  sinc: { label: '$\\dfrac{\\sin x}{x}$', f: (x) => (x === 0 ? 1 : Math.sin(x) / x), d: (x) => (Math.abs(x) < 1e-6 ? 0 : (x * Math.cos(x) - Math.sin(x)) / (x * x)), rule: 'القسمة', dTex: '\\dfrac{x\\cos x - \\sin x}{x^2}', view: { xMin: -9, xMax: 9, yMin: -0.5, yMax: 1.2 } },
  sec: { label: '$\\sec x$', f: (x) => 1 / Math.cos(x), d: (x) => Math.sin(x) / Math.cos(x) ** 2, rule: 'المقلوب', dTex: '\\sec x \\tan x', view: { xMin: -1.4, xMax: 1.4, yMin: -6, yMax: 8 } },
  sin6: { label: '$(\\sin x)^6$', f: (x) => Math.sin(x) ** 6, d: (x) => 6 * Math.sin(x) ** 5 * Math.cos(x), rule: 'القوة', dTex: '6(\\sin x)^5\\cos x', view: { xMin: -0.2, xMax: 6.5, yMin: -2.2, yMax: 2.2 } },
  cube: { label: '$x^{1/3}$', f: Math.cbrt, d: (x) => 1 / (3 * Math.cbrt(x) ** 2), rule: 'القوة الكسرية', dTex: '\\tfrac13 x^{-2/3}', view: { xMin: -3, xMax: 3, yMin: -2, yMax: 3 } },
};

/** 2.5 — تحقّق من القواعد: المشتقة بالقاعدة (منقّط) فوق الميل العددي (متصل). */
export default function RuleCheck() {
  const [k, setK] = useState('xsin');
  const [x0, setX0] = useState(1);
  const E = exs[k];
  const h = 1e-4;
  const num = (x: number) => (E.f(x + h) - E.f(x - h)) / (2 * h);
  const ref = usePlot(E.view, (p) => {
    p.axes();
    p.fn(E.f, p.c.f1, { width: 2.6 });
    p.fn(num, p.c.f2, { width: 4 });
    p.fn(E.d, p.c.ink, { width: 1.4, dash: [3, 4] });
    const y = E.f(x0), m = E.d(x0);
    if (Number.isFinite(m)) p.lineThrough(x0, y, m, p.c.violet, { width: 1.4 });
    p.point(x0, y, p.c.f1, 5);
  }, [k, x0]);
  const lo = E.view.xMin + 0.05, hi = E.view.xMax - 0.05;
  return (
    <Widget title="تحقّق من القاعدة على الرسم" hint="الأزرق: الدالة. البرتقالي العريض: ميلها **عددياً** (فرق متمركز بخطوة صغيرة جداً). الأسود المنقّط: المشتقة **بالقاعدة**. إن كانت القاعدة صحيحة فالمنقّط يقع على البرتقالي تماماً.">
      <Choice value={k} onChange={(v) => { setK(v); setX0(Math.min(Math.max(1, exs[v].view.xMin + 0.1), exs[v].view.xMax - 0.1)); }} options={Object.entries(exs).map(([v, e]) => ({ v, label: e.label }))} />
      <Canvas refEl={ref} label="الدالة ومشتقتها" />
      <div className="controls">
        <Slider label="$x$" value={x0} min={lo} max={hi} step={0.01} onChange={setX0} show={(v) => fmt(v)} />
      </div>
      <MathText as="div" className="verdict">{`قاعدة ${E.rule}: $\\dfrac{d}{dx}\\,${E.label.slice(1, -1)} = ${E.dTex}$ · عند $x = ${fmt(x0)}$: بالقاعدة $${fmt(E.d(x0), 5)}$، وعددياً $${fmt(num(x0), 5)}$`}</MathText>
    </Widget>
  );
}
