import { NextResponse } from 'next/server';
import {
  clearVaultCookie,
  clearVaultSession,
} from '@/lib/passwordVault';

export async function POST(request: Request) {
  clearVaultSession(request);
  const response = NextResponse.json({ unlocked: false });
  clearVaultCookie(response);
  return response;
}
