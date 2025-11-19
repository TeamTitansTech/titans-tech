/**
 * Service Section Update DTOs
 * Re-exports section update types from service.dto.ts for consistency
 *
 * Note: These types come from service.dto.ts which is the single source of truth.
 * Backend uses Prisma types for validation, not Zod schemas.
 */

// Re-export section update types
export type {
  BearingClearanceCheck as UpdateBearingClearanceDto,
  SlideCheck as UpdateSlideDto,
  GibsCheck as UpdateGibsDto,
  LubricationHydraulicsData as UpdateLubricationHydraulicsDto,
  ClutchData as UpdateClutchDto,
  CounterbalanceCylinderCheck as UpdateCounterbalanceCylinderDto,
  TrammingCheck as UpdateTrammingDto,
  PistonsCheck as UpdatePistonsDto,
} from './service.dto';
