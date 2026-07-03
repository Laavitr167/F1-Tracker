const cache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCached(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    delete cache[key];
    return null;
  }
  return entry.data;
}

export function setCached(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

export function clearCached(key) {
  delete cache[key];
}
