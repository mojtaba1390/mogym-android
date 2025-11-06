import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from '../screens/Auth/LoginScreen';
import DashboardScreen from '../screens/Home/DashboardScreen';
import { getToken } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import PlansScreen from './src/screens/Plans/PlansScreen';
import TermsScreen from './src/screens/Static/TermsScreen';
import FaqScreen from './src/screens/Static/FaqScreen';
import ContactUsScreen from './src/screens/Static/ContactUsScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'داشبورد',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const [checking, setChecking] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      setIsLogged(!!t);
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor:'#0e1015'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isLogged ? 'Main' : 'Login'}  // فقط برای شروع
      >
        {/* 👇 هر دو اسکرین همیشه رجیستر هستند */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
<Stack.Screen name="Plans" component={PlansScreen} />
<Stack.Screen name="Terms" component={TermsScreen} />
<Stack.Screen name="Faq" component={FaqScreen} />
<Stack.Screen name="ContactUs" component={ContactUsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
