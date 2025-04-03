export default {
  expo: {
    name: "Simple-Flashcard-App",
    slug: "Simple-Flashcard-App",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    icon: "./assets/icon/icon.png",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.omerdem.simpleflashcard",
      buildNumber: "1.0.0",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleIconName: "AppIcon"
      }
    },
    plugins: [
      'expo-document-picker',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '13.4'
          }
        }
      ]
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "dbf288a2-6f5f-4eea-bf7f-f4681b1fd860"
      }
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    updates: {
      url: "https://u.expo.dev/dbf288a2-6f5f-4eea-bf7f-f4681b1fd860"
    }
  }
}; 