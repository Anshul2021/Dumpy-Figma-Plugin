// Dumpy Web App Configuration
// Pre-configured with your Supabase Project URL.

const DUMPY_CONFIG = {
  // Your Supabase Project URL from dashboard
  DEFAULT_SUPABASE_URL: window.DEFAULT_SUPABASE_URL || 'https://nivrnksfmkskmjdjzvzb.supabase.co',

  // Supabase Anon Public Key (configured in Settings or prefilled)
  DEFAULT_SUPABASE_KEY: window.DEFAULT_SUPABASE_KEY || '',

  // Default Storage Bucket Name
  STORAGE_BUCKET: 'dumpy-screenshots',

  // Maximum allowed file size before client-side alert (50MB)
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024
};

// Helper to retrieve active credentials (localStorage override > default config)
function getSupabaseConfig() {
  const customUrl = localStorage.getItem('dumpy_custom_supabase_url');
  const customKey = localStorage.getItem('dumpy_custom_supabase_key');

  return {
    url: (customUrl || DUMPY_CONFIG.DEFAULT_SUPABASE_URL).replace(/\/$/, ''),
    key: customKey || DUMPY_CONFIG.DEFAULT_SUPABASE_KEY,
    bucket: DUMPY_CONFIG.STORAGE_BUCKET
  };
}

// Helper to persist credentials
function saveSupabaseConfig(url, key) {
  if (url) localStorage.setItem('dumpy_custom_supabase_url', url.trim().replace(/\/$/, ''));
  if (key) localStorage.setItem('dumpy_custom_supabase_key', key.trim());
}

// Export to global scope
window.DUMPY_CONFIG = DUMPY_CONFIG;
window.getSupabaseConfig = getSupabaseConfig;
window.saveSupabaseConfig = saveSupabaseConfig;
