import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Load the real SKILL.md files from the catalog (one level up from the site).
const skills = defineCollection({
  loader: glob({ pattern: '*/SKILL.md', base: '../skills' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
  }),
});

export const collections = { skills };
