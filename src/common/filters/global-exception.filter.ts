import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : exceptionResponse;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno do servidor';
    }

    let errorMessage: string | string[] = 'Erro na requisição';
    if (typeof message === 'object' && message !== null) {
      const msgObj = message as any;
      if (Array.isArray(msgObj.message)) {
        errorMessage = msgObj.message;
      } else if (msgObj.message) {
        errorMessage = msgObj.message;
      } else if (msgObj.error) {
        errorMessage = msgObj.error;
      }
    } else if (typeof message === 'string') {
      errorMessage = message;
    }

    if (status === HttpStatus.UNAUTHORIZED) {
      if (typeof errorMessage === 'string' && errorMessage.includes('Token')) {
        errorMessage = 'Sua sessão expirou ou o token é inválido. Por favor, faça login novamente.';
      } else if (typeof errorMessage === 'string' && errorMessage.includes('Unauthorized')) {
        errorMessage = 'Você não está autenticado. Por favor, faça login.';
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      ...(typeof message === 'object' && message !== null && !Array.isArray((message as any).message) ? message : {}),
    };
    
    if (status === HttpStatus.UNAUTHORIZED) {
      this.logger.warn(
        `[AUTH] ${request.method} ${request.url} - Token inválido ou expirado`,
        request.headers.authorization ? 'Token presente mas inválido' : 'Token não fornecido',
      );
    } else {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json(errorResponse);
  }
}
