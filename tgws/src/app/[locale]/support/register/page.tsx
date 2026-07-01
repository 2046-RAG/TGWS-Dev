import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import { getTranslations } from 'next-intl/server';

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <section className="py-20 px-5 sm:px-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('createAccount')}</h1>
        <p className="text-gray-500">{t('registerSubtitle')}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <RegisterForm />
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        {t('hasAccount')}{' '}
        <Link href={`/${locale}/support/login`} className="text-[#00D4FF] hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </section>
  );
}
