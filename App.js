import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import LiveScreen from './screens/LiveScreen';
import StandingsScreen from './screens/StandingsScreen';
import DriverDetailScreen from './screens/DriverDetailScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import RaceDetailScreen from './screens/RaceDetailScreen';
import TeamsScreen from './screens/TeamsScreen';
import ConstructorDetailScreen from './screens/ConstructorDetailScreen';

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

function TeamsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamsList" component={TeamsScreen} />
      <Stack.Screen name="ConstructorDetail" component={ConstructorDetailScreen} />
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
        <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: '📊 Analytics' }} />
        <Tab.Screen name="Schedule" component={ScheduleStack} options={{ tabBarLabel: '📅 Schedule' }} />
        <Tab.Screen name="Teams" component={TeamsStack} options={{ tabBarLabel: '🏎️ Teams' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
