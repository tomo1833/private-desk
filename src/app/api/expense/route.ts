import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Expense } from '@/types/expense';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  try {
    if (month) {
      const start = `${month}-01`;
      const end = `${month}-31`;
      const results = runSelect<Expense>(
        'SELECT * FROM expenses WHERE used_at BETWEEN ? AND ? ORDER BY used_at DESC',
        [start, end]
      );
      return NextResponse.json(results);
    }
    const results = runSelect<Expense>('SELECT * FROM expenses ORDER BY used_at DESC');
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, amount, shop, used_at } = body;
    if (!category || !amount || !shop || !used_at) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    runExecute(
      'INSERT INTO expenses (category, amount, shop, used_at) VALUES (?, ?, ?, ?)',
      [category, Number(amount), shop, used_at]
    );
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
