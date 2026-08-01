import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import product from './sanity/schemas/product';
import solution from './sanity/schemas/solution';
import post from './sanity/schemas/post';
import faq from './sanity/schemas/faq';
import partner from './sanity/schemas/partner';
import teamMember from './sanity/schemas/teamMember';
import timelineEvent from './sanity/schemas/timelineEvent';
import qualification from './sanity/schemas/qualification';
import tcoCalculator from './sanity/schemas/tcoCalculator';

export default defineConfig({
  name: 'techguru',
  title: 'TechGuru CMS',
  projectId: 'r6ztl1oq',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: [product, solution, post, faq, partner, teamMember, timelineEvent, qualification, tcoCalculator] }
});
