// App.js

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';

// اسکرین‌ها – مسیرها رو با پروژه‌ی خودت تنظیم کن
import ActivePlanScreen from './src/screens/ActivePlan/ActivePlanScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import DashboardScreen from './src/screens/Home/DashboardScreen'; // اگر صفحهٔ داشبورد جدا داری
import LandingScreen from './src/screens/Home/LandingScreen';
import PaymentResultScreen from './src/screens/Payment/PaymentResultScreen';
import PaymentScreen from './src/screens/Payment/PaymentScreen';
import PlansScreen from './src/screens/Plans/PlansScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import SplashScreen from './src/screens/SplashScreen';
import PlanWizardScreen from './src/screens/Wizard/PlanWizard';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// 🔹 تب‌های پایین – بدون Dashboard اضافه
function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontFamily: 'Vazir-Medium', fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        component={LandingScreen} // یا Dashboard اصلی‌ت اگر جدا داری
        options={{
          title: 'خانه',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="PlansTab"
        component={PlansScreen}
        options={{
          title: 'برنامه‌ها',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'پروفایل',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
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

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Splash"
      >
        {/* اسپلش */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {/* لندینگ (صفحه اول بعد از اسپلش) */}
        <Stack.Screen name="Landing" component={LandingScreen} />

        {/* لاگین */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* ویزارد برنامه */}
        <Stack.Screen name="PlanWizard" component={PlanWizardScreen} />

        {/* پرداخت */}
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />

        {/* برنامه فعال – اگر مستقیم لازم شد */}
        <Stack.Screen name="ActivePlan" component={ActivePlanScreen} />
<Stack.Screen name="Dashboard" component={DashboardScreen} />

        {/* تب‌های اصلی اپ (خانه/برنامه‌ها/پروفایل) */}
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
