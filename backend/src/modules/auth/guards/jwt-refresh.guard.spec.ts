import { Test } from '@nestjs/testing';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtRefreshGuard', () => {
  let guard: JwtRefreshGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JwtRefreshGuard],
    }).compile();

    guard = module.get<JwtRefreshGuard>(JwtRefreshGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getRequest', () => {
    it('should return the request object from HTTP context', () => {
      const mockRequest = { cookies: { Refresh: 'refresh-token' } };
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      const result = guard.getRequest(mockContext);

      expect(mockContext.switchToHttp).toHaveBeenCalled();
      expect(mockContext.switchToHttp().getRequest).toHaveBeenCalled();
      expect(result).toBe(mockRequest);
    });
  });
});