import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

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
    const response = ctx.getResponse<Response>();

    const body = this.buildErrorBody(exception);
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

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          success: false,
          message: 'A record with this value already exists',
          statusCode: HttpStatus.CONFLICT,
        };
      }
      if (exception.code === 'P2025') {
        return {
          success: false,
          message: 'Record not found',
          statusCode: HttpStatus.NOT_FOUND,
        };
      }
      return {
        success: false,
        message: 'Database operation failed',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    return {
      success: false,
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}
