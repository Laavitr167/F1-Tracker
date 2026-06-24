import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';

const YEAR = '2025';

const TEAM_COLORS = {
  'McLaren': '#FF8000', 'Red Bull': '#3671C6', 'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
  'Alpine F1 Team': '#FF87BC', 'Williams': '#64C4FF', 'RB F1 Team': '#6692FF',
  'RB': '#6692FF', 'Kick Sauber': '#52E252', 'Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD', 'Haas': '#B6BABD', 'Audi': '#E4002B',
};

const FLAGS = {
  'British': '🇬🇧', 'Dutch': '🇳🇱', 'Monegasque': '🇲🇨', 'Spanish': '🇪🇸',
  'Australian': '🇦🇺', 'German': '🇩🇪', 'Mexican': '🇲🇽', 'Finnish': '🇫🇮',
  'French': '🇫🇷', 'Canadian': '🇨🇦', 'Japanese': '🇯🇵', 'Thai': '🇹🇭',
  'Danish': '🇩🇰', 'Chinese': '🇨🇳', 'American': '🇺🇸', 'Brazilian': '🇧🇷',
  'Argentine': '🇦🇷', 'Italian': '🇮🇹', 'New Zealander': '🇳🇿', 'Austrian': '🇦🇹',
};

// ─── RACE DETAIL SCREEN ───────────────────────────────────────────────────────
function RaceDetailScreen({ route, navigation }) {
  const { race } = route.params;
  const [activeSession, setActiveSession] = useState('Race');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const sessions = ['FP1', 'FP2', 'FP3', 'Quali', 'Race'];

  const SESSION_ENDPOINTS = {
    'Race': `https://api.jolpi.ca/ergast/f1/${YEAR}/${race.round}/results.json`,
    'Quali': `https://api.jolpi.ca/ergast/f1/${YEAR}/${race.round}/qualifying.json`,
    'FP1': `https://api.jolpi.ca/ergast/f1/${YEAR}/${race.round}/fp1results.json`,
    'FP2': `https://api.jolpi.ca/ergast/f1/${YEAR}/${race.round}/fp2results.json`,
    'FP3': `https://api.jolpi.ca/ergast/f1/${YEAR}/${race.round}/fp3results.json`,
  };

  useEffect(() => {
    setLoading(true);
    setResults([]);
    fetch(SESSION_ENDPOINTS[activeSession])
      .then(r => r.json())
      .then(data => {
        const raceTable = data.MRData.RaceTable.Races;
        if (!raceTable || raceTable.length === 0) { setResults([]); setLoading(false); return; }
        const r = raceTable[0];
        if (activeSession === 'Race') setResults(r.Results || []);
        else if (activeSession === 'Quali') setResults(r.QualifyingResults || []);
        else if (activeSession === 'FP1') setResults(r.PracticeResults || []);
        else if (activeSession === 'FP2') setResults(r.PracticeResults || []);
        else if (activeSession === 'FP3') setResults(r.PracticeResults || []);
        setLoading(false);
      })
      .catch(() => { setResults([]); setLoading(false); });
  }, [activeSession]);

  const isPast = new Date(race.date) < new Date();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 16, marginRight: 12 }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerText}>{race.raceName}</Text>
          <Text style={{ color: '#ffcccc', fontSize: 11 }}>{race.Circuit.circuitName} · {race.date}</Text>
        </View>
      </View>

      {/* Session tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sessionTabsScroll}>
        <View style={styles.sessionTabs}>
          {sessions.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sessionTab, activeSession === s && styles.sessionTabActive]}
              onPress={() => setActiveSession(s)}>
              <Text style={[styles.sessionTabText, activeSession === s && styles.sessionTabTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : results.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#555', fontSize: 14 }}>
            {isPast ? 'No data available' : 'Session not yet completed'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {/* Column headers */}
          <View style={styles.colHeader}>
            <Text style={[styles.colText, { width: 36 }]}>Pos</Text>
            <Text style={[styles.colText, { flex: 1 }]}>Driver</Text>
            <Text style={[styles.colText, styles.colRight, { width: 80 }]}>
              {activeSession === 'Race' ? 'Gap' : activeSession === 'Quali' ? 'Q3' : 'Time'}
            </Text>
          </View>

          {results.map((r, i) => {
            const teamName = r.Constructor?.name || '';
            const teamColor = TEAM_COLORS[teamName] || '#888';
            const flag = FLAGS[r.Driver?.nationality] || '🏁';
            const pos = r.position || r.number || i + 1;

            let timeStr = '—';
            if (activeSession === 'Race') {
              timeStr = r.gap || r.Time?.time || r.status || '—';
              if (i === 0) timeStr = r.Time?.time || 'Winner';
            } else if (activeSession === 'Quali') {
              timeStr = r.Q3 || r.Q2 || r.Q1 || '—';
            } else {
              timeStr = r.time || r.Time?.time || '—';
            }

            return (
              <View key={i} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
                <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                <Text style={[styles.rank, { width: 36 }]}>{pos}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>
                    {flag} {r.Driver?.givenName?.[0]}. {r.Driver?.familyName}
                  </Text>
                  <Text style={[styles.teamName, { color: teamColor }]}>{teamName}</Text>
                </View>
                <Text style={[styles.stat, { width: 80 }]}>{timeStr}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

// ─── SCHEDULE LIST SCREEN ─────────────────────────────────────────────────────
function ScheduleScreen({ navigation }) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}.json`)
      .then(res => res.json())
      .then(data => { setRaces(data.MRData.RaceTable.Races); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>F1 Buddy</Text>
        <Text style={styles.headerSub}>{YEAR} Calendar</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          {races.map((race, i) => {
            const isPast = new Date(race.date) < today;
            return (
              <TouchableOpacity
                key={race.round}
                onPress={() => navigation.navigate('RaceDetail', { race })}
                style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
                <View style={[styles.colorBar, { backgroundColor: isPast ? '#444' : '#E10600' }]} />
                <Text style={[styles.rank, { width: 36 }]}>{race.round}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{race.raceName}</Text>
                  <Text style={styles.teamName}>{race.Circuit.circuitName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.stat}>{race.date}</Text>
                  <Text style={[styles.teamName, { color: isPast ? '#555' : '#E10600' }]}>
                    {isPast ? 'Completed ›' : 'Upcoming'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

// ─── STANDINGS SCREEN ─────────────────────────────────────────────────────────
function StandingsScreen() {
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [driverPodiums, setDriverPodiums] = useState({});
  const [constructorPodiums, setConstructorPodiums] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('drivers');

  useEffect(() => {
    Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/driverStandings.json`).then(r => r.json()),
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/constructorStandings.json`).then(r => r.json()),
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/results.json?limit=500`).then(r => r.json()),
    ]).then(([driverData, constructorData, resultsData]) => {
      setDrivers(driverData.MRData.StandingsTable.StandingsLists[0].DriverStandings);
      setConstructors(constructorData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings);
      const driverPod = {};
      const constructorPod = {};
      resultsData.MRData.RaceTable.Races.forEach(race => {
        race.Results.forEach(result => {
          if (parseInt(result.position) <= 3) {
            const dId = result.Driver.driverId;
            const cName = result.Constructor.name;
            driverPod[dId] = (driverPod[dId] || 0) + 1;
            constructorPod[cName] = (constructorPod[cName] || 0) + 1;
          }
        });
      });
      setDriverPodiums(driverPod);
      setConstructorPodiums(constructorPod);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>F1 Buddy</Text>
        <Text style={styles.headerSub}>{YEAR} Standings</Text>
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'drivers' && styles.tabBtnActive]} onPress={() => setTab('drivers')}>
          <Text style={[styles.tabLabel, tab === 'drivers' && styles.tabLabelActive]}>Drivers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'constructors' && styles.tabBtnActive]} onPress={() => setTab('constructors')}>
          <Text style={[styles.tabLabel, tab === 'constructors' && styles.tabLabelActive]}>Constructors</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          <View style={styles.colHeader}>
            <Text style={[styles.colText, { width: 36 }]}>Rank</Text>
            <Text style={[styles.colText, { flex: 1 }]}>{tab === 'drivers' ? 'Driver' : 'Constructor'}</Text>
            <Text style={[styles.colText, styles.colRight, { width: 54 }]}>Pts</Text>
            <Text style={[styles.colText, styles.colRight, { width: 42 }]}>Wins</Text>
            <Text style={[styles.colText, styles.colRight, { width: 62 }]}>Podiums</Text>
          </View>
          {tab === 'drivers' ? drivers.map((d, i) => {
            const teamName = d.Constructors[0].name;
            const teamColor = TEAM_COLORS[teamName] || '#888';
            const flag = FLAGS[d.Driver.nationality] || '🏁';
            return (
              <View key={d.position} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
                <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                <Text style={[styles.rank, { width: 36 }]}>{d.position}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{flag} {d.Driver.givenName[0]}. {d.Driver.familyName}</Text>
                  <Text style={[styles.teamName, { color: teamColor }]}>{teamName}</Text>
                </View>
                <Text style={[styles.stat, { width: 54 }]}>{d.points}</Text>
                <Text style={[styles.stat, { width: 42 }]}>{d.wins}</Text>
                <Text style={[styles.stat, { width: 62 }]}>{driverPodiums[d.Driver.driverId] || 0}</Text>
              </View>
            );
          }) : constructors.map((c, i) => {
            const teamName = c.Constructor.name;
            const teamColor = TEAM_COLORS[teamName] || '#888';
            return (
              <View key={c.position} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
                <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                <Text style={[styles.rank, { width: 36 }]}>{c.position}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{teamName}</Text>
                </View>
                <Text style={[styles.stat, { width: 54 }]}>{c.points}</Text>
                <Text style={[styles.stat, { width: 42 }]}>{c.wins}</Text>
                <Text style={[styles.stat, { width: 62 }]}>{constructorPodiums[teamName] || 0}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function LiveScreen() {
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ fontSize: 40 }}>🏁</Text>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 12 }}>Live Race</Text>
      <Text style={{ color: '#aaa', fontSize: 14, marginTop: 8 }}>Coming next</Text>
    </View>
  );
}

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
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

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#2a2a2a' },
          tabBarActiveTintColor: '#E10600',
          tabBarInactiveTintColor: '#666',
        }}>
        <Tab.Screen name="Live" component={LiveScreen} options={{ tabBarLabel: '🏁 Live' }} />
        <Tab.Screen name="Standings" component={StandingsScreen} options={{ tabBarLabel: '🏆 Standings' }} />
        <Tab.Screen name="Schedule" component={ScheduleStack} options={{ tabBarLabel: '📅 Schedule' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#E10600',
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#E10600' },
  tabLabel: { color: '#666', fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },
  sessionTabsScroll: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  sessionTabs: { flexDirection: 'row', paddingHorizontal: 12 },
  sessionTab: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  sessionTabActive: { borderBottomColor: '#E10600' },
  sessionTabText: { color: '#666', fontSize: 13, fontWeight: '600' },
  sessionTabTextActive: { color: '#fff' },
  list: { flex: 1 },
  colHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  colText: { color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  colRight: { textAlign: 'right' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
  },
  rowAlt: { backgroundColor: '#161616' },
  colorBar: { width: 3, height: 36, borderRadius: 2, marginRight: 12 },
  rank: { color: '#888', fontSize: 13, fontWeight: '600' },
  driverName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  teamName: { color: '#666', fontSize: 11, marginTop: 2 },
  stat: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'right' },
});