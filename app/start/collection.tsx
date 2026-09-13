import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { Images, Search } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BrandLogo } from '@/components/BrandLogo';
import { EmptyState } from '@/components/EmptyState';
import { MomentFilmstrip } from '@/components/MomentFilmstrip';
import { StepDots } from '@/components/StepDots';
import { StepHeader } from '@/components/StepHeader';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useMomentsStore } from '@/lib/momentsStore';
import { goBackOrReplace } from '@/lib/navigation';

export default function StartCollectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const moments = useMomentsStore((state) => state.moments);
  const [accentForeground] = useThemeColor(['accent-foreground']);
  const openMoment = (id: string) => router.push({ pathname: '/moment/[id]', params: { id } });

  return (
    <SafeAreaView edges={['top', 'bottom']} className="bg-background flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />
      <StepHeader
        centerContent={<BrandLogo size={32} />}
        onBack={() => goBackOrReplace('/start/capture')}
        actionLabel={t('tabs.home')}
        onAction={() => router.replace('/moments')}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 20 }}
      >
        <StepDots index={2} />
        <View className="gap-1">
          <Typography.Heading type="h3">{t('start.movingPhotos')}</Typography.Heading>
          <Typography.Paragraph type="body-sm" color="muted">
            {t('start.movingPhotosBody')}
          </Typography.Paragraph>
        </View>
        {moments.some((moment) => moment.images.length > 0) ? (
          <MomentFilmstrip moments={moments} onSelect={openMoment} />
        ) : (
          <EmptyState icon={Images} title={t('start.noPhotos')} body={t('start.noPhotosBody')} />
        )}
        <View className="gap-3">
          <Button variant="primary" onPress={() => router.replace('/search')}>
            <Search size={18} color={accentForeground} />
            <Button.Label>{t('common.search')}</Button.Label>
          </Button>
          <Button variant="secondary" onPress={() => router.replace('/moments')}>
            <Button.Label className="text-white">{t('start.openAll')}</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
