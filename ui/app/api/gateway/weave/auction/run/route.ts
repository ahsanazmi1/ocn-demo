import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call the gateway's demo endpoint and extract Weave data
    const response = await fetch('http://demo1-gateway:8090/run/demo1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway responded with ${response.status}`);
    }

    const fullDemoData = await response.json();
    
    // Extract Weave auction data from the full demo response
    const weaveData = fullDemoData.weave || {
      auction: {
        status: 'completed',
        results: [],
        winner: 'default_processor'
      }
    };
    
    return NextResponse.json(weaveData);
  } catch (error) {
    console.error('Weave auction run error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

