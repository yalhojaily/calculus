import { useEffect, useState } from 'react';
import { fmt } from '../lib/plot';
import { AnimControls, Canvas, Readout, Slider, Widget, useClock, usePlot } from './ui';

/** 6.7 — (cos t, sin t) على دائرة الوحدة و (cosh t, sinh t) على القطع الزائد، والمساحة المظللة t/2 في الحالتين. */
export default function HyperbolaCircle() {
  const [t, setT] = useState(1);
  const clock = useClock(8, { loop: true });
  useEffect(() => { if (clock.playing) setT(-1.8 + 3.6 * (0.5 - 0.5 * Math.cos(2 * Math.PI * clock.t))); }, [clock.t, clock.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  const shade = (p: Parameters<Parameters<typeof usePlot>[1]>[0], fx: (s: number) => number, fy: (s: number) => number) => {
    const ctx = p.ctx; ctx.beginPath(); ctx.moveTo(p.X(0), p.Y(0));
    const N = 80; for (let i = 0; i <= N; i++) { const s = (t * i) / N; ctx.lineTo(p.X(fx(s)), p.Y(fy(s))); }
    ctx.closePath(); ctx.fillStyle = p.c.area; ctx.globalAlpha = 0.4; ctx.fill(); ctx.globalAlpha = 1;
  };
  const circ = usePlot({ xMin: -1.4, xMax: 1.4, yMin: -1.4, yMax: 1.4 }, (p) => {
    p.axes();
    p.curve(Math.cos, Math.sin, 0, 2 * Math.PI, p.c.f1, { width: 2.6 });
    shade(p, Math.cos, Math.sin);
    p.line(0, 0, Math.cos(t), Math.sin(t), p.c.ink, { width: 1.6 });
    p.line(Math.cos(t), 0, Math.cos(t), Math.sin(t), p.c.f2, { width: 2 });
    p.point(Math.cos(t), Math.sin(t), p.c.red, 6);
  }, [t]);
  const L = 3.8;
  const hyp = usePlot({ xMin: -0.6, xMax: L, yMin: -3.3, yMax: 3.3 }, (p) => {
    p.axes();
    p.line(0, 0, L, L, p.c['ink-3'], { width: 1, dash: [4, 4] });
    p.line(0, 0, L, -L, p.c['ink-3'], { width: 1, dash: [4, 4] });
    p.curve(Math.cosh, Math.sinh, -2.05, 2.05, p.c.f1, { width: 2.6 });
    shade(p, Math.cosh, Math.sinh);
    p.line(0, 0, Math.cosh(t), Math.sinh(t), p.c.ink, { width: 1.6 });
    p.line(Math.cosh(t), 0, Math.cosh(t), Math.sinh(t), p.c.f2, { width: 2 });
    p.point(Math.cosh(t), Math.sinh(t), p.c.red, 6);
  }, [t]);
  return (
    <Widget title="الدائرة والقطع الزائد" hint="يسار: النقطة $(\cos t, \sin t)$ على دائرة الوحدة $x^2 + y^2 = 1$. يمين: النقطة $(\cosh t, \sinh t)$ على القطع الزائد $x^2 - y^2 = 1$. **في الحالتين المساحة الخضراء $\tfrac12 t$**: فـ $t$ ليست زاوية في القطع الزائد، بل ضعف مساحة. والقطع الزائد يقترب من خطَّي التقارب $y = \pm x$ ولا يدور أبداً.">
      <div className="cv-row">
        <div><Canvas refEl={circ} ratio={1} label="دائرة الوحدة" /><div className="cv-cap f1">دائري: <i>cos²t + sin²t = 1</i></div></div>
        <div><Canvas refEl={hyp} ratio={1.5} label="القطع الزائد" /><div className="cv-cap f1">زائدي: <i>cosh²t − sinh²t = 1</i></div></div>
      </div>
      <AnimControls clock={clock} label="حرّك t" />
      <div className="controls">
        <Slider label="$t$" value={t} min={-1.9} max={1.9} step={0.005} onChange={setT} show={(v) => fmt(v, 3)} color="var(--red)" />
      </div>
      <Readout items={[
        { label: '$\\cos t,\\ \\sin t$', value: `${fmt(Math.cos(t), 3)}, ${fmt(Math.sin(t), 3)}`, color: 'var(--f1)' },
        { label: '$\\cosh t,\\ \\sinh t$', value: `${fmt(Math.cosh(t), 3)}, ${fmt(Math.sinh(t), 3)}`, color: 'var(--f1)' },
        { label: '$\\cosh^2 t - \\sinh^2 t$', value: fmt(Math.cosh(t) ** 2 - Math.sinh(t) ** 2, 6) },
        { label: 'المساحة $\\tfrac12 t$', value: fmt(t / 2, 4), color: 'var(--area)' },
        { label: '$\\cosh t + \\sinh t = e^t$', value: fmt(Math.exp(t), 4), color: 'var(--f2)' },
      ]} />
    </Widget>
  );
}
