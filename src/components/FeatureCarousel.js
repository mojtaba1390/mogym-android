import React, { useRef, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 'ai',
    title: 'برنامه شخصی با هوش مصنوعی',
    desc: 'تمرین + تغذیه دقیق بر اساس سن، هدف، تجهیزات و سوابق.',
    icon: 'sparkles',
    color: '#6366f1',
  },
  {
    id: 'home-gym',
    title: 'خانه یا باشگاه، فرقی نداره',
    desc: 'از وزن بدن و دمبل تا باشگاه کامل؛ برنامه با شرایط تو تطبیق می‌یابد.',
    icon: 'barbell',
    color: '#10b981',
  },
  {
    id: 'analyze',
    title: 'تحلیل پیشرفت',
    desc: 'پیگیری وزنی، عکس، و تحلیل خودکار روند بهبود.',
    icon: 'analytics',
    color: '#f59e0b',
  },
  {
    id: 'video',
    title: 'ویدئو و راهنمای حرکت',
    desc: 'آموزش تصویری صحیح اجرا + نکات تکنیکی هر ست.',
    icon: 'videocam',
    color: '#ef4444',
  },
];

export default function FeatureCarousel({ dark = true }) {
  const [index, setIndex] = useState(0);
  const bg = dark ? '#0e1015' : '#ffffff';
  const card = dark ? '#1a1d2e' : '#ffffff';
  const text = dark ? '#ffffff' : '#0f172a';
  const sub = dark ? '#cbd5e1' : '#475569';
  const border = dark ? '#273043' : '#e5e7eb';

  return (
    <View style={{ paddingVertical: 12 }}>
      <Carousel
        width={width}
        height={125}
        data={slides}
        autoPlay
        autoPlayInterval={3000}
        scrollAnimationDuration={650}
        onSnapToItem={setIndex}
                style={{ alignSelf: 'center' }} // خود اسلایدر وسط
        renderItem={({ item }) => (
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: card,
              borderWidth: 1,
                            alignSelf: 'center',            // ← وسط‌چین
              borderColor: border,
              borderRadius: 16,
              padding: 15,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: item.color + '22',
                borderWidth: 1,
                borderColor: border,
              }}
            >
              <Ionicons name={item.icon} size={26} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Vazir-Bold', color: text, fontSize: 16, marginBottom: 6 }}>
                {item.title}
              </Text>
              <Text style={{ fontFamily: 'Vazir-Regular', color: sub, lineHeight: 22 }}>
                {item.desc}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 }}>
        {slides.map((_, i) => {
          const active = i === index;
          return (
            <View
              key={i}
              style={{
                width: active ? 22 : 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: active ? '#2563eb' : (dark ? '#334155' : '#e5e7eb'),
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
