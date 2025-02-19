import { TimeInterceptor } from './time.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';

describe('TimeInterceptor', () => {
  let interceptor: TimeInterceptor;
  let mockCallHandler: jest.Mocked<CallHandler>; // Using Jest's mocked type

  beforeEach(() => {
    interceptor = new TimeInterceptor();

    // Mocking the handle method of CallHandler using jest.fn()
    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should add timestamp to the response data', async () => {
    const mockResponse = { message: 'Success' };

    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(mockResponse));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    // Checking if the timestamp property was added
    expect(result).toHaveProperty('timestamp');
    expect(result.timestamp).toBeInstanceOf(Date); // Verifying it's a Date object
    expect(result.message).toBe('Success'); // The rest of the response should remain the same
  });

  it('should not modify the original response data, except adding timestamp', async () => {
    const mockResponse = { data: { id: 1, name: 'Test' } };

    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(mockResponse));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    // Verifying the timestamp property is added and the rest of the data remains unchanged
    expect(result).toHaveProperty('timestamp');
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.data).toEqual(mockResponse.data); // The original data should remain the same
  });

  it('should handle empty response data and add timestamp', async () => {
    const mockResponse = {}; // Empty object as response

    // Mocking the resolved value of handle
    mockCallHandler.handle.mockReturnValue(of(mockResponse));

    const result = await interceptor
      .intercept({} as ExecutionContext, mockCallHandler)
      .toPromise();

    // Verifying that timestamp is added even when there is no data
    expect(result).toHaveProperty('timestamp');
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result).toEqual({ ...mockResponse, timestamp: result.timestamp });
  });
});
