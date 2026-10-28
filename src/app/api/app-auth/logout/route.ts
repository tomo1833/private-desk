import { NextResponse } from 'next/server';
import {
  clearAppSessionCookie,
  getAppSessionToken,
  revokeAppSessionToken,
} from '@/lib/appAuth';

export async function POST(request: Request) {
  const response = NextResponse.json({ authenticated: false });
  try {
    await revokeAppSessionToken(getAppSessionToken(request));
    clearAppSessionCookie(response);
    return response;
  } catch (error) {
    console.error('Failed to revoke application session:', error);
    return NextResponse.json(
      { error: 'ログアウトできませんでした。時間をおいて再度お試しください。' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
