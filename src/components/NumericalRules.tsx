import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type Rule = 'R' | 'L' | 'T' | 'M' | 'S' | 'G';
interface Fn { label: string; y: (x: number) => number; a: number; b: number; I: number; view: View }
const fns: Record<string, Fn> = {
  x2: { label: '$x^2$', y: (x) => x * x, a: 0, b: 1, I: 1 / 3, view: { xMin: -0.04, xMax: 1.04, yMin: -0.06, yMax: 1.1 } },
  x4: { label: '$x^4$', y: (x) => x ** 4, a: 0, b: 1, I: 0.2, view: { xMin: -0.04, xMax: 1.04, yMin: -0.06, yMax: 1.1 } },
  sqrt: { label: '$\\sqrt{x}$', y: Math.sqrt, a: 0, b: 1, I: 2 / 3, view: { xMin: -0.04, xMax: 1.04, yMin: -0.06, yMax: 1.1 } },
  pi: { label: '$\\dfrac{4}{1 + x^2}$', y: (x) => 4 / (1 + x * x), a: 0, b: 1, I: Math.PI, view: { xMin: -0.04, xMax: 1.04, yMin: -0.1, yMax: 4.3 } },
  per: { label: '$\\dfrac{1}{10 + \\cos 2\\pi x}$', y: (x) => 1 / (10 + Math.cos(2 * Math.PI * x)), a: 0, b: 1, I: 1 / Math.sqrt(99), view: { xMin: -0.04, xMax: 1.04, yMin: 0.085, yMax: 0.115 } },
};

const rules: { v: Rule; label: string; p: string }[] = [
  { v: 'R', label: 'مستطيل أيمن $R_n$', p: '1' }, { v: 'L', label: 'مستطيل أيسر $L_n$', p: '1' },
  { v: 'T', label: 'شبه منحرف $T_n$', p: '2' }, { v: 'M', label: 'نقطة وسطى $M_n$', p: '2' },
  { v: 'S', label: 'سمبسون $S_n$', p: '4' }, { v: 'G', label: 'غاوس', p: '4' },
];

function apply(rule: Rule, y: (x: number) => number, a: number, b: number, n: number) {
  const h = (b - a) / n; let s = 0;
  const g = (1 - 1 / Math.sqrt(3)) / 2;
  for (let j = 0; j < n; j++) {
    const x0 = a + j * h, x1 = x0 + h, xm = x0 + h / 2;
    if (rule === 'R') s += y(x1);
    else if (rule === 'L') s += y(x0);
    else if (rule === 'T') s += (y(x0) + y(x1)) / 2;
    else if (rule === 'M') s += y(xm);
    else if (rule === 'S') s += (y(x0) + 4 * y(xm) + y(x1)) / 6;
    else s += (y(x0 + g * h) + y(x1 - g * h)) / 2;
  }
  return s * h;
}

/** 5.8 — قواعد التكامل العددي ورتبها: الخطأ يتناسب مع (Δx)^p. */
export default function NumericalRules() {
  const [k, setK] = useState('x4');
  const F = fns[k];
  const [rule, setRule] = useState<Rule>('T');
  const [n, setN] = useState(4);
  const h = (F.b - F.a) / n;
  const val = apply(rule, F.y, F.a, F.b, n);
  const err = val - F.I;
  const ref = usePlot(F.view, (p) => {
    p.axes();
    const C = p.c, stroke = n <= 40;
    for (let j = 0; j < n; j++) {
      const x0 = F.a + j * h, x1 = x0 + h, xm = x0 + h / 2;
      if (rule === 'R' || rule === 'L' || rule === 'M') {
        const yy = F.y(rule === 'R' ? x1 : rule === 'L' ? x0 : xm);
        p.rect(x0, 0, x1, yy, C.f2, { alpha: 0.3, stroke });
        if (rule === 'M' && n <= 40) p.point(xm, yy, C.f2, 3);
      } else {
        const ctx = p.ctx; ctx.beginPath(); ctx.moveTo(p.X(x0), p.Y(Math.max(F.view.yMin, 0)));
        const steps = 24;
        for (let i = 0; i <= steps; i++) {
          const x = x0 + (h * i) / steps; let yy: number;
          if (rule === 'T') yy = F.y(x0) + ((F.y(x1) - F.y(x0)) * i) / steps;
          else {
            // سمبسون: قطع مكافئ عبر y0, y½, y1. غاوس: نعرض القطع نفسه لتوضيح أنه رتبة 4 أيضاً.
            const u = i / steps, y0 = F.y(x0), ym = F.y(xm), y1 = F.y(x1);
            yy = y0 * (1 - u) * (1 - 2 * u) + ym * 4 * u * (1 - u) + y1 * u * (2 * u - 1);
          }
          ctx.lineTo(p.X(x), p.Y(yy));
        }
        ctx.lineTo(p.X(x1), p.Y(Math.max(F.view.yMin, 0))); ctx.closePath();
        ctx.fillStyle = C.f2; ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1;
        if (stroke) { ctx.strokeStyle = C.f2; ctx.lineWidth = 1; ctx.stroke(); }
        if (rule === 'G' && n <= 40) { const g = (1 - 1 / Math.sqrt(3)) / 2; p.point(x0 + g * h, F.y(x0 + g * h), C.red, 3.5); p.point(x1 - g * h, F.y(x1 - g * h), C.red, 3.5); }
      }
    }
    p.fn(F.y, C.f1, { width: 2.4, from: F.a, to: F.b });
  }, [k, rule, n]);

  // رسم الخطأ مقابل n على مقياس لوغاريتمي لكل القواعد
  const ns = [1, 2, 4, 8, 16, 32, 64, 128, 256];
  const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-16));
  const chart = usePlot({ xMin: -0.15, xMax: 2.55, yMin: -16.5, yMax: 0.5 }, (p) => {
    p.axes({ xLabel: 'log n', yLabel: 'log|err|', xStep: 0.5, yStep: 2 });
    const cols: Record<Rule, string> = { R: p.c['ink-3'], L: p.c['ink-3'], T: p.c.f1, M: p.c.teal, S: p.c.f2, G: p.c.red };
    for (const r of rules) {
      const pts = ns.map((m) => [Math.log10(m), lg(apply(r.v, F.y, F.a, F.b, m) - F.I)] as [number, number]);
      for (let i = 1; i < pts.length; i++) p.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], cols[r.v], { width: r.v === rule ? 3 : 1.2, dash: r.v === 'L' ? [4, 3] : [] });
      if (r.v === rule) for (const q of pts) p.point(q[0], q[1], cols[r.v], 3.5);
    }
    p.point(Math.log10(n), lg(err), p.c.ink, 6);
  }, [k, rule, n]);

  const R = rules.find((r) => r.v === rule)!;
  return (
    <Widget title="قواعد التكامل العددي" hint="أعلى: الشكل الذي تستعمله القاعدة في كل فترة: مستطيل، أو شبه منحرف، أو **قطع مكافئ** (سمبسون). أسفل: لوغاريتم الخطأ مقابل لوغاريتم $n$. **ميل كل خط هو $-p$**، رتبة القاعدة: مضاعفة $n$ تقسم الخطأ على $2^p$. والدالة الدورية تكسر كل التوقعات.">
      <Choice value={k} onChange={setK} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <Choice value={rule} onChange={setRule} options={rules.map((r) => ({ v: r.v, label: r.label }))} />
      <Canvas refEl={ref} ratio={0.42} label="شكل القاعدة في كل فترة" />
      <div className="controls">
        <Slider label="$n$" value={n} min={1} max={64} step={1} onChange={setN} />
      </div>
      <Readout items={[
        { label: 'القاعدة', value: val.toPrecision(10), color: 'var(--f2)' },
        { label: 'الدقيق', value: F.I.toPrecision(10), color: 'var(--f1)' },
        { label: 'الخطأ', value: err === 0 ? '0' : err.toExponential(2), color: 'var(--red)' },
        { label: 'الرتبة $p$', value: R.p },
      ]} />
      <Canvas refEl={chart} ratio={0.42} label="الخطأ مقابل n على مقياس لوغاريتمي" />
      <MathText as="div" className="verdict">{k === 'per' ? '**دالة دورية على دورة كاملة**: المستطيلات وشبه المنحرف تصل إلى دقة الآلة بسرعة أُسّية، أسرع حتى من سمبسون. كل حدود الخطأ $y\'(b) - y\'(a)$ و $y\'\'\'(b) - y\'\'\'(a)$… أصفار.' : k === 'sqrt' ? 'مشتقة $\\sqrt{x}$ لانهائية عند $x = 0$، **فتنهار توقعات الرتب**: كل القواعد تتباطأ. لهذا تغيّر الآلات الحاسبة المتغير لتتجنب نقطة الطرف.' : k === 'x4' ? 'سمبسون خطؤه مع $x^4$ هو $\\tfrac{1}{120}(\\Delta x)^4$، وغاوس أفضل قليلاً. **ومع $x^3$ يكون سمبسون دقيقاً تماماً**، وهذه مفاجأة: صُمّم للقطوع المكافئة فقط.' : k === 'x2' ? 'شبه المنحرف خطؤه $\\tfrac16(\\Delta x)^2$ ونقطة الوسط $-\\tfrac1{12}(\\Delta x)^2$: **الوسط أدق مرتين وفي الاتجاه المعاكس**. فالخليط $\\tfrac23 M + \\tfrac13 T$ يلغي الخطأ: هذا سمبسون.' : 'التمرين 6: احسب $\\pi$ إلى ست منازل من $4\\int_0^1 \\dfrac{dx}{1 + x^2}$. جرّب كل قاعدة: كم قيمة لـ $n$ تحتاج؟'}</MathText>
    </Widget>
  );
}
