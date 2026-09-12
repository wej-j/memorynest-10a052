import type { ImageSource } from 'expo-image';

import type { MomentImage } from '@/lib/types';

/**
 * Bundled demo photography. Seed moments reference these by key so the store
 * stays JSON-serializable while still resolving to real bundled assets.
 */
const SEED_PHOTOS: Record<string, ImageSource | number> = {
  'gelato-rome': require('@/assets/seed/gelato-rome.png'),
  'pasta-class': require('@/assets/seed/pasta-class.png'),
  'sunset-sea': require('@/assets/seed/sunset-sea.png'),
  'castle-hill': require('@/assets/seed/castle-hill.png'),
  'coffee-shop': require('@/assets/seed/coffee-shop.png'),
  'market-flowers': require('@/assets/seed/market-flowers.png'),
};

export type MomentImageSource = ImageSource | number | string;

export function resolveMomentImage(image: MomentImage | null): MomentImageSource | null {
  if (!image) return null;
  if (image.source === 'file') return image.uri;
  return SEED_PHOTOS[image.assetKey] ?? null;
}
