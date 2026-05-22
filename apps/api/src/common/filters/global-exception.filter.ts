import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import type { Request, Response } from 'express';

interface ErrorBody {
  success: false;
  message: string;
  statusCode: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') return;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const body = this.buildErrorBody(exception);
    if (process.env.NODE_ENV === 'development') {
      this.logDevelopmentError(exception, request, body.statusCode);
    }
    response.status(body.statusCode).json(body);
  }

  private buildErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : (res as { message?: string | string[] }).message
            ? Array.isArray((res as { message: string[] }).message)
              ? (res as { message: string[] }).message.join(', ')
              : ((res as { message: string }).message)
            : exception.message;
      return { success: false, message, statusCode: status };
    }

    if (exception instanceof MongoServerError) {
      if (exception.code === 11000) {
        return {
          success: false,
          message: 'A record with this value already exists',
          statusCode: HttpStatus.CONFLICT,
        };
      }
      return {
        success: false,
        message: 'Database operation failed',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }

    return {
      success: false,
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }

  private logDevelopmentError(
    exception: unknown,
    request: Request,
    statusCode: number,
  ): void {
    const route = `${request.method} ${request.originalUrl}`;
    if (exception instanceof Error) {
      this.logger.error(`${statusCode} ${route} - ${exception.message}`, exception.stack);
      return;
    }
    this.logger.error(`${statusCode} ${route} - ${String(exception)}`);
  }
}
