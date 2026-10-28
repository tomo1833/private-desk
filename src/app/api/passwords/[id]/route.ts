import { NextResponse } from 'next/server';
import { runGet, runExecute } from '../../../../lib/db';
import type { Password } from '@/types/password';
import { requireVaultSession } from '@/lib/passwordVault';
import { decryptPassword, encryptPassword } from '@/lib/passwordVaultCrypto';

// GET: 特定のパスワード情報を取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, key } = requireVaultSession(request);
  if (response) return response;
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: 'Invalid password_manager ID.' },
      { status: 400 }
    );
  }

  try {
    const result = await runGet<Password>(
      'SELECT * FROM password_manager WHERE id = ?',
      [Number(id)]
    );

    if (!result) {
      return NextResponse.json(
        { error: 'password_manager entry not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ...result,
        password: decryptPassword(result.password, key),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error fetching password_manager entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch password_manager entry.' },
      { status: 500 }
    );
  }
}

// PUT: 特定のパスワード情報を更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response, key } = requireVaultSession(request);
  if (response) return response;
  const { id } = await params;
  if (!id || !Number.isInteger(Number(id))) {
    return NextResponse.json({ error: 'Invalid password_manager ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      category,
      siteName,
      siteUrl,
      loginId,
      pass,
      email,
      memo,
      display_order,
    } = body;
    const displayOrder = Number.isFinite(Number(display_order))
      ? Number(display_order)
      : 0;

    if (
      typeof siteName !== 'string' ||
      typeof siteUrl !== 'string' ||
      typeof pass !== 'string' ||
      !pass
    ) {
      return NextResponse.json(
        { error: 'site_name, site_url, and password are required.' },
        { status: 400 }
      );
    }

    await runExecute(
      'UPDATE password_manager SET category = ?, site_name = ?, site_url = ?, login_id = ?, password = ?, email = ?, memo = ?, display_order = ? WHERE id = ?',
      [
        category,
        siteName,
        siteUrl,
        loginId,
        encryptPassword(pass, key),
        email,
        memo,
        displayOrder,
        Number(id),
      ]
    );
    return NextResponse.json({
      message: 'password_manager entry updated successfully.',
    });
  } catch (error) {
    console.error('Error updating password_manager entry:', error);
    return NextResponse.json(
      { error: 'Failed to update password_manager entry.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = requireVaultSession(request);
  if (response) return response;
  const { id } = await params;

  if (!id || !Number.isInteger(Number(id))) {
    return NextResponse.json({ error: 'Invalid password_manager ID.' }, { status: 400 });
  }

  try {
    await runExecute('DELETE FROM password_manager WHERE id = ?', [Number(id)]);
    return NextResponse.json({ message: 'password_manager entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting password_manager entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete password_manager entry.' },
      { status: 500 }
    );
  }
}
