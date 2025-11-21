import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_URL = 'http://185.252.86.164:8083'; // اگر از env می‌گیری، همون رو استفاده کن

const getClientMeta = () => {
  const appVersion = Constants.expoConfig?.version || 'dev';
  const platform = Platform.OS;
  return { appVersion, platform };
};

export async function logEvent(eventType, extra = null) {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token)  
        token="";

    const { appVersion, platform } = getClientMeta();

    await fetch(`${API_URL}/api/telemetry/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventType,
        devicePlatform: platform,
        appVersion,
        extra,
      }),
    });
    // خطاش رو هم فعلا ignore می‌کنیم، فاز بعدی می‌تونیم queue کنیم
  } catch (e) {
    // سایلنت – نمی‌خوایم UX خراب شه
    console.log('logEvent error', e);
  }
}
