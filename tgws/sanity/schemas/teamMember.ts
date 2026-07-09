import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'nameZh',
      type: 'string',
      title: 'Name (Traditional Chinese)',
    }),
    defineField({
      name: 'role',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'roleZh',
      type: 'string',
      title: 'Role (Traditional Chinese)',
    }),
    defineField({
      name: 'bio',
      type: 'text',
    }),
    defineField({
      name: 'bioZh',
      type: 'text',
      title: 'Bio (Traditional Chinese)',
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      options: { hotspot: true },
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
      title: 'name',
      subtitle: 'role',
      media: 'avatar',
    },
  },
});
