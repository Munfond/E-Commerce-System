const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const API_BASE_URL =
  env.VITE_API_BASE_URL ?? `${(env.VITE_API_URL ?? 'https://e-commerce-system-aq0y.onrender.com').replace(/\/$/, '')}/api/v1/`;

export const API_ORIGIN = (env.VITE_API_URL ?? API_BASE_URL.replace(/\/api\/v1\/?$/, '')).replace(/\/$/, '');

export const IMAGE_BASE_URL =
  env.VITE_IMAGE_BASE_URL ?? 'https://uuoizvekbqnjrtadpshx.supabase.co/storage/v1/object/public/products/';

export const CATEGORY_IMAGE_BASE_URL =
  env.VITE_CATEGORY_IMAGE_BASE_URL ?? 'https://uuoizvekbqnjrtadpshx.supabase.co/storage/v1/object/public/category/';

export const AVATAR_BASE_URL =
  env.VITE_AVATAR_BASE_URL ?? 'https://uuoizvekbqnjrtadpshx.supabase.co/storage/v1/object/public/avatars/';

export const USE_MOCK_API =
  (env.VITE_USE_MOCK_API ?? 'false') === 'true';

export const DEFAULT_TIMEOUT_MS = 20_000;

