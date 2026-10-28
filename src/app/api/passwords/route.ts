// src/app/api/passwords/route.ts
import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Password } from '@/types/password';
import { requireVaultSession } from '@/lib/passwordVault';
import { encryptPassword } from '@/lib/passwordVaultCrypto';

export async function GET(request: Request) {
  const { response } = requireVaultSession(request);
  if (response) return response;
  try {
    const results = await runSelect<Omit<Password, 'password'>>(
      'SELECT id, site_name, site_url, login_id, email, memo, category, display_order, created_at, updated_at FROM password_manager ORDER BY display_order ASC, created_at DESC, id DESC'
    );
    return NextResponse.json(results.map((entry) => ({ ...entry, password: '' })), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { response, key } = requireVaultSession(req);
  if (response) return response;
  try {
    const body = await req.json();
    const { category, site_name, site_url, login_id, password, email, memo } = body;
    const displayOrder = Number.isFinite(Number(body.display_order))
      ? Number(body.display_order)
      : 0;

    if (
      typeof site_name !== 'string' ||
      typeof site_url !== 'string' ||
      typeof password !== 'string' ||
      !password
    ) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }

    await runExecute(
      'INSERT INTO password_manager (category, site_name, site_url, login_id, password, email, memo, display_order, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [
        category,
        site_name,
        site_url,
        login_id,
        encryptPassword(password, key),
        email,
        memo,
        displayOrder,
      ]
    );

    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
