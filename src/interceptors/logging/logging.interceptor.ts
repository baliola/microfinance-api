import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { Observable, tap } from 'rxjs';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const req: Request = context.switchToHttp().getRequest<Request>();
      const res: Response = context.switchToHttp().getResponse<Response>();
  
      const { method, originalUrl } = req;
      const userAgent = req.headers['user-agent'] || '';
      const ip = req.ip;
      const now = Date.now();
  
      this.logger.debug(
        `Incoming Request: ${method} ${originalUrl} - ${userAgent} [${ip}]`,
      );
  
      return next.handle().pipe(
        tap(() => {
          const { statusCode } = res;
          this.logger.debug(
            `Response: ${method} ${originalUrl} ${statusCode} - ${Date.now() - now}ms`,
          );
        }),
      );
    }
  }
  