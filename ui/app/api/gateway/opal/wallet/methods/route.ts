import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const actorId = url.searchParams.get('actor_id') || 'demo_actor';
    
    // Call the gateway's demo endpoint and extract Opal data
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
    
    // Extract Opal methods and selection from the full demo response
    const opalData = {
      methods: fullDemoData.opal?.methods || [],
      selection: fullDemoData.opal?.selection || { allowed: true }
    };
    
    return NextResponse.json(opalData);
  } catch (error) {
    console.error('Opal wallet methods error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

