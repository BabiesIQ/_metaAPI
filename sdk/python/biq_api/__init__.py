"""
biq_api — Official Python SDK for BabiesIQ API
pip install biq-api
"""

from .client import BabiesIQ
from .errors import AuthError, BabiesIQError, NotFoundError, RateLimitError, TimeoutError
from .models import SongResult, VideoResult, SearchResult, ThumbnailResult

__version__ = "2.0.0"
__all__ = [
    "BabiesIQ",
    "BabiesIQError",
    "AuthError",
    "RateLimitError",
    "NotFoundError",
    "TimeoutError",
    "SongResult",
    "VideoResult",
    "SearchResult",
    "ThumbnailResult",
]
