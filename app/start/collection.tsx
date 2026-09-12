import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { Images, Search, User } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';
import { MomentFilmstrip } from '@/components/MomentFilmstrip';
import { StepDots } from '@/components/StepDots';
import { StepHeader } from '@/components/StepHeader';
import { useMomentsStore } from '@/lib/momentsStore';
import { goBackOrReplace } from '@/lib/navigation';

export default function StartCollectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const moments = useMomentsStore((state) => state.moments);
  const [accentForeground] = useThemeColor(['accent-foreground']);
  const openMoment = (id: string) => router.push({ pathname: '/moment/[id]', params: { id } });

  return (
    <View className="bg-background pt-safe-offset-3 flex-1">
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum */}
      <StatusBar style="light" />
      <StepHeader
        title={t('start.yourMoments')}
        onBack={() => goBackOrReplace('/start/capture')}
        actionLabel={t('common.profile')}
        actionIcon={User}
        onAction={() => router.replace('/profile')}
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
    </View>
  );
}
