# @babiesiq/sdk

Official JavaScript/TypeScript SDK for the BabiesIQ API.

## Installation

```bash
npm install @babiesiq/sdk
# or
yarn add @babiesiq/sdk
# or
pnpm add @babiesiq/sdk
```

## Quick Start

```typescript
import { BabiesIQ } from "@babiesiq/sdk";

const client = new BabiesIQ({
  apiKey: "biq_your_api_key_here",
  baseURL: "https://api.babiesiq.tech", // optional, defaults to production
});

// Search for a song
const song = await client.songs.search("Shape of You Ed Sheeran");
console.log(song.stream_url);

// Search for a video
const video = await client.videos.search("Big Buck Bunny");
console.log(video.stream_url);
```

## Authentication

All API requests require an API key. You can generate one from your [BabiesIQ Dashboard](https://babiesiq.tech/panel/api-keys).

## API Reference

### `client.songs.search(query, options?)`

Search for an audio stream.

```typescript
const result = await client.songs.search("Never Gonna Give You Up", {
  download: false, // stream instead of download
  eq: "bass_boost", // optional equalizer preset
});
```

### `client.videos.search(query, options?)`

Search for a video stream.

```typescript
const result = await client.videos.search("Gangnam Style", {
  download: false,
});
```

### `client.search.query(query)`

Search across both songs and videos.

```typescript
const results = await client.search.query("Ed Sheeran");
```

### `client.thumbnails.get(videoId)`

Get a thumbnail for a YouTube video.

```typescript
const thumb = await client.thumbnails.get("dQw4w9WgXcQ");
console.log(thumb.url);
```

## Error Handling

```typescript
import { BabiesIQError, RateLimitError, AuthError } from "@babiesiq/sdk";

try {
  const result = await client.songs.search("test");
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log("Rate limited. Retry after:", error.retryAfter);
  } else if (error instanceof AuthError) {
    console.log("Invalid API key");
  } else if (error instanceof BabiesIQError) {
    console.log("API error:", error.message, "Status:", error.status);
  }
}
```

## Automatic Retries

The SDK automatically retries failed requests with exponential backoff:

```typescript
const client = new BabiesIQ({
  apiKey: "your_key",
  maxRetries: 3,        // default: 2
  retryDelay: 1000,     // initial delay in ms, default: 500
});
```

## TypeScript Support

This SDK is written in TypeScript and exports full type definitions.

```typescript
import type { SongResult, VideoResult, SearchResult } from "@babiesiq/sdk";
```

## License

MIT
