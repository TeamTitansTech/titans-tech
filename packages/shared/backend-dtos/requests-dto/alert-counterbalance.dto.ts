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
