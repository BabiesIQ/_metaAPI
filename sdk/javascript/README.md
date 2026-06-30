# biq-api · JavaScript / TypeScript SDK

Official JavaScript/TypeScript SDK for the [BabiesIQ API](https://babiesiq.tech).

[![npm](https://img.shields.io/npm/v/biq-api)](https://www.npmjs.com/package/biq-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Installation

```bash
npm install biq-api
# or
yarn add biq-api
# or
pnpm add biq-api
```

## Manual Download

You can also clone or download this SDK directly from GitHub:

**→ <https://github.com/BabiesIQ/web/tree/main/sdk/javascript>**

```bash
# Clone just the SDK folder (sparse checkout)
git clone --filter=blob:none --sparse https://github.com/BabiesIQ/web.git
cd web
git sparse-checkout set sdk/javascript
```

---

## Quick Start

```typescript
import { BabiesIQ, _metadata } from 'biq-api';

// ── SDK info ───────────────────────────────
console.log(_metadata.name);      // biq-api
console.log(_metadata.version);   // 2.0.0
console.log(_metadata.docs);      // https://babiesiq.tech/docs

// ── Create client ──────────────────────────
const client = new BabiesIQ({ apiKey: 'biq_YOUR_KEY' });

// ── Songs ──────────────────────────────────
const song = await client.songs.search('Shape of You');
console.log(song.streamUrl);

// ── Videos ─────────────────────────────────
const video = await client.videos.search('Big Buck Bunny');
console.log(video.streamUrl);

// ── Cross-search ────────────────────────────
const results = await client.search.query('Ed Sheeran');
results.forEach(r => console.log(r.type, r.title));
```

---

## API Reference

### `client.songs.search(query, options?)`

```typescript
const song = await client.songs.search('Never Gonna Give You Up', {
  eq: 'bass_boost',   // optional EQ preset
  download: false,    // stream (default) or download
});
console.log(song.streamUrl, song.title, song.duration);
```

### `client.videos.search(query, options?)`

```typescript
const video = await client.videos.search('Gangnam Style', { download: false });
console.log(video.streamUrl, video.quality);
```

### `client.search.query(query)`

```typescript
const results = await client.search.query('Taylor Swift');
```

### `client.thumbnails.get(videoId, design?)`

```typescript
const thumb = await client.thumbnails.get('dQw4w9WgXcQ');
console.log(thumb.url);
```

---

## Error Handling

```typescript
import { BabiesIQ, BabiesIQError, RateLimitError, AuthError } from 'biq-api';

const client = new BabiesIQ({ apiKey: 'biq_YOUR_KEY' });

try {
  const song = await client.songs.search('test');
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log('Rate limited');
  } else if (err instanceof AuthError) {
    console.log('Invalid API key');
  } else if (err instanceof BabiesIQError) {
    console.log('API error:', err.message, 'Status:', err.status);
  }
}
```

---

## TypeScript Support

All types are exported:

```typescript
import type { SongResult, VideoResult, SearchResult, ThumbnailResult } from 'biq-api';
```

---

## Links

| Resource | URL |
|----------|-----|
| API Docs | <https://babiesiq.tech/docs> |
| npm | <https://www.npmjs.com/package/biq-api> |
| Source | <https://github.com/BabiesIQ/web/tree/main/sdk/javascript> |
| Dashboard | <https://babiesiq.tech/panel/api-keys> |

## License

MIT — © BabiesIQ Team
