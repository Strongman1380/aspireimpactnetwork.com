/**
 * Security utilities for form protection and rate limiting
 */

// Rate limiting using localStorage
class RateLimiter {
  constructor(identifier, maxAttempts = 5, windowMs = 60000) {
    this.identifier = identifier;
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.storageKey = `rateLimit_${identifier}`;
  }

  getAttempts() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const attempts = JSON.parse(data);
      const now = Date.now();

      // Filter out old attempts outside the window
      return attempts.filter(timestamp => now - timestamp < this.windowMs);
    } catch (error) {
      console.error('Error reading rate limit data:', error);
      return [];
    }
  }

  recordAttempt() {
    const attempts = this.getAttempts();
    attempts.push(Date.now());

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error storing rate limit data:', error);
    }
  }

  isRateLimited() {
    const attempts = this.getAttempts();
    return attempts.length >= this.maxAttempts;
  }

  getRemainingAttempts() {
    const attempts = this.getAttempts();
    return Math.max(0, this.maxAttempts - attempts.length);
  }

  getTimeUntilReset() {
    const attempts = this.getAttempts();
    if (attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...attempts);
    const resetTime = oldestAttempt + this.windowMs;
    const now = Date.now();

    return Math.max(0, resetTime - now);
  }

  reset() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }
}

// Input sanitization
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Remove potential XSS vectors
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
  const phoneRegex = /^\+?1?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
  return phoneRegex.test(phone);
}

// URL validation
function isValidURL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// CSRF token generation
function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store CSRF token in sessionStorage
function setCSRFToken() {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
}

// Get CSRF token
function getCSRFToken() {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = setCSRFToken();
  }
  return token;
}

// Validate CSRF token
function validateCSRFToken(token) {
  const storedToken = sessionStorage.getItem('csrf_token');
  return token && storedToken && token === storedToken;
}

// Content Security Policy reporting
function setupCSPReporting() {
  if (typeof document !== 'undefined') {
    document.addEventListener('securitypolicyviolation', (event) => {
      const violation = {
        documentURI: event.documentURI,
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        sourceFile: event.sourceFile
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        console.warn('CSP Violation:', violation);
      }

      // In production, send to your logging service
      // e.g., Sentry, LogRocket, etc.
    });
  }
}

// Detect potential bot/automated submissions
function detectBot() {
  // Check for common bot indicators
  const indicators = {
    fastFill: false,
    mouseMovement: false,
    javascriptEnabled: true,
    honeypot: false
  };

  // Track form fill time (bots often fill forms instantly)
  let formStartTime = null;

  function startFormTracking() {
    formStartTime = Date.now();
  }

  function checkFormFillTime() {
    if (!formStartTime) return false;
    const fillTime = Date.now() - formStartTime;
    // If filled in less than 2 seconds, might be a bot
    return fillTime < 2000;
  }

  return {
    startFormTracking,
    checkFormFillTime,
    indicators
  };
}

// Honeypot field generator
function createHoneypot(formElement) {
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website'; // Common spam field name
  honeypot.id = 'website';
  honeypot.style.position = 'absolute';
  honeypot.style.left = '-9999px';
  honeypot.style.width = '1px';
  honeypot.style.height = '1px';
  honeypot.setAttribute('tabindex', '-1');
  honeypot.setAttribute('autocomplete', 'off');
  honeypot.setAttribute('aria-hidden', 'true');

  formElement.appendChild(honeypot);
  return honeypot;
}

// Check if honeypot was filled (indicates bot)
function isHoneypotFilled(honeypotElement) {
  return honeypotElement && honeypotElement.value.trim() !== '';
}

// Secure form submission wrapper
async function secureFormSubmit(formData, endpoint, options = {}) {
  const {
    enableRateLimit = true,
    rateLimitId = 'form_submit',
    maxAttempts = 5,
    windowMs = 60000,
    enableHoneypot = true,
    honeypotFieldName = 'website'
  } = options;

  // Rate limiting check
  if (enableRateLimit) {
    const limiter = new RateLimiter(rateLimitId, maxAttempts, windowMs);

    if (limiter.isRateLimited()) {
      const resetTime = Math.ceil(limiter.getTimeUntilReset() / 1000);
      throw new Error(`Too many attempts. Please try again in ${resetTime} seconds.`);
    }

    limiter.recordAttempt();
  }

  // Honeypot check
  if (enableHoneypot && formData.get(honeypotFieldName)) {
    // Silent fail for bot detection
    console.warn('Honeypot filled - possible bot submission');
    return { success: false, error: 'Invalid submission' };
  }

  // Add CSRF token
  const csrfToken = getCSRFToken();
  formData.append('csrf_token', csrfToken);

  // Sanitize text inputs
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      formData.set(key, sanitizeInput(value));
    }
  }

  // Make the actual request
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

// Export utilities
export {
  RateLimiter,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidURL,
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  setupCSPReporting,
  detectBot,
  createHoneypot,
  isHoneypotFilled,
  secureFormSubmit
};
