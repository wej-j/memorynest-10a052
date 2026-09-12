import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Surface, Typography, useThemeColor } from 'heroui-native';
import {
  CalendarDays,
  ChevronLeft,
  Heart,
  MapPin,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Share, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MomentGallery } from '@/components/MomentGallery';
import { StarRating } from '@/components/StarRating';
import { TagList } from '@/components/TagList';
import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';
import { formatFullDateTime } from '@/lib/datetime';
import { useMoment, useMomentsStore } from '@/lib/momentsStore';
import { goBackOrReplace } from '@/lib/navigation';
import type { LucideIcon } from 'lucide-react-native';

export default function MomentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const moment = useMoment(id);
  const deleteMoment = useMomentsStore((state) => state.deleteMoment);
  const toggleFavorite = useMomentsStore((state) => state.toggleFavorite);
  const setRating = useMomentsStore((state) => state.setRating);
  const [foreground, accent, muted, danger] = useThemeColor([
    'foreground',
    'accent',
    'muted',
    'danger',
  ]);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  if (!moment) {
    return (
      <SafeAreaView edges={['top']} className="bg-background flex-1 justify-center">
        <EmptyState
          icon={CalendarDays}
          title="Diese Erinnerung gibt es nicht mehr."
          body="Vielleicht wurde sie gelöscht. Deine anderen Momente sind noch da."
          actionLabel="Zu meinen Momenten"
          onAction={() => router.replace('/moments')}
        />
      </SafeAreaView>
    );
  }

  const share = async () => {
    const message = [moment.title, moment.location, moment.description]
      .filter((part) => part && part.length > 0)
      .join('\n');

    try {
      await Share.share({ message, title: moment.title });
    } catch {
      setHint('Teilen ist hier gerade nicht verfügbar.');
    }
  };

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteMoment(moment.id);
    router.replace('/moments');
  };

  return (
    <View className="bg-background flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View>
          <MomentGallery images={moment.images} height={340} itemWidth={320} />

          <View className="pt-safe-offset-3 absolute top-0 right-0 left-0 flex-row justify-between px-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Zurück"
              onPress={() => goBackOrReplace('/moments')}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/45 active:opacity-70"
            >
              <ChevronLeft size={22} color="#FFFFFF" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                moment.favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'
              }
              onPress={() => toggleFavorite(moment.id)}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/45 active:opacity-70"
            >
              <Heart
                size={20}
                color={moment.favorite ? accent : '#FFFFFF'}
                fill={moment.favorite ? accent : 'transparent'}
              />
            </Pressable>
          </View>
        </View>

        <View className="gap-5 px-5 pt-5">
          <View className="gap-2">
            <Typography.Heading type="h2">{moment.title}</Typography.Heading>

            {moment.location ? (
              <View className="flex-row items-center gap-2">
                <MapPin size={15} color={accent} />
                <Typography.Paragraph type="body-sm">{moment.location}</Typography.Paragraph>
              </View>
            ) : null}

            <View className="flex-row items-center gap-2">
              <CalendarDays size={15} color={muted} />
              <Typography.Paragraph type="body-sm" color="muted">
                {formatFullDateTime(moment)}
              </Typography.Paragraph>
            </View>
          </View>

          {moment.description.length > 0 ? (
            <Typography.Paragraph type="body">{moment.description}</Typography.Paragraph>
          ) : null}

          <TagList tags={moment.tags} size="md" />

          <View className="gap-2">
            <Typography.Paragraph type="body-sm" weight="medium">
              Bewertung
            </Typography.Paragraph>
            <StarRating
              value={moment.rating}
              onChange={(rating) => setRating(moment.id, rating)}
              size={22}
              showValue
            />
          </View>

          {moment.originalNote.length > 0 ? (
            <Surface variant="secondary" className="gap-1.5 rounded-3xl p-4">
              <Typography.Paragraph type="body-sm" weight="medium">
                Deine Notiz
              </Typography.Paragraph>
              <Typography.Paragraph type="body-sm" color="muted">
                {moment.originalNote}
              </Typography.Paragraph>
            </Surface>
          ) : null}

          <Surface variant="secondary" className="flex-row rounded-3xl px-2 py-3">
            <DetailAction
              icon={Pencil}
              label="Bearbeiten"
              color={foreground}
              onPress={() =>
                router.push({ pathname: '/moment/[id]/edit', params: { id: moment.id } })
              }
            />
            <DetailAction
              icon={Share2}
              label="Teilen"
              color={foreground}
              onPress={() => void share()}
            />
            <DetailAction
              icon={Trash2}
              label={confirmDelete ? 'Wirklich?' : 'Löschen'}
              color={danger}
              onPress={remove}
            />
          </Surface>

          {confirmDelete ? (
            <Button variant="tertiary" size="sm" onPress={() => setConfirmDelete(false)}>
              <Button.Label>Löschen abbrechen</Button.Label>
            </Button>
          ) : null}

          {hint ? (
            <Typography.Paragraph type="body-sm" color="muted">
              {hint}
            </Typography.Paragraph>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

type DetailActionProps = {
  icon: LucideIcon;
  label: string;
  color: string;
  onPress: () => void;
};

function DetailAction({ icon: Icon, label, color, onPress }: DetailActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-1 items-center gap-1.5 py-1 active:opacity-70"
    >
      <Icon size={19} color={color} />
      <Typography.Paragraph type="body-xs" style={{ color }}>
        {label}
      </Typography.Paragraph>
    </Pressable>
  );
}
