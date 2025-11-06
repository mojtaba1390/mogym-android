import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bgDark = '#0e1015', cardDark = '#1a1d2e', borderDark = '#273043';

export default function TermsScreen() {
  const [dark, setDark] = useState(true);

  const Section = ({ title, children }) => (
    <View style={{ marginBottom:16 }}>
      <Text style={{ fontFamily:'Vazir-Bold', color: dark ? '#fff' : '#0f172a', marginBottom:6 }}>{title}</Text>
      <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569', lineHeight:24 }}>{children}</Text>
    </View>
  );

  return (
    <View style={{ flex:1, backgroundColor: dark ? bgDark : '#fff' }}>
      <View style={{ padding:16, paddingTop:24, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color: dark ? '#fff' : '#0f172a' }}>شرایط و مقررات</Text>
        <TouchableOpacity onPress={()=>setDark(v=>!v)}
          style={{ padding:10, borderRadius:9999, backgroundColor: dark ? '#141827' : '#f1f5f9', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb' }}>
          <Ionicons name={dark ? 'sunny' : 'moon'} size={18} color={dark ? '#fde047' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding:16 }}>
        <View style={{ backgroundColor: dark ? cardDark : '#fff', borderRadius:16, borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb', padding:16 }}>
          <Section title="تعاریف">
            کاربر به شخصی گفته می‌شود که از خدمات موجیم استفاده می‌کند. این سند شرایط استفاده از سرویس را توضیح می‌دهد.
          </Section>
          <Section title="حریم خصوصی">
            اطلاعات شما نزد موجیم محرمانه بوده و مطابق سیاست‌های حریم خصوصی نگهداری می‌شود.
          </Section>
          <Section title="مسئولیت‌ها">
            کاربر مسئول صحت اطلاعات واردشده است و موجیم تعهدی نسبت به نتایج استفادهٔ نادرست از برنامه‌ها ندارد.
          </Section>
          <Section title="پرداخت و بازگشت وجه">
            شرایط پرداخت آنلاین و قوانین بازگشت وجه طبق قوانین تجارت الکترونیک اعمال می‌شود.
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}
