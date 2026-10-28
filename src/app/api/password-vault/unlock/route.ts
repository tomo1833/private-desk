import { NextResponse } from 'next/server';
import {
  createVaultSession,
  getVaultConfig,
  setVaultCookie,
  verifyPassphrase,
} from '@/lib/passwordVault';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.passphrase !== 'string') {
      return NextResponse.json(
        { error: 'マスターパスワードを入力してください。' },
        { status: 400 }
      );
    }

    const config = await getVaultConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'パスワード保管庫はまだ設定されていません。' },
        { status: 409 }
      );
    }

    const key = verifyPassphrase(body.passphrase, config);
    if (!key) {
      return NextResponse.json(
        { error: 'マスターパスワードが違います。' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ unlocked: true });
    setVaultCookie(response, request, createVaultSession(key));
    return response;
  } catch (error) {
    console.error('Failed to unlock password vault:', error);
    return NextResponse.json(
      { error: 'パスワード保管庫を開けませんでした。' },
      { status: 500 }
    );
  }
}
