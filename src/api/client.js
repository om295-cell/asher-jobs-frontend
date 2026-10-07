import axios from 'axios';
import {
  getNextBackendUrl,
  markBackendSuccess,
  markBackendFailure,
  getAlternativeBackend
} from './loadBalancer';

const api = axios.create({
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Dynamic Round-Robin Load Balancing & Auth Token
api.interceptors.request.use(
  (config) => {
    // If baseURL is not yet assigned for this request, pick next healthy backend
    if (!config.baseURL || config._useLoadBalancer !== false) {
      config.baseURL = getNextBackendUrl();
    }
    // Attach authorization bearer token if present
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Failover & Retries across distributed backends
api.interceptors.response.use(
  (response) => {
    if (response.config?.baseURL) {
      markBackendSuccess(response.config.baseURL);
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    const currentBaseUrl = config?.baseURL;

    // Detect server failure, timeout, or network unavailability
    const isNetworkOrServerError =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      (error.response.status >= 500 && error.response.status <= 504);

    if (currentBaseUrl) {
      markBackendFailure(currentBaseUrl);
    }

    // Attempt seamless retry on alternative healthy backend instance
    if (config && isNetworkOrServerError && !config._retriedWithAlt) {
      const altBackend = getAlternativeBackend(currentBaseUrl || '');
      if (altBackend) {
        console.warn(
          `[LoadBalancer Failover] Backend ${currentBaseUrl} failed. Retrying request on ${altBackend}...`
        );
        config._retriedWithAlt = true;
        config.baseURL = altBackend;
        config._useLoadBalancer = false;
        return api(config);
      }
    }

    const customMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    error.formattedMessage = customMessage;
    error.errorCode = error.response?.data?.code || 'NETWORK_ERROR';
    return Promise.reject(error);
  }
);

export default api;
