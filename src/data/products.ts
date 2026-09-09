export type Variant = { id: number; productId: number; size: string; color: string; sku: string; stockQuantity: number; stripePriceId?: string | null };
export type Product = { id: number; slug: string; name: string; description: string; basePrice: number; category: string; isActive: boolean; createdAt?: string; images: { r2Key: string; altText: string; sortOrder: number }[]; variants: Variant[] };

export const sampleProducts: Product[] = [
  {
    id: 1, slug: 'office-zoo-grid', name: 'Office Zoo Grid Tee', category: 'Animals', basePrice: 28,
    description: 'A deadpan 3×3 grid of tiny animals pretending to have important meetings.', isActive: true,
    images: [{ r2Key: 'demo/office-zoo-grid.svg', altText: 'Illustrated animal grid on a pale tee', sortOrder: 0 }],
    variants: [1,2,3,4,5].flatMap((sizeIndex) => [{ id: 100 + sizeIndex, productId: 1, size: ['S','M','L','XL','2XL'][sizeIndex-1], color: 'Natural', sku: `TCC-001-${sizeIndex}`, stockQuantity: 12, stripePriceId: null }]),
  },
  {
    id: 2, slug: 'tiny-panic-grid', name: 'Tiny Panic Grid Tee', category: 'Best Sellers', basePrice: 28,
    description: 'Nine tiny characters experiencing nine different levels of mild chaos.', isActive: true,
    images: [{ r2Key: 'demo/tiny-panic-grid.svg', altText: 'Cartoon character grid on a light blue tee', sortOrder: 0 }],
    variants: [1,2,3,4,5].map((n) => ({ id: 200+n, productId: 2, size: ['S','M','L','XL','2XL'][n-1], color: 'Sky', sku: `TCC-002-${n}`, stockQuantity: 8, stripePriceId: null })),
  },
  {
    id: 3, slug: 'garden-committee', name: 'Garden Committee Tee', category: 'New Arrivals', basePrice: 30,
    description: 'A 2×2 committee of expressive little garden creatures, presented with unnecessary seriousness.', isActive: true,
    images: [{ r2Key: 'demo/garden-committee.svg', altText: 'Quirky illustrated garden creature grid on a green tee', sortOrder: 0 }],
    variants: [1,2,3,4,5].map((n) => ({ id: 300+n, productId: 3, size: ['S','M','L','XL','2XL'][n-1], color: 'Sage', sku: `TCC-003-${n}`, stockQuantity: 10, stripePriceId: null })),
  },
  {
    id: 4, slug: 'snack-squad', name: 'Snack Squad Tee', category: 'Animals', basePrice: 28,
    description: 'A 2×2 snack squad built for anyone whose best ideas happen around a packet of crisps.', isActive: true,
    images: [{ r2Key: 'demo/snack-squad.svg', altText: 'Funny snack-loving animal illustrations on a cream tee', sortOrder: 0 }],
    variants: [1,2,3,4,5].map((n) => ({ id: 400+n, productId: 4, size: ['S','M','L','XL','2XL'][n-1], color: 'Cream', sku: `TCC-004-${n}`, stockQuantity: 7, stripePriceId: null })),
  },
];
