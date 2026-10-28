import { NextResponse } from 'next/server';
import {
  createVaultSession,
  initializePasswordVault,
  setVaultCookie,
} from '@/lib/passwordVault';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.passphrase !== 'string' || body.passphrase.length < 12) {
      return NextResponse.json(
        { error: 'マスターパスワードは12文字以上にしてください。' },
        { status: 400 }
      );
    }

    const { encryptionKey } = await initializePasswordVault(body.passphrase);
    const response = NextResponse.json({ unlocked: true });
    setVaultCookie(response, request, createVaultSession(encryptionKey));
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Password vault is already configured.') {
      return NextResponse.json(
        { error: 'パスワード保管庫はすでに設定されています。' },
        { status: 409 }
      );
    }
    console.error('Failed to initialize password vault:', error);
    return NextResponse.json(
      { error: 'パスワード保管庫を初期化できませんでした。' },
      { status: 500 }
    );
  }
}
