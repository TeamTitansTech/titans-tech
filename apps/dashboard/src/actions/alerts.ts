/**
 * Server Actions for Alert Thresholds
 * Fetch threshold configurations from the backend API
 */

'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get authenticated headers with JWT token from cookies
 */
async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(
  response: Response,
): Promise<{ data: T | null; error: string | null }> {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    return {
      data: null,
      error: `API Error: ${response.status} - ${errorText}`,
    };
  }

  try {
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return { data: null, error: 'Failed to parse response' };
  }
}

/**
 * Get bearing clearance threshold by blueprint ID
 */
export async function getBearingClearanceThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/bearing-clearance/thresholds/blueprint/${blueprintId}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch bearing clearance threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get bearing clearance single hammer threshold by blueprint ID
 */
export async function getBearingClearanceSingleHammerThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/bearing-clearance-single-hammer/thresholds/blueprint/${blueprintId}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch bearing clearance single hammer threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get clutch threshold by blueprint ID
 */
export async function getClutchThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/clutch/thresholds/blueprint/${blueprintId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch clutch threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get slide threshold by blueprint ID
 * @deprecated Use getSlideSingleHammerThresholdByBlueprint or getSlideDoubleHammerThresholdByBlueprint instead
 */
export async function getSlideThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/slide/thresholds/blueprint/${blueprintId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch slide threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get single hammer slide threshold by blueprint ID
 */
export async function getSlideSingleHammerThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/slide-single-hammer/thresholds/blueprint/${blueprintId}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch slide single hammer threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get double hammer slide threshold by blueprint ID
 */
export async function getSlideDoubleHammerThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/slide-double-hammer/thresholds/blueprint/${blueprintId}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch slide double hammer threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get gibs threshold by blueprint ID
 */
export async function getGibsThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/gibs/thresholds/blueprint/${blueprintId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch gibs threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get pistons threshold by blueprint ID
 */
export async function getPistonsThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/pistons/thresholds/blueprint/${blueprintId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch pistons threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get tramming threshold by blueprint ID
 */
export async function getTrammingThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/tramming/thresholds/blueprint/${blueprintId}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch tramming threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create tramming threshold
 */
export async function createTrammingThreshold(data: {
  blueprintId: string;
  greenMin: number;
  yellowMin: number;
  redMin: number;
}) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/tramming/thresholds`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to create tramming threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update tramming threshold
 */
export async function updateTrammingThreshold(
  blueprintId: string,
  data: {
    greenMin: number;
    yellowMin: number;
    redMin: number;
  },
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/tramming/thresholds/blueprint/${blueprintId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...data, recalculateAlerts }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update tramming threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update bearing clearance threshold
 */
export async function updateBearingClearanceThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/bearing-clearance/thresholds/blueprint/${blueprintId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...data, recalculateAlerts }),
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update bearing clearance threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update clutch threshold
 */
export async function updateClutchThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/clutch/thresholds/blueprint/${blueprintId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...data, recalculateAlerts }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update clutch threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update slide threshold
 * @deprecated Use updateSlideSingleHammerThreshold or updateSlideDoubleHammerThreshold instead
 */
export async function updateSlideThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/slide/thresholds/blueprint/${blueprintId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...data, recalculateAlerts }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update slide threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update single hammer slide threshold
 */
export async function updateSlideSingleHammerThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/slide-single-hammer/thresholds/blueprint/${blueprintId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...data, recalculateAlerts }),
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update slide single hammer threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update double hammer slide threshold
 */
export async function updateSlideDoubleHammerThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/slide-double-hammer/thresholds/blueprint/${blueprintId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...data, recalculateAlerts }),
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update slide double hammer threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update gibs threshold
 */
export async function updateGibsThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/gibs/thresholds/blueprint/${blueprintId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...data, recalculateAlerts }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update gibs threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update pistons threshold
 */
export async function updatePistonsThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/alerts/pistons/thresholds/blueprint/${blueprintId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...data, recalculateAlerts }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update pistons threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get clutch cevolani threshold by blueprint ID
 */
export async function getClutchCevolaniThresholdByBlueprint(blueprintId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/clutch-cevolani/thresholds/blueprint/${blueprintId}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to fetch clutch cevolani threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update clutch cevolani threshold
 */
export async function updateClutchCevolaniThreshold(
  blueprintId: string,
  data: any,
  recalculateAlerts: boolean = false,
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_URL}/alerts/clutch-cevolani/thresholds/blueprint/${blueprintId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...data, recalculateAlerts }),
      },
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Failed to update clutch cevolani threshold:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
