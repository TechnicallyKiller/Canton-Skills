import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const GH = 'https://github.com/TechnicallyKiller/Canton-Skills/blob/main';

// Rewrite repo-relative markdown links so they work on the website:
//  ../<skill>            -> /skills/<skill>   (internal detail page)
//  ../../knowledge-base, examples/, etc.      -> GitHub blob URL
function rewriteRelLinks() {
  return (tree, file) => {
    const srcPath = file?.path || (file?.history && file.history[0]) || '';
    const dir = path.dirname(srcPath);
    const walk = (node) => {
      if (
        node.tagName === 'a' &&
        node.properties &&
        typeof node.properties.href === 'string' &&
        node.properties.href.startsWith('.')
      ) {
        const [rawPath, hash] = node.properties.href.split('#');
        const abs = path.resolve(dir, rawPath);
        const rel = path.relative(repoRoot, abs).replace(/\\/g, '/');
        const skillMatch = rel.match(/^skills\/([^/]+)$/);
        if (skillMatch) {
          node.properties.href = '/skills/' + skillMatch[1] + (hash ? '#' + hash : '');
        } else {
          node.properties.href = GH + '/' + rel;
          node.properties.target = '_blank';
          node.properties.rel = 'noopener';
        }
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://canton-dev-skills.netlify.app',
  experimental: { contentLayer: true },
  integrations: [tailwind({ applyBaseStyles: false })],
  markdown: {
    shikiConfig: { theme: 'github-dark', langAlias: { daml: 'haskell' } },
    rehypePlugins: [rewriteRelLinks],
  },
});
