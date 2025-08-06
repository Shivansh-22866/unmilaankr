import { NextRequest, NextResponse } from 'next/server';
import { runMomentumAgent } from '@/lib/agents/momentumAgent';
import { AgentContext } from '@/types/agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate and construct context
    const context: AgentContext = {
      project: body.project,
      timeWindow: body.timeWindow ?? 24,
      updateInterval: body.updateInterval ?? 60,
      anomalyThreshold: body.anomalyThreshold ?? 2,
      weights: body.weights
    };

    const result = await runMomentumAgent(context);

    return NextResponse.json({
      status: 'ok',
      ...result
    });
  } catch (error) {
    console.error('Agent execution failed:', error);
    return NextResponse.json({ status: 'error', message: 'Agent failed to run' }, { status: 500 });
  }
}
