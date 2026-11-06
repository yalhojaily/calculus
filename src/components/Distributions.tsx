import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'normal' | 'exp' | 'poisson';
const erf = (x: number) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
const Phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));
const fact = (n: number) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

/** 8.4 — كثافات الاحتمال: الطبيعي والأسّي، والبواسوني المنفصل. الاحتمال مساحة تحت الكثافة. */
export default function Distributions() {
  const [k, setK] = useState<K>('normal');
  const [mu, setMu] = useState(0);
  const [sig, setSig] = useState(1);
  const [lam, setLam] = useState(4); // متوسط الأسّي (عمر الجهاز) أو λ للبواسوني
  const [a, setA] = useState(-1);
  const [b, setB] = useState(1);
  const view = k === 'normal' ? { xMin: -4.5, xMax: 4.5, yMin: -0.03, yMax: 0.85 } : k === 'exp' ? { xMin: -0.5, xMax: 16, yMin: -0.02, yMax: 0.55 } : { xMin: -0.8, xMax: 12.8, yMin: -0.02, yMax: 0.42 };
  const pdf = (x: number) => (k === 'normal' ? Math.exp(-((x - mu) ** 2) / (2 * sig * sig)) / (sig * Math.sqrt(2 * Math.PI)) : x < 0 ? 0 : Math.exp(-x / lam) / lam);
  const cdf = (x: number) => (k === 'normal' ? Phi((x - mu) / sig) : x < 0 ? 0 : 1 - Math.exp(-x / lam));
  const pn = (n: number) => (lam ** n * Math.exp(-lam)) / fact(n);
  const lo = Math.min(a, b), hi = Math.max(a, b);
  let prob: number, mean: number, sd: number;
  if (k === 'poisson') { prob = 0; for (let n = Math.ceil(lo); n <= Math.floor(hi); n++) if (n >= 0) prob += pn(n); mean = lam; sd = Math.sqrt(lam); }
  else { prob = cdf(hi) - cdf(lo); mean = k === 'normal' ? mu : lam; sd = k === 'normal' ? sig : lam; }
  const ref = usePlot(view, (p) => {
    p.axes({ xLabel: 'x' });
    if (k === 'poisson') {
      for (let n = 0; n <= 12; n++) { const inside = n >= lo && n <= hi; p.rect(n - 0.4, 0, n + 0.4, pn(n), inside ? p.c.area : p.c.f1, { alpha: inside ? 0.6 : 0.3 }); }
    } else {
      p.fillUnder(pdf, Math.max(lo, view.xMin), Math.min(hi, view.xMax), p.c.area, 0.45);
      p.fn(pdf, p.c.f1, { width: 3 });
    }
    p.line(mean, view.yMin, mean, view.yMax, p.c.red, { width: 1.4, dash: [4, 3] });
    p.line(mean - sd, 0, mean + sd, 0, p.c.f2, { width: 4 });
  }, [k, mu, sig, lam, a, b]);
  const setKind = (v: K) => { setK(v); if (v === 'normal') { setA(-1); setB(1); } else if (v === 'exp') { setLam(4); setA(0); setB(12); } else { setLam(3); setA(0); setB(1); } };
  const notes: Record<K, string> = {
    normal: 'الطبيعي (منحنى الجرس): نحو **68%** من المساحة ضمن انحراف معياري واحد من المتوسط، و **95%** ضمن انحرافين. والمساحة الكلية تحته 1 بالضبط، لأن $\\int e^{-x^2/2}\\,dx = \\sqrt{2\\pi}$.',
    exp: 'المثال 4: عمر جهاز الفيديو بمتوسط 4 سنوات، $p(x) = \\tfrac14 e^{-x/4}$. احتمال العطل خلال 12 سنة $1 - e^{-3} \\approx 0.95$. **المتوسط $1/a$ والانحراف $1/a$ أيضاً.**',
    poisson: 'المثال 3: في المتوسط $\\lambda = 3$ من 100 مسافر لا يحضرون. الطائرة 98 مقعداً، فأحدٌ يُستبعد إذا حضر 99 أو 100: أي إذا غاب 0 أو 1. **الاحتمال $e^{-3} + 3e^{-3} \\approx 0.2$.** هنا الاحتمال مجموع أعمدة لا مساحة.',
  };
  return (
    <Widget title="كثافة الاحتمال" hint="في الاحتمال المتصل لكل قيمة بعينها احتمال صفر، **لكن لكل فترة احتمالاً**: المساحة تحت الكثافة $p(x)$ من $a$ إلى $b$ (الأخضر). الخط الأحمر المتوسط $\mu = \int x\,p(x)\,dx$، والبرتقالي يمتد انحرافاً معيارياً $\sigma$ على جانبيه.">
      <Choice value={k} onChange={setKind} options={[{ v: 'normal', label: 'طبيعي' }, { v: 'exp', label: 'أسّي' }, { v: 'poisson', label: 'بواسون (منفصل)' }]} />
      <Canvas refEl={ref} ratio={0.5} label="كثافة الاحتمال والمساحة المظللة" />
      <div className="controls">
        {k === 'normal' ? <>
          <Slider label="$\mu$" value={mu} min={-2} max={2} step={0.05} onChange={setMu} show={(v) => fmt(v, 2)} color="var(--red)" />
          <Slider label="$\sigma$" value={sig} min={0.5} max={2} step={0.05} onChange={setSig} show={(v) => fmt(v, 2)} color="var(--f2)" />
        </> : <Slider label={k === 'exp' ? 'المتوسط $1/a$' : '$\\lambda$'} value={lam} min={0.5} max={8} step={0.1} onChange={setLam} show={(v) => fmt(v, 1)} color="var(--red)" />}
        <Slider label="$a$" value={a} min={view.xMin} max={view.xMax} step={k === 'poisson' ? 1 : 0.05} onChange={setA} show={(v) => fmt(v, 2)} color="var(--area)" />
        <Slider label="$b$" value={b} min={view.xMin} max={view.xMax} step={k === 'poisson' ? 1 : 0.05} onChange={setB} show={(v) => fmt(v, 2)} color="var(--area)" />
      </div>
      <Readout items={[
        { label: `Prob(${fmt(lo, 2)} ≤ X ≤ ${fmt(hi, 2)})`, value: fmt(prob, 4), color: 'var(--area)' },
        { label: '$\\mu$', value: fmt(mean, 3), color: 'var(--red)' },
        { label: '$\\sigma$', value: fmt(sd, 3), color: 'var(--f2)' },
      ]} />
      <MathText as="div" className="verdict">{notes[k]}</MathText>
    </Widget>
  );
}
