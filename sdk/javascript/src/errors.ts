/**
 * Base error class for all BabiesIQ SDK errors.
 */
export class BabiesIQError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "BabiesIQError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Thrown when the API key is invalid or missing.
 */
export class AuthError extends BabiesIQError {
  constructor(message = "Invalid or missing API key") {
    super(message, 401, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

/**
 * Thrown when the rate limit is exceeded.
 */
export class RateLimitError extends BabiesIQError {
  /** Seconds to wait before retrying */
  readonly retryAfter?: number;

  constructor(message = "Rate limit exceeded", retryAfter?: number) {
    super(message, 429, "RATE_LIMIT");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when the requested resource is not found.
 */
export class NotFoundError extends BabiesIQError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * Thrown when the request times out.
 */
export class TimeoutError extends BabiesIQError {
  constructor(message = "Request timed out") {
    super(message, 408, "TIMEOUT");
    this.name = "TimeoutError";
  }
}
