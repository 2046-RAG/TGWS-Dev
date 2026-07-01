import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'solution',
  title: 'Solution',
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
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'descriptionZh',
      type: 'text',
      title: 'Description (Traditional Chinese)',
    }),
    defineField({
      name: 'challenges',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'recommendedProducts',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'image',
      type: 'image',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'industry',
    },
  },
});