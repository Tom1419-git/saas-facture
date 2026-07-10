// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://facture.mayoraz-net.ch',
  output: "server",
  integrations: [
    react(),
    sitemap({
      // Exclude authenticated pages from sitemap
      filter: (page) => !page.includes('/dashboard') && !page.includes('/app') && !page.includes('/admin'),
    }),
  ],
  adapter: cloudflare()
});