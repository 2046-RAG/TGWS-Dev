import { getTeamMembers, getQualifications } from './about-data';
import AboutClient from './AboutClient';

// Metadata comes from ./layout.tsx generateMetadata (i18n). Do not export
// page-level metadata here — it would override the locale-aware title.

export default async function AboutPage() {
  const [teamMembers, qualifications] = await Promise.all([
    getTeamMembers(),
    getQualifications(),
  ]);

  return <AboutClient teamMembers={teamMembers} qualifications={qualifications} />;
}