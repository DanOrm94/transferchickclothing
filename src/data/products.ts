export type Variant = { id: number; productId: number; size: string; color: string; sku: string; stockQuantity: number; stripePriceId?: string | null };
export type Product = { id: number; slug: string; name: string; description: string; basePrice: number; category: string; isActive: boolean; createdAt?: string; images: { r2Key: string; altText: string; sortOrder: number }[]; variants: Variant[] };

const sizes = ['S', 'M', 'L', 'XL', '2XL'];
const excludedProducts = new Set([5, 6, 7, 8, 19, 20, 25, 26, 27]);

// Static fallback used only if D1 is unavailable. It deliberately points at the
// real product photos committed under src/, so the storefront never falls back
// to the old demo SVG artwork.
export const sampleProducts: Product[] = Array.from({ length: 48 }, (_, index) => index + 1)
  .filter((n) => !excludedProducts.has(n))
  .map((n) => {
    const name = `Transferchic Tee ${n}`;
    const category = n <= 12 ? 'New Arrivals' : n <= 24 ? 'Best Sellers' : n <= 36 ? 'Graphic Tees' : 'Collection';
    return {
      id: n,
      slug: `transferchic-tee-${n}`,
      name,
      description: `Quirky printed Transferchic T-shirt design ${n}. A fun everyday tee from the Transferchic Clothing collection.`,
      basePrice: 28,
      category,
      isActive: true,
      images: [{ r2Key: `clothing (${n}).jpg`, altText: `${name} product photo`, sortOrder: 0 }],
      variants: sizes.map((size, sizeIndex) => ({
        id: n * 100 + sizeIndex + 1,
        productId: n,
        size,
        color: 'Black',
        sku: `TCC-${String(n).padStart(3, '0')}-${size}`,
        stockQuantity: 10,
        stripePriceId: null,
      })),
    };
  });
