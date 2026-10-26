import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Stock } from '@/types/stock';

export async function GET() {
  try {
    const results = await runSelect<Stock>(
      'SELECT * FROM stocks ORDER BY display_order ASC, created_at DESC, id DESC'
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
      name,
      market = 'プライム',
      shares = 0,
      acquisition_price = 0,
      current_price = 0,
      dividend_per_share = 0,
      memo,
      display_order = 0,
    } = body;

    if (!code || !name) {
      return NextResponse.json({ error: '銘柄コードと銘柄名は必須項目です' }, { status: 400 });
    }

    const sharesNum = Number(shares) || 0;
    const acqPriceNum = Number(acquisition_price) || 0;
    const curPriceNum = Number(current_price) || 0;
    const divPerShareNum = Number(dividend_per_share) || 0;
    const displayOrderNum = Number.isFinite(Number(display_order)) ? Number(display_order) : 0;

    await runExecute(
      `INSERT INTO stocks 
        (code, name, market, shares, acquisition_price, current_price, dividend_per_share, memo, display_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        code,
        name,
        market,
        sharesNum,
        acqPriceNum,
        curPriceNum,
        divPerShareNum,
        memo || null,
        displayOrderNum,
      ]
    );

    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error('Error creating stock:', error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
