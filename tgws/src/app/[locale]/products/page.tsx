import { client } from '@/lib/sanity';
import ProductsList from './ProductsList';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Products',
  description: 'Explore TechGuru\'s comprehensive IT solutions: Build infrastructure, Run operations, and Protect your data with enterprise-grade products.',
  openGraph: {
    title: 'Products | TechGuru',
    description: 'Explore TechGuru\'s comprehensive IT solutions: Build infrastructure, Run operations, and Protect your data with enterprise-grade products.',
  },
};

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