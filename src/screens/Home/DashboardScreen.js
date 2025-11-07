import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { apiFetch } from '../../api/client';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState('');
  const [profile, setProfile] = useState(null);
  const [activePlan, setActivePlan] = useState(null);

  const bg = dark ? '#0e1015' : '#ffffff';
  const card = dark ? '#1a1d2e' : '#ffffff';
  const text = dark ? '#ffffff' : '#0f172a';
  const sub = dark ? '#cbd5e1' : '#475569';
  const border = dark ? '#273043' : '#e5e7eb';
  const primary = '#2563eb';
  const accent = '#10b981';

  const load = async () => {
    try {
      setErr('');
      setLoading(true);
      // مسیرهای API را با واقعی‌های خودت جایگزین کن
      //const p = await apiFetch('/api/profile/me');                // {Result:{fullName:...}}
      const a = await apiFetch('/api/plan/active');       // {Result:{title,day,currentWorkoutCount,totalWorkouts}}
      //setProfile(p?.Result || {});
      setActivePlan(a?.Result || null);
    } catch (e) {
      setErr('خطا در دریافت اطلاعات داشبورد');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  return (
    <View style={{flex:1, backgroundColor:bg}}>
      {/* هدر ساده با دکمه‌ی تم بالا-راست */}
      <View style={{padding:16, paddingTop:24, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
        <Text style={{ fontFamily:'Vazir-Bold', fontSize:18, color:text }}>سلام {/*{profile?.fullName || 'کاربر'}*/} 👋</Text>
        <TouchableOpacity
          onPress={() => setDark(v=>!v)}
          style={{ padding:10, borderRadius:9999, backgroundColor: dark ? '#141827' : '#f1f5f9', borderWidth:1, borderColor:border }}
        >
          <Ionicons name={dark ? 'sunny' : 'moon'} size={18} color={dark ? '#fde047' : '#0f172a'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding:16 }}
      >
        {err ? (
          <Text style={{ fontFamily:'Vazir-Regular', color:'#ef4444', marginBottom:12 }}>{err}</Text>
        ) : null}

        {/* کارت برنامه فعال */}
        <View style={{ backgroundColor:card, borderRadius:16, borderWidth:1, borderColor:border, padding:16, marginBottom:12 }}>
          <Text style={{ fontFamily:'Vazir-Bold', fontSize:16, color:text, marginBottom:6 ,textAlign:'right'}}>
            برنامه فعال
          </Text>
          {activePlan ? (
            <>
              <Text style={{ fontFamily:'Vazir-Regular', color:sub, marginBottom:10 }}>
                   {activePlan.Title} — {activePlan.PlanType}
              </Text>
              {/* <View style={{ flexDirection:'row', gap:12, marginBottom:12 }}>
                <Badge icon="barbell" label={`${activePlan.currentWorkoutCount || 0}/${activePlan.totalWorkouts || 0} تمرین`} text={text} sub={sub} border={border} />
                <Badge icon="time" label="امروز آماده‌ای؟" text={text} sub={sub} border={border} />
              </View> */}
              <TouchableOpacity
                onPress={() => navigation.navigate('ActivePlan' /* اسکرین را بعداً اضافه می‌کنیم */)}
                style={{ backgroundColor:primary, padding:12, borderRadius:12 }}
              >
                <Text style={{ fontFamily:'Vazir-Medium', color:'#fff', textAlign:'center' }}>رفتن به برنامه </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontFamily:'Vazir-Regular', color:sub, marginBottom:12 }}>
                هنوز برنامه فعالی نداری.
              </Text>
              <TouchableOpacity
                onPress={() => {/* بعداً: PlanWizard */}}
                style={{ backgroundColor:accent, padding:12, borderRadius:12 }}
              >
                <Text style={{ fontFamily:'Vazir-Medium', color:'#0f172a', textAlign:'center' }}>ساخت برنامه جدید</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* کارت‌های سریع بعدی: برنامه‌ها، پروفایل، پشتیبانی */}
        <QuickGrid
          items={[
            { title:'برنامه‌ها', icon:'list', onPress:()=>{}, bg:card, border, text, sub },
            { title:'پروفایل',  icon:'person', onPress:()=>{}, bg:card, border, text, sub },
            { title:'پشتیبانی', icon:'chatbubble-ellipses', onPress:()=>{}, bg:card, border, text, sub },
          ]}
        />
      </ScrollView>
    </View>
  );
}

function Badge({ icon, label, text, sub, border }) {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', gap:6, paddingVertical:6, paddingHorizontal:10, borderWidth:1, borderColor:border, borderRadius:9999 }}>
      <Ionicons name={icon} size={14} color={sub} />
      <Text style={{ fontFamily:'Vazir-Regular', color:sub }}>{label}</Text>
    </View>
  );
}

function QuickGrid({ items }) {
  return (
    <View style={{ flexDirection:'row', gap:12 }}>
      {items.map((it, i) => (
        <TouchableOpacity key={i} onPress={it.onPress} style={{ flex:1, backgroundColor:it.bg, borderRadius:16, borderWidth:1, borderColor:it.border, padding:16 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <Text style={{ fontFamily:'Vazir-Bold', color:it.text }}>{it.title}</Text>
            <Ionicons name={it.icon} size={18} color={it.sub} />
          </View>
          <Text style={{ fontFamily:'Vazir-Regular', color:it.sub, marginTop:8, fontSize:12 }}>مشاهده</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
