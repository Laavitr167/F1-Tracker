import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import SkeletonRow from '../components/SkeletonRow';
import { TEAM_COLORS, FLAGS, YEAR, DRIVER_IMAGES } from '../constants';

export default function DriverDetailScreen({ route, navigation }) {
  const { driver, teamName, points, wins, podiums } = route.params;
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const teamColor = TEAM_COLORS[teamName] || '#888';
  const flag = FLAGS[driver.nationality] || '🏁';

  const getResultBadgeColor = (result) => {
    if (!result) return '#2a2a2a';
    const status = result.status || '';
    const isDNF = status !== 'Finished' && !/^[+][0-9]+ Lap[s]?$/.test(status);
    if (isDNF) return '#5c2a2a';
    const position = parseInt(result.position, 10);
    if (position === 1) return '#FFD700';
    if (position === 2) return '#C0C0C0';
    if (position === 3) return '#CD7F32';
    if (position >= 4 && position <= 10) return '#2a5c2a';
    return '#2a2a2a';
  };

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/drivers/${driver.driverId}/results.json`)
      .then(r => r.json())
      .then(data => {
        setRaces(data.MRData.RaceTable.Races || []);
        setLoading(false);
      })
      .catch(() => {
        setRaces([]);
        setLoading(false);
      });
  }, [driver.driverId]);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={[styles.heroBackground, { backgroundColor: teamColor }]} />
        <View style={[styles.heroBackgroundAlt, { backgroundColor: `${teamColor}22` }]} />
        <View style={styles.heroContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <View style={styles.heroText}>
            <Text style={styles.driverNumber}>{driver.permanentNumber || driver.code || ''}</Text>
            <Text style={styles.headerText}>{driver.givenName} {driver.familyName}</Text>
            <Text style={styles.headerSub}>{flag} {driver.nationality} · <Text style={styles.teamLabel}>{teamName}</Text></Text>
          </View>
          {DRIVER_IMAGES[driver.driverId] && (
            <Image
              source={{ uri: DRIVER_IMAGES[driver.driverId] }}
              style={styles.driverImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: 'Points', value: points },
          { label: 'Wins', value: wins },
          { label: 'Podiums', value: podiums },
          { label: 'Races', value: loading ? '—' : races.length },
        ].map(s => (
          <View key={s.label} style={styles.statBox}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={{ marginTop: 12 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </View>
      ) : (
        <ScrollView style={styles.list}>
          <View style={styles.gridCard}>
            <Text style={styles.gridTitle}>2025 Season</Text>
            <View style={styles.gridWrap}>
              {races.map((race) => {
                const result = race.Results[0] || {};
                const badgeColor = getResultBadgeColor(result);
                return (
                  <View key={race.round} style={styles.gridItem}>
                    <View style={[styles.gridBox, { backgroundColor: badgeColor }]}> 
                      <Text style={styles.gridBoxText}>{result.position || '—'}</Text>
                    </View>
                    <Text style={styles.gridRoundText}>{race.round}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.colHeader}>
            <Text style={[styles.colText, { width: 36 }]}>Rnd</Text>
            <Text style={[styles.colText, { flex: 1 }]}>Race</Text>
            <Text style={[styles.colText, styles.colRight, { width: 42 }]}>Pos</Text>
            <Text style={[styles.colText, styles.colRight, { width: 42 }]}>Pts</Text>
          </View>
          {races.map((race) => {
            const result = race.Results[0] || {};
            return (
              <View key={race.round} style={styles.row}>
                <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                <Text style={[styles.rank, { width: 36 }]}>{race.round}</Text>
                <Text style={[styles.driverName, { flex: 1 }]} numberOfLines={1}>{race.raceName}</Text>
                <Text style={[styles.stat, { width: 42 }]}>{result.position || '—'}</Text>
                <Text style={[styles.stat, { width: 42 }]}>{result.points || '—'}</Text>
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
  colHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  colText: { color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  colRight: { textAlign: 'right' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  colorBar: { width: 4, height: 40, borderRadius: 4, marginRight: 12 },
  rank: { color: '#888', fontSize: 13, fontWeight: '600' },
  driverName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  stat: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'right' },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  statLabel: { color: '#666', fontSize: 12, letterSpacing: 0.2, marginTop: 4 },
  gridCard: { backgroundColor: '#0f0f0f', borderRadius: 16, borderWidth: 1, borderColor: '#1f1f1f', margin: 12, padding: 12 },
  gridTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: 42, alignItems: 'center', margin: 3 },
  gridBox: { width: 36, height: 36, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  gridBoxText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  gridRoundText: { color: '#777', fontSize: 10, marginTop: 4 },
  hero: { position: 'relative', paddingBottom: 20, marginBottom: 20 },
  heroBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, borderBottomRightRadius: 40, borderBottomLeftRadius: 40 },
  heroBackgroundAlt: { position: 'absolute', top: 120, left: 0, right: 0, height: 120 },
  heroContent: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
  heroText: { flex: 1, paddingRight: 160 },
  driverNumber: { position: 'absolute', top: 16, left: 0, color: '#fff', fontSize: 72, fontWeight: '900', opacity: 0.15 },
  teamLabel: { color: '#fff', fontWeight: '700' },
  driverImage: { width: 140, height: 160, position: 'absolute', right: 16, top: 28 },
});
