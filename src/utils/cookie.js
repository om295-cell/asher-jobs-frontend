/**
 * Smart Cookie Utility
 * Fast, lightweight, non-blocking cookie management for instant app hydration
 */

export const cookieHelper = {
  /**
   * Set a cookie with optional expiration in days
   */
  set: (name, value, days = 7) => {
    try {
      if (typeof document === 'undefined') return;
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${d.toUTCString()}`;
      // Use SameSite=Lax and path=/ for universal client access
      const isSecure = window.location.protocol === 'https:' ? ';Secure' : '';
      const encoded = encodeURIComponent(typeof value === 'object' ? JSON.stringify(value) : String(value));
      document.cookie = `${name}=${encoded};${expires};path=/;SameSite=Lax${isSecure}`;
    } catch (e) {
      console.warn('[cookieHelper] Failed to set cookie:', name, e);
    }
  },

  /**
   * Get a cookie by name, automatically parsing JSON objects if stored
   */
  get: (name) => {
    try {
      if (typeof document === 'undefined') return null;
      const prefix = `${name}=`;
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(prefix) === 0) {
          const raw = decodeURIComponent(c.substring(prefix.length, c.length));
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Delete a cookie by expiring it in the past
   */
  remove: (name) => {
    try {
      if (typeof document === 'undefined') return;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
    } catch (e) {}
  }
};
