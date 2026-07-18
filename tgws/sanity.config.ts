import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import product from './sanity/schemas/product';
import solution from './sanity/schemas/solution';
import post from './sanity/schemas/post';
import faq from './sanity/schemas/faq';
import partner from './sanity/schemas/partner';
import teamMember from './sanity/schemas/teamMember';
import qualification from './sanity/schemas/qualification';
import timelineEvent from './sanity/schemas/timelineEvent';

// TODO W4-7.6: visionTool (GROQ playground) is not installed.
// In Sanity v6, visionTool moved from `sanity/vision` to the standalone
// `@sanity/vision` package. Skipped per AGENTS.md #45 — @sanity/vision
// unpackedSize is 414KB which exceeds the 50KB new-dependency budget.
// Note: this only affects the Sanity Studio dev tool, not the Next.js bundle.
// Revisit if Studio users request a GROQ playground.

export default defineConfig({
  name: 'techguru',
  title: 'TechGuru CMS',
  projectId: 'r6ztl1oq',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: [product, solution, post, faq, partner, teamMember, qualification, timelineEvent] }
});
