import { Get, Controller, NotFoundException, Query } from '@nestjs/common';
import { FieldsErr, FullInfoErr, SimpleErr } from './errors/err';
import { ZodValidationPipe } from './errors/zod-validation.pipe';
import z from 'zod';
import { AppService } from './app.service';
import { Public } from './modules/auth/auth.decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Public()
  @Get('error')
  getError() {
    // eslint-disable-next-line no-restricted-syntax
    throw Error('This is a test error');
  }

  @Public()
  @Get('error-nest')
  getErrorNest() {
    throw new NotFoundException(
      'This is a NestJS not found error (with correct status code)',
    );
  }

  @Public()
  @Get('error-list')
  getErrorList() {
    throw SimpleErr('This is a test error');
  }

  @Public()
  @Get('error-fields')
  getErrorFields() {
    throw FieldsErr({
      test: 'This is a field error',
      another: ['Another field error'],
      other: ['Other field error', 'Second error'],
    });
  }

  @Public()
  @Get('error-fullinfo')
  fullInfoError() {
    throw FullInfoErr('This is a test error', {
      field1: 'Field 1 error',
      field2: ['Field 2 error', 'Another error'],
    });
  }

  @Public()
  @Get('error-from-zod-pipe')
  errorfromZodPipe(
    @Query(
      new ZodValidationPipe(
        z.object({
          field1: z.string(),
          field2: z.number(),
        }),
      ),
    ) // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _query: {
      field1: string;
      field2: number;
    },
  ) {
    return 'zod should have validated this query';
  }

  @Public()
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
