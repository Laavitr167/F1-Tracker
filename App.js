import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import ErrorBoundary from './components/ErrorBoundary';
import LiveScreen from './screens/LiveScreen';
import StandingsScreen from './screens/StandingsScreen';
import DriverDetailScreen from './screens/DriverDetailScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import RaceDetailScreen from './screens/RaceDetailScreen';
import TeamsScreen from './screens/TeamsScreen';
import ConstructorDetailScreen from './screens/ConstructorDetailScreen';
import CircuitsScreen from './screens/CircuitsScreen';
import CircuitDetailScreen from './screens/CircuitDetailScreen';
import MoreScreen from './screens/MoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const withBoundary = (Component) => (props) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);

function ScheduleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScheduleList" component={withBoundary(ScheduleScreen)} />
      <Stack.Screen name="RaceDetail" component={withBoundary(RaceDetailScreen)} />
    </Stack.Navigator>
  );
}

function StandingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StandingsList" component={withBoundary(StandingsScreen)} />
      <Stack.Screen name="DriverDetail" component={withBoundary(DriverDetailScreen)} />
    </Stack.Navigator>
  );
}

function TeamsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamsList" component={withBoundary(TeamsScreen)} />
      <Stack.Screen name="ConstructorDetail" component={withBoundary(ConstructorDetailScreen)} />
    </Stack.Navigator>
  );
}

function CircuitsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CircuitsList" component={withBoundary(CircuitsScreen)} />
      <Stack.Screen name="CircuitDetail" component={withBoundary(CircuitDetailScreen)} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#E10600',
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
      }}>
      <Tab.Screen name="Live" component={withBoundary(LiveScreen)} options={{ tabBarLabel: '🏁 Live' }} />
      <Tab.Screen name="Standings" component={StandingsStack} options={{ tabBarLabel: '🏆 Standings' }} />
      <Tab.Screen name="Schedule" component={ScheduleStack} options={{ tabBarLabel: '📅 Schedule' }} />
      <Tab.Screen name="More" component={withBoundary(MoreScreen)} options={{ tabBarLabel: '➕ More' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Teams" component={TeamsStack} />
        <Stack.Screen name="Circuits" component={CircuitsStack} />
        <Stack.Screen name="Analytics" component={withBoundary(AnalyticsScreen)} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
