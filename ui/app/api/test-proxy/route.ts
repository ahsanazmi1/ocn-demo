import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:8080/health');
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data,
      status: response.status
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}








