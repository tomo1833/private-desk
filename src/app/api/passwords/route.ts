// src/app/api/passwords/route.ts
import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Password } from '../../../types/password';

export async function GET() {
  try {
    const results = runSelect<Password>('SELECT * FROM password_manager ORDER BY category, site_name');
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, site_name, site_url, login_id, password, email, memo } = body;

    if (!site_name || !site_url || !password) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }

    runExecute(
      'INSERT INTO password_manager (category, site_name, site_url, login_id, password, email, memo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category, site_name, site_url, login_id, password, email, memo]
    );

    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
