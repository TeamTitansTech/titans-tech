import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check basic application health
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024,
      },
    };

    // Optional: Check if API backend is reachable
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        health.backend = {
          status: response.ok ? 'connected' : 'error',
          statusCode: response.status,
        };
      } catch (error) {
        health.backend = {
          status: 'unreachable',
          error: error.message,
        };
      }
    }

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}

// Handle HEAD requests for lightweight health checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
