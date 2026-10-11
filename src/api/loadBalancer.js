/**
 * Intelligent Multi-Backend Failover & Warm Instance Manager
 * 
 * Features:
 * - Sticky active backend: Keeps requests on the warm node to avoid serverless cold starts.
 * - Automatic circuit breaker & failover: Switches immediately if active node encounters network error or 5xx.
 * - Seamless request retry on alternative healthy nodes.
 */

// Parse backend URLs from environment (comma-separated or single)
const rawUrls = import.meta.env.VITE_API_URLS || import.meta.env.VITE_API_URL || '';

const defaultBackends = [
  'https://asher-jobs-backend-tn34.vercel.app/api',
  'https://asher-jobs-backend.vercel.app/api',
  'https://asher-jobs-backend-dtgr.vercel.app/api'
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
let activeIndex = 0;

/**
 * Returns the sticky healthy backend URL (avoids serverless cold starts).
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

  // If the current active node is healthy, STICK TO IT (keeps serverless container warm)
  if (backendNodes[activeIndex] && backendNodes[activeIndex].healthy) {
    return backendNodes[activeIndex].url;
  }

  // Active node is not healthy, switch to the first available healthy node
  const healthyIndex = backendNodes.findIndex((n) => n.healthy);
  if (healthyIndex !== -1) {
    activeIndex = healthyIndex;
    return backendNodes[activeIndex].url;
  }

  // Fallback to primary node
  return backendNodes[0].url;
}

/**
 * Marks a backend URL as having succeeded.
 */
export function markBackendSuccess(baseUrl) {
  const nodeIndex = backendNodes.findIndex((n) => baseUrl.startsWith(n.url));
  if (nodeIndex !== -1) {
    const node = backendNodes[nodeIndex];
    node.healthy = true;
    node.consecutiveFailures = 0;
    activeIndex = nodeIndex;
  }
}

/**
 * Marks a backend URL as having failed.
 */
export function markBackendFailure(baseUrl) {
  const nodeIndex = backendNodes.findIndex((n) => baseUrl.startsWith(n.url));
  if (nodeIndex !== -1) {
    const node = backendNodes[nodeIndex];
    node.consecutiveFailures += 1;
    node.lastFailureTime = Date.now();
    node.healthy = false;
    console.warn(`[LoadBalancer] Backend node ${node.url} failed. Failover in progress...`);

    // Immediately switch active index to a healthy alternative
    const nextHealthy = backendNodes.findIndex((n, idx) => idx !== nodeIndex && n.healthy);
    if (nextHealthy !== -1) {
      activeIndex = nextHealthy;
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
    return available[0].url;
  }
  return null;
}
