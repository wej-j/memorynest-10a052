import { useRouter } from 'expo-router';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { Plus, Search, Sparkles } from 'lucide-react-native';
import { FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BrandWordmark } from '@/components/BrandWordmark';
import { EmptyState } from '@/components/EmptyState';
import { MomentCard } from '@/components/MomentCard';
import { MomentFilmstrip } from '@/components/MomentFilmstrip';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useMomentsStore } from '@/lib/momentsStore';

export default function MomentsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const moments = useMomentsStore((state) => state.moments);
  const [accentForeground, foreground] = useThemeColor(['accent-foreground', 'foreground']);

  const openMoment = (id: string) => router.push({ pathname: '/moment/[id]', params: { id } });

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 16 }}
        ListHeaderComponent={
          <View className="gap-4 pt-1">
            <View className="flex-row items-center justify-between">
              <BrandWordmark size={24} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.search')}
                onPress={() => router.push('/search')}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
              >
                <Search size={20} color={foreground} />
              </Pressable>
            </View>
            <View className="gap-0.5">
              <Typography.Heading type="h4">{t('home.greeting')}</Typography.Heading>
              <Typography.Paragraph type="body-sm" color="muted">
                {t('home.recent')}
              </Typography.Paragraph>
            </View>
            <MomentFilmstrip moments={moments} onSelect={openMoment} />
            {moments.length > 0 ? (
              <Button variant="primary" onPress={() => router.push('/capture')}>
                <Plus size={18} color={accentForeground} />
                <Button.Label>{t('home.new')}</Button.Label>
              </Button>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={Sparkles}
            title={t('home.emptyTitle')}
            body={t('home.emptyBody')}
            actionLabel={t('home.first')}
            onAction={() => router.push('/capture')}
          />
        }
        renderItem={({ item }) => <MomentCard moment={item} onPress={() => openMoment(item.id)} />}
      />
    </SafeAreaView>
  );
}
