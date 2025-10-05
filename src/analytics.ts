import posthog from 'posthog-js';

export type Traits = Record<string, string | number | boolean | null>;
export type Props  = Record<string, string | number | boolean | null>;

export interface PostHogInsight {
  id: string;
  name: string;
  filters: any;
  query: any;
  result: any;
}

export interface AnalyticsMetrics {
  totalPageViews: number;
  uniqueUsers: number;
  totalEvents: number;
  adminDashboardViews: number;
  loginSuccesses: number;
  siteEntries: number;
  topReferrers: Array<{ domain: string; count: number }>;
  topUtmSources: Array<{ source: string; count: number }>;
  recentEntries: Array<{
    timestamp: string;
    referrer: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
    entry_page: string;
  }>;
}

class Analytics {
  private ready = false;

  init(key: string, apiHost?: string) {
    if (this.ready) return;
    console.log('🚀 PostHog: Initializing with key:', key.substring(0, 10) + '...', 'host:', apiHost || 'auto');

    try {
      // More aggressive disabling to prevent CORS issues
      posthog.init(key, {
        api_host: apiHost,
        capture_pageview: false,
        capture_pageleave: false, // Disable to reduce requests
        persistence: 'localStorage+cookie',
        autocapture: false, // Disable autocapture to prevent external requests
        disable_surveys: true,
        disable_session_recording: true,
        // Disable all external features
        advanced_disable_decide: true, // This should prevent most external requests
        loaded: (posthog) => {
          console.log('📊 PostHog loaded successfully');
        },
      });
      this.ready = true;
      console.log('✅ PostHog: Initialized successfully');
    } catch (error) {
      console.error('❌ PostHog initialization failed:', error);
      // Continue without PostHog rather than breaking the app
      this.ready = false;
    }
  }

  identify(userId: string, traits?: Traits) {
    if (!this.ready) return;
    posthog.identify(userId, traits);
  }

  group(type: string, id: string, traits?: Traits) {
    if (!this.ready) return;
    posthog.group(type, id, traits);
  }

  track(event: string, props?: Props) {
    if (!this.ready) return;
    posthog.capture(event, props);
  }

  page(name?: string, props?: Props) {
    if (!this.ready) return;
    posthog.capture('App Page Viewed', { page_name: name ?? document.title, ...props });
  }

  trackEntry() {
    if (!this.ready) return;

    // Only track entry once per session
    if (sessionStorage.getItem('entry_tracked')) return;
    sessionStorage.setItem('entry_tracked', 'true');

    const urlParams = new URLSearchParams(window.location.search);
    const entryProps: Props = {
      $referrer: document.referrer || null,
      $referring_domain: document.referrer ? new URL(document.referrer).hostname : null,
      $current_url: window.location.href,
      $pathname: window.location.pathname,
      $search: window.location.search,
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content'),
      entry_page: window.location.pathname,
    };

    posthog.capture('$pageview', entryProps);
  }

  isFeatureEnabled(flag: string) {
    if (!this.ready) return false;
    return !!posthog.isFeatureEnabled(flag);
  }

  getVariant(flag: string) {
    if (!this.ready) return null;
    const v = posthog.getFeatureFlag(flag);
    return typeof v === 'string' ? v : null;
  }

  reset() {
    if (!this.ready) return;
    posthog.reset();
  }

  // PostHog API methods for fetching analytics data
  async fetchInsights(): Promise<AnalyticsMetrics> {
    console.log('🔍 Fetching analytics via Supabase Edge Function...');

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const { envValidator } = await import('./lib/env');
      const { url, anonKey } = envValidator.getSupabaseConfig();

      const supabase = createClient(url, anonKey);

      const { data, error } = await supabase.functions.invoke('get-analytics');

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('✅ PostHog metrics loaded via Supabase:', data);

      return data as AnalyticsMetrics;
    } catch (error) {
      console.error('Error fetching analytics via Supabase:', error);
      return {
        totalPageViews: 0,
        uniqueUsers: 0,
        totalEvents: 0,
        adminDashboardViews: 0,
        loginSuccesses: 0,
        siteEntries: 0,
        topReferrers: [],
        topUtmSources: [],
        recentEntries: [],
      };
    }
  }
}

export const analytics = new Analytics();