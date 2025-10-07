import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:8090/status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gateway responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch agent status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch agent status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}








