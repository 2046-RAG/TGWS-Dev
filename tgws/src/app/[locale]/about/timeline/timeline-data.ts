import { client } from '@/lib/sanity';
import { logServiceError } from '@/lib/errors';

export interface TimelineEvent {
  _id: string;
  year: number;
  quarter: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  highlights: string[];
  highlightsZh: string[];
  icon: string;
  color: string;
  order: number;
}

const TIMELINE_QUERY = `*[_type == "timelineEvent"] | order(year asc, quarter asc) {
  _id,
  year,
  quarter,
  title,
  titleZh,
  description,
  descriptionZh,
  highlights,
  highlightsZh,
  icon,
  color,
  order
}`;

export async function getAllTimelineEvents(): Promise<TimelineEvent[]> {
  try {
    const events = await client.fetch(TIMELINE_QUERY);
    return events || [];
  } catch (error) {
    logServiceError({ service: 'Sanity', operation: 'getAllTimelineEvents', error });
    return [];
  }
}