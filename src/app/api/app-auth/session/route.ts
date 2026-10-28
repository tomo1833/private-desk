import { NextResponse } from 'next/server';
import { getAppSessionToken, isAppAuthConfigured, isAppSessionValid } from '@/lib/appAuth';

export async function GET(request: Request) {
  try {
    return NextResponse.json(
      {
        configured: await isAppAuthConfigured(),
        authenticated: await isAppSessionValid(getAppSessionToken(request)),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Failed to check application authentication:', error);
    return NextResponse.json(
      { error: 'アプリ認証の状態を確認できませんでした。' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
