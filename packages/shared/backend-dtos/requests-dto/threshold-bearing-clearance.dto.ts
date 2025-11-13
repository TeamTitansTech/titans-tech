import { z } from 'zod';

export const CreateThresholdBearingClearanceSchema = z
  .object({
    blueprintId: z.string().cuid(),

    // Total Clearance thresholds
    totalClearance_greenMin: z.number().positive(),
    totalClearance_yellowMin: z.number().positive(),
    totalClearance_redMin: z.number().positive(),

    // Main Bearings thresholds
    mainBearings_greenMin: z.number().positive(),
    mainBearings_yellowMin: z.number().positive(),
    mainBearings_redMin: z.number().positive(),

    // Upper Connection Bearings thresholds
    upperConnectionBearings_greenMin: z.number().positive(),
    upperConnectionBearings_yellowMin: z.number().positive(),
    upperConnectionBearings_redMin: z.number().positive(),

    // Wrist Pin to Mating Part thresholds
    wristPinToMatingPart_greenMin: z.number().positive(),
    wristPinToMatingPart_yellowMin: z.number().positive(),
    wristPinToMatingPart_redMin: z.number().positive(),

    // Wrist Pin to Bushing thresholds
    wristPinToBushing_greenMin: z.number().positive(),
    wristPinToBushing_yellowMin: z.number().positive(),
    wristPinToBushing_redMin: z.number().positive(),

    // Slide Adj Nut to Screw/Sleeve thresholds
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

export type CreateThresholdBearingClearanceDto = z.infer<
  typeof CreateThresholdBearingClearanceSchema
>;

export const UpdateThresholdBearingClearanceSchema = z.object({
  // Total Clearance thresholds
  totalClearance_greenMin: z.number().positive().optional(),
  totalClearance_yellowMin: z.number().positive().optional(),
  totalClearance_redMin: z.number().positive().optional(),

  // Main Bearings thresholds
  mainBearings_greenMin: z.number().positive().optional(),
  mainBearings_yellowMin: z.number().positive().optional(),
  mainBearings_redMin: z.number().positive().optional(),

  // Upper Connection Bearings thresholds
  upperConnectionBearings_greenMin: z.number().positive().optional(),
  upperConnectionBearings_yellowMin: z.number().positive().optional(),
  upperConnectionBearings_redMin: z.number().positive().optional(),

  // Wrist Pin to Mating Part thresholds
  wristPinToMatingPart_greenMin: z.number().positive().optional(),
  wristPinToMatingPart_yellowMin: z.number().positive().optional(),
  wristPinToMatingPart_redMin: z.number().positive().optional(),

  // Wrist Pin to Bushing thresholds
  wristPinToBushing_greenMin: z.number().positive().optional(),
  wristPinToBushing_yellowMin: z.number().positive().optional(),
  wristPinToBushing_redMin: z.number().positive().optional(),

  // Slide Adj Nut to Screw/Sleeve thresholds
  slideAdjNutToScrewSleeve_greenMin: z.number().positive().optional(),
  slideAdjNutToScrewSleeve_yellowMin: z.number().positive().optional(),
  slideAdjNutToScrewSleeve_redMin: z.number().positive().optional(),
});

export type UpdateThresholdBearingClearanceDto = z.infer<
  typeof UpdateThresholdBearingClearanceSchema
>;
