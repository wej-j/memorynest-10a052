import { Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';

type BrandWordmarkProps = {
  /** Font size of the word; the mark scales with it. */
  size?: number;
  color?: string;
};

/**
 * "Remory" wordmark: the drawn R from the design followed by the rest of the
 * word, so the logo and the app name always read as one unit.
 */
export function BrandWordmark({ size = 26, color }: BrandWordmarkProps) {
  return (
    <View className="flex-row items-center" accessibilityRole="header" accessibilityLabel="Remory">
      <BrandLogo size={size * 1.24} color={color} />
      <Text
        className="text-foreground"
        style={{
          fontSize: size,
          lineHeight: size * 1.18,
          fontWeight: '600',
          letterSpacing: -0.4,
          marginLeft: -size * 0.06,
          ...(color ? { color } : null),
        }}
      >
        emory
      </Text>
    </View>
  );
}
