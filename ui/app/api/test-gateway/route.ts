import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 TEST: Testing gateway connection...');
    
    const response = await fetch('http://host.docker.internal:8090/health', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Gateway health check failed with ${response.status}`);
    }

    const healthData = await response.json();
    console.log('🧪 TEST: Gateway health check successful');
    
    return NextResponse.json({
      success: true,
      message: 'Gateway connection successful',
      health: healthData
    });
  } catch (error) {
    console.error('🧪 TEST: Gateway connection failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
