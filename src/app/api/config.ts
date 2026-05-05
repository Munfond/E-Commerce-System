export const API_BASE_URL =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ??
  '';

export const USE_MOCK_API =
  ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_USE_MOCK_API ?? 'true') ===
  'true';

export const DEFAULT_TIMEOUT_MS = 20_000;

