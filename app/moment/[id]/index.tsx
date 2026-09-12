import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { MapPin, Pencil, SearchX, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentPhoto } from '@/components/MomentPhoto';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TagList } from '@/components/TagList';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { formatFullDateTime } from '@/lib/datetime';
import { useMoment, useMomentsStore } from '@/lib/momentsStore';
import { goBackOrReplace } from '@/lib/navigation';

export default function MomentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const moment = useMoment(id);
  const deleteMoment = useMomentsStore((state) => state.deleteMoment);
  const [foreground, muted, dangerForeground] = useThemeColor([
    'foreground',
    'muted',
    'danger-foreground',
  ]);

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!moment) {
    return (
      <SafeAreaView edges={['top']} className="bg-background flex-1">
        <ScreenHeader title="Moment" onBack={() => goBackOrReplace('/')} />
        <EmptyState
          icon={SearchX}
          title="This memory is no longer here."
          body="It may have been deleted."
          actionLabel="Back to moments"
          onAction={() => router.replace('/')}
        />
      </SafeAreaView>
    );
  }

  const remove = () => {
    deleteMoment(moment.id);
    router.replace('/');
  };

  const noteIsExtra =
    moment.originalNote.trim().length > 0 &&
    moment.originalNote.trim().toLowerCase() !== moment.description.trim().toLowerCase();

  return (
    <SafeAreaView edges={['top']} className="bg-background flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ScreenHeader
          title="Moment"
          onBack={() => goBackOrReplace('/')}
          action={
            <Button
              variant="ghost"
              size="sm"
              onPress={() =>
                router.push({ pathname: '/moment/[id]/edit', params: { id: moment.id } })
              }
            >
              <Pencil size={16} color={foreground} />
              <Button.Label>Edit</Button.Label>
            </Button>
          }
        />

        <View className="gap-5 px-5 pt-1">
          {moment.image ? (
            <MomentPhoto
              image={moment.image}
              height={320}
              className="border-border rounded-3xl border"
            />
          ) : null}

          <View className="gap-2">
            <Typography.Heading type="h2">{moment.title}</Typography.Heading>

            <Typography.Paragraph type="body-sm" color="muted">
              {formatFullDateTime(moment)}
            </Typography.Paragraph>

            {moment.location ? (
              <View className="flex-row items-center gap-1.5">
                <MapPin size={14} color={muted} />
                <Typography.Paragraph type="body-sm" color="muted">
                  {moment.location}
                </Typography.Paragraph>
              </View>
            ) : null}
          </View>

          {moment.description.length > 0 ? (
            <Typography.Paragraph>{moment.description}</Typography.Paragraph>
          ) : null}

          <TagList tags={moment.tags} size="md" />

          {noteIsExtra ? (
            <View className="border-border bg-surface-secondary gap-1 rounded-2xl border px-4 py-3">
              <Typography.Paragraph type="body-xs" color="muted">
                What you wrote at the time
              </Typography.Paragraph>
              <Typography.Paragraph type="body-sm">{moment.originalNote}</Typography.Paragraph>
            </View>
          ) : null}

          {confirmDelete ? (
            <View className="border-border bg-surface gap-3 rounded-2xl border px-4 py-4">
              <Typography.Paragraph type="body-sm">
                Delete this moment? This cannot be undone.
              </Typography.Paragraph>

              <View className="flex-row gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onPress={() => setConfirmDelete(false)}
                >
                  <Button.Label>Keep it</Button.Label>
                </Button>

                <Button variant="danger" className="flex-1" onPress={remove}>
                  <Trash2 size={16} color={dangerForeground} />
                  <Button.Label>Delete</Button.Label>
                </Button>
              </View>
            </View>
          ) : (
            <Button
              variant="danger-soft"
              className="self-start"
              size="sm"
              onPress={() => setConfirmDelete(true)}
            >
              <Button.Label>Delete moment</Button.Label>
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
