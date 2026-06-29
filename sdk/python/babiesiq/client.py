"""BabiesIQ Python SDK client."""

from __future__ import annotations

import time
import urllib.error
import urllib.parse
import urllib.request
import json
from typing import Any, Optional

from .errors import AuthError, BabiesIQError, NotFoundError, RateLimitError, TimeoutError
from .models import SearchResult, SongResult, ThumbnailResult, VideoResult

DEFAULT_BASE_URL = "https://api.babiesiq.tech"
SDK_VERSION = "2.0.0"


class BabiesIQ:
    """
    Official BabiesIQ API client.

    Example::

        client = BabiesIQ(api_key="biq_your_key")
        song = client.songs.search("Shape of You")
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        max_retries: int = 2,
        retry_delay: float = 0.5,
        timeout: float = 30.0,
    ) -> None:
        if not api_key:
            raise AuthError("api_key is required")

        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._max_retries = max_retries
        self._retry_delay = retry_delay
        self._timeout = timeout

        self.songs = _SongsAPI(self)
        self.videos = _VideosAPI(self)
        self.search = _SearchAPI(self)
        self.thumbnails = _ThumbnailsAPI(self)

    def _request(
        self,
        method: str,
        path: str,
        params: Optional[dict] = None,
        body: Optional[dict] = None,
        attempt: int = 0,
    ) -> Any:
        url = f"{self._base_url}{path}"
        if params:
            filtered = {k: str(v) for k, v in params.items() if v is not None and v != ""}
            if filtered:
                url += "?" + urllib.parse.urlencode(filtered)

        data = json.dumps(body).encode() if body else None
        headers = {
            "X-API-Key": self._api_key,
            "Content-Type": "application/json",
            "User-Agent": f"babiesiq-python/{SDK_VERSION}",
        }

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                payload = json.loads(resp.read().decode())
                if not payload.get("success"):
                    raise BabiesIQError(payload.get("error") or "Unknown error", resp.status)
                return payload["data"]

        except urllib.error.HTTPError as e:
            if e.code == 401:
                raise AuthError()
            if e.code == 404:
                raise NotFoundError()
            if e.code == 429:
                retry_after = int(e.headers.get("Retry-After", "60"))
                raise RateLimitError(retry_after=retry_after)
            if e.code >= 500 and attempt < self._max_retries:
                time.sleep(self._retry_delay * (2 ** attempt))
                return self._request(method, path, params, body, attempt + 1)
            try:
                payload = json.loads(e.read().decode())
                msg = payload.get("error") or f"HTTP {e.code}"
            except Exception:
                msg = f"HTTP {e.code}"
            raise BabiesIQError(msg, e.code)

        except TimeoutError:
            raise TimeoutError()

        except (urllib.error.URLError, ConnectionError) as e:
            if attempt < self._max_retries:
                time.sleep(self._retry_delay * (2 ** attempt))
                return self._request(method, path, params, body, attempt + 1)
            raise BabiesIQError(f"Network error: {e}", 0)


class _SongsAPI:
    def __init__(self, client: BabiesIQ) -> None:
        self._client = client

    def search(self, query: str, *, download: bool = False, eq: Optional[str] = None) -> SongResult:
        """Search for a song and get its streaming URL."""
        data = self._client._request("GET", "/api/song", params={
            "q": query,
            "download": "1" if download else "0",
            **({"eq": eq} if eq else {}),
        })
        return SongResult.from_dict(data) if isinstance(data, dict) else data


class _VideosAPI:
    def __init__(self, client: BabiesIQ) -> None:
        self._client = client

    def search(self, query: str, *, download: bool = False) -> VideoResult:
        """Search for a video and get its streaming URL."""
        data = self._client._request("GET", "/api/video", params={
            "q": query,
            "download": "1" if download else "0",
        })
        return VideoResult.from_dict(data) if isinstance(data, dict) else data


class _SearchAPI:
    def __init__(self, client: BabiesIQ) -> None:
        self._client = client

    def query(self, q: str) -> list[SearchResult]:
        """Search across songs and videos."""
        data = self._client._request("POST", "/api/search", body={"q": q})
        return [SearchResult.from_dict(item) for item in (data or [])]


class _ThumbnailsAPI:
    def __init__(self, client: BabiesIQ) -> None:
        self._client = client

    def get(self, video_id: str, design: Optional[str] = None) -> ThumbnailResult:
        """Get a YouTube thumbnail."""
        data = self._client._request("GET", "/api/thumbnail", params={
            "v": video_id,
            **({"design": design} if design else {}),
        })
        return ThumbnailResult.from_dict(data) if isinstance(data, dict) else data
