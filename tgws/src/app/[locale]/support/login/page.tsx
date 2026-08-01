import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { getTranslations } from 'next-intl/server';
import { redirectIfAuthenticated } from '@/lib/auth-guard';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'support.metadataLogin' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  // Already-authenticated users don't need the login screen (AUDIT-143).
  await redirectIfAuthenticated();

  return (
    <section className="py-20 px-5 sm:px-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('signIn')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('signInSubtitle')}</p>
      </div>

      <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00D4FF]" />
        <LoginForm />
      </div>

      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/support/register`} className="inline-flex items-center text-[#00D4FF] hover:underline min-h-[44px] py-1">
          {t('createAccount')}
        </Link>
      </p>
    </section>
  );
}
