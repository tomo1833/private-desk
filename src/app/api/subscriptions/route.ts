import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Subscription } from '@/types/subscription';

export async function GET() {
  try {
    const results = await runSelect<Subscription>(
      'SELECT * FROM subscriptions ORDER BY display_order ASC, created_at DESC, id DESC'
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      category = 'Subscription',
      price = 0,
      cycle = 'monthly',
      next_billing,
      status = 'Active',
      url,
      account_email,
      license_key,
      memo,
      display_order = 0,
    } = body;

    if (!name) {
      return NextResponse.json({ error: '名前は必須項目です' }, { status: 400 });
    }

    const priceNum = Number(price) || 0;
    const displayOrderNum = Number.isFinite(Number(display_order)) ? Number(display_order) : 0;

    await runExecute(
      `INSERT INTO subscriptions 
        (name, category, price, cycle, next_billing, status, url, account_email, license_key, memo, display_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        name,
        category,
        priceNum,
        cycle,
        next_billing || null,
        status,
        url || null,
        account_email || null,
        license_key || null,
        memo || null,
        displayOrderNum,
      ]
    );

    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
