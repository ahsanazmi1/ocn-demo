import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call the gateway's demo endpoint and extract Okra data
    const response = await fetch('http://demo1-gateway:8090/run/demo1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ocn-trace-id': `trace-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Gateway responded with ${response.status}`);
    }

    const fullDemoData = await response.json();
    
    // Extract Okra BNPL quote from the full demo response
    const okraData = fullDemoData.okra?.bnpl_quote || {
      limit: 500,
      apr: 15.0,
      term_months: 1,
      monthly_payment: 500,
      score: 0.8,
      approved: true
    };
    
    return NextResponse.json(okraData);
  } catch (error) {
    console.error('Failed to call Okra MCP:', error);
    return NextResponse.json(
      { 
        error: 'Failed to call Okra MCP',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

