import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call the gateway's demo endpoint and extract just the Orca decision
    const response = await fetch('http://ocn-demo-demo1-gateway-1:8090/run/demo1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ocn-trace-id': `trace-${Date.now()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway responded with ${response.status}`);
    }

    const fullDemoData = await response.json();
    
    // Extract just the Orca decision from the full demo response
    const orcaData = fullDemoData.orca?.decision || {
      decision: 'REVIEW',
      reasons: ['Demo data extraction failed'],
      meta: { risk_score: 0.5 }
    };
    
    return NextResponse.json(orcaData);
  } catch (error) {
    console.error('Failed to call Orca decision via gateway:', error);
    return NextResponse.json(
      { 
        error: 'Failed to call Orca decision',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

