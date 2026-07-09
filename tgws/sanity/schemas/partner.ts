import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'website',
      type: 'url',
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Technology', value: 'technology' },
          { title: 'Infrastructure', value: 'infrastructure' },
          { title: 'Cloud', value: 'cloud' },
          { title: 'Security', value: 'security' },
          { title: 'Consulting', value: 'consulting' },
        ],
      },
    }),
    defineField({
      name: 'order',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Category, then Order',
      name: 'categoryOrder',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'logo',
    },
  },
});
