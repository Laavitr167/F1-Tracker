import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TEAM_COLORS, YEAR } from '../constants';

export default function TeamsScreen({ navigation }) {
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/constructorStandings.json`)
      .then(r => r.json())
      .then(data => {
        setConstructors(data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>F1 Buddy</Text>
        <Text style={styles.headerSub}>{YEAR} Constructors</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          {constructors.map((c, i) => {
            const name = c.Constructor.name;
            const teamColor = TEAM_COLORS[name] || '#888';
            return (
              <TouchableOpacity
                key={c.position}
                style={[styles.row, i % 2 === 0 && styles.rowAlt]}
                onPress={() => navigation.navigate('ConstructorDetail', {
                  constructorName: name,
                  points: c.points,
                })}>
                <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                <Text style={[styles.rank, { width: 36 }]}>{c.position}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.teamName}>{name}</Text>
                </View>
                <Text style={[styles.stat, { width: 80 }]}>{c.points}</Text>
              </TouchableOpacity>
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
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, backgroundColor: '#0a0a0a', borderBottomWidth: 3, borderBottomColor: '#E10600',
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#fff', fontSize: 13, fontWeight: '600' },
  list: { flex: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  colorBar: { width: 3, height: 36, borderRadius: 2, marginRight: 12 },
  rank: { color: '#888', fontSize: 13, fontWeight: '600' },
  teamName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  stat: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'right' },
});
