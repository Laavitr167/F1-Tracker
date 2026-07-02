import { View, Text, StyleSheet } from 'react-native';

export default function CircuitsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Circuits</Text>
      <Text style={styles.subtitle}>Race tracks, locations, and circuit details will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { color: '#aaa', fontSize: 14, textAlign: 'center' },
});
