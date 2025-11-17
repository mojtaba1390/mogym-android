import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '../api/telemetry'; // مسیر درستش رو بذار
import { registerPushToken } from '../services/pushService';

export default function SplashScreen({ navigation }) {

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // انیمیشن ظاهر شدن
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 90,
        useNativeDriver: true
      })
    ]).start();

    // بعد از ۲ ثانیه برو صفحه اصلی یا لاگین
    setTimeout(async () => {
            logEvent('AppOpened');
      const token = await AsyncStorage.getItem('token');
      if (token) {
              registerPushToken(); // ثبت یا آپدیت توکن پوش
        navigation.replace('Main');   // داشبورد / ناوبری اصلی
      } else {
        navigation.replace('Landing');
      }
    }, 3000);

  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
        <Image
          source={require('../../assets/images/favicon.png')}
          style={styles.logo}
        />
        <Text style={styles.text}>موجیم، باشگاهی به وسعت ایران</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1015',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 20,
    marginLeft:60,
    alignItems:'center'
  },
  text: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Vazir-Bold',
    textAlign: 'center'
  }
});
