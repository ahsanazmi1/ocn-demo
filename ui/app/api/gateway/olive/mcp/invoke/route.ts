import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call the gateway's demo endpoint and extract Olive data
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
    
    // Extract Olive incentives data from the full demo response
    const oliveData = fullDemoData.olive?.incentives || {
      success: true,
      data: { incentives: [], count: 0, total_active: 0, categories: [] }
    };
    
    return NextResponse.json(oliveData);
  } catch (error) {
    console.error('Olive MCP invoke error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

