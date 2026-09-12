import { Image } from 'expo-image';
import { useThemeColor } from 'heroui-native';
import { ImageIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { resolveMomentImage } from '@/lib/images';
import type { MomentImage } from '@/lib/types';
import { cn } from '@/lib/utils';

type MomentPhotoProps = {
  image: MomentImage | null;
  /** Explicit height keeps Expo web from falling back to natural size. */
  height: number;
  className?: string;
};

/** Photo frame used by cards, review, detail and capture. */
export function MomentPhoto({ image, height, className }: MomentPhotoProps) {
  const [muted] = useThemeColor(['muted']);
  const source = resolveMomentImage(image);

  return (
    <View
      style={{ width: '100%', height }}
      className={cn('bg-surface-tertiary overflow-hidden', className)}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: '100%', height }}
          contentFit="cover"
          transition={220}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-2">
          <ImageIcon size={22} color={muted} />
        </View>
      )}
    </View>
  );
}
