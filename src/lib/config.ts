export type Config = {
  WEBSITE_MODE: "live" | "test";
  BACKEND_BASE_URL: string;
  VERSION: string;
};

const defaultConfig: Config = {
  WEBSITE_MODE: "live",
  BACKEND_BASE_URL: "https://babyapi.pro",
  VERSION: "1.0.0",
};

let cachedConfig: Config = { ...defaultConfig };

export async function loadConfig(): Promise<void> {
  try {
    const res = await fetch("/config.json");
    if (res.ok) {
      const data = (await res.json()) as Partial<Config>;
      cachedConfig = {
        WEBSITE_MODE: data.WEBSITE_MODE ?? defaultConfig.WEBSITE_MODE,
        BACKEND_BASE_URL:
          data.BACKEND_BASE_URL ?? defaultConfig.BACKEND_BASE_URL,
        VERSION: data.VERSION ?? defaultConfig.VERSION,
      };
    }
  } catch {
    // fallback to default config if fetch fails
    cachedConfig = { ...defaultConfig };
  }
}

export function getConfig(): Config {
  return cachedConfig;
}

export function getBackendUrl(): string {
  return cachedConfig.BACKEND_BASE_URL;
}

export function isTestMode(): boolean {
  return cachedConfig.WEBSITE_MODE === "test";
}

// Module-level constant — resolves after loadConfig() has been called.
// Import this for synchronous use in api clients after app bootstrap.
export const BASE_URL = {
  get value(): string {
    return cachedConfig.BACKEND_BASE_URL;
  },
};
