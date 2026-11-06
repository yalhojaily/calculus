import { useMemo, useState } from 'react';
import { fmt } from '../lib/plot';
import { Canvas, Readout, Slider, Widget, usePlot } from './ui';

const F = (a: number, z: number) => a * z - a * z * z;

/** 3.7 — الفوضى من قطع مكافئ: z(n+1) = a z(n) − a z(n)². تضاعف الدورة ثم الفوضى. */
export default function Logistic() {
  const [a, setA] = useState(3.2);
  const series = useMemo(() => { const z = [0.3]; for (let i = 0; i < 60; i++) z.push(F(a, z[i])); return z; }, [a]);
  // مخطط التشعّب: لكل a نترك 300 خطوة ثم نرسم 120 قيمة
  const diagram = useMemo(() => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 500; i++) {
      const A = 2.5 + (1.5 * i) / 500;
      let z = 0.5;
      for (let k = 0; k < 300; k++) z = F(A, z);
      for (let k = 0; k < 120; k++) { z = F(A, z); pts.push([A, z]); }
    }
    return pts;
  }, []);
  const left = usePlot({ xMin: -1, xMax: 61, yMin: 0, yMax: 1.05 }, (p) => {
    p.axes({ xLabel: 'n', yLabel: 'z', xStep: 10, yStep: 0.25 });
    for (let i = 0; i < series.length - 1; i++) p.line(i, series[i], i + 1, series[i + 1], p.c.f1, { width: 1.2 });
    series.forEach((z, i) => p.point(i, z, p.c.f1, 2.5));
  }, [a]);
  const right = usePlot({ xMin: 2.5, xMax: 4.0, yMin: 0, yMax: 1.02 }, (p) => {
    p.axes({ xLabel: 'a', yLabel: 'z', xStep: 0.25, yStep: 0.25 });
    p.ctx.fillStyle = p.c.f1;
    p.ctx.globalAlpha = 0.5;
    for (const [A, z] of diagram) p.ctx.fillRect(p.X(A), p.Y(z), 1, 1);
    p.ctx.globalAlpha = 1;
    p.line(a, 0, a, 1.02, p.c.f2, { width: 1.6 });
  }, [a]);
  const tail = series.slice(-16).map((z) => Math.round(z * 1000) / 1000);
  const period = (() => { for (const q of [1, 2, 4, 8, 3, 6]) if (tail.slice(-q * 2).every((v, i, arr) => Math.abs(v - arr[(i + q) % arr.length]) < 2e-3)) return q; return null; })();
  return (
    <Widget title="الفوضى من قطع مكافئ" hint="$z_{n+1} = az_n - az_n^2$. حتى $a = 3$ تتقارب إلى نقطة واحدة. بعد $3$ تتذبذب بين قيمتين (دورة 2)، وبعد $3.45$ تتضاعف إلى دورة 4، ثم 8، ثم 16… وتصغر الفترات بين التضاعفات بعامل فايغنباوم $4.6692\ldots$. بعدها **فوضى**، مع نوافذ هادئة مثل دورة 3 قرب $a = 3.83$. وعند $a = 4$ تنتشر النقاط على الفترة كلها.">
      <div className="cv-row">
        <div><Canvas refEl={left} ratio={0.75} label="الحدود z مع الزمن" /><div className="cv-cap f1">60 خطوة عند هذه <i>a</i></div></div>
        <div><Canvas refEl={right} ratio={0.75} label="مخطط التشعّب" /><div className="cv-cap">مخطط التشعّب: كل <i>a</i> بين 2.5 و 4</div></div>
      </div>
      <div className="controls">
        <Slider label="$a$" value={a} min={2.5} max={4} step={0.005} onChange={setA} show={(v) => fmt(v, 3)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: 'السلوك', value: period === null ? 'فوضى (أو دورة طويلة)' : period === 1 ? 'تتقارب إلى نقطة ثابتة' : `دورة طولها ${period}`, color: 'var(--f2)' },
        { label: 'آخر القيم', value: tail.slice(-4).join(' · ') },
      ]} />
    </Widget>
  );
}
