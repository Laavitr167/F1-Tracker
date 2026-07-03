import { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Svg, Line, Polyline, Circle } from 'react-native-svg';
import { TEAM_COLORS, YEAR } from '../constants';

const TOTAL_ROUNDS = 24;
const GRID_CELL_SIZE = 32;
const GRID_CELL_MARGIN = 1;

const getBadgeColor = (result) => {
  if (!result) return '#2a2a2a';
  const status = result.status || '';
  const isDNF = status !== 'Finished' && !/^[+][0-9]+ Lap[s]?$/.test(status);
  if (isDNF) return '#3a1a1a';
  const position = parseInt(result.position, 10);
  if (position === 1) return '#FFD700';
  if (position === 2) return '#C0C0C0';
  if (position === 3) return '#CD7F32';
  if (position >= 4 && position <= 10) return '#1a3a1a';
  return '#2a2a2a';
};

const getDriverAcronym = (driver) => {
  if (driver.code) return driver.code;
  if (driver.familyName) return driver.familyName.slice(0, 3).toUpperCase();
  return 'UNK';
};

async function fetchWithDelay(races) {
  const results = [];
  for (const race of races) {
    const res = await fetch(
      `https://api.jolpi.ca/ergast/f1/${YEAR}/${race.round}/results.json`
    );
    const data = await res.json();
    const raceData = data.MRData.RaceTable.Races[0];
    results.push({
      round: race.round,
      raceName: race.raceName,
      Results: raceData?.Results || [],
      results: raceData?.Results || [],
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.log('Races fetched:', results.length);
  console.log('First race results:', results[0]);
  return results;
}

async function fetchAllResults() {
  const scheduleRes = await fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}.json`);
  const scheduleData = await scheduleRes.json();
  const allRaces = scheduleData.MRData.RaceTable.Races || [];
  const completedRaces = allRaces.filter((race) => {
    const raceDate = new Date(race.date + 'T00:00:00Z');
    return raceDate < new Date();
  });
  const racesToFetch = completedRaces.length > 0 ? completedRaces : allRaces;

  const raceResults = await fetchWithDelay(racesToFetch);
  return raceResults.sort((a, b) => parseInt(a.round, 10) - parseInt(b.round, 10));
}

export default function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState('Championship');
  const [loading, setLoading] = useState(true);
  const [races, setRaces] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetchAllResults()
      .then((allRounds) => {
        setRaces(allRounds);
        setLoading(false);
      })
      .catch(() => {
        setRaces([]);
        setLoading(false);
      });
  }, []);

  const sortedRaces = useMemo(() => [...races], [races]);

  const driverStats = useMemo(() => {
    const drivers = {};
    const rounds = sortedRaces.map((race) => race.round);

    sortedRaces.forEach((race) => {
      race.Results.forEach((result) => {
        const driverId = result.Driver.driverId;
        if (!drivers[driverId]) {
          const constructorName = result.Constructor?.name || '';
          drivers[driverId] = {
            driverId,
            givenName: result.Driver.givenName,
            familyName: result.Driver.familyName,
            code: result.Driver.code,
            constructorName,
            color: TEAM_COLORS[constructorName] || '#888',
            resultsByRound: {},
            cumulativePoints: [],
            totalPoints: 0,
          };
        }
        drivers[driverId].resultsByRound[race.round] = result;
      });
    });

    Object.values(drivers).forEach((driver) => {
      let runningTotal = 0;
      rounds.forEach((round) => {
        const result = driver.resultsByRound[round];
        const points = result ? parseFloat(result.points || 0) : 0;
        runningTotal += points;
        driver.cumulativePoints.push({ round, points: runningTotal });
      });
      driver.totalPoints = driver.cumulativePoints.length
        ? driver.cumulativePoints[driver.cumulativePoints.length - 1].points
        : 0;
    });

    const sortedDrivers = Object.values(drivers).sort((a, b) => b.totalPoints - a.totalPoints);
    return { drivers: sortedDrivers, rounds };
  }, [sortedRaces]);

  const topDrivers = useMemo(() => driverStats.drivers.slice(0, 5), [driverStats.drivers]);
  const roundsCompleted = driverStats.rounds.length;
  const racesRemaining = TOTAL_ROUNDS - roundsCompleted;
  const leader = topDrivers[0] || null;
  const gapToSecond = leader && topDrivers[1] ? leader.totalPoints - topDrivers[1].totalPoints : 0;
  const chartWidth = Dimensions.get('window').width - 32;
  const chartHeight = 200;
  const maxPoints = Math.max(...topDrivers.map((driver) => driver.totalPoints), 10);

  const renderChampionshipChart = () => {
    if (topDrivers.length === 0) {
      return <Text style={styles.infoText}>No championship data available.</Text>;
    }

    return (
      <View>
        <Svg width={chartWidth} height={chartHeight}>
          <Line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#444" strokeWidth="1" />
          <Line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#444" strokeWidth="1" />
          {topDrivers.map((driver) => {
            const points = driver.cumulativePoints.map((item, index) => {
              const x = index * (chartWidth / Math.max(driver.cumulativePoints.length - 1, 1));
              const y = chartHeight - (item.points / maxPoints) * chartHeight;
              return `${x},${y}`;
            });
            return (
              <>
                <Polyline
                  key={`line-${driver.driverId}`}
                  points={points.join(' ')}
                  fill="none"
                  stroke={driver.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {driver.cumulativePoints.map((item, index) => {
                  const x = index * (chartWidth / Math.max(driver.cumulativePoints.length - 1, 1));
                  const y = chartHeight - (item.points / maxPoints) * chartHeight;
                  return <Circle key={`${driver.driverId}-${index}`} cx={x} cy={y} r="3" fill={driver.color} />;
                })}
              </>
            );
          })}
        </Svg>
        <View style={styles.axisLabelsRow}>
          {driverStats.rounds.map((round) => (
            <Text key={round} style={styles.axisLabel}>{round}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {['Championship', 'Race Grid'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.content}>
          {activeTab === 'Championship' ? (
            <View>
              <Text style={styles.sectionTitle}>Championship Battle</Text>
              <View style={styles.chartCard}>{renderChampionshipChart()}</View>
              <View style={styles.legendRow}>
                {topDrivers.map((driver) => (
                  <View key={driver.driverId} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: driver.color }]} />
                    <Text style={styles.legendText}>{getDriverAcronym(driver)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.statsCard}>
                <View style={styles.statsRowCard}>
                  <Text style={styles.statsLabel}>Leader</Text>
                  <Text style={styles.statsValue}>{leader ? `${leader.familyName} ${leader.totalPoints} pts` : '—'}</Text>
                </View>
                <View style={styles.statsRowCard}>
                  <Text style={styles.statsLabel}>Gap P1 to P2</Text>
                  <Text style={styles.statsValue}>{gapToSecond} pts</Text>
                </View>
                <View style={styles.statsRowCard}>
                  <Text style={styles.statsLabel}>Rounds completed</Text>
                  <Text style={styles.statsValue}>{roundsCompleted}</Text>
                </View>
                <View style={styles.statsRowCard}>
                  <Text style={styles.statsLabel}>Races remaining</Text>
                  <Text style={styles.statsValue}>{racesRemaining}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.gridSection}>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.gridHeaderRow}>
                    <View style={styles.gridLeftHeader} />
                    <View style={styles.gridHeaderCells}>
                      {driverStats.rounds.map((round) => (
                        <View key={round} style={styles.gridHeaderCell}>
                          <Text style={styles.gridHeaderText}>{round}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <ScrollView style={styles.gridBody} nestedScrollEnabled>
                    {driverStats.drivers.map((driver) => (
                      <View key={driver.driverId} style={styles.gridRow}>
                        <View style={styles.gridLeftCell}>
                          <View style={[styles.driverColorBar, { backgroundColor: driver.color }]} />
                          <Text style={styles.driverLabel}>{getDriverAcronym(driver)}</Text>
                        </View>
                        <View style={styles.gridRowCells}>
                          {driverStats.rounds.map((round) => {
                            const result = driver.resultsByRound[round];
                            const color = getBadgeColor(result);
                            const display = result && result.position ? result.position : 'DNF';
                            return (
                              <View key={`${driver.driverId}-${round}`} style={[styles.gridCell, { backgroundColor: color }]}>
                                <Text style={styles.gridCellText}>{display}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  tabRow: { flexDirection: 'row', backgroundColor: '#0f0f0f', margin: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1f1f1f' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabButtonActive: { backgroundColor: '#E10600' },
  tabText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#121212' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  chartCard: { backgroundColor: '#0f0f0f', borderRadius: 16, borderWidth: 1, borderColor: '#1f1f1f', padding: 16, marginBottom: 12 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: '#fff', fontSize: 12 },
  statsCard: { backgroundColor: '#0f0f0f', borderRadius: 16, borderWidth: 1, borderColor: '#1f1f1f', padding: 16, marginBottom: 24 },
  statsRowCard: { marginBottom: 12 },
  statsLabel: { color: '#777', fontSize: 12, marginBottom: 4 },
  statsValue: { color: '#fff', fontSize: 14, fontWeight: '700' },
  axisLabelsRow: { flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', marginTop: 8 },
  axisLabel: { color: '#777', fontSize: 10, width: 18, textAlign: 'center' },
  infoText: { color: '#fff', textAlign: 'center', paddingVertical: 16 },
  gridSection: { marginBottom: 24 },
  gridHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  gridLeftHeader: { width: 80, marginRight: 8 },
  gridHeaderCells: { flexDirection: 'row' },
  gridHeaderCell: { width: GRID_CELL_SIZE, height: GRID_CELL_SIZE, margin: GRID_CELL_MARGIN, borderRadius: 3, justifyContent: 'center', alignItems: 'center' },
  gridHeaderText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  gridBody: { maxHeight: 440 },
  gridRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  gridLeftCell: { width: 80, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  driverColorBar: { width: 6, height: 24, borderRadius: 3, marginRight: 8 },
  driverLabel: { color: '#fff', fontSize: 12, fontWeight: '700' },
  gridRowCells: { flexDirection: 'row' },
  gridCell: { width: GRID_CELL_SIZE, height: GRID_CELL_SIZE, borderRadius: 3, margin: GRID_CELL_MARGIN, justifyContent: 'center', alignItems: 'center' },
  gridCellText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
