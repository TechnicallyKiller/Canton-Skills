import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://canton-dev-skills.netlify.app',
  integrations: [tailwind({ applyBaseStyles: false })],
});
