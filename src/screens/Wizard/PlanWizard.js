// src/screens/Wizard/PlanWizard.js
import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

//const API_URL = 'https://api.mogym.ir'; // در صورت نیاز بعداً از env/app.json بخوان
const API_URL = 'http://185.252.86.164:8083'; // در صورت نیاز بعداً از env/app.json بخوان

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
};

export default function PlanWizard({ route, navigation }) {
  const insets = useSafeAreaInsets();

  // تم
  const [dark, setDark] = useState(true);

  // مرحله
  const [step, setStep] = useState(1);

const rRequested = route?.params?.requestedPlan ?? 3;
const rPlanType  = route?.params?.planType ?? 1;
const rPrice     = route?.params?.price ?? 0;
const rFree      = !!route?.params?.free || rPlanType === 0 || rPrice === 0;

  // داده‌های فرم
const [form, setForm] = useState({
    requestedPlan: rRequested,      // 1/2/3
  planType: rPlanType,            // 0=رایگان 1=عادی 2=پرمیوم
  price: rPrice,                  // نمایش/ارسال
  isFreeTrial: rFree,             // پرچم رایگان
  gender: '0',
  age: '',
  height: '',
  weight: '',
  goal: '',
  fitnessExperience: '',
  // --- استپ ۴ جدید ---
  activityLevel: '',       // 0: کم | 1: متوسط | 2: زیاد
  allergies: '',           // 0: هیچ | 1: گلوتن | 2: لبنیات | 3: آجیل | 4: تخم‌مرغ
  medicalConditions: '',   // 0: هیچ | 1: دیابت | 2: فشار خون | 3: بیماری قلبی | 4: مشکلات مفصلی
  // -------------------
  equipment: '3',
  frequency: 3,
});


  const requestedPlanText = {
  1: 'فقط تمرین',
  2: 'فقط تغذیه',
  3: 'برنامه کامل (تمرین + تغذیه + مکمل)',
};


  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const colors = useMemo(() => ({
    bg: dark ? palette.bgDark : '#fff',
    card: dark ? palette.cardDark : '#fff',
    border: dark ? palette.borderDark : '#e5e7eb',
    text: dark ? palette.textDark : palette.textLight,
    sub: dark ? palette.subDark : palette.subLight,
  }), [dark]);

  const canNext = useMemo(() => {
    switch (step) {
    case 1: return !!form.requestedPlan;
     case 2: return form.age && form.height && form.weight && form.gender;
case 3: return form.goal !== '';

case 4: return form.activityLevel !== '' && form.allergies !== '' && form.medicalConditions !== '';
      case 5: return !!form.equipment ;
      case 6: return true;
      default: return false;
    }
  }, [step, form]);

  const next = () => setStep(s => Math.min(s + 1, 6));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const submit = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('نیاز به ورود', 'ابتدا وارد حساب شوید.');
        return navigation.navigate('Login');
      }

const payload = {
  RequestedPlan: Number(form.requestedPlan),
    PlanType: Number(form.planType),
    Price:Number(form.price) || 0,
      Age: parseInt((form.age || '').replace(/\D/g,''), 10) || 0,
        Height: parseInt((form.height || '').replace(/\D/g,''), 10) || 0,
  Weight: parseInt((form.weight || '').replace(/\D/g,''), 10) || 0,
  Gender: parseInt(form.gender || 0),
    Goal: parseInt(form.goal, 10),
      FitnessExperience: parseInt(form.fitnessExperience), 
        TrainingDaysPerWeek: Number(form.frequency),

  ActivityLevel: form.activityLevel === '' ? null : form.activityLevel,
  Allergies: form.allergies === '' ? null : form.allergies,
  MedicalConditions: form.medicalConditions === '' ? null : form.medicalConditions,
  EquipmentAccess: parseInt(form.equipment),
};


      const res = await fetch(`${API_URL}/api/plan/create-android`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
if(res.status===200){
if (form.isFreeTrial || Number(form.planType) === 0 || Number(form.price) === 0) {
  // رایگان → برو داشبورد
      Alert.alert('موفق', 'درخواست برنامه ثبت شد.');
      navigation.navigate('Dashboard');    
} else {
  const planId = data?.PlanId;
const finalPrice = data?.Price ?? 0;
const planTitle = data?.Title ?? 'برنامه جدید';
  navigation.navigate('Payment', { planId,finalPrice,planTitle });
}   
}
else
            Alert.alert('نا موفق',data?.Message);
    } catch (e) {
      Alert.alert('خطا', e?.message || 'مشکلی پیش آمد');
    }
  };

  /* ———— UI helpers ———— */
  const Box = ({ children, style }) => (
    <View style={[{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 16, padding: 16,
    }, style]}>
      {children}
    </View>
  );

  const Label = ({ children }) => (
    <Text
      style={{
        fontFamily: 'Vazir-Medium',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'right',
        writingDirection: 'rtl',
      }}
    >
      {children}
    </Text>
  );

  const Input = (props) => (
    <TextInput
      {...props}
      placeholderTextColor={colors.sub}
      style={[{
        fontFamily: 'Vazir-Regular',
        color: colors.text,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 12, padding: 12, marginBottom: 12,
        textAlign: 'right',
        writingDirection: 'rtl',
      }, props.style]}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* هدر راست‌چین + کلید تم در SafeArea */}
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
        <Text style={{ fontFamily: 'Vazir-Bold', fontSize: 18, color: colors.text, textAlign: 'right' }}>
          ساخت برنامه
        </Text>

        <TouchableOpacity
          onPress={() => setDark(v => !v)}
          style={{
            padding: 10,
            borderRadius: 9999,
            backgroundColor: dark ? '#141827' : '#f1f5f9',
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: insets.right, // نره پشت ناچ/لبه
          }}
        >
          <Text style={{ fontFamily: 'Vazir-Medium', color: colors.sub }}>
            {dark ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* نوار قدم‌ها */}
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'center', paddingBottom: 8 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <View
            key={i}
            style={{
              width: i === step ? 28 : 10,
              height: 8,
              borderRadius: 999,
              backgroundColor: i === step ? palette.primary : (dark ? '#334155' : '#e5e7eb'),
              marginHorizontal: 3,
            }}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 140,       // برای جا دادن کنترل‌های پایین
          writingDirection: 'rtl',  // راست‌چین سراسری
        }}
      >
{/* Step 1 - نوع برنامه */}
{step === 1 && (
  <Box>
    <Text
      style={{
        fontFamily: 'Vazir-Bold',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'right',
      }}
    >
      انتخاب نوع برنامه درخواستی
    </Text>

    <Row wrap>
      {Object.entries(requestedPlanText).map(([key, label]) => (
        <Chip
          key={key}
          active={form.requestedPlan === Number(key)}
          onPress={() => setF('requestedPlan', Number(key))}
          title={label}
          colors={colors}
        />
      ))}
    </Row>
  </Box>
)}
        {/* Step 2 - اطلاعات فردی */}
        {step === 2 && (
          <Box>
            <Text style={{ fontFamily: 'Vazir-Bold', color: colors.text, marginBottom: 12, textAlign: 'right' }}>
              اطلاعات فردی
            </Text>

            <Label>جنسیت</Label>
            <Row>
              <Chip active={form.gender === '0'} onPress={() => setF('gender', '0')} title="مرد" colors={colors} />
              <Chip active={form.gender === '1'} onPress={() => setF('gender', '1')} title="زن" colors={colors} />
            </Row>

<Label>سن</Label>
<Input
  keyboardType="numeric"
  value={form.age}
  onChangeText={v => setF('age', v)}
  placeholder="سال"
/>

<Label>قد (cm)</Label>
<Input
  keyboardType="numeric"
  value={form.height}
  onChangeText={v => setF('height', v)}
  placeholder="قد"
/>

<Label>وزن (kg)</Label>
<Input
  keyboardType="numeric"
  value={form.weight}
  onChangeText={v => setF('weight', v)}
  placeholder="وزن"
/>

          </Box>
        )}

        {/* Step 3 - هدف */}
        {step === 3 && (
          <Box>
            <Text style={{ fontFamily: 'Vazir-Bold', color: colors.text, marginBottom: 12, textAlign: 'right' }}>
              هدف
            </Text>
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        backgroundColor: colors.card,
      }}
    >
      <Picker
        selectedValue={form.goal === '' ? '' : String(form.goal)}
        onValueChange={(v) => setF('goal', v)}
        mode="dropdown"
        dropdownIconColor={colors.sub}
        style={{ color: colors.text, writingDirection: 'rtl', textAlign: 'right' }}
      >
        <Picker.Item label="انتخاب کنید..." value="" />
        <Picker.Item label="کاهش وزن" value="0" />
        <Picker.Item label="عضله‌سازی" value="1" />
        <Picker.Item label="تناسب اندام عمومی" value="2" />
        <Picker.Item label="افزایش قدرت" value="3" />
        <Picker.Item label="افزایش استقامت" value="4" />
        <Picker.Item label="بازتوانی" value="5" />
      </Picker>
    </View>

        {/* سابقه تمرینی */}
    <Label>سابقه تمرینی</Label>
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        marginBottom: 4,
        overflow: 'hidden',
        backgroundColor: colors.card,
      }}
    >
      <Picker
        selectedValue={form.fitnessExperience === '' ? '' : String(form.fitnessExperience)}
        onValueChange={(v) => setF('fitnessExperience', v === '' ? '' : Number(v))}
        mode="dropdown"
        dropdownIconColor={colors.sub}
        style={{ color: colors.text, writingDirection: 'rtl', textAlign: 'right' }}
      >
        <Picker.Item label="انتخاب کنید..." value="" />
        <Picker.Item label="بدون سابقه" value="0" />
        <Picker.Item label="مبتدی" value="1" />
        <Picker.Item label="متوسط" value="2" />
        <Picker.Item label="پیشرفته" value="3" />
      </Picker>
    </View>
            
           <Label>روزهای تمرین در هفته</Label>
            <Row wrap>
              {[1,2,3, 4].map(n => (
                <Chip
                  key={n}
                  active={form.frequency === n}
                  onPress={() => setF('frequency', n)}
                  title={`${n} روز`}
                  colors={colors}
                />
              ))}
            </Row>
          </Box>
        )}

{step === 4 && (
  <Box>
    <Text
      style={{ fontFamily:'Vazir-Bold', color: colors.text, marginBottom:12, textAlign:'right' }}
    >
      اطلاعات تغذیه و سلامتی
    </Text>

    {/* سطح فعالیت روزانه */}
    <Label>سطح فعالیت روزانه</Label>
    <View style={{
      borderWidth:1, borderColor: colors.border, borderRadius:12, marginBottom:12,
      overflow:'hidden', backgroundColor: colors.card
    }}>
      <Picker
        selectedValue={form.activityLevel === '' ? '' : String(form.activityLevel)}
        onValueChange={(v) => setF('activityLevel', v === '' ? '' : Number(v))}
        mode="dropdown"
        dropdownIconColor={colors.sub}
        style={{ color: colors.text, writingDirection:'rtl' }}
      >
        <Picker.Item label="انتخاب کنید..." value="" />
        <Picker.Item label="کم" value="0" />
        <Picker.Item label="متوسط" value="1" />
        <Picker.Item label="زیاد" value="2" />
      </Picker>
    </View>

    {/* آلرژی غذایی */}
    <Label>آلرژی غذایی</Label>
    <View style={{
      borderWidth:1, borderColor: colors.border, borderRadius:12, marginBottom:12,
      overflow:'hidden', backgroundColor: colors.card
    }}>
      <Picker
        selectedValue={form.allergies === '' ? '' : String(form.allergies)}
        onValueChange={(v) => setF('allergies', v === '' ? '' : Number(v))}
        mode="dropdown"
        dropdownIconColor={colors.sub}
        style={{ color: colors.text, writingDirection:'rtl' }}
      >
        <Picker.Item label="انتخاب کنید..." value="" />
        <Picker.Item label="هیچ‌کدام" value="0" />
        <Picker.Item label="گلوتن" value="1" />
        <Picker.Item label="لبنیات" value="2" />
        <Picker.Item label="آجیل" value="3" />
        <Picker.Item label="تخم‌مرغ" value="4" />
      </Picker>
    </View>

    {/* شرایط پزشکی */}
    <Label>شرایط پزشکی</Label>
    <View style={{
      borderWidth:1, borderColor: colors.border, borderRadius:12, marginBottom:4,
      overflow:'hidden', backgroundColor: colors.card
    }}>
      <Picker
        selectedValue={form.medicalConditions === '' ? '' : String(form.medicalConditions)}
        onValueChange={(v) => setF('medicalConditions', v === '' ? '' : Number(v))}
        mode="dropdown"
        dropdownIconColor={colors.sub}
        style={{ color: colors.text, writingDirection:'rtl' }}
      >
        <Picker.Item label="انتخاب کنید..." value="" />
        <Picker.Item label="هیچ‌کدام" value="0" />
        <Picker.Item label="دیابت" value="1" />
        <Picker.Item label="فشار خون" value="2" />
        <Picker.Item label="بیماری قلبی" value="3" />
        <Picker.Item label="مشکلات مفصلی" value="4" />
      </Picker>
    </View>
  </Box>
)}


        {/* Step 5 - تجهیزات/تعداد روز */}
        {step === 5 && (
          <Box>
            <Text style={{ fontFamily: 'Vazir-Bold', color: colors.text, marginBottom: 12, textAlign: 'right' }}>
تجهیزات در دسترس            </Text>

            <Row wrap>
              {[
                { k: '0', t: 'فقط وزن بدن' },
                { k: '1', t: 'وزن بدن + دمبل' },
                { k: '2', t: 'وزن بدن + کش' },
                { k: '3', t: 'باشگاه کامل' },
              ].map(e => (
                <Chip
                  key={e.k}
                  active={form.equipment === e.k}
                  onPress={() => setF('equipment', e.k)}
                  title={e.t}
                  colors={colors}
                />
              ))}
            </Row>
          </Box>
        )}

{/* Step 6 - خلاصه */}
{step === 6 && (
  <Box>
    <Text
      style={{
        fontFamily: 'Vazir-Bold',
        color: colors.text,
        marginBottom: 12,
        textAlign: 'right',
      }}
    >
      خلاصه درخواست
    </Text>

    {/* نوع برنامه درخواستی */}
    <SummaryItem
      label="نوع برنامه"
      value={
        form.requestedPlan === 1
          ? 'فقط تمرین'
          : form.requestedPlan === 2
          ? 'فقط تغذیه'
          : 'برنامه کامل (تمرین + تغذیه + مکمل)'
      }
      colors={colors}
    />

    {/* جنسیت */}
    <SummaryItem
      label="جنسیت"
      value={form.gender === '0' ? 'مرد' : 'زن'}
      colors={colors}
    />

    {/* سن، قد، وزن */}
    <SummaryItem label="سن" value={form.age || '-'} colors={colors} />
    <SummaryItem label="قد (سانتی‌متر)" value={form.height || '-'} colors={colors} />
    <SummaryItem label="وزن (کیلوگرم)" value={form.weight || '-'} colors={colors} />

    {/* هدف */}
    <SummaryItem
      label="هدف برنامه"
      value={
        form.goal === '0'
          ? 'کاهش وزن'
          : form.goal === '1'
          ? 'عضله‌سازی'
          : form.goal === '2'
          ? 'تناسب اندام عمومی'
          : form.goal === '3'
          ? 'افزایش قدرت'
          : form.goal === '4'
          ? 'افزایش استقامت'
          : form.goal === '5'
          ? 'بازتوانی'
          : '-'
      }
      colors={colors}
    />
<SummaryItem
  label="سابقه تمرینی"
  value={
    form.fitnessExperience === 0
      ? 'بدون سابقه'
      : form.fitnessExperience === 1
      ? 'مبتدی'
      : form.fitnessExperience === 2
      ? 'متوسط'
      : form.fitnessExperience === 3
      ? 'پیشرفته'
      : '-'
  }
  colors={colors}
/>


    {/* سطح فعالیت روزانه */}
    <SummaryItem
      label="سطح فعالیت روزانه"
      value={
        form.activityLevel === 0
          ? 'کم'
          : form.activityLevel === 1
          ? 'متوسط'
          : form.activityLevel === 2
          ? 'زیاد'
          : '-'
      }
      colors={colors}
    />

    {/* آلرژی غذایی */}
    <SummaryItem
      label="آلرژی غذایی"
      value={
        form.allergies === 0
          ? 'هیچ‌کدام'
          : form.allergies === 1
          ? 'گلوتن'
          : form.allergies === 2
          ? 'لبنیات'
          : form.allergies === 3
          ? 'آجیل'
          : form.allergies === 4
          ? 'تخم‌مرغ'
          : '-'
      }
      colors={colors}
    />

    {/* شرایط پزشکی */}
    <SummaryItem
      label="شرایط پزشکی"
      value={
        form.medicalConditions === 0
          ? 'هیچ‌کدام'
          : form.medicalConditions === 1
          ? 'دیابت'
          : form.medicalConditions === 2
          ? 'فشار خون'
          : form.medicalConditions === 3
          ? 'بیماری قلبی'
          : form.medicalConditions === 4
          ? 'مشکلات مفصلی'
          : '-'
      }
      colors={colors}
    />

    {/* تجهیزات و تعداد روزها */}
    <SummaryItem
      label="تجهیزات"
      value={mapEquipment(form.equipment)}
      colors={colors}
    />
    <SummaryItem
      label="روزهای تمرین در هفته"
      value={`${form.frequency} روز`}
      colors={colors}
    />

    {/* برنامه آزمایشی */}
    {form.isFreeTrial ? (
      <View style={{ marginTop: 8 }}>
        <Text
          style={{
            fontFamily: 'Vazir-Medium',
            color: palette.ok,
            textAlign: 'right',
          }}
        >
          این درخواست به‌صورت آزمایشی ۳ روزه ثبت می‌شود.
        </Text>
      </View>
    ) : null}
  </Box>
)}

      </ScrollView>

      {/* کنترلر پایین — بالاتر از دکمه‌های ناوبری موبایل */}
      <View
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 12) + 12,
          flexDirection: 'row-reverse',
          gap: 8,
        }}
      >
        {step < 6 ? (
          <>
            <Btn title="بعدی" onPress={next} colors={colors} disabled={!canNext} />
            <Btn title="قبلی" onPress={back} colors={colors} kind="ghost" />
          </>
        ) : (
          <>
            <Btn title="ثبت درخواست برنامه" onPress={submit} colors={colors} />
            <Btn title="قبلی" onPress={back} colors={colors} kind="ghost" />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ———— اجزای کوچک ———— */

function Row({ children, wrap = false }) {
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: wrap ? 'wrap' : 'nowrap' }}>
      {children}
    </View>
  );
}

function Option({ active, onPress, title, sub, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: active ? '#2563eb' : colors.border,
        borderRadius: 12,
        padding: 12,
        marginLeft: 8, // چون row-reverse هستیم
      }}
    >
      <Text style={{ fontFamily: 'Vazir-Bold', color: colors.text, marginBottom: 4, textAlign: 'right' }}>{title}</Text>
      <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub, textAlign: 'right' }}>{sub}</Text>
    </TouchableOpacity>
  );
}

function Chip({ active, onPress, title, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? '#2563eb' : colors.border,
        backgroundColor: active ? '#2563eb22' : 'transparent',
        marginLeft: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontFamily: 'Vazir-Medium', color: active ? '#2563eb' : colors.sub, textAlign: 'center' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function SummaryItem({ label, value, colors }) {
  return (
    <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontFamily: 'Vazir-Regular', color: colors.sub, textAlign: 'right' }}>{label}</Text>
      <Text style={{ fontFamily: 'Vazir-Medium', color: colors.text, textAlign: 'right' }}>{value || '-'}</Text>
    </View>
  );
}

function Btn({ title, onPress, colors, disabled = false, kind = 'primary' }) {
  const bg = kind === 'ghost' ? 'transparent' : palette.primary;
  const bd = kind === 'ghost' ? colors.border : palette.primary;
  const tx = kind === 'ghost' ? colors.text : '#fff';
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: disabled ? '#94a3b8' : bg,
        borderWidth: 1,
        borderColor: bd,
      }}
    >
      <Text style={{ fontFamily: 'Vazir-Medium', color: disabled ? '#e5e7eb' : tx }}>{title}</Text>
    </TouchableOpacity>
  );
}

function mapEquipment(k) {
  switch (k) {
    case '0': return 'فقط وزن بدن';
    case '1': return 'وزن بدن + دمبل';
    case '2': return 'وزن بدن + کش';
    case '3': return 'باشگاه کامل';
    default: return k;
  }
}
