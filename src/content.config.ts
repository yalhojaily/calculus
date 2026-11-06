import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    id: z.string(), // "0.1" — يجب أن يطابق قسماً في src/data/curriculum.ts
    summary: z.string(),
    objectives: z.array(z.string()),
    minutes: z.number(),
    /** عنوان محاضرة Strang المرافقة في سلسلة Highlights of Calculus */
    video: z.string().optional(),
  }),
});

export const collections = { lessons };
