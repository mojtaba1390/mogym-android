// App.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

// --- Screens (مسیرها را با پروژه‌ی خودت هماهنگ کن) ---
import LandingScreen from './src/screens/Home/LandingScreen';
import PlansScreen from './src/screens/Plans/PlansScreen';
import DashboardScreen from './src/screens/Home/DashboardScreen';        // اگر صفحهٔ داشبورد جدا داری
import ProfileScreen from './src/screens/Profile/ProfileScreen';          // اگر فعلاً نداری، می‌تونی موقتاً DashboardScreen را بگذاری
import LoginScreen from './src/screens/Auth/LoginScreen';
import PlanWizard from './src/screens/Wizard/PlanWizard';
// import PaymentScreen from './src/screens/Payment/PaymentScreen';          // اگر هنوز نساختی، موقتاً یک صفحه‌ی ساده بساز
import TermsScreen from './src/screens/Static/TermsScreen';
import FaqScreen from './src/screens/Static/FaqScreen';
import ContactUsScreen from './src/screens/Static/ContactUsScreen';
// import ActivePlanScreen from './src/screens/ActivePlan/ActivePlanScreen'; // در صورت نیاز

const Stack = createNativeStackNavigator();
const Tabs  = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#e5e7eb' },
      }}
    >
      {/* خانه / داشبورد */}
      <Tabs.Screen
        name="Dashboard"
        // اگر Home شما همون Landing هست، اینو به LandingScreen تغییر بده
        component={LandingScreen /* یا DashboardScreen */}
        options={{
          title: 'خانه',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />

      {/* برنامه‌ها */}
      <Tabs.Screen
        name="Plans"
        component={PlansScreen}
        options={{
          title: 'برنامه‌ها',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
        }}
      />

      {/* پروفایل */}
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen /* اگر فعلاً نداری: DashboardScreen */}
        options={{
          title: 'پروفایل',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  // فونت وزیر
  const [fontsLoaded] = useFonts({
    'Vazir-Regular': require('./src/assets/fonts/Vazir.ttf'),
    'Vazir-Medium':  require('./src/assets/fonts/Vazir-Medium.ttf'),
    'Vazir-Bold':    require('./src/assets/fonts/Vazir-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0e1015'}}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Landing">
        {/* صفحه فرود */}
        <Stack.Screen name="Landing" component={LandingScreen} />

        {/* تب‌های اصلی */}
        <Stack.Screen name="Main" component={MainTabs} />
<Stack.Screen name="Dashboard" component={DashboardScreen} />
        {/* صفحات مستقل */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PlanWizard" component={PlanWizard} />
        <Stack.Screen name="Plans" component={PlansScreen} />
        {/* <Stack.Screen name="Payment" component={PaymentScreen} /> */}
        {/* <Stack.Screen name="ActivePlan" component={ActivePlanScreen} /> */}

        {/* صفحات استاتیک */}
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Faq" component={FaqScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
