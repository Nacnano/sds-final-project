import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { Response } from 'express';

@Catch()
export class GrpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // Default values
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Map gRPC status codes → HTTP
    switch (exception.code) {
      case status.NOT_FOUND:
        httpStatus = HttpStatus.NOT_FOUND;
        message = exception.details || 'Not found';
        break;
      case status.INVALID_ARGUMENT:
        httpStatus = HttpStatus.BAD_REQUEST;
        message = exception.details || 'Invalid request';
        break;
      case status.PERMISSION_DENIED:
        httpStatus = HttpStatus.FORBIDDEN;
        message = exception.details || 'Permission denied';
        break;
      case status.UNAUTHENTICATED:
        httpStatus = HttpStatus.UNAUTHORIZED;
        message = exception.details || 'Unauthenticated';
        break;
      case status.ALREADY_EXISTS:
        httpStatus = HttpStatus.CONFLICT;
        message = exception.details || 'Already exists';
        break;
      default:
        message = exception.details || exception.message || message;
        break;
    }

    res.status(httpStatus).json({
      statusCode: httpStatus,
      message,
    });
  }
}
