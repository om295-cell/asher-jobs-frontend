/**
 * Intelligent Multi-Backend Load Balancer & Failover Manager
 * 
 * Features:
 * - Round-robin traffic distribution across multiple Vercel backend instances.
 * - Automatic circuit breaker & cooldown for failed backends.
 * - Seamless request retry on alternative healthy nodes.
 */

// Parse backend URLs from environment (comma-separated or single)
const rawUrls = import.meta.env.VITE_API_URLS || import.meta.env.VITE_API_URL || '';

const defaultBackends = [
  'https://asher-jobs-backend.vercel.app/api'
];

export const backendNodes = (rawUrls.trim().length > 0
  ? rawUrls.split(',').map((u) => u.trim().replace(/\/+$/, ''))
  : defaultBackends
).map((url) => ({
  url,
  healthy: true,
  consecutiveFailures: 0,
  lastFailureTime: 0
}));

// Cooldown time before attempting to re-use an unhealthy node (30 seconds)
const COOLDOWN_MS = 30000;
let currentIndex = 0;

/**
 * Returns the next healthy backend URL using round-robin.
 */
export function getNextBackendUrl() {
  if (backendNodes.length === 0) return 'http://localhost:5000/api';
  if (backendNodes.length === 1) return backendNodes[0].url;

  const now = Date.now();

  // Recover nodes whose cooldown period has passed
  backendNodes.forEach((node) => {
    if (!node.healthy && now - node.lastFailureTime > COOLDOWN_MS) {
      node.healthy = true;
      node.consecutiveFailures = 0;
    }
  });

  // Find healthy nodes
  const healthyNodes = backendNodes.filter((n) => n.healthy);
  const candidates = healthyNodes.length > 0 ? healthyNodes : backendNodes;

  currentIndex = (currentIndex + 1) % candidates.length;
  return candidates[currentIndex].url;
}

/**
 * Marks a backend URL as having succeeded.
 */
export function markBackendSuccess(baseUrl) {
  const node = backendNodes.find((n) => baseUrl.startsWith(n.url));
  if (node) {
    node.healthy = true;
    node.consecutiveFailures = 0;
  }
}

/**
 * Marks a backend URL as having failed.
 */
export function markBackendFailure(baseUrl) {
  const node = backendNodes.find((n) => baseUrl.startsWith(n.url));
  if (node) {
    node.consecutiveFailures += 1;
    node.lastFailureTime = Date.now();
    // After 2 consecutive failures or high-severity errors, temporarily disable node
    if (node.consecutiveFailures >= 2) {
      node.healthy = false;
      console.warn(`[LoadBalancer] Backend node ${node.url} temporarily cooled down.`);
    }
  }
}

/**
 * Gets an alternative healthy backend URL different from the failed one.
 */
export function getAlternativeBackend(failedBaseUrl) {
  const now = Date.now();
  const available = backendNodes.filter(
    (n) => !failedBaseUrl.startsWith(n.url) && (n.healthy || now - n.lastFailureTime > COOLDOWN_MS)
  );
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)].url;
  }
  return null;
}
