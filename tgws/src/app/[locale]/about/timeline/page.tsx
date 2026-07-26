import { Metadata } from 'next';
import { getAllTimelineEvents } from './timeline-data';
import TimelineClient from './TimelineClient';

export const metadata: Metadata = {
  title: 'Our Journey | TechGuru',
  description: 'Discover TechGuru\'s journey from our founding in 2023 to becoming a leading IT solutions integrator in Asia.',
};

export default async function TimelinePage() {
  const events = await getAllTimelineEvents();

  return <TimelineClient events={events} />;
}