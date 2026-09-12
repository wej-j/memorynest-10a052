import { useRouter } from 'expo-router';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { Plus, Sparkles } from 'lucide-react-native';
import { FlatList, View } from 'react-native';

import { MomentCard } from '@/components/MomentCard';
import { EmptyState } from '@/components/EmptyState';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { useMomentsStore } from '@/lib/momentsStore';

export default function MomentsScreen() {
  const router = useRouter();
  const moments = useMomentsStore((state) => state.moments);
  const [accentForeground] = useThemeColor(['accent-foreground']);

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 16 }}
        ListHeaderComponent={
          <View className="gap-4 pt-2">
            <View className="gap-1">
              <Typography.Heading type="h2">Collecting Moments</Typography.Heading>
              <Typography.Paragraph type="body-sm" color="muted">
                Your memories, easier to keep.
              </Typography.Paragraph>
            </View>

            {moments.length > 0 ? (
              <Button variant="primary" onPress={() => router.push('/capture')}>
                <Plus size={18} color={accentForeground} />
                <Button.Label>New moment</Button.Label>
              </Button>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={Sparkles}
            title="Your moments will live here."
            body="Capture something you don't want to forget — a photo, a few words, or both."
            actionLabel="Create your first moment"
            onAction={() => router.push('/capture')}
          />
        }
        renderItem={({ item }) => (
          <MomentCard
            moment={item}
            onPress={() => router.push({ pathname: '/moment/[id]', params: { id: item.id } })}
          />
        )}
      />
    </SafeAreaView>
  );
}
