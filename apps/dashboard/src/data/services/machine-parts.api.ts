'use server';
import { revalidatePath } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import { getCookie } from '@/lib/cookies';
import type {
  PartsConfigResponseDto,
  SectionPartsResponseDto,
  SubsectionResponseDto,
  MachinePartItemDto,
} from '@titans-tech/shared/backend-dtos';

// Re-export types for convenience
export type {
  PartsConfigResponseDto,
  SectionPartsResponseDto,
  SubsectionResponseDto,
  PartItemResponseDto,
  MachinePartItemDto,
} from '@titans-tech/shared/backend-dtos';

/**
 * Get the complete parts configuration for a machine
 */
export const getMachinePartsConfig = async (machineId: string) => {
  return await responseHandler<PartsConfigResponseDto>(`/machines/${machineId}/parts`, {
    method: 'GET',
  });
};

/**
 * Get parts for a specific section of a machine
 */
export const getMachineSectionParts = async (machineId: string, sectionKey: string) => {
  return await responseHandler<SectionPartsResponseDto>(
    `/machines/${machineId}/parts/sections/${sectionKey}`,
    {
      method: 'GET',
    },
  );
};

/**
 * Initialize parts configuration from defaults
 */
export const initializePartsFromDefaults = async (
  machineId: string,
  sectionKey: string,
  copyFromDefaults: boolean = true,
) => {
  const result = await responseHandler<PartsConfigResponseDto>(
    `/machines/${machineId}/parts/initialize`,
    {
      method: 'POST',
      body: { sectionKey, copyFromDefaults },
    },
  );

  if (!result.errors) {
    revalidatePath(`/admin/machines/${machineId}/parts`);
  }

  return result;
};

/**
 * Create a new subsection
 */
export const createSubsection = async (
  machineId: string,
  sectionKey: string,
  data: {
    subsectionId: string;
    name: string;
    figureReference?: string;
    description?: string;
    displayOrder?: number;
    parts?: MachinePartItemDto[];
  },
) => {
  const result = await responseHandler<SubsectionResponseDto>(
    `/machines/${machineId}/parts/sections/${sectionKey}/subsections`,
    {
      method: 'POST',
      body: data,
    },
  );

  if (!result.errors) {
    revalidatePath(`/admin/machines/${machineId}/parts`);
  }

  return result;
};

/**
 * Update a subsection
 */
export const updateSubsection = async (
  machineId: string,
  subsectionId: string,
  data: {
    name?: string;
    figureReference?: string | null;
    description?: string | null;
    displayOrder?: number;
  },
) => {
  const result = await responseHandler<SubsectionResponseDto>(
    `/machines/${machineId}/parts/subsections/${subsectionId}`,
    {
      method: 'PUT',
      body: data,
    },
  );

  if (!result.errors) {
    revalidatePath(`/admin/machines/${machineId}/parts`);
  }

  return result;
};

/**
 * Delete a subsection
 */
export const deleteSubsection = async (machineId: string, subsectionId: string) => {
  const result = await responseHandler<void>(
    `/machines/${machineId}/parts/subsections/${subsectionId}`,
    {
      method: 'DELETE',
    },
  );

  if (!result.errors) {
    revalidatePath(`/admin/machines/${machineId}/parts`);
  }

  return result;
};

/**
 * Update all parts in a subsection (replace)
 */
export const updateSubsectionParts = async (
  machineId: string,
  subsectionId: string,
  parts: MachinePartItemDto[],
) => {
  const result = await responseHandler<SubsectionResponseDto>(
    `/machines/${machineId}/parts/subsections/${subsectionId}/parts`,
    {
      method: 'PUT',
      body: { parts },
    },
  );

  if (!result.errors) {
    revalidatePath(`/admin/machines/${machineId}/parts`);
  }

  return result;
};

/**
 * Upload a diagram image for a subsection
 * Note: This uses FormData so we need a different approach
 */
export const uploadSubsectionDiagram = async (
  machineId: string,
  subsectionId: string,
  formData: FormData,
) => {
  // For file uploads, we need to use fetch directly since responseHandler
  // doesn't support FormData
  const token = await getCookie('auth_token');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  try {
    const response = await fetch(
      `${API_BASE_URL}/machines/${machineId}/parts/subsections/${subsectionId}/diagram`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        errors: [errorData.message || 'Failed to upload diagram'],
        rawErrors: errorData,
        status: response.status,
      };
    }

    const data = await response.json();
    revalidatePath(`/admin/machines/${machineId}/parts`);

    return { data, errors: null, rawErrors: null, status: response.status };
  } catch (error) {
    return {
      data: null,
      errors: ['Connection error'],
      rawErrors: error,
      status: 0,
    };
  }
};

/**
 * Reset a section to defaults (delete all custom subsections)
 */
export const resetSectionToDefaults = async (machineId: string, sectionKey: string) => {
  const result = await responseHandler<SectionPartsResponseDto>(
    `/machines/${machineId}/parts/sections/${sectionKey}`,
    {
      method: 'DELETE',
    },
  );

  if (!result.errors) {
    revalidatePath(`/admin/machines/${machineId}/parts`);
  }

  return result;
};
