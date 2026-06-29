"""BabiesIQ SDK exception hierarchy."""

from __future__ import annotations


class BabiesIQError(Exception):
    """Base exception for all BabiesIQ SDK errors."""

    def __init__(self, message: str, status: int = 0, code: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(message={self.message!r}, status={self.status})"


class AuthError(BabiesIQError):
    """Raised when the API key is invalid or missing."""

    def __init__(self, message: str = "Invalid or missing API key") -> None:
        super().__init__(message, status=401, code="AUTH_ERROR")


class RateLimitError(BabiesIQError):
    """Raised when the API rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded", retry_after: int | None = None) -> None:
        super().__init__(message, status=429, code="RATE_LIMIT")
        self.retry_after = retry_after


class NotFoundError(BabiesIQError):
    """Raised when the requested resource does not exist."""

    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(message, status=404, code="NOT_FOUND")


class TimeoutError(BabiesIQError):
    """Raised when a request times out."""

    def __init__(self, message: str = "Request timed out") -> None:
        super().__init__(message, status=408, code="TIMEOUT")
