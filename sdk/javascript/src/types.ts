export interface BabiesIQConfig {
  /** Your BabiesIQ API key (starts with biq_) */
  apiKey: string;
  /** Base URL for the API. Defaults to https://api.babiesiq.tech */
  baseURL?: string;
  /** Maximum number of retry attempts on transient failures. Default: 2 */
  maxRetries?: number;
  /** Initial retry delay in milliseconds. Default: 500 */
  retryDelay?: number;
  /** Request timeout in milliseconds. Default: 30000 */
  timeout?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  meta?: Record<string, unknown>;
}

export interface SongResult {
  /** Unique video/song ID */
  id: string;
  /** Song title */
  title: string;
  /** Artist name */
  artist?: string;
  /** Duration in seconds */
  duration?: number;
  /** Streaming URL */
  stream_url: string;
  /** Thumbnail URL */
  thumbnail?: string;
}

export interface VideoResult {
  /** Unique video ID */
  id: string;
  /** Video title */
  title: string;
  /** Channel name */
  channel?: string;
  /** Duration in seconds */
  duration?: number;
  /** Streaming URL */
  stream_url: string;
  /** Thumbnail URL */
  thumbnail?: string;
  /** Video quality */
  quality?: string;
}

export interface SearchResult {
  type: "song" | "video";
  id: string;
  title: string;
  artist_or_channel?: string;
  thumbnail?: string;
  duration?: number;
}

export interface ThumbnailResult {
  video_id: string;
  url: string;
  design?: string;
}

export interface SongOptions {
  /** Whether to return a download URL instead of streaming URL */
  download?: boolean;
  /** Equalizer preset: bass_boost, treble_boost, etc. */
  eq?: string;
}

export interface VideoOptions {
  /** Whether to return a download URL instead of streaming URL */
  download?: boolean;
}
