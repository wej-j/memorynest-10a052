import { Chip } from 'heroui-native';
import { View } from 'react-native';

type TagListProps = {
  tags: string[];
  /** Cards only show the first few tags. */
  limit?: number;
  size?: 'sm' | 'md';
};

export function TagList({ tags, limit, size = 'sm' }: TagListProps) {
  const shown = limit ? tags.slice(0, limit) : tags;
  if (shown.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2">
      {shown.map((tag) => (
        <Chip key={tag} size={size} variant="soft" color="accent">
          <Chip.Label>{tag}</Chip.Label>
        </Chip>
      ))}
    </View>
  );
}
