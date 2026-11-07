/**
 * تقدير تقريبي لعرض صيغة LaTeX بعدد «المحارف المرئية».
 * يُستعمل لنقل الصيغ الطويلة داخل السطر إلى سطر مستقل، فلا تنكسر على الشاشات الصغيرة.
 * @param {string} src
 */
export function mathLen(src) {
  let t = src.replace(/\\text\{([^{}]*)\}/g, '$1').replace(/\\htmlClass\{[^{}]*\}/g, '');
  // الكسر عرضه أطول البسط والمقام، لا مجموعهما
  for (let i = 0; i < 6; i++) {
    const u = t.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a, b) => (a.length >= b.length ? a : b));
    if (u === t) break; t = u;
  }
  t = t
    .replace(/\\[dt]?frac(\w)(\w)/g, '$1')
    .replace(/\\(left|right|displaystyle|textstyle|mathbf|mathrm|operatorname|big|Big|bigg|Bigg|limits)\b/g, '')
    .replace(/\\[,;!:]/g, '')
    .replace(/\\q?quad\b/g, '  ')
    .replace(/\\(begin|end)\{[a-z]*\}/g, '')
    .replace(/\\(sinh|cosh|tanh|sin|cos|tan|sec|csc|cot|ln|log|exp|lim|max|min|det|arg)\b/g, '$1')
    .replace(/\\(cdots|ldots|dots)\b/g, 'xxx')
    .replace(/\\[a-zA-Z]+/g, 'x')
    .replace(/[_^]\{([^{}]*)\}/g, (_m, a) => a.slice(0, Math.ceil(a.length * 0.6)))
    .replace(/[{}^_\s&]/g, '')
    .replace(/[=+<>−-]|\\\\/g, '==');
  return t.length;
}

/** الصيغة أطول من أن تبقى داخل السطر على الجوال */
export const LONG_INLINE = 26;
