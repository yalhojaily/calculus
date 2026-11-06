import { useState } from 'react';
import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

const lf = (n: number) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; }; // ln n!
interface A { txt: string; label: string; ln: (n: number) => number; verdict: string; L: string }
// كل حد معطى بلوغاريتمه ln aₙ لتجنب الفيضان
const list: A[] = [
  { txt: '1', label: '$1$', ln: () => 0, L: '1', verdict: 'الحدود لا تذهب إلى الصفر (10A): تتباعد.' },
  { txt: '1/√n', label: '$1/\\sqrt n$', ln: (n) => -0.5 * Math.log(n), L: '1', verdict: 'تتباعد ($p = \\tfrac12 \\le 1$، اختبار التكامل). نسبة الحدود تقترب من 1: **اختبار النسبة صامت.**' },
  { txt: '1/n', label: '$1/n$', ln: (n) => -Math.log(n), L: '1', verdict: '**الحد الفاصل.** المتسلسلة التوافقية تتباعد، ببطء شديد (مثل $\\ln n$). اختبار النسبة صامت.' },
  { txt: '1/(n ln n)', label: '$1/(n\\ln n)$', ln: (n) => -Math.log(n) - Math.log(Math.log(n + 1)), L: '1', verdict: 'تتباعد أبطأ من التوافقية: التكامل $\\ln(\\ln x) \\to \\infty$، **ببطء شديد لكنه يصل** (المثال 10).' },
  { txt: '1/n(ln n)²', label: '$1/n(\\ln n)^2$', ln: (n) => -Math.log(n) - 2 * Math.log(Math.log(n + 1)), L: '1', verdict: 'تتقارب: التكامل $-1/\\ln x \\to 0$. **تقع قبل كل متسلسلات $p$** على الجانب المتقارب.' },
  { txt: '1/n²', label: '$1/n^2$', ln: (n) => -2 * Math.log(n), L: '1', verdict: 'تتقارب ($p = 2 \\gt 1$) إلى $\\pi^2/6$. **ومع ذلك نسبة الحدود تقترب من 1:** اختبار النسبة لا يميّز $p = 2$ من $p = 1$، واختبار التكامل أدق.' },
  { txt: '1/2ⁿ', label: '$1/2^n$', ln: (n) => -n * Math.LN2, L: '½', verdict: 'هندسية بنسبة $\\tfrac12$: $L = \\tfrac12 \\lt 1$ فتتقارب.' },
  { txt: 'n⁴/2ⁿ', label: '$n^4/2^n$', ln: (n) => 4 * Math.log(n) - n * Math.LN2, L: '½', verdict: 'المثال 6: **قوى $x^n$ أقوى من أي $n^p$**. النسبة $\\tfrac{(n + 1)^4}{2n^4} \\to \\tfrac12$، فتتقارب رغم $n^4$.' },
  { txt: '4ⁿ/n!', label: '$4^n/n!$', ln: (n) => n * Math.log(4) - lf(n), L: '0', verdict: 'المثال 7: **المضروب أقوى من أي $x^n$**. النسبة $4/(n + 1) \\to 0$. والمجموع معروف: $e^4 - 1$. الحدود تكبر أولاً ثم تنهار.' },
  { txt: '1/nⁿ', label: '$1/n^n$', ln: (n) => -n * Math.log(n), L: '0', verdict: 'المثال 8: مثالية لاختبار الجذر: $(a_n)^{1/n} = 1/n \\to 0$. **أسرع حتى من $\\sum 1/n!$.**' },
];

/** 10.2 — مختبر التقارب: سلسلة من الأكثر تباعداً إلى الأكثر تقارباً، مع المجاميع الجزئية والنسبة والجذر. */
export default function ConvergenceLab() {
  const [i, setI] = useState(2);
  const A = list[i];
  const M = 60;
  const ps: number[] = []; let s = 0; for (let n = 1; n <= M; n++) { s += Math.exp(A.ln(n)); ps.push(s); }
  const top = Math.max(2.2, Math.min(ps[M - 1] * 1.1, 60));
  const ref = usePlot({ xMin: 0, xMax: M + 1, yMin: -top * 0.04, yMax: top }, (p) => {
    p.axes({ xLabel: 'n', yLabel: 'sₙ', xStep: 10 });
    for (let n = 1; n <= M; n++) { const a = Math.exp(A.ln(n)); p.rect(n - 0.4, 0, n + 0.4, Math.min(a, top), p.c.f1, { alpha: 0.35, stroke: false }); }
    ps.forEach((v, n) => p.point(n + 1, Math.min(v, top), p.c.f2, 2.8));
  }, [i]);
  const n0 = 50, ratio = Math.exp(A.ln(n0 + 1) - A.ln(n0)), root = Math.exp(A.ln(n0) / n0);
  return (
    <Widget title="من الأكثر تباعداً إلى الأكثر تقارباً" hint="حرّك المنزلق على صف الكتاب: **التحول إلى التقارب بعد $1/n$**. الأعمدة الزرقاء الحدود $a_n$، والنقاط البرتقالية المجاميع الجزئية $s_n$. واقرأ النسبة $a_{n+1}/a_n$ والجذر $(a_n)^{1/n}$ عند $n = 50$: اختبارا النسبة والجذر (10D، 10E) يحكمان إذا كان الحد $L \lt 1$ أو $L \gt 1$، **ولا يقرران شيئاً عند $L = 1$**.">
      <Canvas refEl={ref} ratio={0.5} label="حدود المتسلسلة ومجاميعها الجزئية" />
      <div className="controls">
        <Slider label="المتسلسلة" value={i} min={0} max={list.length - 1} step={1} onChange={setI} show={(v) => `${v + 1} / ${list.length}`} />
      </div>
      <Readout items={[
        { label: '$a_n$', value: A.txt },
        { label: '$s_{60}$', value: ps[M - 1] > 1e6 ? '> 10⁶' : fmt(ps[M - 1], 4), color: 'var(--f2)' },
        { label: '$a_{51}/a_{50}$', value: fmt(ratio, 4) },
        { label: '$(a_{50})^{1/50}$', value: fmt(root, 4) },
        { label: 'الحد $L$', value: A.L, color: 'var(--violet)' },
      ]} />
      <MathText as="div" className="verdict">{`$\\sum ${A.label.replace(/\$/g, '')}$: ${A.verdict}`}</MathText>
    </Widget>
  );
}
