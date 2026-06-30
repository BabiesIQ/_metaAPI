# babiesiq/biq-api · PHP SDK

Official PHP SDK for the [BabiesIQ API](https://babiesiq.tech).

[![Packagist](https://img.shields.io/packagist/v/babiesiq/biq-api)](https://packagist.org/packages/babiesiq/biq-api)
[![PHP](https://img.shields.io/packagist/php-v/babiesiq/biq-api)](https://packagist.org/packages/babiesiq/biq-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Installation

```bash
composer require babiesiq/biq-api
```

## Manual Download

You can also clone or download this SDK directly from GitHub:

**→ <https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/php>**

```bash
# Clone just the SDK folder (sparse checkout)
git clone --filter=blob:none --sparse https://github.com/BabiesIQ/_metaAPI.git
cd web
git sparse-checkout set sdk/php
```

---

## Quick Start

```php
<?php

require 'vendor/autoload.php';

use BabiesIQ\BabiesIQ;

// ── SDK info ───────────────────────────────
echo BabiesIQ::\$_metadata['name'];      // biq-api
echo BabiesIQ::\$_metadata['version'];   // 2.0.0
echo BabiesIQ::\$_metadata['docs'];      // https://babiesiq.tech/docs

// ── Create client ──────────────────────────
\$client = new BabiesIQ('biq_YOUR_KEY');

// ── Songs ──────────────────────────────────
\$song = \$client->songs->search('Shape of You');
echo \$song->streamUrl;

// ── Videos ─────────────────────────────────
\$video = \$client->videos->search('Big Buck Bunny');
echo \$video->streamUrl;

// ── Cross-search ────────────────────────────
\$results = \$client->search->query('Ed Sheeran');
foreach (\$results as \$r) {
    echo \$r->type . ' ' . \$r->title . PHP_EOL;
}
```

---

## API Reference

### `\$client->songs->search(query, options?)`

```php
\$song = \$client->songs->search('Never Gonna Give You Up', ['eq' => 'bass_boost']);
echo \$song->streamUrl;
echo \$song->title;
```

### `\$client->videos->search(query, options?)`

```php
\$video = \$client->videos->search('Gangnam Style');
echo \$video->streamUrl;
echo \$video->quality;
```

### `\$client->search->query(query)`

```php
\$results = \$client->search->query('Taylor Swift');
```

### `\$client->thumbnails->get(videoId, design?)`

```php
\$thumb = \$client->thumbnails->get('dQw4w9WgXcQ');
echo \$thumb->url;
```

---

## Error Handling

```php
use BabiesIQ\BabiesIQ;
use BabiesIQ\Exceptions\AuthException;
use BabiesIQ\Exceptions\RateLimitException;
use BabiesIQ\Exceptions\BabiesIQException;

\$client = new BabiesIQ('biq_YOUR_KEY');

try {
    \$song = \$client->songs->search('test');
} catch (RateLimitException \$e) {
    echo 'Rate limited';
} catch (AuthException \$e) {
    echo 'Invalid API key';
} catch (BabiesIQException \$e) {
    echo 'API error: ' . \$e->getMessage();
}
```

---

## Links

| Resource | URL |
|----------|-----|
| API Docs | <https://babiesiq.tech/docs> |
| Packagist | <https://packagist.org/packages/babiesiq/biq-api> |
| Source | <https://github.com/BabiesIQ/_metaAPI/tree/main/sdk/php> |
| Dashboard | <https://babiesiq.tech/panel/api-keys> |

## License

MIT — © BabiesIQ Team
