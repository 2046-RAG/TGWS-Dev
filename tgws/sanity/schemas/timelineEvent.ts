import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'timelineEvent',
  title: 'Timeline Event',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      type: 'number',
      validation: (r) => r.required().min(2020).max(2030),
    }),
    defineField({
      name: 'quarter',
      type: 'string',
      options: {
        list: [
          { title: 'Q1 (Jan-Mar)', value: 'Q1' },
          { title: 'Q2 (Apr-Jun)', value: 'Q2' },
          { title: 'Q3 (Jul-Sep)', value: 'Q3' },
          { title: 'Q4 (Oct-Dec)', value: 'Q4' },
        ],
      },
      validation: (r) => r.required(),
    }),
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
      name: 'highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key achievements or milestones for this event',
    }),
    defineField({
      name: 'highlightsZh',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Highlights (Traditional Chinese)',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      options: {
        list: [
          { title: 'Rocket', value: 'rocket' },
          { title: 'Building', value: 'building' },
          { title: 'Users', value: 'users' },
          { title: 'Trending Up', value: 'trending' },
          { title: 'Globe', value: 'globe' },
          { title: 'Award', value: 'award' },
          { title: 'Code', value: 'code' },
          { title: 'Shield', value: 'shield' },
        ],
      },
      initialValue: 'rocket',
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
          { title: 'Pink (#EC4899)', value: '#EC4899' },
        ],
      },
      initialValue: '#00D4FF',
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Display order (lower numbers appear first)',
    }),
  ],
  orderings: [
    {
      title: 'By Year & Quarter',
      name: 'yearQuarter',
      by: [
        { field: 'year', direction: 'asc' },
        { field: 'quarter', direction: 'asc' },
      ],
    },
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
      media: 'icon',
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: `${selection.subtitle}`,
      };
    },
  },
});