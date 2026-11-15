import { getAllProducts, getProductBySlug } from '../product-data';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ProductDetail from './ProductDetail';
import { ProductJsonLd } from '@/components/ui/JsonLd';

export const revalidate = 3600;

// T-062: prerender product pages from the CMS slug list.
export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products
      .map((p) => ({ slug: p.slug?.current }))
      .filter((p): p is { slug: string } =>
        typeof p.slug === 'string' && p.slug.length > 0
      );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.title} | TechGuru`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <>
      <ProductJsonLd
        name={product.title}
        description={product.description}
        url={`https://www.techguru-it.asia/products/${product.slug}`}
        category={categoryLabel}
      />
      <Breadcrumb
        items={[
          { label: 'Products', href: '/products' },
          { label: categoryLabel, href: `/products/${product.category}` },
          { label: product.title },
        ]}
      />
      <ProductDetail product={product} />
    </>
  );
}
