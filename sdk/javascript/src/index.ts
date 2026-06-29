/**
 * @babiesiq/sdk — Official JavaScript/TypeScript SDK for BabiesIQ API
 * Version: 2.0.0
 */

export { BabiesIQ } from "./client";
export { BabiesIQError, RateLimitError, AuthError, NotFoundError } from "./errors";
export type {
  BabiesIQConfig,
  SongResult,
  VideoResult,
  SearchResult,
  ThumbnailResult,
  ApiResponse,
} from "./types";
