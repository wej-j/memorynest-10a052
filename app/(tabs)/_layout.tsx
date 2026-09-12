import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';
import { Home, Images, Plus, Search, User } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const unstable_settings = {
  initialRouteName: 'moments',
};

export default function TabLayout() {
  const { t } = useTranslation();
  const [background, backgroundSecondary, border, accent, accentForeground, muted] = useThemeColor([
    'background',
    'background-secondary',
    'border',
    'accent',
    'accent-foreground',
    'muted',
  ]);

  return (
    <>
      {/* oxlint-disable-next-line react/style-prop-object -- expo-status-bar's `style` is a string enum ('dark' | 'light' | 'auto'), not a React Native style object */}
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: backgroundSecondary,
            borderTopColor: border,
            elevation: 0,
            shadowColor: 'transparent',
            shadowOpacity: 0,
            shadowRadius: 0,
            height: Platform.OS === 'web' ? 68 : undefined,
          },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="moments"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="photos"
          options={{
            title: t('tabs.photos'),
            tabBarIcon: ({ color, size }) => <Images color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="capture"
          options={{
            title: t('tabs.new'),
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
            title: t('tabs.search'),
            tabBarIcon: ({ color, size }) => <Search color={color} size={size ?? 22} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, size }) => <User color={color} size={size ?? 22} />,
          }}
        />
      </Tabs>
    </>
  );
}
