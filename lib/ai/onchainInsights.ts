'use server'

// lib/ai/onchainInsights.ts
import { generateObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import { OnchainMetrics } from '@/types/agent'

const onchainInsightSchema = z.object({
  summary: z.string(),
  outlook: z.enum(['bullish', 'bearish', 'neutral']),
  keySignals: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high']),
  reason: z.string()
})

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY!
})


export async function generateOnchainInsight(metrics: OnchainMetrics): Promise<z.infer<typeof onchainInsightSchema>> {
  const prompt = `
Analyze the following onchain token metrics and generate insights.

Metrics:
- Transactions: ${metrics.transactions}
- Unique Addresses: ${metrics.uniqueAddresses}
- Volume: ${metrics.volume}
- Liquidity: ${metrics.liquidity}
- Holders: ${metrics.holders}
- Transfers: ${metrics.transferCount}

Your output should include:
- summary
- outlook (bullish, bearish, neutral)
- keySignals (array of noteworthy signals)
- riskLevel (low, medium, high)
- reason (a short justification)
`
  const result = await generateObject({
    model: groq('llama3-8b-8192'),
    schema: onchainInsightSchema,
    prompt
  })

  return result.object
}
