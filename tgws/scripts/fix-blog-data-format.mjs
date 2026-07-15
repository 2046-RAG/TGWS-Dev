import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Fetch all posts and filter in JS (GROQ doesn't support typeof)
const allPosts = await client.fetch(`*[_type=="post"]{
  _id, title, titleZh, slug, excerpt, excerptZh, coverImage, category, author, tags, publishedAt, featured
}`);

const posts = allPosts.filter(p => typeof p.title === 'object' || typeof p.excerpt === 'object');
console.log(`Found ${posts.length} posts with object title/excerpt to fix (out of ${allPosts.length} total)\n`);

let fixed = 0;
let failed = 0;

for (const post of posts) {
  try {
    // Extract English title from locale object or use titleZh as fallback
    const titleEn = typeof post.title === 'object' ? (post.title.en || post.title.zh || Object.values(post.title)[0]) : post.title;
    const excerptEn = typeof post.excerpt === 'object' ? (post.excerpt.en || post.excerpt.zh || Object.values(post.excerpt)[0]) : post.excerpt;

    // For coverImage: if it's a URL string, we need to handle it differently
    // The schema expects a Sanity image object, but URL strings won't work
    // We'll set coverImage to null for now and let the frontend handle missing images
    const coverImageUpdate = typeof post.coverImage === 'string' ? {} : {};

    // Build patch - only update fields that need fixing
    const patch = {};
    if (typeof post.title === 'object') {
      patch.title = titleEn;
    }
    if (typeof post.excerpt === 'object') {
      patch.excerpt = excerptEn;
    }
    // If coverImage is a string URL, we can't set it as a Sanity image
    // But we can try to upload it... or just leave it
    // Actually, let's check if the BlogList handles string coverImage
    // Looking at BlogList.tsx line 94: it checks `typeof featuredPost.coverImage === 'string' && featuredPost.coverImage.startsWith('http')`
    // So string URLs ARE handled! The issue is only with title and excerpt.

    if (Object.keys(patch).length === 0) {
      console.log(`SKIP ${post.slug?.current}: no changes needed`);
      continue;
    }

    await client.patch(post._id).set(patch).commit();
    console.log(`FIXED ${post.slug?.current}: title=${typeof post.title === 'object' ? 'obj→str' : 'ok'}, excerpt=${typeof post.excerpt === 'object' ? 'obj→str' : 'ok'}`);
    fixed++;
  } catch (err) {
    console.error(`FAILED ${post.slug?.current}: ${err.message}`);
    failed++;
  }
}

console.log(`\n=== DONE ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${posts.length}`);
