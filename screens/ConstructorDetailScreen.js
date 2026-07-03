import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import SkeletonRow from '../components/SkeletonRow';
import { TEAM_COLORS, YEAR } from '../constants';

export default function ConstructorDetailScreen({ route }) {
  const { constructorName, points } = route.params;
  const [drivers, setDrivers] = useState([]);
  const [roundResults, setRoundResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/driverStandings.json`).then(r => r.json()),
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/results.json?limit=500`).then(r => r.json()),
    ])
      .then(([driverData, resultsData]) => {
        const driverStandings = driverData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        setDrivers(driverStandings.filter(d => d.Constructors[0].name === constructorName));

        const races = [...resultsData.MRData.RaceTable.Races].sort((a, b) => +a.round - +b.round);
        const constructorRounds = races.map(race => {
          const roundPoints = race.Results.reduce((sum, result) => {
            return result.Constructor.name === constructorName ? sum + parseFloat(result.points || 0) : sum;
          }, 0);
          return {
            round: race.round,
            raceName: race.raceName,
            points: roundPoints,
          };
        });
        setRoundResults(constructorRounds);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [constructorName]);

  const teamColor = TEAM_COLORS[constructorName] || '#E10600';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#0a0a0a' }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerText}>{constructorName}</Text>
          <Text style={styles.headerSub}>{points} pts · {YEAR}</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ marginTop: 12 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </View>
      ) : (
        <ScrollView style={styles.list}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drivers</Text>
            {drivers.length === 0 ? (
              <Text style={styles.emptyText}>No drivers found for this constructor.</Text>
            ) : (
              drivers.map(driver => (
                <View key={driver.Driver.driverId} style={styles.driverRow}>
                  <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.driverName}>{driver.Driver.givenName} {driver.Driver.familyName}</Text>
                    <Text style={styles.teamName}>{driver.Driver.nationality}</Text>
                  </View>
                  <Text style={styles.points}>{driver.points} pts</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Round Results</Text>
            <View style={styles.colHeader}>
              <Text style={[styles.colText, { width: 36 }]}>Rnd</Text>
              <Text style={[styles.colText, { flex: 1 }]}>Race</Text>
              <Text style={[styles.colText, styles.colRight, { width: 72 }]}>Pts</Text>
            </View>
            {roundResults.map((race) => (
              <View key={race.round} style={styles.row}>
                <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                <Text style={[styles.rank, { width: 36 }]}>{race.round}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.teamName}>{race.raceName}</Text>
                </View>
                <Text style={[styles.stat, { width: 72 }]}>{race.points}</Text>
              </View>
            ))}
          </View>
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
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  backButtonText: { color: '#fff', fontSize: 15 },
  headerText: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  headerSub: { color: '#666', fontSize: 12, marginTop: 2 },
  list: { flex: 1 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  emptyText: { color: '#777', fontSize: 13 },
  driverRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  colorBar: { width: 4, height: 40, borderRadius: 4, marginRight: 12 },
  driverName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  teamName: { color: '#666', fontSize: 11, marginTop: 2 },
  points: { color: '#fff', fontSize: 13, fontWeight: '500', width: 72, textAlign: 'right' },
  colHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  colText: { color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  colRight: { textAlign: 'right' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  rank: { color: '#888', fontSize: 13, fontWeight: '600' },
  stat: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'right' },
});
