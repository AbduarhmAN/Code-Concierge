import cache from 'memory-cache';

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export default {
  get: (key) => cache.get(key),
  put: (key, value, duration = CACHE_DURATION) => cache.put(key, value, duration),
  del: (key) => cache.del(key),
  clear: () => cache.clear()
};