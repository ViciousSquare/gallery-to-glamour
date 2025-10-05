import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import DOMPurify from 'https://esm.sh/isomorphic-dompurify@2.16.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Rate limiting: 5 submissions per hour per IP
    const clientIP = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown'

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseClient
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo)
      .eq('ip_address', clientIP)

    if (count && count >= 5) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Maximum 5 submissions per hour allowed.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const submission = await req.json()

    // Input validation and sanitization
    const sanitizedSubmission = {
      first_name: DOMPurify.sanitize(submission.firstName?.trim() || ''),
      last_name: DOMPurify.sanitize(submission.lastName?.trim() || ''),
      email: submission.email?.trim().toLowerCase() || '',
      company: DOMPurify.sanitize(submission.company?.trim() || null),
      role: DOMPurify.sanitize(submission.role?.trim() || null),
      interest_area: DOMPurify.sanitize(submission.interestArea?.trim() || null),
      goals: DOMPurify.sanitize(submission.goals?.trim() || null),
      ip_address: clientIP,
      user_agent: req.headers.get('user-agent') || 'unknown'
    }

    // Basic validation
    if (!sanitizedSubmission.first_name || !sanitizedSubmission.last_name ||
        !sanitizedSubmission.email) {
      return new Response(JSON.stringify({
        error: 'First name, last name, and email are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedSubmission.email)) {
      return new Response(JSON.stringify({
        error: 'Invalid email format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Insert the submission
    const { data, error } = await supabaseClient
      .from('contact_submissions')
      .insert([sanitizedSubmission])
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({
        error: 'Failed to save submission'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log successful submission
    console.log(`Contact submission from ${sanitizedSubmission.email} (${clientIP})`)

    return new Response(JSON.stringify({
      message: 'Submission received successfully',
      id: data[0].id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Contact submission error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})