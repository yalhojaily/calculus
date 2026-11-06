import { describe, expect, it } from 'vitest';
import { allSections, curriculum, sectionById, PDF_OFFSET } from '../src/data/curriculum';
import { bidiParts } from '../src/lib/bidi';

describe('curriculum', () => {
  it('has all 17 chapters (0–16) and every section of the table of contents', () => {
    expect(curriculum.map((c) => c.number)).toEqual([...Array(17).keys()]);
    expect(allSections.length).toBe(92);
  });

  it('page ranges are contiguous and increasing', () => {
    for (let i = 0; i < allSections.length; i++) {
      const [a, b] = allSections[i].pages;
      expect(b).toBeGreaterThanOrEqual(a);
      if (i > 0) expect(a).toBe(allSections[i - 1].pages[1] + 1);
    }
    expect(allSections[0].pages[0]).toBe(1);
    expect(allSections.at(-1)!.pages[1]).toBe(682);
  });

  it('every prerequisite exists and comes earlier in the book', () => {
    const order = new Map(allSections.map((s, i) => [s.id, i]));
    for (const s of allSections)
      for (const p of s.prereqs) {
        expect(sectionById(p), `${s.id} → ${p}`).toBeDefined();
        expect(order.get(p)!).toBeLessThan(order.get(s.id)!);
      }
  });

  it('ids and slugs are unique', () => {
    expect(new Set(allSections.map((s) => s.id)).size).toBe(allSections.length);
    expect(new Set(allSections.map((s) => s.slug)).size).toBe(allSections.length);
  });

  it('uses the verified PDF offset (book page 51 = PDF page 64)', () => {
    expect(51 + PDF_OFFSET).toBe(64);
  });
});

describe('bidi', () => {
  it('isolates Latin math runs inside Arabic titles', () => {
    const parts = bidiParts('الميل المتغيّر للدالتين y = x² و y = xⁿ');
    expect(parts.filter((p) => p.ltr).map((p) => p.text)).toEqual(['y = x²', 'y = xⁿ']);
  });
});
