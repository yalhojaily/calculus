import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

interface R { label: string; target: number; tName: string; runners: { name: string; term: (k: number) => number; col: 'f1' | 'f2' | 'area' }[]; note: string }
const at = (x: number) => (k: number) => ((k % 2 ? -1 : 1) * x ** (2 * k + 1)) / (2 * k + 1); // حدود tan⁻¹ x
const races: Record<string, R> = {
  pi: {
    label: 'حساب π', target: Math.PI, tName: 'π',
    runners: [
      { name: 'لايبنتس: $4(1 - \\tfrac13 + \\tfrac15 - \\cdots)$', term: (k) => 4 * at(1)(k), col: 'f2' },
      { name: 'هالي: $6\\tan^{-1}(1/\\sqrt3)$', term: (k) => 6 * at(1 / Math.sqrt(3))(k), col: 'area' },
      { name: 'ماشين: $16\\tan^{-1}\\tfrac15 - 4\\tan^{-1}\\tfrac{1}{239}$', term: (k) => 16 * at(1 / 5)(k) - 4 * at(1 / 239)(k), col: 'f1' },
    ],
    note: '**لايبنتس بطيء جداً:** الحد رقم 5000 ما زال بحجم $0.0004$ تقريباً، فالخانة الرابعة لم تستقر. هالي ومساعده غيّرا إلى $x = 1/\\sqrt3$ فوجدا 71 خانة صحيحة لـ $\\pi/6$ وهما ينتظران المذنّب. وصيغة ماشين $\\tfrac\\pi4 = 4\\tan^{-1}\\tfrac15 - \\tan^{-1}\\tfrac{1}{239}$ أساس كل الحسابات حتى عام 1973.',
  },
  ln2: {
    label: 'حساب ln 2', target: Math.LN2, tName: 'ln 2',
    runners: [
      { name: '$1 - \\tfrac12 + \\tfrac13 - \\cdots$ ($x = 1$)', term: (k) => (k % 2 ? -1 : 1) / (k + 1), col: 'f2' },
      { name: '$\\tfrac12 + \\tfrac18 + \\tfrac1{24} + \\cdots$ ($x = \\tfrac12$)', term: (k) => 1 / ((k + 1) * 2 ** (k + 1)), col: 'area' },
      { name: '$2\\left(\\tfrac13 + \\tfrac{1}{3\\cdot 27} + \\cdots\\right)$ ($x = \\tfrac13$)', term: (k) => (2 * (1 / 3) ** (2 * k + 1)) / (2 * k + 1), col: 'f1' },
    ],
    note: '**لأول مرة في الكتاب نحسب لوغاريتماً!** المتسلسلة المتناوبة تتقارب ببطء. والمعادلة (13) تجمع $\\ln(1 + x)$ و $-\\ln(1 - x)$ فتُلغى القوى الزوجية: $\\ln\\dfrac{1 + x}{1 - x} = 2\\left(x + \\tfrac{x^3}{3} + \\tfrac{x^5}{5} + \\cdots\\right)$. عند $x = \\tfrac13$ يكون الطرف الأيسر $\\ln 2$، **وقوى $\\tfrac13$ أصغر بكثير.**',
  },
};
const N = 40;

/** 10.1 — سباق متسلسلات نحو π و ln 2: كلها صحيحة، لكن سرعتها مختلفة جداً. */
export default function SeriesRace() {
  const [k, setK] = useState('pi');
  const R = races[k];
  const clock = useClock(8, { loop: false });
  useEffect(() => { clock.setT(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const n = Math.max(1, Math.round(clock.t * N));
  const partial = R.runners.map((r) => { const a: number[] = []; let s = 0; for (let i = 0; i < N; i++) { s += r.term(i); a.push(s); } return a; });
  const ref = usePlot({ xMin: 0, xMax: N + 1, yMin: R.target * 0.7, yMax: R.target * 1.3 }, (p) => {
    p.axes({ xLabel: 'n', yLabel: 's', xStep: 10 });
    p.line(0, R.target, N + 1, R.target, p.c.ink, { width: 1.4, dash: [6, 4] });
    p.text(R.tName, N + 0.8, R.target, p.c.ink, { align: 'right', base: 'bottom', dy: -3 });
    R.runners.forEach((r, j) => {
      const ctx = p.ctx; ctx.beginPath();
      for (let i = 0; i < n; i++) { const X = p.X(i + 1), Y = p.Y(Math.max(p.view.yMin, Math.min(p.view.yMax, partial[j][i]))); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
      ctx.strokeStyle = p.c[r.col]; ctx.lineWidth = 2; ctx.stroke();
      p.point(n, Math.max(p.view.yMin, Math.min(p.view.yMax, partial[j][n - 1])), p.c[r.col], 4.5);
    });
  }, [k, n]);
  const digits = (e: number) => (e === 0 ? '15+' : String(Math.max(0, Math.floor(-Math.log10(e)))));
  return (
    <Widget title="سباق نحو π و ln 2" hint="ثلاث متسلسلات لكل عدد، **كلها صحيحة**. شغّل لتضيف الحدود واحداً بعد الآخر، وراقب كم خانة عشرية صحيحة يعطي كل مجموع جزئي. السرعة تأتي من **صِغَر $x$**: قوى العدد الصغير تموت بسرعة.">
      <Choice value={k} onChange={(v) => { setK(v); clock.setT(1); }} options={Object.keys(races).map((v) => ({ v, label: races[v].label }))} />
      <Canvas refEl={ref} ratio={0.5} label="المجاميع الجزئية لثلاث متسلسلات" />
      <AnimControls clock={clock} label="أضف الحدود" />
      <Readout items={[{ label: 'عدد الحدود', value: String(n) }, ...R.runners.map((r, j) => { const e = Math.abs(partial[j][n - 1] - R.target); return { label: `${r.name}: ${digits(e)} خانات صحيحة`, value: fmt(partial[j][n - 1], 10), color: `var(--${r.col})` }; })]} />
      <MathText as="div" className="verdict">{R.note}</MathText>
    </Widget>
  );
}
