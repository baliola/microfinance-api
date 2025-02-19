import { ResponseInterceptor } from './response.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

interface MockResponse {
  data?: any;
  message?: string;
  [key: string]: any;
}

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();

    // Mocking the handle method of CallHandler using jest.fn()
    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response in the expected JSON format when response has "data" and "message"', async () => {
    const mockResponse: MockResponse = {
      data: { id: 1, name: 'Test' },
      message: 'Custom message',
    };

    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(mockResponse));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    expect(result).toEqual({
      data: { id: 1, name: 'Test' },
      message: 'Custom message',
    });
  });

  it('should return a default message "Success" when response does not contain "message"', async () => {
    const mockResponse: MockResponse = {
      data: { id: 2, name: 'Another Test' },
    };

    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(mockResponse));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    expect(result).toEqual({
      data: { id: 2, name: 'Another Test' },
      message: 'Success',
    });
  });

  it('should handle response without "data" and only return "message"', async () => {
    const mockResponse: MockResponse = { message: 'Only message here' };

    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(mockResponse));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    expect(result).toEqual({
      data: { message: 'Only message here' }, // Wrapped in `data`
      message: 'Only message here',
    });
  });

  it('should wrap raw response when no "data" or "message" is present', async () => {
    const mockResponse: MockResponse = { id: 3, status: 'active' };

    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(mockResponse));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    expect(result).toEqual({
      data: { id: 3, status: 'active' },
      message: 'Success',
    });
  });

  it('should handle empty response gracefully', async () => {
    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(null));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    expect(result).toEqual({
      data: null,
      message: 'Success',
    });
  });
});
