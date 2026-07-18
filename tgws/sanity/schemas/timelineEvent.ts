import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'timelineEvent',
  title: 'Timeline Event',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      type: 'number',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'month',
      type: 'number',
      title: 'Month (optional)',
      description: '1-12, leave empty if not applicable',
    }),
    defineField({
      name: 'title',
      type: 'string',
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
      subtitle: 'year',
    },
  },
});
