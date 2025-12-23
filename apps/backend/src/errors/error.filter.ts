import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import { FromZodErr, Err } from './err';
import { appEnv } from 'src/config/env';

@Catch(ZodError)
export class ZodErrorFilter implements ExceptionFilter {
  catch(error: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = FromZodErr(error);
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      details: err.details,
      fields: err.fields,
    });
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    console.error('Unhandled exception:', exception);
    if (exception instanceof Err) {
      const err = exception;
      response.status(err.status).json({
        statusCode: err.status,
        details: err.details,
        fields: err.fields,
      });
    } else if (exception instanceof HttpException) {
      const httpEx = exception;
      const exResponse = httpEx.getResponse();

      // If the response is an object with additional data (like machines list), preserve it
      if (typeof exResponse === 'object' && exResponse !== null) {
        const { message, ...additionalData } = exResponse as Record<
          string,
          unknown
        >;
        response.status(httpEx.getStatus()).json({
          statusCode: httpEx.getStatus(),
          details: [message || httpEx.message],
          fields: {},
          ...additionalData,
        });
      } else {
        response.status(httpEx.getStatus()).json({
          statusCode: httpEx.getStatus(),
          details: [httpEx.message],
          fields: {},
        });
      }
    } else if (exception instanceof ZodError) {
      const err = FromZodErr(exception);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        details: err.details,
        fields: err.fields,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        details: [
          appEnv.NODE_ENV === 'development'
            ? exception.message
            : 'Internal server error',
        ],
        fields: {},
      });
    }
  }
}
