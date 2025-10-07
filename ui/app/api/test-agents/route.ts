import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const results: any = {};
  
  try {
    // Test Orca
    try {
      const orcaResponse = await fetch('http://demo1-gateway:8090/run/demo1');
      if (orcaResponse.ok) {
        const data = await orcaResponse.json();
        results.orca = { status: 'SUCCESS', hasRealData: !!data.orca?.decision };
        results.gateway = { status: 'SUCCESS', traceId: data.trace_id };
      } else {
        results.orca = { status: 'FAILED', error: `HTTP ${orcaResponse.status}` };
      }
    } catch (error) {
      results.orca = { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      results,
      summary: {
        realAgentsWorking: results.orca?.status === 'SUCCESS',
        fallbackUsed: results.orca?.status === 'FAILED'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}