import { HttpStatus } from '@nestjs/common';
import z from 'zod';

export class Err extends Error {
  details: string[];
  fields: Record<string, string[]>;
  status: HttpStatus;

  constructor(
    details: string[] = [],
    fields: Record<string, string[]> = {},
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super('Validation error');
    this.details = details;
    this.fields = fields;
    this.status = status;
  }
}

export function FromZodErr(error: z.ZodError): Err {
  const flattened = z.flattenError(error);
  const field_errors = flattened.fieldErrors as Record<string, string[]>;
  const error_details = flattened.formErrors;
  return new Err(error_details, field_errors);
}

export function FieldsErr(fields: Record<string, string[] | string>): Err {
  const normalizedFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : [value],
    ]),
  );
  return new Err([], normalizedFields);
}

export function FullInfoErr(
  mainError: string,
  fields: Record<string, string[] | string>,
): Err {
  const normalizedFields = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : [value],
    ]),
  );
  return new Err([mainError], normalizedFields);
}

export function SimpleErr(
  mainError: string,
  status: HttpStatus = HttpStatus.BAD_REQUEST,
): Err {
  return new Err([mainError], {}, status);
}
