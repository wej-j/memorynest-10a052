import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';
import { Plus, Search, Sparkles } from 'lucide-react-native';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  const [background, border, accent, accentForeground, muted] = useThemeColor([
    'background',
    'border',
    'accent',
    'accent-foreground',
    'muted',
  ]);

  return (
    <>
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum ('dark' | 'light' | 'auto'), not a React Native style object */}
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: background,
            borderTopColor: border,
            height: Platform.OS === 'web' ? 68 : undefined,
          },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Moments',
            tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size ?? 22} />,
          }}
        />

        <Tabs.Screen
          name="capture"
          options={{
            title: 'Add',
            tabBarLabel: () => null,
            tabBarIcon: () => (
              <View
                className="bg-accent h-12 w-12 items-center justify-center rounded-full shadow-md"
                style={{ marginTop: Platform.OS === 'web' ? 0 : 6 }}
              >
                <Plus color={accentForeground} size={24} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => <Search color={color} size={size ?? 22} />,
          }}
        />
      </Tabs>
    </>
  );
}
