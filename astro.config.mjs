// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { mathLen, LONG_INLINE } from './src/lib/mathwidth.mjs';

/** الصيغة الطويلة داخل السطر تُعرض في سطر مستقل، فلا تنكسر أجزاؤها على الشاشات الصغيرة. */
function rehypeLongInlineMath() {
  /** @param {any} n @returns {string} */
  const text = (n) => (n.type === 'text' ? n.value : (n.children || []).map(text).join(''));
  /** @param {any} n */
  const walk = (n) => {
    if (n.type === 'element' && n.tagName === 'code') {
      const cls = n.properties?.className;
      if (Array.isArray(cls) && cls.includes('math-inline') && mathLen(text(n)) > LONG_INLINE)
        n.properties.className = cls.filter((c) => c !== 'math-inline').concat('math-display');
    }
    (n.children || []).forEach(walk);
  };
  return (/** @type {any} */ tree) => walk(tree);
}

/** @type {import('katex').KatexOptions} */
const katexOptions = {
  // \htmlClass lets lesson math reuse the site's color classes (f1 = الدالة (1)، f2 = الدالة (2)، area = المساحة).
  trust: (ctx) => ctx.command === '\\htmlClass',
  strict: false,
};

// Deployed to GitHub Pages at https://yalhojaily.github.io/calculus/
export default defineConfig({
  site: 'https://yalhojaily.github.io',
  base: '/calculus',
  trailingSlash: 'ignore',
  integrations: [react(), mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeLongInlineMath, [rehypeKatex, katexOptions]],
    }),
  },
});
