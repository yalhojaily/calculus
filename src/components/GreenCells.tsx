import { useMemo, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type V2 = [number, number];
interface Fd { label: string; F: (x: number, y: number) => V2; curl: (x: number, y: number) => number; div: (x: number, y: number) => number }
const q = (x: number, y: number) => x * x + y * y;
const fields: Record<string, Fd> = {
  S: { label: '$-y\\mathbf i + x\\mathbf j$', F: (x, y) => [-y, x], curl: () => 2, div: () => 0 },
  R: { label: '$x\\mathbf i + y\\mathbf j$', F: (x, y) => [x, y], curl: () => 0, div: () => 2 },
  B: { label: '$x^2\\mathbf i + xy\\mathbf j$', F: (x, y) => [x * x, x * y], curl: (_x, y) => y, div: (x) => 3 * x },
  Sh: { label: '$y\\mathbf i$', F: (x, y) => [y, 0], curl: () => -1, div: () => 0 },
  S2: { label: '$\\mathbf S/r^2$', F: (x, y) => [-y / q(x, y), x / q(x, y)], curl: () => 0, div: () => 0 },
};
// المربع مزاح قليلاً حتى لا تمر خطوط الشبكة بالأصل (المهم لـ S/r²)
const X0 = -0.9, Y0 = -0.87, W = 2;
const K = 120;
/** ∮ على حافة مستقيمة من a إلى b: الدوران F·dR أو التدفق F·n ds حيث n ds = (dy, −dx) */
function edge(F: Fd['F'], a: V2, b: V2, flux: boolean) {
  let s = 0; const dx = (b[0] - a[0]) / K, dy = (b[1] - a[1]) / K;
  for (let i = 0; i < K; i++) { const x = a[0] + (i + 0.5) * dx, y = a[1] + (i + 0.5) * dy; const [M, N] = F(x, y); s += flux ? M * dy - N * dx : M * dx + N * dy; }
  return s;
}
const loop = (F: Fd['F'], x0: number, y0: number, h: number, flux: boolean) =>
  edge(F, [x0, y0], [x0 + h, y0], flux) + edge(F, [x0 + h, y0], [x0 + h, y0 + h], flux) + edge(F, [x0 + h, y0 + h], [x0, y0 + h], flux) + edge(F, [x0, y0 + h], [x0, y0], flux);

/** 15.3 — مبرهنة غرين: الدوران حول الحد = مجموع دورانات الخلايا الصغيرة (الحواف الداخلية تتلاشى) = ∬ (N_x − M_y) dA. وصيغة التدفق مع التباعد. */
export default function GreenCells() {
  const [k, setK] = useState('S');
  const [mode, setMode] = useState<'work' | 'flux'>('work');
  const [n, setN] = useState(3);
  const fd = fields[k]; const flux = mode === 'flux';
  const h = W / n;
  const cells = useMemo(() => {
    const out: { x: number; y: number; v: number }[] = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = X0 + i * h, y = Y0 + j * h; out.push({ x, y, v: loop(fd.F, x, y, h, flux) }); }
    return out;
  }, [fd, n, flux, h]);
  const total = useMemo(() => loop(fd.F, X0, Y0, W, flux), [fd, flux]);
  const sum = cells.reduce((a, c) => a + c.v, 0);
  const dbl = useMemo(() => { const m = 60, d = W / m; let s = 0; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const x = X0 + (i + 0.5) * d, y = Y0 + (j + 0.5) * d; s += (flux ? fd.div(x, y) : fd.curl(x, y)) * d * d; } return s; }, [fd, flux]);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -1.25, 1.45, -1.2, 1.45);
    p.axes({ xLabel: 'x', yLabel: 'y', xStep: 0.5, yStep: 0.5 });
    const vmax = Math.max(1e-9, ...cells.map((c) => Math.abs(c.v)));
    for (const c of cells) {
      const a = Math.abs(c.v) / vmax;
      if (a > 1e-3) p.rect(c.x, c.y, c.x + h, c.y + h, c.v > 0 ? p.c.teal : p.c.red, { alpha: 0.12 + 0.4 * a, stroke: false });
      // حواف الخلية الداخلية: أسهم صغيرة عكس عقارب الساعة (تتلاشى مع جاراتها)
      p.rect(c.x, c.y, c.x + h, c.y + h, p.c['ink-3'], { alpha: 0 });
      const cx = c.x + h / 2, cy = c.y + h / 2, r = h * 0.22;
      if (a > 0.02) {
        if (!flux) {
          const dir = c.v > 0 ? 1 : -1;
          p.curve((t) => cx + r * Math.cos(dir * t), (t) => cy + r * Math.sin(dir * t), 0.3, 5.4, p.c.ink, { width: 1.3 });
          const e = 5.4; p.arrow(cx + r * Math.cos(dir * (e - 0.4)), cy + r * Math.sin(dir * (e - 0.4)), cx + r * Math.cos(dir * e), cy + r * Math.sin(dir * e), p.c.ink, { width: 1.3, head: 8 });
        } else {
          const dir = c.v > 0 ? 1 : -1;
          for (let m = 0; m < 4; m++) { const t = (m * Math.PI) / 2; const a1 = dir > 0 ? r * 0.4 : r * 1.4, a2 = dir > 0 ? r * 1.4 : r * 0.4; p.arrow(cx + a1 * Math.cos(t), cy + a1 * Math.sin(t), cx + a2 * Math.cos(t), cy + a2 * Math.sin(t), p.c.ink, { width: 1.2, head: 4 }); }
        }
      }
    }
    // الحقل
    for (let x = -1.1; x <= 1.35; x += 0.25) for (let y = -1.1; y <= 1.35; y += 0.25) {
      const [m, nn] = fd.F(x, y); const g = Math.hypot(m, nn); if (!Number.isFinite(g) || g < 1e-9) continue;
      const s = (0.17 * Math.tanh(g)) / g; p.arrow(x, y, x + s * m, y + s * nn, p.c.f1, { width: 1, head: 3.5 });
    }
    // الحد C عكس عقارب الساعة
    const cs: V2[] = [[X0, Y0], [X0 + W, Y0], [X0 + W, Y0 + W], [X0, Y0 + W], [X0, Y0]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = [cs[i], cs[i + 1]];
      p.line(a[0], a[1], b[0], b[1], p.c.violet, { width: 3 });
      p.arrow(a[0] + 0.45 * (b[0] - a[0]), a[1] + 0.45 * (b[1] - a[1]), a[0] + 0.58 * (b[0] - a[0]), a[1] + 0.58 * (b[1] - a[1]), p.c.violet, { width: 3, head: 9 });
    }
    if (k === 'S2') p.point(0, 0, p.c.red, 5);
  }, [k, mode, n, cells]);
  const lineLab = flux ? '$\\oint\\mathbf F\\cdot\\mathbf n\\,ds$ عبر $C$' : '$\\oint M\\,dx + N\\,dy$ حول $C$';
  const dblLab = flux ? '$\\iint(M_x + N_y)\\,dA$' : '$\\iint(N_x - M_y)\\,dA$';
  return (
    <Widget title="مبرهنة غرين: الخلايا الصغيرة" hint={flux
      ? '**صيغة التدفق:** ما يخرج عبر الحد $C$ يساوي مجموع ما **ينبع** داخل كل خلية: التباعد $M_x + N_y$. كل خلية تعرض تدفقها الخارج (أسهم للخارج) أو الداخل. **التدفق عبر حافة مشتركة يخرج من خلية ويدخل جارتها**، فيبقى الحد الخارجي وحده.'
      : '**قسّم المنطقة خلايا.** دوران كل خلية صغيرة (حول حدودها عكس عقارب الساعة) قرب $(N_x - M_y)\\,\\Delta A$. **على كل حافة داخلية مشتركة تسير الخليتان في اتجاهين متعاكسين، فيتلاشى الشغل**، ولا يبقى إلا الحد الخارجي $C$ (البنفسجي). هذه هي مبرهنة غرين.'}>
      <Choice value={mode} onChange={setMode} options={[{ v: 'work', label: 'الدوران (الشغل)' }, { v: 'flux', label: 'التدفق' }]} />
      <Choice value={k} onChange={setK} options={Object.keys(fields).map((v) => ({ v, label: fields[v].label }))} />
      <Canvas refEl={ref} ratio={0.9} label="منطقة مقسمة خلايا مع دوران أو تدفق كل خلية" />
      <div className="controls">
        <Slider label="الخلايا في كل اتجاه" value={n} min={1} max={8} step={1} onChange={setN} show={(v) => `${v} × ${v}`} />
      </div>
      <Readout items={[
        { label: lineLab, value: fmt(total, 4), color: 'var(--violet)' },
        { label: 'مجموع الخلايا', value: fmt(sum, 4), color: 'var(--teal)' },
        { label: dblLab, value: fmt(dbl, 4) },
      ]} />
      <MathText as="div" className="verdict">{k === 'S2'
        ? (flux ? '$\\mathbf S/r^2$ بلا مصدر: كل الأعمدة صفر.' : '**المثال 4: الاستثناء!** $N_x - M_y = 0$ في كل مكان **إلا الأصل** (النقطة الحمراء)، فالتكامل الثنائي العادي صفر. لكن الدوران حول $C$ هو $2\\pi$، **وكله في الخلية التي تحتوي الأصل**: الزاوية $\\theta$ تزداد $2\\pi$ في الدورة. مبرهنة غرين تحتاج حقلاً أملس داخل $R$ كلها.')
        : flux ? '**15F:** $\\oint\\mathbf F\\cdot\\mathbf n\\,ds = \\iint(M_x + N_y)\\,dA$. لـ $x\\mathbf i + y\\mathbf j$ التباعد 2 في كل مكان، فالتدفق ضعف المساحة. **ولحقل الدوران التباعد صفر**: ما يدخل يخرج (المثال 6).'
          : '**15E:** $\\oint_C M\\,dx + N\\,dy = \\iint_R(N_x - M_y)\\,dA$. لحقل الدوران $N_x - M_y = 2$، فالشغل ضعف المساحة. **ولحقل تدرّج $N_x = M_y$**: الشغل حول أي مسار مغلق صفر.'}</MathText>
    </Widget>
  );
}
