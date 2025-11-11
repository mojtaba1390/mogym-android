import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Linking, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

//const API_URL = 'https://api.mogym.ir'; // در صورت نیاز از env بگیر
//const API_URL = 'http://185.252.86.164:8083'; // در صورت نیاز بعداً از env/app.json بخوان
const API_URL = 'http://185.252.86.164:8083';
const palette = {
  bgDark: '#0e1015',
  cardDark: '#1a1d2e',
  borderDark: '#273043',
  textDark: '#ffffff',
  subDark: '#cbd5e1',
  textLight: '#0f172a',
  subLight: '#475569',
  primary: '#2563eb',
  danger: '#ef4444',
  ok: '#10b981',
};

export default function PaymentScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [dark, setDark] = useState(true);

  const colors = {
    bg: dark ? palette.bgDark : '#fff',
    card: dark ? palette.cardDark : '#fff',
    border: dark ? palette.borderDark : '#e5e7eb',
    text: dark ? palette.textDark : palette.textLight,
    sub: dark ? palette.subDark : palette.subLight,
  };

  const [planId, setPlanId] = useState(route?.params?.planId ?? null);
  const [title, setTitle] = useState(route?.params?.planTitle);
  const [basePrice, setBasePrice] = useState(route?.params?.finalPrice);

  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null); // { type:'percent'|'amount', value:number }
  const [finalPrice, setFinalPrice] = useState(route?.params?.finalPrice);

  const [loading, setLoading] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  const toman = (n) => `${Number(n || 0).toLocaleString('fa-IR')} تومان`;

  // 3) بررسی کد تخفیف
  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountInfo(null);
      setFinalPrice(basePrice);
      return;
    }
    try {
      setCheckingCode(true);
      const token = await AsyncStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/payment/calculate-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ PlanId: planId, DiscountCode: discountCode.trim() }),
      });

      const data = await res.json();
    const r = data?.Result;

      if (!res.ok || !data?.Result) {
        setDiscountInfo(null);
        setFinalPrice(basePrice);
        return Alert.alert('کد نامعتبر', data?.Message || 'کد تخفیف معتبر نیست.');
      }

    const original = Number(r.OriginalAmount ?? basePrice) || 0;
    const discount = Number(r.DiscountAmount ?? 0) || 0;
    const final    = Number(r.FinalAmount ?? Math.max(0, original - discount)) || 0;

    setBasePrice(original);
    setDiscountInfo({ original, discount, final });
    setFinalPrice(final);

    Alert.alert('اعمال شد', 'تخفیف با موفقیت اعمال شد.');
    } catch (e) {
    setDiscountInfo(null);
    setFinalPrice(basePrice);
    Alert.alert('خطا', 'عدم امکان بررسی کد تخفیف.');
    } finally {
      setCheckingCode(false);
    }
  };

  // 4) شروع فرآیند پرداخت
  const startPayment = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('نیاز به ورود', 'ابتدا وارد حساب شوید.');
        return navigation.navigate('Login');
      }

      const payload = {
        PlanId: planId,
        DiscountCode: discountInfo ? discountCode.trim() : null,
        Amount: Number(finalPrice) || 0
      };

      const res = await fetch(`${API_URL}/api/payment/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.redirectUrl) {
        throw new Error(data?.Message || 'ایجاد تراکنش ناموفق بود.');
      }

      const paymentUrl = data.redirectUrl;
      const supported = await Linking.canOpenURL(paymentUrl);
      if (supported) {
        await Linking.openURL(paymentUrl);
      } else {
        Alert.alert('خطا', 'بازکردن درگاه پرداخت امکان‌پذیر نبود.');
      }
    } catch (e) {
      Alert.alert('خطا', e?.message || 'مشکل در ایجاد پرداخت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* هدر */}
      <View style={{
        paddingTop: 8, paddingHorizontal: 16, paddingBottom: 12,
        flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Text style={{ fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.text, textAlign: 'right' }}>
          پرداخت
        </Text>
        <TouchableOpacity
          onPress={() => setDark(v => !v)}
          style={{
            padding: 10, borderRadius: 9999,
            backgroundColor: dark ? '#141827' : '#f1f5f9',
            borderWidth: 1, borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.sub }}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, writingDirection: 'rtl' }}>
        {/* خلاصه برنامه */}
        <View style={{
          backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
          borderRadius: 16, padding: 16, marginBottom: 12
        }}>
          <Text style={{ fontFamily: 'Vazir-Medium', color: colors.text, marginBottom: 6, textAlign: 'right' }}>
            {title}
          </Text>
        </View>

        {/* قیمت‌ها */}
<View style={{
  backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  borderRadius: 16, padding: 16, marginBottom: 12
}}>
  <Row>
    <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub }}>قیمت پایه</Text>
    <Text style={{ fontFamily: 'Vazir-Medium', color: colors.text }}>
      {toman(discountInfo ? discountInfo.original : basePrice)}
    </Text>
  </Row>

  {discountInfo ? (
    <Row>
      <Text style={{ fontFamily: 'Vazir-Regular', color: palette.ok }}>تخفیف</Text>
      <Text style={{ fontFamily: 'Vazir-Medium', color: palette.ok }}>
        {toman(discountInfo.discount)}
      </Text>
    </Row>
  ) : null}

  <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />

  <Row>
    <Text style={{ fontFamily: 'Vazir-Bold', color: colors.text }}>مبلغ نهایی</Text>
    <Text style={{ fontFamily: 'Vazir-Bold', color: colors.text }}>
      {toman(discountInfo ? discountInfo.final : finalPrice)}
    </Text>
  </Row>
</View>


        {/* کد تخفیف */}
        <View style={{
          backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
          borderRadius: 16, padding: 16, marginBottom: 12
        }}>
          <Text style={{ fontFamily: 'Vazir-Medium', color: colors.text, marginBottom: 8, textAlign: 'right' }}>
            کد تخفیف
          </Text>
          <TextInput
            value={discountCode}
            onChangeText={setDiscountCode}
            placeholder="کد را وارد کنید "
            placeholderTextColor={colors.sub}
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: 12,
              padding: 12, marginBottom: 10,
              color: colors.text, fontFamily: 'Vazir-Regular',
              textAlign: 'right', writingDirection: 'rtl'
            }}
          />
          <TouchableOpacity
            disabled={checkingCode}
            onPress={applyDiscount}
            style={{
              backgroundColor: palette.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center'
            }}
          >
            {checkingCode
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: '#fff', fontFamily: 'Vazir-Medium' }}>اعمال کد</Text>}
          </TouchableOpacity>
        </View>

        {/* دکمه پرداخت */}
        <TouchableOpacity
          disabled={loading || !planId}
          onPress={startPayment}
          style={{
            backgroundColor: loading ? '#94a3b8' : palette.primary,
            borderRadius: 12, paddingVertical: 14, alignItems: 'center'
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontFamily: 'Vazir-Bold' }}>پرداخت</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ children }) {
  return (
    <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      {children}
    </View>
  );
}
