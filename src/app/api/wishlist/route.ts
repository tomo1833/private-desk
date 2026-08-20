import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';
import type { WishlistItem } from '@/types/wishlist';

export async function GET() {
  try {
    const results = await runSelect<WishlistItem>(
      'SELECT * FROM wishlists ORDER BY display_order ASC, created_at DESC, id DESC'
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      category = 'その他',
      price = 0,
      priority = 'Medium',
      status = 'Wanted',
      url,
      image_url,
      imageUrl,
      memo,
      display_order = 0,
      displayOrder,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: '品名 (title) は必須項目です' }, { status: 400 });
    }

    const priceNum = Number(price) || 0;
    const finalDisplayOrder = Number.isFinite(Number(display_order ?? displayOrder))
      ? Number(display_order ?? displayOrder)
      : 0;
    const finalImageUrl = image_url || imageUrl || null;

    await runExecute(
      `INSERT INTO wishlists 
        (title, category, price, priority, status, url, image_url, memo, display_order, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        title.trim(),
        category || 'その他',
        priceNum,
        priority || 'Medium',
        status || 'Wanted',
        url || null,
        finalImageUrl,
        memo || null,
        finalDisplayOrder,
      ]
    );

    return NextResponse.json({ message: '登録成功' });
  } catch (error) {
    console.error('Error creating wishlist item:', error);
    return NextResponse.json({ error: '登録失敗' }, { status: 500 });
  }
}
