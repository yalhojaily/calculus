// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
      rehypePlugins: [[rehypeKatex, katexOptions]],
    }),
  },
});
