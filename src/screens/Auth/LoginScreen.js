// src/screens/Auth/LoginScreen.js
import { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons'; // اگر نصب نیست: npx expo install @expo/vector-icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Animated, Easing, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

//const API_URL = 'https://api.mogym.ir'; // در صورت نیاز بعداً از env/app.json بخوان
const API_URL = 'http://185.252.86.164:8083'; // در صورت نیاز بعداً از env/app.json بخوان



export default function LoginScreen({ navigation }) {
  const [dark, setDark] = useState(true);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [error, setError] = useState('');
const [phoneError, setPhoneError] = useState('');
const [otpError, setOtpError] = useState('');
const fadeAnim = useState(new Animated.Value(0))[0]; // برای fade انیمیشن

  useEffect(() => {
    let timer;
    if (count > 0) timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

  const toggleTheme = () => setDark(v => !v);
const showLoader = () => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start();
};

const hideLoader = () => {
  Animated.timing(fadeAnim, {
    toValue: 0,
    duration: 300,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  }).start();
};

const validatePhone = (value) => {
  setPhone(value);
  if (!/^09\d{9}$/.test(value)) {
    setPhoneError('فرمت شماره موبایل صحیح نیست');
  } else {
    setPhoneError('');
  }
};
const validateOtp = (value) => {
  setOtp(value);
  if (!/^\d{4,6}$/.test(value)) {
    setOtpError('کد باید عددی و بین ۴ تا ۶ رقم باشد');
  } else {
    setOtpError('');
  }
};

  const sendOtp = async () => {
    try {
      showLoader();
      setLoading(true); 
      setError('');
      const res = await fetch(`${API_URL}/api/auth/send-otp/${phone}`, {
        method:'POST'
      });
      if (res.status === 200) {
        setOtpSent(true);
        setCount(120); // 2 min
      } else {
           const data = await res.json();
        setError(data.Message || 'خطا در ارسال کد');
      }
    } catch { setError('ارسال کد ناموفق بود'); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    try {
      showLoader();
      setLoading(true); 
      setError('');
      const res = await fetch(`${API_URL}/api/auth/login/otp`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phoneNumber: phone, otpCode: otp })
      });
      const data = await res.json();
if (res.status === 200 && data.Jwt) 
  {
  const token = data.Jwt;
await AsyncStorage.setItem('token', token);  
navigation.navigate('Dashboard');
}
else{
        setError(data.Message || 'کد تأیید نادرست است');
}
  }
catch { 
      setError('خطا در ارتباط با سرور');
 }
    finally { setLoading(false); }
  };
  // رنگ‌ها
  const bg = dark ? '#0e1015' : '#ffffff';
  const card = dark ? '#1a1d2e' : '#ffffff';
  const text = dark ? '#ffffff' : '#000000';
  const sub = dark ? '#cbd5e1' : '#475569';
  const primary = '#2563eb';
  const border = dark ? '#273043' : '#e5e7eb';

<Animated.View
  pointerEvents={loading ? 'auto' : 'none'}
  style={{
    opacity: fadeAnim,
    position: 'absolute',
    inset: 0,
    backgroundColor: '#0008',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  }}
>
  <ActivityIndicator size="large" color="#fff" />
</Animated.View>

  return (
    <View style={{ flex:1, backgroundColor:bg, padding:16, justifyContent:'center', alignItems:'center' }}>
      {/* دکمه‌ی دارک/لایت بالا-راست */}
      <View style={{ position:'absolute', top:16, right:16, zIndex:30 }}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={{ padding:10, borderRadius:9999, backgroundColor: dark ? '#141827' : '#f1f5f9', borderWidth:1, borderColor:border }}
        >
          <Ionicons name={dark ? 'sunny' : 'moon'} size={20} color={dark ? '#fde047' : '#0f172a'} />
        </TouchableOpacity>
      </View>

{loading && (
  <View style={{ position: 'absolute', inset: 0, backgroundColor: '#0006', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
    <ActivityIndicator size="large" />
  </View>
)}


      <View style={{ width:'100%', maxWidth:420, backgroundColor:card, borderRadius:16, padding:20, borderWidth:1, borderColor:border }}>
        <Image source={{ uri:'https://mogym.ir/logo.png' }} style={{ width:80, height:80, alignSelf:'center', marginBottom:20 }} />

        <Text style={{ fontFamily:'Vazir-Bold', fontSize:22, color:text, textAlign:'center', marginBottom:8 }}> ورود به موجیم</Text>

        {!otpSent ? (
          <>
<Text style={{ fontFamily: 'Vazir-Regular', color: text, marginBottom: 6,textAlign:'right' }}>شماره موبایل</Text>

<TextInput
  keyboardType="phone-pad"
  value={phone}
  onChangeText={validatePhone}
  placeholder="09xxxxxxxxx"
  placeholderTextColor={sub}
  style={{
    fontFamily: 'Vazir-Regular',
    color: text,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  }}
/>
{otpError ? (
  <Text style={{ fontFamily: 'Vazir-Regular', color: '#ef4444', marginBottom: 6 }}>
    {otpError}
  </Text>
) : null}
{phoneError ? (
  <Text style={{ fontFamily: 'Vazir-Regular', color: '#ef4444', marginBottom: 15,textAlign:'right' }}>
    {phoneError}
  </Text>
) : null}

<TouchableOpacity
  onPress={sendOtp}
  disabled={!phone || !!phoneError || loading}
  style={{
    backgroundColor: primary,
    padding: 14,
    borderRadius: 12,
    opacity: (!phone || !!phoneError || loading) ? 0.6 : 1,
  }}
>
  <Text style={{ fontFamily: 'Vazir-Medium', color: '#fff', textAlign: 'center' }}>
    ارسال کد یکبار مصرف
  </Text>
</TouchableOpacity>

          </>
        ) : (
          <>
            <Text style={{ fontFamily:'Vazir-Medium', color:text, marginBottom:6 }}>کد تایید</Text>
            <TextInput
              keyboardType="number-pad"
              value={otp}
              onChangeText={validateOtp}
              placeholder="— — — — — — "
              placeholderTextColor={sub}
              style={{
                fontFamily:'Vazir', color:text, letterSpacing:6, textAlign:'center',
                borderWidth:1, borderColor:border, borderRadius:12, padding:12, marginBottom:12
              }}
            />
<TouchableOpacity
  onPress={verifyOtp}
  disabled={!otp || !!otpError || loading} // ❗ یعنی وقتی کد خالی یا اشتباهه، دکمه غیرفعال میشه
  style={{
    backgroundColor: primary,
    padding: 14,
    borderRadius: 12,
    opacity: (!otp || !!otpError || loading) ? 0.6 : 1, // ❗ وقتی غیرفعاله، رنگ کم‌رنگ‌تر بشه
  }}
>
  <Text style={{ fontFamily: 'Vazir-Medium', color: '#fff', textAlign: 'center' }}>
    تأیید و ورود
  </Text>
</TouchableOpacity>


            <TouchableOpacity onPress={() => count===0 && sendOtp()} style={{ marginTop:12, alignSelf:'center' }}>
              <Text style={{ fontFamily:'Vazir-Medium', color: count===0 ? primary : sub }}>
                ارسال مجدد {count>0 ? `(${count})` : ''}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {error ? <Text style={{ fontFamily:'Vazir-Medium', color:'#ef4444', textAlign:'center', marginTop:10 }}>{error}</Text> : null}
      </View>
    </View>
  );
}
