import { z } from 'zod';
import { ServiceSection } from '@titans-tech/db/enums';

// Schema existente para Blueprint
export const CreateBlueprintSchema = z.object({
  name: z.string().min(1, 'Blueprint name is required'),
  fields: z.array(z.any()),
  sections: z.array(z.nativeEnum(ServiceSection)),
});

export type CreateBlueprintDto = z.infer<typeof CreateBlueprintSchema>;

// Schema para thresholds opcionais
export const ThresholdsSchema = z
  .object({
    totalClearance_greenMin: z.number().positive(),
    totalClearance_yellowMin: z.number().positive(),
    totalClearance_redMin: z.number().positive(),

    mainBearings_greenMin: z.number().positive(),
    mainBearings_yellowMin: z.number().positive(),
    mainBearings_redMin: z.number().positive(),

    upperConnectionBearings_greenMin: z.number().positive(),
    upperConnectionBearings_yellowMin: z.number().positive(),
    upperConnectionBearings_redMin: z.number().positive(),

    wristPinToMatingPart_greenMin: z.number().positive(),
    wristPinToMatingPart_yellowMin: z.number().positive(),
    wristPinToMatingPart_redMin: z.number().positive(),

    wristPinToBushing_greenMin: z.number().positive(),
    wristPinToBushing_yellowMin: z.number().positive(),
    wristPinToBushing_redMin: z.number().positive(),

    slideAdjNutToScrewSleeve_greenMin: z.number().positive(),
    slideAdjNutToScrewSleeve_yellowMin: z.number().positive(),
    slideAdjNutToScrewSleeve_redMin: z.number().positive(),
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
    maxDeviation_greenMin: z.number().positive(),
    maxDeviation_yellowMin: z.number().positive(),
    maxDeviation_redMin: z.number().positive(),
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
    fields: z.array(z.any()),
    sections: z.array(z.nativeEnum(ServiceSection)),
    thresholds: ThresholdsSchema.optional(),
    slideThresholds: SlideThresholdsSchema.optional(),
  })
  .refine(
    (data) => {
      // Se thresholds fornecidos, BEARING_CLEARANCE deve estar em sections
      if (data.thresholds && !data.sections.includes(ServiceSection.BEARING_CLEARANCE)) {
        return false;
      }
      return true;
    },
    {
      message: 'Thresholds can only be configured if BEARING_CLEARANCE is in sections',
      path: ['thresholds'],
    },
  )
  .refine(
    (data) => {
      // Se slideThresholds fornecidos, SLIDE deve estar em sections
      if (data.slideThresholds && !data.sections.includes(ServiceSection.SLIDE)) {
        return false;
      }
      return true;
    },
    {
      message: 'Slide thresholds can only be configured if SLIDE is in sections',
      path: ['slideThresholds'],
    },
  );

export type CreateBlueprintWithThresholdsDto = z.infer<typeof CreateBlueprintWithThresholdsSchema>;

export const UpdateBlueprintSchema = CreateBlueprintSchema.partial();
export type UpdateBlueprintDto = z.infer<typeof UpdateBlueprintSchema>;
