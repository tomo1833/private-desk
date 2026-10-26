import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { Subscription } from '@/types/subscription';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: '無効なIDです。' }, { status: 400 });
  }

  try {
    const result = await runGet<Subscription>(
      'SELECT * FROM subscriptions WHERE id = ?',
      [Number(id)]
    );

    if (!result) {
      return NextResponse.json({ error: 'データが見つかりません。' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching subscription entry:', error);
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: '無効なIDです。' }, { status: 400 });
  }

  try {
    const body = await request.json();
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
      `UPDATE subscriptions 
       SET name = ?, category = ?, price = ?, cycle = ?, next_billing = ?, status = ?, url = ?, account_email = ?, license_key = ?, memo = ?, display_order = ?, updated_at = datetime('now')
       WHERE id = ?`,
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
        Number(id),
      ]
    );

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('Error updating subscription entry:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: '無効なIDです。' }, { status: 400 });
  }

  try {
    await runExecute('DELETE FROM subscriptions WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: '削除成功' });
  } catch (error) {
    console.error('Error deleting subscription entry:', error);
    return NextResponse.json({ error: '削除失敗' }, { status: 500 });
  }
}
