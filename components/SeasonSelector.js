import { useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function SeasonSelector({ season, onSeasonChange, seasons }) {
  const currentIndex = useMemo(
    () => Math.max(0, seasons.indexOf(season)),
    [season, seasons]
  );

  const prevSeason = currentIndex > 0 ? seasons[currentIndex - 1] : null;
  const nextSeason = currentIndex < seasons.length - 1 ? seasons[currentIndex + 1] : null;

  return (
    <View style={styles.selector}>
      <TouchableOpacity
        disabled={!prevSeason}
        style={[styles.arrowBtn, !prevSeason && styles.disabled]}
        onPress={() => prevSeason && onSeasonChange(prevSeason)}
      >
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>
      <View style={styles.seasonLabel}>
        <Text style={styles.seasonText}>{season}</Text>
      </View>
      <TouchableOpacity
        disabled={!nextSeason}
        style={[styles.arrowBtn, !nextSeason && styles.disabled]}
        onPress={() => nextSeason && onSeasonChange(nextSeason)}
      >
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 16,
  },
  arrowBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  seasonLabel: {
    minWidth: 100,
    alignItems: 'center',
  },
  seasonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.35,
  },
});
