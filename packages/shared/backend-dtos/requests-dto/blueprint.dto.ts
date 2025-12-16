import { z } from 'zod';
import { ServiceSection } from '@titans-tech/db/enums';
import { ClutchThresholdsSchema } from './threshold-clutch.dto';
import { GibsThresholdsSchema } from './threshold-gibs.dto';
import { PistonsThresholdsSchema } from './threshold-pistons.dto';
import { TrammingThresholdsSchema } from './threshold-tramming.dto';

// Schema existente para Blueprint
export const CreateBlueprintSchema = z.object({
  name: z.string().min(1, 'Blueprint name is required'),
  imageUrl: z.string().url().optional(),
  fields: z.array(z.any()),
  sections: z.array(z.enum(ServiceSection)),
});

export type CreateBlueprintDto = z.infer<typeof CreateBlueprintSchema>;

// Schema para thresholds opcionais
export const ThresholdsSchema = z
  .object({
    totalClearance_greenMin: z.number(),
    totalClearance_yellowMin: z.number(),
    totalClearance_redMin: z.number(),

    mainBearings_greenMin: z.number(),
    mainBearings_yellowMin: z.number(),
    mainBearings_redMin: z.number(),

    upperConnectionBearings_greenMin: z.number(),
    upperConnectionBearings_yellowMin: z.number(),
    upperConnectionBearings_redMin: z.number(),

    wristPinToMatingPart_greenMin: z.number(),
    wristPinToMatingPart_yellowMin: z.number(),
    wristPinToMatingPart_redMin: z.number(),

    wristPinToBushing_greenMin: z.number(),
    wristPinToBushing_yellowMin: z.number(),
    wristPinToBushing_redMin: z.number(),

    slideAdjNutToScrewSleeve_greenMin: z.number(),
    slideAdjNutToScrewSleeve_yellowMin: z.number(),
    slideAdjNutToScrewSleeve_redMin: z.number(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin for each field
      const fields = [
        'totalClearance',
        'mainBearings',
        'upperConnectionBearings',
        'wristPinToMatingPart',
        'wristPinToBushing',
        'slideAdjNutToScrewSleeve',
      ];

      for (const field of fields) {
        const greenMin = data[`${field}_greenMin` as keyof typeof data] as number;
        const yellowMin = data[`${field}_yellowMin` as keyof typeof data] as number;
        const redMin = data[`${field}_redMin` as keyof typeof data] as number;

        if (yellowMin <= greenMin || redMin <= yellowMin) {
          return false;
        }
      }

      return true;
    },
    {
      message: 'Each field must have greenMin < yellowMin < redMin',
    },
  );

export type ThresholdsDto = z.infer<typeof ThresholdsSchema>;

// Schema para thresholds do Slide
export const SlideThresholdsSchema = z
  .object({
    maxDeviation_greenMin: z.number(),
    maxDeviation_yellowMin: z.number(),
    maxDeviation_redMin: z.number(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin
      if (
        data.maxDeviation_yellowMin <= data.maxDeviation_greenMin ||
        data.maxDeviation_redMin <= data.maxDeviation_yellowMin
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Must have greenMin < yellowMin < redMin',
    },
  );

export type SlideThresholdsDto = z.infer<typeof SlideThresholdsSchema>;

// Schema combinado: Blueprint + Thresholds opcionais
export const CreateBlueprintWithThresholdsSchema = z
  .object({
    name: z.string().min(1, 'Blueprint name is required'),
    imageUrl: z.string().url().optional(),
    fields: z.array(z.any()),
    sections: z.array(z.enum(ServiceSection)),
    thresholds: ThresholdsSchema.optional(),
    bearingClearanceSingleHammerThresholds: ThresholdsSchema.optional(),
    clutchThresholds: ClutchThresholdsSchema.optional(),
    slideSingleHammerThresholds: SlideThresholdsSchema.optional(),
    slideDoubleHammerThresholds: SlideThresholdsSchema.optional(),
    gibsThresholds: GibsThresholdsSchema.optional(),
    pistonsThresholds: PistonsThresholdsSchema.optional(),
    trammingThresholds: TrammingThresholdsSchema.optional(),
  })
  .refine(
    (data) => {
      // Se thresholds fornecidos, BEARING_CLEARANCE deve estar em sections
      if (data.thresholds && !data.sections.includes(ServiceSection.BEARING_CLEARANCE)) {
        return false;
      }
      // Se bearingClearanceSingleHammerThresholds fornecidos, BEARING_CLEARANCE_SINGLE_HAMMER deve estar em sections
      if (
        data.bearingClearanceSingleHammerThresholds &&
        !data.sections.includes(ServiceSection.BEARING_CLEARANCE_SINGLE_HAMMER)
      ) {
        return false;
      }
      // Se clutchThresholds fornecidos, CLUTCH deve estar em sections
      if (data.clutchThresholds && !data.sections.includes(ServiceSection.CLUTCH)) {
        return false;
      }
      // Se slideSingleHammerThresholds fornecidos, SLIDE_SINGLE_HAMMER deve estar em sections
      if (
        data.slideSingleHammerThresholds &&
        !data.sections.includes(ServiceSection.SLIDE_SINGLE_HAMMER)
      ) {
        return false;
      }
      // Se slideDoubleHammerThresholds fornecidos, SLIDE_DOUBLE_HAMMER deve estar em sections
      if (
        data.slideDoubleHammerThresholds &&
        !data.sections.includes(ServiceSection.SLIDE_DOUBLE_HAMMER)
      ) {
        return false;
      }
      // Se gibsThresholds fornecidos, GIBS deve estar em sections
      if (data.gibsThresholds && !data.sections.includes(ServiceSection.GIBS)) {
        return false;
      }
      // Se pistonsThresholds fornecidos, PISTONS deve estar em sections
      if (data.pistonsThresholds && !data.sections.includes(ServiceSection.PISTONS)) {
        return false;
      }

      if (data.trammingThresholds && !data.sections.includes(ServiceSection.TRAMMING)) {
        return false;
      }
      return true;
    },
    {
      message: 'Thresholds can only be configured if corresponding section is selected',
      path: ['thresholds'],
    },
  );

export type CreateBlueprintWithThresholdsDto = z.infer<typeof CreateBlueprintWithThresholdsSchema>;

export const UpdateBlueprintSchema = CreateBlueprintSchema.partial();
export type UpdateBlueprintDto = z.infer<typeof UpdateBlueprintSchema>;
