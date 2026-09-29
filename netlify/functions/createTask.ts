import { createClient } from '@supabase/supabase-js'

interface TaskPayload {
  title: string
  description?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
}

export default async (req: any, context: any) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Check API key
    const apiKey = req.headers['x-api-key']
    const expectedApiKey = process.env.TASK_API_KEY

    if (!apiKey || apiKey !== expectedApiKey) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
      }
    }

    const payload: TaskPayload = JSON.parse(req.body)

    // Validate required fields
    if (!payload.title || payload.title.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title is required' }),
      }
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing Supabase credentials' }),
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the authenticated user (if any)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: No authenticated user' }),
      }
    }

    // Insert the task
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: payload.title.trim(),
      description: payload.description || null,
      due_date: payload.dueDate || null,
      priority: payload.priority || 'medium',
      is_complete: false,
    }).select()

    if (error) {
      console.error('Supabase insert error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create task', details: error.message }),
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ success: true, task: data[0] }),
    }
  } catch (err) {
    console.error('Function error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: String(err) }),
    }
  }
}
