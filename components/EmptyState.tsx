import { Button, Typography, useThemeColor } from 'heroui-native';
import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const [accentSoftForeground] = useThemeColor(['accent-soft-foreground']);

  return (
    <View className="items-center gap-4 px-6 py-12">
      <View className="bg-accent-soft h-16 w-16 items-center justify-center rounded-full">
        <Icon size={26} color={accentSoftForeground} />
      </View>

      <Typography.Heading type="h4" align="center">
        {title}
      </Typography.Heading>

      <Typography.Paragraph type="body-sm" color="muted" align="center" className="max-w-72">
        {body}
      </Typography.Paragraph>

      {actionLabel && onAction ? (
        <Button variant="primary" size="md" onPress={onAction} className="mt-2">
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
