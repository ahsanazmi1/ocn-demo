import { NextRequest, NextResponse } from 'next/server';

// Agent service mappings
const AGENT_SERVICES = {
  orca: 'http://localhost:8080',
  okra: 'http://localhost:8083',
  opal: 'http://localhost:8084',
  onyx: 'http://localhost:8086',
  olive: 'http://localhost:8087',
  weave: 'http://localhost:8082',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const { path } = params;
    
    console.log('Proxy request:', { path, method });
    
    if (!path || path.length < 2) {
      return NextResponse.json(
        { error: 'Invalid path. Expected format: /api/gateway/proxy/{agent}/{endpoint}' },
        { status: 400 }
      );
    }

    const [agent, ...endpointPath] = path;
    const agentUrl = AGENT_SERVICES[agent as keyof typeof AGENT_SERVICES];

    if (!agentUrl) {
      return NextResponse.json(
        { error: `Unknown agent: ${agent}` },
        { status: 404 }
      );
    }

    const endpoint = endpointPath.join('/');
    const targetUrl = `${agentUrl}/${endpoint}`;
    
    console.log('Target URL:', targetUrl);

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-ocn-trace-id': `trace-${Date.now()}`,
    };

    // Copy relevant headers from the original request
    const forwardHeaders = ['authorization', 'user-agent'];
    forwardHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        headers[header] = value;
      }
    });

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.text();
        if (body) {
          requestOptions.body = body;
        }
      } catch (error) {
        // No body
      }
    }

    // Add query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const finalUrl = searchParams ? `${targetUrl}?${searchParams}` : targetUrl;

    console.log(`Proxying ${method} ${finalUrl}`);

    const response = await fetch(finalUrl, requestOptions);

    if (!response.ok) {
      console.error(`Agent ${agent} responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Gateway proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Gateway proxy failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
