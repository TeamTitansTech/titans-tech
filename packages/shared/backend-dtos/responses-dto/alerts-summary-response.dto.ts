import { z } from 'zod';

export const AlertSeverityDtoSchema = z.enum(['GREEN', 'YELLOW', 'RED', 'NONE']);

export const AlertDetailDtoSchema = z.object({
  field: z.string(),
  fieldLabel: z.string(),
  value: z.string(),
  threshold: z.string().optional(),
  severity: AlertSeverityDtoSchema,
});

export const SectionAlertDtoSchema = z.object({
  sectionKey: z.string(),
  sectionName: z.string(),
  severity: AlertSeverityDtoSchema,
  alerts: z.array(AlertDetailDtoSchema),
});

export const AlertsSummaryResponseDtoSchema = z.object({
  hasAlerts: z.boolean(),
  alertCount: z.number(),
  highestSeverity: AlertSeverityDtoSchema,
  sections: z.array(SectionAlertDtoSchema),
});

export type AlertSeverityDto = z.infer<typeof AlertSeverityDtoSchema>;
export type AlertDetailDto = z.infer<typeof AlertDetailDtoSchema>;
export type SectionAlertDto = z.infer<typeof SectionAlertDtoSchema>;
export type AlertsSummaryResponseDto = z.infer<typeof AlertsSummaryResponseDtoSchema>;
