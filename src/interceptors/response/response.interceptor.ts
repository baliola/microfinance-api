import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        return {
          data: response?.data !== undefined ? response.data : response, // Preserve data structure
          message: response?.message || 'Success', // Use message from controller, default to 'Success'
        };
      }),
    );
  }
}
