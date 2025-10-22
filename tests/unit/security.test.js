import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidURL,
  RateLimiter
} from '../../src/scripts/utils/security.js';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate US phone numbers', () => {
      expect(isValidPhone('402-555-1234')).toBe(true);
      expect(isValidPhone('(402) 555-1234')).toBe(true);
      expect(isValidPhone('4025551234')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc-def-ghij')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should validate URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('ftp://example.com')).toBe(false);
    });
  });

  describe('RateLimiter', () => {
    it('should allow attempts under limit', () => {
      const limiter = new RateLimiter('test', 5, 60000);

      for (let i = 0; i < 4; i++) {
        limiter.recordAttempt();
      }

      expect(limiter.isRateLimited()).toBe(false);
      expect(limiter.getRemainingAttempts()).toBe(1);
    });

    it('should block attempts over limit', () => {
      const limiter = new RateLimiter('test2', 3, 60000);

      for (let i = 0; i < 3; i++) {
        limiter.recordAttempt();
      }

      expect(limiter.isRateLimited()).toBe(true);
      expect(limiter.getRemainingAttempts()).toBe(0);
    });

    it('should reset after time window', () => {
      const limiter = new RateLimiter('test3', 2, 100);

      limiter.recordAttempt();
      limiter.recordAttempt();
      expect(limiter.isRateLimited()).toBe(true);

      // Wait for window to expire
      setTimeout(() => {
        expect(limiter.isRateLimited()).toBe(false);
      }, 150);
    });
  });
});
