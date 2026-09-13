import { Typography, useThemeColor } from 'heroui-native';
import { ChevronLeft } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

type StepHeaderProps = {
  title?: string;
  centerContent?: ReactNode;
  onBack: () => void;
  /** Trailing control: either a text label or an icon. */
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
};

/** Compact header for the start screens: back on the left, one action on the right. */
export function StepHeader({
  title,
  centerContent,
  onBack,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: StepHeaderProps) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);

  return (
    <View className="flex-row items-center justify-between px-4 pb-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Zurück"
        onPress={onBack}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center rounded-full active:opacity-70"
      >
        <ChevronLeft size={22} color={foreground} />
      </Pressable>

      {centerContent ?? (title ? <Typography.Heading type="h5">{title}</Typography.Heading> : null)}

      {onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel ?? 'Weiter'}
          onPress={onAction}
          hitSlop={8}
          className="h-9 min-w-9 items-center justify-center rounded-full px-1 active:opacity-70"
        >
          {ActionIcon ? (
            <ActionIcon size={20} color={foreground} />
          ) : (
            <Typography.Paragraph type="body-sm" style={{ color: muted }}>
              {actionLabel}
            </Typography.Paragraph>
          )}
        </Pressable>
      ) : (
        <View className="h-9 w-9" />
      )}
    </View>
  );
}
