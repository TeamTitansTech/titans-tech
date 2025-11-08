import { Get, Controller, NotFoundException, Query } from '@nestjs/common';
import { FieldsErr, FullInfoErr, SimpleErr } from './errors/err';
import { ZodValidationPipe } from './errors/zod-validation.pipe';
import z from 'zod';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('error')
  getError() {
    throw Error('This is a test error');
  }

  @Get('error-nest')
  getErrorNest() {
    throw new NotFoundException(
      'This is a NestJS not found error (with correct status code)',
    );
  }

  @Get('error-list')
  getErrorList() {
    throw SimpleErr('This is a test error');
  }

  @Get('error-fields')
  getErrorFields() {
    throw FieldsErr({
      test: 'This is a field error',
      another: ['Another field error'],
      other: ['Other field error', 'Second error'],
    });
  }

  @Get('error-fullinfo')
  fullInfoError() {
    throw FullInfoErr('This is a test error', {
      field1: 'Field 1 error',
      field2: ['Field 2 error', 'Another error'],
    });
  }

  @Get('error-from-zod-pipe')
  errorfromZodPipe(
    @Query(
      new ZodValidationPipe(
        z.object({
          field1: z.string(),
          field2: z.number(),
        }),
      ),
    )
    _query: {
      field1: string;
      field2: number;
    },
  ) {
    return 'zod should have validated this query';
  }

  @Get('error-from-zod-parse')
  errorfromZodParse() {
    const a = z
      .object({
        field1: z.string(),
        field2: z.number(),
      })
      .parse({}); // this will throw
    return a;
  }
}
