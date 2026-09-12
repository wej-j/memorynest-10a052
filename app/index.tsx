import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { ArrowRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { BrandWordmark } from '@/components/BrandWordmark';
import { FilmReel, type ReelFrame } from '@/components/FilmReel';
import { StepDots } from '@/components/StepDots';
import { LinearGradient } from '@/components/ui/primitives/LinearGradient';
import { SEED_PHOTO_SOURCES } from '@/lib/images';
import { randomWebPhotos, shuffle } from '@/lib/reelPhotos';

const HERO = require('@/assets/brand/start-hero.png');

/**
 * Start page (step 1 of 3): brand, tagline and the moving film reel.
 * "Los geht's" continues to the add-memory page.
 */
export default function StartScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [accentForeground] = useThemeColor(['accent-foreground']);

  // A fresh set of random web photos per app start, plus the bundled
  // photography so the reel is never empty when the device is offline.
  const topFrames = useMemo<ReelFrame[]>(
    () => randomWebPhotos(10).map((url) => ({ key: `top-${url}`, source: url })),
    [],
  );
  const bottomFrames = useMemo<ReelFrame[]>(() => {
    const mixed = shuffle([...randomWebPhotos(6), ...SEED_PHOTO_SOURCES]);
    return mixed.map((source, index) => ({ key: `bottom-${index}`, source }));
  }, []);

  return (
    <View className="bg-background flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />

      <Image source={HERO} style={{ width, height, position: 'absolute' }} contentFit="cover" />

      <LinearGradient
        colors={['rgba(18,13,26,0.94)', 'rgba(18,13,26,0.30)', 'rgba(18,13,26,0.97)']}
        locations={[0, 0.42, 1]}
        className="absolute inset-0"
      />

      <View className="pt-safe-offset-8 pb-safe-offset-6 flex-1 items-center px-6">
        <BrandWordmark size={40} />

        <Typography.Paragraph type="body-sm" color="muted" align="center" className="mt-2 max-w-64">
          Remember the moments that matter.
        </Typography.Paragraph>

        <View className="mt-7 w-full gap-3">
          <FilmReel frames={topFrames} direction="left" frameWidth={104} frameHeight={74} />
          <FilmReel
            frames={bottomFrames}
            direction="right"
            frameWidth={84}
            frameHeight={60}
            perFrameMs={2800}
          />
        </View>

        <View className="flex-1" />

        <View className="pb-5">
          <StepDots index={0} />
        </View>

        <Button
          variant="primary"
          size="lg"
          className="w-full max-w-xs"
          onPress={() => router.push('/start/capture')}
        >
          <Button.Label>Los geht&apos;s</Button.Label>
          <ArrowRight size={18} color={accentForeground} />
        </Button>
      </View>
    </View>
  );
}
