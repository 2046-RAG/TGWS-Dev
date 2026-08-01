import { client } from '@/lib/sanity';
import { logServiceError } from '@/lib/errors';

export interface TeamMember {
  _id: string;
  name: string;
  nameZh?: string;
  role: string;
  roleZh?: string;
  bio: string;
  bioZh?: string;
  avatar?: {
    asset: {
      url: string;
    };
  };
  order: number;
}

export interface Qualification {
  _id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  color: string;
  category: string;
  order: number;
}

const TEAM_QUERY = `*[_type == "teamMember"] | order(order asc) {
  _id,
  name,
  nameZh,
  role,
  roleZh,
  bio,
  bioZh,
  avatar {
    asset -> {
      url
    }
  },
  order
}`;

const QUALIFICATIONS_QUERY = `*[_type == "qualification"] | order(order asc) {
  _id,
  title,
  titleZh,
  description,
  descriptionZh,
  icon,
  color,
  category,
  order
}`;

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const members = await client.fetch(TEAM_QUERY);
    return members || [];
  } catch (error) {
    logServiceError({ service: 'Sanity', operation: 'getTeamMembers', error });
    return [];
  }
}

export async function getQualifications(): Promise<Qualification[]> {
  try {
    const qualifications = await client.fetch(QUALIFICATIONS_QUERY);
    return qualifications || [];
  } catch (error) {
    logServiceError({ service: 'Sanity', operation: 'getQualifications', error });
    return [];
  }
}