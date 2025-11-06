import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bgDark = '#0e1015', cardDark = '#1a1d2e', borderDark = '#273043', primary = '#2563eb';

const Item = ({ q, a, dark }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb', borderRadius:12, marginBottom:10, backgroundColor: dark ? cardDark : '#fff' }}>
      <TouchableOpacity onPress={()=>setOpen(o=>!o)} style={{ padding:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontFamily:'Vazir-Medium', color: dark ? '#fff' : '#0f172a' }}>{q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={dark ? '#cbd5e1' : '#475569'} />
      </TouchableOpacity>
      {open ? (
        <View style={{ padding:12, paddingTop:0 }}>
          <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569', lineHeight:24 }}>{a}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default function FaqScreen() {
  const [dark, setDark] = useState(true);

  const faqs = [
    { q:'چطور برنامه می‌گیرم؟', a:'اطلاعات را وارد می‌کنید و کمتر از یک دقیقه برنامه تمرین و تغذیه می‌گیرید.' },
    { q:'آیا برای خانه هم برنامه دارید؟', a:'بله. با وزن بدن، دمبل یا کش می‌توانید انتخاب کنید.' },
    { q:'چطور پشتیبانی می‌گیرم؟', a:'از بخش پروفایل یا پشتیبانی می‌توانید پیام ارسال کنید.' },
  ];

  return (
    <View style={{ flex:1, backgroundColor: dark ? bgDark : '#fff' }}>
      <View style={{ padding:16, paddingTop:24, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color: dark ? '#fff' : '#0f172a' }}>سوالات متداول</Text>
        <TouchableOpacity onPress={()=>setDark(v=>!v)}
          style={{ padding:10, borderRadius:9999, backgroundColor: dark ? '#141827' : '#f1f5f9', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb' }}>
          <Ionicons name={dark ? 'sunny' : 'moon'} size={18} color={dark ? '#fde047' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding:16 }}>
        {faqs.map((f, i) => <Item key={i} q={f.q} a={f.a} dark={dark} />)}
        <View style={{ marginTop:12, padding:12, borderRadius:12, backgroundColor: primary + '22' }}>
          <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569' }}>
            سوالت را پیدا نکردی؟ از «ارتباط با ما» پیام بده.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
