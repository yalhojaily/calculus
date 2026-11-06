import { useState } from 'react';
import { fmt, type View } from '../lib/plot';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface Fn { label: string; f: (t: number) => number; d: (t: number) => number | null; view: View; dView: [number, number]; range: [number, number]; t0: number; note: string }

const fns: Record<string, Fn> = {
  sq: { label: '$t^2$', f: (t) => t * t, d: (t) => 2 * t, view: { xMin: -0.3, xMax: 4.3, yMin: -1, yMax: 17 }, dView: [-1, 9], range: [0, 4], t0: 1.5, note: 'المشتقة $2t$: الخط المستقيم في الأسفل. حرّك النقطة وراقب الأسفل يُرسم.' },
  stop: { label: '$2t$ ثم توقّف عند $3$', f: (t) => (t < 3 ? 2 * t : 6), d: (t) => (Math.abs(t - 3) < 1e-9 ? null : t < 3 ? 2 : 0), view: { xMin: -0.3, xMax: 5.3, yMin: -0.6, yMax: 7.5 }, dView: [-0.6, 3], range: [0, 5], t0: 3, note: 'عند $t = 3$ (الزاوية) يعطي $\\Delta t$ الموجب ميلاً $0$، والسالب ميلاً $2$. النهايتان مختلفتان، **فلا توجد مشتقة** عند $t = 3$. رسم المشتقة دالة درجية تقفز.' },
  inv: { label: '$1/t$ (الطلب)', f: (t) => 1 / t, d: (t) => -1 / (t * t), view: { xMin: -0.2, xMax: 4.3, yMin: -0.3, yMax: 3.2 }, dView: [-4, 0.5], range: [0.35, 4], t0: 2, note: 'دالة الطلب $1/t$ عند السعر $t$. مشتقتها $-1/t^2$ **سالبة**: رفع السعر يقلّل الطلب، وبشدّة عندما يكون السعر صغيراً. عند $t = 2$ والخطوة إلى $3$: $\\Delta f = -\\tfrac16$، والميل الحقيقي $-\\tfrac14$.' },
};

/** 2.1 — المشتقة كنهاية للميل المتوسط من الجهتين، ورسم المشتقة نفسها كدالة. */
export default function DerivativeGraph({ initial = 'sq' }: { initial?: string }) {
  const [k, setK] = useState(initial);
  const F = fns[k];
  const [t, setT] = useState(F.t0);
  const [dt, setDt] = useState(1);
  const ave = (F.f(t + dt) - F.f(t)) / dt;
  const avL = (F.f(t - Math.abs(dt)) - F.f(t)) / -Math.abs(dt);
  const avR = (F.f(t + Math.abs(dt)) - F.f(t)) / Math.abs(dt);
  const d = F.d(t);

  const fRef = usePlot(F.view, (p) => {
    p.axes({ xLabel: 't', yLabel: 'f' });
    p.fn(F.f, p.c.f1, { width: 3, from: F.range[0] });
    p.lineThrough(t, F.f(t), ave, p.c.f2, { width: 2.2 });
    p.line(t, F.f(t), t + dt, F.f(t), p.c.violet, { width: 2 });
    p.line(t + dt, F.f(t), t + dt, F.f(t + dt), p.c.violet, { width: 2 });
    p.text('Δt', t + dt / 2, F.f(t), p.c.violet, { align: 'center', base: 'top', dy: 4 });
    p.text('Δf', t + dt, (F.f(t) + F.f(t + dt)) / 2, p.c.violet, { dx: 6, base: 'middle' });
    p.point(t + dt, F.f(t + dt), p.c.f2, 5);
    p.point(t, F.f(t), p.c.f1, 6);
  }, [k, t, dt]);

  const dRef = usePlot({ xMin: F.view.xMin, xMax: F.view.xMax, yMin: F.dView[0], yMax: F.dView[1] }, (p) => {
    p.axes({ xLabel: 't', yLabel: "f '" });
    p.fn((s) => F.d(s) ?? NaN, p.c.f2, { width: 1.4, dash: [3, 4], from: F.range[0] });
    p.fn((s) => F.d(s) ?? NaN, p.c.f2, { width: 3, from: F.range[0], to: t });
    if (d !== null) p.point(t, d, p.c.f2, 6);
    else { p.point(t, avL, p.c['ink-3'], 4); p.point(t, avR, p.c['ink-3'], 4); }
  }, [k, t]);

  return (
    <Widget title="المشتقة: الميل المتوسط من الجهتين، ثم النهاية" hint={F.note}>
      <Choice value={k} onChange={(v) => { setK(v); setT(fns[v].t0); }} options={Object.entries(fns).map(([v, f]) => ({ v, label: f.label }))} />
      <div className="cv-row">
        <div><Canvas refEl={fRef} ratio={0.75} label="الدالة والخط القاطع" /><div className="cv-cap f1">الدالة <i>f(t)</i> والقاطع</div></div>
        <div><Canvas refEl={dRef} ratio={0.75} label="رسم المشتقة" /><div className="cv-cap f2">المشتقة <i>f '(t)</i> = الميل عند كل لحظة</div></div>
      </div>
      <div className="controls">
        <Slider label="اللحظة $t$" value={t} min={F.range[0]} max={F.range[1] - 0.05} step={0.05} onChange={setT} show={(v) => fmt(v)} color="var(--f1)" />
        <Slider label="الخطوة $\Delta t$" value={dt} min={-1} max={1} step={0.01} onChange={(v) => setDt(Math.abs(v) < 0.01 ? 0.01 : v)} show={(v) => fmt(v)} color="var(--violet)" />
      </div>
      <Readout items={[
        { label: 'الميل المتوسط للأمام ($\\Delta t \\gt 0$)', value: fmt(avR, 4), color: 'var(--f2)' },
        { label: 'الميل المتوسط للخلف ($\\Delta t \\lt 0$)', value: fmt(avL, 4), color: 'var(--f2)' },
        { label: "المشتقة $f'(t)$", value: d === null ? 'غير موجودة' : fmt(d, 4), color: 'var(--f1)' },
      ]} />
    </Widget>
  );
}
