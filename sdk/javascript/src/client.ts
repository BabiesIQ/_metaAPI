import { AuthError, BabiesIQError, NotFoundError, RateLimitError, TimeoutError } from "./errors";
import type {
  ApiResponse,
  BabiesIQConfig,
  SearchResult,
  SongOptions,
  SongResult,
  ThumbnailResult,
  VideoOptions,
  VideoResult,
} from "./types";

const DEFAULT_BASE_URL = "https://api.babiesiq.tech";
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 500;
const DEFAULT_TIMEOUT = 30_000;

/**
 * BabiesIQ API Client
 *
 * @example
 * ```typescript
 * const client = new BabiesIQ({ apiKey: "biq_your_key" });
 * const song = await client.songs.search("Shape of You");
 * ```
 */
export class BabiesIQ {
  private readonly config: Required<BabiesIQConfig>;

  readonly songs: SongsAPI;
  readonly videos: VideosAPI;
  readonly search: SearchAPI;
  readonly thumbnails: ThumbnailsAPI;

  constructor(config: BabiesIQConfig) {
    if (!config.apiKey) {
      throw new AuthError("apiKey is required");
    }
    this.config = {
      apiKey: config.apiKey,
      baseURL: (config.baseURL ?? DEFAULT_BASE_URL).replace(/\/$/, ""),
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      retryDelay: config.retryDelay ?? DEFAULT_RETRY_DELAY,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };

    const req = this._request.bind(this);
    this.songs = new SongsAPI(this.config, req);
    this.videos = new VideosAPI(this.config, req);
    this.search = new SearchAPI(this.config, req);
    this.thumbnails = new ThumbnailsAPI(this.config, req);
  }

  /** @internal */
  async _request<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: unknown,
    attempt = 0
  ): Promise<T> {
    const url = new URL(`${this.config.baseURL}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, v);
        }
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const res = await fetch(url.toString(), {
        method,
        headers: {
          "X-API-Key": this.config.apiKey,
          "Content-Type": "application/json",
          "User-Agent": "@babiesiq/sdk v2.0.0",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (res.status === 401) throw new AuthError();
      if (res.status === 404) throw new NotFoundError();
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "60", 10);
        throw new RateLimitError(undefined, retryAfter);
      }

      // Read raw text first — avoids crash on non-JSON error bodies
      const text = await res.text();

      // Retry on 5xx
      if (res.status >= 500 && attempt < this.config.maxRetries) {
        await this._sleep(this.config.retryDelay * Math.pow(2, attempt));
        return this._request(method, path, params, body, attempt + 1);
      }

      // Parse JSON — handle malformed or non-JSON responses gracefully
      let json: ApiResponse<T>;
      try {
        json = JSON.parse(text) as ApiResponse<T>;
      } catch {
        throw new BabiesIQError(
          `Non-JSON response (HTTP ${res.status}): ${text.slice(0, 120)}`,
          res.status
        );
      }

      if (!res.ok || !json.success) {
        throw new BabiesIQError(json.error ?? `HTTP ${res.status}`, res.status);
      }

      return json.data;
    } catch (err) {
      if (err instanceof BabiesIQError) throw err;
      if ((err as Error).name === "AbortError") throw new TimeoutError();
      // Network error — retry
      if (attempt < this.config.maxRetries) {
        await this._sleep(this.config.retryDelay * Math.pow(2, attempt));
        return this._request(method, path, params, body, attempt + 1);
      }
      throw new BabiesIQError(`Network error: ${(err as Error).message}`, 0);
    } finally {
      clearTimeout(timer);
    }
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ── Resource APIs ──────────────────────────────────────────────────────────────

type RequestFn = <T>(
  method: string,
  path: string,
  params?: Record<string, string>,
  body?: unknown,
  attempt?: number
) => Promise<T>;

class SongsAPI {
  constructor(
    private cfg: Required<BabiesIQConfig>,
    private req: RequestFn
  ) {}

  /**
   * Search for a song and get a streaming or download URL.
   */
  async search(query: string, options: SongOptions = {}): Promise<SongResult> {
    return this.req<SongResult>("GET", "/api/song", {
      q: query,
      download: options.download ? "1" : "0",
      ...(options.eq ? { eq: options.eq } : {}),
    });
  }
}

class VideosAPI {
  constructor(
    private cfg: Required<BabiesIQConfig>,
    private req: RequestFn
  ) {}

  /**
   * Search for a video and get a streaming or download URL.
   */
  async search(query: string, options: VideoOptions = {}): Promise<VideoResult> {
    return this.req<VideoResult>("GET", "/api/video", {
      q: query,
      download: options.download ? "1" : "0",
    });
  }
}

class SearchAPI {
  constructor(
    private cfg: Required<BabiesIQConfig>,
    private req: RequestFn
  ) {}

  /**
   * Search across songs and videos.
   */
  async query(q: string): Promise<SearchResult[]> {
    return this.req<SearchResult[]>("POST", "/api/search", undefined, { q });
  }
}

class ThumbnailsAPI {
  constructor(
    private cfg: Required<BabiesIQConfig>,
    private req: RequestFn
  ) {}

  /**
   * Get a YouTube thumbnail for a video ID.
   */
  async get(videoId: string, design?: string): Promise<ThumbnailResult> {
    return this.req<ThumbnailResult>("GET", "/api/thumbnail", {
      v: videoId,
      ...(design ? { design } : {}),
    });
  }
}
