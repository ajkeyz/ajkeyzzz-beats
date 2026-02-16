// Environment variable validation — fail fast if misconfigured
const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  SITE_URL: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
};

// In dev mode, we allow missing keys and use localStorage fallback
export const isSupabaseConfigured = Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
export const isStripeConfigured = Boolean(env.STRIPE_PUBLISHABLE_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    '[AJKEYZZZ] Supabase not configured — running in local/demo mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable backend.'
  );
}

export default env;
