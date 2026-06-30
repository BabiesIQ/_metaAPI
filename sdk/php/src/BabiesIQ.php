<?php

declare(strict_types=1);

namespace BabiesIQ;

use BabiesIQ\Exceptions\AuthException;
use BabiesIQ\Exceptions\BabiesIQException;
use BabiesIQ\Exceptions\NotFoundException;
use BabiesIQ\Exceptions\RateLimitException;
use BabiesIQ\Resources\Songs;
use BabiesIQ\Resources\Videos;
use BabiesIQ\Resources\Search;
use BabiesIQ\Resources\Thumbnails;

/**
 * Official PHP SDK for BabiesIQ API.
 *
 * @example
 * ```php
 * $client = new BabiesIQ\BabiesIQ('biq_your_api_key');
 * $song = $client->songs->search('Shape of You');
 * echo $song->streamUrl;
 * ```
 */
class BabiesIQ
{
    public const SDK_VERSION = '2.0.0';
    public const DEFAULT_BASE_URL = 'https://api.babiesiq.tech';

    /** @var array<string,string> SDK package metadata */
    public static array $_metadata = [
        'name'     => 'biq-api',
        'version'  => '2.0.0',
        'author'   => 'BabiesIQ Team',
        'homepage' => 'https://babiesiq.tech',
        'docs'     => 'https://babiesiq.tech/docs',
        'source'   => 'https://github.com/BabiesIQ/_metaAPI',
        'language' => 'php',
    ];

    private string $apiKey;
    private string $baseUrl;
    private int $maxRetries;
    private float $timeout;

    public Songs $songs;
    public Videos $videos;
    public Search $search;
    public Thumbnails $thumbnails;

    public function __construct(
        string $apiKey,
        string $baseUrl = self::DEFAULT_BASE_URL,
        int $maxRetries = 2,
        float $timeout = 30.0,
    ) {
        if (empty($apiKey)) {
            throw new AuthException('apiKey is required');
        }

        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->maxRetries = $maxRetries;
        $this->timeout = $timeout;

        $this->songs = new Songs($this);
        $this->videos = new Videos($this);
        $this->search = new Search($this);
        $this->thumbnails = new Thumbnails($this);
    }

    /**
     * @internal
     * @throws BabiesIQException
     */
    public function request(string $method, string $path, array $params = [], ?array $body = null): mixed
    {
        $url = $this->baseUrl . $path;
        if (!empty($params)) {
            $url .= '?' . http_build_query(array_filter($params, fn($v) => $v !== null && $v !== ''));
        }

        $lastException = null;
        for ($attempt = 0; $attempt <= $this->maxRetries; $attempt++) {
            if ($attempt > 0) {
                usleep((int)(500_000 * (2 ** ($attempt - 1))));
            }

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL            => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => (int)$this->timeout,
                CURLOPT_HTTPHEADER     => [
                    'X-API-Key: ' . $this->apiKey,
                    'Content-Type: application/json',
                    'User-Agent: biq-api-php/' . self::SDK_VERSION,
                ],
                CURLOPT_CUSTOMREQUEST  => strtoupper($method),
            ]);

            if ($body !== null) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
            }

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $lastException = new BabiesIQException('Network error: ' . $curlError);
                continue;
            }

            match ($httpCode) {
                401 => throw new AuthException(),
                404 => throw new NotFoundException(),
                429 => throw new RateLimitException(),
                default => null,
            };

            if ($httpCode >= 500) {
                $lastException = new BabiesIQException("Server error: HTTP $httpCode", $httpCode);
                continue;
            }

            $json = json_decode($response, true);
            if (!$json || !($json['success'] ?? false)) {
                throw new BabiesIQException($json['error'] ?? 'Unknown error', $httpCode);
            }

            return $json['data'];
        }

        throw $lastException ?? new BabiesIQException('Request failed after retries');
    }
}
