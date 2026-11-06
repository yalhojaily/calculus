import { useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Choice, Slider, Widget, usePlot } from './ui';
import { MathText } from './MathText';

type Inner = 'kx' | 'sqrt' | 'sq';

const inner: Record<Inner, { label: string; g: (x: number, k: number) => number; dg: (x: number, k: number) => number; guess: string }> = {
  kx: { label: '$\\sin(kx)$', g: (x, k) => k * x, dg: (_x, k) => k, guess: '$k\\cos(kx)$' },
  sqrt: { label: '$\\sin(\\sqrt{x})$', g: (x) => Math.sqrt(x), dg: (x) => 1 / (2 * Math.sqrt(x)), guess: '$\\cos(\\sqrt{x}) \\cdot \\frac{1}{2\\sqrt{x}}$' },
  sq: { label: '$\\sin(x^2)$', g: (x) => x * x, dg: (x) => 2 * x, guess: '$\\cos(x^2) \\cdot 2x$' },
};

/** 0.5 — قاعدة السلسلة على «الحاسبة»: ارسم الدالة ومشتقتها العددية nDeriv، ثم خمّن القاعدة. */
export default function ChainCalc() {
  const [which, setWhich] = useState<Inner>('kx');
  const [k, setK] = useState(2);
  const [guess, setGuess] = useState(false);
  const I = inner[which];
  const Y1 = (x: number) => Math.sin(I.g(x, k));
  const h = 1e-3;
  const nDeriv = (x: number) => (Y1(x + h) - Y1(x - h)) / (2 * h);
  const true_ = (x: number) => Math.cos(I.g(x, k)) * I.dg(x, k);
  const view = which === 'kx' ? { xMin: -0.3, xMax: 6.6, yMin: -3.4, yMax: 3.4 } : which === 'sqrt' ? { xMin: -0.2, xMax: 30, yMin: -1.3, yMax: 1.5 } : { xMin: -3.3, xMax: 3.3, yMin: -6.5, yMax: 6.5 };
  const ref = usePlot(view, (p) => {
    p.axes();
    p.fn(Y1, p.c.f1, { width: 2.6, from: which === 'sqrt' ? 0 : view.xMin });
    p.fn(nDeriv, p.c.f2, { width: 2.6, from: which === 'sqrt' ? 0.01 : view.xMin });
    if (guess) p.fn(true_, p.c.ink, { width: 1.6, dash: [3, 5], from: which === 'sqrt' ? 0.01 : view.xMin });
  }, [which, k, guess]);

  return (
    <Widget title="قاعدة السلسلة على الحاسبة" hint="الأزرق: $Y_1$. البرتقالي: مشتقتها العددية $Y_2 = \text{nDeriv}(Y_1)$، أي الميل بين نقطتين قريبتين جداً. خمّن صيغة البرتقالي، ثم اضغط «أظهر التخمين» لترى المنقّط فوقه بالضبط.">
      <Choice value={which} onChange={setWhich} options={(Object.keys(inner) as Inner[]).map((v) => ({ v, label: inner[v].label }))} />
      <Canvas refEl={ref} label="دالة ومشتقتها العددية" />
      <div className="controls">
        {which === 'kx' && <Slider label="$k$" value={k} min={0.5} max={3} step={0.5} onChange={setK} show={(v) => fmt(v)} />}
        <div className="anim">
          <button className="btn" onClick={() => setGuess((g) => !g)}>{guess ? 'أخفِ التخمين' : 'أظهر التخمين'}</button>
          {guess && <span className="ltr" style={{ fontSize: '0.95rem' }}><MathText>{I.guess}</MathText></span>}
        </div>
      </div>
    </Widget>
  );
}
