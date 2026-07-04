import { client } from '@/lib/sanity';
import ProductsList from './ProductsList';

export const revalidate = 3600;

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
  return <ProductsList products={products} />;
}