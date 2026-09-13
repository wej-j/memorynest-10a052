import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, SearchField, useThemeColor } from 'heroui-native';
import { Check, Images } from 'lucide-react-native';
import { useState } from 'react';
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
  const [query, setQuery] = useState('');
  const [accentForeground] = useThemeColor(['accent-foreground']);
  const openMoment = (id: string) => router.push({ pathname: '/moment/[id]', params: { id } });
  const submitSearch = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    router.replace({ pathname: '/search', params: { q: trimmedQuery } });
  };

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
        {moments.some((moment) => moment.images.length > 0) ? (
          <MomentFilmstrip moments={moments} onSelect={openMoment} />
        ) : (
          <EmptyState icon={Images} title={t('start.noPhotos')} body={t('start.noPhotosBody')} />
        )}
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <SearchField value={query} onChange={setQuery} className="flex-1">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input
                  placeholder={t('search.placeholder')}
                  returnKeyType="search"
                  onSubmitEditing={submitSearch}
                />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <Button
              isIconOnly
              variant="primary"
              isDisabled={!query.trim()}
              accessibilityLabel={t('common.search')}
              onPress={submitSearch}
            >
              <Check size={20} color={accentForeground} />
            </Button>
          </View>
          <Button
            variant="secondary"
            className="self-end"
            onPress={() => router.replace('/moments')}
          >
            <Button.Label className="text-white">{t('start.openAll')}</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
