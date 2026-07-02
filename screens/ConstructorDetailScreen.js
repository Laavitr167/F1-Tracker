import { View, Text, StyleSheet } from 'react-native';

export default function ConstructorDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Constructor Detail</Text>
      <Text style={styles.subtitle}>This screen will show constructor season stats and race results.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { color: '#aaa', fontSize: 14, textAlign: 'center' },
});
