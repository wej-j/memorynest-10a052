import { Typography, useThemeColor } from 'heroui-native';
import { Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type StarRatingProps = {
  value: number | null;
  /** Omit to render a read-only rating. */
  onChange?: (value: number | null) => void;
  size?: number;
  showValue?: boolean;
};

const STARS = [1, 2, 3, 4, 5];

/** Five-star rating, as in the design. Tapping the current value clears it. */
export function StarRating({ value, onChange, size = 18, showValue = false }: StarRatingProps) {
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
              accessibilityLabel={`${star} von 5 Sternen`}
              onPress={() => onChange(rating === star ? null : star)}
              className="p-0.5 active:opacity-70"
            >
              {icon}
            </Pressable>
          );
        })}
      </View>

      {showValue && value !== null ? (
        <Typography.Paragraph type="body-sm" color="muted">
          {`${value},0`}
        </Typography.Paragraph>
      ) : null}
    </View>
  );
}
