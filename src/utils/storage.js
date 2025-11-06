import AsyncStorage from '@react-native-async-storage/async-storage';

export const setToken = (t) => AsyncStorage.setItem('token', t || '');
export const getToken = () => AsyncStorage.getItem('token');
export const clearToken = () => AsyncStorage.removeItem('token');

export const setItem = (k, v) => AsyncStorage.setItem(k, JSON.stringify(v));
export const getItem = async (k, def=null) => {
  const s = await AsyncStorage.getItem(k);
  return s ? JSON.parse(s) : def;
};
