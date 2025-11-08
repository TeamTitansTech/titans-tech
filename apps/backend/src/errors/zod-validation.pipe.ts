import type { PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import z from 'zod';
import { FromZodErr, SimpleErr } from './err';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        throw FromZodErr(error);
      }
      console.debug(error);
      throw SimpleErr('Validation failed');
    }
  }
}
