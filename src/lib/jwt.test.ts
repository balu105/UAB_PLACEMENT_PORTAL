import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from './jwt';

describe('JWT Utilities', () => {
  it('should sign and verify a token successfully', () => {
    const payload = { userId: '12345', email: 'test@careerlaunch.com', role: 'CANDIDATE' };
    const token = signToken(payload);
    expect(token).toBeDefined();
    
    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe('12345');
    expect(verified?.email).toBe('test@careerlaunch.com');
    expect(verified?.role).toBe('CANDIDATE');
  });

  it('should return null for corrupted token validation', () => {
    const invalidToken = 'invalid.jwt.token';
    const verified = verifyToken(invalidToken);
    expect(verified).toBeNull();
  });
});
