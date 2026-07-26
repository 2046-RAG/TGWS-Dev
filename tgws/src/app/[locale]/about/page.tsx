import { Metadata } from 'next';
import { getTeamMembers, getQualifications } from './about-data';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us | TechGuru',
  description: 'Learn about TechGuru\'s mission, team, and journey. Discover our qualifications, partnerships, and commitment to enterprise IT excellence.',
};

export default async function AboutPage() {
  const [teamMembers, qualifications] = await Promise.all([
    getTeamMembers(),
    getQualifications(),
  ]);

  return <AboutClient teamMembers={teamMembers} qualifications={qualifications} />;
}