export type Variant = { id: number; productId: number; size: string; color: string; sku: string; stockQuantity: number; stripePriceId?: string | null };
export type Product = { id: number; slug: string; name: string; description: string; basePrice: number; category: string; isActive: boolean; createdAt?: string; images: { r2Key: string; altText: string; sortOrder: number }[]; variants: Variant[] };

const sizes = ['S', 'M', 'L', 'XL', '2XL'];
const allowedProducts = [1, 3, 9, 11, 14, 17, 18, 21, 23, 28, 31, 33, 34, 35, 38, 39, 40, 41, 43, 44, 46, 48];

// Static fallback used only if D1 is unavailable. It points only at the exact
// product photos selected for the storefront.
export const sampleProducts: Product[] = allowedProducts.map((n) => {
  const name = `Transferchic Tee ${n}`;
  return {
    id: n,
    slug: `transferchic-tee-${n}`,
    name,
    description: `Quirky printed Transferchic Clothing T-shirt design ${n}. A fun everyday tee from the Transferchic collection.`,
    basePrice: 28,
    category: 'Collection',
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
