import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import LandingScreen from './src/screens/Home/LandingScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import DashboardScreen from './src/screens/Home/DashboardScreen';
import PlansScreen from './src/screens/Plans/PlansScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import ContactUsScreen from './src/screens/Static/ContactUsScreen';
import TermsScreen from './src/screens/Static/TermsScreen';
import FaqScreen from './src/screens/Static/FaqScreen';
// ... سایر اسکرین‌ها: Terms, Faq, ContactUs, ActivePlan, Payment ...

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown:false }}>
      <Tabs.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title:'خانه', tabBarIcon:({color,size}) => <Ionicons name="home" color={color} size={size}/> }}
      />
      <Tabs.Screen
        name="Plans"
        component={PlansScreen}
        options={{ title:'برنامه‌ها', tabBarIcon:({color,size}) => <Ionicons name="list" color={color} size={size}/> }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title:'پروفایل', tabBarIcon:({color,size}) => <Ionicons name="person" color={color} size={size}/> }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Vazir-Regular': require('./src/assets/fonts/Vazir.ttf'),
    'Vazir-Medium':  require('./src/assets/fonts/Vazir-Medium.ttf'),
    'Vazir-Bold':    require('./src/assets/fonts/Vazir-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#0e1015'}}><ActivityIndicator color="#fff" /></View>;
  }

  return (
<NavigationContainer>
  <Stack.Navigator screenOptions={{ headerShown:false }} initialRouteName="Landing">
    <Stack.Screen name="Landing" component={LandingScreen} />
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
