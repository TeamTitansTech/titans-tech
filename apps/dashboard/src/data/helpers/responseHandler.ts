import { BackendErrorResponse, formatErrors } from './errorFormatter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function responseHandler<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    tags?: string[];
    cache?: RequestCache;
  },
): Promise<
  | { data: T; errors: null; rawErrors: null; status: number }
  | { data: null; errors: string[]; rawErrors: BackendErrorResponse; status: number }
> {
  try {
    const {
      body: requestBody,
      headers: customHeaders,
      method = 'GET',
      tags,
      cache,
    } = options || {};

    const isServer = typeof window === 'undefined';

    const headers: Record<string, string> = {
      ...customHeaders,
    };

    if (requestBody && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    let url: string;

    if (isServer) {
      // Server-side: call backend directly with auth token from cookies
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      url = `${API_BASE_URL}${path}`;
    } else {
      // Client-side: route through /api/proxy (handles auth cookie)
      url = `/api/proxy${path}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    };

    // Next.js cache options only work on the server
    if (isServer) {
      if (tags) {
        (fetchOptions as RequestInit & { next?: { tags: string[] } }).next = { tags };
      }
      if (cache) {
        fetchOptions.cache = cache;
      }
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', `${method} -- ${path}`, {
          status: response.status,
          errorData,
        });
      }

      // Handle 401 Unauthorized
      if (response.status === 401 && isServer) {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        cookieStore.delete('auth_token');
      }

      const formattedErrors = formatErrors(errorData);

      if (formattedErrors.length > 0) {
        return {
          data: null,
          errors: formattedErrors,
          rawErrors: errorData,
          status: response.status,
        };
      }

      return {
        data: null,
        errors: [`Error ${response.status}: ${response.statusText}`],
        rawErrors: errorData,
        status: response.status,
      };
    }

    let data: T;
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType?.includes('application/json')) {
      data = null as T;
    } else {
      data = await response.json();
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug('API Response Data:', `${method} -- ${path}`, data);
    }
    return { data, errors: null, rawErrors: null, status: response.status };
  } catch (error) {
    console.error('Error connecting to API', error);
    return {
      data: null,
      errors: ['Connection error'],
      rawErrors: error as BackendErrorResponse,
      status: 0,
    };
  }
}
