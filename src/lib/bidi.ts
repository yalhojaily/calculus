// عزل المقاطع اللاتينية (مثل y = x² أو sin x) داخل العناوين العربية،
// حتى لا يعيد المتصفح ترتيبها عند كسر السطر.
const RUN = /[A-Za-z0-9ˣⁿ²³ₙ₊₁'’]([A-Za-z0-9ˣⁿ²³ₙ₊₁'’()=+\-−.,:\s]*[A-Za-z0-9ˣⁿ²³ₙ₊₁)'’])?/g;

export interface Part { text: string; ltr: boolean }

export function bidiParts(s: string): Part[] {
  const out: Part[] = [];
  let last = 0;
  for (const m of s.matchAll(RUN)) {
    if (m.index! > last) out.push({ text: s.slice(last, m.index), ltr: false });
    out.push({ text: m[0], ltr: true });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last), ltr: false });
  return out;
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** HTML جاهز: المقاطع اللاتينية داخل <bdi dir="ltr"> */
export const bidiHtml = (s: string) => bidiParts(s).map((p) => (p.ltr ? `<bdi dir="ltr">${esc(p.text)}</bdi>` : esc(p.text))).join('');
