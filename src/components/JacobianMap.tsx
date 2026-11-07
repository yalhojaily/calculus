import { useState } from 'react';
import { fmt } from '../lib/plot';
import { fitEqual } from '../lib/polar';
import { MathText } from './MathText';
import { Canvas, Choice, Readout, Slider, Widget, usePlot } from './ui';

interface M { label: string; T: (u: number, v: number) => [number, number]; J: (u: number, v: number) => number; ur: [number, number]; vr: [number, number]; uName: string; vName: string; box: [number, number, number, number]; jText: string; note: string }
const ms: Record<string, M> = {
  polar: { label: 'قطبي $(r, \\theta)$', T: (r, t) => [r * Math.cos(t), r * Math.sin(t)], J: (r) => r, ur: [0.5, 3], vr: [0, Math.PI / 2], uName: 'r', vName: 'θ', box: [-0.3, 3.2, -0.3, 3.2], jText: 'r', note: '**«المستطيل القطبي»** بين شعاعين ودائرتين: أضلاعه المستقيمة $\\Delta r$، وقوساه $r\\,\\Delta\\theta$ تقريباً، وزواياه قائمة. فمساحته $r\\,\\Delta r\\,\\Delta\\theta$. **قطعاً ليست $dr\\,d\\theta$**: المساحة تأتي دائماً من ضرب طولين، و $d\\theta$ ليس طولاً. ابعد عن المركز: الرقع تكبر مع $r$.' },
  rot: { label: 'دوران بزاوية $\\alpha$', T: (u, v) => { const a = 0.5; return [u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)]; }, J: () => 1, ur: [0, 1], vr: [0, 1], uName: 'u', vName: 'v', box: [-0.8, 1.2, -0.2, 1.6], jText: '1', note: 'المثال 1: **للدوران الصافي $dA = du\\,dv$**: المربع لا يتغير شكله ولا مساحته. التعويض $x = u\\cos\\alpha - v\\sin\\alpha$ يجعل $\\iint x\\,dA$ يبدو أسوأ، **لكن الحدود 0 و 1 أفضل بكثير**.' },
  shear: { label: 'خطي $x = 2u + v$، $y = u + 3v$', T: (u, v) => [2 * u + v, u + 3 * v], J: () => 5, ur: [0, 1], vr: [0, 1], uName: 'u', vName: 'v', box: [-0.3, 3.3, -0.3, 4.3], jText: '5', note: 'للتحويل الخطي كل الرقع تُمطّ بالعامل نفسه: **$J = \\det\\begin{bmatrix} 2 & 1 \\\\ 1 & 3\\end{bmatrix} = 5$** (القسم 11.4). المربع الواحد يصير متوازي أضلاع مساحته 5.' },
  sq: { label: 'غير خطي $x = u^2 - v^2$، $y = 2uv$', T: (u, v) => [u * u - v * v, 2 * u * v], J: (u, v) => 4 * (u * u + v * v), ur: [0.2, 1.4], vr: [0, 1.2], uName: 'u', vName: 'v', box: [-1.6, 2.1, -0.3, 3.5], jText: '4(u² + v²)', note: 'هذا تربيع العدد المركب $u + iv$. **عامل التمطيط يتغير من نقطة إلى أخرى**: صغير قرب الأصل وكبير بعيداً. الخطوط المستقيمة في $uv$ صارت قطوعاً مكافئة متعامدة في $xy$.' },
};

/** 14.2 — تغيير المتغيرات: رقعة صغيرة du dv تصير رقعة مساحتها |J| du dv، حيث J محدد مصفوفة المشتقات (اليعقوبي). */
export default function JacobianMap() {
  const [k, setK] = useState('polar');
  const M = ms[k];
  const [su, setSu] = useState(0.5);
  const [sv, setSv] = useState(0.5);
  const n = 8;
  const du = (M.ur[1] - M.ur[0]) / n, dv = (M.vr[1] - M.vr[0]) / n;
  const iu = Math.min(n - 1, Math.floor(su * n)), iv = Math.min(n - 1, Math.floor(sv * n));
  const u0 = M.ur[0] + iu * du, v0 = M.vr[0] + iv * dv;
  // المساحة الحقيقية للرقعة المختارة (مضلع بنقاط على حوافها)
  const patch: [number, number][] = [];
  const m = 16;
  for (let i = 0; i <= m; i++) patch.push(M.T(u0 + (du * i) / m, v0));
  for (let i = 0; i <= m; i++) patch.push(M.T(u0 + du, v0 + (dv * i) / m));
  for (let i = m; i >= 0; i--) patch.push(M.T(u0 + (du * i) / m, v0 + dv));
  for (let i = m; i >= 0; i--) patch.push(M.T(u0, v0 + (dv * i) / m));
  let area = 0; for (let i = 0; i < patch.length; i++) { const [x1, y1] = patch[i], [x2, y2] = patch[(i + 1) % patch.length]; area += x1 * y2 - x2 * y1; }
  area = Math.abs(area) / 2;
  const uv = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    fitEqual(p, M.ur[0] - 0.15 * (M.ur[1] - M.ur[0]), M.ur[1] + 0.1, M.vr[0] - 0.15 * (M.vr[1] - M.vr[0]), M.vr[1] + 0.1);
    p.axes({ xLabel: M.uName, yLabel: M.vName });
    for (let i = 0; i <= n; i++) { p.line(M.ur[0] + i * du, M.vr[0], M.ur[0] + i * du, M.vr[1], p.c.f1, { width: 1 }); p.line(M.ur[0], M.vr[0] + i * dv, M.ur[1], M.vr[0] + i * dv, p.c.f2, { width: 1 }); }
    p.rect(u0, v0, u0 + du, v0 + dv, p.c.red, { alpha: 0.5 });
  }, [k, iu, iv]);
  const xy = usePlot({ xMin: -1, xMax: 1, yMin: -1, yMax: 1 }, (p) => {
    const [a, b, c, d] = M.box; fitEqual(p, a, b, c, d);
    p.axes({ xLabel: 'x', yLabel: 'y' });
    for (let i = 0; i <= n; i++) {
      const u = M.ur[0] + i * du, v = M.vr[0] + i * dv;
      p.curve((t) => M.T(u, t)[0], (t) => M.T(u, t)[1], M.vr[0], M.vr[1], p.c.f1, { width: 1 });
      p.curve((t) => M.T(t, v)[0], (t) => M.T(t, v)[1], M.ur[0], M.ur[1], p.c.f2, { width: 1 });
    }
    const ctx = p.ctx; ctx.beginPath(); patch.forEach(([x, y], i) => (i ? ctx.lineTo(p.X(x), p.Y(y)) : ctx.moveTo(p.X(x), p.Y(y)))); ctx.closePath(); ctx.fillStyle = p.c.red; ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1;
  }, [k, iu, iv]);
  const Jm = M.J(u0 + du / 2, v0 + dv / 2);
  return (
    <Widget title="تغيير المتغيرات واليعقوبي" hint="**14C:** إذا كان $x = x(u, v)$ و $y = y(u, v)$، فرقعة صغيرة $du\,dv$ (يسار) تصير رقعة منحنية في $xy$ (يمين) مساحتها $|J|\,du\,dv$، حيث **اليعقوبي** $J = \begin{vmatrix} x_u & x_v \\ y_u & y_v\end{vmatrix}$. فـ $\iint f\,dx\,dy = \iint f\,|J|\,du\,dv$. اختر رقعة بالمنزلقين وقارن مساحتها بـ $J\,du\,dv$.">
      <Choice value={k} onChange={(v) => { setK(v); setSu(0.5); setSv(0.5); }} options={Object.keys(ms).map((v) => ({ v, label: ms[v].label }))} />
      <div className="cv-row">
        <div><Canvas refEl={uv} ratio={0.9} label="الشبكة في المتغيرات الجديدة" /><div className="cv-cap">{`المستوى ${M.uName}${M.vName}: رقع متساوية`}</div></div>
        <div><Canvas refEl={xy} ratio={0.9} label="صورة الشبكة في المستوى xy" /><div className="cv-cap">المستوى xy: الرقع تتمطّط</div></div>
      </div>
      <div className="controls">
        <Slider label={`الرقعة على ${M.uName}`} value={su} min={0} max={0.999} step={0.01} onChange={setSu} show={() => fmt(u0 + du / 2, 2)} color="var(--f1)" />
        <Slider label={`الرقعة على ${M.vName}`} value={sv} min={0} max={0.999} step={0.01} onChange={setSv} show={() => fmt(v0 + dv / 2, 2)} color="var(--f2)" />
      </div>
      <Readout items={[
        { label: '$J$', value: M.jText },
        { label: 'مساحة الرقعة الأصلية', value: fmt(du * dv, 4) },
        { label: 'مساحة الصورة الحقيقية', value: fmt(area, 4), color: 'var(--red)' },
        { label: '$|J|\\,du\\,dv$ عند المركز', value: fmt(Jm * du * dv, 4), color: 'var(--red)' },
      ]} />
      <MathText as="div" className="verdict">{M.note}</MathText>
    </Widget>
  );
}
