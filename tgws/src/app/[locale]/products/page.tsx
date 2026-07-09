import { client } from '@/lib/sanity';
import ProductsList from './ProductsList';
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
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

async function getProducts() {
  try {
    const query = `*[_type == "product"] | order(category asc, order asc) {
      _id,
      title,
      slug,
      category,
      order,
      description,
      descriptionZh,
      features
    }`;
    const products = await client.fetch(query);
    return products || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <>
      <Breadcrumb items={[{ label: 'Products' }]} />
      <ProductsList products={products} />
    </>
  );
}