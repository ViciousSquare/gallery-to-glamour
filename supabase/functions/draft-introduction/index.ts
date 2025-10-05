import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !openRouterKey) {
      throw new Error('Missing required environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify authentication
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Rate limiting check (10 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseClient
      .from('draft_introduction_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)

    if (count && count >= 10) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 10 drafts per hour.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { submission } = await req.json()

    const prompt = `You are Patrick Farrar, founder of AI for Canadians, a consulting service helping Canadian businesses adopt AI effectively.

Write a warm, personalized introduction email (150-200 words) to ${submission.first_name} ${submission.last_name} based on their contact form submission:

- Email: ${submission.email}
- Company: ${submission.company || 'Not provided'}
- Role: ${submission.role || 'Not provided'}
- Area of Interest: ${submission.interest_area || 'Not provided'}
- Their Goals: ${submission.goals || 'Not provided'}

Email Guidelines:
- Warm, professional, conversational Canadian business tone
- Reference their specific interest area and goals
- Mention that you've helped 500+ Canadians with AI adoption
- Offer a free 30-minute consultation call
- Include a clear call-to-action to book a meeting
- Sign as "Patrick Farrar, Founder - AI for Canadians"
- Do NOT include a subject line, just the email body

Write only the email body, no subject line.`

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aiforcanadians.org',
        'X-Title': 'AI for Canadians Admin'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    const openRouterData = await openRouterResponse.json()

    if (!openRouterResponse.ok) {
      throw new Error(openRouterData.error?.message || 'OpenRouter API error')
    }

    const generatedEmail = openRouterData.choices[0].message.content
    const estimatedCost = (openRouterData.usage?.total_tokens || 0) * 0.000003 // Rough estimate

    // Log the generation
    await supabaseClient
      .from('draft_introduction_logs')
      .insert({
        user_id: user.id,
        submission_id: submission.id,
        tokens_used: openRouterData.usage?.total_tokens || 0,
        estimated_cost: estimatedCost
      })

    return new Response(JSON.stringify({ 
      email: generatedEmail,
      estimatedCost: estimatedCost.toFixed(4)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})