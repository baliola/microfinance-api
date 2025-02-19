import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // ✅ Fix: Correctly call `getStatus()`
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // ✅ Fix: Ensure `exception.getResponse()` is properly handled
    const exceptionResponse = exception.getResponse
      ? (exception.getResponse() as { message?: string | string[] })
      : { message: 'Internal server error' };

    let message: string | string[];

    // ✅ Fix: Handle both string and object responses
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      // If `message` is an array, return it directly
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : exceptionResponse.message;
    } else {
      message = 'Internal server error';
    }

    response.status(status).json({
      data: null,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
