import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../api/config';
import { clearAccessToken, clearRefreshToken, clearRole, setAccessToken, setRefreshToken } from '../api/authStorage';
import { endpoints } from '../api/endpoints';

function normalizeRedirectTarget(value?: string) {
  if (!value) return '/profile';
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : value;
  } catch {
    return value;
  }
}

function extractTokensFromUrl(urlString: string) {
  try {
    const url = new URL(urlString, window.location.origin);
    return {
      accessToken: url.searchParams.get('access'),
      refreshToken: url.searchParams.get('refresh'),
      redirectUrl: `${url.pathname}${url.search}${url.hash}`,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      redirectUrl: '',
    };
  }
}

export default function GoogleOAuthCallback() {
  const [message, setMessage] = useState('Đang hoàn tất đăng nhập Google...');

  useEffect(() => {
    let alive = true;

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const accessFromQuery = params.get('access');
      const refreshFromQuery = params.get('refresh');

      if (accessFromQuery) {
        setAccessToken(accessFromQuery);
        if (refreshFromQuery) {
          setRefreshToken(refreshFromQuery);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        if (!alive) return;
        window.location.replace('/profile');
        return;
      }

      const code = params.get('code');
      if (!code) {
        throw new Error('Missing Google callback code');
      }

      const callbackUrl = `${API_BASE_URL.replace(/\/$/, '')}/${endpoints.auth.googleCallback}`;
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(Object.fromEntries(params.entries())),
        redirect: 'follow',
      });

      const responseTokens = extractTokensFromUrl(response.url);
      const responseContentType = response.headers.get('content-type') || '';
      const responseBody = responseContentType.includes('application/json') ? await response.json().catch(() => null) : null;

      const accessToken =
        (responseBody && typeof responseBody === 'object' && 'accessToken' in responseBody && typeof responseBody.accessToken === 'string'
          ? responseBody.accessToken
          : null) ||
        responseTokens.accessToken;
      const refreshToken =
        (responseBody && typeof responseBody === 'object' && 'refreshToken' in responseBody && typeof responseBody.refreshToken === 'string'
          ? responseBody.refreshToken
          : null) ||
        responseTokens.refreshToken;
      const nextTarget = normalizeRedirectTarget(
        (responseBody && typeof responseBody === 'object' && 'url' in responseBody && typeof responseBody.url === 'string' && responseBody.url) ||
          (responseBody && typeof responseBody === 'object' && 'redirectUrl' in responseBody && typeof responseBody.redirectUrl === 'string' && responseBody.redirectUrl) ||
          responseTokens.redirectUrl ||
          '/profile'
      );

      if (accessToken) {
        setAccessToken(accessToken);
      }
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      window.history.replaceState({}, document.title, window.location.pathname);

      if (!alive) return;

      if (!accessToken) {
        clearAccessToken();
        clearRefreshToken();
        clearRole();
      }

      window.location.replace(nextTarget);
    })().catch((error) => {
      console.error('Google OAuth callback error:', error);
      if (!alive) return;
      setMessage('Không thể hoàn tất đăng nhập Google.');
    });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Đăng nhập Google</h1>
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
}