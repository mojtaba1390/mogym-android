import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const bgDark = '#0e1015', cardDark = '#1a1d2e', borderDark = '#273043', primary = '#2563eb';

export default function ContactUsScreen() {
  const [dark, setDark] = useState(true);
  const [name, setName] = useState(''), [phone, setPhone] = useState(''), [msg, setMsg] = useState('');

  const submit = () => {
    if (!name || !phone || !msg) return Alert.alert('خطا', 'همه فیلدها را پر کنید');
    // اینجا می‌تونی به API بفرستی
    Alert.alert('ارسال شد', 'پیام شما ثبت شد. متشکریم!');
    setName(''); setPhone(''); setMsg('');
  };

  return (
    <View style={{ flex:1, backgroundColor: dark ? bgDark : '#fff' }}>
      <View style={{ padding:16, paddingTop:24, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color: dark ? '#fff' : '#0f172a' }}>ارتباط با ما</Text>
        <TouchableOpacity onPress={()=>setDark(v=>!v)}
          style={{ padding:10, borderRadius:9999, backgroundColor: dark ? '#141827' : '#f1f5f9', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb' }}>
          <Ionicons name={dark ? 'sunny' : 'moon'} size={18} color={dark ? '#fde047' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding:16 }}>
        <View style={{ backgroundColor: dark ? cardDark : '#fff', borderRadius:16, borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb', padding:16, gap:10 }}>
          <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569' }}>
            از طریق فرم زیر یا شبکه‌های اجتماعی پیام بفرستید.
          </Text>

          <TextInput
            value={name} onChangeText={setName} placeholder="نام"
            placeholderTextColor={dark ? '#64748b' : '#94a3b8'}
            style={{ fontFamily:'Vazir-Regular', color: dark ? '#fff' : '#0f172a', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb', borderRadius:12, padding:12 }}
          />
          <TextInput
            value={phone} onChangeText={setPhone} placeholder="شماره تماس"
            keyboardType="phone-pad"
            placeholderTextColor={dark ? '#64748b' : '#94a3b8'}
            style={{ fontFamily:'Vazir-Regular', color: dark ? '#fff' : '#0f172a', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb', borderRadius:12, padding:12 }}
          />
          <TextInput
            value={msg} onChangeText={setMsg} placeholder="پیام شما"
            placeholderTextColor={dark ? '#64748b' : '#94a3b8'}
            multiline numberOfLines={5}
            style={{ fontFamily:'Vazir-Regular', color: dark ? '#fff' : '#0f172a', borderWidth:1, borderColor: dark ? borderDark : '#e5e7eb', borderRadius:12, padding:12, textAlignVertical:'top' }}
          />

          <TouchableOpacity onPress={submit} style={{ backgroundColor: primary, padding:12, borderRadius:12 }}>
            <Text style={{ fontFamily:'Vazir-Medium', color:'#fff', textAlign:'center' }}>ارسال پیام</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop:16, gap:8 }}>
          <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com/mogym.ir')} style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Ionicons name="logo-instagram" size={18} color={dark ? '#cbd5e1' : '#475569'} />
            <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569' }}>@mogym.ir</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@mogym.ir')} style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Ionicons name="mail" size={18} color={dark ? '#cbd5e1' : '#475569'} />
            <Text style={{ fontFamily:'Vazir-Regular', color: dark ? '#cbd5e1' : '#475569' }}>support@mogym.ir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
