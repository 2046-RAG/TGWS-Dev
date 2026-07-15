import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Product',
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
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Build', value: 'build' },
          { title: 'Run', value: 'run' },
          { title: 'Protect', value: 'protect' },
        ],
      },
    }),
    defineField({
      name: 'subcategory',
      type: 'string',
      title: 'Sub-Category',
      options: {
        list: [
          { title: 'Virtualization', value: 'virtualization' },
          { title: 'HCI', value: 'hci' },
          { title: 'Cloud Platform', value: 'cloud_platform' },
          { title: 'Hardware', value: 'hardware' },
          { title: 'Managed Hosting', value: 'hosting' },
          { title: 'Business Continuity', value: 'bcdr' },
          { title: 'Routing & Switching', value: 'routing_switching' },
          { title: 'Wireless', value: 'wireless' },
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
      name: 'icon',
      type: 'image',
    }),
    defineField({
      name: 'features',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'relatedVendors',
      type: 'array',
      title: 'Related Vendor Solutions',
      description: 'Vendor-specific products/solutions related to this product',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'vendor', type: 'string', title: 'Vendor Name', validation: (r: any) => r.required() },
            { name: 'solution', type: 'string', title: 'Solution/Product Name', validation: (r: any) => r.required() },
            { name: 'description', type: 'text', title: 'Brief Description' },
            { name: 'descriptionZh', type: 'text', title: 'Description (Traditional Chinese)' },
          ],
          preview: {
            select: { title: 'vendor', subtitle: 'solution' },
          },
        },
      ],
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
      title: 'title',
      subtitle: 'category',
    },
  },
});