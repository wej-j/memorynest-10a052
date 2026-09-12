import { X } from 'lucide-react-native';
import { ScrollView, Pressable, View } from 'react-native';

import { MomentPhoto } from '@/components/MomentPhoto';
import type { MomentImage } from '@/lib/types';

type MomentGalleryProps = {
  images: MomentImage[];
  height: number;
  itemWidth?: number;
  onRemove?: (index: number) => void;
};

/** Horizontally scrollable photo gallery used by capture, review and detail screens. */
export function MomentGallery({ images, height, itemWidth = 280, onRemove }: MomentGalleryProps) {
  if (images.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 12 }}
    >
      {images.map((image, index) => (
        <View
          key={`${image.source}-${image.source === 'file' ? image.uri : image.assetKey}`}
          style={{ width: itemWidth }}
        >
          <MomentPhoto
            image={image}
            height={height}
            className="border-border/70 rounded-3xl border"
          />
          {onRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Foto ${index + 1} entfernen`}
              onPress={() => onRemove(index)}
              hitSlop={8}
              className="bg-background/85 absolute top-2 right-2 h-9 w-9 items-center justify-center rounded-full active:opacity-70"
            >
              <X size={18} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}
