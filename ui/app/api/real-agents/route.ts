import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 SERVER: Calling gateway for real agent data...');
    
    // Call the gateway from server-side (can access Docker internal network)
    const response = await fetch('http://host.docker.internal:8090/run/demo1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway responded with ${response.status}`);
    }

    const gatewayData = await response.json();
    console.log('🚀 SERVER: Gateway response successful');
    
    return NextResponse.json({
      success: true,
      data: gatewayData
    });
  } catch (error) {
    console.error('🚀 SERVER: Gateway call failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
