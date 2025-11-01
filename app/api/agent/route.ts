import { NextRequest, NextResponse } from 'next/server';
import { runMomentumAgent } from '@/lib/agents/momentumAgent';
import { AgentContext } from '@/types/agent';
import { X402PaymentHandler } from '@payai/x402-solana/server';

const x402 = new X402PaymentHandler({
  network: 'solana',
  treasuryAddress: "fiJ4qU5eTgdaFZi62haep2u3qweqKarqsLRk4XEX1Vf",
  facilitatorUrl: 'https://facilitator.payai.network',
});

export async function POST(req: NextRequest) {
  console.log("Received request", req);
  try {
    const body = await req.json();
    console.log("Received body", body);

    const paymentHeader = x402.extractPayment(req.headers);
    console.log("Payment header", paymentHeader);

    const paymentRequirements = await x402.createPaymentRequirements({
      price: {
        amount: "1000000000",
        asset: {
          address: "K9uxt28GvfPsQuapLU1rYxY1REAcZ9NMQ3SYwWbcyai",
          decimals: 9,
        }
      },
      network: 'solana',
      config: {
        description: 'Momentum Agent Execution - Signiq',
        resource: `http://localhost:3000/api/agent`,
      }
    });

    if (!paymentHeader) {
      // Return 402 with payment requirements
      const response = x402.create402Response(paymentRequirements);
      console.log("Returning 402 response", response);
      return NextResponse.json(response.body, { status: response.status });
    }

    // 3. Verify payment
    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    console.log("Payment verified", verified);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
    }

    // Validate and construct context
    const context: AgentContext = {
      project: body.project,
      timeWindow: body.timeWindow ?? 24,
      updateInterval: body.updateInterval ?? 60,
      anomalyThreshold: body.anomalyThreshold ?? 2,
      weights: body.weights
    };

    console.log("Agent context", context);

    const result = await runMomentumAgent(context);

    console.log("Agent result", result);

    await x402.settlePayment(paymentHeader, paymentRequirements);

    console.log("Payment settled");

    return NextResponse.json({
      status: 'ok',
      ...result
    });
  } catch (error) {
    console.error('Agent execution failed:', error);
    return NextResponse.json({ status: 'error', message: 'Agent failed to run' }, { status: 500 });
  }
}
