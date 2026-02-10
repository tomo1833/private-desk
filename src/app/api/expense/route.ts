import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Expense } from '@/types/expense';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const category = searchParams.get('category');
  try {
    let query = 'SELECT * FROM expenses';
    const params: (string | number | null)[] = [];
    const conditions: string[] = [];
    if (month) {
      const start = `${month}-01`;
      const end = `${month}-31`;
      conditions.push('used_at BETWEEN ? AND ?');
      params.push(start, end);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY display_order ASC, used_at DESC, created_at DESC, id DESC';
    const results = await runSelect<Expense>(query, params);
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, amount, shop, used_at, used_by, product_name, remark } = body;
    const displayOrder = Number.isFinite(Number(body.display_order))
      ? Number(body.display_order)
      : 0;
    if (!category || !amount || !shop || !used_at) {
      return NextResponse.json({ error: '必須項目不足' }, { status: 400 });
    }
    await runExecute(
      'INSERT INTO expenses (category, amount, shop, used_at, used_by, product_name, remark, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        category,
        Number(amount),
        shop,
        used_at,
        used_by ?? null,
        product_name ?? null,
        remark ?? null,
        displayOrder,
      ]
    );
    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
