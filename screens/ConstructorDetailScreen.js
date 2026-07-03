import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
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

  const teamColor = TEAM_COLORS[constructorName] || '#888';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{constructorName}</Text>
        <Text style={styles.headerSub}>{points} pts · {YEAR}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
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
            {roundResults.map((race, index) => (
              <View key={race.round} style={[styles.row, index % 2 === 0 && styles.rowAlt]}>
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
    flexDirection: 'column',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#E10600',
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 4 },
  list: { flex: 1 },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  emptyText: { color: '#777', fontSize: 13 },
  driverRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
  },
  colorBar: { width: 3, height: 36, borderRadius: 2, marginRight: 12 },
  driverName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  teamName: { color: '#666', fontSize: 11, marginTop: 2 },
  points: { color: '#fff', fontSize: 13, fontWeight: '500', width: 72, textAlign: 'right' },
  colHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  colText: { color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  colRight: { textAlign: 'right' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
  },
  rowAlt: { backgroundColor: '#161616' },
  rank: { color: '#888', fontSize: 13, fontWeight: '600' },
  stat: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'right' },
});
