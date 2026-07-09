import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'questionZh',
      type: 'string',
      title: 'Question (Traditional Chinese)',
    }),
    defineField({
      name: 'answer',
      type: 'text',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'answerZh',
      type: 'text',
      title: 'Answer (Traditional Chinese)',
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Product', value: 'product' },
          { title: 'Technical', value: 'technical' },
          { title: 'Account', value: 'account' },
          { title: 'Billing', value: 'billing' },
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
      title: 'question',
      subtitle: 'category',
    },
  },
});
