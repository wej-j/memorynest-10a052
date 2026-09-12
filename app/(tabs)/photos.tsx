import { useRouter } from 'expo-router';
import { Chip, Typography } from 'heroui-native';
import { Images } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentPhoto } from '@/components/MomentPhoto';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useMomentsStore } from '@/lib/momentsStore';
import type { MomentImage } from '@/lib/types';

const FILTERS = [
  { key: 'all', label: 'Alle' },
  { key: 'favorites', label: 'Favoriten' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

type PhotoTile = {
  key: string;
  momentId: string;
  title: string;
  image: MomentImage;
  favorite: boolean;
};

const GUTTER = 20;
const GAP = 12;

export default function PhotosScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const moments = useMomentsStore((state) => state.moments);
  const [filter, setFilter] = useState<FilterKey>('all');

  const tileWidth = Math.floor((Math.min(width, 720) - GUTTER * 2 - GAP) / 2);
  const tileHeight = Math.round(tileWidth * 1.25);

  const photos = useMemo<PhotoTile[]>(
    () =>
      moments
        .flatMap((moment) =>
          moment.images.map((image, index) => ({
            key: `${moment.id}-${index}`,
            momentId: moment.id,
            title: moment.title,
            image,
            favorite: moment.favorite,
          })),
        )
        .filter((photo) => (filter === 'favorites' ? photo.favorite : true)),
    [filter, moments],
  );

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <FlatList
        data={photos}
        keyExtractor={(item) => item.key}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{
          paddingHorizontal: GUTTER,
          paddingBottom: 32,
          gap: GAP,
        }}
        ListHeaderComponent={
          <View className="gap-4 pt-1 pb-1">
            <Typography.Heading type="h2">Meine Fotos</Typography.Heading>

            <View className="flex-row gap-2">
              {FILTERS.map((item) => (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => setFilter(item.key)}
                  className="active:opacity-70"
                >
                  <Chip size="md" variant={filter === item.key ? 'primary' : 'secondary'}>
                    <Chip.Label>{item.label}</Chip.Label>
                  </Chip>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={Images}
            title={filter === 'favorites' ? 'Noch keine Favoriten.' : 'Noch keine Fotos.'}
            body={
              filter === 'favorites'
                ? 'Tippe auf das Herz einer Erinnerung, um sie hier zu sammeln.'
                : 'Sobald du einen Moment mit Foto speicherst, erscheint er hier.'
            }
          />
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => router.push({ pathname: '/moment/[id]', params: { id: item.momentId } })}
            style={{ width: tileWidth }}
            className="active:opacity-85"
          >
            <MomentPhoto image={item.image} height={tileHeight} className="rounded-2xl" />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
