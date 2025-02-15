import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

function isErrorResponse(
  obj: any,
): obj is { message: string; customCode?: number } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof obj.message === 'string'
  );
}

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
    const exceptionResponse = exception.getResponse()
      ? exception.getResponse()
      : { message: 'Internal server error' };

    // ✅ Fix: Handle both string and object responses
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : isErrorResponse(exceptionResponse)
          ? exceptionResponse.message
          : 'Internal server error';

    response.status(status).json({
      data: null,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
