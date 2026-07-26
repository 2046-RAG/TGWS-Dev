import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'qualification',
  title: 'Qualification / Certification',
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
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'descriptionZh',
      type: 'text',
      title: 'Description (Traditional Chinese)',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'icon',
      type: 'string',
      options: {
        list: [
          { title: 'Award', value: 'award' },
          { title: 'Shield', value: 'shield' },
          { title: 'Target', value: 'target' },
          { title: 'Users', value: 'users' },
          { title: 'Building', value: 'building' },
          { title: 'Code', value: 'code' },
        ],
      },
      initialValue: 'award',
    }),
    defineField({
      name: 'color',
      type: 'string',
      options: {
        list: [
          { title: 'Cyan (#00D4FF)', value: '#00D4FF' },
          { title: 'Purple (#7B61FF)', value: '#7B61FF' },
          { title: 'Green (#22C55E)', value: '#22C55E' },
          { title: 'Yellow (#F59E0B)', value: '#F59E0B' },
        ],
      },
      initialValue: '#00D4FF',
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Infrastructure', value: 'infrastructure' },
          { title: 'Security', value: 'security' },
          { title: 'Cloud & AI', value: 'cloud' },
          { title: 'Specialized', value: 'specialized' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'order',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'By Category & Order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'icon',
    },
  },
});