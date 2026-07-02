import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TEAM_COLORS, FLAGS, YEAR } from '../constants';

const sessions = ['FP1', 'FP2', 'FP3', 'Quali', 'Race'];
const SESSION_ENDPOINTS = {
  Race: round => `https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/results.json`,
  Quali: round => `https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/qualifying.json`,
  FP1: round => `https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/fp1results.json`,
  FP2: round => `https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/fp2results.json`,
  FP3: round => `https://api.jolpi.ca/ergast/f1/${YEAR}/${round}/fp3results.json`,
};

export default function RaceDetailScreen({ route, navigation }) {
  const { race } = route.params;
  const [activeSession, setActiveSession] = useState('Race');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setResults([]);
    fetch(SESSION_ENDPOINTS[activeSession](race.round))
      .then(r => r.json())
      .then(data => {
        const raceTable = data.MRData.RaceTable.Races;
        if (!raceTable || raceTable.length === 0) {
          setResults([]);
          setLoading(false);
          return;
        }
        const r = raceTable[0];
        if (activeSession === 'Race') setResults(r.Results || []);
        else if (activeSession === 'Quali') setResults(r.QualifyingResults || []);
        else setResults(r.PracticeResults || []);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setLoading(false);
      });
  }, [activeSession, race.round]);

  const isPast = new Date(race.date) < new Date();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontSize: 16, marginRight: 12 }}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerText}>{race.raceName}</Text>
          <Text style={{ color: '#ffcccc', fontSize: 11 }}>{race.Circuit.circuitName} · {race.date}</Text>
        </View>
      </View>

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

      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{isPast ? 'No data available' : 'Session not yet completed'}</Text>
        </View>
      ) : (
        <ScrollView style={styles.list}>
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
                  <Text style={styles.driverName}>{flag} {r.Driver?.givenName?.[0]}. {r.Driver?.familyName}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#E10600',
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
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
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#555', fontSize: 14 },
});
