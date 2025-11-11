'use server';

import { getCookie } from '@/lib/cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Upload an image file to S3 via the backend API
 * @param file - File object to upload
 * @returns URL of the uploaded image or error
 */
export const uploadImage = async (
  file: File,
): Promise<
  | { url: string; error: null }
  | { url: null; error: string }
> => {
  try {
    const token = await getCookie('auth_token');

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message ||
        errorData.error ||
        `Upload failed with status ${response.status}`;

      if (process.env.NODE_ENV === 'development') {
        console.error('Upload Error:', {
          status: response.status,
          errorData,
        });
      }

      return {
        url: null,
        error: Array.isArray(errorMessage)
          ? errorMessage.join(', ')
          : errorMessage,
      };
    }

    const data: { url: string } = await response.json();

    if (process.env.NODE_ENV === 'development') {
      console.debug('Upload Success:', data);
    }

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      url: null,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
};
