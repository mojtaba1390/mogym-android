// src/screens/PaymentResultScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function PaymentResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    success = 'false',
    message = '',
    planId = null,
    amount = null,
  } = route.params || {};

  const isSuccess = success === true || success === 'true' || success === '1';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: isSuccess ? '#22c55e' : '#ef4444' }]}>
          {isSuccess ? 'پرداخت موفق بود ✅' : 'پرداخت ناموفق بود ❌'}
        </Text>

        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}

        {amount ? (
          <Text style={styles.infoText}>
            مبلغ پرداختی: {amount} تومان
          </Text>
        ) : null}

        {planId ? (
          <Text style={styles.infoText}>
            شناسه برنامه: {planId}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (isSuccess && planId) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'ActivePlan' }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Plans' }], // یا Landing
              });
            }
          }}
        >
          <Text style={styles.buttonText}>
            {isSuccess ? 'رفتن به برنامه' : 'بازگشت به برنامه‌ها'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1015',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#111827',
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  title: {
    fontFamily: 'Vazir-Bold',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Vazir-Regular',
    fontSize: 14,
    color: '#e5e7eb',
    marginBottom: 8,
    textAlign: 'right',
  },
  infoText: {
    fontFamily: 'Vazir-Regular',
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
    textAlign: 'right',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#6366f1',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Vazir-Medium',
    color: '#fff',
    fontSize: 15,
  },
});
