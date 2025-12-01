import { z } from 'zod';
import { CounterbalanceAlertField } from '@titans-tech/db/enums';

/**
 * Schema for creating a manual counterbalance cylinder airbag alert
 * User selects a field with issues and provides justification
 */
export const CreateAlertCounterbalanceCylinderAirbagSchema = z.object({
  fieldName: z.enum(CounterbalanceAlertField, {
    message: 'Invalid field',
  }),
  justification: z
    .string()
    .min(1, 'Justification is required')
    .max(1000, 'Justification too long (maximum 1000 characters)'),
});

export type CreateAlertCounterbalanceCylinderAirbagDto = z.infer<
  typeof CreateAlertCounterbalanceCylinderAirbagSchema
>;

/**
 * Schema for updating a counterbalance cylinder airbag alert
 * Only justification can be updated (fieldName is immutable due to unique constraint)
 */
export const UpdateAlertCounterbalanceCylinderAirbagSchema = z.object({
  justification: z
    .string()
    .min(1, 'Justification is required')
    .max(1000, 'Justification too long (maximum 1000 characters)'),
});

export type UpdateAlertCounterbalanceCylinderAirbagDto = z.infer<
  typeof UpdateAlertCounterbalanceCylinderAirbagSchema
>;
