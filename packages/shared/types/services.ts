/**
 * Shared Service Types
 * Re-exports types from backend-dtos (single source of truth)
 *
 * This file exists as a convenience layer for frontend to import service types.
 * All types are defined in backend-dtos using Zod schemas and inferred from them.
 */

// Re-export all enums from centralized location
export {
  ServiceType,
  ServiceStatus,
  MatingPartType,
  ParallelismType,
  DncToBedToBolsterType,
  YesNoNaDncType,
  YesNoDncType,
  LubeHydMonitorFlowPressSwGibType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
  SystemType,
  OkNaDncDamageType,
  OkNaDncLeakingType,
  OkNaDncNotOperationalType,
  OkNaDncNotOperationalLeakingType,
  OkNaDncDarkOilType,
  OkNaDncNeedReplacedType,
  ClutchType,
  ClutchLocation,
  BrakeSpringStudBoltType,
  BrakeLiningType,
  FlywheelBearingsType,
  FlywheelBrakeType,
  RotaryUnionType,
  ClutchLiningType,
  ClutchSealsType,
  PressureUnit,
  SplinesConditionType,
  AdjustingNutLockType,
  AirLineOilerSettingType,
  SeparateBrakeSealsType,
  FlexDiscType,
  DriveBeltConditionType,
  ProtectiveCoversStatusType,
  CylinderAirbagType,
  TemperatureUnit,
  SealConditionType,
  VacuumSystemConditionType,
} from '../enums';

// Re-export all section data types
export type {
  BearingClearanceData,
  BearingClearanceCheck,
  SlideData,
  SlideCheck,
  GibsData,
  GibsCheck,
  LubricationHydraulicsGauge,
  LubricationHydraulicsData,
  LubricationHydraulicsCheck,
  ClutchData,
  CounterbalanceCylinderData,
  CounterbalanceCylinderCheck,
  TrammingData,
  TrammingCheck,
  PistonsData,
  PistonsCheck,
} from '../backend-dtos/requests-dto/service/service.dto';

// Re-export service payload and entity types
export type {
  CreateServiceDto,
  CreateServicePayload,
  UpdateServicePayload,
  CompleteServiceDto,
  Service,
  ServiceHistoryItem,
} from '../backend-dtos/requests-dto/service/service.dto';

// Re-export form component props types
export type {
  BearingClearanceFormProps,
  SlideFormProps,
  GibsFormProps,
  LubricationHydraulicsFormProps,
  ClutchFormProps,
  CounterbalanceCylinderFormProps,
  TrammingFormProps,
  InspectionModalProps,
  ServiceCreationModalProps,
} from '../backend-dtos/requests-dto/service/service.dto';

// Re-export Zod schemas (for validation)
export {
  BearingClearanceDataSchema,
  BearingClearanceCheckSchema,
  SlideDataSchema,
  SlideCheckSchema,
  GibsDataSchema,
  GibsCheckSchema,
  LubricationHydraulicsGaugeSchema,
  LubricationHydraulicsDataSchema,
  LubricationHydraulicsCheckSchema,
  ClutchDataSchema,
  CounterbalanceCylinderDataSchema,
  CounterbalanceCylinderCheckSchema,
  TrammingDataSchema,
  TrammingCheckSchema,
  PistonsDataSchema,
  PistonsCheckSchema,
  CreateServiceSchema,
  CreateServicePayloadSchema,
  UpdateServicePayloadSchema,
  CompleteServiceSchema,
  ServiceSchema,
  ServiceHistoryItemSchema,
} from '../backend-dtos/requests-dto/service/service.dto';

// Re-export Update section schemas (aliases for backend validation)
export {
  BearingClearanceCheckSchema as UpdateBearingClearanceSchema,
  SlideCheckSchema as UpdateSlideSchema,
  GibsCheckSchema as UpdateGibsSchema,
  LubricationHydraulicsCheckSchema as UpdateLubricationHydraulicsSchema,
  ClutchDataSchema as UpdateClutchSchema,
  CounterbalanceCylinderCheckSchema as UpdateCounterbalanceCylinderSchema,
  TrammingCheckSchema as UpdateTrammingSchema,
  PistonsCheckSchema as UpdatePistonsSchema,
  UpdateServicePayloadSchema as UpdateServiceSchema,
} from '../backend-dtos/requests-dto/service/service.dto';

// Re-export types with Update prefixes
export type { UpdateServicePayload as UpdateServiceDto } from '../backend-dtos/requests-dto/service/service.dto';
