/**
 * Backend error response format
 */
export interface BackendErrorResponse {
  statusCode?: number;
  details?: string[];
  fields?: Record<string, string[]>;
}

/**
 * Formats backend error responses into a consistent array of string error messages
 * @param errorResponse The error response object from the backend API
 * @returns Array of error message strings
 */
export function formatErrors(errorResponse: BackendErrorResponse | string[] | string): string[] {
  if (!errorResponse) return [];

  // Handle when errorResponse is a string
  if (typeof errorResponse === 'string') {
    return [errorResponse];
  }

  // Handle when errorResponse is directly an array of strings
  if (Array.isArray(errorResponse)) {
    return errorResponse;
  }

  const errors: string[] = [];

  // Handle details array: { details: ["error1", "error2"] }
  if (errorResponse.details && Array.isArray(errorResponse.details)) {
    errors.push(...errorResponse.details);
  }

  // Handle field-specific errors: { fields: { field: ["error1"] } }
  if (errorResponse.fields && typeof errorResponse.fields === 'object') {
    Object.entries(errorResponse.fields).forEach(([field, fieldErrors]) => {
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach((error) => {
          errors.push(`${formatFieldName(field)}: ${error}`);
        });
      }
    });
  }

  return errors;
}

/**
 * Formats a field name for display
 * Converts camelCase to Title Case
 */
function formatFieldName(field: string): string {
  const result = field.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}
