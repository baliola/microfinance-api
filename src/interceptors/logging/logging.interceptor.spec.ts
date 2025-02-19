import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    // Mock ExecutionContext to return a request and response
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
          originalUrl: '/test',
          headers: { 'user-agent': 'JestAgent' },
          ip: '127.0.0.1',
        }),
        getResponse: jest.fn().mockReturnValue({
          statusCode: 200,
        }),
      }),
    } as unknown as ExecutionContext;

    // Mock CallHandler to return an observable
    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(null)), // Simulating an empty response
    };

    // Spy on Logger methods
    loggerSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log incoming request and response', async () => {
    await interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .toPromise();

    expect(loggerSpy).toHaveBeenCalledWith(
      `Incoming Request: GET /test - JestAgent [127.0.0.1]`,
    );

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Response: GET \/test 200 - \d+ms/),
    );
  });
});
