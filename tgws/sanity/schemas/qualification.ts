import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'qualification',
  title: 'Qualification',
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
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'descriptionZh',
      type: 'text',
      title: 'Description (Traditional Chinese)',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Lucide Icon Name',
      description: 'kebab-case icon name from lucide-react (e.g. award, shield, target, users)',
    }),
    defineField({
      name: 'order',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'By Order',
      name: 'byOrder',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'icon',
    },
  },
});
