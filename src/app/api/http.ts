import { API_BASE_URL, DEFAULT_TIMEOUT_MS, USE_MOCK_API } from './config';
import { getAccessToken } from './authStorage';
import { ApiError } from './errors';
import { mockHandle } from './mock/mockServer';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpClientOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  getAccessToken?: () => string | null;
};

export type RequestOptions = {
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  auth?: boolean;
};

export type HttpResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
};

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']) {
  const normalizedBase = baseUrl ? (baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`) : window.location.origin;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function readBodySafe(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      throw new ApiError('Failed to parse JSON response', { kind: 'parse', status: res.status });
    }
  }
  return await res.text();
}

function normalizeHttpError(payload: unknown, res: Response, url: string) {
  const requestId = res.headers.get('x-request-id') ?? undefined;

  // Common backend shapes we can support without coupling:
  // { message, code, details }, { error: { message, code, details } }, or { error: "..." }
  const asObj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  const embedded = asObj?.error && typeof asObj.error === 'object' ? (asObj.error as Record<string, unknown>) : null;
  const message =
    (typeof asObj?.error === 'string' && asObj.error) ||
    (typeof embedded?.message === 'string' && embedded.message) ||
    (typeof asObj?.message === 'string' && asObj.message) ||
    `HTTP ${res.status}`;
  const code =
    (typeof asObj?.error === 'string' && asObj.error) ||
    (typeof embedded?.code === 'string' && embedded.code) || (typeof asObj?.code === 'string' && asObj.code) || undefined;
  const details = embedded?.details ?? asObj?.details ?? (typeof asObj?.error === 'string' ? asObj.error : undefined);

  return new ApiError(message, {
    kind: 'http',
    status: res.status,
    code,
    details,
    url,
    requestId,
  });
}

export function createHttpClient(opts?: HttpClientOptions) {
  const baseUrl = opts?.baseUrl ?? API_BASE_URL;
  const timeoutMsDefault = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const tokenGetter = opts?.getAccessToken ?? getAccessToken;

  async function request<T>(method: HttpMethod, path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    const auth = options?.auth ?? true;
    const timeoutMs = options?.timeoutMs ?? timeoutMsDefault;
    const url = buildUrl(baseUrl, path, options?.query);

    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(options?.headers ?? {})) {
      if (v !== undefined) headers[k] = v;
    }

    const token = auth ? tokenGetter() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    const signal = options?.signal
      ? new AbortSignalAny([options.signal, controller.signal])
      : controller.signal;

    try {
      if (USE_MOCK_API && (!baseUrl || baseUrl.length === 0)) {
        const mock = await mockHandle(method, url, options);
        if (mock) {
          const headers = new Headers({ 'content-type': 'application/json', ...(mock.headers ?? {}) });
          if (mock.status >= 400) {
            throw new ApiError(
              (mock.body && typeof mock.body === 'object' && 'message' in (mock.body as Record<string, unknown>) && typeof (mock.body as Record<string, unknown>).message === 'string'
                ? ((mock.body as Record<string, unknown>).message as string)
                : `HTTP ${mock.status}`),
              { kind: 'http', status: mock.status, details: mock.body, url }
            );
          }
          return { data: mock.body as T, status: mock.status, headers };
        }
      }

      const hasBody = method !== 'GET' && options?.body !== undefined;

      let body: BodyInit | undefined;
      if (hasBody) {
        if (options?.body instanceof FormData) {
          body = options.body;
        } else if (
          typeof options?.body === 'string' ||
          options?.body instanceof Blob ||
          options?.body instanceof ArrayBuffer
        ) {
          body = options.body as BodyInit;
        } else {
          headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
          body = JSON.stringify(options?.body);
        }
      }

      const res = await fetch(url, {
        method,
        headers,
        body,
        signal,
      });

      const requestId = res.headers.get('x-request-id') ?? undefined;

      if (!res.ok) {
        const payload = await readBodySafe(res);
        throw normalizeHttpError(payload, res, url);
      }

      const contentLength = res.headers.get('content-length');
      const isNoContent = res.status === 204 || contentLength === '0';

      const data = (isNoContent ? null : await readBodySafe(res)) as T;
      return { data, status: res.status, headers: res.headers, requestId };
    } catch (e) {
      if (e instanceof ApiError) throw e;

      if (e instanceof DOMException && e.name === 'AbortError') {
        // Distinguish timeout vs caller abort if possible
        const kind = options?.signal?.aborted ? 'abort' : 'timeout';
        throw new ApiError(kind === 'timeout' ? 'Request timed out' : 'Request aborted', { kind, url });
      }

      if (e instanceof TypeError) {
        // fetch network error
        throw new ApiError('Network error', { kind: 'network', url, details: e.message });
      }

      throw new ApiError('Unknown error', { kind: 'unknown', url, details: e });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return {
    request,
    get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('POST', path, { ...options, body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('PUT', path, { ...options, body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('PATCH', path, { ...options, body }),
    del: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, options),
  };
}

/**
 * Minimal helper to combine multiple AbortSignals.
 * It aborts when any input signal aborts.
 */
class AbortSignalAny extends AbortSignal {
  constructor(signals: AbortSignal[]) {
    super();
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    for (const s of signals) {
      if (s.aborted) {
        controller.abort();
        break;
      }
      s.addEventListener('abort', onAbort, { once: true });
    }
    return controller.signal as AbortSignalAny;
  }
}

