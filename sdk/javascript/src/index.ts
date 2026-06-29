/**
 * biq-api — Official JavaScript/TypeScript SDK for BabiesIQ API
 * npm install biq-api
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

export const _metadata = {
  name: "biq-api",
  version: "2.0.0",
  author: "BabiesIQ Team",
  homepage: "https://babiesiq.tech",
  docs: "https://babiesiq.tech/docs",
  source: "https://github.com/BabiesIQ/web",
  language: "javascript",
} as const;
