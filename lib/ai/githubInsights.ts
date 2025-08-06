'use server'

import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import { GitHubMetrics } from '@/types/agent';

// Define schema for structured output
const githubInsightSchema = z.object({
  summary: z.string(),
  suggestions: z.array(z.string().min(5)).min(1),
});

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY!
})

export async function generateGitHubInsight(metrics: GitHubMetrics): Promise<{
  summary: string;
  suggestions: string[];
}> {
  const prompt = `
Analyze the following GitHub repository metrics and provide a concise summary and actionable suggestions.

Metrics:
- Stars: ${metrics.stars}
- Forks: ${metrics.forks}
- Commits: ${metrics.commits}
- Contributors: ${metrics.contributors}
- Issues: ${metrics.issues}
- Pull Requests: ${metrics.pullRequests}
- Releases: ${metrics.releases}
- Velocity: ${metrics.velocity.toFixed(2)} commits/day

Your response should include a JSON object with:
- summary: A paragraph summarizing the project.
- suggestions: An array of 2–3 concise suggestions.
`;

  try {
    const result = await generateObject({
      model: groq('llama3-8b-8192'),
      schema: githubInsightSchema,
      prompt,
    });

    return result.object;
  } catch (error) {
    console.error('❌ Error generating GitHub insights:', error);
    return {
      summary: 'Unable to generate insight at this time.',
      suggestions: ['Try again later.'],
    };
  }
}
