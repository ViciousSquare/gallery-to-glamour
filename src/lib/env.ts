const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_POSTHOG_KEY',
  'VITE_POSTHOG_HOST',
  'VITE_POSTHOG_PERSONAL_API_KEY',
  'VITE_POSTHOG_PROJECT_ID',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (envVar) => !import.meta.env[envVar]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}