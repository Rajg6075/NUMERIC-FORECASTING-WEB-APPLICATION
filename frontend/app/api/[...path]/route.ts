import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${pathString}${searchParams ? `?${searchParams}` : ''}`;

  const headers: HeadersInit = {};
  
  // Forward relevant headers
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  headers['Content-Type'] = request.headers.get('content-type') || 'application/json';

  const options: RequestInit = {
    method,
    headers,
  };

  // Forward body for POST/PUT
  if (method === 'POST' || method === 'PUT') {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      options.body = await request.text();
    } else {
      options.body = await request.text();
      headers['Content-Type'] = contentType || 'application/json';
    }
  }

  try {
    const response = await fetch(url, options);
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: `Proxy error: ${error.message}` },
      { status: 500 }
    );
  }
}
