interface CreateTaskPayload {
  title: string
  description?: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
}

interface CreateTaskResponse {
  success: boolean
  task?: any
  error?: string
}

export async function createTaskFromEmail(payload: CreateTaskPayload): Promise<CreateTaskResponse> {
  try {
    const response = await fetch('/.netlify/functions/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create task',
      }
    }

    return data
  } catch (err) {
    console.error('Error calling createTask function:', err)
    return {
      success: false,
      error: String(err),
    }
  }
}
