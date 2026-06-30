"""BabiesIQ SDK data models — matches actual API response structure."""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SongResult:
    """Result from songs.search().
    
    API returns: {query, status, stream, stream_id, type}
    """
    stream_url: str         # from API field "stream"
    stream_id: str          # from API field "stream_id"
    query: str              # original search query echoed back
    status: str             # e.g. "processing"
    type: str               # "audio"

    @classmethod
    def from_dict(cls, d: dict) -> "SongResult":
        return cls(
            stream_url=d.get("stream", ""),
            stream_id=d.get("stream_id", ""),
            query=d.get("query", ""),
            status=d.get("status", ""),
            type=d.get("type", "audio"),
        )


@dataclass
class VideoResult:
    """Result from videos.search().
    
    API returns: {query, status, stream, stream_id, type}
    """
    stream_url: str         # from API field "stream"
    stream_id: str          # from API field "stream_id"
    query: str              # original search query echoed back
    status: str             # e.g. "processing"
    type: str               # "video"

    @classmethod
    def from_dict(cls, d: dict) -> "VideoResult":
        return cls(
            stream_url=d.get("stream", ""),
            stream_id=d.get("stream_id", ""),
            query=d.get("query", ""),
            status=d.get("status", ""),
            type=d.get("type", "video"),
        )


@dataclass
class SearchResult:
    type: str
    id: str = ""
    title: str = ""
    artist_or_channel: Optional[str] = None
    thumbnail: Optional[str] = None
    duration: Optional[int] = None

    @classmethod
    def from_dict(cls, d: dict) -> "SearchResult":
        return cls(
            type=d.get("type", ""),
            id=d.get("id", ""),
            title=d.get("title", ""),
            artist_or_channel=d.get("artist_or_channel"),
            thumbnail=d.get("thumbnail"),
            duration=d.get("duration"),
        )


@dataclass
class ThumbnailResult:
    video_id: str = ""
    url: str = ""
    design: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "ThumbnailResult":
        return cls(
            video_id=d.get("video_id", ""),
            url=d.get("url", ""),
            design=d.get("design"),
        )
