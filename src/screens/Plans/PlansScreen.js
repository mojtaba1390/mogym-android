import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const palette = {
  bgDark: '#0e1015',
  cardDark: '#1a1d2e',
  borderDark: '#273043',
  textDark: '#ffffff',
  subDark: '#cbd5e1',
  textLight: '#0f172a',
  subLight: '#475569',
  primary: '#2563eb',
  purple: '#7c3aed',
};

const PRICES = {
  normal: { // planType = 1
    workout: 250000,
    diet: 250000,
    full: 400000,
  },
  premium: { // planType = 2
    full: 800000,
  }
};

export default function PlansScreen({ navigation }) {
  const [dark, setDark] = useState(true);
  const colors = {
    bg: dark ? palette.bgDark : '#fff',
    card: dark ? palette.cardDark : '#fff',
    border: dark ? palette.borderDark : '#e5e7eb',
    text: dark ? palette.textDark : palette.textLight,
    sub: dark ? palette.subDark : palette.subLight,
  };

  const rialToTomansFa = (n) => n.toLocaleString('fa-IR') + ' تومان';

  const handleSelectPlan = async (requestedPlan, planType, price) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const redirectState = { to: 'PlanWizard', state: { requestedPlan, planType, price } };

      // ذخیره برای بازگشت پس از لاگین
      await AsyncStorage.setItem('redirectAfterLogin', JSON.stringify(redirectState));

      if (!token) {
        navigation.navigate('Login');
        return;
      }
      navigation.navigate('PlanWizard', { requestedPlan, planType, price });
    } catch {
      navigation.navigate('Login');
    }
  };

  const Card = ({ children, outlined=false }) => (
    <View style={{
      backgroundColor: colors.bg,
      borderWidth: outlined ? 2 : 1,
      borderColor: outlined ? '#7c3aed' : colors.border,
      borderRadius: 16,
      padding: 16,
    }}>
      {children}
    </View>
  );

  const Box = ({ children }) => (
    <View style={{
      backgroundColor: dark ? '#2a2f3b' : '#fff',
      borderWidth: 1, borderColor: dark ? '#475569' : '#e5e7eb',
      borderRadius: 14, padding: 14, marginBottom: 12,
    }}>
      {children}
    </View>
  );

  const Btn = ({ title, color='#2563eb', onPress, size='md' }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignSelf:'center',
        backgroundColor: color,
        paddingVertical: size==='lg'? 12 : 10,
        paddingHorizontal: size==='lg'? 20 : 16,
        borderRadius: 12,
      }}>
      <Text style={{ color:'#fff', fontFamily:'Vazir-Medium' }}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1, backgroundColor: colors.bg }}>
      {/* هدر */}
      <View style={{
        paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8,
        flexDirection:'row-reverse', justifyContent:'space-between', alignItems:'center'
      }}>
        <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color: colors.text, textAlign:'right' }}>
          انتخاب پلن مورد نظر
        </Text>
        <TouchableOpacity
          onPress={()=>setDark(v=>!v)}
          style={{
            padding:10, borderRadius:9999,
            backgroundColor: dark ? '#141827' : '#f1f5f9',
            borderWidth:1, borderColor: colors.border
          }}>
          <Text style={{ color: colors.sub }}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:24 }}>

        {/* گرید: دو ستون در تبلت/وب — در موبایل زیر هم */}
        <View style={{ gap:16 }}>
          {/* پلن عادی */}
          <Card>
            <Text style={{ fontFamily:'Vazir-Bold', color: colors.text, textAlign:'center', marginBottom:12, fontSize:16 }}>
              پلن عادی
            </Text>
            <View style={{ marginBottom:12 }}>
              {[
                { label:'gpt-o4', ok:true },
                { label:'قیمت اقتصادی', ok:true },
                { label:'مدت آماده‌سازی: حداکثر ۳ ساعت', ok:true },
                { label:'محدودیت ساعتی ایجاد برنامه', ok:true },
              ].map((x,i)=>(
                <Text key={i} style={{ fontFamily:'Vazir-Regular', color: colors.sub, textAlign:'right' }}>
                  ✔ {x.label}
                </Text>
              ))}
            </View>

            <Box>
              <Text style={{ fontFamily:'Vazir-Medium', color: colors.text, textAlign:'right', marginBottom:6 }}>
                برنامه تمرینی: <Text style={{ color:'#2563eb' }}>{rialToTomansFa(PRICES.normal.workout)}</Text>
              </Text>
              <Btn
                title="انتخاب"
                onPress={() => handleSelectPlan(1, 1, PRICES.normal.workout)}
              />
            </Box>

            <Box>
              <Text style={{ fontFamily:'Vazir-Medium', color: colors.text, textAlign:'right', marginBottom:6 }}>
                برنامه تغذیه و مکمل: <Text style={{ color:'#2563eb' }}>{rialToTomansFa(PRICES.normal.diet)}</Text>
              </Text>
              <Btn
                title="انتخاب"
                onPress={() => handleSelectPlan(2, 1, PRICES.normal.diet)}
              />
            </Box>

            <Box>
              <Text style={{ fontFamily:'Vazir-Medium', color: colors.text, textAlign:'right', marginBottom:6 }}>
                برنامه تمرینی و تغذیه و مکمل: <Text style={{ color:'#2563eb' }}>{rialToTomansFa(PRICES.normal.full)}</Text>
              </Text>
              <Btn
                title="انتخاب"
                onPress={() => handleSelectPlan(3, 1, PRICES.normal.full)}
              />
            </Box>
          </Card>

          {/* پلن پرمیوم */}
          <Card outlined>
            <Text style={{ fontFamily:'Vazir-Bold', color:'#7c3aed', textAlign:'center', marginBottom:12, fontSize:16 }}>
              پلن پرمیوم
            </Text>
            <View style={{ marginBottom:12 }}>
              {[
                { label:'gpt-o4', ok:true },
                { label:'تمرین + رژیم + مکمل', ok:true },
                { label:'بیمه ورزشی', ok:true },
                { label:'بازبینی توسط مربی', ok:true },
                { label:'اصلاح برنامه در صورت نیاز', ok:true },
                { label:'مدت آماده‌سازی: حداکثر ۱ ساعت', ok:true },
                { label:'بدون محدودیت ساعت ایجاد برنامه', ok:true },
              ].map((x,i)=>(
                <Text key={i} style={{ fontFamily:'Vazir-Regular', color: colors.sub, textAlign:'right' }}>
                  ✔ {x.label}
                </Text>
              ))}
            </View>

            <Box>
              <Text style={{ fontFamily:'Vazir-Medium', color: colors.text, textAlign:'right', marginBottom:6 }}>
                برنامه کامل پرمیوم: <Text style={{ color:'#7c3aed' }}>{rialToTomansFa(PRICES.premium.full)}</Text>
              </Text>
              <Btn
                title="انتخاب"
                color={palette.purple}
                onPress={() => handleSelectPlan(3, 2, PRICES.premium.full)}
                size="lg"
              />
            </Box>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
