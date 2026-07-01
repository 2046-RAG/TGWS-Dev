import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'titleZh',
      type: 'string',
      title: 'Title (Traditional Chinese)',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'News', value: 'news' },
          { title: 'Technical', value: 'technical' },
          { title: 'Case Study', value: 'case-study' },
          { title: 'Industry', value: 'industry' },
        ],
      },
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
    }),
    defineField({
      name: 'excerptZh',
      type: 'text',
      title: 'Excerpt (Traditional Chinese)',
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'contentZh',
      type: 'array',
      title: 'Content (Traditional Chinese)',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'author',
      type: 'string',
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Published Date',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'coverImage',
    },
  },
});