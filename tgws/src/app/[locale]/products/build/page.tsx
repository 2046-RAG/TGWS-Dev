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
    title: `${t('buildTitle')} | TechGuru`,
    description: t('buildStory'),
  };
}

export default async function BuildPage() {
  const products = await getAllProducts();
  return (
    <>
      <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: 'Build' }]} />
      <CategoryPage category="build" products={products} />
    </>
  );
}
