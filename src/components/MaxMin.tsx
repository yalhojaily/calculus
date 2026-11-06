import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn {
  label: string;
  f: (x: number) => number;
  d1: (x: number) => number;
  d2: (x: number) => number;
  crit: number[];
  view: View;
  range: [number, number];
}

const fns: Record<string, Fn> = {
  cubic: { label: '$x^3 - 12x$', f: (x) => x ** 3 - 12 * x, d1: (x) => 3 * x * x - 12, d2: (x) => 6 * x, crit: [-2, 2], view: { xMin: -4.2, xMax: 4.2, yMin: -22, yMax: 22 }, range: [-4, 4] },
  trig: { label: '$\\sin x + \\cos x$', f: (x) => Math.sin(x) + Math.cos(x), d1: (x) => Math.cos(x) - Math.sin(x), d2: (x) => -Math.sin(x) - Math.cos(x), crit: [Math.PI / 4, (5 * Math.PI) / 4], view: { xMin: -0.3, xMax: 6.6, yMin: -1.8, yMax: 1.8 }, range: [0, 6.28] },
  squares: { label: '$(x-1)^2 + (x-2)^2 + (x-6)^2$', f: (x) => (x - 1) ** 2 + (x - 2) ** 2 + (x - 6) ** 2, d1: (x) => 6 * x - 18, d2: () => 6, crit: [3], view: { xMin: -0.5, xMax: 7, yMin: -2, yMax: 50 }, range: [0, 6.5] },
};

/** 0.4 — القيم العظمى والصغرى: الميل صفر، والمشتقة الثانية تقول: قمة أم قاع؟ */
export default function MaxMin() {
  const [k, setK] = useState<keyof typeof fns>('cubic');
  const F = fns[k];
  const [x, setX] = useState(0.5);
  const ref = usePlot(F.view, (p) => {
    p.axes();
    p.fn(F.f, p.c.f1, { width: 3 });
    p.fn(F.d1, p.c.f2, { width: 1.6, dash: [5, 4] });
    for (const c of F.crit) {
      p.point(c, F.f(c), F.d2(c) > 0 ? p.c.area : p.c.red, 6);
    }
    const sp = (F.view.xMax - F.view.xMin) / 7;
    p.line(x - sp, F.f(x) - sp * F.d1(x), x + sp, F.f(x) + sp * F.d1(x), p.c.f2, { width: 2.6 });
    p.point(x, F.f(x), p.c.f1, 6);
    p.text("y'", F.view.xMax - 0.1, F.d1(F.view.xMax - 0.3), p.c.f2, { align: 'right', dy: -4 });
  }, [k, x]);

  const s = F.d1(x);
  const b = F.d2(x);
  const near = F.crit.find((c) => Math.abs(c - x) < 0.06);
  let msg: string;
  if (near !== undefined) msg = `الميل صفر عند $x^* = ${fmt(near, 3)}$ و $y'' ${F.d2(near) > 0 ? '> 0' : '< 0'}$: هذه **${F.d2(near) > 0 ? 'قيمة صغرى' : 'قيمة عظمى'}** $y = ${fmt(F.f(near), 3)}$.`;
  else msg = `الميل ${s > 0 ? 'موجب: الدالة تصعد' : 'سالب: الدالة تنزل'}، والمنحنى ينحني ${b > 0 ? 'للأعلى (مثل كوب ∪)' : b < 0 ? 'للأسفل (مثل قبّة ∩)' : 'لا للأعلى ولا للأسفل: نقطة انقلاب'}.`;
  return (
    <Widget title="أين القمة وأين القاع؟" hint="الخط المتقطع البرتقالي هو المشتقة $y'$. حيث يقطع المحور (ميل صفر) تجد النقاط الحرجة: الأخضر قاع، والأحمر قمة.">
      <Choice value={k} onChange={(v) => { setK(v); setX((fns[v].range[0] + fns[v].range[1]) / 2 + 0.3); }} options={Object.entries(fns).map(([v, f]) => ({ v: v as keyof typeof fns, label: f.label }))} />
      <Canvas refEl={ref} label="دالة ومشتقتها مع النقاط الحرجة" />
      <div className="controls">
        <Slider label="حرّك $x$" value={x} min={F.range[0]} max={F.range[1]} step={0.01} onChange={setX} show={(v) => fmt(v)} />
      </div>
      <Readout
        items={[
          { label: '$y$', value: fmt(F.f(x), 3), color: 'var(--f1)' },
          { label: "الميل $y'$", value: fmt(s, 3), color: 'var(--f2)' },
          { label: "الانحناء $y''$", value: fmt(b, 3), color: b > 0 ? 'var(--area)' : 'var(--red)' },
        ]}
      />
      <MathText as="div" className="verdict">{msg}</MathText>
    </Widget>
  );
}
