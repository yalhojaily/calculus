import { fmt } from '../lib/plot';
import { MathText } from './MathText';
import { AnimControls, Canvas, Readout, Widget, useClock, usePlot } from './ui';

const racers = [
  { name: 'كرة مصمتة', J: 2 / 5, col: 'f1' },
  { name: 'أسطوانة مصمتة', J: 1 / 2, col: 'area' },
  { name: 'كرة مجوّفة', J: 2 / 3, col: 'violet' },
  { name: 'أسطوانة مجوّفة', J: 1, col: 'f2' },
] as const;

/** 8.5 — سباق التدحرج: v² = 2gh/(1 + J) مع J = I/(mr²). الأصغر J يصل أولاً، والحجم والكثافة لا يهمان. */
export default function RollingRace() {
  const L = 10, ang = 0.3; // طول المنحدر وزاويته
  const g = 9.8;
  const acc = racers.map((r) => (g * Math.sin(ang)) / (1 + r.J));
  const Tmax = Math.sqrt((2 * L) / acc[3]);
  const clock = useClock(6, { loop: false });
  const t = clock.t * Tmax;
  const pos = acc.map((a) => Math.min(L, 0.5 * a * t * t));
  const finish = acc.map((a) => Math.sqrt((2 * L) / a));
  const ref = usePlot({ xMin: -0.6, xMax: L * Math.cos(ang) + 0.8, yMin: -0.6, yMax: L * Math.sin(ang) + 2.3 }, (p) => {
    const top: [number, number] = [0, L * Math.sin(ang)], bot: [number, number] = [L * Math.cos(ang), 0];
    p.line(top[0], top[1], bot[0], bot[1], p.c.ink, { width: 3 });
    p.line(-0.5, 0, bot[0] + 0.7, 0, p.c.ink, { width: 2 });
    racers.forEach((r, i) => {
      const off = 0.5 * i; // إزاحة جانبية وهمية (حارات)
      if (i > 0) { const dx = -off * Math.sin(ang), dy = off * Math.cos(ang); p.line(top[0] + dx, top[1] + dy, bot[0] + dx, bot[1] + dy, p.c['ink-3'], { width: 1, dash: [4, 4] }); }
      const s = pos[i];
      const cx = top[0] + s * Math.cos(ang) - off * Math.sin(ang), cy = top[1] - s * Math.sin(ang) + 0.22 + off * Math.cos(ang);
      const rad = p.X(0.2) - p.X(0);
      const ctx = p.ctx; ctx.beginPath(); ctx.arc(p.X(cx), p.Y(cy), rad, 0, 2 * Math.PI);
      ctx.fillStyle = p.c[r.col]; ctx.globalAlpha = r.J >= 2 / 3 ? 0.35 : 0.85; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = p.c[r.col]; ctx.lineWidth = 3; ctx.stroke();
      // خط دوران ليظهر التدحرج
      const th = -s / 0.2;
      ctx.beginPath(); ctx.moveTo(p.X(cx), p.Y(cy)); ctx.lineTo(p.X(cx) + rad * Math.cos(th), p.Y(cy) - rad * Math.sin(th)); ctx.strokeStyle = p.c.ink; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }, [t]);
  return (
    <Widget title="سباق التدحرج على طاولة مائلة" hint="أربعة أجسام تتدحرج من القمة: كرة مصمتة، أسطوانة مصمتة (قطعة نقود)، كرة مجوّفة، أسطوانة مجوّفة (حلقة). **سجّل توقعك أولاً**، ثم شغّل. الطاقة الكامنة $mgh$ تتوزع بين الحركة $\tfrac12 mv^2$ والدوران $\tfrac12 I\omega^2$، ومع $v = \omega r$: $v^2 = \dfrac{2gh}{1 + J}$ حيث $J = I/mr^2$.">
      <Canvas refEl={ref} ratio={0.42} label="أربعة أجسام تتدحرج على منحدر" />
      <AnimControls clock={clock} label="انطلق" />
      <Readout items={racers.map((r, i) => ({ label: `${r.name}: $J = ${r.J === 0.4 ? '\\tfrac25' : r.J === 0.5 ? '\\tfrac12' : r.J === 1 ? '1' : '\\tfrac23'}$`, value: `${fmt(finish[i], 2)} ث`, color: `var(--${r.col})` }))} />
      <MathText as="div" className="verdict">{'**الأصغر $J$ أسرع.** الأسطوانة المجوّفة كل كتلتها على البعد $r$ الكامل من المحور، فـ $J = 1$ أكبر ما يمكن، وتصل أخيراً. **والكثافة لا تهم** لأنها عامل في $I$ وفي $m$ فتُلغى من $J$، **ولا الحجم** إن بقي الشكل. (التجربة طوّرها دانيال دركر.)'}</MathText>
    </Widget>
  );
}
