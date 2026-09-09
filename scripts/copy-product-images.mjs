import { mkdir, readdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);
const srcDir = new URL('../src/', import.meta.url);
const publicImagesDir = new URL('../public/images/', import.meta.url);

await mkdir(publicImagesDir, { recursive: true });

const files = await readdir(srcDir);
const productImages = files.filter((file) => /^clothing \(\d+\)\.jpg$/i.test(file));

if (productImages.length !== 48) {
  throw new Error(`Expected 48 product images in src/, found ${productImages.length}.`);
}

for (const file of productImages) {
  await copyFile(join(srcDir.pathname, file), join(publicImagesDir.pathname, file));
}

console.log(`Copied ${productImages.length} product images to public/images/`);
