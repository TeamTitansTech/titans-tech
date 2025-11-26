import { z } from 'zod';
import { CounterbalanceAlertField } from '@titans-tech/db/enums';

/**
 * Schema for creating a manual counterbalance cylinder airbag alert
 * User selects a field with issues and provides justification
 */
export const CreateAlertCounterbalanceCylinderAirbagSchema = z.object({
  fieldName: z.nativeEnum(CounterbalanceAlertField, {
    message: 'Campo inválido',
  }),
  justification: z
    .string()
    .min(1, 'Justificativa é obrigatória')
    .max(1000, 'Justificativa muito longa (máximo 1000 caracteres)'),
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
    .min(1, 'Justificativa é obrigatória')
    .max(1000, 'Justificativa muito longa (máximo 1000 caracteres)'),
});

export type UpdateAlertCounterbalanceCylinderAirbagDto = z.infer<
  typeof UpdateAlertCounterbalanceCylinderAirbagSchema
>;
