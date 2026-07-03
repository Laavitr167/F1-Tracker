import { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

const cards = [
  { title: 'Teams', subtitle: 'Constructor standings', route: 'Teams' },
  { title: 'Analytics', subtitle: 'Championship insights', route: 'Analytics' },
  { title: 'Circuits', subtitle: 'Track facts & locations', route: 'Circuits' },
];

export default function MoreScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Explore additional F1 tools and details.</Text>
      <View style={styles.cardGroup}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={styles.card}
            onPress={() => navigation.navigate(card.route)}>
            <View style={styles.cardStripe} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { padding: 20 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#777', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  cardGroup: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    padding: 16,
  },
  cardStripe: {
    width: 4,
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#E10600',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { color: '#777', fontSize: 12 },
  cardArrow: { color: '#888', fontSize: 24, marginLeft: 12 },
});
