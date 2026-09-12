import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

import { SafeAreaView } from '@/components/ui/primitives/SafeAreaView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <SafeAreaView edges={['bottom']} className="flex-1 items-center justify-center px-5 py-6">
        <Text className="text-foreground text-xl font-semibold">
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" className="mt-4 py-4">
          <Text className="text-accent">Go to home screen!</Text>
        </Link>
      </SafeAreaView>
    </>
  );
}
