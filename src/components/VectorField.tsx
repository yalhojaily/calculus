import { useEffect, useMemo, useState } from 'react';
import { fitEqual } from '../lib/polar';
import type { Plot } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Widget, useClock, usePlot } from './ui';

type V2 = [number, number];
interface Fd { label: string; F: (x: number, y: number) => V2; grad: boolean; note: string; equip?: (p: Plot) => void }
const r2 = (x: number, y: number) => x * x + y * y;
const circles = (p: Plot) => { for (const r of [0.5, 1, 1.5, 2, 2.5]) p.curve((t) => r * Math.cos(t), (t) => r * Math.sin(t), 0, 2 * Math.PI, p.c.f2, { width: 1.3, dash: [5, 4] }); };
const rays = (p: Plot) => { for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; p.line(0, 0, 4 * Math.cos(a), 4 * Math.sin(a), p.c.f2, { width: 1.3, dash: [5, 4] }); } };

const fields: Record<string, Fd> = {
  R: { label: '$\\mathbf R$', F: (x, y) => [x, y], grad: true, equip: circles, note: '**المثال 1: $\\mathbf R = x\\mathbf i + y\\mathbf j$** يشير إلى الخارج وطوله $r$. **حقل تدرّج:** $\\mathbf R = \\nabla f$ مع $f = \\tfrac12(x^2 + y^2)$. خطوط التساوي (البرتقالية) دوائر، عمودية على خطوط الانسياب (أشعة).' },
  Ru: { label: '$\\mathbf R/r$', F: (x, y) => { const r = Math.sqrt(r2(x, y)); return [x / r, y / r]; }, grad: true, equip: circles, note: '**المثال 2:** متجهات وحدة $\\mathbf u_r$ إلى الخارج. تدرّج $f = r$. الأوراق تبتعد بسرعة ثابتة 1.' },
  R2: { label: '$\\mathbf R/r^2$', F: (x, y) => { const q = r2(x, y); return [x / q, y / q]; }, grad: true, equip: circles, note: 'طوله $1/r$: حقل شحنة خطية (التمرين 26). تدرّج $f = \\ln r$. **كل $\\mathbf R/r^n$ حقل تدرّج.**' },
  S: { label: '$\\mathbf S$', F: (x, y) => [-y, x], grad: false, note: '**المثال 3: حقل الدوران $\\mathbf S = -y\\mathbf i + x\\mathbf j$**، عمودي على $\\mathbf R$ ($\\mathbf S\\cdot\\mathbf R = 0$) وطوله $r$. **ليس تدرّجاً:** لا توجد $f$ مع $f_x = -y$ و $f_y = x$. الأوراق تدور كقرص صلب، وتعود بعد زمن $2\\pi$ مهما بعدت.' },
  Su: { label: '$\\mathbf S/r$', F: (x, y) => { const r = Math.sqrt(r2(x, y)); return [-y / r, x / r]; }, grad: false, note: 'متجهات وحدة $\\mathbf u_\\theta$ حول الأصل. **ليس تدرّجاً** أيضاً: الأوراق البعيدة تحتاج زمناً أطول لدورة كاملة.' },
  S2: { label: '$\\mathbf S/r^2$', F: (x, y) => { const q = r2(x, y); return [-y / q, x / q]; }, grad: true, equip: rays, note: '**المفاجأة (15A):** $\\mathbf S/r^2$ هو تدرّج **الزاوية القطبية** $f = \\theta$! خطوط التساوي أشعة. لكن $\\theta$ تزداد $2\\pi$ بعد دورة: **مشكلة عند الأصل** يعود إليها القسم 15.3.' },
  G: { label: '$\\nabla(x^2y)$', F: (x, y) => [2 * x * y, x * x], grad: true, note: '**المثال 4:** اختر أي دالة، مثل $f = x^2y$، فتحصل فوراً على حقل تدرّج $\\mathbf F = 2xy\\mathbf i + x^2\\mathbf j$. البرتقالية خطوط التساوي $x^2y = c$، والأوراق تعبرها بزاوية قائمة.' },
  Sh: { label: '$y\\mathbf i$', F: (x, y) => [y, 0], grad: false, note: '**حقل القص** (المثال 2 من 15.2): رياح شرقية تشتد مع $y$. **ليس تدرّجاً:** $f_x = y$ تجعل $f$ تعتمد على $y$، و $f_y = 0$ تمنع ذلك. الأوراق تسير أفقياً، والطبقات تنزلق بعضها فوق بعض.' },
};
// خطوط التساوي x²y = c: y = c/x²
fields.G.equip = (p) => { for (const c of [-3, -1, -0.3, 0.3, 1, 3]) for (const s of [-1, 1]) p.fn((x) => c / (x * x), p.c.f2, { width: 1.3, dash: [5, 4], from: s > 0 ? 0.05 : -3, to: s > 0 ? 3 : -0.05 }); };

const L = 2.6, T = 7, DT = 0.02;
const seeds: V2[] = [];
for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) seeds.push([(i + 0.35 * ((j + 7) % 2)) * 0.78, j * 0.78 + 0.1]);

function rk4(F: Fd['F'], [x, y]: V2, h: number): V2 {
  const a = F(x, y), b = F(x + (h / 2) * a[0], y + (h / 2) * a[1]), c = F(x + (h / 2) * b[0], y + (h / 2) * b[1]), d = F(x + h * c[0], y + h * c[1]);
  return [x + (h / 6) * (a[0] + 2 * b[0] + 2 * c[0] + d[0]), y + (h / 6) * (a[1] + 2 * b[1] + 2 * c[1] + d[1])];
}

/** 15.1 — الحقول المتجهة: سهم عند كل نقطة. أوراق تسقط على الماء فتسير على خطوط الانسياب، وخطوط التساوي عمودية عليها لحقول التدرّج. */
export default function VectorField({ initial = 'R', only }: { initial?: string; only?: string[] }) {
  const [k, setK] = useState(initial);
  const [lines, setLines] = useState(true);
  const fd = fields[k];
  const clock = useClock(T, { loop: true });
  useEffect(() => { clock.setT(0.35); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const paths = useMemo(() => seeds.map((s) => {
    const out: V2[] = [s]; let q = s;
    for (let n = 0; n < T / DT; n++) {
      if (r2(q[0], q[1]) < 0.02 || Math.abs(q[0]) > L + 0.5 || Math.abs(q[1]) > L + 0.5) break;
      q = rk4(fd.F, q, DT); out.push(q);
    }
    return out;
  }), [fd]);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -L, L, -L, L);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    if (lines && fd.equip) fd.equip(p);
    if (lines) for (const pt of paths) for (let i = 1; i < pt.length; i += 1) p.line(pt[i - 1][0], pt[i - 1][1], pt[i][0], pt[i][1], p.c.f1, { width: 0.9 });
    // الأسهم: الاتجاه حقيقي، والطول مضغوط ليبقى مقروءاً
    const st = 0.52;
    for (let x = -L + 0.2; x <= L; x += st) for (let y = -L + 0.2; y <= L; y += st) {
      const [m, n] = fd.F(x, y); const g = Math.hypot(m, n); if (!Number.isFinite(g) || g < 1e-9) continue;
      const s = (0.42 * Math.tanh(g / 1.4)) / g;
      p.arrow(x, y, x + s * m, y + s * n, p.c['ink-3'], { width: 1.1, head: 4 });
    }
    // الأوراق
    const tt = clock.t * T;
    paths.forEach((pt, i) => {
      const ph = ((i * 0.618) % 1) * T; const idx = Math.floor((((tt + ph) % T) / DT));
      if (idx < pt.length) p.point(pt[idx][0], pt[idx][1], p.c.red, 4);
    });
    p.point(0, 0, p.c.ink, 2.5);
  }, [k, lines, paths, clock.t]);
  const keys = only ?? Object.keys(fields);
  return (
    <Widget title="حقل متجه: سهم عند كل نقطة" hint="الحقل $\mathbf F(x, y) = M\mathbf i + N\mathbf j$ يعطي **متجهاً عند كل نقطة**. **النقاط الحمراء أوراق** على سطح نهر يجري بسرعة $\mathbf F$: تسير على **خطوط الانسياب** (الزرقاء)، حيث $dy/dx = N/M$. والخطوط البرتقالية المتقطعة **خطوط التساوي** $f = c$ لحقول التدرّج: عمودية دائماً على خطوط الانسياب.">
      <Choice value={k} onChange={setK} options={keys.map((v) => ({ v, label: fields[v].label }))} />
      <Canvas refEl={ref} ratio={0.9} label="حقل متجه وأوراق تجري معه" />
      <AnimControls clock={clock} label="أسقط الأوراق" />
      <Choice value={lines ? 1 : 0} onChange={(v) => setLines(v === 1)} options={[{ v: 1, label: 'مع خطوط الانسياب والتساوي' }, { v: 0, label: 'الأسهم فقط' }]} />
      <MathText as="div" className="verdict">{(fd.grad ? '**حقل تدرّج (محافظ).** ' : '**ليس حقل تدرّج.** ') + fd.note}</MathText>
    </Widget>
  );
}
