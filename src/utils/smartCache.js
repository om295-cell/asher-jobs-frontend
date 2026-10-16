/**
 * Smart Memory & Session Cache with Stale-While-Revalidate
 * Speeds up page loads by instantly returning cached data,
 * then refreshing quietly in the background without freezing the UI.
 */

const memoryCache = new Map();

export const smartCache = {
  /**
   * Get cached data if valid
   * @param {string} key
   * @param {number} maxAgeSeconds default 5 minutes
   */
  get: (key, maxAgeSeconds = 300) => {
    try {
      const item = memoryCache.get(key) || JSON.parse(sessionStorage.getItem(`asher_cache_${key}`) || 'null');
      if (!item) return null;
      const ageSeconds = (Date.now() - item.timestamp) / 1000;
      if (ageSeconds > maxAgeSeconds) {
        return { data: item.data, isStale: true };
      }
      return { data: item.data, isStale: false };
    } catch {
      return null;
    }
  },

  /**
   * Store data in cache
   */
  set: (key, data) => {
    try {
      const payload = { data, timestamp: Date.now() };
      memoryCache.set(key, payload);
      sessionStorage.setItem(`asher_cache_${key}`, JSON.stringify(payload));
    } catch {}
  },

  /**
   * Invalidate a specific key
   */
  remove: (key) => {
    memoryCache.delete(key);
    try {
      sessionStorage.removeItem(`asher_cache_${key}`);
    } catch {}
  },

  /**
   * Clear all cached keys
   */
  clear: () => {
    memoryCache.clear();
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('asher_cache_')) sessionStorage.removeItem(k);
      });
    } catch {}
  }
};
