import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Enable CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  // Simple test endpoint
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        message: 'PostHog Analytics Function is working',
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      },
    )
  }

  try {
    const POSTHOG_API_KEY = Deno.env.get('POSTHOG_PERSONAL_API_KEY')
    const POSTHOG_PROJECT_ID = Deno.env.get('POSTHOG_PROJECT_ID')
    const POSTHOG_HOST = Deno.env.get('POSTHOG_HOST') || 'https://us.posthog.com'

    console.log('Edge Function Debug:', {
      hasApiKey: !!POSTHOG_API_KEY,
      projectId: POSTHOG_PROJECT_ID,
      host: POSTHOG_HOST,
    })

    if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
      console.error('Missing PostHog configuration:', {
        hasApiKey: !!POSTHOG_API_KEY,
        hasProjectId: !!POSTHOG_PROJECT_ID,
      })
      throw new Error('Missing PostHog configuration')
    }

    console.log('Fetching analytics from PostHog...')

    // Fetch events from the last 30 days
    const eventsResponse = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/events/?limit=1000&after=-30d`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
      },
    })

    if (!eventsResponse.ok) {
      console.error('PostHog API error:', eventsResponse.status, await eventsResponse.text())
      throw new Error(`PostHog API error: ${eventsResponse.status}`)
    }

    const eventsData = await eventsResponse.json()
    const events = eventsData.results || []

    // Count different event types
    const totalPageViews = events.filter((e: any) => e.event === '$pageview').length
    const adminDashboardViews = events.filter((e: any) => e.event === 'Admin Dashboard Viewed').length
    const loginSuccesses = events.filter((e: any) => e.event === 'Login Succeeded').length
    const siteEntries = events.filter((e: any) => e.event === '$pageview').length

    // Get unique users
    const uniqueUserIds = new Set(events.map((e: any) => e.distinct_id))
    const uniqueUsers = uniqueUserIds.size
    const totalEvents = events.length

    // Analyze $pageview events for referrers and UTM sources
    const siteEntryEvents = events.filter((e: any) => e.event === '$pageview')

    // Count referrers
    const referrerCounts: { [key: string]: number } = {}
    siteEntryEvents.forEach((event: any) => {
      const domain = event.properties?.$referring_domain || 'direct'
      referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
    })

    const topReferrers = Object.entries(referrerCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Count UTM sources
    const utmSourceCounts: { [key: string]: number } = {}
    siteEntryEvents.forEach((event: any) => {
      const source = event.properties?.utm_source || 'none'
      utmSourceCounts[source] = (utmSourceCounts[source] || 0) + 1
    })

    const topUtmSources = Object.entries(utmSourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get recent pageviews with full UTM details
    const recentEntries = siteEntryEvents
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map((event: any) => ({
        timestamp: event.timestamp,
        referrer: event.properties?.$referrer || null,
        utm_source: event.properties?.utm_source || null,
        utm_medium: event.properties?.utm_medium || null,
        utm_campaign: event.properties?.utm_campaign || null,
        utm_term: event.properties?.utm_term || null,
        utm_content: event.properties?.utm_content || null,
        entry_page: event.properties?.entry_page || '/',
      }))

    const metrics = {
      totalPageViews,
      uniqueUsers,
      totalEvents,
      adminDashboardViews,
      loginSuccesses,
      siteEntries,
      topReferrers,
      topUtmSources,
      recentEntries,
    }

    console.log('Analytics metrics:', metrics)

    return new Response(
      JSON.stringify(metrics),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error in get-analytics function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Content-Type': 'application/json',
        },
      },
    )
  }
})