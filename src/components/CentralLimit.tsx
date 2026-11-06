import { useEffect, useRef, useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Slider, Widget, useClock, usePlot } from './ui';

type K = 'coin' | 'unif' | 'exp';
const src: Record<K, { label: string; draw: () => number; mu: number; sig: number; range: [number, number] }> = {
  coin: { label: 'عملة (نعم/لا)', draw: () => (Math.random() < 0.5 ? 1 : 0), mu: 0.5, sig: 0.5, range: [0, 1] },
  unif: { label: 'منتظم على [0, 1]', draw: () => Math.random(), mu: 0.5, sig: Math.sqrt(1 / 12), range: [0, 1] },
  exp: { label: 'أسّي (متوسط 1)', draw: () => -Math.log(1 - Math.random()), mu: 1, sig: 1, range: [0, 3] },
};
const BINS = 40;

/** 8.4 — قانون المتوسطات ومبرهنة النهاية المركزية: متوسط N عيّنة يتجمّع حول μ بانحراف σ/√N، وشكله يقترب من الجرس. */
export default function CentralLimit() {
  const [k, setK] = useState<K>('coin');
  const [N, setN] = useState(4);
  const S = src[k];
  const B = k === 'coin' ? N + 1 : BINS;
  const counts = useRef<number[]>(Array(B).fill(0));
  const [total, setTotal] = useState(0);
  const sum = useRef({ s: 0, s2: 0 });
  const clock = useClock(1, { loop: true });
  const reset = () => { counts.current = Array(B).fill(0); sum.current = { s: 0, s2: 0 }; setTotal(0); };
  useEffect(reset, [k, N]);
  const [lo, hi] = S.range;
  const add = (m: number) => {
    for (let r = 0; r < m; r++) {
      let s = 0; for (let i = 0; i < N; i++) s += S.draw();
      const xb = s / N; sum.current.s += xb; sum.current.s2 += xb * xb;
      if (k === 'coin') counts.current[Math.round(xb * N)]++; else { const b = Math.floor(((xb - lo) / (hi - lo)) * BINS); if (b >= 0 && b < BINS) counts.current[b]++; }
    }
    setTotal((t) => t + m);
  };
  useEffect(() => { if (clock.playing) add(25); }, [clock.t]); // eslint-disable-line react-hooks/exhaustive-deps
  const w = (hi - lo) / BINS;
  const sN = S.sig / Math.sqrt(N);
  const peak = 1 / (sN * Math.sqrt(2 * Math.PI));
  const ref = usePlot({ xMin: lo - 0.05 * (hi - lo), xMax: hi + 0.05 * (hi - lo), yMin: -peak * 0.04, yMax: peak * 1.35 }, (p) => {
    p.axes({ xLabel: 'X̄' });
    const tot = Math.max(total, 1);
    counts.current.forEach((c, i) => { if (!c) return; if (k === 'coin') p.rect((i - 0.45) / N, 0, (i + 0.45) / N, (c * N) / tot, p.c.f2, { alpha: 0.45, stroke: false }); else p.rect(lo + i * w, 0, lo + (i + 1) * w, c / (tot * w), p.c.f2, { alpha: 0.45, stroke: false }); });
    p.fn((x) => Math.exp(-((x - S.mu) ** 2) / (2 * sN * sN)) * peak, p.c.f1, { width: 2.4 });
    p.line(S.mu, 0, S.mu, peak * 1.3, p.c.red, { width: 1.2, dash: [4, 3] });
  }, [k, N, total]);
  const mean = total ? sum.current.s / total : NaN;
  const sd = total > 1 ? Math.sqrt(Math.max(0, sum.current.s2 / total - mean * mean)) : NaN;
  return (
    <Widget title="مبرهنة النهاية المركزية" hint="كل تجربة: خذ $N$ عيّنة من التوزيع، واحسب متوسطها $\bar X$. شغّل لتكرار التجارب: المدرّج البرتقالي توزيع $\bar X$. **مهما كان التوزيع الأصلي** (حتى عملة بقيمتين فقط)، يقترب شكل المدرّج من الجرس الأزرق: متوسطه $\mu$ وانحرافه $\sigma/\sqrt N$. كبّر $N$ فيضيق الجرس: هذا قانون المتوسطات.">
      <Choice value={k} onChange={setK} options={(Object.keys(src) as K[]).map((v) => ({ v, label: src[v].label }))} />
      <Canvas refEl={ref} ratio={0.5} label="مدرّج متوسطات العيّنات والمنحنى الطبيعي" />
      <AnimControls clock={clock} label="كرّر التجارب" />
      <div className="controls">
        <Slider label="حجم العيّنة $N$" value={N} min={1} max={100} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: 'عدد التجارب', value: String(total) },
        { label: 'متوسط $\\bar X$', value: Number.isFinite(mean) ? fmt(mean, 4) : '—', color: 'var(--f2)' },
        { label: 'انحراف $\\bar X$', value: Number.isFinite(sd) ? fmt(sd, 4) : '—', color: 'var(--f2)' },
        { label: '$\\sigma/\\sqrt N$', value: fmt(sN, 4), color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{k === 'coin' ? 'المثال 7: استطلاع نعم/لا. للناخب الواحد $\\sigma \\le \\tfrac12$، فمع $N = 2500$ يكون $\\sigma/\\sqrt N \\le 1\\%$. **هامش الخطأ (بثقة 95%) هو $1/\\sqrt N$ دائماً**، فنتيجة 53% مقابل 47% حاسمة.' : 'قانون المتوسطات يقول إن $\\bar X$ يقترب من $\\mu$ «بشكل شبه مؤكد». **لا يعني أن الحظ يتعادل**: بعد عشر كتابات متتالية، الصورة ليست أرجح في الرمية التالية (التمرين 20).'}</MathText>
    </Widget>
  );
}
