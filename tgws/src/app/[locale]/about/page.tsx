import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  Award,
  Users,
  Target,
  Shield,
  Briefcase,
  Code,
  TrendingUp,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { client } from '@/lib/sanity.server';
import { urlFor } from '@/lib/sanity.image';

// Static icon map keyed by lucide kebab-case icon name (stored in Sanity `icon` field)
const ICON_MAP: Record<string, LucideIcon> = {
  award: Award,
  shield: Shield,
  target: Target,
  users: Users,
  briefcase: Briefcase,
  code: Code,
  'trending-up': TrendingUp,
  'shield-check': ShieldCheck,
};

// Visual styling preserved from original — colors keyed by index
const QUALIFICATION_COLORS = ['#00D4FF', '#7B61FF', '#22C55E', '#F59E0B'];

// Fallback photos used when a team member has no Sanity avatar uploaded
const FALLBACK_TEAM_PHOTOS = [
  '/images/team/marco.jpg',
  '/images/team/rafael.jpg',
  '/images/team/adrian.jpg',
];

// Fallback timeline years used when Sanity has no timeline events
const FALLBACK_TIMELINE_YEARS = ['2023', '2023', '2024', '2024', '2025', '2025'];

// Fallback qualification icons used when Sanity has no qualifications
const FALLBACK_QUALIFICATION_ICONS: { icon: LucideIcon; color: string }[] = [
  { icon: Award, color: '#00D4FF' },
  { icon: Shield, color: '#7B61FF' },
  { icon: Target, color: '#22C55E' },
  { icon: Users, color: '#F59E0B' },
];

interface TeamMember {
  _id: string;
  name: string;
  nameZh: string | null;
  role: string;
  roleZh: string | null;
  bio: string | null;
  bioZh: string | null;
  avatar: { _ref: string } | null;
  order: number | null;
}

interface Qualification {
  _id: string;
  title: string;
  titleZh: string | null;
  description: string | null;
  descriptionZh: string | null;
  icon: string | null;
  order: number | null;
}

interface TimelineEvent {
  _id: string;
  year: number;
  month: number | null;
  title: string | null;
  titleZh: string | null;
  description: string | null;
  descriptionZh: string | null;
  order: number | null;
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.metadata' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

async function fetchTeam(): Promise<TeamMember[]> {
  try {
    const query = `*[_type == "teamMember"] | order(order asc) {
      _id, name, nameZh, role, roleZh, bio, bioZh, avatar, order
    }`;
    const result = await client.fetch<TeamMember[]>(query);
    return result || [];
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return [];
  }
}

async function fetchQualifications(): Promise<Qualification[]> {
  try {
    const query = `*[_type == "qualification"] | order(order asc) {
      _id, title, titleZh, description, descriptionZh, icon, order
    }`;
    const result = await client.fetch<Qualification[]>(query);
    return result || [];
  } catch (error) {
    console.error('Failed to fetch qualifications:', error);
    return [];
  }
}

async function fetchTimeline(): Promise<TimelineEvent[]> {
  try {
    const query = `*[_type == "timelineEvent"] | order(order asc) {
      _id, year, month, title, titleZh, description, descriptionZh, order
    }`;
    const result = await client.fetch<TimelineEvent[]>(query);
    return result || [];
  } catch (error) {
    console.error('Failed to fetch timeline events:', error);
    return [];
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  const isZh = locale === 'zh';

  const [team, qualifications, timeline] = await Promise.all([
    fetchTeam(),
    fetchQualifications(),
    fetchTimeline(),
  ]);

  const hasTeamData = team.length > 0;
  const hasQualificationsData = qualifications.length > 0;
  const hasTimelineData = timeline.length > 0;

  return (
    <>
      <Breadcrumb items={[{ label: 'About Us' }]} />
      <section className="py-20 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="section-title text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="section-subtitle mx-auto max-w-3xl">{t('intro')}</p>
        </div>

        <div className="mb-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t('timeline.title')}</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-zinc-700 hidden md:block" />
            <div className="space-y-12">
              {hasTimelineData
                ? timeline.map((item, i) => {
                    const text = isZh
                      ? (item.descriptionZh || item.description || '')
                      : (item.description || item.descriptionZh || '');
                    return (
                      <div
                        key={item._id}
                        className={`relative flex flex-col md:flex-row items-center scroll-reveal ${
                          i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                        }`}
                      >
                        <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                          <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
                            <span className="text-[#00D4FF] font-bold text-lg">{item.year}</span>
                            {text && <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{text}</p>}
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-[#00D4FF] border-4 border-[#F4F4F5] dark:border-zinc-900 shrink-0 my-4 md:my-0 z-10" />
                        <div className="flex-1" />
                      </div>
                    );
                  })
                : Array.from({ length: FALLBACK_TIMELINE_YEARS.length }).map((_, i) => (
                    <div
                      key={i}
                      className={`relative flex flex-col md:flex-row items-center scroll-reveal ${
                        i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 shadow-sm">
                          <span className="text-[#00D4FF] font-bold text-lg">{FALLBACK_TIMELINE_YEARS[i]}</span>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{t(`timeline.events.${i}`)}</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-[#00D4FF] border-4 border-[#F4F4F5] dark:border-zinc-900 shrink-0 my-4 md:my-0 z-10" />
                      <div className="flex-1" />
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t('team.title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {hasTeamData
              ? team.map((member, i) => {
                  const name = isZh ? (member.nameZh || member.name) : member.name;
                  const role = isZh ? (member.roleZh || member.role) : member.role;
                  const bio = isZh ? (member.bioZh || member.bio || '') : (member.bio || '');
                  const photoUrl = member.avatar
                    ? urlFor(member.avatar).url()
                    : FALLBACK_TEAM_PHOTOS[i % FALLBACK_TEAM_PHOTOS.length];
                  return (
                    <div
                      key={member._id}
                      className="relative z-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <Image
                          src={photoUrl}
                          alt={name}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                      <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{name}</h3>
                      <p className="text-[#00D4FF] text-sm mb-2">{role}</p>
                      {bio && <p className="text-gray-500 dark:text-gray-400 text-xs">{bio}</p>}
                    </div>
                  );
                })
              : Array.from({ length: 3 }).map((_, i) => {
                  const name = t(`team.members.${i}.name`);
                  const role = t(`team.members.${i}.role`);
                  const bio = t(`team.members.${i}.bio`);
                  return (
                    <div
                      key={i}
                      className="relative z-10 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <Image
                          src={FALLBACK_TEAM_PHOTOS[i]}
                          alt={name}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                      <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{name}</h3>
                      <p className="text-[#00D4FF] text-sm mb-2">{role}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{bio}</p>
                    </div>
                  );
                })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{t('qualifications.title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hasQualificationsData
              ? qualifications.map((q, i) => {
                  const Icon = (q.icon ? ICON_MAP[q.icon] : undefined) || Award;
                  const title = isZh ? (q.titleZh || q.title) : q.title;
                  const description = isZh
                    ? (q.descriptionZh || q.description || '')
                    : (q.description || '');
                  const color = QUALIFICATION_COLORS[i % QUALIFICATION_COLORS.length];
                  return (
                    <div
                      key={q._id}
                      className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
                    >
                      <Icon size={32} style={{ color }} className="mb-4" />
                      <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{title}</h3>
                      {description && <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>}
                    </div>
                  );
                })
              : FALLBACK_QUALIFICATION_ICONS.map((q, i) => {
                  const Icon = q.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm scroll-reveal hover:border-[#00D4FF]/30 hover:shadow-lg transition-all duration-200"
                    >
                      <Icon size={32} style={{ color: q.color }} className="mb-4" />
                      <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{t(`qualifications.items.${i}.title`)}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{t(`qualifications.items.${i}.description`)}</p>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>
    </>
  );
}
