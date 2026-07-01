import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'industry',
      type: 'string',
      options: {
        list: [
          { title: 'Healthcare', value: 'healthcare' },
          { title: 'Finance', value: 'finance' },
          { title: 'Retail', value: 'retail' },
          { title: 'Logistics', value: 'logistics' },
          { title: 'Education', value: 'education' },
          { title: 'Government', value: 'government' },
        ],
      },
    }),
    defineField({
      name: 'clientName',
      type: 'string',
    }),
    defineField({
      name: 'summary',
      type: 'text',
    }),
    defineField({
      name: 'summaryZh',
      type: 'text',
      title: 'Summary (Traditional Chinese)',
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
      name: 'productsUsed',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'results',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'image',
      type: 'image',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
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
      subtitle: 'industry',
    },
  },
});