"""
biq_api — Official Python SDK for BabiesIQ API
pip install biq-api
"""

from .client import BabiesIQ
from .errors import AuthError, BabiesIQError, NotFoundError, RateLimitError, TimeoutError
from .models import SongResult, VideoResult, SearchResult, ThumbnailResult

__version__ = "2.0.1"

_metadata = {
    "name": "biq-api",
    "version": "2.0.1",
    "author": "BabiesIQ Team",
    "homepage": "https://babiesiq.tech",
    "docs": "https://babiesiq.tech/docs",
    "source": "https://github.com/BabiesIQ/_metaAPI",
    "language": "python",
}

__all__ = [
    "BabiesIQ",
    "_metadata",
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
