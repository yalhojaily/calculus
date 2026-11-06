import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual, polarGrid } from '../lib/polar';
import { MathText } from './MathText';
import { AnimControls, Canvas, Readout, Slider, Widget, useClock, usePlot } from './ui';

/** 10.4 — e^{iθ} من متسلسلته: كل حد (iθ)ⁿ/n! يدور 90° عن سابقه، فالأسهم تلتف وتنتهي على دائرة الوحدة عند (cos θ, sin θ). */
export default function EulerSeries() {
  const [th, setTh] = useState(Math.PI);
  const clock = useClock(6, { loop: false });
  const NMAX = 24;
  useEffect(() => { clock.setT(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const n = Math.round(clock.t * NMAX);
  const pts: [number, number][] = [[0, 0]];
  let re = 0, im = 0, tr = 1, ti = 0; // الحد الحالي (iθ)^k/k!
  for (let k = 0; k <= n; k++) {
    re += tr; im += ti; pts.push([re, im]);
    const nr = (-ti * th) / (k + 1), ni = (tr * th) / (k + 1); tr = nr; ti = ni; // اضرب في iθ/(k+1)
  }
  let big = 1; { let r2 = 0, i2 = 0, a = 1, b = 0; for (let k = 0; k <= NMAX; k++) { r2 += a; i2 += b; big = Math.max(big, Math.abs(r2), Math.abs(i2)); const na = (-b * th) / (k + 1), nb = (a * th) / (k + 1); a = na; b = nb; } }
  const span = Math.max(1.3, Math.min(8, big * 1.1));
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, -span, span, -span, span);
    polarGrid(p, span * 1.5, span > 3 ? 1 : 0.5);
    p.curve(Math.cos, Math.sin, 0, 2 * Math.PI, p.c.f1, { width: 1.6 });
    const cols = [p.c.f2, p.c.area, p.c.violet, p.c.red];
    for (let k = 1; k < pts.length; k++) p.arrow(pts[k - 1][0], pts[k - 1][1], pts[k][0], pts[k][1], cols[(k - 1) % 4], { width: k < 8 ? 2.2 : 1.4, head: k < 8 ? 8 : 5 });
    p.point(Math.cos(th), Math.sin(th), p.c.f1, 6);
  }, [th, n]);
  const [sr, si] = pts[pts.length - 1];
  return (
    <Widget title="صيغة أويلر من المتسلسلة" hint="ضع $i\theta$ في متسلسلة $e^x$: $1 + i\theta + \dfrac{(i\theta)^2}{2!} + \dfrac{(i\theta)^3}{3!} + \cdots$. **كل حد هو السابق مضروباً في $i\theta/n$**، والضرب في $i$ يدير بزاوية $90°$: فالأسهم تلتف كالحلزون، والمضروب يصغّرها. الأسهم الأفقية تجمع $\cos\theta$ والرأسية $\sin\theta$. شغّل لترى المجموع يستقر على دائرة الوحدة.">
      <Canvas refEl={ref} ratio={0.75} label="المجاميع الجزئية لـ e^{iθ} في المستوى المركب" />
      <AnimControls clock={clock} label="أضف الحدود" />
      <div className="controls"><Slider label="$\theta$" value={th} min={0} max={2 * Math.PI} step={0.01} onChange={setTh} show={(v) => `${fmt(v, 2)} = ${fmt((v * 180) / Math.PI, 0)}°`} color="var(--f1)" /></div>
      <Readout items={[
        { label: 'عدد الحدود', value: String(n + 1) },
        { label: 'المجموع الجزئي', value: `${fmt(sr, 5)} ${si < 0 ? '−' : '+'} ${fmt(Math.abs(si), 5)}i`, color: 'var(--f2)' },
        { label: '$\\cos\\theta + i\\sin\\theta$', value: `${fmt(Math.cos(th), 5)} ${Math.sin(th) < 0 ? '−' : '+'} ${fmt(Math.abs(Math.sin(th)), 5)}i`, color: 'var(--f1)' },
      ]} />
      <MathText as="div" className="verdict">{'القوى الزوجية حقيقية لأن $i^2 = -1$ و $i^4 = 1$: $1 - \\tfrac{\\theta^2}{2!} + \\tfrac{\\theta^4}{4!} - \\cdots = \\cos\\theta$. والفردية تخيلية: $i\\left(\\theta - \\tfrac{\\theta^3}{3!} + \\cdots\\right) = i\\sin\\theta$. **إذن $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$**، ومع $\\theta = \\pi$ (البداية): $e^{i\\pi} = -1$. قيل عنها «من أعظم ألغاز رياضيات المرحلة الجامعية».'}</MathText>
    </Widget>
  );
}
