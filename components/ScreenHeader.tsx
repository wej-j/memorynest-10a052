import { Button, Typography, useThemeColor } from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Optional trailing controls, e.g. an edit button. */
  action?: ReactNode;
};

export function ScreenHeader({ title, subtitle, onBack, action }: ScreenHeaderProps) {
  const [foreground] = useThemeColor(['foreground']);

  return (
    <View className="gap-1 px-5 pt-2 pb-3">
      <View className="flex-row items-center gap-2">
        {onBack ? (
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={onBack}
            accessibilityLabel="Go back"
            className="-ml-2"
          >
            <ChevronLeft size={22} color={foreground} />
          </Button>
        ) : null}

        <Typography.Heading type="h3" className="flex-1" numberOfLines={1}>
          {title}
        </Typography.Heading>

        {action}
      </View>

      {subtitle ? (
        <Typography.Paragraph type="body-sm" color="muted" className={onBack ? 'ml-8' : undefined}>
          {subtitle}
        </Typography.Paragraph>
      ) : null}
    </View>
  );
}
