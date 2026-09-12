import { Typography, useThemeColor } from 'heroui-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type SettingsRowProps = {
  icon: LucideIcon;
  label: string;
  /** Trailing value, e.g. the selected language. */
  value?: string;
  onPress?: () => void;
};

/** One row of the profile / settings list. */
export function SettingsRow({ icon: Icon, label, value, onPress }: SettingsRowProps) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);

  const content = (
    <View className="flex-row items-center gap-3 px-4 py-4">
      <Icon size={19} color={foreground} />

      <Typography.Paragraph type="body" className="flex-1">
        {label}
      </Typography.Paragraph>

      {value ? (
        <Typography.Paragraph type="body-sm" color="muted">
          {value}
        </Typography.Paragraph>
      ) : null}

      {onPress ? <ChevronRight size={18} color={muted} /> : null}
    </View>
  );

  if (!onPress) return <View>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="active:opacity-70"
    >
      {content}
    </Pressable>
  );
}
