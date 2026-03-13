import { BackendErrorResponse, formatErrors } from './errorFormatter';

type ApiResponse<T> =
  | { data: T; errors: null; rawErrors: null; status: number }
  | { data: null; errors: string[]; rawErrors: BackendErrorResponse; status: number };

/**
 * Client-side fetcher that calls the backend API through /api/proxy.
 * Use this instead of server actions for GET requests from client components
 * to avoid the unnecessary Next.js server action overhead.
 */
export async function clientFetcher<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<ApiResponse<T>> {
  try {
    const { body: requestBody, headers: customHeaders, method = 'GET' } = options || {};

    const headers: Record<string, string> = { ...customHeaders };
    if (requestBody && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`/api/proxy${path}`, {
      method,
      headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const formattedErrors = formatErrors(errorData);
      return {
        data: null,
        errors:
          formattedErrors.length > 0
            ? formattedErrors
            : [`Error ${response.status}: ${response.statusText}`],
        rawErrors: errorData,
        status: response.status,
      };
    }

    const data: T = response.status === 204 ? (null as T) : await response.json();
    return { data, errors: null, rawErrors: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      errors: ['Connection error'],
      rawErrors: error as BackendErrorResponse,
      status: 0,
    };
  }
}
