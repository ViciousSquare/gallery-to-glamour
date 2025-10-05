import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    // Rate limiting check (10 per hour - same as draft-introduction)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabaseClient
      .from('draft_introduction_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo)

    if (count && count >= 10) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 10 AI requests per hour.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { editedSubmission, notes, furtherContext } = await req.json()

    // Build context about the submission and notes
    const notesHistory = notes.length > 0
      ? notes.map((note: any) => `${new Date(note.created_at).toLocaleDateString()}: ${note.content}`).join('\n')
      : 'No notes yet'

    const tagsText = editedSubmission.tags && editedSubmission.tags.length > 0
      ? editedSubmission.tags.join(', ')
      : 'No tags'

    const prompt = `You are an AI assistant helping the team at AI for Canadians, a consulting service helping Canadian businesses adopt AI effectively. The team offers coaching, strategy consulting, training programs, and implementation support.

Context about this lead:
- Name: ${editedSubmission.first_name} ${editedSubmission.last_name}
- Email: ${editedSubmission.email}
- Company: ${editedSubmission.company || 'Not provided'}
- Role: ${editedSubmission.role || 'Not provided'}
- Interest Area: ${editedSubmission.interest_area || 'Not provided'}
- Goals: ${editedSubmission.goals || 'Not provided'}
- Current Status: ${editedSubmission.status}
- Tags: ${tagsText}

Notes History (chronological):
${notesHistory}
${furtherContext ? `\nAdditional Context:\n${furtherContext}` : ''}

Based on this lead's history, current state, and the context that AI for Canadians helps Canadian businesses adopt AI through coaching, strategy, training and implementation, what's the single most actionable next step to move them forward in the sales process?

Be specific and practical, not generic. Consider:
- Their expressed interest area and goals
- Their current status and any notes history
- What stage they seem to be in (awareness, consideration, decision)
- Appropriate next actions like: scheduling calls, sending specific resources, following up on timing, proposing next steps

Respond with just 1-2 sentences. Be direct and actionable.

Examples of good responses:
- "Send them the manufacturing AI case study since they mentioned quality control issues, then propose a 30-minute call to discuss their Q2 implementation timeline."
- "Follow up on their January budget discussion from last month - propose a strategy session to outline their Team Training program before year-end."
- "They're ready to move forward - send the coaching package pricing and propose a kickoff call for early February."

Bad responses:
- "Follow up with them."
- "Send them more information."
- "Schedule a call."

Your suggestion:`

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
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
        max_tokens: 200
      })
    })

    const openRouterData = await openRouterResponse.json()

    if (!openRouterResponse.ok) {
      throw new Error(openRouterData.error?.message || 'OpenRouter API error')
    }

    const suggestion = openRouterData.choices[0].message.content
    const estimatedCost = (openRouterData.usage?.total_tokens || 0) * 0.000003 // Rough estimate

    // Log the generation (reusing the same table as draft-introduction for rate limiting)
    await supabaseClient
      .from('draft_introduction_logs')
      .insert({
        user_id: user.id,
        submission_id: editedSubmission.id,
        tokens_used: openRouterData.usage?.total_tokens || 0,
        estimated_cost: estimatedCost
      })

    return new Response(JSON.stringify({ 
      suggestion: suggestion.trim(),
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