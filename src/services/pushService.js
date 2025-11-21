// src/services/pushService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API_URL = 'http://185.252.86.164:8083'; // مثل بقیه جاها

// تنظیم رفتار نوتی روی فورگراند (فقط یک‌بار در اپ)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerPushToken() {
  try {
    // دستگاه فیزیکی یا شبیه‌ساز؟ (Expo Go روی شبیه‌ساز هم کار می‌کنه ولی جنرال می‌ذاریم)
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // گرفتن Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId, // اگر EAS داری؛ اگر نداشتی، بدون config هم کار می‌کنه در dev
    });

    const expoPushToken = tokenData.data;
    const devicePlatform = Platform.OS; // android / ios
    const appVersion = Constants.expoConfig?.version || 'dev';

    const jwt = await AsyncStorage.getItem('token');
    if (!jwt) return;

    // ارسال به سرور
    await fetch(`${API_URL}/api/push/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        expoPushToken,
        devicePlatform,
        appVersion,
      }),
    });

    console.log('Push token registered', expoPushToken);
  } catch (e) {
    console.log('registerPushToken error', e);
  }
}

