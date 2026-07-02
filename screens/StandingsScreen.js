import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { TEAM_COLORS, FLAGS, YEAR } from '../constants';

export default function StandingsScreen({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [driverPodiums, setDriverPodiums] = useState({});
  const [constructorPodiums, setConstructorPodiums] = useState({});
  const [chartData, setChartData] = useState({});
  const [chartDrivers, setChartDrivers] = useState([]);
  const [numRounds, setNumRounds] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('drivers');

  useEffect(() => {
    Promise.all([
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/driverStandings.json`).then(r => r.json()),
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/constructorStandings.json`).then(r => r.json()),
      fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}/results.json?limit=500`).then(r => r.json()),
    ])
      .then(([driverData, constructorData, resultsData]) => {
        const standings = driverData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        setDrivers(standings);
        setConstructors(constructorData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings);

        const driverPod = {};
        const constructorPod = {};
        const races = [...resultsData.MRData.RaceTable.Races].sort((a, b) => +a.round - +b.round);
        const roundCount = races.length;
        const perRound = {};

        races.forEach((race, idx) => {
          race.Results.forEach(result => {
            if (parseInt(result.position, 10) <= 3) {
              const dId = result.Driver.driverId;
              const cName = result.Constructor.name;
              driverPod[dId] = (driverPod[dId] || 0) + 1;
              constructorPod[cName] = (constructorPod[cName] || 0) + 1;
            }
            const dId = result.Driver.driverId;
            if (!perRound[dId]) perRound[dId] = new Array(roundCount).fill(0);
            perRound[dId][idx] = parseFloat(result.points) || 0;
          });
        });

        const cumulative = {};
        Object.entries(perRound).forEach(([dId, rounds]) => {
          let sum = 0;
          cumulative[dId] = rounds.map(pts => { sum += pts; return sum; });
        });

        setChartData(cumulative);
        setNumRounds(roundCount);
        setChartDrivers(standings.slice(0, 5).map(d => ({
          driverId: d.Driver.driverId,
          acronym: d.Driver.code || `${d.Driver.givenName[0]}${d.Driver.familyName.slice(0, 2)}`.toUpperCase(),
          teamColor: TEAM_COLORS[d.Constructors[0].name] || '#888',
        })));
        setDriverPodiums(driverPod);
        setConstructorPodiums(constructorPod);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const CHART_H = 160;
  const pad = { l: 4, r: 4, t: 8, b: 8 };
  const plotW = Math.max(chartWidth - pad.l - pad.r, 1);
  const plotH = CHART_H - pad.t - pad.b;
  const maxPts = Math.max(1, ...chartDrivers.flatMap(d => chartData[d.driverId] || [0]));
  const toX = i => pad.l + (numRounds <= 1 ? plotW / 2 : (i / (numRounds - 1)) * plotW);
  const toY = pts => pad.t + plotH - (pts / maxPts) * plotH;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>F1 Buddy</Text>
        <Text style={styles.headerSub}>{YEAR} Standings</Text>
      </View>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'drivers' && styles.tabBtnActive]} onPress={() => setTab('drivers')}>
          <Text style={[styles.tabLabel, tab === 'drivers' && styles.tabLabelActive]}>Drivers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'constructors' && styles.tabBtnActive]} onPress={() => setTab('constructors')}>
          <Text style={[styles.tabLabel, tab === 'constructors' && styles.tabLabelActive]}>Constructors</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          {tab === 'drivers' && chartDrivers.length > 0 && numRounds > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Championship Battle</Text>
              <View style={{ height: CHART_H, width: '100%' }} onLayout={e => setChartWidth(e.nativeEvent.layout.width)}>
                {chartWidth > 0 && (
                  <Svg width={chartWidth} height={CHART_H}>
                    {chartDrivers.map(d => {
                      const series = chartData[d.driverId] || [];
                      const points = series.map((pts, i) => `${toX(i)},${toY(pts)}`).join(' ');
                      return (
                        <Polyline
                          key={d.driverId}
                          points={points}
                          fill="none"
                          stroke={d.teamColor}
                          strokeWidth={2}
                        />
                      );
                    })}
                    {chartDrivers.map(d => {
                      const series = chartData[d.driverId] || [];
                      return series.map((pts, i) => (
                        <Circle
                          key={`${d.driverId}-${i}`}
                          cx={toX(i)}
                          cy={toY(pts)}
                          r={3}
                          fill={d.teamColor}
                        />
                      ));
                    })}
                  </Svg>
                )}
              </View>
              <View style={styles.legendRow}>
                {chartDrivers.map(d => (
                  <View key={d.driverId} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: d.teamColor }]} />
                    <Text style={styles.legendLabel}>{d.acronym}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View style={styles.colHeader}>
            <Text style={[styles.colText, { width: 36 }]}>Rank</Text>
            <Text style={[styles.colText, { flex: 1 }]}>{tab === 'drivers' ? 'Driver' : 'Constructor'}</Text>
            <Text style={[styles.colText, styles.colRight, { width: 54 }]}>Pts</Text>
            <Text style={[styles.colText, styles.colRight, { width: 42 }]}>Wins</Text>
            <Text style={[styles.colText, styles.colRight, { width: 62 }]}>Podiums</Text>
          </View>
          {tab === 'drivers'
            ? drivers.map((d, i) => {
                const teamName = d.Constructors[0].name;
                const teamColor = TEAM_COLORS[teamName] || '#888';
                const flag = FLAGS[d.Driver.nationality] || '🏁';
                return (
                  <TouchableOpacity
                    key={d.position}
                    onPress={() => navigation.navigate('DriverDetail', {
                      driver: d.Driver,
                      teamName,
                      points: d.points,
                      wins: d.wins,
                      podiums: driverPodiums[d.Driver.driverId] || 0,
                    })}
                    style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
                    <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                    <Text style={[styles.rank, { width: 36 }]}>{d.position}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.driverName}>{flag} {d.Driver.givenName[0]}. {d.Driver.familyName}</Text>
                      <Text style={[styles.teamName, { color: teamColor }]}>{teamName}</Text>
                    </View>
                    <Text style={[styles.stat, { width: 54 }]}>{d.points}</Text>
                    <Text style={[styles.stat, { width: 42 }]}>{d.wins}</Text>
                    <Text style={[styles.stat, { width: 62 }]}>{driverPodiums[d.Driver.driverId] || 0}</Text>
                  </TouchableOpacity>
                );
              })
            : constructors.map((c, i) => {
                const teamName = c.Constructor.name;
                const teamColor = TEAM_COLORS[teamName] || '#888';
                return (
                  <View key={c.position} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
                    <View style={[styles.colorBar, { backgroundColor: teamColor }]} />
                    <Text style={[styles.rank, { width: 36 }]}>{c.position}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.driverName}>{teamName}</Text>
                    </View>
                    <Text style={[styles.stat, { width: 54 }]}>{c.points}</Text>
                    <Text style={[styles.stat, { width: 42 }]}>{c.wins}</Text>
                    <Text style={[styles.stat, { width: 62 }]}>{constructorPodiums[teamName] || 0}</Text>
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
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: '#E10600',
  },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#fff', fontSize: 13, fontWeight: '600' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#E10600' },
  tabLabel: { color: '#666', fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },
  list: { flex: 1 },
  chartCard: { backgroundColor: '#1e1e1e', borderRadius: 12, margin: 12, padding: 12 },
  chartTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 6 },
  legendColor: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendLabel: { color: '#aaa', fontSize: 11, fontWeight: '600' },
  colHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  colText: { color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  colRight: { textAlign: 'right' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1e1e1e',
  },
  rowAlt: { backgroundColor: '#161616' },
  colorBar: { width: 3, height: 36, borderRadius: 2, marginRight: 12 },
  rank: { color: '#888', fontSize: 13, fontWeight: '600' },
  driverName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  teamName: { color: '#666', fontSize: 11, marginTop: 2 },
  stat: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'right' },
});
