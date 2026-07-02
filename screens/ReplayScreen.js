import { View, Text, StyleSheet } from 'react-native';

export default function ReplayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Replay</Text>
      <Text style={styles.subtitle}>Replay highlights and session reviews will be added here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { color: '#aaa', fontSize: 14, textAlign: 'center' },
});
