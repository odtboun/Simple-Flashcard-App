export default {
  expo: {
    name: "Simple-Flashcard-App",
    slug: "Simple-Flashcard-App",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.omerdem.simpleflashcard",
      buildNumber: "1.0.0",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    plugins: [
      'expo-document-picker',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '13.0'
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
  }
}; 