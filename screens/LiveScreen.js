import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TEAM_COLORS, YEAR } from '../constants';

const TYRE_COLORS = {
  SOFT: '#E8002D',
  MEDIUM: '#FFF200',
  HARD: '#B5B5B5',
  INTERMEDIATE: '#39B54A',
  WET: '#0067FF',
  UNKNOWN: '#888',
};
const TYRE_SHORT = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
  UNKNOWN: '?',
};

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🏁';
  return countryCode
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(0x1F1E0 - 65 + c.charCodeAt(0)));
}

function formatLapTime(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3);
  return m > 0 ? `${m}:${s.padStart(6, '0')}` : s;
}

export default function LiveScreen() {
  const [session, setSession] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [intervals, setIntervals] = useState({});
  const [stints, setStints] = useState({});
  const [nextRace, setNextRace] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [raceControlMsgs, setRaceControlMsgs] = useState([]);
  const [bestLaps, setBestLaps] = useState({});
  const [totalLaps, setTotalLaps] = useState(0);

  const OF1 = 'https://api.openf1.org/v1';

  async function fetchLatestSession() {
    const res = await fetch(`${OF1}/sessions?year=${YEAR}`);
    const data = await res.json();
    if (!data.length) return null;
    data.sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
    return data[0];
  }
  async function fetchDrivers(sessionKey) {
    const res = await fetch(`${OF1}/drivers?session_key=${sessionKey}`);
    return res.json();
  }
  async function fetchPositions(sessionKey) {
    const res = await fetch(`${OF1}/position?session_key=${sessionKey}`);
    const data = await res.json();
    const latest = {};
    data.forEach(p => {
      if (!latest[p.driver_number] || new Date(p.date) > new Date(latest[p.driver_number].date))
        latest[p.driver_number] = p;
    });
    return Object.values(latest);
  }
  async function fetchIntervals(sessionKey) {
    try {
      const res = await fetch(`${OF1}/intervals?session_key=${sessionKey}`);
      const data = await res.json();
      const latest = {};
      data.forEach(i => {
        if (!latest[i.driver_number] || new Date(i.date) > new Date(latest[i.driver_number].date))
          latest[i.driver_number] = i;
      });
      return latest;
    } catch {
      return {};
    }
  }
  async function fetchStints(sessionKey) {
    try {
      const res = await fetch(`${OF1}/stints?session_key=${sessionKey}`);
      const data = await res.json();
      const latest = {};
      data.forEach(s => {
        if (!latest[s.driver_number] || s.stint_number > latest[s.driver_number].stint_number)
          latest[s.driver_number] = s;
      });
      return latest;
    } catch {
      return {};
    }
  }
  async function fetchRaceControl(sessionKey) {
    try {
      const res = await fetch(`${OF1}/race_control?session_key=${sessionKey}`);
      const data = await res.json();
      return data.slice(-5).reverse();
    } catch {
      return [];
    }
  }
  async function fetchLaps(sessionKey) {
    try {
      const res = await fetch(`${OF1}/laps?session_key=${sessionKey}`);
      const data = await res.json();
      const best = {};
      let maxLap = 0;
      data.forEach(lap => {
        if (lap.lap_number > maxLap) maxLap = lap.lap_number;
        if (lap.lap_duration != null) {
          if (best[lap.driver_number] == null || lap.lap_duration < best[lap.driver_number])
            best[lap.driver_number] = lap.lap_duration;
        }
      });
      const formatted = {};
      Object.entries(best).forEach(([num, dur]) => {
        formatted[num] = formatLapTime(dur);
      });
      return { bestLaps: formatted, totalLaps: maxLap };
    } catch {
      return { bestLaps: {}, totalLaps: 0 };
    }
  }
  async function fetchNextRace() {
    const res = await fetch(`https://api.jolpi.ca/ergast/f1/${YEAR}.json`);
    const data = await res.json();
    const races = data.MRData.RaceTable.Races;
    return races.find(r => new Date(r.date) >= new Date()) || null;
  }

  async function loadData() {
    try {
      const [sess, nr] = await Promise.all([fetchLatestSession(), fetchNextRace()]);
      setNextRace(nr);
      if (!sess) {
        setLoading(false);
        return;
      }
      setSession(sess);
      const [drvs, pos, ivs, stn, rc, lapsData] = await Promise.all([
        fetchDrivers(sess.session_key),
        fetchPositions(sess.session_key),
        fetchIntervals(sess.session_key),
        fetchStints(sess.session_key),
        fetchRaceControl(sess.session_key),
        fetchLaps(sess.session_key),
      ]);
      setDrivers(drvs);
      setPositions(pos.sort((a, b) => a.position - b.position));
      setIntervals(ivs);
      setStints(stn);
      setRaceControlMsgs(rc);
      setBestLaps(lapsData.bestLaps);
      setTotalLaps(lapsData.totalLaps);
      setLastUpdated(new Date());
    } catch (e) {
      console.warn('Live fetch error', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function tick() {
      if (!nextRace) return;
      const diff = new Date(nextRace.date + 'T00:00:00') - new Date();
      if (diff <= 0) {
        setCountdown('Race weekend started!');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    }
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [nextRace]);

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 30000);
    return () => clearInterval(t);
  }, []);

  const isLive = session
    ? new Date() >= new Date(session.date_start) && new Date() <= new Date(session.date_end)
    : false;

  const driverMap = {};
  drivers.forEach(d => {
    driverMap[d.driver_number] = d;
  });

  const rows = positions.map(p => {
    const d = driverMap[p.driver_number] || {};
    const teamColor = TEAM_COLORS[d.team_name] || '#888';
    const ivEntry = intervals[p.driver_number];
    const stintEntry = stints[p.driver_number];
    const tyre = stintEntry?.compound || 'UNKNOWN';
    const tyreLaps = stintEntry && totalLaps > 0 ? totalLaps - stintEntry.lap_start + 1 : null;
    let gap = '—';
    if (ivEntry) {
      gap = p.position === 1 ? 'LEADER'
        : (ivEntry.interval != null ? `+${Number(ivEntry.interval).toFixed(3)}` : '—');
    }
    return {
      ...p,
      d,
      teamColor,
      gap,
      tyre,
      tyreLaps,
      bestLap: bestLaps[p.driver_number] || '—',
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>F1 Buddy</Text>
        <Text style={styles.headerSub}>{isLive ? '🔴 LIVE' : session ? 'Last Session' : 'Live'}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#E10600" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {nextRace && (
            <View style={styles.countdownCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.countdownLabel}>NEXT RACE</Text>
                <Text style={styles.countdownRace} numberOfLines={1}>{nextRace.raceName}</Text>
                <Text style={styles.countdownCircuit}>{nextRace.Circuit.circuitName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.countdownTime}>{countdown}</Text>
                <Text style={styles.countdownDate}>{nextRace.date}</Text>
              </View>
            </View>
          )}
          {session && (
            <View style={styles.sessionBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionName}>
                  {isLive && <Text style={{ color: '#E10600' }}>● </Text>}
                  {session.session_name} · {session.location}
                </Text>
                <Text style={styles.sessionMeta}>Round {session.meeting_key} · {session.country_name}</Text>
              </View>
              {lastUpdated && (
                <Text style={styles.updatedText}>
                  ↻ {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
          )}
          {raceControlMsgs.length > 0 && (
            <View style={styles.rcSection}>
              <Text style={styles.sectionTitle}>RACE CONTROL</Text>
              {raceControlMsgs.map((msg, i) => (
                <View key={i} style={styles.rcRow}>
                  <Text style={[styles.rcFlag, {
                    color: msg.flag === 'RED' ? '#E10600' : msg.flag === 'YELLOW' || msg.flag === 'DOUBLE YELLOW' ? '#FFF200' : msg.flag === 'GREEN' ? '#39B54A' : '#aaa'
                  }]}>
                    {msg.flag === 'RED' ? '🚩' : msg.flag === 'GREEN' ? '🟢' : msg.flag === 'YELLOW' || msg.flag === 'DOUBLE YELLOW' ? '🟡' : msg.flag === 'CHEQUERED' ? '🏁' : '📻'}
                  </Text>
                  <Text style={styles.rcMsg} numberOfLines={2}>{msg.message}</Text>
                </View>
              ))}
            </View>
          )}
          {rows.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>TIMING TOWER</Text>
              <View style={[styles.colHeader, { paddingHorizontal: 12 }]}>
                <Text style={[styles.colText, { width: 24 }]}>P</Text>
                <Text style={[styles.colText, { width: 28 }]}>#</Text>
                <Text style={[styles.colText, { flex: 1 }]}>Driver</Text>
                <Text style={[styles.colText, styles.colRight, { width: 62 }]}>Best</Text>
                <Text style={[styles.colText, styles.colRight, { width: 72 }]}>Gap</Text>
                <Text style={[styles.colText, styles.colRight, { width: 44 }]}>Tyre</Text>
              </View>
              {rows.map((r, i) => (
                <View key={r.driver_number} style={[styles.row, i % 2 === 0 && styles.rowAlt, { paddingHorizontal: 12 }]}>
                  <View style={[styles.colorBar, { backgroundColor: r.teamColor }]} />
                  <Text style={[styles.rank, { width: 24 }]}>{r.position}</Text>
                  <View style={{ width: 26, height: 22, backgroundColor: '#2a2a2a', borderRadius: 3, justifyContent: 'center', alignItems: 'center', marginRight: 6 }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{r.d.driver_number}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.driverName} numberOfLines={1}>
                      {getFlagEmoji(r.d.country_code)} {r.d.name_acronym || `#${r.driver_number}`}
                    </Text>
                    <Text style={[styles.teamName, { color: r.teamColor }]} numberOfLines={1}>{r.d.team_name || '—'}</Text>
                  </View>
                  <Text style={[styles.stat, { width: 62, fontSize: 11 }]}>{r.bestLap}</Text>
                  <Text style={[styles.stat, { width: 72, color: r.position === 1 ? '#E10600' : '#fff', fontSize: 11 }]}>{r.gap}</Text>
                  <View style={{ width: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {r.tyreLaps != null && (
                      <Text style={{ color: '#666', fontSize: 10, marginRight: 4 }}>{r.tyreLaps}</Text>
                    )}
                    <View style={[styles.tyreBadge, { backgroundColor: TYRE_COLORS[r.tyre] || '#888', width: 22 }]}> 
                      <Text style={styles.tyreText}>{TYRE_SHORT[r.tyre] || '?'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 48, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 36 }}>🏎️</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 12, textAlign: 'center' }}>No active session</Text>
              <Text style={{ color: '#555', fontSize: 13, marginTop: 6, textAlign: 'center' }}>Live timing will appear here during race weekends</Text>
            </View>
          )}
          <View style={{ height: 24 }} />
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
  list: { flex: 1 },
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
  sectionTitle: {
    color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1,
    paddingHorizontal: 12, paddingVertical: 6, paddingTop: 12,
  },
  countdownCard: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, padding: 16, backgroundColor: '#1e1e1e',
    borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#E10600',
  },
  countdownLabel: { color: '#E10600', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  countdownRace: { color: '#fff', fontSize: 16, fontWeight: '700' },
  countdownCircuit: { color: '#888', fontSize: 11, marginTop: 2 },
  countdownTime: { color: '#fff', fontSize: 20, fontWeight: '700' },
  countdownDate: { color: '#888', fontSize: 11, marginTop: 4 },
  sessionBanner: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, marginBottom: 8, padding: 12,
    backgroundColor: '#1a1a1a', borderRadius: 8,
  },
  sessionName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  sessionMeta: { color: '#666', fontSize: 11, marginTop: 2 },
  updatedText: { color: '#444', fontSize: 10 },
  rcSection: { marginHorizontal: 12, marginBottom: 4 },
  rcRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5 },
  rcFlag: { fontSize: 14, marginRight: 8, marginTop: 1 },
  rcMsg: { color: '#ccc', fontSize: 12, flex: 1, lineHeight: 18 },
  tyreBadge: { height: 22, borderRadius: 3, justifyContent: 'center', alignItems: 'center' },
  tyreText: { color: '#000', fontSize: 10, fontWeight: '800' },
});
