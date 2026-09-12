import { Directory, File, Paths } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import type { MomentImage } from '@/lib/types';

export type CapturedPhoto = {
  image: MomentImage;
  /** JPEG base64 (no data-url prefix) so enrichment can look at the photo. */
  base64: string | null;
};

export const cameraAvailable = Platform.OS !== 'web';

/**
 * Downsizes the picked asset, then keeps it somewhere durable:
 * a file in the app's document directory on device, a data url on web.
 */
async function processAsset(uri: string): Promise<CapturedPhoto> {
  const resized = await manipulateAsync(uri, [{ resize: { width: 1080 } }], {
    compress: 0.72,
    format: SaveFormat.JPEG,
    base64: true,
  });

  const base64 = resized.base64 ?? null;

  if (Platform.OS === 'web') {
    const webUri = base64 ? `data:image/jpeg;base64,${base64}` : resized.uri;
    return { image: { source: 'file', uri: webUri }, base64 };
  }

  try {
    const directory = new Directory(Paths.document, 'moments');
    if (!directory.exists) directory.create({ intermediates: true });

    const target = new File(directory, `moment-${Date.now()}.jpg`);
    await new File(resized.uri).copy(target);
    return { image: { source: 'file', uri: target.uri }, base64 };
  } catch {
    // Cache uri still works for this session; not worth failing the capture.
    return { image: { source: 'file', uri: resized.uri }, base64 };
  }
}

export async function pickPhotoFromLibrary(): Promise<CapturedPhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.9,
  });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;

  return processAsset(asset.uri);
}

export async function takePhotoWithCamera(): Promise<CapturedPhoto | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;

  return processAsset(asset.uri);
}
