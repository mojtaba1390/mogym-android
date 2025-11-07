import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import FeatureCarousel from '../../components/FeatureCarousel';

const primary = '#7c3aed'; // بنفش (برای دکمه‌ها)
const primaryHover = '#6d28d9';
const blue = '#2563eb';
const bgDark = '#0e1015';
const cardDark = '#1a1d2e';
const borderDark = '#273043';

export default function LandingScreen({ navigation }) {
  const [dark, setDark] = useState(true);

// داخل کامپوننت LandingScreen:
const handleAuthPress = async () => {
  try {
    const t = await AsyncStorage.getItem('token');
    if (t) {
      navigation.navigate('Dashboard');   // داشبورد (تب‌ها)
    } else {
      navigation.navigate('Login');  // صفحه ورود
    }
  } catch (e) {
    navigation.navigate('Login');
  }
};

  const handleFreePlanClick = async () => {
    const token = await AsyncStorage.getItem('token');
    await AsyncStorage.setItem('freeRequestedPlan', '3');
    await AsyncStorage.setItem('freePlanType', '0');
    await AsyncStorage.setItem('freePrice', '0');

    if (!token) {
      // معادل redirectAfterLogin
      await AsyncStorage.setItem('redirectAfterLogin', JSON.stringify({ to: 'PlanWizard' }));
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('PlanWizard');
  };

  return (
    <View style={{ flex:1, backgroundColor: dark ? bgDark : '#fff' }}>
      {/* دکمه تم بالا-راست */}
      <View style={{ position:'absolute', top:16, right:16, zIndex:30 }}>
        <TouchableOpacity
          onPress={() => setDark(v=>!v)}
          style={{ padding:10, borderRadius:9999, backgroundColor: dark ? '#141827' : '#f1f5f9', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb' }}
        >
          <Ionicons name={dark ? 'sunny' : 'moon'} size={18} color={dark ? '#fde047' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      {/* بنر تخفیف (استیکی) */}
      <View style={{ paddingVertical:8, alignItems:'center', justifyContent:'center', backgroundColor:'#7e22ce' }}>
        <Text style={{ color:'#fff', fontFamily:'Vazir-Bold' }}>
          کد تخفیف ۵۰% روی تمام پلن‌ها
          <Text> </Text>
          <Text style={{
            backgroundColor:'#fff', color:'#7e22ce', paddingHorizontal:6, paddingVertical:2,
            borderRadius:6, fontFamily:'Vazir-Bold'
          }}>
            mogym
          </Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom:24 }}>
        {/* هدر */}
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
          paddingHorizontal:16, paddingVertical:12, backgroundColor: dark ? cardDark : '#fff',
          borderBottomWidth:1, borderColor: dark ? borderDark : '#e5e7eb', marginTop:8
        }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            {/* می‌تونی لوگو/تیتر بذاری */}
            {/* <Image source={require('../../../assets/logo.png')} style={{width:24,height:24}} /> */}
          </View>
<TouchableOpacity
  onPress={handleAuthPress}
  style={{ backgroundColor: primary, paddingHorizontal:16, paddingVertical:8, borderRadius:12 }}
>
  <Text style={{ color:'#fff', fontFamily:'Vazir-Medium' }}>ورود / ثبت‌نام</Text>
</TouchableOpacity>

        </View>

        {/* هیرو */}
        <View style={{ alignItems:'center', paddingVertical:32, paddingHorizontal:16, backgroundColor: dark ? bgDark : '#f3f4f6' }}>
          <Image source={{ uri: 'https://mogym.ir/logo.png' }} style={{ width:96, height:96, marginBottom:12 }} />
          <Text style={{ fontFamily:'Vazir-Bold', fontSize:22, color: dark ? '#fff' : '#0f172a', marginBottom:8 }}>
            باشگاهی به وسعت ایران
          </Text>
          <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569', textAlign:'center', marginBottom:16 }}>
            اولین اپلیکیشن فارسی تناسب اندام با هوش مصنوعی
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Plans')}
            style={{ backgroundColor: primary, paddingHorizontal:20, paddingVertical:12, borderRadius:12 }}
          >
            <Text style={{ color:'#fff', fontFamily:'Vazir-Medium', fontSize:16 }}>شروع برنامه</Text>
          </TouchableOpacity>
        </View>

        {/* اسلایدر ویژگی‌ها - Placeholder */}
        <View style={{ padding:16 }}>
          <View style={{
            backgroundColor: dark ? cardDark : '#fff', borderRadius:16, borderWidth:1,
            borderColor: dark ? borderDark : '#e5e7eb', padding:16
          }}>
            {/* <Text style={{ fontFamily:'Vazir-Bold', color: dark ? '#fff' : '#0f172a', marginBottom:8,textAlign:'right' }}>
              ویژگی‌ها
            </Text> */}
            <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569' }}>
<FeatureCarousel dark={dark} />
            </Text>
          </View>
        </View>

        {/* برنامه رایگان ۳ روزه */}
        <View style={{ paddingHorizontal:16, paddingVertical:24, backgroundColor: dark ? bgDark : '#f3f4f6' }}>
          <View style={{
            maxWidth:680, alignSelf:'center',
            backgroundColor: dark ? cardDark : '#fff', borderRadius:16, borderWidth:1,
            borderColor: dark ? borderDark : '#e5e7eb', padding:16
          }}>
            <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color: dark ? '#fff' : '#0f172a', marginBottom:6 ,textAlign:'right'}}>
              برنامه رایگان ۳ روزه
            </Text>
            <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569', marginBottom:12,textAlign:'right' }}>
              برای آشنایی با موجیم، یک برنامه کامل تمرین و تغذیه برای ۳ روز به صورت رایگان دریافت کن
            </Text>
            <TouchableOpacity
              onPress={handleFreePlanClick}
              style={{ backgroundColor: blue, paddingVertical:12, borderRadius:12, alignItems:'center' }}
            >
              <Text style={{ fontFamily:'Vazir-Medium', color:'#fff' }}>دریافت رایگان برنامه</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* درخواست برنامه کامل */}
        <View style={{ paddingHorizontal:16, paddingVertical:24 }}>
          <View style={{
            maxWidth:680, alignSelf:'center',
            backgroundColor: dark ? cardDark : '#fff', borderRadius:16, borderWidth:1,
            borderColor: dark ? borderDark : '#e5e7eb', padding:16
          }}>
            <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color: dark ? '#fff' : '#0f172a', marginBottom:6,textAlign:'right' }}>
              می‌خوای حرفه‌ای‌تر برنامه بگیری؟
            </Text>
            <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569', marginBottom:12 ,textAlign:'right'}}>
              با دریافت برنامه کامل تمرین، رژیم، مکمل و تحلیل هوشمند، حرفه‌ای پیش برو
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Plans')}
              style={{ backgroundColor: primary, paddingVertical:12, borderRadius:12, alignItems:'center' }}
            >
              <Text style={{ fontFamily:'Vazir-Medium', color:'#fff' }}>درخواست برنامه کامل</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* فوتر ساده */}
        <View style={{ paddingVertical:24, alignItems:'center', borderTopWidth:1, borderColor: dark ? borderDark : '#e5e7eb' }}>
          <View style={{ flexDirection:'row', gap:16, marginBottom:8 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={{ color: dark ? '#cbd5e1' : '#475569', fontFamily:'Vazir-Regular' }}>شرایط و مقررات</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Faq')}>
              <Text style={{ color: dark ? '#cbd5e1' : '#475569', fontFamily:'Vazir-Regular' }}>سوالات متداول</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
              <Text style={{ color: dark ? '#cbd5e1' : '#475569', fontFamily:'Vazir-Regular' }}>ارتباط با ما</Text>
            </TouchableOpacity>
          </View>

          {/* بج‌های زرین‌بال/اینماد در RN → بعداً می‌تونیم با WebView یا تصویر ثابت پیاده کنیم */}
        </View>
      </ScrollView>
    </View>
  );
}
