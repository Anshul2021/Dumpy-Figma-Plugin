// Dumpy Web App Configuration
// Configured with your Supabase Project credentials.

const DUMPY_CONFIG = {
  // Your Supabase Project URL
  DEFAULT_SUPABASE_URL: window.DEFAULT_SUPABASE_URL || 'https://nivrnksfmkskmjdjzvzb.supabase.co',

  // Your Supabase Anon Public Key (safe for client-side use with RLS enabled)
  DEFAULT_SUPABASE_KEY: window.DEFAULT_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdnJua3NmbWtza21qZGp6dnpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxODA1NzMsImV4cCI6MjEwNTc1NjU3M30.UycIKgNMXCtoMVkrqfEbia5g2o_c6edwp1iwtIcTIO4',

  // Default Storage Bucket Name
  STORAGE_BUCKET: 'dumpy-screenshots',

  // Maximum allowed file size before client-side alert (50MB)
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024
};

// Safe storage helper to prevent iframe/browser DOMException crashes
const safeStorage = {
  getItem: function(key) {
    try { return window.localStorage ? window.localStorage.getItem(key) : null; } catch(e) { return null; }
  },
  setItem: function(key, val) {
    try { if (window.localStorage) window.localStorage.setItem(key, val); } catch(e) {}
  },
  removeItem: function(key) {
    try { if (window.localStorage) window.localStorage.removeItem(key); } catch(e) {}
  }
};

// Helper to retrieve active credentials (safeStorage override > default config)
function getSupabaseConfig() {
  const customUrl = safeStorage.getItem('dumpy_custom_supabase_url');
  const customKey = safeStorage.getItem('dumpy_custom_supabase_key');

  return {
    url: (customUrl || DUMPY_CONFIG.DEFAULT_SUPABASE_URL).replace(/\/$/, ''),
    key: customKey || DUMPY_CONFIG.DEFAULT_SUPABASE_KEY,
    bucket: DUMPY_CONFIG.STORAGE_BUCKET
  };
}

// Helper to persist credentials
function saveSupabaseConfig(url, key) {
  if (url) safeStorage.setItem('dumpy_custom_supabase_url', url.trim().replace(/\/$/, ''));
  if (key) safeStorage.setItem('dumpy_custom_supabase_key', key.trim());
}

// Export to global scope
window.safeStorage = safeStorage;
window.DUMPY_CONFIG = DUMPY_CONFIG;
window.getSupabaseConfig = getSupabaseConfig;
window.saveSupabaseConfig = saveSupabaseConfig;
