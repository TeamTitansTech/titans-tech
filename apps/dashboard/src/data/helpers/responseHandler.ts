/* eslint-disable @typescript-eslint/no-explicit-any */

import { getCookie } from '@/lib/cookies';
import { BackendErrorResponse, formatErrors } from './errorFormatter';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Handle authentication errors by redirecting to logout
 */
async function handleAuthError() {
  console.debug('TODO: Handle auth error - redirecting to logout');
}

export async function responseHandler<T>(
  path: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    tags?: string[];
  },
): Promise<
  | { data: T; errors: null; rawErrors: null }
  | { data: null; errors: string[]; rawErrors: BackendErrorResponse }
> {
  try {
    const token = await getCookie('auth_token');
    const { body: requestBody, headers: customHeaders, method = 'GET', tags } = options || {};

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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', `${method} -- ${path}`, {
          status: response.status,
          errorData,
        });
      }

      // Handle 401 Unauthorized - Invalid or missing token
      if (response.status === 401) {
        await handleAuthError();
        return {
          data: null,
          errors: ['Session expired. Please log in again.'],
          rawErrors: errorData,
        };
      }

      // Format errors using the error formatter
      const formattedErrors = formatErrors(errorData);

      if (formattedErrors.length > 0) {
        return {
          data: null,
          errors: formattedErrors,
          rawErrors: errorData,
        };
      }

      // Fallback error if no formatted errors
      return {
        data: null,
        errors: [`Error ${response.status}: ${response.statusText}`],
        rawErrors: errorData,
      };
    }

    const data = await response.json();
    if (process.env.NODE_ENV === 'development') {
      console.debug('API Response Data:', `${method} -- ${path}`, data);
    }
    return { data, errors: null, rawErrors: null };
  } catch (error) {
    console.error('Error connecting to API', error);
    return {
      data: null,
      errors: ['Connection error'],
      rawErrors: error as BackendErrorResponse,
    };
  }
}
