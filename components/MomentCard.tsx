import { Card, Typography } from 'heroui-native';
import { Pressable, View } from 'react-native';

import { MomentPhoto } from '@/components/MomentPhoto';
import { TagList } from '@/components/TagList';
import { formatCardDate } from '@/lib/datetime';
import type { Moment } from '@/lib/types';

type MomentCardProps = {
  moment: Moment;
  onPress: () => void;
};

export function MomentCard({ moment, onPress }: MomentCardProps) {
  const meta = [formatCardDate(moment), moment.location].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-90">
      <Card className="border-border bg-surface overflow-hidden rounded-3xl border p-0 shadow-sm">
        {moment.image ? <MomentPhoto image={moment.image} height={208} /> : null}

        <View className="gap-2 px-4 pt-3.5 pb-4">
          <Typography.Heading type="h4" numberOfLines={2}>
            {moment.title}
          </Typography.Heading>

          <Typography.Paragraph type="body-sm" color="muted">
            {meta}
          </Typography.Paragraph>

          <TagList tags={moment.tags} limit={4} />

          {moment.description.length > 0 ? (
            <Typography.Paragraph type="body-sm" color="muted" numberOfLines={2}>
              {moment.description}
            </Typography.Paragraph>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
