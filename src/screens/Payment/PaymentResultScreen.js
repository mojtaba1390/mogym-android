import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const API_URL = 'https://api.mogym.ir'; // در صورت نیاز از env بخوان

const palette = {
  bgDark: '#0e1015',
  cardDark: '#1a1d2e',
  borderDark: '#273043',
  textDark: '#ffffff',
  subDark: '#cbd5e1',
  textLight: '#0f172a',
  subLight: '#475569',
  primary: '#2563eb',
  ok: '#10b981',
  danger: '#ef4444',
};

function parseQuery(url) {
  try {
    const { queryParams } = Linking.parse(url);
    return queryParams || {};
  } catch {
    return {};
  }
}

export default function PaymentResultScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [dark, setDark] = useState(true);

  const colors = useMemo(() => ({
    bg: dark ? palette.bgDark : '#fff',
    card: dark ? palette.cardDark : '#fff',
    border: dark ? palette.borderDark : '#e5e7eb',
    text: dark ? palette.textDark : palette.textLight,
    sub: dark ? palette.subDark : palette.subLight,
  }), [dark]);

  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'failed' | null
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);
  const [refId, setRefId] = useState(null);
  const [planId, setPlanId] = useState(route?.params?.planId ?? null);

  // گرفتن پارامترها از deeplink یا route.params
  const [params, setParams] = useState(() => {
    // اولویت با route.params
    const p = { ...(route?.params || {}) };
    return p;
  });

  // لیسنر دیپ‌لینک + گرفتن initialURL
  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      // اگر planId نداریم از استوریج بگیر
      if (!planId) {
        const pid = await AsyncStorage.getItem('planId');
        if (mounted && pid) setPlanId(pid);
      }

      // اگر داده از route نیومده، از deep link بگیر
      if (!params || Object.keys(params).length === 0) {
        const initial = await Linking.getInitialURL();
        if (mounted && initial) {
          setParams(parseQuery(initial));
        }
      }
    };

    const sub = Linking.addEventListener('url', ({ url }) => {
      if (!mounted) return;
      const q = parseQuery(url);
      setParams(prev => ({ ...prev, ...q }));
    });

    boot();

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  // تأیید پرداخت وقتی پارامترها آماده شدند
  useEffect(() => {
    const verify = async () => {
      try {
        if (!planId) return; // منتظر planId بمان
        // پارام‌های مرسوم درگاه‌ها: success/status, Authority, TrackId, token, …
        const Authority = params?.Authority || params?.authority || params?.au || null;
        const TrackId   = params?.TrackId   || params?.trackId   || params?.ti || null;
        const Status    = params?.status    || params?.Status    || null; // success/failed (در برخی درگاه‌ها)
        const token     = await AsyncStorage.getItem('token');

        // اگر هیچ پارامی نداریم، همچنان سعی می‌کنیم با planId سمت سرور verify کنیم
        const body = {
          PlanId: Number(planId),
          Authority,      // اگر null باشد سرور خودش نادیده بگیرد
          TrackId,        // همین‌طور
          Status,         // همین‌طور
        };

        setVerifying(true);
        const res = await fetch(`${API_URL}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        // انتظار حداقلی: Result = { IsSuccess, Amount, RefId, Message }
        const r = data?.Result || data;
        const ok = !!(r?.IsSuccess ?? r?.Success ?? (res.ok && !r?.Error));

        setStatus(ok ? 'success' : 'failed');
        setAmount(Number(r?.Amount ?? 0));
        setRefId(r?.RefId || r?.ReferenceId || r?.Authority || TrackId || Authority || null);
        setMessage(
          r?.Message ||
          (ok ? 'پرداخت با موفقیت انجام شد.' : (data?.Message || 'پرداخت ناموفق بود.'))
        );

        // اگر پرداخت موفق بود، می‌توانی هر دادهٔ لازم را ذخیره کنی:
        // await AsyncStorage.setItem('lastPaymentRef', String(r?.RefId || ''));
      } catch (e) {
        setStatus('failed');
        setMessage('خطا در تأیید پرداخت.');
      } finally {
        setVerifying(false);
      }
    };

    // وقتی planId و (پارام‌ها یا حداقل یکی از Authority/TrackId/Status) مشخص شدند، verify کن
    if (planId && (params || true)) {
      verify();
    }
  }, [planId, params]);

  const toman = (n) => `${Number(n || 0).toLocaleString('fa-IR')} تومان`;

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const retry = () => {
    if (planId) {
      navigation.replace('Payment', { planId });
    } else {
      navigation.navigate('Plans');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* هدر */}
      <View
        style={{
          paddingTop: 8,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.text }}>
          نتیجه پرداخت
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

      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            backgroundColor: colors.card,
            borderWidth: 1, borderColor: colors.border,
            borderRadius: 16, padding: 18,
          }}
        >
          {verifying ? (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="large" color={palette.primary} />
              <Text style={{ marginTop: 12, color: colors.sub, fontFamily: 'Vazir-Regular' }}>
                در حال بررسی وضعیت پرداخت…
              </Text>
            </View>
          ) : (
            <>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <Text style={{
                  fontSize: 52,
                  marginBottom: 8,
                  color: status === 'success' ? palette.ok : palette.danger,
                }}>
                  {status === 'success' ? '✅' : '❌'}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Vazir-Bold',
                    fontSize: 18,
                    color: colors.text,
                    textAlign: 'center',
                    marginBottom: 6,
                  }}
                >
                  {status === 'success' ? 'پرداخت موفق' : 'پرداخت ناموفق'}
                </Text>
                <Text
                  style={{ fontFamily: 'Vazir-Regular', color: colors.sub, textAlign: 'center' }}
                  numberOfLines={3}
                >
                  {message || (status === 'success'
                    ? 'سفارش شما با موفقیت ثبت شد.'
                    : 'در صورت کسر وجه، مبلغ ظرف ۷۲ ساعت کاری بازگشت می‌یابد.')}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

              <Row>
                <Text style={{ color: colors.sub, fontFamily: 'Vazir-Regular' }}>مبلغ</Text>
                <Text style={{ color: colors.text, fontFamily: 'Vazir-Medium' }}>
                  {toman(amount)}
                </Text>
              </Row>

              <Row>
                <Text style={{ color: colors.sub, fontFamily: 'Vazir-Regular' }}>کدرهگیری</Text>
                <Text style={{ color: colors.text, fontFamily: 'Vazir-Medium' }}>
                  {refId ? String(refId) : '-'}
                </Text>
              </Row>

              <Row>
                <Text style={{ color: colors.sub, fontFamily: 'Vazir-Regular' }}>شناسه برنامه</Text>
                <Text style={{ color: colors.text, fontFamily: 'Vazir-Medium' }}>
                  {planId ? String(planId) : '-'}
                </Text>
              </Row>

              <View style={{ height: 8 }} />

              {status === 'success' ? (
                <TouchableOpacity
                  onPress={goHome}
                  style={{
                    backgroundColor: palette.ok,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: '#fff', fontFamily: 'Vazir-Bold' }}>
                    رفتن به داشبورد
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
                  <TouchableOpacity
                    onPress={retry}
                    style={{
                      flex: 1,
                      backgroundColor: palette.primary,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontFamily: 'Vazir-Bold' }}>
                      تلاش مجدد پرداخت
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={goHome}
                    style={{
                      flex: 1,
                      backgroundColor: '#64748b',
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ color: '#fff', fontFamily: 'Vazir-Bold' }}>
                      بازگشت به خانه
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ children }) {
  return (
    <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 }}>
      {children}
    </View>
  );
}
