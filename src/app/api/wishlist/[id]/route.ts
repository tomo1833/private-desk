import { NextResponse } from 'next/server';
import { runGet, runExecute } from '@/lib/db';
import type { WishlistItem } from '@/types/wishlist';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await runGet<WishlistItem>(
      'SELECT * FROM wishlists WHERE id = ?',
      [id]
    );

    if (!item) {
      return NextResponse.json({ error: 'アイテムが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching wishlist item:', error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      `UPDATE wishlists 
       SET title = ?, category = ?, price = ?, priority = ?, status = ?, url = ?, image_url = ?, memo = ?, display_order = ?, updated_at = datetime('now')
       WHERE id = ?`,
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
        id,
      ]
    );

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await runExecute('DELETE FROM wishlists WHERE id = ?', [id]);
    return NextResponse.json({ message: '削除成功' });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json({ error: '削除失敗' }, { status: 500 });
  }
}
