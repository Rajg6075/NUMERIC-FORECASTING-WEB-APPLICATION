import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params.then(p => p.path), 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params.then(p => p.path), 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params.then(p => p.path), 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params.then(p => p.path), 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/api/admin/${pathString}${searchParams ? `?${searchParams}` : ''}`;

  const headers: HeadersInit = {};
  const authHeader = request.headers.get('authorization');
  if (authHeader) headers['Authorization'] = authHeader;
  headers['Content-Type'] = request.headers.get('content-type') || 'application/json';

  const options: RequestInit = { method, headers };

  if (method === 'POST' || method === 'PUT') {
    options.body = await request.text();
  }

  try {
    const response = await fetch(url, options);
    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
