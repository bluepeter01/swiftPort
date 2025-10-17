import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // Optional Netlify options:
      edge: false, // set true for Edge Functions
      split: false // set true if you want separate serverless functions
    })
  }
};

export default config;
