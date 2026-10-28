import { NextResponse } from 'next/server';
import {
  getAppAuthSecret,
  initializeAppAuth,
  isAppAuthConfigured,
  isAppAuthSetupTokenValid,
  setAppSessionCookie,
} from '@/lib/appAuth';

export async function POST(request: Request) {
  try {
    getAppAuthSecret();
    const body = await request.json();
    if (typeof body.setupToken !== 'string' || !isAppAuthSetupTokenValid(body.setupToken)) {
      return NextResponse.json({ error: '初回設定トークンが正しくありません。' }, { status: 401 });
    }
    if (typeof body.passphrase !== 'string' || body.passphrase.length < 16) {
      return NextResponse.json(
        { error: '管理者パスワードは16文字以上にしてください。' },
        { status: 400 }
      );
    }
    if (await isAppAuthConfigured()) {
      return NextResponse.json({ error: 'アプリ認証はすでに設定されています。' }, { status: 409 });
    }

    await initializeAppAuth(body.passphrase);
    const response = NextResponse.json({ authenticated: true });
    await setAppSessionCookie(response);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Application authentication is already configured.') {
      return NextResponse.json({ error: 'アプリ認証はすでに設定されています。' }, { status: 409 });
    }
    console.error('Failed to initialize application authentication:', error);
    return NextResponse.json(
      { error: 'アプリ認証を初期設定できませんでした。環境設定とDBを確認してください。' },
      { status: 500 }
    );
  }
}
