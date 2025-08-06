'use server'

import { generateObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

interface MessageStats {
  totalMessages: number
  uniqueUsers: number
  averageLength: number
  topUsers: Array<{ username: string; count: number }>
}

const schema = z.object({
  summary: z.string(),
  engagementLevel: z.enum(['low', 'moderate', 'high']),
  suggestions: z.array(z.string().min(5))
})

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY!
})

export async function generateDiscordInsight(stats: MessageStats): Promise<z.infer<typeof schema>> {
  const prompt = `
Analyze the following Discord community metrics and provide a concise summary, engagement level, and suggestions for improvement.

Metrics:
- Total Messages: ${stats.totalMessages}
- Unique Users: ${stats.uniqueUsers}
- Average Message Length: ${stats.averageLength.toFixed(2)} characters
- Top Contributors: ${stats.topUsers.map(u => `${u.username} (${u.count} msgs)`).join(', ')}

Respond with a JSON object containing:
1. summary: a concise analysis of the community activity.
2. engagementLevel: one of 'low', 'moderate', or 'high'.
3. suggestions: an array of 2-3 recommendations to improve engagement or participation.
`

  const result = await generateObject({
    model: groq('llama3-8b-8192'),
    schema,
    prompt
  })

  return result.object
}
