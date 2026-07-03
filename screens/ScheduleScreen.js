import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { YEAR } from '../constants';

export default function ScheduleScreen({ navigation }) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}.json`)
      .then(res => res.json())
      .then(data => {
        setRaces(data.MRData.RaceTable.Races);
        setLoading(false);
      })
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
          {races.map((race) => {
            const isPast = new Date(race.date) < today;
            return (
              <TouchableOpacity
                key={race.round}
                onPress={() => navigation.navigate('RaceDetail', { race })}
                style={styles.row}>
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
  driverName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  teamName: { color: '#666', fontSize: 11, marginTop: 2 },
  stat: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'right' },
});
