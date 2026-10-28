import { NextResponse } from 'next/server';
import { getVaultSession, isVaultConfigured } from '@/lib/passwordVault';

export async function GET(request: Request) {
  try {
    const configured = await isVaultConfigured();
    return NextResponse.json({
      configured,
      unlocked: configured && Boolean(getVaultSession(request)),
    });
  } catch (error) {
    console.error('Failed to check password vault status:', error);
    return NextResponse.json(
      { error: 'パスワード保管庫の状態を確認できませんでした。' },
      { status: 500 }
    );
  }
}
