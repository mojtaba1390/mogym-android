import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bgDark = '#0e1015';
const cardDark = '#1a1d2e';
const borderDark = '#273043';
const primary = '#7c3aed';
const blue = '#2563eb';

export default function PlansScreen({ navigation }) {
  const [dark, setDark] = useState(true);

  const plans = [
    { id: 'free3', title: '۳ روزه رایگان', desc: 'یک برنامه کامل تمرین و تغذیه برای ۳ روز', price: 'رایگان', cta: 'دریافت', color: blue, nav: 'PlanWizard', meta: { free:true } },
    { id: 'normal', title: 'پلن عادی', desc: 'برنامه تمرین + تغذیه + پشتیبانی پایه', price: '۱۹۹٬۰۰۰', cta: 'انتخاب', color: primary, nav: 'PlanWizard' },
    { id: 'premium', title: 'پلن پرمیوم', desc: 'همه امکانات + تحلیل ویدیو + اولویت پشتیبانی', price: '۳۴۹٬۰۰۰', cta: 'انتخاب', color: primary, nav: 'PlanWizard' },
  ];

  return (
    <View style={{ flex:1, backgroundColor: dark ? bgDark : '#fff' }}>
      {/* هدر ساده */}
      <View style={{ padding:16, paddingTop:24, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color: dark ? '#fff' : '#0f172a' }}>انتخاب پلن</Text>
        <TouchableOpacity
          onPress={()=>setDark(v=>!v)}
          style={{ padding:10, borderRadius:9999, backgroundColor: dark ? '#141827' : '#f1f5f9', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb' }}>
          <Ionicons name={dark ? 'sunny' : 'moon'} size={18} color={dark ? '#fde047' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
        {plans.map(p => (
          <View key={p.id}
            style={{ backgroundColor: dark ? cardDark : '#fff', borderRadius:16, borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb', padding:16 }}>
            <Text style={{ fontFamily:'Vazir-Bold', color: dark ? '#fff' : '#0f172a', marginBottom:6 }}>{p.title}</Text>
            <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569', marginBottom:12 }}>{p.desc}</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
              <Text style={{ fontFamily:'Vazir-Bold', color: dark ? '#fff' : '#0f172a' }}>{p.price} تومان</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(p.nav, p.meta || {})}
                style={{ backgroundColor:p.color, paddingVertical:10, paddingHorizontal:16, borderRadius:12 }}>
                <Text style={{ fontFamily:'Vazir-Medium', color:'#fff' }}>{p.cta}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
