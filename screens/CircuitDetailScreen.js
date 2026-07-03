import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FLAGS } from '../constants';

const CIRCUIT_FACTS = {
  bahrain: {
    name: 'Bahrain International Circuit',
    city: 'Sakhir',
    country: 'Bahrain',
    length: '5.412 km',
    laps: 57,
    firstRace: 2004,
    fastestLap: '1:31.447',
    recordHolder: 'Lewis Hamilton',
    recordYear: 2021,
    description:
      'A modern floodlit desert track known for technical corners, long straights, and dramatic races under the lights.',
  },
  jeddah: {
    name: 'Jeddah Corniche Circuit',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    length: '6.174 km',
    laps: 50,
    firstRace: 2021,
    fastestLap: '1:29.142',
    recordHolder: 'Sergio Pérez',
    recordYear: 2023,
    description:
      'A high-speed street circuit with tight walls, fast chicanes, and one of the longest lap distances on the calendar.',
  },
  melbourne: {
    name: 'Albert Park Circuit',
    city: 'Melbourne',
    country: 'Australia',
    length: '5.278 km',
    laps: 58,
    firstRace: 1996,
    fastestLap: '1:20.260',
    recordHolder: 'Charles Leclerc',
    recordYear: 2019,
    description:
      'A scenic circuit around the lake in Albert Park with a mix of fast sweepers, slow corners, and changeable weather.',
  },
  shanghai: {
    name: 'Shanghai International Circuit',
    city: 'Shanghai',
    country: 'China',
    length: '5.451 km',
    laps: 56,
    firstRace: 2004,
    fastestLap: '1:32.238',
    recordHolder: 'Nico Rosberg',
    recordYear: 2014,
    description:
      'One of the most iconic modern tracks, featuring a long straight, tight hairpin, and sweeping high-speed corners.',
  },
  montecarlo: {
    name: 'Circuit de Monaco',
    city: 'Monte Carlo',
    country: 'Monaco',
    length: '3.337 km',
    laps: 78,
    firstRace: 1950,
    fastestLap: '1:10.166',
    recordHolder: 'Lewis Hamilton',
    recordYear: 2019,
    description:
      'A legendary street circuit where precision matters most, with narrow barriers, elevation changes, and historic glamour.',
  },
  spa: {
    name: 'Circuit de Spa-Francorchamps',
    city: 'Stavelot',
    country: 'Belgium',
    length: '7.004 km',
    laps: 44,
    firstRace: 1950,
    fastestLap: '1:46.286',
    recordHolder: 'Valtteri Bottas',
    recordYear: 2018,
    description:
      'A classic roller-coaster layout with Eau Rouge, Blanchimont, and high-speed uphill and downhill sections.',
  },
  silverstone: {
    name: 'Silverstone Circuit',
    city: 'Silverstone',
    country: 'United Kingdom',
    length: '5.891 km',
    laps: 52,
    firstRace: 1950,
    fastestLap: '1:27.097',
    recordHolder: 'Max Verstappen',
    recordYear: 2021,
    description:
      'A historic track with a flowing, high-speed layout that rewards aerodynamic efficiency and brave drivers.',
  },
  monza: {
    name: 'Autodromo Nazionale Monza',
    city: 'Monza',
    country: 'Italy',
    length: '5.793 km',
    laps: 53,
    firstRace: 1950,
    fastestLap: '1:21.046',
    recordHolder: 'Rubens Barrichello',
    recordYear: 2004,
    description:
      'The Temple of Speed, famous for long straights, chicanes, and intense slipstream battles.',
  },
  austin: {
    name: 'Circuit of the Americas',
    city: 'Austin',
    country: 'United States',
    length: '5.513 km',
    laps: 56,
    firstRace: 2012,
    fastestLap: '1:36.169',
    recordHolder: 'Lewis Hamilton',
    recordYear: 2019,
    description:
      'A purpose-built modern facility with a dramatic uphill run into Turn 1 and a mix of slow and fast corners.',
  },
  // Add more circuits as needed.
};

const fallbackFact = {
  name: 'Unknown Circuit',
  city: 'Unknown',
  country: 'Unknown',
  length: 'N/A',
  laps: 'N/A',
  firstRace: 'N/A',
  fastestLap: 'N/A',
  recordHolder: 'N/A',
  recordYear: 'N/A',
  description: 'No track fact information is available for this circuit yet.',
};

export default function CircuitDetailScreen({ route, navigation }) {
  const { race } = route.params;
  const circuitId = race.Circuit?.circuitId?.toLowerCase?.();
  const facts = CIRCUIT_FACTS[circuitId] || fallbackFact;
  const countryFlag = FLAGS[race.Circuit?.Location?.country] || '🏁';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerText}>{race.raceName}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>{race.date} · {race.Circuit?.circuitName}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.cardFlag}>{countryFlag}</Text>
          <Text style={styles.cardTitle}>{facts.name}</Text>
          <Text style={styles.cardSubtitle}>{facts.city} · {facts.country}</Text>
          <Text style={styles.cardDate}>Round {race.round} · {race.date}</Text>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Circuit length</Text>
            <Text style={styles.factValue}>{facts.length}</Text>
          </View>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Laps</Text>
            <Text style={styles.factValue}>{facts.laps}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>First F1 race</Text>
            <Text style={styles.factValue}>{facts.firstRace}</Text>
          </View>
          <View style={styles.factCard}>
            <Text style={styles.factLabel}>Fastest lap</Text>
            <Text style={styles.factValue}>{facts.fastestLap}</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Record holder</Text>
            <Text style={styles.statValue}>{facts.recordHolder}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Record year</Text>
            <Text style={styles.statValue}>{facts.recordYear}</Text>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Track Notes</Text>
          <Text style={styles.descriptionText}>{facts.description}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 20,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 3,
    borderBottomColor: '#E10600',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: { color: '#fff', fontSize: 14 },
  headerText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#666', fontSize: 12, marginTop: 4 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  infoCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 16,
    marginBottom: 16,
  },
  cardFlag: { fontSize: 40, marginBottom: 12 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  cardSubtitle: { color: '#777', fontSize: 13, marginTop: 4 },
  cardDate: { color: '#999', fontSize: 12, marginTop: 8 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  factCard: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 16,
    marginRight: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 16,
    marginRight: 8,
  },
  factLabel: { color: '#777', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 },
  factValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#777', fontSize: 11, textTransform: 'uppercase', marginBottom: 8 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  descriptionCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  descriptionText: { color: '#ccc', fontSize: 14, lineHeight: 20 },
});

