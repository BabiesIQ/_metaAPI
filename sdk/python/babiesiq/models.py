"""BabiesIQ SDK data models."""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SongResult:
    id: str
    title: str
    stream_url: str
    artist: Optional[str] = None
    duration: Optional[int] = None
    thumbnail: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "SongResult":
        return cls(
            id=d.get("id", ""),
            title=d.get("title", ""),
            stream_url=d.get("stream_url", ""),
            artist=d.get("artist"),
            duration=d.get("duration"),
            thumbnail=d.get("thumbnail"),
        )


@dataclass
class VideoResult:
    id: str
    title: str
    stream_url: str
    channel: Optional[str] = None
    duration: Optional[int] = None
    thumbnail: Optional[str] = None
    quality: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "VideoResult":
        return cls(
            id=d.get("id", ""),
            title=d.get("title", ""),
            stream_url=d.get("stream_url", ""),
            channel=d.get("channel"),
            duration=d.get("duration"),
            thumbnail=d.get("thumbnail"),
            quality=d.get("quality"),
        )


@dataclass
class SearchResult:
    type: str
    id: str
    title: str
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
    video_id: str
    url: str
    design: Optional[str] = None

    @classmethod
    def from_dict(cls, d: dict) -> "ThumbnailResult":
        return cls(
            video_id=d.get("video_id", ""),
            url=d.get("url", ""),
            design=d.get("design"),
        )
