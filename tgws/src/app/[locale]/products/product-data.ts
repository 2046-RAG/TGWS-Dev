import { client } from '@/lib/sanity';
import { logServiceError } from '@/lib/errors';

export interface VendorSolution {
  vendor: string;
  solution: string;
  description?: string;
  descriptionZh?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  subcategory?: string;
  order: number;
  description: string;
  descriptionZh: string;
  features: string[];
  relatedVendors?: VendorSolution[];
}

const PRODUCT_QUERY = `*[_type == "product"] | order(category asc, order asc) {
  _id,
  title,
  slug,
  category,
  subcategory,
  order,
  description,
  descriptionZh,
  features,
  relatedVendors
}`;

const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  category,
  subcategory,
  order,
  description,
  descriptionZh,
  features,
  relatedVendors
}`;

export async function getAllProducts(): Promise<Product[]> {
  try {
    const products = await client.fetch(PRODUCT_QUERY);
    return products || [];
  } catch (error) {
    logServiceError({ service: 'Sanity', operation: 'getAllProducts', error });
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await client.fetch(PRODUCT_BY_SLUG_QUERY, { slug });
    return product || null;
  } catch (error) {
    logServiceError({ service: 'Sanity', operation: 'getProductBySlug', error, extra: { slug } });
    return null;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.category === category);
}
