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
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception.getResponse instanceof Function
        ? exception.getResponse()
        : exception.getResponse;

    response.status(status).json({
      statusCode: status,
      message: exceptionResponse.message || exception.message,
      customCode: exceptionResponse.customCode || null,
      timestamp: new Date().toISOString(),
    });
  }
}
