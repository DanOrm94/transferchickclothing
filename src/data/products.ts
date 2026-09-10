export type Variant = { id: number; productId: number; size: string; color: string; sku: string; stockQuantity: number; stripePriceId?: string | null };
export type Product = { id: number; slug: string; name: string; description: string; basePrice: number; category: string; isActive: boolean; createdAt?: string; images: { r2Key: string; altText: string; sortOrder: number }[]; variants: Variant[] };

const teeSizes = ['S', 'M', 'L', 'XL', '2XL'];
const allowedTees = [1, 3, 9, 11, 14, 17, 18, 21, 23, 28, 31, 33, 34, 35, 38, 39, 40, 41, 43, 44, 46, 48];
const toteBags = Array.from({ length: 21 }, (_, index) => index + 1);

// Static fallback used only if D1 is unavailable. It points at the exact
// product photos selected for the storefront, including the new tote bags.
export const sampleProducts: Product[] = [
  ...allowedTees.map((n) => {
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
      variants: teeSizes.map((size, sizeIndex) => ({
        id: n * 100 + sizeIndex + 1,
        productId: n,
        size,
        color: 'Black',
        sku: `TCC-${String(n).padStart(3, '0')}-${size}`,
        stockQuantity: 10,
        stripePriceId: null,
      })),
    };
  }),
  ...toteBags.map((n) => {
    const id = 100 + n;
    const name = `Transferchic Tote Bag ${n}`;
    return {
      id,
      slug: `transferchic-totebag-${n}`,
      name,
      description: `Transferchic Clothing tote bag design ${n}. A unique everyday tote with a fun printed design.`,
      basePrice: 4.5,
      category: 'Tote Bags',
      isActive: true,
      images: [{ r2Key: `totebags (${n}).jpg`, altText: `${name} product photo`, sortOrder: 0 }],
      variants: [{
        id: 10000 + n,
        productId: id,
        size: 'One Size',
        color: 'Natural',
        sku: `TCB-${String(n).padStart(3, '0')}`,
        stockQuantity: 10,
        stripePriceId: null,
      }],
    };
  }),
];
