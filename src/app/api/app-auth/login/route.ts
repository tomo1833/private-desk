import { NextResponse } from 'next/server';
import {
  getAppAuthConfig,
  getAppAuthSecret,
  beginAppLoginAttempt,
  recordAppLoginFailure,
  resetAppLoginRateLimit,
  setAppSessionCookie,
  verifyAppPassphrase,
} from '@/lib/appAuth';

export async function POST(request: Request) {
  const rateLimit = beginAppLoginAttempt();
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'ログイン試行が多すぎます。しばらく待ってから再度お試しください。' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  try {
    getAppAuthSecret();
    const body = await request.json();
    if (typeof body.passphrase !== 'string' || body.passphrase.length > 1024) {
      recordAppLoginFailure();
      return NextResponse.json({ error: '管理者パスワードを入力してください。' }, { status: 400 });
    }
    const config = await getAppAuthConfig();
    if (!config || !verifyAppPassphrase(body.passphrase, config)) {
      recordAppLoginFailure();
      return NextResponse.json({ error: 'パスワードが正しくありません。' }, { status: 401 });
    }

    resetAppLoginRateLimit();
    const response = NextResponse.json({ authenticated: true });
    await setAppSessionCookie(response);
    return response;
  } catch (error) {
    recordAppLoginFailure();
    console.error('Failed to authenticate application user:', error);
    return NextResponse.json(
      { error: 'ログインできませんでした。サーバー設定を確認してください。' },
      { status: 500 }
    );
  }
}
