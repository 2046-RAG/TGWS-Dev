import { getAllProducts } from '../product-data';
import CategoryPage from '../CategoryPage';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products.metadata' });
  return {
    title: `${t('protectTitle')} | TechGuru`,
    description: t('protectStory'),
  };
}

export default async function ProtectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });
  const products = await getAllProducts();
  return (
    <>
      <Breadcrumb items={[{ label: t('title'), href: '/products' }, { label: t('protectTitle') }]} />
      <CategoryPage category="protect" products={products} />
    </>
  );
}
