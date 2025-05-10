import 'dotenv/config';

export default {
  expo: {
    name: "NGapp",
    slug: "NGapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: "AIzaSyBO84qXJQtsJZFIrUUkVgct2ikDg0nHZ1w"
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      ["expo-router", {
        "origin": "http://localhost:8081",
        "root": "app"
      }],
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      API_BASE_URL: process.env.API_BASE_URL,
    }
  }
};
