import { deleteCookie, getCookie } from '@/lib/cookies';
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
    const token = await getCookie('auth_token');
    const {
      body: requestBody,
      headers: customHeaders,
      method = 'GET',
      tags,
      cache,
    } = options || {};

    const headers: Record<string, string> = {
      ...customHeaders,
    };

    // Add Content-Type for requests with body
    if (requestBody && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
      next: tags ? { tags } : undefined,
      cache,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', `${method} -- ${path}`, {
          status: response.status,
          errorData,
        });
      }

      // Handle 401 Unauthorized - Redirect to logout
      if (response.status === 401) {
        await deleteCookie('auth_token');
      }

      // Format errors using the error formatter
      const formattedErrors = formatErrors(errorData);

      if (formattedErrors.length > 0) {
        return {
          data: null,
          errors: formattedErrors,
          rawErrors: errorData,
          status: response.status,
        };
      }

      // Fallback error if no formatted errors
      return {
        data: null,
        errors: [`Error ${response.status}: ${response.statusText}`],
        rawErrors: errorData,
        status: response.status,
      };
    }

    // trata a resposta em caso de 204
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
