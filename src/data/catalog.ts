import { sampleProducts, type Product } from './products';

export async function getProducts(locals?: App.Locals): Promise<Product[]> {
  const db = locals?.runtime?.env?.DB;
  if (!db) return sampleProducts;
  try {
    const { results } = await db.prepare(`SELECT id, slug, name, description, base_price, category, is_active, created_at FROM products WHERE is_active = 1 ORDER BY created_at DESC`).all();
    if (!results?.length) return sampleProducts;
    const products = await Promise.all(results.map(async (row: any) => {
      const images = await db.prepare(`SELECT r2_key, alt_text, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order`).bind(row.id).all();
      const variants = await db.prepare(`SELECT id, product_id, size, color, sku, stock_quantity, stripe_price_id FROM variants WHERE product_id = ?`).bind(row.id).all();
      return { id: row.id, slug: row.slug, name: row.name, description: row.description, basePrice: Number(row.base_price), category: row.category, isActive: Boolean(row.is_active), createdAt: row.created_at, images: (images.results || []).map((i:any) => ({ r2Key: i.r2_key, altText: i.alt_text, sortOrder: i.sort_order })), variants: (variants.results || []).map((v:any) => ({ id: v.id, productId: v.product_id, size: v.size, color: v.color, sku: v.sku, stockQuantity: v.stock_quantity, stripePriceId: v.stripe_price_id })) } as Product;
    }));
    return products;
  } catch {
    return sampleProducts;
  }
}

export async function getProduct(slug: string, locals?: App.Locals): Promise<Product | null> {
  const products = await getProducts(locals);
  return products.find((product) => product.slug === slug) || null;
}
