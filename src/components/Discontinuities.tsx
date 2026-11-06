import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (x: number) => number; at0: number | null; left: string; right: string; verdict: string; y: [number, number] }

const fns: Record<string, Fn> = {
  rem: { label: 'قابل للإزالة', f: (x) => x * x, at0: 1, left: '0', right: '0', verdict: '**قابل للإزالة**: النهاية $0$ لكن $f(0) = 1$. غيّر $f(0)$ إلى $0$ فتختفي المشكلة.', y: [-0.5, 1.5] },
  jump: { label: 'قفزة', f: (x) => (x < 0 ? 0 : 1), at0: 1, left: '0', right: '1', verdict: '**قفزة**: النهاية من اليسار $0$ ومن اليمين $1$. لا توجد نهاية من الجهتين، ولا قيمة «صحيحة» لـ $f(0)$.', y: [-0.5, 1.5] },
  pole: { label: 'قطب $1/x^2$', f: (x) => 1 / (x * x), at0: null, left: '+\\infty', right: '+\\infty', verdict: '**قطب مزدوج**: $1/x^2 \\to +\\infty$ من الجهتين. رسمياً لا توجد نهاية، لكننا نكتب ذلك على أي حال.', y: [-1, 10] },
  osc: { label: '$\\sin(1/x)$', f: (x) => Math.sin(1 / x), at0: null, left: '\\text{none}', right: '\\text{none}', verdict: '**تذبذب لانهائي**: لا تنفجر الدالة (الجيب لا يتجاوز 1)، لكنها تتذبذب أسرع فأسرع. لا تبقى في أي علبة ارتفاعها $\\varepsilon$، مهما كانت ضيقة.', y: [-1.4, 1.4] },
  xsin: { label: '$x\\sin(1/x)$', f: (x) => x * Math.sin(1 / x), at0: 0, left: '0', right: '0', verdict: '**متصلة** مع $f(0) = 0$: التذبذب محصور بين $-|x|$ و $|x|$، فيُضغط إلى الصفر.', y: [-1, 1] },
  abs: { label: '$|x|$', f: Math.abs, at0: 0, left: '0', right: '0', verdict: '**متصلة لكن بلا مشتقة** عند $0$: الميل يقفز من $-1$ إلى $1$. الاشتقاق يطلب أكثر من الاتصال.', y: [-0.4, 1.2] },
  cbrt: { label: '$x^{1/3}$', f: Math.cbrt, at0: 0, left: '0', right: '0', verdict: '**متصلة لكن بلا مشتقة** عند $0$: الميل $\\tfrac13 x^{-2/3}$ ينفجر. الرسم يقف عمودياً.', y: [-1.2, 1.2] },
};

/** 2.7 — أنواع الانقطاع عند x = 0، وتكبير حول الصفر. */
export default function Discontinuities() {
  const [k, setK] = useState('jump');
  const [z, setZ] = useState(0);
  const F = fns[k];
  const w = 1.2 / 10 ** z;
  const yr = k === 'xsin' || k === 'abs' || k === 'cbrt' ? [F.y[0] * (k === 'cbrt' ? 10 ** (-z / 3) : 1 / 10 ** z), F.y[1] * (k === 'cbrt' ? 10 ** (-z / 3) : 1 / 10 ** z)] : F.y;
  const ref = usePlot({ xMin: -w, xMax: w, yMin: yr[0], yMax: yr[1] }, (p) => {
    p.axes();
    if (k === 'xsin') { p.fn(Math.abs, p.c['ink-3'], { width: 1, dash: [3, 4] }); p.fn((x) => -Math.abs(x), p.c['ink-3'], { width: 1, dash: [3, 4] }); }
    p.fn(F.f, p.c.f1, { width: k === 'osc' || k === 'xsin' ? 1.4 : 3, to: -1e-9 });
    p.fn(F.f, p.c.f1, { width: k === 'osc' || k === 'xsin' ? 1.4 : 3, from: 1e-9 });
    if (F.at0 !== null) {
      p.point(0, F.at0, p.c.f1, 6);
      if (k === 'rem') p.point(0, 0, p.c.card, 5);
      if (k === 'jump') p.point(0, 0, p.c.card, 5);
    }
  }, [k, z]);
  return (
    <Widget title="أنواع الانقطاع عند x = 0" hint="«الدالة متصلة إذا استطعت رسمها دون أن ترفع القلم.» كبّر حول الصفر لترى كل نوع عن قرب. الدائرة المفرّغة نقطة غير موجودة على الرسم.">
      <Choice value={k} onChange={(v) => { setK(v); setZ(0); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Canvas refEl={ref} label="دالة قرب x = 0" />
      <div className="controls">
        <Slider label="تكبير" value={z} min={0} max={2} step={0.05} onChange={setZ} show={() => `×${fmt(10 ** z, 0)}`} color="var(--f2)" />
      </div>
      <MathText as="div" className="verdict">{`$\\lim_{x \\to 0^-} = ${F.left}$ · $\\lim_{x \\to 0^+} = ${F.right}$ · $f(0) = ${F.at0 === null ? '\\text{undefined}' : F.at0}$`}</MathText>
      <MathText as="div" className="verdict">{F.verdict}</MathText>
    </Widget>
  );
}
