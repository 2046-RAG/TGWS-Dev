import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import product from './sanity/schemas/product';
import solution from './sanity/schemas/solution';
import caseStudy from './sanity/schemas/caseStudy';
import post from './sanity/schemas/post';

export default defineConfig({
  name: 'techguru',
  title: 'TechGuru CMS',
  projectId: 'r6ztl1oq',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: [product, solution, caseStudy, post] }
});
