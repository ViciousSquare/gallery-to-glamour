interface EnvConfig {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_POSTHOG_KEY: string
  VITE_POSTHOG_HOST: string
  VITE_POSTHOG_PERSONAL_API_KEY: string
  VITE_POSTHOG_PROJECT_ID: string
}

class EnvironmentValidator {
  private config: EnvConfig

  constructor() {
    this.config = {
      VITE_SUPABASE_URL: this.getEnvVar('VITE_SUPABASE_URL'),
      VITE_SUPABASE_ANON_KEY: this.getEnvVar('VITE_SUPABASE_ANON_KEY'),
      VITE_POSTHOG_KEY: this.getEnvVar('VITE_POSTHOG_KEY'),
      VITE_POSTHOG_HOST: this.getEnvVar('VITE_POSTHOG_HOST', 'https://us.posthog.com'),
      VITE_POSTHOG_PERSONAL_API_KEY: this.getEnvVar('VITE_POSTHOG_PERSONAL_API_KEY'),
      VITE_POSTHOG_PROJECT_ID: this.getEnvVar('VITE_POSTHOG_PROJECT_ID'),
    }

    this.validateConfig()
  }

  private getEnvVar(key: string, defaultValue?: string): string {
    const value = import.meta.env[key] || defaultValue
    if (!value && !defaultValue) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    return value
  }

  private validateConfig(): void {
    // Validate Supabase URL format
    try {
      new URL(this.config.VITE_SUPABASE_URL)
    } catch {
      throw new Error('VITE_SUPABASE_URL must be a valid URL')
    }

    // Validate Supabase anon key format (basic JWT check)
    if (!this.config.VITE_SUPABASE_ANON_KEY.includes('.')) {
      throw new Error('VITE_SUPABASE_ANON_KEY appears to be invalid')
    }

    // Validate PostHog project ID is numeric
    if (isNaN(Number(this.config.VITE_POSTHOG_PROJECT_ID))) {
      throw new Error('VITE_POSTHOG_PROJECT_ID must be a valid number')
    }

    // Validate PostHog host URL
    try {
      new URL(this.config.VITE_POSTHOG_HOST)
    } catch {
      throw new Error('VITE_POSTHOG_HOST must be a valid URL')
    }
  }

  public getConfig(): EnvConfig {
    return { ...this.config }
  }

  public getSupabaseConfig() {
    return {
      url: this.config.VITE_SUPABASE_URL,
      anonKey: this.config.VITE_SUPABASE_ANON_KEY,
    }
  }

  public getPostHogConfig() {
    return {
      key: this.config.VITE_POSTHOG_KEY,
      host: this.config.VITE_POSTHOG_HOST,
      personalApiKey: this.config.VITE_POSTHOG_PERSONAL_API_KEY,
      projectId: this.config.VITE_POSTHOG_PROJECT_ID,
    }
  }
}

// Create singleton instance
export const envValidator = new EnvironmentValidator()

// Export validated config
export const env = envValidator.getConfig()