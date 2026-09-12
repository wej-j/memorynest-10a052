import type { ConfigContext, ExpoConfig } from '@expo/config';

type ExpoPlugins = NonNullable<ExpoConfig['plugins']>;

export default ({ config }: ConfigContext): ExpoConfig => {
  const nativePlugins: ExpoPlugins =
    process.env.EXPO_PLATFORM === 'native'
      ? [['expo-dev-client', { launchMode: 'most-recent' }]]
      : [];

  return {
    ...config,
    name: 'Remory',
    slug: 'remory',
    version: process.env.BILT_APP_VERSION ?? '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    scheme: 'remory',
    runtimeVersion: {
      policy: 'appVersion',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      supportsTablet: true,
      bundleIdentifier: process.env.BILT_IOS_BUNDLE_ID ?? 'me.bilt.remory',
    },
    android: {
      package: process.env.BILT_ANDROID_PACKAGE ?? 'me.bilt.remory',
    },
    web: {
      bundler: 'metro',
      // 'single' = SPA export: one index.html + client routing, so edge serving
      // needs only a single 404→index.html fallback rule.
      output: 'single',
      favicon: './public/icons/icon-192.png',
    },
    extra: {
      appStoreAppId: process.env.BILT_APP_STORE_APP_ID,
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-image',
      'expo-localization',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#120D1A',
          image: './assets/brand/remory-logo.png',
          imageWidth: 280,
          resizeMode: 'contain',
          dark: {
            backgroundColor: '#120D1A',
            image: './assets/brand/remory-logo.png',
          },
          ios: {
            backgroundColor: '#120D1A',
            image: './assets/brand/remory-logo.png',
            imageWidth: 280,
            resizeMode: 'contain',
          },
          android: {
            backgroundColor: '#120D1A',
            image: './assets/brand/remory-logo.png',
            imageWidth: 180,
            resizeMode: 'contain',
          },
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Remory braucht Zugriff auf deine Fotos, um sie einem Moment hinzuzufügen.',
          cameraPermission: 'Remory nutzt die Kamera, um einen Moment direkt festzuhalten.',
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Remory kann vorschlagen, wo ein Moment passiert ist. Der Ort ist immer optional.',
        },
      ],
      ...nativePlugins,
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  };
};
