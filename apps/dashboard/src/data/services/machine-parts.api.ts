import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  PartsConfigResponseDto,
  SectionPartsResponseDto,
} from '@titans-tech/shared/backend-dtos';

// Re-export types for convenience
export type {
  PartsConfigResponseDto,
  SectionPartsResponseDto,
  SubsectionResponseDto,
  PartItemResponseDto,
  MachinePartItemDto,
  ColumnConfigDto,
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

export {
  initializePartsFromDefaults,
  createSubsection,
  updateSubsection,
  deleteSubsection,
  updateSubsectionParts,
  uploadSubsectionDiagram,
  resetSectionToDefaults,
  parseTableImage,
} from './machine-parts.actions';
