import { sampleProducts, type Product } from './products';

type CatalogRow = { id:number; slug:string; name:string; description:string; base_price:number; category:string; is_active:number; created_at?:string };
const teeSizes = ['S','M','L','XL','2XL'];
const allowedTees = new Set([1, 3, 9, 11, 14, 17, 18, 21, 23, 28, 31, 33, 34, 35, 38, 39, 40, 41, 43, 44, 46, 48]);
const toteBags = Array.from({ length: 21 }, (_, index) => index + 1);
const catalogueSize = allowedTees.size + toteBags.length;

async function bootstrapCatalog(db: D1Database) {
  const count = await db.prepare('SELECT COUNT(*) AS count FROM products').first<{count:number}>();
  if (Number(count?.count || 0) === catalogueSize) return;

  // Replace the catalogue with the curated tees plus the new tote bags.
  await db.batch([
    db.prepare('DELETE FROM product_images WHERE product_id BETWEEN 1 AND 999'),
    db.prepare('DELETE FROM variants WHERE product_id BETWEEN 1 AND 999'),
    db.prepare('DELETE FROM products WHERE id BETWEEN 1 AND 999'),
  ]);

  const statements: D1PreparedStatement[] = [];
  for (const n of allowedTees) {
    const slug = `transferchic-tee-${n}`;
    const name = `Transferchic Tee ${n}`;
    const description = `Quirky printed Transferchic Clothing T-shirt design ${n}. A fun everyday tee from the Transferchic collection.`;
    statements.push(
      db.prepare('INSERT INTO products (id, slug, name, description, base_price, category, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)').bind(n, slug, name, description, 2800, 'Collection'),
      db.prepare('INSERT INTO product_images (id, product_id, r2_key, alt_text, sort_order) VALUES (?, ?, ?, ?, 0)').bind(n, n, `clothing (${n}).jpg`, `${name} product photo`),
    );
    teeSizes.forEach((size, index) => {
      const variantId = n * 100 + index + 1;
      statements.push(db.prepare('INSERT INTO variants (id, product_id, size, color, sku, stock_quantity, stripe_price_id) VALUES (?, ?, ?, ?, ?, 10, NULL)').bind(variantId, n, size, 'Black', `TCC-${String(n).padStart(3,'0')}-${size}`));
    });
  }

  for (const n of toteBags) {
    const id = 100 + n;
    const slug = `transferchic-totebag-${n}`;
    const name = `Transferchic Tote Bag ${n}`;
    const description = `Transferchic Clothing tote bag design ${n}. A unique everyday tote with a fun printed design.`;
    statements.push(
      db.prepare('INSERT INTO products (id, slug, name, description, base_price, category, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)').bind(id, slug, name, description, 450, 'Tote Bags'),
      db.prepare('INSERT INTO product_images (id, product_id, r2_key, alt_text, sort_order) VALUES (?, ?, ?, ?, 0)').bind(id, id, `totebags (${n}).jpg`, `${name} product photo`),
      db.prepare('INSERT INTO variants (id, product_id, size, color, sku, stock_quantity, stripe_price_id) VALUES (?, ?, ?, ?, ?, 10, NULL)').bind(10000 + n, id, 'One Size', 'Natural', `TCB-${String(n).padStart(3,'0')}`),
    );
  }

  for (let i = 0; i < statements.length; i += 50) await db.batch(statements.slice(i, i + 50));
}

export async function getProducts(locals?: App.Locals): Promise<Product[]> {
  const db = locals?.runtime?.env?.DB;
  if (!db) return sampleProducts;
  try {
    await bootstrapCatalog(db);
    const { results } = await db.prepare('SELECT id, slug, name, description, base_price, category, is_active, created_at FROM products WHERE is_active = 1 ORDER BY id ASC').all<CatalogRow>();
    if (!results?.length) return sampleProducts;
    return await Promise.all(results.map(async (row) => {
      const images = await db.prepare('SELECT r2_key, alt_text, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order').bind(row.id).all();
      const variants = await db.prepare('SELECT id, product_id, size, color, sku, stock_quantity, stripe_price_id FROM variants WHERE product_id = ? ORDER BY id').bind(row.id).all();
      return {
        id:row.id, slug:row.slug, name:row.name, description:row.description,
        basePrice:Number(row.base_price) / 100, category:row.category, isActive:Boolean(row.is_active), createdAt:row.created_at,
        images:(images.results || []).map((i:any) => ({r2Key:i.r2_key, altText:i.alt_text, sortOrder:i.sort_order})),
        variants:(variants.results || []).map((v:any) => ({id:v.id, productId:v.product_id, size:v.size, color:v.color, sku:v.sku, stockQuantity:v.stock_quantity, stripePriceId:v.stripe_price_id}))
      } as Product;
    }));
  } catch (error) {
    console.error('catalog', error);
    return sampleProducts;
  }
}

export async function getProduct(slug:string, locals?:App.Locals):Promise<Product|null> {
  const products = await getProducts(locals);
  return products.find((product) => product.slug === slug) || null;
}
