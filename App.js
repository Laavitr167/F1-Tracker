import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import LiveScreen from './screens/LiveScreen';
import StandingsScreen from './screens/StandingsScreen';
import DriverDetailScreen from './screens/DriverDetailScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import RaceDetailScreen from './screens/RaceDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ScheduleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScheduleList" component={ScheduleScreen} />
      <Stack.Screen name="RaceDetail" component={RaceDetailScreen} />
    </Stack.Navigator>
  );
}

function StandingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StandingsList" component={StandingsScreen} />
      <Stack.Screen name="DriverDetail" component={DriverDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#2a2a2a' },
          tabBarActiveTintColor: '#E10600',
          tabBarInactiveTintColor: '#888',
        }}>
        <Tab.Screen name="Live" component={LiveScreen} options={{ tabBarLabel: '🏁 Live' }} />
        <Tab.Screen name="Standings" component={StandingsStack} options={{ tabBarLabel: '🏆 Standings' }} />
        <Tab.Screen name="Schedule" component={ScheduleStack} options={{ tabBarLabel: '📅 Schedule' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
