export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'abort'
  | 'http'
  | 'parse'
  | 'unknown';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  code?: string;
  details?: unknown;
  url?: string;
  requestId?: string;

  constructor(message: string, init: Partial<ApiError> & { kind: ApiErrorKind }) {
    super(message);
    this.name = 'ApiError';
    this.kind = init.kind;
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.url = init.url;
    this.requestId = init.requestId;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

