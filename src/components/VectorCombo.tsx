import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

type K = 'combo' | 'clock';

/** 11.1 — جمع المتجهات رأساً لذيل، والتركيبات الخطية sv + tw. ومتجهات الساعة الاثنا عشر. */
export default function VectorCombo() {
  const [k, setK] = useState<K>('combo');
  const [s, setS] = useState(1);
  const [t, setT] = useState(1);
  const [off, setOff] = useState<boolean[]>(Array(12).fill(false));
  const v: [number, number] = [3, 1], w: [number, number] = [-1, 2];
  const sv: [number, number] = [s * v[0], s * v[1]], tw: [number, number] = [t * w[0], t * w[1]];
  const sum: [number, number] = [sv[0] + tw[0], sv[1] + tw[1]];
  const hours = Array.from({ length: 12 }, (_, h) => { const a = Math.PI / 2 - ((h + 1) * Math.PI) / 6; return [Math.cos(a), Math.sin(a)] as [number, number]; });
  const V = hours.reduce((acc, u, h) => (off[h] ? acc : [acc[0] + u[0], acc[1] + u[1]]), [0, 0]);
  const ref = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    if (k === 'combo') {
      fitEqual(p, -4.5, 7, -4.2, 5.5);
      p.axes({ xLabel: 'x', yLabel: 'y' });
      p.line(sv[0], sv[1], sum[0], sum[1], p.c.f2, { width: 1.4, dash: [4, 3] });
      p.line(tw[0], tw[1], sum[0], sum[1], p.c.f1, { width: 1.4, dash: [4, 3] });
      p.arrow(0, 0, sv[0], sv[1], p.c.f1, { width: 3 });
      p.arrow(sv[0], sv[1], sum[0], sum[1], p.c.f2, { width: 3 });
      p.arrow(0, 0, tw[0], tw[1], p.c.f2, { width: 1.6 });
      p.arrow(0, 0, sum[0], sum[1], p.c.red, { width: 3.2 });
      p.text('sv', sv[0] / 2, sv[1] / 2, p.c.f1, { dx: 4, dy: 14 });
      p.text('tw', sv[0] + tw[0] / 2, sv[1] + tw[1] / 2, p.c.f2, { dx: 6 });
      p.text('sv + tw', sum[0], sum[1], p.c.red, { dx: 6, dy: -6 });
    } else {
      fitEqual(p, -1.5, 1.5, -1.5, 1.5);
      const ctx = p.ctx; ctx.beginPath(); ctx.arc(p.X(0), p.Y(0), p.X(1) - p.X(0), 0, 2 * Math.PI); ctx.strokeStyle = p.c.line; ctx.lineWidth = 2; ctx.stroke();
      hours.forEach((u, h) => { p.arrow(0, 0, u[0] * 0.95, u[1] * 0.95, off[h] ? p.c.grid : p.c.f1, { width: off[h] ? 1 : 1.8, head: 6 }); p.text(String(h + 1), u[0] * 1.15, u[1] * 1.15, off[h] ? p.c['ink-3'] : p.c.ink, { align: 'center', base: 'middle', size: 13, italic: false }); });
      p.arrow(0, 0, V[0], V[1], p.c.red, { width: 3.4 });
    }
  }, [k, s, t, off]);
  return (
    <Widget title="جمع المتجهات" hint="لنجمع $\mathbf v + \mathbf w$ **نضع ذيل $\mathbf w$ عند رأس $\mathbf v$**: لا يتغير طول $\mathbf w$ ولا اتجاهه، فقط نقطة البداية. والجمع يتم مركّبةً مركّبةً: $(3, 1) + (-1, 2) = (2, 3)$. حرّك $s$ و $t$ لترى **التركيبة الخطية** $s\mathbf v + t\mathbf w$: من هذين المتجهين وحدهما نصل إلى كل نقطة في المستوى.">
      <Choice value={k} onChange={setK} options={[{ v: 'combo', label: 'تركيبة خطية' }, { v: 'clock', label: 'متجهات الساعة' }]} />
      <Canvas refEl={ref} ratio={0.75} label="جمع متجهين رأساً لذيل" />
      {k === 'combo' ? <>
        <div className="controls">
          <Slider label="$s$" value={s} min={-2} max={2} step={0.05} onChange={setS} show={(x) => fmt(x, 2)} color="var(--f1)" />
          <Slider label="$t$" value={t} min={-2} max={2} step={0.05} onChange={setT} show={(x) => fmt(x, 2)} color="var(--f2)" />
        </div>
        <Readout items={[
          { label: '$\\mathbf v$', value: '(3, 1)', color: 'var(--f1)' },
          { label: '$\\mathbf w$', value: '(−1, 2)', color: 'var(--f2)' },
          { label: '$s\\mathbf v + t\\mathbf w$', value: `(${fmt(sum[0], 2)}, ${fmt(sum[1], 2)})`, color: 'var(--red)' },
          { label: 'الطول', value: fmt(Math.hypot(sum[0], sum[1]), 3), color: 'var(--red)' },
        ]} />
        <MathText as="div" className="verdict">{'**الضرب في عدد يمطّ المتجه**: $2\\mathbf v$ ضعف الطول في الاتجاه نفسه، و $-\\mathbf v$ يعكس الاتجاه. جرّب $s = t = 1$: متوازي الأضلاع وقطره $\\mathbf v + \\mathbf w$. والفيزياء لا تحتاج محاور: السرعة والقوة لها طول واتجاه، وليستا مربوطتين بنقطة.'}</MathText>
      </> : <>
        <div className="choice" style={{ justifyContent: "center" }}>{hours.map((_, h) => <button key={h} type="button" className={off[h] ? '' : 'on'} onClick={() => setOff(off.map((x, j) => (j === h ? !x : x)))}>{h + 1}</button>)}</div>
        <Readout items={[
          { label: 'المتجهات الباقية', value: String(12 - off.filter(Boolean).length) },
          { label: 'المجموع $\\mathbf V$', value: `(${fmt(V[0], 3)}, ${fmt(V[1], 3)})`, color: 'var(--red)' },
          { label: '$|\\mathbf V|$', value: fmt(Math.hypot(V[0], V[1]), 3), color: 'var(--red)' },
        ]} />
        <MathText as="div" className="verdict">{'التمرين 13: **مجموع المتجهات الاثني عشر صفر**، فكل متجه يلغيه المقابل له. انقر على ساعة لتحذف متجهها: يصير المجموع **سالب المتجه المحذوف**، أي متجه الساعة المقابلة. (والتمرين 14: احذف عدة متجهات لتجعل $|\\mathbf V|$ أكبر ما يمكن.)'}</MathText>
      </>}
    </Widget>
  );
}
