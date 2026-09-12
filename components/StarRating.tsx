import { Typography, useThemeColor } from 'heroui-native';
import { Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type StarRatingProps = {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: number;
  showValue?: boolean;
};
const STARS = [1, 2, 3, 4, 5];

export function StarRating({ value, onChange, size = 18, showValue = false }: StarRatingProps) {
  const { t } = useTranslation();
  const [warning, muted] = useThemeColor(['warning', 'muted']);
  const rating = value ?? 0;

  return (
    <View className="flex-row items-center gap-1.5">
      <View className="flex-row items-center gap-1">
        {STARS.map((star) => {
          const active = star <= rating;
          const icon = (
            <Star
              size={size}
              color={active ? warning : muted}
              fill={active ? warning : 'transparent'}
            />
          );
          if (!onChange) return <View key={star}>{icon}</View>;
          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={t('accessibility.stars', { count: star })}
              onPress={() => onChange(rating === star ? null : star)}
              className="p-0.5 active:opacity-70"
            >
              {icon}
            </Pressable>
          );
        })}
      </View>
      {showValue && value !== null ? (
        <Typography.Paragraph type="body-sm" color="muted">{`${value},0`}</Typography.Paragraph>
      ) : null}
    </View>
  );
}
