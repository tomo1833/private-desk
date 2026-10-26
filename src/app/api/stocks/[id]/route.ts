import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { Stock } from '@/types/stock';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stockId = Number(id);
    if (!stockId) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const rows = await runSelect<Stock>('SELECT * FROM stocks WHERE id = ?', [stockId]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'データが見つかりません' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching stock detail:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stockId = Number(id);
    if (!stockId) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

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
      `UPDATE stocks SET 
        code = ?, 
        name = ?, 
        market = ?, 
        shares = ?, 
        acquisition_price = ?, 
        current_price = ?, 
        dividend_per_share = ?, 
        memo = ?, 
        display_order = ?, 
        updated_at = datetime('now')
      WHERE id = ?`,
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
        stockId,
      ]
    );

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stockId = Number(id);
    if (!stockId) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    await runExecute('DELETE FROM stocks WHERE id = ?', [stockId]);
    return NextResponse.json({ message: '削除成功' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json({ error: '削除失敗' }, { status: 500 });
  }
}
