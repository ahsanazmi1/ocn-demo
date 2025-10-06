import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call the gateway's demo endpoint and extract Onyx data
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
    
    // Extract Onyx KYB verification from the full demo response
    const onyxData = fullDemoData.onyx?.kyb_verification || {
      status: 'verified',
      checks: [],
      reason: 'Demo data extraction',
      entity_id: 'demo_entity',
      verified_at: new Date().toISOString()
    };
    
    return NextResponse.json(onyxData);
  } catch (error) {
    console.error('Onyx MCP invoke error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

