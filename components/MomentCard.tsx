import { Card, Typography, useThemeColor } from 'heroui-native';
import { CalendarDays, Heart, MapPin } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MomentPhoto } from '@/components/MomentPhoto';
import { StarRating } from '@/components/StarRating';
import { TagList } from '@/components/TagList';
import { formatCardDate } from '@/lib/datetime';
import { useMomentsStore } from '@/lib/momentsStore';
import type { Moment } from '@/lib/types';

type MomentCardProps = { moment: Moment; onPress: () => void };

export function MomentCard({ moment, onPress }: MomentCardProps) {
  const { t } = useTranslation();
  const toggleFavorite = useMomentsStore((state) => state.toggleFavorite);
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-90">
      <Card className="border-border/60 bg-surface overflow-hidden rounded-3xl border p-0 shadow-sm">
        {moment.images.length > 0 ? <MomentPhoto image={moment.images[0]} height={196} /> : null}
        <View className="gap-2.5 px-4 pt-3.5 pb-4">
          <View className="flex-row items-start gap-3">
            <View className="flex-1 gap-1.5">
              <Typography.Heading type="h5" numberOfLines={2}>
                {moment.title}
              </Typography.Heading>
              {moment.location ? (
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={13} color={muted} />
                  <Typography.Paragraph type="body-sm" color="muted" numberOfLines={1}>
                    {moment.location}
                  </Typography.Paragraph>
                </View>
              ) : null}
              <View className="flex-row items-center gap-1.5">
                <CalendarDays size={13} color={accent} />
                <Typography.Paragraph type="body-sm" style={{ color: accent }}>
                  {formatCardDate(moment)}
                </Typography.Paragraph>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                moment.favorite ? t('moment.removeFavorite') : t('moment.addFavorite')
              }
              onPress={() => toggleFavorite(moment.id)}
              hitSlop={10}
              className="p-1 active:opacity-70"
            >
              <Heart
                size={20}
                color={moment.favorite ? accent : muted}
                fill={moment.favorite ? accent : 'transparent'}
              />
            </Pressable>
          </View>
          <TagList tags={moment.tags} limit={3} />
          {moment.description.length > 0 ? (
            <Typography.Paragraph type="body-sm" color="muted" numberOfLines={2}>
              {moment.description}
            </Typography.Paragraph>
          ) : null}
          {moment.rating ? <StarRating value={moment.rating} size={14} showValue /> : null}
        </View>
      </Card>
    </Pressable>
  );
}
