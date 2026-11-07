import { useEffect, useMemo, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Choice, Readout, Widget, useClock, usePlot } from './ui';

type V2 = [number, number];
const fields: Record<string, { label: string; F: (x: number, y: number) => V2; f?: (x: number, y: number) => number; name: string }> = {
  S: { label: '$\\mathbf S = -y\\mathbf i + x\\mathbf j$', F: (x, y) => [-y, x], name: 'حقل الدوران' },
  G: { label: '$\\nabla(xy + y^2)$', F: (x, y) => [y, x + 2 * y], f: (x, y) => x * y + y * y, name: 'حقل تدرّج' },
  Sh: { label: '$y\\mathbf i$', F: (x, y) => [y, 0], name: 'حقل القص' },
  C: { label: '$\\mathbf i$', F: () => [1, 0], f: (x) => x, name: 'رياح ثابتة' },
};
const paths: Record<string, { label: string; R: (s: number) => V2 }> = {
  line: { label: 'خط مستقيم', R: (s) => [1 - s, s] },
  arc: { label: 'ربع دائرة', R: (s) => [Math.cos((Math.PI * s) / 2), Math.sin((Math.PI * s) / 2)] },
  o: { label: 'عبر الأصل', R: (s) => (s < 0.5 ? [1 - 2 * s, 0] : [0, 2 * s - 1]) },
  c: { label: 'عبر $(1, 1)$', R: (s) => (s < 0.5 ? [1, 2 * s] : [2 - 2 * s, 1]) },
};
const N = 800;
function work(F: (x: number, y: number) => V2, R: (s: number) => V2) {
  const cum = [0]; let w = 0;
  for (let i = 0; i < N; i++) {
    const a = R(i / N), b = R((i + 1) / N), m: V2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const [M, Nn] = F(m[0], m[1]); w += M * (b[0] - a[0]) + Nn * (b[1] - a[1]); cum.push(w);
  }
  return cum;
}

/** 15.2 — الشغل ∫ F·dR = ∫ M dx + N dy على مسار من (1, 0) إلى (0, 1). لحقل تدرّج لا يعتمد على المسار. */
export default function WorkPath() {
  const [fk, setFk] = useState('S');
  const [pk, setPk] = useState('line');
  const fd = fields[fk], pd = paths[pk];
  const clock = useClock(5);
  useEffect(() => { clock.setT(0.6); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cum = useMemo(() => work(fd.F, pd.R), [fd, pd]);
  const all = useMemo(() => Object.keys(paths).map((k) => work(fd.F, paths[k].R)[N]), [fd]);
  const s = clock.t, idx = Math.min(N, Math.round(s * N));
  const P = pd.R(Math.min(s, 0.9999));
  const P2 = pd.R(Math.min(1, s + 1e-3)), P1 = pd.R(Math.max(0, Math.min(s, 0.9999) - 1e-3));
  const tl = Math.hypot(P2[0] - P1[0], P2[1] - P1[1]) || 1; const Tv: V2 = [(P2[0] - P1[0]) / tl, (P2[1] - P1[1]) / tl];
  const Fv = fd.F(P[0], P[1]);
  const FT = Fv[0] * Tv[0] + Fv[1] * Tv[1];
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -0.5, 1.6, -0.45, 1.5);
    p.axes({ xLabel: 'x', yLabel: 'y', xStep: 0.5, yStep: 0.5 });
    for (let x = -0.25; x <= 1.5; x += 0.25) for (let y = -0.25; y <= 1.4; y += 0.25) {
      const [m, n] = fd.F(x, y); const g = Math.hypot(m, n); if (g < 1e-9) continue;
      const k = (0.17 * Math.tanh(g)) / g; p.arrow(x, y, x + k * m, y + k * n, p.c['ink-3'], { width: 1, head: 3.5 });
    }
    // المسارات الأخرى باهتة
    for (const k of Object.keys(paths)) if (k !== pk) { const R = paths[k].R; p.curve((t) => R(t)[0], (t) => R(t)[1], 0, 1, p.c.line, { width: 1.5, dash: [4, 4], n: 200 }); }
    // المسار: الجزء المقطوع ملون بإشارة F·dR
    for (let i = 0; i < N; i += 4) {
      const a = pd.R(i / N), b = pd.R(Math.min(1, (i + 4) / N)); const d = cum[Math.min(N, i + 4)] - cum[i];
      const done = i / N < s;
      p.line(a[0], a[1], b[0], b[1], done ? (d >= 0 ? p.c.teal : p.c.red) : p.c.ink, { width: done ? 4 : 1.8 });
    }
    p.point(1, 0, p.c.ink, 4); p.point(0, 1, p.c.ink, 4);
    p.text('P', 1, 0, p.c.ink, { dx: 6, dy: 12 }); p.text('Q', 0, 1, p.c.ink, { dx: -14, dy: -6 });
    const g = Math.hypot(Fv[0], Fv[1]);
    if (g > 1e-9) { const k = 0.4 / Math.max(1, g); p.arrow(P[0], P[1], P[0] + k * Fv[0], P[1] + k * Fv[1], p.c.violet, { width: 2.6 }); }
    p.arrow(P[0], P[1], P[0] + 0.3 * Tv[0], P[1] + 0.3 * Tv[1], p.c.f1, { width: 2 });
    p.point(P[0], P[1], p.c.ink, 5);
  }, [fk, pk, s, cum]);
  const same = Math.max(...all) - Math.min(...all) < 1e-3;
  return (
    <Widget title="الشغل على مسار" hint="سافر من $P = (1, 0)$ إلى $Q = (0, 1)$ في الحقل $\mathbf F$. **عند كل خطوة صغيرة $d\mathbf R$ الشغل $\mathbf F\cdot d\mathbf R = M\,dx + N\,dy$**: البنفسجي $\mathbf F$، والأزرق المماس $\mathbf T$. الجزء الأخضر يساعد فيه الحقل الحركة ($\mathbf F\cdot\mathbf T \gt 0$)، والأحمر يعاكسها. **والشغل الكلي $\int_C\mathbf F\cdot\mathbf T\,ds$.**">
      <Choice value={fk} onChange={(v) => { setFk(v); clock.reset(); }} options={Object.keys(fields).map((v) => ({ v, label: fields[v].label }))} />
      <Choice value={pk} onChange={(v) => { setPk(v); clock.reset(); }} options={Object.keys(paths).map((v) => ({ v, label: paths[v].label }))} />
      <Canvas refEl={ref} ratio={0.85} label="حقل متجه ومسار والشغل عليه" />
      <AnimControls clock={clock} label="سافر" />
      <Readout items={[
        { label: '$\\mathbf F\\cdot\\mathbf T$ هنا', value: fmt(FT, 3), color: FT >= 0 ? 'var(--teal)' : 'var(--red)' },
        { label: 'الشغل حتى الآن', value: fmt(cum[idx], 4), color: 'var(--violet)' },
        { label: 'الشغل الكلي على هذا المسار', value: fmt(cum[N], 4) },
      ]} />
      <MathText as="div" className="verdict">{`**الشغل على المسارات الأربعة (${fd.name}):** خط ${fmt(all[0], 3)}، ربع دائرة ${fmt(all[1], 3)}، عبر الأصل ${fmt(all[2], 3)}، عبر (1, 1) ${fmt(all[3], 3)}. ` + (same
        ? (fd.f ? `**كلها متساوية!** الحقل تدرّج، فالشغل $f(Q) - f(P) = ${fmt(fd.f(0, 1) - fd.f(1, 0), 3)}$ مهما كان المسار **(15B)**.` : '')
        : (fk === 'S' ? '**يعتمد على المسار:** $\\mathbf S$ ليس تدرّجاً. والشغل دائماً **ضعف المساحة** بين المسار والمحورين: $1$ و $\\pi/2$ و $0$ و $2$ (التمرين 14).' : '**يعتمد على المسار:** حقل القص ليس تدرّجاً. على الخط الأفقي $y = 0$ لا شغل، لأن الرياح هناك صفر.'))}</MathText>
    </Widget>
  );
}
