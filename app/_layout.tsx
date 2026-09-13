// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import '../global.css';
// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import '@/lib/i18n';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Comfortaa_700Bold } from '@expo-google-fonts/comfortaa';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as DevClient from 'expo-dev-client';
import { HeroUINativeProvider, useThemeColor } from 'heroui-native';
import { Uniwind } from 'uniwind';
import {
  ErrorBoundary as ExpoErrorBoundary,
  type ErrorBoundaryProps,
  SplashScreen,
  Stack,
} from 'expo-router';

import { initPostHog } from '@/lib/posthog';
import { registerServiceWorker } from '@/lib/registerServiceWorker';
import { reportErrorToParent } from '@/lib/reportPreviewError';
import { InstallPrompt } from '@/components/InstallPrompt';

/**
 * Custom ErrorBoundary that reports React render errors to the parent window (Bilt preview iframe)
 * and then renders the default Expo error UI.
 */
function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    if (Platform.OS === 'web' && error) {
      const message = [error.message, error.stack].filter(Boolean).join('\n');
      reportErrorToParent(message);
    }
  }, [error]);
  return <ExpoErrorBoundary error={error} retry={retry} />;
}

export { ErrorBoundary };

// Remory is a dark-only app; the palette in global.css defines both variants.
Uniwind.setTheme('dark');

void SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

/** Lives inside the provider so it can read themed colors. */
function AppStack() {
  const [background] = useThemeColor(['background']);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="start/capture" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="start/collection" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="review" />
      <Stack.Screen name="moment/[id]/index" />
      <Stack.Screen name="moment/[id]/edit" />
      <Stack.Screen name="settings/language" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/rules" />
      <Stack.Screen name="settings/support" />
      <Stack.Screen name="settings/about" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Comfortaa_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Report uncaught JS errors and unhandled promise rejections to parent (Bilt preview iframe)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;

    const handleError = (event: ErrorEvent) => {
      const message = event.error?.stack ?? event.message ?? 'Unknown error';
      reportErrorToParent(message);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      const message =
        err instanceof Error ? [err.message, err.stack].filter(Boolean).join('\n') : String(err);
      reportErrorToParent(message);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Inject Google Fonts for reliable web fallbacks when expo-font is unavailable.
  useEffect(() => {
    if (Platform.OS === 'web') {
      const existingLink = document.querySelector('link[data-remory-fonts="true"]');

      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.dataset.remoryFonts = 'true';
        link.href =
          'https://fonts.googleapis.com/css2?family=Comfortaa:wght@700&family=Inter:wght@400;500;600;700&display=swap';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    }
  }, []);

  useEffect(() => {
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (__DEV__ && Platform.OS !== 'web' && !isExpoGo) {
      const timer = setTimeout(() => {
        DevClient.closeMenu();
        DevClient.hideMenu();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initPostHog();
    }
  }, []);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <AppStack />
          <InstallPrompt />
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
