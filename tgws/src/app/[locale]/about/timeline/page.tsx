import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAllTimelineEvents } from './timeline-data';
import TimelineClient from './TimelineClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.timeline.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function TimelinePage() {
  const events = await getAllTimelineEvents();

  return <TimelineClient events={events} />;
}