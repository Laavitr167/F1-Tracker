import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { YEAR } from '../constants';

const COUNTRY_FLAGS = {
  Australia: '🇦🇺', China: '🇨🇳', Japan: '🇯🇵', Bahrain: '🇧🇭', 'Saudi Arabia': '🇸🇦',
  'United States': '🇺🇸', Italy: '🇮🇹', Monaco: '🇲🇨', Spain: '🇪🇸',
  Canada: '🇨🇦', Austria: '🇦🇹', 'United Kingdom': '🇬🇧', Hungary: '🇭🇺', Belgium: '🇧🇪',
  Netherlands: '🇳🇱', Singapore: '🇸🇬', Azerbaijan: '🇦🇿', Mexico: '🇲🇽',
  Brazil: '🇧🇷', UAE: '🇦🇪', Qatar: '🇶🇦',
};

const getCountryFlag = (country) => COUNTRY_FLAGS[country] || '🏁';

export default function CircuitsScreen({ navigation }) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}.json`)
      .then((res) => res.json())
      .then((data) => {
        setRaces(data.MRData.RaceTable.Races || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Circuits</Text>
        <Text style={styles.headerSub}>{YEAR} Track Facts</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          {races.map((race) => {
            const flag = getCountryFlag(race.Circuit.Location.country);
            return (
              <TouchableOpacity
                key={race.round}
                onPress={() => navigation.navigate('CircuitDetail', { race })}
                style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.flagText}>{flag}</Text>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.circuitName}>{race.Circuit.circuitName}</Text>
                    <Text style={styles.cityText}>{race.Circuit.Location.locality}</Text>
                  </View>
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
  headerSub: { color: '#fff', fontSize: 13, fontWeight: '600', marginLeft: 12 },
  list: { flex: 1 },
  card: {
    backgroundColor: '#0f0f0f', borderRadius: 16, borderWidth: 1, borderColor: '#1f1f1f', marginHorizontal: 16, marginBottom: 12, padding: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  flagText: { fontSize: 28, marginRight: 12 },
  cardTitleRow: { flex: 1 },
  circuitName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cityText: { color: '#777', fontSize: 12, marginTop: 4 },
});
